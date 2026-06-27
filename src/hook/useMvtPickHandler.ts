/**
 * MVT 要素点击查询通用 Hook
 * 供燃气、供水、排水等模块复用
 */
import { onBeforeUnmount } from 'vue'

export interface MvtPickOptions {
  /** Cesium Viewer 实例 */
  viewer: any
  /** MVT ImageryLayer 对象（需含 .show 和 .imageryProvider） */
  getMvtLayer: () => any
  /** 拾取到 MVT 要素时的回调 */
  onFeaturePick: (props: Record<string, any>) => void
  /** 拾取到散点 Entity 时的回调（可选） */
  onScatterPick?: (entity: any) => void
}

export function useMvtPickHandler(options: MvtPickOptions) {
  const { getMvtLayer, onFeaturePick, onScatterPick } = options
  let handler: any = null

  /** 注册统一点击事件 */
  function setup() {
    const viewer = options.viewer
    if (!viewer) return
    const Cesium = (window as any).Cesium

    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction(async (movement: any) => {
      // 1. MVT 要素拾取
      const mvtLayer = getMvtLayer()
      if (mvtLayer?.show) {
        try {
          const provider = mvtLayer.imageryProvider
          if (provider?.pickFeatures) {
            const cartesian = viewer.camera.pickEllipsoid(movement.position)
            const cartographic = cartesian
              ? Cesium.Cartographic.fromCartesian(cartesian)
              : null
            if (cartographic) {
              const lon = Cesium.Math.toDegrees(cartographic.longitude)
              const lat = Cesium.Math.toDegrees(cartographic.latitude)
              const cameraHeight = viewer.camera.positionCartographic.height
              const zoom = Math.max(
                0,
                Math.round(
                  Math.log2(
                    (Math.PI * 6378137) /
                      (cameraHeight * 0.5)
                  )
                )
              )
              const n = Math.pow(2, zoom)
              const tileX = Math.floor(((lon + 180) / 360) * n)
              const latRad = (lat * Math.PI) / 180
              const tileY = Math.floor(
                ((1 -
                  Math.log(
                    Math.tan(latRad) + 1 / Math.cos(latRad)
                  ) /
                    Math.PI) /
                  2) *
                  n
              )

              const features = await provider.pickFeatures(
                tileX,
                tileY,
                zoom,
                cartographic.longitude,
                cartographic.latitude
              )
              if (features?.length > 0) {
                const props: Record<string, any> = {}
                const data = features[0].data
                if (data && typeof data === 'object') {
                  const firstKey = Object.keys(data)[0]
                  const feature = Array.isArray(data[firstKey])
                    ? data[firstKey][0]
                    : data[firstKey]
                  if (feature && typeof feature === 'object') {
                    Object.assign(props, feature)
                  }
                }
                if (features[0].description) {
                  props._description = features[0].description
                }
                if (Object.keys(props).length > 0) {
                  // 固定飞行高度，避免每次点击不断放大
                  const currentHeight = viewer.camera.positionCartographic.height
                  const fixedHeight = Math.max(currentHeight, 3000)
                  viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, fixedHeight),
                    orientation: {
                      heading: viewer.camera.heading,
                      pitch: viewer.camera.pitch,
                      roll: viewer.camera.roll,
                    },
                    duration: 0.8,
                  })
                  onFeaturePick(props)
                  return
                }
              }
            }
          }
        } catch (e) {
          console.warn('[MvtPick] MVT pickFeatures 异常:', e)
        }
      }

      // 2. 散点拾取
      if (onScatterPick) {
        const pickedObject = viewer.scene.pick(movement.position)
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          onScatterPick(pickedObject.id)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /** 清理点击事件 */
  function dispose() {
    if (handler) {
      handler.destroy()
      handler = null
    }
  }

  onBeforeUnmount(() => dispose())

  return { setup, dispose }
}
