/**
 * 多弹窗碰撞检测管理 Hook
 * @description 实现智能弹窗展示算法，避免弹窗重叠显示
 */

import { ref, computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type { EnhancedMonitoringPoint } from '@/hook/useMonitoringPoints'

/**
 * 弹窗矩形信息
 */
export interface PopupRect {
  x: number       // 左上角 x 坐标
  y: number       // 左上角 y 坐标
  width: number   // 宽度
  height: number  // 高度
}

/**
 * 弹窗展示信息
 */
export interface PopupDisplayInfo {
  point: EnhancedMonitoringPoint  // 监测点数据
  position: { x: number; y: number }  // 屏幕坐标（点位位置）
  rect: PopupRect  // 弹窗矩形（用于碰撞检测）
  visible: boolean  // 是否可见
}

/**
 * 碰撞检测配置
 */
export interface CollisionConfig {
  /** 长度方向容忍度（水平方向额外间距）
   * - 正数：要求弹窗间保持该距离
   * - 0：弹窗刚好不重叠
   * - 负数：允许弹窗重叠该距离
   */
  lengthTolerance: number
  /** 宽度方向容忍度（垂直方向额外间距）
   * - 正数：要求弹窗间保持该距离
   * - 0：弹窗刚好不重叠
   * - 负数：允许弹窗重叠该距离
   */
  widthTolerance: number
  /** 弹窗默认宽度 */
  popupWidth: number
  /** 弹窗默认高度 */
  popupHeight: number
  /** 弹窗相对于点位的垂直偏移 */
  popupOffsetY: number
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: CollisionConfig = {
  lengthTolerance: 10,  // 水平间距容忍度
  widthTolerance: 10,   // 垂直间距容忍度
  popupWidth: 180,      // 弹窗宽度（与 MonitoringPointPopup.vue 中一致）
  popupHeight: 80,      // 弹窗高度
  popupOffsetY: 0       // 弹窗在点位上方
}

/**
 * 检测两个矩形是否重叠
 * @param rect1 矩形1
 * @param rect2 矩形2
 * @param lengthTolerance 水平方向容忍度（正数=要求间距，负数=允许重叠）
 * @param widthTolerance 垂直方向容忍度（正数=要求间距，负数=允许重叠）
 * @returns 是否重叠
 */
function isRectOverlap(
  rect1: PopupRect,
  rect2: PopupRect,
  lengthTolerance: number = 0,
  widthTolerance: number = 0
): boolean {
  // 根据容忍度调整矩形1的边界
  // 正数：扩展边界（要求更大间距）
  // 负数：收缩边界（允许部分重叠）
  const r1Left = rect1.x - lengthTolerance
  const r1Right = rect1.x + rect1.width + lengthTolerance
  const r1Top = rect1.y - widthTolerance
  const r1Bottom = rect1.y + rect1.height + widthTolerance

  // 矩形2的边界
  const r2Left = rect2.x
  const r2Right = rect2.x + rect2.width
  const r2Top = rect2.y
  const r2Bottom = rect2.y + rect2.height

  // 矩形分离条件（任一条件成立则不重叠）
  const separated = r1Right < r2Left ||  // rect1 在 rect2 左边
                    r2Right < r1Left ||  // rect2 在 rect1 左边
                    r1Bottom < r2Top ||  // rect1 在 rect2 上边
                    r2Bottom < r1Top     // rect2 在 rect1 上边

  return !separated
}

/**
 * 计算弹窗的矩形区域
 * @param screenX 点位屏幕 x 坐标
 * @param screenY 点位屏幕 y 坐标
 * @param config 配置
 * @returns 弹窗矩形
 */
function calculatePopupRect(
  screenX: number,
  screenY: number,
  config: CollisionConfig
): PopupRect {
  const { popupWidth, popupHeight, popupOffsetY } = config
  
  // 弹窗中心对齐点位，显示在点位上方
  const x = screenX - popupWidth / 2
  const y = screenY - popupHeight - popupOffsetY
  
  return {
    x,
    y,
    width: popupWidth,
    height: popupHeight
  }
}

/**
 * 检查点位是否在视口内
 * @param screenX 屏幕 x 坐标
 * @param screenY 屏幕 y 坐标
 * @param viewportWidth 视口宽度
 * @param viewportHeight 视口高度
 * @param padding 边界内边距
 */
function isInViewport(
  screenX: number,
  screenY: number,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 50
): boolean {
  return screenX >= padding &&
         screenX <= viewportWidth - padding &&
         screenY >= padding &&
         screenY <= viewportHeight - padding
}

/**
 * 多弹窗管理 Hook
 */
export function useMultiPopupManager(config: Partial<CollisionConfig> = {}) {
  // 合并配置
  const mergedConfig = ref<CollisionConfig>({
    ...DEFAULT_CONFIG,
    ...config
  })

  // Cesium Viewer 引用
  const viewer: ShallowRef<any> = shallowRef(null)

  // 所有监测点数据
  const allPoints: Ref<EnhancedMonitoringPoint[]> = ref([])

  // 可见的弹窗列表（经过碰撞检测筛选后）
  const visiblePopups: Ref<PopupDisplayInfo[]> = ref([])

  // 上一次计算时的视口状态（用于判断是否需要重新计算）
  let lastViewportState = {
    cameraPosition: null as any,
    viewportWidth: 0,
    viewportHeight: 0
  }

  // 是否正在计算中
  const isCalculating = ref(false)

  // 统计信息
  const stats = computed(() => ({
    totalPoints: allPoints.value.length,
    visiblePopups: visiblePopups.value.length,
    hiddenPopups: allPoints.value.length - visiblePopups.value.length
  }))

  /**
   * 初始化 Viewer
   */
  function initViewer(cesiumViewer: any): void {
    viewer.value = cesiumViewer
    console.log('✅ 多弹窗管理器已初始化')
  }

  /**
   * 设置监测点数据
   */
  function setPoints(points: EnhancedMonitoringPoint[]): void {
    allPoints.value = points
    // 数据变化时重新计算
    calculateVisiblePopups()
  }

  /**
   * 更新配置
   */
  function updateConfig(newConfig: Partial<CollisionConfig>): void {
    mergedConfig.value = {
      ...mergedConfig.value,
      ...newConfig
    }
    // 配置变化时重新计算
    calculateVisiblePopups()
  }

  /**
   * 获取点位的屏幕坐标
   */
  function getScreenPosition(point: EnhancedMonitoringPoint): { x: number; y: number } | null {
    if (!viewer.value) return null

    const Cesium = (window as any).Cesium
    if (!Cesium) return null

    const cartesian = Cesium.Cartesian3.fromDegrees(point.jdxx, point.wdxx)
    const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.value.scene,
      cartesian
    )

    return screenPosition || null
  }

  /**
   * 贪心算法计算可见弹窗
   * 按原始顺序尝试放置弹窗，如果与已放置的弹窗重叠则跳过
   */
  function calculateVisiblePopups(): void {
    if (!viewer.value || allPoints.value.length === 0) {
      visiblePopups.value = []
      return
    }

    if (isCalculating.value) return
    isCalculating.value = true

    try {
      const { lengthTolerance, widthTolerance } = mergedConfig.value
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // 已放置的弹窗矩形列表
      const placedRects: PopupRect[] = []
      const result: PopupDisplayInfo[] = []

      // 按原始顺序遍历所有点位
      for (const point of allPoints.value) {
        // 获取屏幕坐标
        const screenPos = getScreenPosition(point)
        if (!screenPos) continue

        // 检查点位是否在视口内
        if (!isInViewport(screenPos.x, screenPos.y, viewportWidth, viewportHeight)) {
          continue
        }

        // 计算弹窗矩形
        const popupRect = calculatePopupRect(
          screenPos.x,
          screenPos.y,
          mergedConfig.value
        )

        // 检查弹窗是否在视口内（至少部分可见）
        if (popupRect.x + popupRect.width < 0 ||
            popupRect.x > viewportWidth ||
            popupRect.y + popupRect.height < 0 ||
            popupRect.y > viewportHeight) {
          continue
        }

        // 检查是否与已放置的弹窗重叠
        let hasCollision = false
        for (const placedRect of placedRects) {
          if (isRectOverlap(popupRect, placedRect, lengthTolerance, widthTolerance)) {
            hasCollision = true
            break
          }
        }

        // 如果没有碰撞，添加到结果中
        if (!hasCollision) {
          placedRects.push(popupRect)
          result.push({
            point,
            position: screenPos,
            rect: popupRect,
            visible: true
          })
        }
      }

      visiblePopups.value = result
      console.log(`📍 弹窗计算完成: ${result.length}/${allPoints.value.length} 个弹窗可见`)
    } finally {
      isCalculating.value = false
    }
  }

  /**
   * 更新弹窗位置（地图移动/缩放时调用）
   * 只更新位置，不重新计算可见性
   */
  function updatePopupPositions(): void {
    if (!viewer.value || visiblePopups.value.length === 0) return

    const updatedPopups = visiblePopups.value.map(popup => {
      const newPos = getScreenPosition(popup.point)
      if (newPos) {
        const newRect = calculatePopupRect(
          newPos.x,
          newPos.y,
          mergedConfig.value
        )
        return {
          ...popup,
          position: newPos,
          rect: newRect
        }
      }
      return popup
    })

    visiblePopups.value = updatedPopups
  }

  /**
   * 检查是否需要重新计算（视口变化较大时）
   * 注意：缩放操作不触发重新计算
   */
  function checkNeedRecalculate(): boolean {
    if (!viewer.value) return false

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 检查视口尺寸是否变化
    if (viewportWidth !== lastViewportState.viewportWidth ||
        viewportHeight !== lastViewportState.viewportHeight) {
      lastViewportState.viewportWidth = viewportWidth
      lastViewportState.viewportHeight = viewportHeight
      return true
    }

    return false
  }

  /**
   * 设置相机变化监听（用于更新弹窗位置）
   */
  function setupCameraListener(): () => void {
    if (!viewer.value) return () => {}

    const removeListener = viewer.value.scene.preRender.addEventListener(() => {
      // 只更新位置，不重新计算可见性
      updatePopupPositions()
    })

    return () => {
      if (viewer.value) {
        viewer.value.scene.preRender.removeEventListener(removeListener)
      }
    }
  }

  /**
   * 强制重新计算可见弹窗
   */
  function forceRecalculate(): void {
    calculateVisiblePopups()
  }

  /**
   * 清理资源
   */
  function cleanup(): void {
    visiblePopups.value = []
    allPoints.value = []
    viewer.value = null
    console.log('🗑️ 多弹窗管理器资源已清理')
  }

  return {
    // 状态
    visiblePopups,
    allPoints,
    isCalculating,
    stats,
    config: mergedConfig,

    // 方法
    initViewer,
    setPoints,
    updateConfig,
    calculateVisiblePopups,
    updatePopupPositions,
    forceRecalculate,
    setupCameraListener,
    cleanup,

    // 工具函数（导出用于测试）
    isRectOverlap,
    calculatePopupRect,
    isInViewport
  }
}

export default useMultiPopupManager
