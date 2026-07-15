/**
 * 桥梁设备点位管理 Hook
 * @description DOM 叠加方式渲染设备点位，模仿 public/bridge2.html
 */

import { ref } from 'vue'

export interface DevicePoint {
  sbbh: string       // scenetree 原始 name（用于高亮匹配）
  baseName: string   // 去掉后缀的设备编号（用于 API 查询和视角匹配）
  sblx: string       // 设备类型编码（如 jcsblx0502）
  position: any // Cesium.Cartesian3
  lng: number
  lat: number
  height: number
}

/** 从 scenetree name 提取 baseName 和 sblx */
function parseDeviceName(name: string): { baseName: string; sblx: string } {
  const match = name.match(/^(.+)-(jcsblx\d+)$/)
  if (match) return { baseName: match[1], sblx: match[2] }
  return { baseName: name, sblx: '' }
}

interface DeviceEntry {
  bridgeQlbh: string
  type: 'equipment' | 'monitor'
  device: DevicePoint
  dotEl: HTMLDivElement
  imgEl: HTMLImageElement
  iconSmallH: number
  iconLargeH: number
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
  let activeTileset: any = null // 当前高亮的 tileset

  /** 加载视角数据（按桥梁 qlbh 拉对应文件，找不到则回退到旧的单文件） */
  async function loadViewRecords(qlbh?: string): Promise<void> {
    const baseUrl = import.meta.env.BASE_URL
    // 候选文件：按桥梁命名的独立文件，最后回退到旧的全量文件
    const candidates = qlbh
      ? [`${baseUrl}/overpass-views-${qlbh}.json`, `${baseUrl}/overpass-views.json`]
      : [`${baseUrl}/overpass-views.json`]
    try {
      for (const url of candidates) {
        const res = await fetch(url)
        console.log('🔍 加载视角数据文件:', url, res)
        if (res.ok) {
          viewRecords = await res.json()
          console.log(`📐 加载视角数据: ${viewRecords.length} 条 (${url})`)
          break
        }
      }
    } catch {
      console.warn('未找到视角数据文件，使用默认俯视')
    }
  }

  /** 根据设备名称查找保存的视角（用 baseName 匹配） */
  function findSavedView(baseName: string): SavedCameraView | null {
    const matched = viewRecords.filter(r => r.device.name === baseName)
    const record = matched[0]
    console.log(
      `[bridge-view] 设备 ${baseName} → 视角 ${record ? '命中 ' + matched.length + ' 条' : '未命中（俯视）'}`
      + (record ? `\n   device.lng=${record.device.lng} device.lat=${record.device.lat} device.height=${record.device.height}`
        + `\n   cam.lng=${record.camera.lng} cam.lat=${record.camera.lat} cam.height=${record.camera.height}`
        + `\n   cam.heading=${record.camera.heading} cam.pitch=${record.camera.pitch} cam.roll=${record.camera.roll}`
        + `\n   time=${record.time}` : '')
    )
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
        const { baseName, sblx } = parseDeviceName(el.name)
        devices.push({
          sbbh: el.name,
          baseName,
          sblx,
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

      const saved = findSavedView(device.baseName)

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
          destination: Cesium.Cartesian3.fromDegrees(device.lng, device.lat, 200),
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
  /** 根据图片 URL 和目标宽度计算高度（保持比例） */
  function calcIconHeight(url: string, targetWidth: number): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(Math.round(targetWidth * (img.height / img.width)))
      img.onerror = () => resolve(targetWidth)
      img.src = url
    })
  }

  function addDevicePoints(
    viewer: any,
    bridgeQlbh: string,
    type: 'equipment' | 'monitor',
    devices: DevicePoint[],
    iconUrl: string | ((device: DevicePoint) => string),
    onClick?: (device: DevicePoint, type: string) => void,
    sblxDict?: Record<string, string>,
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

      const url = typeof iconUrl === 'function' ? iconUrl(device) : iconUrl
      const img = document.createElement('img')
      img.src = url
      const tooltip = (device.sblx && sblxDict?.[device.sblx]) || device.sblx || device.baseName
      img.alt = tooltip
      img.title = tooltip
      img.style.cssText = `width:${ICON_SMALL.w}px;height:${ICON_SMALL.h}px;display:block;`
      img.draggable = false
      dot.appendChild(img)

      // 根据实际图片比例计算高度
      calcIconHeight(url, ICON_SMALL.w).then((h) => {
        const entry = allDevices.value.find(e => e.dotEl === dot)
        if (entry) {
          entry.iconSmallH = h
          entry.iconLargeH = Math.round(ICON_LARGE.w * (h / ICON_SMALL.w))
        }
      })

      if (onClick) {
        dot.addEventListener('click', (e) => {
          e.stopPropagation()
          onClick(device, type)
        })
      }

      container.appendChild(dot)
      allDevices.value.push({ bridgeQlbh, type, device, dotEl: dot, imgEl: img, iconSmallH: ICON_SMALL.h, iconLargeH: ICON_LARGE.h })
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
      const baseW = isLarge ? ICON_LARGE.w : ICON_SMALL.w

      for (const item of allDevices.value) {
        const dot = item.dotEl
        const sp = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, item.device.position)
        if (!sp || sp.x < -20 || sp.x > w + 20 || sp.y < -20 || sp.y > h + 20) {
          dot.style.display = 'none'
          continue
        }
        dot.style.display = ''

        const iconH = isLarge ? item.iconLargeH : item.iconSmallH
        const img = item.imgEl
        if (img.width !== baseW) {
          img.style.width = `${baseW}px`
          img.style.height = `${iconH}px`
        }

        dot.style.transform = `translate(${sp.x - baseW / 2}px, ${sp.y - iconH}px)`
      }
    })
  }

  function stopPostRender(viewer: any) {
    if (postRenderListener) {
      postRenderListener()
      postRenderListener = null
    }
  }

  /**
   * 高亮 3D Tileset 中的指定要素
   */
  function highlightFeature(tileset: any, featureName: string) {
    const Cesium = (window as any).Cesium
    if (!Cesium || !tileset) return

    resetHighlight()
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          [`\${name} === '${featureName}'`, "color('#00BFFF', 1.0)"],
          ['true', "color('white', 1.0)"],
        ],
      },
    })
    activeTileset = tileset
  }

  /**
   * 重置高亮
   */
  function resetHighlight() {
    const Cesium = (window as any).Cesium
    if (!Cesium || !activeTileset) return
    activeTileset.style = new Cesium.Cesium3DTileStyle({
      color: "color('white', 1.0)",
    })
    activeTileset = null
  }

  function clearAll(viewer?: any) {
    resetHighlight()
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
    highlightFeature,
    resetHighlight,
    clearAll,
  }
}
