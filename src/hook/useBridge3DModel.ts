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
import { getCameraPreviewUrl } from '@/services/hikvisionService'

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

  // 状态
  const activeBridgeQlbh = ref<string | null>(null)
  const equipPopupVisible = ref(false)
  const equipPopupData = ref<any>(null)
  const showVideoPopup = ref(false)
  const currentVideoUrl = ref('')
  const currentCameraName = ref('')

  let equipTilesetRef: any = null
  let monitorTilesetRef: any = null

  const is3DMode = computed(() => mapRef?.value?.sceneMode === 3)

  const hasModel = computed(() => {
    if (!popupData.value?.qlbh) return false
    return BRIDGE_LAYER_CONFIG.some((c) => c.qlbh === popupData.value.qlbh)
  })

  const equipIconUrl = new URL('@/assets/img/points/cg_icon.png', import.meta.url).href
  const monitorIconUrl = new URL('@/assets/img/points/jk_icon.png', import.meta.url).href

  const convertUrl = (url: string) => {
    const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
    return isProduction && url.startsWith('http://') ? url.replace('http://', 'https://') : url
  }

  /** 关闭所有三维相关弹窗 */
  function closeAllPopups() {
    equipPopupVisible.value = false
    showVideoPopup.value = false
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
      await loadViewRecords()

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
            addDevicePoints(viewer.value, qlbh, 'equipment', devices, equipIconUrl, async (device) => {
              closeAllPopups()
              closePopup()
              if (equipTilesetRef) highlightFeature(equipTilesetRef, device.sbbh)
              await flyToDevice(viewer.value, device)
              equipPopupData.value = { sbbh: device.sbbh, sbmc: device.sbbh }
              equipPopupVisible.value = true
            })
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
            })
          }
        }
      }
    } catch (e) {
      console.error('❌ 桥梁模型加载失败:', e)
    }

    clearPoints()
    closePopup()

    if (mapRef?.value && !mapRef.value.isMapExpanded) {
      mapRef.value.toggleMapExpand()
    }
  }

  /** 监控设备点击 → 获取视频 */
  async function handleMonitorClick(sbbh: string) {
    const ipMatch = sbbh.match(/^(\d+\.\d+\.\d+\.\d+)-\d+$/)
    if (!ipMatch) return
    const ip = ipMatch[1]
    try {
      const videoData = await getSurveillanceVideoByIp(ip)
      if (videoData?.spbh) {
        const preview = await getCameraPreviewUrl({ cameraIndexCode: videoData.spbh, streamType: 1, protocol: 'wss' })
        const url = preview?.url || preview?.data?.url
        if (url) {
          currentVideoUrl.value = url
          currentCameraName.value = videoData.spmc || sbbh
          showVideoPopup.value = true
        }
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
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, 20000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
          duration: 1.5,
        })
      }
      await loadBridgePoints()
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
      currentVideoUrl.value = ''
      currentCameraName.value = ''
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
    showVideoPopup,
    currentVideoUrl,
    currentCameraName,
    // 方法
    handleBridgeSelect,
    handleShowModel,
    closeAllPopups,
    registerCallbacks,
    unregisterCallbacks,
  }
}
