<template>
  <div class="responsive-wrapper">
    <div 
      class="scale-content" 
      :style="{
        transform: `scale(${scaleRatio})`,
        transformOrigin: 'top left',
        width: `${actualBaseWidth}px`,
        height: `${actualBaseHeight}px`
      }"
    >
      <slot></slot>
    </div> 
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

// 定义props
const props = defineProps({
  // 基准宽度
  baseWidth: {
    type: Number,
    default: 4096
  },
  // 基准高度
  baseHeight: {
    type: Number,
    default: 1920
  },
  // 最小缩放比例
  minScale: {
    type: Number,
    default: 0.1
  },
  // 最大缩放比例
  maxScale: {
    type: Number,
    default: 3
  }
})

// 获取URL参数
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

// 获取缩放模式，优先从URL参数读取
function getScaleMode() {
  const styleParam = getUrlParam('showStyle')
  if (styleParam && ['width', 'height'].includes(styleParam)) {
    return styleParam
  }
  return 'width' // 默认值
}

// 当前缩放模式
const currentScaleMode = ref(getScaleMode())

// 缩放比例
const scaleRatio = ref(1)

// 计算实际使用的基准尺寸
const actualBaseWidth = computed(() => props.baseWidth)
const actualBaseHeight = computed(() => props.baseHeight)

// 计算缩放比例和尺寸
function calculateResponsive() {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  let scale = 1
  
  if (currentScaleMode.value === 'width') {
    // 按宽度缩放：屏幕宽度 / 基准宽度
    scale = windowWidth / actualBaseWidth.value
  } else if (currentScaleMode.value === 'height') {
    // 按高度缩放：屏幕高度 / 基准高度
    scale = windowHeight / actualBaseHeight.value
  }
  
  // 限制缩放比例在指定范围内
  scale = Math.max(props.minScale, Math.min(props.maxScale, scale))
  
  scaleRatio.value = scale
  
  console.log('缩放计算:', {
    mode: currentScaleMode.value,
    windowSize: `${windowWidth}x${windowHeight}`,
    baseSize: `${actualBaseWidth.value}x${actualBaseHeight.value}`,
    scale: scale
  })
}

// 监听URL参数变化
function watchUrlParams() {
  const newMode = getScaleMode()
  if (newMode !== currentScaleMode.value) {
    currentScaleMode.value = newMode
    calculateResponsive()
  }
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
  
  // 监听URL变化
  const observer = new MutationObserver(watchUrlParams)
  observer.observe(document, { subtree: true, childList: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedCalculate)
})

// 暴露响应式数据供父组件使用
defineExpose({
  scaleRatio,
  currentScaleMode
})
</script>

<style scoped>
.responsive-wrapper {
  overflow-x: auto;
  position: relative;
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
  position: relative;
  transform-origin: top left;
  will-change: transform;
  display: inline-block;
}
</style>