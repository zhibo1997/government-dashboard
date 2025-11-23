<template>
  <div class="map-container">
    <vc-viewer ref="cesiumViewer" :camera="camera" :sceneMode="sceneMode" :requestRenderMode="true"
      :maximumRenderTimeChange="Infinity" @ready="onViewerReady">
      <!-- 天地图底图 -->
      <vc-layer-imagery ref="basemapLayer">
        <vc-imagery-provider-tianditu 
          :map-style="currentMapStyle" 
          :token="tiandituToken" 
          @readyPromise="onTiandituReady" 
          @errorEvent="onTiandituError" 
        />
      </vc-layer-imagery>

      <!-- VcMeasurements 组件 (隐藏默认UI,仅使用功能) -->
      <vc-measurements ref="measurementsRef" :main-fab-opts="mainFabOpts" :measurements="['polyline', 'area']"
        :editable="true" @active-evt="handleMeasureActiveEvt" @draw-evt="handleMeasureDrawEvt" />

      <!-- 地图工具栏 (作为 vc-viewer 的子组件) -->
    </vc-viewer>
    <ResponsiveWrapper>
      <MapToolbar ref="toolbarRef" :viewer-instance="viewerInstance" :scene-mode="sceneMode"
        :current-base-map="currentBaseMapType" :compass-rotation="compassRotation"
        @update:scene-mode="handleSceneModeChange" @update:base-map="handleBaseMapChange" @reset-map="handleResetMap"
        @toggle-measure="showMeasureTool = !showMeasureTool" />

      <!-- 测量工具面板 -->
      <MeasureTool v-model:visible="showMeasureTool" @toggle-distance="toggleDistance" @toggle-area="toggleArea"
        @clear="clearMeasurements" ref="measureToolRef" />
    </ResponsiveWrapper>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { VcCamera } from 'vue-cesium/lib/utils/types.js'
import cesiumUtils from '../mapUtils/mapUtils'
import { geoServerWFS } from '../services/wfsService'
import mapConfig from '@/config/mapConfig'
import MeasureTool from './MeasureTool.vue'
import MapToolbar from './MapToolbar.vue'

import { inject } from 'vue'
import ResponsiveWrapper from '@/components/ResponsiveWrapper.vue'
// 定义组件名称以支持keep-alive
defineOptions({
  name: 'CesiumMap'
});

// Cesium Viewer引用
const cesiumViewer = ref(null)
const viewerInstance = ref<any>(null)
const basemapLayer = ref(null)

// 工具栏引用
const toolbarRef = ref<any>(null)

// 测量工具引用
const measurementsRef = ref<any>(null)
const measureToolRef = ref<any>(null)
const showMeasureTool = ref(false)

// VcMeasurements 配置
const mainFabOpts = {
  modelValue: false
}

// 从环境变量获取天地图token
// const tiandituToken = import.meta.env ? import.meta.env.VITE_TIANDITU_KEY || '' : ''
const tiandituToken = '301000118c7a8ef7a3897a037689c5ea'

// 底图类型
const currentBaseMapType = ref<'vec' | 'img' | 'ter'>('vec')

// 场景模式: 2=2D, 3=3D
const sceneMode = ref(2)

// 指北针旋转角度
const compassRotation = ref(0)

// 初始相机位置
const camera = ref<VcCamera | null>({
  position: [mapConfig.center[0], mapConfig.center[1], 50000],
})

// 当前选中的要素
const selectedFeature = ref<any>(null)

// MVT图层实例
const mvtProvider = ref<any>(null)

// 点击查询清理函数
let clickQueryCleanup: (() => void) | null = null

// 切换距离测量
const toggleDistance = () => {
  if (!measurementsRef.value) {
    return
  }
  measurementsRef.value.toggleAction('polyline')
  console.log('✅ 切换距离测量')
}

// 切换面积测量
const toggleArea = () => {
  if (!measurementsRef.value) {
    console.warn('⚠️ VcMeasurements 组件未就绪')
    return
  }
  measurementsRef.value.toggleAction('area')
  console.log('✅ 切换面积测量')
}

// 清除所有测量
const clearMeasurements = () => {
  if (!measurementsRef.value) {
    console.warn('⚠️ VcMeasurements 组件未就绪')
    return
  }
  measurementsRef.value.clearAll()
  console.log('🗑️ 清除所有测量结果')
}

// 处理测量激活事件
const handleMeasureActiveEvt = (e: any) => {
  console.log('测量工具激活状态:', e)
  // 同步更新面板中的激活状态
  if (measureToolRef.value) {
    if (!e.isActive) {
      measureToolRef.value.setActiveTool(null)
    }
  }
}

