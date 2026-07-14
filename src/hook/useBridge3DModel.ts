/**
 * 桥梁三维模型管理 Hook
 * 封装 3D 模型加载、设备点位、高亮、视频播放等逻辑
 */

import { ref, computed, inject, type Ref } from 'vue'
import { useMapHooks } from '@/hook/useMapHooks'
import { useBridgeDevicePoints } from '@/hook/useBridgeDevicePoints'
import { useMapStore } from '@/stores/mapStore'
import { useBridgeModelStore } from '@/stores/bridgeModelStore'
import { BRIDGE_LAYER_CONFIG } from '@/config/layerConfig'
import { getSurveillanceVideoByIp } from '@/services/surveillanceVideoService'
import { getMonitoringPointLatestData } from '@/services/commonService'
import { getCachedDictionary } from '@/services/dictionaryService'
import { useVideoPlayer } from '@/hook/useVideoPlayer'

export function useBridge3DModel(options: {
  viewer: Ref<any>
  popupData: Ref<any>
  clearPoints: () => void
  closePopup: () => void
  loadBridgePoints: (filter?: any) => Promise<void>
  onClear?: () => void
}) {
  const { viewer, popupData, clearPoints, closePopup, loadBridgePoints, onClear } = options

  const cesiumUtils = useMapHooks()
  const mapStore = useMapStore()
  const bridgeModelStore = useBridgeModelStore()
  const mapRef = inject<any>('MAP_INSTANCE')
  const { loadScenetree, addDevicePoints, flyToDevice, highlightFeature, resetHighlight, loadViewRecords, clearAll: clearDevicePoints } = useBridgeDevicePoints()
  const videoPlayer = useVideoPlayer()

  // 状态
  const activeBridgeQlbh = ref<string | null>(null)
  const equipPopupVisible = ref(false)
  const equipPopupData = ref<any>(null)

  let equipTilesetRef: any = null
  let monitorTilesetRef: any = null

  const is3DMode = computed(() => mapRef?.value?.sceneMode === 3)

  const hasModel = computed(() => {
    if (!popupData.value?.qlbh) return false
    return BRIDGE_LAYER_CONFIG.some((c) => c.qlbh === popupData.value.qlbh)
  })

  const defaultEquipIconUrl = new URL('@/assets/img/points/cg_icon.png', import.meta.url).href
  const getEquipIconUrl = (device: any) => {
    if (device.sblx) return new URL(`../assets/img/points/监测设备图标/${device.sblx}.png`, import.meta.url).href
    return defaultEquipIconUrl
  }
  const monitorIconUrl = new URL('@/assets/img/points/jk_icon.png', import.meta.url).href

  const convertUrl = (url: string) => {
    const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
    return isProduction && url.startsWith('http://') ? url.replace('http://', 'https://') : url
  }

  /** 关闭所有三维相关弹窗 */
  function closeAllPopups() {
    equipPopupVisible.value = false
    videoPlayer.close()
  }

  /** 切换桥梁模型 */
  async function handleBridgeSelect(qlbh: string) {
    if (activeBridgeQlbh.value === qlbh) return
    activeBridgeQlbh.value = qlbh
    popupData.value = { qlbh }
    await handleShowModel()
  }

  /** 加载桥梁 3D 模型 + 设备点位 */
  async function handleShowModel() {
    if (!popupData.value) return
    const qlbh = popupData.value.qlbh
    if (!qlbh) return
    activeBridgeQlbh.value = qlbh

    // 先收侧边栏（立即生效，不等模型加载）
    clearPoints()
    closePopup()
    if (mapRef?.value && !mapRef.value.isMapExpanded) {
      mapRef.value.toggleMapExpand()
    }

    // 清除旧的
    resetHighlight()
    bridgeModelStore.removeAllTilesets()
    clearDevicePoints(viewer.value)

    const cfg = BRIDGE_LAYER_CONFIG.find((c) => c.qlbh === qlbh)
    if (!cfg) return

    const bridgeLayer = mapStore.findLayerById(cfg.id)
    if (!bridgeLayer?.url) return

    try {
      // 切到 3D
      if (mapRef?.value?.sceneMode !== 3) {
        mapRef.value.sceneMode = 3
      }
      bridgeModelStore.setViewer(viewer.value)
      await loadViewRecords(qlbh)

      // 加载设备类型字典
      const sblxDictItems = await getCachedDictionary('jcsblx_ql')
      const sblxDict: Record<string, string> = {}
      sblxDictItems.forEach((item: any) => { sblxDict[item.f_ItemValue] = item.f_ItemName })

      // 加载桥梁模型
      const bridgeUrl = convertUrl(bridgeLayer.url)
      const bridgeTileset = await cesiumUtils.load3DTiles(viewer.value, bridgeUrl, { flyTo: true })
      bridgeModelStore.addTileset(bridgeTileset)

      // 光照
      applyLighting()

      // 监测设备
      if (cfg.equipmentId) {
        const equipLayer = mapStore.findLayerById(cfg.equipmentId)
        if (equipLayer?.url) {
          const equipUrl = convertUrl(equipLayer.url)
          const ts = await cesiumUtils.load3DTiles(viewer.value, equipUrl, { flyTo: false })
          bridgeModelStore.addTileset(ts)
          equipTilesetRef = ts

          const devices = await loadScenetree(equipUrl)
          if (devices.length > 0) {
            addDevicePoints(viewer.value, qlbh, 'equipment', devices, getEquipIconUrl, async (device) => {
              closeAllPopups()
              closePopup()
              if (equipTilesetRef) highlightFeature(equipTilesetRef, device.sbbh)
              await flyToDevice(viewer.value, device)
              try {
                const data = await getMonitoringPointLatestData(undefined, undefined, device.baseName)
                equipPopupData.value = data[0] || { sbbh: device.baseName, sbmc: device.baseName, sblx: device.sblx }
              } catch {
                equipPopupData.value = { sbbh: device.baseName, sbmc: device.baseName, sblx: device.sblx }
              }
              equipPopupVisible.value = true
            }, sblxDict)
          }
        }
      }

      // 监控设备
      if (cfg.monitorId) {
        const monitorLayer = mapStore.findLayerById(cfg.monitorId)
        if (monitorLayer?.url) {
          const monitorUrl = convertUrl(monitorLayer.url)
          const ts = await cesiumUtils.load3DTiles(viewer.value, monitorUrl, { flyTo: false })
          bridgeModelStore.addTileset(ts)
          monitorTilesetRef = ts

          const devices = await loadScenetree(monitorUrl)
          if (devices.length > 0) {
            addDevicePoints(viewer.value, qlbh, 'monitor', devices, monitorIconUrl, async (device) => {
              closeAllPopups()
              closePopup()
              if (monitorTilesetRef) highlightFeature(monitorTilesetRef, device.sbbh)
              await flyToDevice(viewer.value, device)
              await handleMonitorClick(device.sbbh)
            }, sblxDict)
          }
        }
      }
    } catch (e) {
      console.error('❌ 桥梁模型加载失败:', e)
    }

  }

  /** 监控设备点击 → 获取视频 */
  async function handleMonitorClick(sbbh: string) {
    // 兼容两种格式：10.92.8.157-1 或 10.92.8.230
    const ipMatch = sbbh.match(/^(\d+\.\d+\.\d+\.\d+)(?:-\d+)?$/)
    if (!ipMatch) return
    const ip = ipMatch[1]
    try {
      const videoData = await getSurveillanceVideoByIp(ip)
      if (videoData?.spbh) {
        await videoPlayer.play(videoData.spbh, videoData.spmc || sbbh)
      }
    } catch (e) {
      console.error('❌ 获取监控视频失败:', e)
    }
  }

  /** 应用光照 */
  function applyLighting() {
    const Cesium = (window as any).Cesium
    if (!Cesium || !viewer.value) return
    const v = viewer.value
    v.shadows = true
    v.scene.sun.show = true
    v.scene.sun.glowFactor = 0.0
    v.scene.globe.enableLighting = true
    v.scene.globe.baseColor = Cesium.Color.fromCssColorString('#8899aa')
    v.shadowMap.size = 2048
    v.shadowMap.softShadows = true
    v.shadowMap.darkness = 0.6
    v.scene.globe.depthTestAgainstTerrain = true
  }

  /** 注册 store 回调 */
  function registerCallbacks() {
    bridgeModelStore.registerReloadScatter(async () => {
      activeBridgeQlbh.value = null
      const Cesium = (window as any).Cesium
      const lng = popupData.value?.qjdxx
      const lat = popupData.value?.qwdxx
      if (Cesium && viewer.value && lng && lat) {
        viewer.value.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, 1000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
          duration: 1.5,
          complete: () => loadBridgePoints(),
          cancel: () => loadBridgePoints(),
        })
      } else {
        await loadBridgePoints()
      }
    })

    bridgeModelStore.registerClearCallback(() => {
      resetHighlight()
      equipTilesetRef = null
      monitorTilesetRef = null
      activeBridgeQlbh.value = null
      clearDevicePoints(viewer.value)
      clearPoints()
      closePopup()
      closeAllPopups()
      equipPopupData.value = null
      videoPlayer.close()
      onClear?.()
    })
  }

  function unregisterCallbacks() {
    bridgeModelStore.unregisterClearCallback()
    bridgeModelStore.unregisterReloadScatter()
  }

  return {
    // 状态
    activeBridgeQlbh,
    is3DMode,
    hasModel,
    equipPopupVisible,
    equipPopupData,
    videoPlayer,
    // 方法
    handleBridgeSelect,
    handleShowModel,
    closeAllPopups,
    registerCallbacks,
    unregisterCallbacks,
  }
}
