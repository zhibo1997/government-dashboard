<template>
  <div class="background-container">
    <img 
      src="../assets/page_5.png" 
      alt="Dashboard Background" 
      class="background-image"
      @load="onImageLoad"
      @error="onImageError"
    />
    <div class="overlay"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 图片加载状态
const imageLoaded = ref(false)
const imageError = ref(false)

// 图片加载成功
function onImageLoad() {
  imageLoaded.value = true
  console.log('背景图片加载成功')
}

// 图片加载失败
function onImageError() {
  imageError.value = true
  console.error('背景图片加载失败')
}

// 暴露状态供父组件使用
defineExpose({
  imageLoaded,
  imageError
})
</script>

<style scoped>
.background-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none; /* 实现交互穿透 */
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: opacity 0.3s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 2;
}

</style>