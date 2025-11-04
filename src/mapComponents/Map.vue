<template>
  <div class="map-container">
    <vc-viewer ref="cesiumViewer"  :sceneMode="2" :base-layer="baseLayer || false" @ready="onViewerReady">
      <!-- 天地图影像 -->
      <vc-layer-imagery>
        <vc-imagery-provider-tianditu map-style="img_c" :token="tiandituToken" @readyPromise="() => {
          console.log('Tianditu Img Ready', this)
          baseLayer = this
        }" @errorEvent="console.log('Tianditu Img Error', this)" />
      </vc-layer-imagery>
    </vc-viewer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { VcImageryProvider } from 'vue-cesium/lib/utils/types.js'

// Cesium Viewer引用
const cesiumViewer = ref(null)

// 从环境变量获取天地图token
const tiandituToken = import.meta.env ? import.meta.env.VITE_TIANDITU_KEY || '' : ''

// 控制图层显示
const showTiandituImg = ref(true)
const showTiandituVec = ref(true)
const baseLayer = ref(null);
/**
 * Viewer准备就绪回调
 */
function onViewerReady() {
  console.log('Cesium Viewer准备就绪')
  console.log('天地图Token:', tiandituToken)
  // 可以在这里进行一些初始化操作
}

/**
 * 组件挂载
 */
onMounted(() => {
  console.log('地图组件挂载完成')
})

/**
 * 组件卸载前
 */
onBeforeUnmount(() => {
  console.log('地图组件即将卸载')
})

// 导出方法供父组件调用
defineExpose({
  cesiumViewer
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Cesium Viewer样式 */
:deep(.cesium-viewer) {
  width: 100% !important;
  height: 100% !important;
}
</style>