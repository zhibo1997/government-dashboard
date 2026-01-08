/**
 * 监测点位管理 Hook
 * @description 提供监测点位数据加载和地图展示功能
 */

import { ref, computed, shallowRef, onBeforeUnmount } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { getMonitoringPointLatestData, type MonitoringPointData, type MonitoringDataItem } from '@/services/commonService'
import {
  getDeviceIconUrl,
  getDeviceTypeName,
  getSszxName,
  getIndicatorName,
  ICON_SIZE,
  DEVICE_ICON_MAP
} from '@/config/monitoringIconConfig'
import {
  createBillboardCanvasWithArrow,
  filterOverlappingBillboards,
  worldToScreen,
  getCameraHeight
} from './billboardManager'

/**
 * 解析后的监测数据项
 */
export interface ParsedMonitoringData {
  code: string          // 指标编码
  name: string          // 指标名称
  value: string | number // 监测值
  unit: string          // 单位
}

/**
 * 增强的监测点数据（包含解析后的监测值）
 */
export interface EnhancedMonitoringPoint extends MonitoringPointData {
  id: string                      // 唯一标识
  deviceTypeName: string          // 设备类型名称
  sszxName: string                // 所属专项名称
  iconUrl: string                 // 图标URL
  parsedJcz: ParsedMonitoringData[] // 解析后的监测数据
  formattedTime: string           // 格式化后的监测时间
}

/**
 * 监测点位管理 Hook
 */
