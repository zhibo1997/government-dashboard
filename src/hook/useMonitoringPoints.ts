/**
 * 监测点位管理 Hook
 * @description 提供监测点位数据加载和地图展示功能
 */

import { ref, computed, shallowRef, onBeforeUnmount } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { getMonitoringPointLatestData, type MonitoringPointData, type MonitoringDataItem } from '@/services/commonService'
import { getCachedDictionaries } from '@/services/dictionaryService'
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
  
  // 当前已加载的设备类型集合（用于跟踪哪些设备类型的数据已被请求）
  const loadedDeviceTypes: Ref<Set<string>> = ref(new Set())
  
  // Cesium 相关引用
  const dataSource: ShallowRef<any> = shallowRef(null)
  const viewer: ShallowRef<any> = shallowRef(null)
  const billboardCollection: ShallowRef<any> = shallowRef(null)
  
  // 相机高度监听
  let cameraHeightListener: any = null
  let postRenderListener: any = null
  let lastCameraHeight = Infinity

  // 相机高度阈值（米）
  const CAMERA_HEIGHT_THRESHOLD = 5000 // 5km

  // 渲染节流相关
  let lastRenderTime = 0
  const RENDER_THROTTLE_MS = 300 // 节流间隔（增加以减少渲染频率）

  // Canvas 缓存（缓存为 data URL 字符串，避免 WebGL 纹理复用冲突）
  const canvasCache = new Map<string, string>()
  const MAX_CACHE_SIZE = 100 // 最大缓存数量

  /**
   * 根据相机高度动态计算防重叠距离
   * @param cameraHeight 相机高度（米）
   * @returns 防重叠最小距离（像素）
   */
  function calculateAntiOverlapDistance(cameraHeight: number): number {
    // 相机高度越高，防重叠距离越大
    // 相机高度越低（放大），防重叠距离越小
    if (cameraHeight >= 10000) {
      return 120 // 高空：大距离
    } else if (cameraHeight >= 5000) {
      return 80 // 中空：中等距离
    } else if (cameraHeight >= 2000) {
      return 50 // 低空：小距离
    } else if (cameraHeight >= 500) {
      return 30 // 近距离：很小距离
    } else {
      return 20 // 非常近：最小距离
    }
  }

  /**
   * 解析监测值 JSON 字符串
   */
  function parseJcz(jczString: string, indicatorDict: any[] = []): ParsedMonitoringData[] {
    try {
      const jczObj = JSON.parse(jczString) as Record<string, MonitoringDataItem>
      return Object.entries(jczObj).map(([code, data]) => {
        const dictItem = indicatorDict.find(i => i.f_ItemValue === code)
        return {
          code,
          name: dictItem ? dictItem.f_ItemName : getIndicatorName(code),
          value: data.jcz,
          unit: data.jcdw || ''
        }
      })
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
  function transformData(data: MonitoringPointData[], dictionaries: any = {}): EnhancedMonitoringPoint[] {
    const deviceTypeDict = dictionaries.jcsblx || []
    const indicatorDict = dictionaries.jczbzd || []

    return data.map((item, index) => {
      const dictItem = deviceTypeDict.find((i: any) => i.f_ItemValue === item.sblx)
      
      return {
        ...item,
        id: `mp_${item.sbbh}_${index}`,
        deviceTypeName: dictItem ? dictItem.f_ItemName : getDeviceTypeName(item.sblx),
        sszxName: getSszxName(item.sszx),
        iconUrl: getDeviceIconUrl(item.sblx),
        parsedJcz: parseJcz(item.jcz, indicatorDict),
        formattedTime: formatTimestamp(item.jcsj)
      }
    })
  }

  /**
   * 加载指定设备类型的监测点位数据
   * @param sblx 设备类型代码（必填）
   * @param sszx 所属专项代码（可选）
   */
  async function loadDeviceTypeData(sblx: string, sszx?: string): Promise<MonitoringPointData[]> {
    if (!sblx) {
      console.warn('⚠️ 加载数据时未提供设备类型代码')
      return []
    }
    
    try {
      console.log(`🔄 请求设备类型数据: ${sblx}${sszx ? ` (专项: ${getSszxName(sszx)})` : ''}`)
      
      // 请求指定设备类型的数据
      const dataArray = await getMonitoringPointLatestData(sszx, sblx)
      
      console.log(`✅ 设备类型 ${sblx} 数据请求成功，共 ${dataArray.length} 条`)
      return dataArray
    } catch (e: any) {
      console.error(`❌ 请求设备类型 ${sblx} 数据失败:`, e)
      throw e
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
    if (postRenderListener) {
      postRenderListener()
    }

    // 使用 postRender 事件实时监听相机变化（带节流）
    postRenderListener = viewer.value.scene.postRender.addEventListener(() => {
      const now = Date.now()
      if (now - lastRenderTime < RENDER_THROTTLE_MS) return

      // 检查是否有数据需要渲染
      if (!enhancedData.value || enhancedData.value.length === 0) return

      const currentHeight = getCameraHeight(viewer.value)
      const heightDiff = Math.abs(currentHeight - lastCameraHeight)

      // 高度变化超过 10% 或超过 1000米 时才重新渲染（更严格的条件）
      const significantChange = heightDiff > lastCameraHeight * 0.1 || heightDiff > 1000

      if (significantChange) {
        lastRenderTime = now
        const minDistance = calculateAntiOverlapDistance(currentHeight)
        console.log(`📐 相机高度: ${(currentHeight / 1000).toFixed(1)}km，防重叠距离: ${minDistance}px`)
        updateBillboards(true, minDistance)
        lastCameraHeight = currentHeight
      }
    })

    // moveEnd 事件作为兜底，确保移动结束后最终更新
    cameraHeightListener = viewer.value.camera.moveEnd.addEventListener(() => {
      // 检查是否有数据需要渲染
      if (!enhancedData.value || enhancedData.value.length === 0) return

      const currentHeight = getCameraHeight(viewer.value)
      const minDistance = calculateAntiOverlapDistance(currentHeight)
      updateBillboards(true, minDistance)
      lastCameraHeight = currentHeight
    })

    lastCameraHeight = getCameraHeight(viewer.value)
    console.log('✅ 相机高度监听已设置（实时更新模式）')
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

    // 统一点位颜色为蓝色
    const pointColor = '#1890ff';

    const baseUrl = import.meta.env.VITE_BASE_URL

    for (const point of enhancedData.value) {
      // 验证坐标有效性
      if (!isValidCoordinate(point.jdxx, point.wdxx)) {
        continue
      }

      const iconName = DEVICE_ICON_MAP[point.sblx] || '0510-裂缝计.svg'
      const deviceIconUrl = `${baseUrl}/images/equipmentIcons/${iconName}`
      const position = Cesium.Cartesian3.fromDegrees(point.jdxx, point.wdxx)
      
      // 添加点位Entity（纯点/图标自适应）
      dataSource.value.entities.add({
        id: `${point.id}_point`,
        name: point.sbbh,
        position: position,
        // 纯点样式（高海拔显示）
        point: {
          pixelSize: 6,
          color: Cesium.Color.fromCssColorString(pointColor),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 0,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            CAMERA_HEIGHT_THRESHOLD,
            Number.POSITIVE_INFINITY
          )
        },
        // 图标样式（低海拔显示）
        billboard: {
          image: deviceIconUrl,
          width: 53,
          height: 75,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, 20),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            CAMERA_HEIGHT_THRESHOLD
          ),
          scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 20000, 0.5)
        },
        // 标签样式（低海拔显示，格式为：设备类型名称-设备编号）
        label: {
          text: `${point.sbmc}`,
          font: '14px Microsoft YaHei, sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 25), // 位于图标下方
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
    
    // 强制地图立即更新渲染
    if (viewer.value && viewer.value.scene) {
      viewer.value.scene.requestRender();
    }
  }

  /**
   * 获取或创建 Billboard 图片（带缓存）
   * 缓存为 data URL 字符串，避免 canvas 复用导致 WebGL 纹理冲突
   */
  function getCachedCanvas(point: EnhancedMonitoringPoint): string {
    const cacheKey = point.id

    // 检查缓存
    if (canvasCache.has(cacheKey)) {
      return canvasCache.get(cacheKey)!
    }

    // 创建新的 Canvas 并转为 data URL
    const canvas = createBillboardCanvasWithArrow(point)

    // 校验 canvas 尺寸有效性
    if (canvas.width <= 0 || canvas.height <= 0) {
      console.warn('Canvas 尺寸无效:', { width: canvas.width, height: canvas.height, pointId: point.id })
      // 返回 1x1 透明 PNG 作为兜底
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualqQAAAABJRU5ErkJggg=='
    }

    const dataUrl = canvas.toDataURL('image/png')

    // 限制缓存大小
    if (canvasCache.size >= MAX_CACHE_SIZE) {
      const firstKey = canvasCache.keys().next().value
      if (firstKey) {
        canvasCache.delete(firstKey)
      }
    }

    canvasCache.set(cacheKey, dataUrl)
    return dataUrl
  }

  /**
   * 更新Billboard显示（使用BillboardCollection和防重叠算法）
   * @param applyAntiOverlap 是否应用防重叠算法：true=应用，false=显示全部
   * @param minDistance 防重叠最小距离（像素）
   */
  function updateBillboards(applyAntiOverlap: boolean = true, minDistance?: number): void {
    if (!billboardCollection.value || !viewer.value) {
      console.warn('⚠️ BillboardCollection或Viewer未初始化')
      return
    }

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    // 收集所有点位的屏幕位置
    const billboardItems: any[] = []

    for (const point of enhancedData.value) {
      if (!isValidCoordinate(point.jdxx, point.wdxx)) {
        continue
      }

      const screenPosition = worldToScreen(viewer.value, point.jdxx, point.wdxx)
      if (!screenPosition) continue

      // 检查屏幕坐标是否在可视范围内（带边距）
      const viewerCanvas = viewer.value.canvas
      const margin = 100
      if (
        screenPosition.x < -margin ||
        screenPosition.x > viewerCanvas.width + margin ||
        screenPosition.y < -margin ||
        screenPosition.y > viewerCanvas.height + margin
      ) {
        continue // 跳过视野外的点
      }

      billboardItems.push({
        point,
        screenPosition,
        billboard: null
      })
    }

    // 根据参数决定是否应用防重叠算法
    let filteredItems = billboardItems
    if (applyAntiOverlap) {
      const currentHeight = getCameraHeight(viewer.value)
      const computedMinDistance = minDistance ?? calculateAntiOverlapDistance(currentHeight)
      filteredItems = filterOverlappingBillboards(billboardItems, {
        minDistance: computedMinDistance,
        enabled: true
      })
    }

    // 限制最大显示数量，防止 WebGL 资源耗尽
    const MAX_VISIBLE_BILLBOARDS = 50
    const itemsToShow = filteredItems.slice(0, MAX_VISIBLE_BILLBOARDS)

    // 清空现有Billboard
    billboardCollection.value.removeAll()

    // 批量添加Billboard（使用缓存）
    for (const item of itemsToShow) {
      try {
        const cachedCanvas = getCachedCanvas(item.point)
        const position = Cesium.Cartesian3.fromDegrees(item.point.jdxx, item.point.wdxx)

        billboardCollection.value.add({
          position: position,
          image: cachedCanvas,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.5)
        })
      } catch (e) {
        console.warn('创建Billboard失败:', e)
      }
    }

    const statusText = applyAntiOverlap ? '应用防重叠' : '显示全部'
    console.log(`✅ Billboard更新完成（${statusText}），显示 ${itemsToShow.length} 个（总共 ${billboardItems.length} 个，缓存 ${canvasCache.size} 个）`)

    // 强制地图立即更新渲染
    if (viewer.value && viewer.value.scene) {
      viewer.value.scene.requestRender()
    }
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
    if (postRenderListener) {
      postRenderListener()
      postRenderListener = null
    }

    // 清理BillboardCollection
    if (billboardCollection.value && viewer.value) {
      viewer.value.scene.primitives.remove(billboardCollection.value)
      billboardCollection.value = null
    }

    // 清理Canvas缓存
    canvasCache.clear()

    clearDataSource()

    rawData.value = []
    enhancedData.value = []
    loadedDeviceTypes.value.clear()
    viewer.value = null

    console.log('🗑️ 监测点位资源已清理')
  }

  /**
   * 切换设备类型显示状态（按需加载数据）
   * @param sblx 设备类型代码
   * @param visible 是否可见
   * @param sszx 所属专项代码（可选）
   */
  async function toggleDeviceType(sblx: string, visible: boolean, sszx?: string): Promise<void> {
    console.log(`🔄 切换设备类型: ${sblx} - ${visible ? '显示' : '隐藏'}`)
    
    isLoading.value = true
    error.value = null
    
    try {
      if (visible) {
        // 显示: 请求该设备类型的数据
        const deviceData = await loadDeviceTypeData(sblx, sszx)
        
        // 获取字典数据
        const dictionaries = await getCachedDictionaries(['jcsblx', 'jczbzd'])
        
        // 将新数据添加到现有数据中（去重）
        const existingIds = new Set(rawData.value.map(item => item.sbbh))
        const newData = deviceData.filter(item => !existingIds.has(item.sbbh))
        
        if (newData.length > 0) {
          rawData.value = [...rawData.value, ...newData]
          enhancedData.value = transformData(rawData.value, dictionaries)
          console.log(`➕ 新增 ${newData.length} 条设备类型 ${sblx} 的数据`)
        } else {
          console.log(`ℹ️ 设备类型 ${sblx} 的数据已存在，无需重复加载`)
        }
        
        // 记录已加载的设备类型
        loadedDeviceTypes.value.add(sblx)
      } else {
        // 隐藏: 从数据中移除该设备类型的点位
        const filteredRawData = rawData.value.filter(item => item.sblx !== sblx)
        const filteredEnhancedData = enhancedData.value.filter(item => item.sblx !== sblx)
        
        const removedCount = rawData.value.length - filteredRawData.length
        rawData.value = filteredRawData
        enhancedData.value = filteredEnhancedData
        
        console.log(`➖ 移除 ${removedCount} 条设备类型 ${sblx} 的数据`)
        
        // 从已加载列表中移除
        loadedDeviceTypes.value.delete(sblx)
      }

      // 更新地图显示
      await updateMapPoints()
      
      console.log(`✅ 设备类型切换成功，当前已加载: ${Array.from(loadedDeviceTypes.value).join(', ') || '无'}，显示 ${enhancedData.value.length} 条数据`)
    } catch (e: any) {
      error.value = e.message || '切换设备类型失败'
      console.error('❌ 切换设备类型失败:', e)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 刷新数据（重新加载所有已加载的设备类型）
   */
  async function refresh(): Promise<void> {
    if (loadedDeviceTypes.value.size === 0) {
      console.log('ℹ️ 没有已加载的设备类型，无需刷新')
      return
    }
    
    console.log(`🔄 刷新数据，重新加载 ${loadedDeviceTypes.value.size} 个设备类型`)
    
    // 保存当前已加载的设备类型列表
    const typesToReload = Array.from(loadedDeviceTypes.value)
    
    // 清空数据
    rawData.value = []
    enhancedData.value = []
    loadedDeviceTypes.value.clear()
    
    // 重新加载每个设备类型
    for (const sblx of typesToReload) {
      await toggleDeviceType(sblx, true)
    }
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
    loadedDeviceTypes,
    
    // 方法
    initDataSource,
    updateMapPoints,
    flyToPoint,
    refresh,
    setVisible,
    cleanup,
    toggleDeviceType,
    
    // 工具函数
    parseJcz,
    formatTimestamp
  }
}

export default useMonitoringPoints
