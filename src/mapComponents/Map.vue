<template>
  <div class="map-container">
    <vc-viewer ref="cesiumViewer" :selectionIndicator="false" :camera="camera" :infoBox="false" :sceneMode="sceneMode" :accessToken="defaultAccessToken" :requestRenderMode="true" :baseLayerPicker="false"
      :maximumRenderTimeChange="Infinity" @ready="onViewerReady">
      <!-- 底图切换 (天地图 + 自定义MVT矢量切片) -->
       
      <!-- 天地图底图 (影像/矢量/地形) -->
      <vc-layer-imagery ref="basemapLayer" :show="showTianditu" :sort-order="1">
        <vc-imagery-provider-tianditu
          :map-style="tiandituMapStyle"
          :token="tiandituToken"
          :maximum-level="17"
          @readyPromise="onTiandituReady"
          @errorEvent="onTiandituError"
        />
      </vc-layer-imagery>

      <!-- 注意：自定义MVT矢量切片使用 Cesium 原生命令式加载，在 handleBaseMapChange 中处理 -->

      <!-- 阳新县行政区域边界 -->
      <vc-datasource-geojson
        ref="yangxinBoundary"
        :data="yangxinGeoJSON"
        :show="true"
        :fill="'rgba(255, 255, 255, 0.05)'"
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

      <!-- VcMeasurements 组件 (隐藏默认UI,仅使用功能) -->
      <vc-measurements ref="measurementsRef" :main-fab-opts="mainFabOpts" :measurements="['polyline', 'area']"
        :editable="true" @active-evt="handleMeasureActiveEvt" @draw-evt="handleMeasureDrawEvt" />

      <!-- 地图工具栏 (作为 vc-viewer 的子组件) -->
    </vc-viewer>
    <ResponsiveWrapper>
      <MapToolbar ref="toolbarRef" :viewer-instance="viewerInstance" :scene-mode="sceneMode"
        :current-base-map="currentBaseMapType" :compass-rotation="compassRotation"
 :default-tileset-visible="defaultTilesetVisible"
        @update:scene-mode="handleSceneModeChange" @update:base-map="handleBaseMapChange" @reset-map="handleResetMap"
        @toggle-measure="showMeasureTool = !showMeasureTool"
        @toggle-default-tileset="toggleDefaultTileset"
        @equipment-activate="handleEquipmentActivate" />

      <!-- 测量工具面板 -->
      <MeasureTool v-model:visible="showMeasureTool" @toggle-distance="toggleDistance" @toggle-area="toggleArea"
        @clear="clearMeasurements" ref="measureToolRef" />

      <!-- 桥梁监测设备列表弹窗 -->
      <EquipmentDialog
        v-model:visible="equipmentDialogVisible"
        :bridge-data="equipmentBridgeData"
        dialog-left="860px"
        dialog-width="2380px"
        @equipment-view="handleEquipmentView"
      />
    </ResponsiveWrapper>

    <!-- 多弹窗容器（智能碰撞检测） -->
    <!-- <MultiPopupContainer
      ref="multiPopupRef"
      :viewer="viewerInstance"
      :points="monitoringPoints.enhancedData.value"
      :config="popupCollisionConfig"
      @visibility-change="handlePopupVisibilityChange"
    /> -->

    <!-- 单个点击弹窗（保留用于点击交互） -->
    <!-- <MonitoringPointPopup
      :visible="monitoringPoints.showPopup.value"
      :point-data="monitoringPoints.selectedPoint.value"
      :position="monitoringPoints.popupPosition.value"
      @close="monitoringPoints.closePopup"
      @fly-to="handleFlyToMonitoringPoint"
      @view-detail="handleViewMonitoringDetail"
    /> -->
  </div>

</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { VcCamera ,VcColor} from 'vue-cesium/lib/utils/types.js'
import mapConfig from '@/config/mapConfig'
import { DEFAULT_BUILDING_LAYER_ID } from '@/config/layerConfig'
import { useMapStore } from '@/stores/mapStore'
import MeasureTool from './MeasureTool.vue'
import MapToolbar from './MapToolbar.vue'
import EquipmentDialog from '@/views/BridgeModule/components/map/EquipmentDialog.vue'