export function useMonitoringPoints() {
  // 原始数据
  const rawData: Ref<MonitoringPointData[]> = ref([])
  
  // 增强数据（解析后）
  const enhancedData: Ref<EnhancedMonitoringPoint[]> = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const error: Ref<string | null> = ref(null)
  
  // Cesium 相关引用
  const dataSource: ShallowRef<any> = shallowRef(null)
  const viewer: ShallowRef<any> = shallowRef(null)
  const billboardCollection: ShallowRef<any> = shallowRef(null)
  
  // 相机高度监听
  let cameraHeightListener: any = null
  let lastCameraHeight = Infinity
  
  // 相机高度阈值（米）
  const CAMERA_HEIGHT_THRESHOLD = 5000 // 5km
  
  // 缓存防重叠计算结果（用于避免重复计算）
  let cachedFilteredItems: any[] = []
  let cachedAllItems: any[] = []
  let isCacheInitialized = false  // 标记缓存是否已初始化

  /**
   * 解析监测值 JSON 字符串
   */
  function parseJcz(jczString: string): ParsedMonitoringData[] {
    try {
      const jczObj = JSON.parse(jczString) as Record<string, MonitoringDataItem>
      return Object.entries(jczObj).map(([code, data]) => ({
        code,
        name: code,
        value: data.jcz,
        unit: data.jcdw || ''
      }))
    } catch (e) {
      console.warn('解析监测值失败:', jczString, e)
      return []
    }
  }

  /**
   * 格式化时间戳
   */
  function formatTimestamp(timestamp: number): string {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  /**
   * 转换原始数据为增强数据
   */
  function transformData(data: MonitoringPointData[]): EnhancedMonitoringPoint[] {
    return data.map((item, index) => ({
      ...item,
      id: `mp_${item.sbbh}_${index}`,
      deviceTypeName: getDeviceTypeName(item.sblx),
      sszxName: getSszxName(item.sszx),
      iconUrl: getDeviceIconUrl(item.sblx),
      parsedJcz: parseJcz(item.jcz),
      formattedTime: formatTimestamp(item.jcsj)
    }))
  }

  /**
   * 加载监测点位数据
   */
  async function loadData(sszx?: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await getMonitoringPointLatestData('csaqzx_rq')
      rawData.value = data
      enhancedData.value = transformData(data)
      console.log(`✅ 监测点位数据加载成功，共 ${data.length} 条`)
    } catch (e: any) {
      error.value = e.message || '加载监测点位数据失败'
      console.error('❌ 加载监测点位数据失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 初始化 Cesium DataSource 和 BillboardCollection
   */
  async function initDataSource(cesiumViewer: any): Promise<void> {
    if (!cesiumViewer) {
      console.warn('⚠️ Cesium Viewer 未就绪')
      return
    }

    const Cesium = (window as any).Cesium
    if (!Cesium) {
      console.warn('⚠️ Cesium 未加载')
      return
    }

    viewer.value = cesiumViewer

    // 清理已有的数据源
    await clearDataSource()

    // 创建点位数据源（用于Entity点位和图标）
    const customDataSource = new Cesium.CustomDataSource('monitoringPoints')
    customDataSource.clustering.enabled = false
    await cesiumViewer.dataSources.add(customDataSource)
    dataSource.value = customDataSource

    // 创建BillboardCollection（用于Canvas信息面板）
    // 注意：primitives按添加顺序渲染，后添加的会遮挡先添加的
    // 为了让Billboard遮挡点位，需要在DataSource之后添加
    const collection = new Cesium.BillboardCollection()
    cesiumViewer.scene.primitives.add(collection)
    billboardCollection.value = collection

    // 设置相机高度监听
    setupCameraHeightListener()

    console.log('✅ 监测点位数据源和BillboardCollection初始化完成')
  }

  /**
   * 设置相机高度监听（用于智能重渲染Billboard）
   */
  function setupCameraHeightListener(): void {
    if (!viewer.value) return

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    // 移除旧的监听器
    if (cameraHeightListener) {
      cameraHeightListener()
    }

    // 监听相机移动结束事件
    const removeListener = viewer.value.camera.moveEnd.addEventListener(() => {
      const currentHeight = getCameraHeight(viewer.value)
      
      // 检查是否跨越阈值
      const wasAboveThreshold = lastCameraHeight >= CAMERA_HEIGHT_THRESHOLD
      const isAboveThreshold = currentHeight >= CAMERA_HEIGHT_THRESHOLD
      
      // 相机高度变化逻辑：
      // 1. 高度降低：重新计算防重叠（距离30）
      // 2. 高度升高：使用缓存的防重叠结果
      if (wasAboveThreshold && !isAboveThreshold) {
        console.log(`📏 相机高度降低到 ${(currentHeight / 1000).toFixed(1)}km，重新计算防重叠`)
        updateBillboards(true)  // 重新计算
      } else if (!wasAboveThreshold && isAboveThreshold) {
        console.log(`📏 相机高度升高到 ${(currentHeight / 1000).toFixed(1)}km，使用缓存的防重叠结果`)
        renderBillboardsFromCache(true)  // 使用缓存
      }
      
      lastCameraHeight = currentHeight
    })

    cameraHeightListener = removeListener
    lastCameraHeight = getCameraHeight(viewer.value)
    
    console.log('✅ 相机高度监听已设置（高度变化智能调整）')
  }

  /**
   * 更新地图上的监测点位（点位+图标Entity）
   */
  async function updateMapPoints(): Promise<void> {
    if (!dataSource.value || !viewer.value) {
      console.warn('⚠️ 数据源或 Viewer 未初始化')
      return
    }

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    // 清空现有Entity
    dataSource.value.entities.removeAll()
    dataSource.value.entities.suspendEvents()

    const baseUrl = import.meta.env.VITE_BASE_URL

    for (const point of enhancedData.value) {
      // 验证坐标有效性
      if (!isValidCoordinate(point.jdxx, point.wdxx)) {
        continue
      }

      const iconName = DEVICE_ICON_MAP[point.sblx] || '0510-裂缝计.svg'
      const deviceIconUrl = `${baseUrl}/equipmentIcons/${iconName}`
      const position = Cesium.Cartesian3.fromDegrees(point.jdxx, point.wdxx)

      // 添加点位Entity（纯点/图标自适应）
      dataSource.value.entities.add({
        id: `${point.id}_point`,
        name: point.sbbh,
        position: position,
        // 纯点样式（高海拔显示）
        point: {
          pixelSize: 6,
          color: Cesium.Color.fromCssColorString('#1890ff'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            CAMERA_HEIGHT_THRESHOLD,
            Number.POSITIVE_INFINITY
          )
        },
        // 图标样式（低海拔显示）
        billboard: {
          image: deviceIconUrl,
          scale: 0.2,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, 20),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            CAMERA_HEIGHT_THRESHOLD
          ),
          scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 20000, 0.5)
        }
      })
    }

    dataSource.value.entities.resumeEvents()
    
    console.log(`✅ 地图点位更新完成，共 ${enhancedData.value.length} 个点位`)
    console.log(`📏 相机高度阈值: ${CAMERA_HEIGHT_THRESHOLD}m`)
    
    // 立即渲染Billboard（初始化时默认应用防重叠）
    updateBillboards(true)
  }

  /**
   * 更新Billboard显示（使用BillboardCollection和防重叠算法）
   * @param applyAntiOverlap 是否应用防重叠算法：true=应用，false=显示全部
   */
  function updateBillboards(applyAntiOverlap: boolean = true): void {
    if (!billboardCollection.value || !viewer.value) {
      console.warn('⚠️ BillboardCollection或Viewer未初始化')
      return
    }

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    // 清空现有Billboard
    billboardCollection.value.removeAll()

    // 收集所有点位的屏幕位置
    const billboardItems: any[] = []

    for (const point of enhancedData.value) {
      if (!isValidCoordinate(point.jdxx, point.wdxx)) {
        continue
      }

      const screenPosition = worldToScreen(viewer.value, point.jdxx, point.wdxx)
      if (!screenPosition) continue

      billboardItems.push({
        point,
        screenPosition,
        billboard: null
      })
    }

    // 根据参数决定是否应用防重叠算法
    let filteredItems = billboardItems
    if (applyAntiOverlap) {
      filteredItems = filterOverlappingBillboards(billboardItems, {
        minDistance: 30,
        enabled: true
      })
    }
    
    // 只在第一次渲染时保存到缓存（初始化时）
    if (!isCacheInitialized) {
      cachedAllItems = billboardItems
      cachedFilteredItems = filteredItems
      isCacheInitialized = true
      console.log(`💾 初始化缓存: 全部 ${cachedAllItems.length} 个, 防重叠 ${cachedFilteredItems.length} 个`)
    }

    // 添加Billboard到Collection
    for (const item of filteredItems) {
      const canvas = createBillboardCanvasWithArrow(item.point)
      const position = Cesium.Cartesian3.fromDegrees(item.point.jdxx, item.point.wdxx)
      
      // 计算Y轴偏移（让三角箭头指向点位）
      const canvasHeight = canvas.height
      const yOffset = -canvasHeight / 2
      
      billboardCollection.value.add({
        position: position,
        image: canvas,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, 0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.5)
        // 移除了translucencyByDistance，保持透明度恒定
      })
    }

    const statusText = applyAntiOverlap ? '应用防重叠' : '显示全部'
    console.log(`✅ Billboard更新完成（${statusText}），显示 ${filteredItems.length} 个（总共 ${billboardItems.length} 个）`)
  }
  
  /**
   * 从缓存渲染Billboard（用于相机高度变化时，避免重复计算）
   * @param useFiltered 是否使用防重叠结果：true=使用防重叠，false=显示全部
   */
  function renderBillboardsFromCache(useFiltered: boolean): void {
    if (!billboardCollection.value || !viewer.value) {
      console.warn('⚠️ BillboardCollection或Viewer未初始化')
      return
    }
    
    // 检查缓存是否存在
    if (cachedAllItems.length === 0) {
      console.warn('⚠️ 缓存为空，无法从缓存渲染')
      return
    }

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    // 清空现有Billboard
    billboardCollection.value.removeAll()
    
    // 选择使用的数据源
    const itemsToRender = useFiltered ? cachedFilteredItems : cachedAllItems

    // 添加Billboard到Collection
    for (const item of itemsToRender) {
      const canvas = createBillboardCanvasWithArrow(item.point)
      const position = Cesium.Cartesian3.fromDegrees(item.point.jdxx, item.point.wdxx)
      
      // 计算Y轴偏移（让三角箭头指向点位）
      const canvasHeight = canvas.height
      const yOffset = -canvasHeight / 2
      
      billboardCollection.value.add({
        position: position,
        image: canvas,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, 0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.5)
        // 移除了translucencyByDistance，保持透明度恒定
      })
    }

    const statusText = useFiltered ? '防重叠' : '全部'
    console.log(`✅ 从缓存渲染Billboard（${statusText}），显示 ${itemsToRender.length} 个`)
  }

  /**
   * 验证坐标有效性
   */
  function isValidCoordinate(lon: number, lat: number): boolean {
    return (
      typeof lon === 'number' &&
      typeof lat === 'number' &&
      !isNaN(lon) &&
      !isNaN(lat) &&
      lon >= -180 &&
      lon <= 180 &&
      lat >= -90 &&
      lat <= 90
    )
  }

  /**
   * 飞行到指定点位
   */
  function flyToPoint(point: EnhancedMonitoringPoint): void {
    if (!viewer.value) return

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(point.jdxx, point.wdxx, 2000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      },
      duration: 1.5
    })
  }

  /**
   * 清理数据源
   */
  async function clearDataSource(): Promise<void> {
    if (dataSource.value && viewer.value) {
      try {
        viewer.value.dataSources.remove(dataSource.value, true)
        dataSource.value = null
      } catch (e) {
        console.warn('清理数据源时出错:', e)
      }
    }
  }

  /**
   * 清理所有资源
   */
  function cleanup(): void {
    // 移除相机高度监听
    if (cameraHeightListener) {
      cameraHeightListener()
      cameraHeightListener = null
    }
    
    // 清理BillboardCollection
    if (billboardCollection.value && viewer.value) {
      viewer.value.scene.primitives.remove(billboardCollection.value)
      billboardCollection.value = null
    }

    clearDataSource()
    
    rawData.value = []
    enhancedData.value = []
    viewer.value = null
    
    console.log('🗑️ 监测点位资源已清理')
  }

  /**
   * 刷新数据
   */
  async function refresh(sszx?: string): Promise<void> {
    await loadData(sszx)
    await updateMapPoints()
  }

  /**
   * 设置点位可见性
   */
  function setVisible(visible: boolean): void {
    if (dataSource.value) {
      dataSource.value.show = visible
    }
  }

  // 统计信息
  const stats = computed(() => {
    const total = enhancedData.value.length
    const bySszx: Record<string, number> = {}
    const byDeviceType: Record<string, number> = {}

    for (const point of enhancedData.value) {
      // 按专项统计
      if (!bySszx[point.sszx]) {
        bySszx[point.sszx] = 0
      }
      bySszx[point.sszx]++

      // 按设备类型统计
      if (!byDeviceType[point.sblx]) {
        byDeviceType[point.sblx] = 0
      }
      byDeviceType[point.sblx]++
    }

    return { total, bySszx, byDeviceType }
  })

  // 组件卸载时清理
  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    // 状态
    rawData,
    enhancedData,
    isLoading,
    error,
    stats,
    
    // 方法
    loadData,
    initDataSource,
    updateMapPoints,
    flyToPoint,
    refresh,
    setVisible,
    cleanup,
    
    // 工具函数
    parseJcz,
    formatTimestamp
  }
}

export default useMonitoringPoints
