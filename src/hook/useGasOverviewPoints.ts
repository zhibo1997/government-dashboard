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
  const dataSource = ref<any>(null)
  const currentType = ref<string | null>(null)
  let clickHandler: any = null
  let cameraMoveEndListener: any = null
  let currentPoints: GasOverviewPoint[] = []
  let lastThinDistance: number | null = null
  let currentIconUrl: string | undefined = undefined

  const init = async (cesiumViewer: any) => {
    if (!cesiumViewer) {
      console.warn('[useGasOverviewPoints] viewer 未就绪')
      return
    }
    try {
      viewer.value = cesiumViewer
      const Cesium = (window as any).Cesium
      const ds = new Cesium.CustomDataSource('gasOverviewPoints')
      await viewer.value.dataSources.add(ds)
      dataSource.value = ds
    } catch (error) {
      console.error('初始化 Cesium 失败:', error)
    }
  }

  const clearPoints = () => {
    if (dataSource.value) {
      dataSource.value.entities.removeAll()
    }
    currentType.value = null
  }

  const setupClickHandler = (onPointClick?: (point: GasOverviewPoint) => void) => {
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
              flyToPoint(pointData)
              if (onPointClick) {
                onPointClick(pointData)
              }
            } catch (e) {
              console.warn('解析点位数据失败:', e)
            }
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    )
  }

  // 四档抽稀配置：[相机高度阈值(米), 标签间距(经纬度)]
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
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDistance) {
          used[j] = true
        }
      }
    }

    return showLabel
  }

  /** 过滤不可见/控制 Unicode 字符，避免 Cesium 渲染崩溃 */
  const sanitizeName = (name: string): string => {
    return name.replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, '')
  }

  /**
   * 首次渲染点位（billboard 图标 + label）
   */
  const renderPoints = (points: GasOverviewPoint[], thinDistance: number | null, iconUrl?: string) => {
    if (!dataSource.value || !viewer.value) return

    const Cesium = (window as any).Cesium
    const entities = dataSource.value.entities

    entities.suspendEvents()
    entities.removeAll()

    const labelIndices = thinDistance !== null ? thinLabels(points, thinDistance) : new Set(points.map((_, i) => i))

    points.forEach((point, index) => {
      if (point.jd && point.wd) {
        const showLabel = labelIndices.has(index)
        const safeName = sanitizeName(point.name || '')
        const entityOptions: any = {
          position: Cesium.Cartesian3.fromDegrees(point.jd, point.wd),
          label: {
            text: safeName,
            font: '14px Microsoft YaHei, sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            backgroundColor: Cesium.Color.fromCssColorString('rgba(6, 30, 52, 0.75)'),
            padding: new Cesium.Cartesian2(6, 3),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15),
            show: showLabel,
          },
          description: JSON.stringify(point),
        }

        if (iconUrl) {
          entityOptions.billboard = {
            image: iconUrl,
            width: 32,
            height: 32,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          }
        } else {
          entityOptions.point = {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#00ffff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          }
        }

        entities.add(entityOptions)
      }
    })

    entities.resumeEvents()
    viewer.value.scene.requestRender()
  }

  const updateLabelVisibility = (points: GasOverviewPoint[], thinDistance: number | null) => {
    if (!dataSource.value || !viewer.value) return

    const entities = dataSource.value.entities.values
    const labelIndices = thinDistance !== null ? thinLabels(points, thinDistance) : null

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      if (entity.label) {
        entity.label.show = thinDistance !== null ? labelIndices!.has(i) : true
      }
    }

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
        updateLabelVisibility(currentPoints, thinDistance)
      }
    })
  }

  /**
   * 添加散点
   * @param points 点位数据
   * @param name 模块名称
   * @param iconUrl 散点图标 URL（可选，不传则用默认圆点）
   * @param _onPointClick 点击回调（保留参数兼容，实际通过 setupClickHandler 注册）
   */
  const addPoints = (points: GasOverviewPoint[], name: string, iconUrl?: string, _onPointClick?: (point: GasOverviewPoint) => void) => {
    if (!dataSource.value || !viewer.value) return

    clearPoints()
    currentType.value = name
    currentPoints = points
    currentIconUrl = iconUrl

    const cameraHeight = getCameraHeight(viewer.value)
    const thinDistance = getThinDistance(cameraHeight)
    lastThinDistance = thinDistance

    renderPoints(points, thinDistance, iconUrl)
    setupCameraListener()
  }

  const flyToPoint = (point: GasOverviewPoint) => {
    if (!viewer.value) return

    const Cesium = (window as any).Cesium
    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(point.jd, point.wd, 2000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 1.5,
    })
  }

  const cleanup = () => {
    clearPoints()
    if (clickHandler) {
      clickHandler()
      clickHandler = null
    }
    if (cameraMoveEndListener) {
      cameraMoveEndListener()
      cameraMoveEndListener = null
    }
    currentPoints = []
    if (dataSource.value && viewer.value) {
      viewer.value.dataSources.remove(dataSource.value, true)
      dataSource.value = null
    }
    viewer.value = null
  }

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    viewer,
    dataSource,
    currentType,
    init,
    clearPoints,
    addPoints,
    flyToPoint,
    setupClickHandler,
    cleanup,
  }
}
