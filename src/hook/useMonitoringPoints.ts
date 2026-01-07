/**
 * 监测点位管理 Hook（简化版）
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
  ICON_SIZE
} from '@/config/monitoringIconConfig'

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
  
  // 当前选中的点位（只显示第一个）
  const selectedPoint: Ref<EnhancedMonitoringPoint | null> = ref(null)
  
  // 弹窗显示状态
  const showPopup = ref(false)
  
  // 弹窗位置（屏幕坐标）
  const popupPosition = ref({ x: 0, y: 0 })
  
  // Cesium 相关引用
  const dataSource: ShallowRef<any> = shallowRef(null)
  const viewer: ShallowRef<any> = shallowRef(null)
  
  // 点击事件处理器引用（用于清理）
  let clickHandler: any = null

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
   * 初始化 Cesium DataSource
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

    // 创建简单的数据源（不使用聚合）
    const customDataSource = new Cesium.CustomDataSource('monitoringPoints')
    customDataSource.clustering.enabled = false

    // 添加到 viewer
    await cesiumViewer.dataSources.add(customDataSource)
    dataSource.value = customDataSource

    console.log('✅ 监测点位数据源初始化完成')
  }

  /**
   * 更新地图上的监测点位（显示所有点位）
   */
  async function updateMapPoints(): Promise<void> {
    if (!dataSource.value || !viewer.value) {
      console.warn('⚠️ 数据源或 Viewer 未初始化')
      return
    }

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    // 清空现有实体
    dataSource.value.entities.removeAll()

    // 批量添加实体
    dataSource.value.entities.suspendEvents()

    for (const point of enhancedData.value) {
      // 验证坐标有效性
      if (!isValidCoordinate(point.jdxx, point.wdxx)) {
        continue
      }

      // 统一显示纯点
      dataSource.value.entities.add({
        id: point.id,
        name: point.sbbh,
        position: Cesium.Cartesian3.fromDegrees(point.jdxx, point.wdxx),
        point: {
          pixelSize: 4,
          color: Cesium.Color.fromCssColorString('#1890ff'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 0.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        properties: {
          data: point
        }
      })
    }

    dataSource.value.entities.resumeEvents()
    
    // 默认显示第一个点位的弹窗
    if (enhancedData.value.length > 0) {
      showDefaultPopup(enhancedData.value[0])
    }
    
    console.log(`✅ 地图点位更新完成，共 ${enhancedData.value.length} 个点位`)
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
   * 默认显示点位弹窗
   */
  function showDefaultPopup(point: EnhancedMonitoringPoint): void {
    if (!viewer.value) return
    
    const Cesium = (window as any).Cesium
    if (!Cesium) return
    
    // 将点位坐标转换为屏幕坐标
    const position = Cesium.Cartesian3.fromDegrees(point.jdxx, point.wdxx)
    const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.value.scene,
      position
    )
    
    if (screenPosition) {
      selectedPoint.value = point
      popupPosition.value = {
        x: screenPosition.x,
        y: screenPosition.y
      }
      showPopup.value = true
      
      // 监听相机变化更新弹窗位置
      setupPopupListener()
      
      console.log('📍 默认显示弹窗:', point.sbbh)
    }
  }

  /**
   * 设置弹窗位置更新监听
   */
  function setupPopupListener(): void {
    if (!viewer.value) return
    
    const Cesium = (window as any).Cesium
    if (!Cesium) return
    
    viewer.value.scene.preRender.addEventListener(updatePopupPosition)
  }

  /**
   * 更新弹窗位置（跟随相机移动）
   */
  function updatePopupPosition(): void {
    if (!showPopup.value || !selectedPoint.value || !viewer.value) return
    
    const Cesium = (window as any).Cesium
    if (!Cesium) return
    
    const position = Cesium.Cartesian3.fromDegrees(
      selectedPoint.value.jdxx,
      selectedPoint.value.wdxx
    )
    const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.value.scene,
      position
    )
    
    if (screenPosition) {
      popupPosition.value = {
        x: screenPosition.x,
        y: screenPosition.y
      }
    }
  }

  /**
   * 设置点击事件监听
   */
  function setupClickHandler(): void {
    if (!viewer.value) return

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    // 移除已有的点击处理器
    if (clickHandler) {
      clickHandler.destroy()
    }

    // 创建新的点击处理器
    clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.value.scene.canvas)
    
    clickHandler.setInputAction((movement: any) => {
      const pickedObject = viewer.value.scene.pick(movement.position)
      
      if (Cesium.defined(pickedObject)) {
        let entity = null
        
        if (pickedObject.id) {
          entity = pickedObject.id
        } else if (pickedObject.primitive && pickedObject.primitive.id) {
          entity = pickedObject.primitive.id
        }
        
        if (entity && entity.properties && entity.properties.data) {
          const pointData = entity.properties.data.getValue()
          if (pointData) {
            handlePointClick(pointData, movement.position)
            return
          }
        }
      }
      
      // 点击空白处不再关闭弹窗
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    
    console.log('✅ 点击事件监听已设置')
  }

  /**
   * 处理点位点击
   */
  function handlePointClick(point: EnhancedMonitoringPoint, screenPosition: { x: number; y: number }): void {
    selectedPoint.value = point
    popupPosition.value = {
      x: screenPosition.x,
      y: screenPosition.y
    }
    showPopup.value = true
    
    console.log('📍 选中监测点:', point.sbbh)
  }

  /**
   * 关闭弹窗
   */
  function closePopup(): void {
    showPopup.value = false
    selectedPoint.value = null
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
    closePopup()
    
    if (clickHandler) {
      clickHandler.destroy()
      clickHandler = null
    }
    
    // 移除弹窗位置监听
    if (viewer.value) {
      viewer.value.scene.preRender.removeEventListener(updatePopupPosition)
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
    selectedPoint,
    showPopup,
    popupPosition,
    stats,
    
    // 方法
    loadData,
    initDataSource,
    updateMapPoints,
    setupClickHandler,
    handlePointClick,
    closePopup,
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
