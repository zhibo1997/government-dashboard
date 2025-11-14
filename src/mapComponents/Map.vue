<template>
  <div class="map-container">
    <vc-viewer ref="cesiumViewer" :camera="camera" :sceneMode="2" @ready="onViewerReady">
      <!-- 天地图影像 -->
      <vc-layer-imagery>
        <vc-imagery-provider-tianditu map-style="vec_c" :token="tiandituToken" @readyPromise="() => {
          console.log('Tianditu Img Ready', this)
          baseLayer = this
        }" @errorEvent="console.log('Tianditu Img Error', this)" />
      </vc-layer-imagery>
      <vc-datasource-geojson :data="yangxinData"   stroke="red" />
    </vc-viewer>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { VcImageryProvider ,VcCamera} from 'vue-cesium/lib/utils/types.js'
import cesiumUtils from '../mapUtils/mapUtils'
import yangxinData from '../assets/yangxin.json'

// Cesium Viewer引用
const cesiumViewer = ref(null)

// 从环境变量获取天地图token
const tiandituToken = import.meta.env ? import.meta.env.VITE_TIANDITU_KEY || '' : ''

const baseLayer = ref(null);
const camera = ref<VcCamera | null>({
  position: [115.1, 29.841572, 200000],
})

/**
 * Viewer准备就绪回调
 */
function onViewerReady({ Cesium ,viewer}: any) {
  cesiumUtils.loadMVTLayer('/clmap/style.json')
  
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