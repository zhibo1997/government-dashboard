<template>
  <div class="multi-popup-container">
    <!-- 使用现有的 MonitoringPointPopup 组件渲染每个可见弹窗 -->
    <MonitoringPointPopup
      v-for="popup in visiblePopups"
      :key="popup.point.id"
      :visible="popup.visible"
      :point-data="popup.point"
      :position="popup.position"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, toRef } from 'vue'
import MonitoringPointPopup from './MonitoringPointPopup.vue'
import { useMultiPopupManager, type CollisionConfig, type PopupDisplayInfo } from '@/hook/useMultiPopupManager'
import type { EnhancedMonitoringPoint } from '@/hook/useMonitoringPoints'

const props = defineProps<{
  /** Cesium Viewer 实例 */
  viewer: any
  /** 监测点数据 */
  points: EnhancedMonitoringPoint[]
  /** 碰撞检测配置 */
  config?: Partial<CollisionConfig>
}>()

const emit = defineEmits<{
  /** 弹窗可见性变化事件 */
  (e: 'visibility-change', stats: { totalPoints: number; visiblePopups: number; hiddenPopups: number }): void
}>()

// 使用多弹窗管理 Hook
const {
  visiblePopups,
  stats,
  initViewer,
  setPoints,
  updateConfig,
  calculateVisiblePopups,
  setupCameraListener,
  cleanup
} = useMultiPopupManager(props.config)

// 相机监听清理函数
let cameraListenerCleanup: (() => void) | null = null

// 监听 viewer 变化
watch(
  () => props.viewer,
  (newViewer) => {
    if (newViewer) {
      initViewer(newViewer)
      
      // 设置相机监听
      if (cameraListenerCleanup) {
        cameraListenerCleanup()
      }
      cameraListenerCleanup = setupCameraListener()
      
      // 如果已有数据，立即计算
      if (props.points.length > 0) {
        setPoints(props.points)
      }
    }
  },
  { immediate: true }
)

// 监听 points 变化
watch(
  () => props.points,
  (newPoints) => {
    if (newPoints) {
      setPoints(newPoints)
    }
  },
  { deep: true }
)

// 监听 config 变化
watch(
  () => props.config,
  (newConfig) => {
    if (newConfig) {
      updateConfig(newConfig)
    }
  },
  { deep: true }
)

// 监听统计信息变化，触发事件
watch(
  stats,
  (newStats) => {
    emit('visibility-change', newStats)
  },
  { deep: true }
)

// 组件卸载时清理
onBeforeUnmount(() => {
  if (cameraListenerCleanup) {
    cameraListenerCleanup()
    cameraListenerCleanup = null
  }
  cleanup()
})

// 导出方法供父组件调用
defineExpose({
  /** 强制重新计算弹窗可见性 */
  forceRecalculate: calculateVisiblePopups,
  /** 获取当前可见弹窗列表 */
  getVisiblePopups: () => visiblePopups.value,
  /** 获取统计信息 */
  getStats: () => stats.value,
  /** 更新碰撞检测配置 */
  updateConfig
})
</script>

<style scoped>
.multi-popup-container {
  /* 容器不占用空间，仅作为逻辑包装 */
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
