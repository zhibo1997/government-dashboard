/**
 * 桥梁设备点位管理 Hook
 * @description DOM 叠加方式渲染设备点位，模仿 public/bridge2.html
 */

import { ref } from 'vue'

export interface DevicePoint {
  sbbh: string
  position: any // Cesium.Cartesian3
  lng: number
  lat: number
  height: number
}

interface DeviceEntry {
  bridgeQlbh: string
  type: 'equipment' | 'monitor'
  device: DevicePoint
  dotEl: HTMLDivElement
  imgEl: HTMLImageElement
}

/** 保存的相机视角 */
export interface SavedCameraView {
  lng: number
  lat: number
  height: number
  heading: number
  pitch: number
  roll: number
}

/** 视角数据条目 */
export interface ViewRecord {
  name: string
  device: { name: string; type: string; lng: number; lat: number; height: number }
  camera: SavedCameraView
}

/** 两档图标尺寸 (512:797 比例) */
const ICON_SMALL = { w: 20, h: 31 }
const ICON_LARGE = { w: 30, h: 47 }

/** 切档相机高度阈值（米） */
const ZOOM_THRESHOLD = 300

export function useBridgeDevicePoints() {
  const allDevices = ref<DeviceEntry[]>([])
  let postRenderListener: any = null
  let dotContainer: HTMLDivElement | null = null
  let viewRecords: ViewRecord[] = []

  /** 加载视角数据 */
  async function loadViewRecords(): Promise<void> {
    try {
    const baseUrl = import.meta.env.BASE_URL;
      const res = await fetch(baseUrl+'/overpass-views.json')
      console.log('🔍 加载视角数据文件:', res)
      if (res.ok) {
        viewRecords = await res.json()
        console.log(`📐 加载视角数据: ${viewRecords.length} 条`)
      }
    } catch {
      console.warn('未找到视角数据文件，使用默认俯视')
    }
  }

  /** 根据设备名称查找保存的视角 */
  function findSavedView(deviceName: string): SavedCameraView | null {
    const record = viewRecords.find(r => r.device.name === deviceName)
    return record?.camera ?? null
  }

  /** 确保容器存在 */
  function ensureContainer(viewer: any): HTMLDivElement {
    if (dotContainer) return dotContainer
    const container = document.createElement('div')
    container.id = 'bridgeDeviceDots'
    container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;overflow:hidden;'
    viewer.container.appendChild(container)
    dotContainer = container
    return container
  }

  /**
   * 从 tileset URL 加载 scenetree.json 并解析设备位置
   */
  async function loadScenetree(tilesetUrl: string): Promise<DevicePoint[]> {
    const Cesium = (window as any).Cesium
    if (!Cesium) return []

    const treeUrl = tilesetUrl.replace('tileset.json', 'scenetree.json')
    try {
      const res = await fetch(treeUrl)
      if (!res.ok) return []
      const data = await res.json()
      const scene = data.scenes?.[0]
      if (!scene?.children) return []

      const devices: DevicePoint[] = []
      for (const el of scene.children) {
        if (el.type !== 'element' || !el.sphere || el.sphere.length < 3) continue
        const pos = Cesium.Cartesian3.fromElements(el.sphere[0], el.sphere[1], el.sphere[2])
        const carto = Cesium.Cartographic.fromCartesian(pos)
        devices.push({
          sbbh: el.name,
          position: pos,
          lng: Cesium.Math.toDegrees(carto.longitude),
          lat: Cesium.Math.toDegrees(carto.latitude),
          height: carto.height,
        })
      }
      return devices
    } catch (e) {
      console.warn('加载 scenetree 失败:', treeUrl, e)
      return []
    }
  }

  /**
   * 飞入设备视角（有保存视角就用，没有就俯视）
   * @returns Promise，飞入完成后 resolve
   */
  function flyToDevice(viewer: any, device: DevicePoint): Promise<void> {
    return new Promise((resolve) => {
      const Cesium = (window as any).Cesium
      if (!Cesium || !viewer) { resolve(); return }

      const saved = findSavedView(device.sbbh)

      if (saved) {
        // 有保存的视角 → 飞入
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(saved.lng, saved.lat, saved.height),
          orientation: {
            heading: saved.heading,
            pitch: saved.pitch,
            roll: saved.roll,
          },
          duration: 2,
          complete: () => resolve(),
          cancel: () => resolve(),
        })
      } else {
        // 没有保存视角 → 俯视
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(device.lng, device.lat, 500),
          orientation: {
            heading: 0,
            pitch: Cesium.Math.toRadians(-90),
            roll: 0,
          },
          duration: 2,
          complete: () => resolve(),
          cancel: () => resolve(),
        })
      }
    })
  }

  /**
   * 添加设备点位到地图（DOM 方式）
   */
  function addDevicePoints(
    viewer: any,
    bridgeQlbh: string,
    type: 'equipment' | 'monitor',
    devices: DevicePoint[],
    iconUrl: string,
    onClick?: (device: DevicePoint, type: string) => void,
  ) {
    if (!viewer || devices.length === 0) return

    const container = ensureContainer(viewer)

    for (const device of devices) {
      const dot = document.createElement('div')
      dot.className = 'bridge-device-dot'
      dot.dataset.sbbh = device.sbbh
      dot.dataset.bridgeQlbh = bridgeQlbh
      dot.dataset.type = type
      dot.style.cssText = 'position:absolute;pointer-events:auto;cursor:pointer;'

      const img = document.createElement('img')
      img.src = iconUrl
      img.alt = device.sbbh
      img.style.cssText = `width:${ICON_SMALL.w}px;height:${ICON_SMALL.h}px;display:block;`
      img.draggable = false
      dot.appendChild(img)

      if (onClick) {
        dot.addEventListener('click', (e) => {
          e.stopPropagation()
          onClick(device, type)
        })
      }

      container.appendChild(dot)
      allDevices.value.push({ bridgeQlbh, type, device, dotEl: dot, imgEl: img })
    }

    startPostRender(viewer)
  }

  /**
   * postRender：两档缩放
   */
  function startPostRender(viewer: any) {
    if (postRenderListener) return

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    postRenderListener = viewer.scene.postRender.addEventListener(() => {
      const w = viewer.scene.canvas.clientWidth
      const h = viewer.scene.canvas.clientHeight
      const cameraHeight = viewer.camera.positionCartographic.height

      const isLarge = cameraHeight < ZOOM_THRESHOLD
      const size = isLarge ? ICON_LARGE : ICON_SMALL

      for (const item of allDevices.value) {
        const dot = item.dotEl
        const sp = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, item.device.position)
        if (!sp || sp.x < -20 || sp.x > w + 20 || sp.y < -20 || sp.y > h + 20) {
          dot.style.display = 'none'
          continue
        }
        dot.style.display = ''

        const img = item.imgEl
        if (img.width !== size.w) {
          img.style.width = `${size.w}px`
          img.style.height = `${size.h}px`
        }

        dot.style.transform = `translate(${sp.x - size.w / 2}px, ${sp.y - size.h}px)`
      }
    })
  }

  function stopPostRender(viewer: any) {
    if (postRenderListener) {
      postRenderListener()
      postRenderListener = null
    }
  }

  function clearAll(viewer?: any) {
    if (dotContainer && dotContainer.parentNode) {
      dotContainer.parentNode.removeChild(dotContainer)
    }
    dotContainer = null
    allDevices.value = []
    if (viewer) stopPostRender(viewer)
  }

  return {
    allDevices,
    loadViewRecords,
    findSavedView,
    loadScenetree,
    addDevicePoints,
    flyToDevice,
    clearAll,
  }
}
