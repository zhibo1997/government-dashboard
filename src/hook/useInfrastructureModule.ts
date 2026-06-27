/**
 * 基础设施模块统一 Hook
 * @description 封装散点管理、MVT 图层管理、点击详情、弹窗状态、切换清理
 */

import { ref, onBeforeUnmount } from 'vue'
import { useGasOverviewPoints } from './useGasOverviewPoints'
import { useMapHooks } from './useMapHooks'
import { useMvtPickHandler } from './useMvtPickHandler'

export interface InfrastructureModuleOptions {
  /** 点位坐标接口：模块名 → 获取坐标列表的 API */
  coordinateApiMap: Record<string, () => Promise<any>>
  /** 详情接口：模块名 → 获取详情的 API */
  detailApiMap: Record<string, (lsh: string) => Promise<any>>
  /** MVT 图层 ID 映射（可选）：模块名 → 图层 ID */
  mvtLayerIdMap?: Record<string, string>
  /** 散点图标映射（可选）：模块名 → 图标 URL */
  iconUrlMap?: Record<string, string>
  /** MVT 要素点击回调（可选，不同模块处理不同） */
  onMvtFeaturePick?: (props: any, moduleName: string) => void
}

export function useInfrastructureModule(options: InfrastructureModuleOptions) {
  const { coordinateApiMap, detailApiMap, mvtLayerIdMap = {}, iconUrlMap = {}, onMvtFeaturePick } = options

  // 散点管理
  const { init: initMapPoints, addPoints, clearPoints, setupClickHandler, dataSource, viewer } = useGasOverviewPoints()

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

  // 当前活跃的 MVT 图层（用于 pickHandler）
  let activeMvtLayer: any = null

  // MVT 点击查询
  const { setup: setupMvtPick } = useMvtPickHandler({
    get viewer() { return viewer.value },
    getMvtLayer: () => activeMvtLayer,
    onFeaturePick: (props: any) => {
      const moduleName = Object.keys(mvtLayerIdMap).find(k => mvtLayerCache[k] === activeMvtLayer) || 'MVT要素'
      if (onMvtFeaturePick) {
        onMvtFeaturePick(props, moduleName)
      }
      popupData.value = props
      selectedId.value = moduleName
      popupVisible.value = true
    },
    onScatterPick: (entity: any) => {
      if (entity.point && entity.description) {
        try {
          const pointData = JSON.parse(entity.description.getValue())
          handlePointClick(pointData)
        } catch (e) {
          console.warn('解析点位数据失败:', e)
        }
      }
    },
  })

  /** 初始化（传入 viewer 和 mapStore） */
  const init = async (cesiumViewer: any, store?: any) => {
    await initMapPoints(cesiumViewer)
    if (store) mapStore = store
    setupMvtPick()
  }

  /** 关闭弹窗 */
  const closePopup = () => {
    popupVisible.value = false
    popupData.value = null
  }

  /** 点击散点 → 请求详情 → 显示弹窗 */
  const handlePointClick = async (point: any) => {
    const detailApi = detailApiMap[selectedId.value || '']
    if (detailApi) {
      try {
        const detail = await detailApi(point.lsh)
        popupData.value = { ...detail, _name: detail._name || point.name }
        popupVisible.value = true
      } catch (error) {
        console.error('获取详情失败:', error)
      }
    }
  }

  /** 显示 MVT 图层 */
  const showMvtLayer = async (name: string): Promise<boolean> => {
    if (!viewer.value) return false
    if (!mvtLayerIdMap[name]) return false

    const layerId = mvtLayerIdMap[name]

    // 已缓存则直接显示
    if (mvtLayerCache[name]) {
      mvtLayerCache[name].show = true
      activeMvtLayer = mvtLayerCache[name]
      viewer.value.scene.requestRender()
      return true
    }

    // 从图层树查找 URL
    if (!mapStore) return false
    const tree = mapStore.layerTreeNodes
    const findUrl = (nodes: any[]): string | null => {
      for (const node of nodes) {
        if (node.id === layerId && node.url) return node.url
        if (node.child?.length) {
          const found = findUrl(node.child)
          if (found) return found
        }
      }
      return null
    }
    const url = findUrl(tree)
    if (!url) {
      console.warn(`图层树中未找到 ${name} 的 MVT 图层`)
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
      if (mvtLayerCache[key]) {
        mvtLayerCache[key].show = false
      }
    }
    activeMvtLayer = null
    viewer.value?.scene?.requestRender()
  }

  /** 清除所有（散点 + MVT + 弹窗） */
  const clearAll = () => {
    clearPoints()
    hideAllMvtLayers()
    closePopup()
    selectedId.value = null
  }

  /**
   * 处理项目点击（统一入口）
   * @param item 点击的项目 { id, name, ... }
   */
  const handleItemClick = async (item: any) => {
    // 取消选中
    if (selectedId.value === item.name) {
      clearAll()
      return
    }

    selectedId.value = item.name
    closePopup()
    clearPoints()
    hideAllMvtLayers()

    // 有 MVT 图层的展示 MVT
    if (mvtLayerIdMap[item.name]) {
      await showMvtLayer(item.name)
      return
    }

    // 有坐标接口的展示散点
    const coordinateApi = coordinateApiMap[item.name]
    if (coordinateApi) {
      try {
        const data = await coordinateApi()
        if (Array.isArray(data) && data.length > 0) {
          const iconUrl = iconUrlMap[item.name]
          addPoints(data, item.name, iconUrl, handlePointClick)
          setupClickHandler(handlePointClick)
        }
      } catch (error) {
        console.error(`获取${item.name}数据失败:`, error)
      }
    }
  }

  /** 设置当前活跃的 MVT 图层（供外部加载的 MVT 图层注册点击） */
  const setActiveMvtLayer = (layer: any) => {
    activeMvtLayer = layer
  }

  onBeforeUnmount(() => {
    hideAllMvtLayers()
  })

  return {
    // 状态
    selectedId,
    popupVisible,
    popupData,
    viewer,
    dataSource,
    // 方法
    init,
    handleItemClick,
    handlePointClick,
    closePopup,
    clearAll,
    addPoints,
    clearPoints,
    setupClickHandler,
    setActiveMvtLayer,
    showMvtLayer,
  }
}