import { inject } from 'vue'
import ResponsiveWrapper from '@/components/ResponsiveWrapper.vue'
import { useMonitoringPoints, type EnhancedMonitoringPoint } from '@/hook/useMonitoringPoints'
import { useMapHooks } from '@/hook/useMapHooks'
const defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1Njk0MWFkNy00NjAzLTRhYTAtYWM4Yi04YjM4Njg4M2IyMzEiLCJpZCI6Mjg1NTg3LCJpYXQiOjE3NDIzNTA2NDR9.tZ0ZoIsk2bMtMFtzNrO0WrRhS0VPfBhr0_78mtSYpMo';

// 使用地图Hooks（MVT矢量切片加载）
const { loadMVTLayer } = useMapHooks()

// 使用监测点位 Hook
const monitoringPoints = useMonitoringPoints()

// 弹窗碰撞配置接口
interface CollisionConfig {
  lengthTolerance: number
  widthTolerance: number
  popupWidth: number
  popupHeight: number
  popupOffsetY: number
}

// 定义组件名称以支持keep-alive
defineOptions({
  name: 'CesiumMap'
});

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

// scenetree 设备坐标数据（按 qlbh 缓存）
const scenetreeCache = ref<Record<string, Awaited<ReturnType<typeof loadScenetreeForBridge>>>>({})

// 桥梁设备弹窗状态
const equipmentDialogVisible = ref(false)
const equipmentBridgeData = ref<any>({})
const currentEquipUrl = ref('')

// 模仿 demo.html: 从 equipUrl 推导 scenetree.json，解析设备坐标
async function loadScenetreeForBridge(equipUrl: string) {
  if (!equipUrl) return []
  const Cesium = (window as any).Cesium
  if (!Cesium) return []

  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
  let scenetreeUrl = equipUrl.replace('tileset.json', 'scenetree.json')
  if (isProduction && scenetreeUrl.startsWith('http://')) {
    scenetreeUrl = scenetreeUrl.replace('http://', 'https://')
  }

  try {
    const res = await fetch(scenetreeUrl)
    if (!res.ok) return []
    const data = await res.json()
    const scene = data.scenes?.[0]
    if (!scene?.children) return []

    const devices: Array<{ sbbh: string; lng: number; lat: number; height: number }> = []
    for (const el of scene.children) {
      if (el.type !== 'element' || !el.sphere || el.sphere.length < 3) continue
      const pos = new Cesium.Cartesian3(el.sphere[0], el.sphere[1], el.sphere[2])
      const carto = Cesium.Cartographic.fromCartesian(pos)
      devices.push({
        sbbh: el.name,
        lng: Cesium.Math.toDegrees(carto.longitude),
        lat: Cesium.Math.toDegrees(carto.latitude),
        height: carto.height,
      })
    }
    return devices
  } catch (e) {
    console.warn('scenetree 加载失败:', e)
    return []
  }
}

const handleEquipmentActivate = (bridge: any, active: boolean) => {
  equipmentBridgeData.value = active ? { qlbh: bridge.qlbh, llmc: bridge.name } : {}
  equipmentDialogVisible.value = active

  // 激活时预加载 scenetree 坐标
  if (active && bridge.equipment?.url) {
    currentEquipUrl.value = bridge.equipment.url
    const qlbh = bridge.qlbh
    if (!scenetreeCache.value[qlbh]) {
      loadScenetreeForBridge(bridge.equipment.url).then(devices => {
        scenetreeCache.value[qlbh] = devices
        console.log(`✅ ${bridge.name} scenetree 设备: ${devices.length} 个`)
      })
    }
  }
}

const handleEquipmentView = (equipment: any) => {
  if (!equipment?.sbbh || !viewerInstance.value) return

  const Cesium = (window as any).Cesium
  if (!Cesium) return

  // 从缓存中查找设备坐标
  const qlbh = equipmentBridgeData.value?.qlbh
  const cached = scenetreeCache.value[qlbh]
  if (!cached) return

  const device = cached.find(d => d.sbbh === equipment.sbbh)
  if (!device) {
    console.warn('未在 scenetree 中找到设备:', equipment.sbbh)
    return
  }

  // 模仿 demo.html flyToDevice: 正上方俯视
  viewerInstance.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(device.lng, device.lat, device.height + 2),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
    duration: 1.5,
  })
}


