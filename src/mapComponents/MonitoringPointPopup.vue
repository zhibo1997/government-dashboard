<template>
  <div class="monitoring-point-popup" :style="popupStyle">
    <!-- 背景层 -->
    <div class="popup-bg"></div>

    <!-- 标题栏 - z-index 最高，不被内容遮挡 -->
    <div class="popup-header">
      <span class="popup-title">{{ deviceTypeName || '监测设备' }}</span>
      <span class="popup-close" @click="$emit('close')">
        <n-icon size="18" color="#11a7e2" :component="Close" />
      </span>
    </div>

    <!-- 内容区域 - 可滚动，z-index 低于标题 -->
    <div class="popup-content">
      <div class="popup-row">
        <span class="popup-label">监测时间：</span>
        <span class="popup-value">{{ formatTime(data?.monitoringTime) }}</span>
      </div>
      <div class="popup-row" v-for="(item, index) in displayData" :key="index">
        <span class="popup-label">{{ item.label }}：</span>
        <span class="popup-value">{{ item.value || '—' }} {{ item.unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { NIcon } from 'naive-ui'
import { Close } from '@vicons/ionicons5'
import type { ParsedMonitoringData, MonitoringMetric } from '@/utils/monitoringDataParser'

const props = defineProps<{
  data: ParsedMonitoringData | null
  position: { x: number; y: number }
}>()

defineEmits(['close'])

// 设备类型名称
const deviceTypeName = computed(() => {
  return props.data?.deviceTypeName || props.data?.deviceType || '监测设备'
})

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return '—'
  return time
}

// 展示的指标数据
const displayData = computed<MonitoringMetric[]>(() => {
  if (!props.data?.metrics) return []
  return props.data.metrics
})

// 弹窗位置样式
const popupStyle = computed<CSSProperties>(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
}))
</script>

<style scoped lang="scss">
// 背景图片比例 390:229
$bg-ratio-w: 390;
$bg-ratio-h: 229;

.monitoring-point-popup {
  position: fixed;
  z-index: 10000;
  // 宽高严格遵守背景图比例：width:height = 390:229
  width: 270px;
  height: calc(270px * #{$bg-ratio-h} / #{$bg-ratio-w}); // ≈ 159px
  pointer-events: auto;
  display: flex;
  flex-direction: column;

  .popup-bg {
    position: absolute;
    inset: 0;
    background-image: url('@/assets/img/points/gas-point-popup-bg.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 0;
  }

  .popup-header {
    position: relative;
    flex-shrink: 0;
    height: calc(100% * 6 / 45);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 2;

    .popup-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-caption);
      line-height: calc(var(--font-size-caption) * 1.3);
      color: #00d4ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: bold;
      position: relative;
      left: 16px;
    }

    .popup-close {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 1px;
      transition: opacity 0.2s;
      &:hover {
        opacity: 0.7;
      }
    }
  }

  .popup-content {
    flex: 1;
    min-height: 0;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    z-index: 1;

    &::-webkit-scrollbar {
      width: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.3);
      border-radius: 1px;
    }
  }

  .popup-row {
    display: flex;
    align-items: center;
    white-space: nowrap;

    .popup-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-size: var(--font-size-heading);
      line-height: calc(var(--font-size-caption) * 1.3);
      color: #8ec5e8;
      flex-shrink: 0;
    }

    .popup-value {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-size: var(--font-size-heading);
      line-height: calc(var(--font-size-caption) * 1.3);
      color: #00ffff;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
