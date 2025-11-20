<template>
  <div class="map-container">
    <vc-viewer 
      ref="cesiumViewer" 
      :camera="camera" 
      :sceneMode="sceneMode"
      :requestRenderMode="true"
      :maximumRenderTimeChange="Infinity"
      @ready="onViewerReady"
    >
      <!-- 天地图底图 -->
      <vc-layer-imagery ref="basemapLayer">
        <vc-imagery-provider-tianditu 
          :map-style="currentMapStyle" 
          :token="tiandituToken" 
          @readyPromise="onTiandituReady" 
          @errorEvent="onTiandituError" 
        />
      </vc-layer-imagery>
    </vc-viewer>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { VcCamera } from 'vue-cesium/lib/utils/types.js'
import cesiumUtils from '../mapUtils/mapUtils'
import { geoServerWFS } from '../services/wfsService'
import yangxinData from '../assets/yangxin.json'
import mapConfig from '@/config/mapConfig'

// 定义组件名称以支持keep-alive
defineOptions({
  name: 'CesiumMap'
});

// Cesium Viewer引用
const cesiumViewer = ref(null)
const viewerInstance = ref<any>(null)
const basemapLayer = ref(null)

// 从环境变量获取天地图token
const tiandituToken = import.meta.env ? import.meta.env.VITE_TIANDITU_KEY || '' : ''

// 底图类型
const currentBaseMapType = ref<'vec' | 'img' | 'ter'>('vec')

// 场景模式: 2=2D, 3=3D
const sceneMode = ref(2)

// 初始相机位置
const camera = ref<VcCamera | null>({
  position: [mapConfig.center[0], mapConfig.center[1], 50000],
})

// 当前选中的要素
const selectedFeature = ref<any>(null)

// MVT图层实例
const mvtProvider = ref<any>(null)

// 测量状态
const measureMode = ref<'distance' | 'area' | null>(null)

// 计算天地图样式字符串
const currentMapStyle = computed(() => {
  const styleMap: Record<string, string> = {
    'vec': 'vec_c',  // 矢量+中文标注
    'img': 'img_c',  // 影像+中文标注
    'ter': 'ter_c'   // 地形+中文标注
  }
  return styleMap[currentBaseMapType.value] as any
})

/**
 * Viewer准备就绪回调
 */