// 多弹窗容器引用
const multiPopupRef = ref<any>(null)

// 弹窗碰撞检测配置
const popupCollisionConfig = ref<Partial<CollisionConfig>>({
  lengthTolerance: -150,   // 水平容忍度（正数=要求间距，负数=允许重叠）
  widthTolerance: -50,     // 垂直容忍度（正数=要求间距，负数=允许重叠）
  popupWidth: 180,         // 弹窗宽度
  popupHeight: 80,         // 弹窗高度
  popupOffsetY: 0          // 弹窗垂直偏移
})

// 测量工具引用
const measurementsRef = ref<any>(null)
const measureToolRef = ref<any>(null)
const showMeasureTool = ref(false)

// VcMeasurements 配置
const mainFabOpts = {
  modelValue: false
}



// 路由
const route = useRoute()

// 默认3D Tiles显示状态
const defaultTilesetVisible = ref(false)

// 首页默认展示白膜，其他模块关闭
watch(
  () => route.name,
  (name) => {
    defaultTilesetVisible.value = name === 'home'
  },
  { immediate: true }
)

// 底图类型
const currentBaseMapType = ref<'vec' | 'img' | 'ter' | 'arcgis'>('img')

// 天地图 Token
const tiandituToken = import.meta.env ? import.meta.env.VITE_TIANDITU_KEY || '' : ''

// 是否显示天地图底图
const showTianditu = computed(() => {
  return ['vec', 'img', 'ter'].includes(currentBaseMapType.value)
})

// 天地图地图样式映射
const tiandituMapStyleMap: Record<'img' | 'vec' | 'ter', 'img_c' | 'vec_c' | 'ter_c'> = {
  'img': 'img_c',    // 影像地图
  'vec': 'vec_c',     // 矢量地图
  'ter': 'ter_c'     // 地形地图
}

// 当前天地图样式
const tiandituMapStyle = computed((): 'img_c' | 'vec_c' | 'ter_c' => {
  if (['img', 'vec', 'ter'].includes(currentBaseMapType.value)) {
    return tiandituMapStyleMap[currentBaseMapType.value as 'img' | 'vec' | 'ter']
  }
  return 'img_c' // 默认值
})
const mapAssetId = {
  'img': 2,
  'vec': 4,
  'ter': 1
}
const cesiumIonAssetId=computed(() => {
  if (['img', 'vec', 'ter'].includes(currentBaseMapType.value)) {
    return mapAssetId[currentBaseMapType.value as 'vec' | 'img' | 'ter']
  }
  return 2
})
// 场景模式: 2=2D, 3=3D
const sceneMode = ref<2 | 3>(3)

// 指北针旋转角度
const compassRotation = ref(0)

// 初始相机位置
const camera = ref<VcCamera | null>({
  position: [mapConfig.initialCamera.center[0], mapConfig.initialCamera.center[1], mapConfig.initialCamera.height],
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
const mapStore = useMapStore()

// 建筑群模型 URL — 从 store 中按 ID 动态查找，接口无数据时 fallback
const default3DTilesUrl = computed(() => {
  const layer = mapStore.findLayerById(DEFAULT_BUILDING_LAYER_ID)
  return layer?.url || ''
})

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
    console.log('✅ 阳新县行政区域数据加载成功', yangxinGeoJSON.value)
  } catch (error) {
    console.error('❌ 加载阳新县边界数据失败:', error)
  }
}

/**
 * 行政区域边界加载完成回调
 */
function onBoundaryReady({ Cesium, cesiumObject }: any) {
  console.log('✅ 阳新县行政区域边界加载完成')
}
/**
 * 行政区域边界加载错误回调
 */
function onBoundaryError(error: any) {
  console.error('❌ 阳新县行政区域边界加载失败:', error)
}

/**
 * 3D Tiles加载完成回调
 */
