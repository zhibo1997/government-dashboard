<template>
  <div 
    v-if="visible"
    class="measure-tool-panel"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="handleDragStart"
  >
    <div class="panel-header">
      <span class="panel-title">测量工具</span>
      <close-outlined class="close-icon" @click.stop="handleClose" />
    </div>
    <div class="measure-toolbar">
      <div 
        class="measure-tool-item"
        :class="{ active: activeTool === 'distance' }"
        @click.stop="toggleTool('distance')"
        title="距离"
      >
        <line-chart-outlined class="tool-icon-svg" />
        <span class="tool-label">距离</span>
      </div>
      <div 
        class="measure-tool-item"
        :class="{ active: activeTool === 'area' }"
        @click.stop="toggleTool('area')"
        title="面积"
      >
        <area-chart-outlined class="tool-icon-svg" />
        <span class="tool-label">面积</span>
      </div>
      <div 
        class="measure-tool-item clear"
        @click.stop="handleClear"
        title="清除"
      >
        <delete-outlined class="tool-icon-svg" />
        <span class="tool-label">清除</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LineChartOutlined, AreaChartOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons-vue'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'toggle-distance'): void
  (e: 'toggle-area'): void
  (e: 'clear'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 拖拽相关
const position = ref({ x: 100, y: 100 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 当前激活的工具
const activeTool = ref<'distance' | 'area' | null>(null)

// 开始拖拽
const handleDragStart = (e: MouseEvent) => {
  // 只有点击头部才能拖拽
  if (!(e.target as HTMLElement).closest('.panel-header')) {
    return
  }

  isDragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

// 拖拽移动
const handleDragMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  position.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  }
}

// 结束拖拽
const handleDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

// 切换工具
const toggleTool = (tool: 'distance' | 'area') => {
  if (activeTool.value === tool) {
    activeTool.value = null
  } else {
    activeTool.value = tool
  }

  if (tool === 'distance') {
    emit('toggle-distance')
  } else {
    emit('toggle-area')
  }
}

// 清除测量
const handleClear = () => {
  activeTool.value = null
  emit('clear')
}

// 关闭面板
const handleClose = () => {
  activeTool.value = null
  emit('update:visible', false)
}

// 暴露方法
defineExpose({
  activeTool,
  setActiveTool: (tool: 'distance' | 'area' | null) => {
    activeTool.value = tool
  }
})
</script>

<style lang="scss" scoped>
.measure-tool-panel {
  position: fixed;
  min-width: 280px;
  background: rgba(0, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(22, 119, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 2000;
  cursor: move;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(22, 119, 255, 0.2);
    cursor: move;
    user-select: none;

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
    }

    .close-icon {
      font-size: 16px;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 4px;
      border-radius: 4px;

      &:hover {
        color: #1677ff;
        background: rgba(22, 119, 255, 0.1);
      }
    }
  }

  .measure-toolbar {
    display: flex;
    gap: 0;
    padding: 16px 20px;
    cursor: default;

    .measure-tool-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(22, 119, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:first-child {
        border-radius: 8px 0 0 8px;
        border-right: none;
      }

      &:nth-child(2) {
        border-right: none;
      }

      &:last-child {
        border-radius: 0 8px 8px 0;
      }

      &:hover {
        background: rgba(22, 119, 255, 0.15);
        border-color: rgba(22, 119, 255, 0.5);
        transform: translateY(-2px);
      }

      &.active {
        background: rgba(22, 119, 255, 0.25);
        border-color: #1677ff;
        
        .tool-label {
          color: #1677ff;
          font-weight: bold;
        }

        .tool-icon-svg {
          color: #1677ff;
        }
      }

      &.clear {
        border-color: rgba(255, 77, 79, 0.3);
        
        &:hover {
          background: rgba(255, 77, 79, 0.15);
          border-color: rgba(255, 77, 79, 0.6);
        }
        
        .tool-label {
          color: #ff4d4f;
        }

        .tool-icon-svg {
          color: #ff4d4f;
        }
      }

      .tool-icon-svg {
        font-size: 24px;
        color: #ffffff;
        transition: all 0.3s ease;
      }

      .tool-label {
        font-size: 14px;
        color: #ffffff;
        transition: all 0.3s ease;
      }
    }
  }
}
</style>
