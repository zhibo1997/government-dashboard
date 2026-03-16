<template>
  <div class="responsive-wrapper">
    <div class="scale-content" :style="{
      transform: `scale(${scaleRatio})`,
      transformOrigin: 'top left',
      width: `${actualBaseWidth}px`,
      height: `${actualBaseHeight}px`
    }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, provide } from 'vue'

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

// 获取URL参数（支持hash路由）
function getUrlParam(name) {
  // 先尝试从 search 获取
  let urlParams = new URLSearchParams(window.location.search)
  let value = urlParams.get(name)
  if (value !== null) return value

  // 再从 hash 中获取
  const hash = window.location.hash
  const hashQueryIndex = hash.indexOf('?')
  if (hashQueryIndex !== -1) {
    urlParams = new URLSearchParams(hash.slice(hashQueryIndex + 1))
    value = urlParams.get(name)
  }
  return value
}

// 检查是否启用缩放（URL中是否有showStyle参数，开发环境默认启用）
function shouldEnableScale() {
  // 开发环境默认启用缩放
  // if (import.meta.env.DEV) {
  //   return true
  // }
  return getUrlParam('showStyle') !== null
}

// 获取缩放模式，优先从URL参数读取
function getScaleMode() {
  const styleParam = getUrlParam('showStyle')
  if (styleParam && ['width', 'height'].includes(styleParam)) {
    return styleParam
  }
  return 'width' // 默认值
}

// 是否启用缩放
const enableScale = ref(shouldEnableScale())
// 当前缩放模式
const currentScaleMode = ref(getScaleMode())

// 缩放比例
const scaleRatio = ref(1)

// 计算实际使用的基准尺寸
const actualBaseWidth = computed(() => props.baseWidth)
const actualBaseHeight = computed(() => props.baseHeight)

// 计算缩放比例和尺寸
function calculateResponsive() {
  // 如果没有 showStyle 参数，不进行缩放
  if (!enableScale.value) {
    scaleRatio.value = 1
    return
  }

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
  const newEnableScale = shouldEnableScale()
  const newMode = getScaleMode()

  if (newEnableScale !== enableScale.value || newMode !== currentScaleMode.value) {
    enableScale.value = newEnableScale
    currentScaleMode.value = newMode
    calculateResponsive()
  }
}

// 防抖处理
function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

const debouncedCalculate = debounce(calculateResponsive, 100)

// 提供scaleRatio给子组件使用
provide('responsiveScale', scaleRatio)

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
  currentScaleMode,
  enableScale
})
</script>

<style scoped>
.responsive-wrapper {
  overflow-x: auto;
  position: relative;
  z-index: 10;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
}

/* 为需要交互的特定元素恢复鼠标事件 */
.responsive-wrapper :deep(.header),
.responsive-wrapper :deep(.left-content),
.responsive-wrapper :deep(.right-content),
.responsive-wrapper :deep(.map-toolbar),
.responsive-wrapper :deep(.sidebar-module),
.responsive-wrapper :deep(.login-card) {
  pointer-events: auto;
}

/* container 不设置 pointer-events，让中间区域可以穿透到地图 */

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

.responsive-wrapper :deep(.center-map) {
  transform: scale(1) !important;
  transform-origin: center center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>