/**
 * 基础设施模块统一 Hook
 * @description 封装散点管理、MVT 图层管理、统一点击处理、弹窗状态、切换清理
 * 业务组件只负责数据组装和调用
 */

import { ref, onBeforeUnmount } from 'vue'
import { useGasOverviewPoints } from './useGasOverviewPoints'
import { useMapHooks } from './useMapHooks'

/** MVT 图层配置：按 name 或 id 从图层树查找 */
export interface MvtLayerConfig {
  name?: string
  id?: string
}

export interface InfrastructureModuleOptions {
  /** 点位坐标接口：模块名 → API */
  coordinateApiMap: Record<string, () => Promise<any>>
  /** 详情接口：模块名 → API */
  detailApiMap: Record<string, (lsh: string) => Promise<any>>
  /** MVT 图层配置：模块名 → { name?, id? } */
  mvtLayerMap?: Record<string, MvtLayerConfig>
  /** 散点图标映射：模块名 → 图标 URL */
  iconUrlMap?: Record<string, string>
  /** MVT 要素点击回调（可选） */
  onMvtFeaturePick?: (props: any, moduleName: string) => void
}

export function useInfrastructureModule(options: InfrastructureModuleOptions) {
  const { coordinateApiMap, detailApiMap, mvtLayerMap = {}, iconUrlMap = {}, onMvtFeaturePick } = options

  // 散点管理
  const { init: initMapPoints, addPoints, clearPoints, dataSource, viewer } = useGasOverviewPoints()

  // MVT 图层管理
  const { loadMVTLayer } = useMapHooks()
  let mapStore: any = null

  // MVT 图层实例缓存
  const mvtLayerCache: Record<string, any> = {}

  // 弹窗状态
  const popupVisible = ref(false)
  const popupData = ref<any>(null)

  // 当前选中的模块名
  const selectedId = ref<string | null>(null)

  // 当前活跃的 MVT 图层
  let activeMvtLayer: any = null

  // 点击事件处理器
  let clickHandler: any = null

  // ==================== 统一点击处理 ====================

  /** 散点 Entity → 解析数据 → 请求详情 → 弹窗 */
  const handleScatterClick = async (entity: any) => {
    if ((entity.point || entity.billboard) && entity.description) {
      try {
        const pointData = JSON.parse(entity.description.getValue())
        const detailApi = detailApiMap[selectedId.value || '']
        if (detailApi) {
          const detail = await detailApi(pointData.lsh)
          popupData.value = { ...detail, _name: detail._name || pointData.name }
          popupVisible.value = true
        }
        return true
      } catch (e) {
        console.warn('散点点击处理失败:', e)
      }
    }
    return false
  }

  /** MVT pickFeatures → 解析属性 → 弹窗 */
  const handleMvtClick = async (movement: any, v: any, Cesium: any): Promise<boolean> => {
    if (!activeMvtLayer?.show) return false
    try {
      const provider = activeMvtLayer.imageryProvider
      if (!provider?.pickFeatures) return false

      const cartesian = v.camera.pickEllipsoid(movement.position)
      const cartographic = cartesian ? Cesium.Cartographic.fromCartesian(cartesian) : null
      if (!cartographic) return false

      const lon = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      const cameraHeight = v.camera.positionCartographic.height
      const zoom = Math.max(0, Math.round(Math.log2((Math.PI * 6378137) / (cameraHeight * 0.5))))
      const n = Math.pow(2, zoom)
      const tileX = Math.floor(((lon + 180) / 360) * n)
      const latRad = (lat * Math.PI) / 180
      const tileY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n)

      const features = await provider.pickFeatures(tileX, tileY, zoom, cartographic.longitude, cartographic.latitude)
      if (!features?.length) return false

      const props: Record<string, any> = {}
      const data = features[0].data
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const feature = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
        if (feature && typeof feature === 'object') Object.assign(props, feature)
      }
      if (features[0].description) props._description = features[0].description

      if (Object.keys(props).length > 0) {
        const fixedHeight = Math.max(cameraHeight, 3000)
        v.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, fixedHeight),
          orientation: { heading: v.camera.heading, pitch: v.camera.pitch, roll: v.camera.roll },
          duration: 0.8,
        })
        const moduleName = Object.keys(mvtLayerMap).find(k => mvtLayerCache[k] === activeMvtLayer) || 'MVT要素'
        if (onMvtFeaturePick) onMvtFeaturePick(props, moduleName)
        popupData.value = props
        selectedId.value = moduleName
        popupVisible.value = true
        return true
      }
    } catch (e) {
      console.warn('MVT 点击处理异常:', e)
    }
    return false
  }

  /** 注册统一点击事件（散点优先 → MVT 其次） */
  const setupClickHandler = () => {
    if (!viewer.value) return
    const v = viewer.value
    const Cesium = (window as any).Cesium

    if (clickHandler) { clickHandler(); clickHandler = null }

    clickHandler = new Cesium.ScreenSpaceEventHandler(v.canvas)
    clickHandler.setInputAction(async (movement: any) => {
      if (!viewer.value) return

      // 1. 散点拾取（优先）
      const pickedObject = v.scene.pick(movement.position)
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const handled = await handleScatterClick(pickedObject.id)
        if (handled) return
      }

      // 2. MVT 拾取（散点未命中时）
      await handleMvtClick(movement, v, Cesium)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  // ==================== 初始化 ====================

  const init = async (cesiumViewer: any, store?: any) => {
    await initMapPoints(cesiumViewer)
    if (store) mapStore = store
    setupClickHandler()
  }

  // ==================== 弹窗管理 ====================

  const closePopup = () => {
    popupVisible.value = false
    popupData.value = null
  }

  // ==================== MVT 图层管理 ====================

  /** 从图层树按 name 或 id 查找 MVT URL */
  const findMvtUrl = (config: MvtLayerConfig): string | null => {
    if (!mapStore) return null
    const tree = mapStore.layerTreeNodes
    const search = (nodes: any[]): string | null => {
      for (const node of nodes) {
        if (config.name && node.name === config.name && node.type === 'mvt' && node.url) return node.url
        if (config.id && node.id === config.id && node.url) return node.url
        if (node.child?.length) {
          const found = search(node.child)
          if (found) return found
        }
      }
      return null
    }
    return search(tree)
  }

  /** 显示 MVT 图层 */
  const showMvtLayer = async (name: string): Promise<boolean> => {
    if (!viewer.value) return false
    const config = mvtLayerMap[name]
    if (!config) return false

    if (mvtLayerCache[name]) {
      mvtLayerCache[name].show = true
      activeMvtLayer = mvtLayerCache[name]
      viewer.value.scene.requestRender()
      return true
    }

    const url = findMvtUrl(config)
    if (!url) {
      console.warn(`图层树中未找到 ${name} 的 MVT 图层`, config)
      return false
    }

    try {
      const layer = await loadMVTLayer(viewer.value, url)
      mvtLayerCache[name] = layer
      activeMvtLayer = layer
      return true
    } catch (e) {
      console.error(`加载 ${name} MVT 失败:`, e)
      return false
    }
  }

  /** 隐藏所有 MVT 图层 */
  const hideAllMvtLayers = () => {
    for (const key in mvtLayerCache) {
      if (mvtLayerCache[key]) mvtLayerCache[key].show = false
    }
    activeMvtLayer = null
    viewer.value?.scene?.requestRender()
  }

  /** 设置当前活跃的 MVT 图层 */
  const setActiveMvtLayer = (layer: any) => {
    activeMvtLayer = layer
  }

  // ==================== 清理 ====================

  const clearAll = () => {
    clearPoints()
    hideAllMvtLayers()
    closePopup()
    selectedId.value = null
  }

  // ==================== 卡片点击入口 ====================

  const handleItemClick = async (item: any) => {
    if (selectedId.value === item.name) {
      clearAll()
      return
    }

    selectedId.value = item.name
    closePopup()
    clearPoints()
    hideAllMvtLayers()

    // MVT 图层
    if (mvtLayerMap[item.name]) {
      await showMvtLayer(item.name)
      return
    }

    // 散点
    const coordinateApi = coordinateApiMap[item.name]
    if (coordinateApi) {
      try {
        const data = await coordinateApi()
        if (Array.isArray(data) && data.length > 0) {
          const iconUrl = iconUrlMap[item.name]
          addPoints(data, item.name, iconUrl)
        }
      } catch (error) {
        console.error(`获取${item.name}数据失败:`, error)
      }
    }
  }

  // ==================== 生命周期 ====================

  onBeforeUnmount(() => {
    hideAllMvtLayers()
    if (clickHandler) { clickHandler(); clickHandler = null }
  })

  return {
    selectedId, popupVisible, popupData, viewer, dataSource,
    init, handleItemClick, closePopup, clearAll,
    addPoints, clearPoints, setActiveMvtLayer, showMvtLayer,
  }
}
