<template>
  <Teleport to="body">
    <div v-if="visible && pointData" class="monitoring-popup" :style="popupStyle" @click.stop>
      <!-- 监测时间 -->
      <div class="popup-time">
        <ClockCircleOutlined />
        <span>{{ pointData.formattedTime }}</span>
      </div>

      <!-- 指标值列表 -->
      <div class="popup-values">
        <div v-for="item in pointData.parsedJcz" :key="item.code" class="value-item">
          <span class="value-label">{{ item.name }}：</span>
          <span class="value-number">{{ formatValue(item.value) }}</span>
          <span class="value-unit" v-if="item.unit">{{ item.unit }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClockCircleOutlined } from '@ant-design/icons-vue'
import type { EnhancedMonitoringPoint } from '@/hook/useMonitoringPoints'

const props = defineProps<{
  visible: boolean
  pointData: EnhancedMonitoringPoint | null
  position: { x: number; y: number }
}>()

// 弹窗位置样式
const popupStyle = computed(() => {
  const { x, y } = props.position
  const popupWidth = 180
  const popupHeight = 80
  const offset = 0
  const arrowWidth = 12 // 箭头总宽度（6px * 2）

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 理想位置：弹窗中心对齐点位
  let left = x - popupWidth / 2
  let top = y - popupHeight - offset
  
  // 记录点位的原始x坐标
  const pointX = x
  
  // 边界检测并调整left
  const minLeft = 10
  const maxLeft = viewportWidth - popupWidth - 10
  
  if (left < minLeft) {
    left = minLeft
  } else if (left > maxLeft) {
    left = maxLeft
  }

  // 如果上方空间不足，显示在下方
  if (top < 10) {
    top = y + offset
  }
  
  // 计算箭头相对于弹窗左边缘的偏移量（确保箭头指向点位）
  const arrowOffset = pointX - left - arrowWidth / 2

  return {
    left: `${left}px`,
    top: `${top}px`,
    '--arrow-offset': `${arrowOffset}px`
  }
})

// 格式化监测值
function formatValue(value: string | number): string {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return String(value)
}
</script>

<style scoped lang="scss">
.monitoring-popup {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  font-size: 12px;
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px;
  background: linear-gradient(30deg, rgb(255, 255, 255) 25%, rgb(249, 255, 252) 50%, rgb(227, 255, 240) 75%, rgb(179, 253, 214));

  // CSS箭头（动态定位到点位）
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-top: 8px solid #fff;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
  }
}

.popup-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #666;
  border-bottom: 1px solid #efefef;
  padding: 2px 6px;
}

.popup-values {
  display: flex;
  flex-direction: column;
  padding: 2px 6px 4px;
}

.value-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 10px;
  line-height: 1.2;

  .value-label {
    color: #666;
    white-space: nowrap;
  }

  .value-number {
    color: #1890ff;
    font-weight: 600;
    font-size: 12px;
    position: relative;
  }

  .value-unit {
    color: #999;
    font-size: 10px;
  }
}
</style>
