/**
 * 桥梁设备点位管理 Hook
 * @description DOM 叠加方式渲染设备点位，模仿 public/bridge2.html
 */

import { ref } from 'vue'

interface DevicePoint {
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
}

export function useBridgeDevicePoints() {
  const allDevices = ref<DeviceEntry[]>([])
  let postRenderListener: any = null
  let dotContainer: HTMLDivElement | null = null

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
   * 添加设备点位到地图（DOM 方式）
   */
  function addDevicePoints(
    viewer: any,
    bridgeQlbh: string,
    type: 'equipment' | 'monitor',
    devices: DevicePoint[],
    iconUrl: string,
    onClick?: (info: { sbbh: string; bridgeQlbh: string; type: string }) => void,
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
      img.style.cssText = 'width:28px;height:44px;display:block;'
      img.draggable = false
      dot.appendChild(img)

      if (onClick) {
        dot.addEventListener('click', (e) => {
          e.stopPropagation()
          onClick({ sbbh: device.sbbh, bridgeQlbh, type })
        })
      }

      container.appendChild(dot)
      allDevices.value.push({ bridgeQlbh, type, device, dotEl: dot })
    }

    // 启动 postRender 位置更新
    startPostRender(viewer)
  }

  /**
   * postRender：3D 坐标 → 屏幕坐标 + 动态缩放
   */
  function startPostRender(viewer: any) {
    if (postRenderListener) return

    const Cesium = (window as any).Cesium
    if (!Cesium) return

    postRenderListener = viewer.scene.postRender.addEventListener(() => {
      const w = viewer.scene.canvas.clientWidth
      const h = viewer.scene.canvas.clientHeight
      const cameraHeight = viewer.camera.positionCartographic.height

      // 动态缩放：近小远大（同 bridge2.html）
      let scale = 1.0
      if (cameraHeight < 100) {
        scale = 0.5
      } else if (cameraHeight < 500) {
        scale = 0.5 + (cameraHeight - 100) / 400 * 0.5
      }

      for (const item of allDevices.value) {
        const dot = item.dotEl
        const sp = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, item.device.position)
        if (!sp || sp.x < -20 || sp.x > w + 20 || sp.y < -20 || sp.y > h + 20) {
          dot.style.display = 'none'
          continue
        }
        dot.style.display = ''
        dot.style.transform = `translate(${sp.x - 14 * scale}px, ${sp.y - 44 * scale}px) scale(${scale})`
      }
    })
  }

  /**
   * 停止 postRender
   */
  function stopPostRender(viewer: any) {
    if (postRenderListener) {
      postRenderListener()
      postRenderListener = null
    }
  }

  /**
   * 清除所有设备点位
   */
  function clearAll(viewer?: any) {
    // 移除 DOM
    if (dotContainer && dotContainer.parentNode) {
      dotContainer.parentNode.removeChild(dotContainer)
    }
    dotContainer = null
    allDevices.value = []

    // 停止 postRender
    if (viewer) stopPostRender(viewer)
  }

  return {
    allDevices,
    loadScenetree,
    addDevicePoints,
    clearAll,
  }
}
