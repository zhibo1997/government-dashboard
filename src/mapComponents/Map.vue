<template>
  <div class="map-container">
    <vc-viewer ref="cesiumViewer" :selectionIndicator="false" :camera="camera" :infoBox="false" :sceneMode="sceneMode" :accessToken="defaultAccessToken" :requestRenderMode="true"
      :maximumRenderTimeChange="Infinity" @ready="onViewerReady">
      <!-- 底图切换 (天地图 + Cesium Ion混合) -->
      <vc-layer-imagery ref="basemapLayer">
        <!-- 天地图底图 (影像/矢量) -->
        <vc-imagery-provider-tianditu
          :map-style="tiandituMapStyle"
          :token="tiandituToken"
          @readyPromise="onTiandituReady"
          @errorEvent="onTiandituError"
        />
        <!-- Cesium Ion底图 (地形) -->
        <!-- <vc-imagery-provider-ion
          :assetId="cesiumIonAssetId"
          :accessToken="defaultAccessToken"
        /> -->
      </vc-layer-imagery>

      <!-- 阳新县行政区域边界 -->
      <vc-datasource-geojson
        ref="yangxinBoundary"
        :data="yangxinGeoJSON"
        :show="true"
        :fill="'rgba(255, 255, 255, 0.1)'"
        :enableMouseEvent="false"
      >
      </vc-datasource-geojson>

      <!-- 默认3D Tiles图层 -->
      <vc-primitive-tileset
        ref="defaultTileset"
        :url="default3DTilesUrl"
        :show="defaultTilesetVisible"
        @ready="on3DTilesReady"
      >
      </vc-primitive-tileset>

      <!-- 莲花湖大桥 -->
      <vc-primitive-tileset
        ref="lianhuahuBridge"
        url="http://webres.cityfun.com.cn/CSSMX/model/LHQ/tileset.json"
        :show="bridgeModelsVisible"
        @readyPromise="onBridgeTilesetReady('莲花湖大桥')"
      >
      </vc-primitive-tileset>

      <!-- 陵园大道立交桥 -->
      <vc-primitive-tileset
        ref="lingyuandadaoBridge"
        url="http://webres.cityfun.com.cn/CSSMX/model/LYDDLJQ/tileset.json"
        :show="bridgeModelsVisible"
        @ready="onBridgeTilesetReady('陵园大道立交桥')"
      >
      </vc-primitive-tileset>

      <!-- 明月湾大桥 -->
      <vc-primitive-tileset
        ref="mingyuewanBridge"
        url="http://webres.cityfun.com.cn/CSSMX/model/MYWDQ/tileset.json"
        :show="bridgeModelsVisible"
        @ready="onBridgeTilesetReady('明月湾大桥')"
      >
      </vc-primitive-tileset>

      <!-- VcMeasurements 组件 (隐藏默认UI,仅使用功能) -->
      <vc-measurements ref="measurementsRef" :main-fab-opts="mainFabOpts" :measurements="['polyline', 'area']"
        :editable="true" @active-evt="handleMeasureActiveEvt" @draw-evt="handleMeasureDrawEvt" />

      <!-- 地图工具栏 (作为 vc-viewer 的子组件) -->
    </vc-viewer>
    <ResponsiveWrapper>
      <MapToolbar ref="toolbarRef" :viewer-instance="viewerInstance" :scene-mode="sceneMode"
        :current-base-map="currentBaseMapType" :compass-rotation="compassRotation"
        :bridge-models-visible="bridgeModelsVisible" :default-tileset-visible="defaultTilesetVisible"
        @update:scene-mode="handleSceneModeChange" @update:base-map="handleBaseMapChange" @reset-map="handleResetMap"
        @toggle-measure="showMeasureTool = !showMeasureTool"
        @toggle-bridge-models="toggleBridgeModels" @toggle-default-tileset="toggleDefaultTileset" />

      <!-- 测量工具面板 -->
      <MeasureTool v-model:visible="showMeasureTool" @toggle-distance="toggleDistance" @toggle-area="toggleArea"
        @clear="clearMeasurements" ref="measureToolRef" />
    </ResponsiveWrapper>
  </div>

</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { VcCamera ,VcColor} from 'vue-cesium/lib/utils/types.js'
import mapConfig from '@/config/mapConfig'
import MeasureTool from './MeasureTool.vue'
import MapToolbar from './MapToolbar.vue'

import { inject } from 'vue'
import ResponsiveWrapper from '@/components/ResponsiveWrapper.vue'
const defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1Njk0MWFkNy00NjAzLTRhYTAtYWM4Yi04YjM4Njg4M2IyMzEiLCJpZCI6Mjg1NTg3LCJpYXQiOjE3NDIzNTA2NDR9.tZ0ZoIsk2bMtMFtzNrO0WrRhS0VPfBhr0_78mtSYpMo';
// 定义组件名称以支持keep-alive
defineOptions({
  name: 'CesiumMap'
});

// 使用地图hooks

// 相机范围限制清理函数
let cameraBoundsCleanup: (() => void) | null = null

// 行政区域边界引用
const yangxinBoundary = ref(null)

// 默认3D Tiles引用
const defaultTileset = ref(null)

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

// 桥梁3D模型显示状态
const bridgeModelsVisible = ref(true)

// 默认3D Tiles显示状态
const defaultTilesetVisible = ref(false)

// 底图类型
const currentBaseMapType = ref<'vec' | 'img' | 'ter'>('img')