// 处理测量绘制事件
const handleMeasureDrawEvt = (e: any) => {
  console.log('测量绘制事件:', e)
  if (e.finished) {
    console.log('✅ 测量完成')
  }
}

// 计算天地图样式字符串
const currentMapStyle = computed(() => {
  const styleMap: Record<string, string> = {
    'vec': 'vec_c',  // 矢量+中文标注
    'img': 'img_c',  // 影像+中文标注
    'ter': 'ter_c'   // 地形+中文标注
  }
  return styleMap[currentBaseMapType.value] as any
})

// 如果 ResponsiveWrapper 提供了 scale（推荐）
const responsiveScale = inject('responsiveScale', ref(1))
/**
 * Viewer准备就绪回调
 */
async function onViewerReady({ Cesium, viewer }: any) {
  viewerInstance.value = viewer
  console.log('✅ Cesium Viewer已准备就绪')

  // 性能优化设置
  optimizeCesiumPerformance(viewer, Cesium)

  // 监听相机变化更新指北针
  viewer.camera.changed.addEventListener(() => {
    compassRotation.value = Cesium.Math.toDegrees(viewer.camera.heading)
  })
}
/**
 * 优化Cesium性能
 */
function optimizeCesiumPerformance(viewer: any, Cesium: any) {
  // 关闭不必要的渲染
  viewer.scene.globe.enableLighting = false
  viewer.scene.fog.enabled = false
  viewer.scene.skyAtmosphere.show = false

  // 降低地形细节
  viewer.scene.globe.maximumScreenSpaceError = 2

  // 优化渲染性能
  viewer.scene.requestRenderMode = true
  viewer.scene.maximumRenderTimeChange = Infinity

  // 禁用阴影
  viewer.shadows = false

  console.log('Cesium性能优化已应用')
}

/**
 * 处理要素点击事件
 */
function handleFeatureClick(feature: any) {
  selectedFeature.value = feature

  console.log('📋 要素点击事件:', {
    id: feature.id,
    properties: feature.properties,
    geometry: feature.geometry
  })

  // TODO: 显示信息窗口或弹窗
  // 可以在这里触发Vue事件，传递给父组件
}

/**
 * 天地图加载成功
 */
function onTiandituReady() {
  console.log('✅ 天地图底图加载成功')
}

/**
 * 天地图加载失败
 */
function onTiandituError(error: any) {
  console.error('❌ 天地图底图加载失败:', error)
  console.error('请检查天地图Token是否配置正确')
}

/**
 * 处理场景模式变化 (来自工具栏)
 */
const handleSceneModeChange = (mode: 2 | 3) => {
  if (!viewerInstance.value) return

  sceneMode.value = mode
  const Cesium = (window as any).Cesium

  if (Cesium) {
    viewerInstance.value.scene.mode = mode === 3
      ? Cesium.SceneMode.SCENE3D
      : Cesium.SceneMode.SCENE2D
    console.log(`✅ 场景模式切换为: ${mode === 2 ? '2D' : '3D'}`)
  }
}

/**
 * 处理底图切换 (来自工具栏)
 */
const handleBaseMapChange = (type: 'vec' | 'img' | 'ter') => {
  currentBaseMapType.value = type
  console.log(`✅ 底图切换为: ${type}`)
}

/**
 * 处理地图重置 (来自工具栏)
 */
const handleResetMap = () => {
  if (!viewerInstance.value) return

  const Cesium = (window as any).Cesium
  if (Cesium) {
    viewerInstance.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        mapConfig.center[0],
        mapConfig.center[1],
        50000
      ),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 2,
    })
    console.log('✅ 地图已重置')
  }
}


/**
 * 组件卸载前
 */
onBeforeUnmount(() => {
  console.log('地图组件即将卸载')

  // 清理点击查询事件
  if (clickQueryCleanup) {
    clickQueryCleanup()
    clickQueryCleanup = null
  }
})

// 导出方法供父组件调用
defineExpose({
  cesiumViewer,
  viewerInstance,
  selectedFeature,
  mvtProvider,
  showMeasureTool,
  sceneMode,
  currentBaseMapType,
  compassRotation,
  toggleMeasureTool: () => { showMeasureTool.value = !showMeasureTool.value },
  toolbarRef,
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;

  .map-container {
    transform-style: preserve-3d;
    perspective: none;
    /* 确保地图不受父级transform影响 */
    position: relative;
    z-index: 1;
  }

  /* 确保Cesium Viewer不受缩放影响 */
  :deep(.cesium-viewer) {
    transform: scale(1) !important;
    transform-origin: center center;
  }
}

/* Cesium Viewer样式 */
:deep(.cesium-viewer) {
  width: 100% !important;
  height: 100% !important;
}
</style>