function on3DTilesReady({ Cesium, cesiumObject }: any) {
  console.log('✅ 默认3D Tiles图层加载完成')
  console.log('3D Tiles URL:', default3DTilesUrl)
  console.log('cesiumObject 属性:', cesiumObject)
  
  if (cesiumObject) {
    cesiumObject.maximumScreenSpaceError = 16
    
    // 移除样式限制，使用模型原始纹理
    cesiumObject.style = undefined
    
    // 或者尝试设置模型矩阵透明度
    if (cesiumObject.color !== undefined) {
      cesiumObject.color = Cesium.Color.WHITE.withAlpha(0.8)
    }
    
    console.log('✅ 3D Tiles样式已调整')
    console.log('当前透明度设置完成，检查模型是否为灰色纹理')
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

  // 飞到初始视角
  const ic = mapConfig.initialCamera
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(ic.center[0], ic.center[1], ic.height),
    orientation: {
      heading: Cesium.Math.toRadians(ic.heading),
      pitch: Cesium.Math.toRadians(ic.pitch),
      roll: 0,
    },
    duration: 0,
  })

  // 初始化监测点位功能
  await initMonitoringPoints(viewer)

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
 * 初始化监测点位功能
 */
async function initMonitoringPoints(viewer: any) {
  try {
    // 初始化数据源
    await monitoringPoints.initDataSource(viewer)
    
    // 更新地图点位
    await monitoringPoints.updateMapPoints()
    
    // 设置点击事件监听
    // monitoringPoints.setupClickHandler()
    
    console.log('✅ 监测点位功能初始化完成')
  } catch (error) {
    console.error('❌ 监测点位功能初始化失败:', error)
  }
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

  // 实体变化时自动请求渲染（解决移除实体后地图不刷新的问题）
  viewer.entities.collectionChanged.addEventListener(() => {
    viewer.scene.requestRender()
  })

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
 * 飞行到监测点位
 */
function handleFlyToMonitoringPoint(point: EnhancedMonitoringPoint) {
  monitoringPoints.flyToPoint(point)
}

/**
 * 查看监测点位详情
 */
function handleViewMonitoringDetail(point: EnhancedMonitoringPoint) {
  console.log('📝 查看监测点位详情:', point)
  // TODO: 可以在这里打开详细信息弹窗或跳转到详情页面
}

/**
 * 处理弹窗可见性变化事件
 */
function handlePopupVisibilityChange(stats: { totalPoints: number; visiblePopups: number; hiddenPopups: number }) {
  console.log(`📊 弹窗统计: 总数 ${stats.totalPoints}, 可见 ${stats.visiblePopups}, 隐藏 ${stats.hiddenPopups}`)
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
 * 只支持天地图和ArcGIS影像底图
 */
const handleBaseMapChange = async (type: 'vec' | 'img' | 'ter' | 'arcgis') => {
  currentBaseMapType.value = type

  const typeNames = {
    'img': '影像',
    'vec': '矢量',
    'ter': '地形',
    'arcgis': 'ArcGIS影像'
  }

  const providerInfo = type === 'ter'
    ? '(Cesium Ion - Asset ID: 3)'
    : type === 'arcgis'
    ? '(ArcGIS影像服务)'
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
 * ArcGIS影像加载完成回调
 */
function onArcGISReady({ Cesium, cesiumObject }: any) {
  console.log('✅ ArcGIS影像底图加载完成')
}

/**
 * ArcGIS影像加载错误回调
 */
function onArcGISError(error: any) {
  console.error(`❌ ArcGIS影像加载失败: ${error?.message || error}`)
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
    const ic = mapConfig.initialCamera
    viewerInstance.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(ic.center[0], ic.center[1], ic.height),
      orientation: {
        heading: Cesium.Math.toRadians(ic.heading),
        pitch: Cesium.Math.toRadians(ic.pitch),
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

  // 清理监测点位资源
  monitoringPoints.cleanup()
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

  defaultTilesetVisible,
  toggleMeasureTool: () => { showMeasureTool.value = !showMeasureTool.value },

  toggleDefaultTileset,
  toolbarRef,

  // 监测点位相关
  monitoringPoints,
  refreshMonitoringPoints: () => monitoringPoints.refresh(),
  setMonitoringPointsVisible: (visible: boolean) => monitoringPoints.setVisible(visible),

  // 多弹窗管理相关
  multiPopupRef,
  popupCollisionConfig,
  updatePopupConfig: (config: Partial<CollisionConfig>) => {
    popupCollisionConfig.value = { ...popupCollisionConfig.value, ...config }
  },
  forceRecalculatePopups: () => multiPopupRef.value?.forceRecalculate(),
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