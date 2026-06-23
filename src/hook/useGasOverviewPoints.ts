/**
 * 燃气基础设施地图点位管理 Hook
 * @description 管理燃气企业、液化气企业、燃气井盖等点位的地图展示
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
  let lastThinMode: boolean | null = null // 上一次抽稀状态，null 表示未初始化

  /**
   * 初始化 Cesium
   * @param cesiumViewer 外部传入的 viewer 实例
   */
  const init = async (cesiumViewer: any) => {
    if (!cesiumViewer) {
      console.warn('[useGasOverviewPoints] viewer 未就绪')
      return
    }
    try {
      viewer.value = cesiumViewer
      console.log('[useGasOverviewPoints] viewer 初始化完成:', !!viewer.value)

      const Cesium = (window as any).Cesium
      const ds = new Cesium.CustomDataSource('gasOverviewPoints')
      await viewer.value.dataSources.add(ds)
      dataSource.value = ds
      console.log('[useGasOverviewPoints] dataSource 初始化完成:', !!dataSource.value)
    } catch (error) {
      console.error('初始化 Cesium 失败:', error)
    }
  }

  /**
   * 清除地图上的点位
   */
  const clearPoints = () => {
    if (dataSource.value) {
      dataSource.value.entities.removeAll()
    }
    currentType.value = null
  }

  /**
   * 设置点击事件处理
   * @param onPointClick 点击点位时的回调函数
   */
  const setupClickHandler = (onPointClick?: (point: GasOverviewPoint) => void) => {
    if (!viewer.value) return

    const Cesium = (window as any).Cesium

    // 移除旧的点击处理器
    if (clickHandler) {
      clickHandler()
      clickHandler = null
    }

    // 添加新的点击处理器
    clickHandler = viewer.value.screenSpaceEventHandler.setInputAction(
      (movement: any) => {
        const pickedObject = viewer.value.scene.pick(movement.position)
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          const entity = pickedObject.id
          // 检查是否是我们添加的点位
          if (entity.point && entity.description) {
            try {
              const pointData = JSON.parse(entity.description.getValue())
              // 飞行到该点位
              flyToPoint(pointData)
              // 调用回调
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

  // 高度阈值：高于此值启用抽稀，低于此值显示全部标签
  const THIN_HEIGHT_THRESHOLD = 10000 // 10km
  const THIN_DISTANCE = 0.025

  /**
   * 标签抽稀：根据距离判断是否显示标签
   * @param points 点位数组
   * @param minDistance 最小间距（经纬度单位）
   * @returns 需要显示标签的点位索引集合
   */
  const thinLabels = (points: GasOverviewPoint[], minDistance: number = 0.015): Set<number> => {
    const showLabel = new Set<number>()
    const used: boolean[] = new Array(points.length).fill(false)

    for (let i = 0; i < points.length; i++) {
      if (used[i]) continue
      showLabel.add(i)
      used[i] = true

      // 标记附近的点为已使用
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

  /**
   * 首次渲染点位（所有实体都带 label，通过 show 控制显隐）
   */
  const renderPoints = (points: GasOverviewPoint[], thinMode: boolean) => {
    if (!dataSource.value || !viewer.value) return

    const Cesium = (window as any).Cesium
    const entities = dataSource.value.entities

    entities.suspendEvents()
    entities.removeAll()

    const labelIndices = thinMode ? thinLabels(points, THIN_DISTANCE) : new Set(points.map((_, i) => i))

    points.forEach((point, index) => {
      if (point.jd && point.wd) {
        const showLabel = labelIndices.has(index)
        entities.add({
          position: Cesium.Cartesian3.fromDegrees(point.jd, point.wd),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#00ffff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0.4),
          },
          label: {
            text: point.name || '',
            font: '14px Microsoft YaHei, sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15),
            scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0.5),
            show: showLabel,
          },
          description: JSON.stringify(point),
        })
      }
    })

    entities.resumeEvents()
    viewer.value.scene.requestRender()
  }

  /**
   * 更新标签显隐（不重建实体，只切换 label.show）
   */
  const updateLabelVisibility = (points: GasOverviewPoint[], thinMode: boolean) => {
    if (!dataSource.value || !viewer.value) return

    const entities = dataSource.value.entities.values
    const labelIndices = thinMode ? thinLabels(points, THIN_DISTANCE) : null

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      if (entity.label) {
        entity.label.show = thinMode ? labelIndices!.has(i) : true
      }
    }

    viewer.value.scene.requestRender()
  }

  /**
   * 设置相机高度监听，跨越阈值时切换抽稀模式
   */
  const setupCameraListener = () => {
    if (!viewer.value) return
    if (cameraMoveEndListener) {
      cameraMoveEndListener()
      cameraMoveEndListener = null
    }
    cameraMoveEndListener = viewer.value.camera.moveEnd.addEventListener(() => {
      if (currentPoints.length === 0) return
      const cameraHeight = getCameraHeight(viewer.value)
      const thinMode = cameraHeight >= THIN_HEIGHT_THRESHOLD
      if (thinMode !== lastThinMode) {
        lastThinMode = thinMode
        updateLabelVisibility(currentPoints, thinMode)
      }
    })
  }

  const addPoints = (points: GasOverviewPoint[], name: string, _onPointClick?: (point: GasOverviewPoint) => void) => {
    console.log(`[addPoints] 被调用, points=${points.length}, dataSource=${!!dataSource.value}, viewer=${!!viewer.value}`)
    if (!dataSource.value || !viewer.value) return

    clearPoints()
    currentType.value = name
    currentPoints = points

    // 根据当前高度决定是否抽稀
    const cameraHeight = getCameraHeight(viewer.value)
    const thinMode = cameraHeight >= THIN_HEIGHT_THRESHOLD
    lastThinMode = thinMode
    console.log(`[addPoints] 相机高度: ${(cameraHeight / 1000).toFixed(1)}km, 抽稀: ${thinMode}`)

    renderPoints(points, thinMode)

    // 设置相机监听，跨越阈值时切换
    setupCameraListener()
  }

  /**
   * 飞行到指定点位
   * @param point 点位数据
   */
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

  /**
   * 清理资源
   */
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
