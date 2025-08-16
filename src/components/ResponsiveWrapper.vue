<template>
  <div class="responsive-wrapper">
    <div 
      class="scale-content" 
      :style="{
        transform: `scale(${scaleRatio})`,
        transformOrigin: 'top left'
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 基准尺寸
const BASE_WIDTH = 4000
const BASE_HEIGHT = 1125

// 缩放比例
const scaleRatio = ref(1)

// 计算缩放比例和尺寸
function calculateResponsive() {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  // 按高度计算缩放比例
  const scale = windowWidth / BASE_WIDTH
  scaleRatio.value = scale
}

// 防抖处理
function debounce(func, wait) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

const debouncedCalculate = debounce(calculateResponsive, 100)

onMounted(() => {
  calculateResponsive()
  window.addEventListener('resize', debouncedCalculate)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedCalculate)
})

// 暴露响应式数据供父组件使用
defineExpose({
  scaleRatio
})
</script>

<style scoped>
.responsive-wrapper {
  width: 100vw;
  height: 100vh;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  background: #0a0a0a;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

/* 外层滚动条样式优化 */
.responsive-wrapper::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.responsive-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.responsive-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, rgba(22, 119, 255, 0.4), rgba(22, 119, 255, 0.6));
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.responsive-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, rgba(22, 119, 255, 0.6), rgba(22, 119, 255, 0.8));
  transform: scale(1.1);
}

.responsive-wrapper::-webkit-scrollbar-corner {
  background: rgba(0, 0, 0, 0.2);
}

/* Firefox 外层滚动条样式 */
.responsive-wrapper {
  scrollbar-width: auto;
  scrollbar-color: rgba(22, 119, 255, 0.5) rgba(0, 0, 0, 0.2);
}

.scale-content {
  width: 4000px;
  height: 1125px;
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  will-change: transform;
}
</style>