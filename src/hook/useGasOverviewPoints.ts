/**
 * 地图散点管理 Hook（各专项共用）
 * @description 管理燃气、供水、排水、桥梁等点位的地图展示
 */

import { ref, onBeforeUnmount } from 'vue'
import { getCameraHeight } from './billboardManager'

export interface GasOverviewPoint {
  lsh: string
  jd: number
  wd: number
  name?: string
}

export function useGasOverviewPoints() {
  const viewer = ref<any>(null)
  const dataSource = ref<any>(null)        // 点位/图标
  const labelSourceA = ref<any>(null)      // label 双缓冲 A
  const labelSourceB = ref<any>(null)      // label 双缓冲 B
  let activeLabelIsA = true                // 当前显示的是 A
  const currentType = ref<string | null>(null)
  let clickHandler: any = null
  let cameraMoveEndListener: any = null
  let currentPoints: GasOverviewPoint[] = []
  let lastThinDistance: number | null = null
  let currentIconUrl: string | undefined = undefined
  let currentIconWidth = 32
  let currentIconHeight = 32

  const init = async (cesiumViewer: any) => {
    if (!cesiumViewer) {
      console.warn('[useGasOverviewPoints] viewer 未就绪')
      return
    }
    try {
      viewer.value = cesiumViewer
      const Cesium = (window as any).Cesium
      const ds = new Cesium.CustomDataSource('gasOverviewPoints')
      const lsA = new Cesium.CustomDataSource('gasLabelsA')
      const lsB = new Cesium.CustomDataSource('gasLabelsB')
      await viewer.value.dataSources.add(ds)
      await viewer.value.dataSources.add(lsA)
      await viewer.value.dataSources.add(lsB)
      dataSource.value = ds
      labelSourceA.value = lsA
      labelSourceB.value = lsB
    } catch (error) {
      console.error('初始化 Cesium 失败:', error)
    }
  }

  const clearPoints = () => {
    if (dataSource.value) dataSource.value.entities.removeAll()
    if (labelSourceA.value) labelSourceA.value.entities.removeAll()
    if (labelSourceB.value) labelSourceB.value.entities.removeAll()
    currentType.value = null
    currentPoints = []
    currentIconUrl = undefined
    lastThinDistance = null
    viewer.value?.scene?.requestRender()
    if (cameraMoveEndListener) {
      cameraMoveEndListener()
      cameraMoveEndListener = null
    }
  }

  const setupClickHandler = (onPointClick?: (point: GasOverviewPoint) => void, shouldFly = true) => {
    if (!viewer.value) return

    const Cesium = (window as any).Cesium

    if (clickHandler) {
      clickHandler()
      clickHandler = null
    }

    clickHandler = viewer.value.screenSpaceEventHandler.setInputAction(
      (movement: any) => {
        const pickedObject = viewer.value.scene.pick(movement.position)
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          const entity = pickedObject.id
          if ((entity.point || entity.billboard) && entity.description) {
            try {
              const pointData = JSON.parse(entity.description.getValue())
              if (shouldFly) flyToPoint(pointData)
              if (onPointClick) onPointClick(pointData)
            } catch (e) {
              console.warn('解析点位数据失败:', e)
            }
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    )
  }

  // 四档抽稀配置
  const THIN_LEVELS: [number, number][] = [
    [30000, 0.04],
    [15000, 0.025],
    [8000, 0.015],
    [3000, 0.008],
  ]

  const getThinDistance = (cameraHeight: number): number | null => {
    for (const [threshold, distance] of THIN_LEVELS) {
      if (cameraHeight >= threshold) return distance
    }
    return null
  }

  const thinLabels = (points: GasOverviewPoint[], minDistance: number): Set<number> => {
    const showLabel = new Set<number>()
    const used: boolean[] = new Array(points.length).fill(false)
    for (let i = 0; i < points.length; i++) {
      if (used[i]) continue
      showLabel.add(i)
      used[i] = true
      for (let j = i + 1; j < points.length; j++) {
        if (used[j]) continue
        const dx = points[i].jd - points[j].jd
        const dy = points[i].wd - points[j].wd
        if (Math.sqrt(dx * dx + dy * dy) < minDistance) used[j] = true
      }
    }
    return showLabel
  }

  /** 用 canvas 渲染带背景边框的文字图片 */
  const createLabelCanvas = (text: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const font = '14px Microsoft YaHei, sans-serif'
    ctx.font = font
    const metrics = ctx.measureText(text)
    const padH = 8
    const padV = 4
    const w = Math.ceil(metrics.width) + padH * 2
    const h = 22 + padV * 2
    canvas.width = w
    canvas.height = h

    ctx.fillStyle = 'rgba(6, 30, 52, 0.75)'
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)'
    ctx.lineWidth = 1
    const r = 4
    ctx.beginPath()
    ctx.moveTo(r, 0); ctx.lineTo(w - r, 0)
    ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, h - r)
    ctx.quadraticCurveTo(w, h, w - r, h); ctx.lineTo(r, h)
    ctx.quadraticCurveTo(0, h, 0, h - r); ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.font = font
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, padH, h / 2)
    return canvas
  }

  const labelCanvasCache: Map<string, HTMLCanvasElement> = new Map()

  const getLabelCanvas = (text: string): HTMLCanvasElement => {
    if (!labelCanvasCache.has(text)) {
      labelCanvasCache.set(text, createLabelCanvas(text))
    }
    return labelCanvasCache.get(text)!
  }

  /** 渲染点位/图标（只在首次或切换类型时调用） */
  const renderPoints = (points: GasOverviewPoint[], iconUrl?: string, iconWidth = 32, iconHeight = 32) => {
    if (!dataSource.value || !viewer.value) return

    const Cesium = (window as any).Cesium
    const entities = dataSource.value.entities

    entities.suspendEvents()
    entities.removeAll()

    points.forEach((point) => {
      if (point.jd && point.wd) {
        const pos = Cesium.Cartesian3.fromDegrees(point.jd, point.wd)
        const desc = JSON.stringify(point)

        if (iconUrl) {
          entities.add({
            position: pos,
            billboard: {
              image: iconUrl,
              width: iconWidth, height: iconHeight,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
            },
            description: desc,
          })
        } else {
          entities.add({
            position: pos,
            point: {
              pixelSize: 10,
              color: Cesium.Color.fromCssColorString('#00ffff'),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
            },
            description: desc,
          })
        }
      }
    })

    entities.resumeEvents()
  }

  /**
   * 双缓冲更新 label：先写入后台 buffer，再切换显示，最后清空旧 buffer
   * 全程无空窗
   */
  const renderLabels = (points: GasOverviewPoint[], thinDistance: number | null) => {
    if (!labelSourceA.value || !labelSourceB.value || !viewer.value) return

    const Cesium = (window as any).Cesium
    const labelIndices = thinDistance !== null ? thinLabels(points, thinDistance) : new Set(points.map((_, i) => i))

    // 写入后台 buffer
    const backBuffer = activeLabelIsA ? labelSourceB.value : labelSourceA.value
    const backEntities = backBuffer.entities
    backEntities.suspendEvents()

    points.forEach((point, index) => {
      if (point.jd && point.wd && labelIndices.has(index)) {
        const name = point.name || ''
        if (!name) return
        const canvas = getLabelCanvas(name)
        backEntities.add({
          position: Cesium.Cartesian3.fromDegrees(point.jd, point.wd),
          billboard: {
            image: canvas,
            width: canvas.width,
            height: canvas.height,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })
      }
    })

    backEntities.resumeEvents()

    // 切换：显示新 buffer，隐藏旧 buffer
    const frontBuffer = activeLabelIsA ? labelSourceA.value : labelSourceB.value
    backBuffer.show = true
    frontBuffer.show = false

    // 清空旧 buffer
    frontBuffer.entities.removeAll()

    activeLabelIsA = !activeLabelIsA
    viewer.value.scene.requestRender()
  }

  const setupCameraListener = () => {
    if (!viewer.value) return
    if (cameraMoveEndListener) {
      cameraMoveEndListener()
      cameraMoveEndListener = null
    }
    cameraMoveEndListener = viewer.value.camera.moveEnd.addEventListener(() => {
      if (currentPoints.length === 0) return
      const cameraHeight = getCameraHeight(viewer.value)
      const thinDistance = getThinDistance(cameraHeight)
      if (thinDistance !== lastThinDistance) {
        lastThinDistance = thinDistance
        renderLabels(currentPoints, thinDistance)
      }
    })
  }

  const addPoints = (points: GasOverviewPoint[], name: string, iconUrl?: string, _onPointClick?: (point: GasOverviewPoint) => void, iconWidth = 32, iconHeight = 32) => {
    if (!dataSource.value || !viewer.value) return

    clearPoints()
    currentType.value = name
    currentPoints = points
    currentIconUrl = iconUrl
    currentIconWidth = iconWidth
    currentIconHeight = iconHeight

    const cameraHeight = getCameraHeight(viewer.value)
    const thinDistance = getThinDistance(cameraHeight)
    lastThinDistance = thinDistance

    renderPoints(points, iconUrl, iconWidth, iconHeight)
    renderLabels(points, thinDistance)
    setupCameraListener()
  }

  const flyToPoint = (point: GasOverviewPoint) => {
    if (!viewer.value) return
    const Cesium = (window as any).Cesium
    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(point.jd, point.wd, 2000),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
      duration: 1.5,
    })
  }

  const cleanup = () => {
    clearPoints()
    if (clickHandler) { clickHandler(); clickHandler = null }
    if (cameraMoveEndListener) { cameraMoveEndListener(); cameraMoveEndListener = null }
    currentPoints = []
    labelCanvasCache.clear()
    if (dataSource.value && viewer.value) {
      viewer.value.dataSources.remove(dataSource.value, true)
      dataSource.value = null
    }
    if (labelSourceA.value && viewer.value) {
      viewer.value.dataSources.remove(labelSourceA.value, true)
      labelSourceA.value = null
    }
    if (labelSourceB.value && viewer.value) {
      viewer.value.dataSources.remove(labelSourceB.value, true)
      labelSourceB.value = null
    }
    viewer.value = null
  }

  onBeforeUnmount(() => { cleanup() })

  return {
    viewer, dataSource, currentType,
    init, clearPoints, addPoints, flyToPoint, setupClickHandler, cleanup,
  }
}