// 天地图 Token
const tiandituToken = import.meta.env ? import.meta.env.VITE_TIANDITU_KEY || '' : ''

// 天地图地图样式映射
const tiandituMapStyleMap: Record<'img' | 'vec' | 'ter', 'img_c' | 'vec_c' | 'ter_c'> = {
  'img': 'img_c',    // 影像地图
  'vec': 'vec_c',     // 矢量地图
  'ter': 'ter_c'     // 地形地图
}

// 当前天地图样式
const tiandituMapStyle = computed((): 'img_c' | 'vec_c' | 'ter_c' => {
  return tiandituMapStyleMap[currentBaseMapType.value as 'img' | 'vec']
})
const mapAssetId = {
  'img': 2,
  'vec': 4,
  'ter': 1
}
const cesiumIonAssetId=computed(() => {
  return mapAssetId[currentBaseMapType.value as 'vec' | 'img' | 'ter']
})
// 场景模式: 2=2D, 3=3D
const sceneMode = ref<2 | 3>(3)

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

// 阳新县行政区域GeoJSON数据
const yangxinGeoJSON = ref<any>(null)

// 默认3D Tiles URL
const default3DTilesUrl = 'https://webres.cityfun.com.cn/CSSMX/model/JC_JGZW_JZW_P/tileset.json'

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



// 如果 ResponsiveWrapper 提供了 scale（推荐）
const responsiveScale = inject('responsiveScale', ref(1))
/**
 * 加载阳新县行政区域数据
 */
async function loadYangxinBoundary() {
  try {
    const baseUrl = import.meta.env.BASE_URL;
    const response = await fetch(baseUrl+'yangxin.json')
    yangxinGeoJSON.value = await response.json()
    console.log('✅ 阳新县行政区域数据加载成功')
  } catch (error) {
    console.error('❌ 加载阳新县边界数据失败:', error)
  }
}

/**
 * 行政区域边界加载完成回调
 */
function onBoundaryReady({ Cesium, cesiumObject }: any) {
}

/**
 * 3D Tiles加载完成回调
 */
function on3DTilesReady({ Cesium, cesiumObject }: any) {
  console.log('✅ 默认3D Tiles图层加载完成')
  console.log('3D Tiles URL:', default3DTilesUrl)
  
  // 可以在这里设置3D Tiles的样式或其他属性
  // 例如：设置最大屏幕空间误差
  if (cesiumObject) {
    cesiumObject.maximumScreenSpaceError = 16
    console.log('3D Tiles配置已应用')
  }
}

/**
 * 桥梁3D Tiles加载完成回调
 */
function onBridgeTilesetReady(name: string) {
  return ({ Cesium, cesiumObject }: any) => {
    alert(`3D Tiles加载完成: ${name}`)
    console.log(`✅ ${name}3D模型加载完成`)
    if (cesiumObject) {
      cesiumObject.maximumScreenSpaceError = 16
    }
  }
}

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


  // 方式2：等待GeoJSON加载后基于实际边界限制（可选）
  console.log("🚀 ~ onViewerReady ~ yangxinGeoJSON.value:", yangxinGeoJSON.value)
  // if (yangxinGeoJSON.value) {
  //   const { buffer, smoothCorrection, minHeight, maxHeight } = mapConfig.cameraBounds
  //   cameraBoundsCleanup = restrictCameraBoundsByGeoJSON(viewer, yangxinGeoJSON.value, {
  //     buffer,
  //     smoothCorrection,
  //     minHeight,
  //     maxHeight
  //   })
  // }
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
 * 切换桥梁3D模型显示状态
 */
const toggleBridgeModels = () => {
  bridgeModelsVisible.value = !bridgeModelsVisible.value
  console.log(`✅ 桥梁3D模型${bridgeModelsVisible.value ? '显示' : '隐藏'}`)
}

/**
 * 切换默认3D Tiles显示状态
 */
const toggleDefaultTileset = () => {
  defaultTilesetVisible.value = !defaultTilesetVisible.value
  console.log(`✅ 默认3D Tiles${defaultTilesetVisible.value ? '显示' : '隐藏'}`)
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
  const typeNames = {
    'img': '影像',
    'vec': '矢量',
    'ter': '地形'
  }
  const providerInfo = type === 'ter' 
    ? '(Cesium Ion - Asset ID: 3)'
    : `(天地图 - ${type === 'img' ? '影像' : '矢量'})`
  console.log(`✅ 底图切换为: ${typeNames[type]} ${providerInfo}`)
}

/**
 * 天地图加载完成回调
 */
function onTiandituReady({ Cesium, cesiumObject }: any) {
  console.log(`✅ 天地图底图(${tiandituMapStyle.value})加载完成`)
}

/**
 * 天地图加载错误回调
 */
function onTiandituError(error: any) {
  console.error(`❌ 天地图加载失败: ${error?.message || error}`)
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
 * 组件挂载
 */
onMounted(() => {
  console.log('🗺️ 地图组件挂载完成')
  // 加载阳新县行政区域边界
  loadYangxinBoundary()
})

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

  // 清理相机范围限制
  if (cameraBoundsCleanup) {
    cameraBoundsCleanup()
    cameraBoundsCleanup = null
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
  defaultTileset,
  yangxinBoundary,
  bridgeModelsVisible,
  defaultTilesetVisible,
  toggleMeasureTool: () => { showMeasureTool.value = !showMeasureTool.value },
  toggleBridgeModels,
  toggleDefaultTileset,
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