async function onViewerReady({ Cesium, viewer }: any) {
  viewerInstance.value = viewer
  console.log('Cesium Viewer已准备就绪')

  // 性能优化设置
  optimizeCesiumPerformance(viewer, Cesium)

  try {
    // 加载MVT图层（包含点位可视化）
    await loadMVTLayer(viewer)
    
    // 设置点击事件处理（用于查询详细信息）
    setupClickHandler(viewer, Cesium)
  } catch (error) {
    console.error('地图初始化失败:', error)
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
  
  // 禁用阴影
  viewer.shadows = false
  
  console.log('Cesium性能优化已应用')
}

/**
 * 加载MVT矢量瓦片图层
 */
async function loadMVTLayer(viewer: any) {
  try {
    console.log('开始加载MVT图层...')
    
    // 使用相对于public目录的路径
    const provider = await cesiumUtils.loadMVTLayer(viewer, '/clmap/style.json')
    mvtProvider.value = provider
    
  } catch (error) {
    console.error('❌ MVT图层加载失败:', error)
  }
}

/**
 * 设置点击事件处理器
 * 用于点击MVT图层要素时查询详细信息
 */
function setupClickHandler(viewer: any, Cesium: any) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  
  handler.setInputAction(async (movement: any) => {
    // 获取点击位置的地理坐标
    const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid)
    
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      
      console.log(`📍 点击位置: [${longitude.toFixed(6)}, ${latitude.toFixed(6)}]`)
      
      // 使用WFS查询该点附近的详细信息
      await queryFeatureInfo(longitude, latitude)
    } else {
      console.log('⚠️ 未能获取点击位置坐标')
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
  console.log('✅ 点击事件监听已设置')
}

/**
 * 查询要素详细信息
 * 根据点击位置查询WFS数据
 */
async function queryFeatureInfo(longitude: number, latitude: number) {
  try {
    console.log(`🔍 开始查询点位: [${longitude.toFixed(6)}, ${latitude.toFixed(6)}]`)
    
    // 扩大缓冲区，提高查询成功率
    // 0.05度约等于5公里（在中国中部地区）
    const buffer = 0.001
    const bbox = [
      longitude - buffer,
      latitude - buffer,
      longitude + buffer,
      latitude + buffer
    ]
    
    console.log(`📦 查询范围: [${bbox.map(v => v.toFixed(6)).join(', ')}]`)
    console.log(`📏 缓冲区大小: ${buffer}度 (约${(buffer * 111).toFixed(1)}公里)`)
    
    // 使用WFS查询
    const geoJsonData = await geoServerWFS.getFeaturesByBBox(
      'gspsp_dtrans_bridgebscinfo',
      bbox as [number, number, number, number],
      'EPSG:4326'
    )
    
    if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
      console.log(`✅ 查询成功! 找到 ${geoJsonData.features.length} 个要素`)
      
      // 找到距离点击位置最近的要素
      const feature = findClosestFeature(geoJsonData.features, longitude, latitude)
      
      console.log('📋 要素详细信息:')
      console.log('  - ID:', feature.id)
      console.log('  - 属性:', feature.properties)
      console.log('  - 坐标:', feature.geometry?.coordinates)
      
      // 触发事件
      emitFeatureClick(feature)
    } else {
      console.log('❌ 未查询到要素信息')
      console.log('💡 可能的原因:')
      console.log('  1. 该区域没有桥梁数据')
      console.log('  2. WFS服务限制了返回的数据范围')
      console.log('  3. 图层名称或工作空间配置错误')
    }
  } catch (error) {
    console.error('❌ 查询要素信息失败:', error)
    console.error('请检查:')
    console.error('  1. WFS服务是否可访问: http://map4.cityfun.com.cn/geoserver/wfs')
    console.error('  2. 图层名称是否正确: CSSMX_ZT:gspsp_dtrans_bridgebscinfo')
    console.error('  3. 网络连接是否正常')
  }
}

/**
 * 找到距离点击位置最近的要素
 */
function findClosestFeature(features: any[], longitude: number, latitude: number) {
  let closestFeature = features[0]
  let minDistance = Infinity
  
  features.forEach(feature => {
    if (feature.geometry?.type === 'Point') {
      const [lon, lat] = feature.geometry.coordinates
      const distance = Math.sqrt(
        Math.pow(lon - longitude, 2) + Math.pow(lat - latitude, 2)
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closestFeature = feature
      }
    }
  })
  
  console.log(`🎯 最近要素距离: ${(minDistance * 111).toFixed(2)}公里`)
  
  return closestFeature
}

/**
 * 触发要素点击事件
 */
function emitFeatureClick(feature: any) {
  // 可以在这里触发Vue事件，传递给父组件
  console.log('要素详情:', {
    id: feature.id,
    properties: feature.properties,
    geometry: feature.geometry
  })
  
  // TODO: 显示信息窗口或弹窗
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
 * 组件挂载
 */
onMounted(() => {
  console.log('🗺️ 地图组件挂载完成')
  console.log('📌 使用说明:')
  console.log('  1. MVT图层只在缩放级别13以上显示')
  console.log('  2. 点击地图任意位置查询附近的桥梁')
  console.log('  3. 查询范围: 约5公里缓冲区')
})

/**
 * 组件卸载前
 */
onBeforeUnmount(() => {
  console.log('地图组件即将卸载')
  // 清理事件处理器
  if (viewerInstance.value) {
    // Cesium会自动清理handler
  }
})

// 导出方法供父组件调用
defineExpose({
  cesiumViewer,
  viewerInstance,
  queryFeatureInfo,
  loadMVTLayer  // 暴露MVT图层加载方法
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