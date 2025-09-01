<template>
  <div class="mapbox-tools-container">
    <div class="tools-section">
      <div class="tool-group">
        <!-- 基础图层切换 -->
        <a-button
          class="tool-button"
          :type="baseMapMode ? 'primary' : 'default'"
          size="small"
          @click="handleBaseMapToggle"
          title="切换基础图层"
        >
          <template #icon>
            <LayersOutlined />
          </template>
        </a-button>
        
        <!-- 专题地图 -->
        <a-button
          class="tool-button"
          :type="thematicMapMode ? 'primary' : 'default'"
          size="small"
          @click="handleThematicMapToggle"
          title="专题地图"
        >
          <template #icon>
            <EnvironmentOutlined />
          </template>
        </a-button>

        <!-- 地图复位 -->
        <a-button
          class="tool-button"
          type="default"
          size="small"
          @click="handleReset"
          title="地图复位"
        >
          <template #icon>
            <ReloadOutlined />
          </template>
        </a-button>

        <!-- 指北针 -->
        <a-button
          class="tool-button"
          :type="compassMode ? 'primary' : 'default'"
          size="small"
          @click="handleCompassToggle"
          title="指北针"
        >
          <template #icon>
            <CompassOutlined />
          </template>
        </a-button>

        <!-- 测距工具 -->
        <a-button
          class="tool-button"
          :type="distanceMode ? 'primary' : 'default'"
          size="small"
          @click="handleDistanceToggle"
          title="测距工具"
        >
          <template #icon>
            <BorderOutlined />
          </template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from "vue";
import { 
  LayersOutlined,
  EnvironmentOutlined,
  ReloadOutlined, 
  CompassOutlined, 
  BorderOutlined 
} from "@ant-design/icons-vue";
import { mapboxUtils } from "../mapUtils/mapboxUtils";

// 注入地图实例
const mapInstance = inject("mapInstance");

// 功能状态管理
const baseMapMode = ref(false);
const thematicMapMode = ref(false);
const compassMode = ref(false);
const distanceMode = ref(false);

// 基础图层切换
function handleBaseMapToggle() {
  if (!mapInstance?.value) return;
  
  baseMapMode.value = !baseMapMode.value;
  const map = mapInstance.value;
  
  // 切换天地图底图类型
  const baseMapTypes = ['vec', 'img', 'ter'];
  const currentType = baseMapMode.value ? 'img' : 'vec';
  
  try {
    mapboxUtils.switchBaseMap(map, currentType);
    console.log(`切换到${currentType}底图`);
  } catch (error) {
    console.error('切换底图失败:', error);
  }
}

// 专题地图切换
function handleThematicMapToggle() {
  if (!mapInstance?.value) return;
  
  thematicMapMode.value = !thematicMapMode.value;
  const map = mapInstance.value;
  
  try {
    if (thematicMapMode.value) {
      // 加载专题图层
      loadThematicLayers(map);
    } else {
      // 移除专题图层
      removeThematicLayers(map);
    }
  } catch (error) {
    console.error('专题地图操作失败:', error);
  }
}

// 加载专题图层
async function loadThematicLayers(map) {
  try {
    // 桥梁图层
    await mapboxUtils.loadVectorTileLayer(
      map,
      'bridge_layer',
      'http://192.168.3.249:8080/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT%3Agspsp_dtrans_bridgebscinfo@EPSG%3A4326@pbf/{z}/{x}/{y}.pbf',
      {
        visible: true,
        opacity: 1.0,
      }
    );

    // 井盖图层
    await mapboxUtils.loadVectorTileLayer(
      map,
      'manhole_layer',
      'http://192.168.3.249:8080/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT%3Agspsp_dtrans_manholecoverbasetinfo@EPSG%3A4326@pbf/{z}/{x}/{y}.pbf',
      {
        visible: true,
        opacity: 1.0,
      }
    );

    console.log('专题图层加载完成');
  } catch (error) {
    console.error('加载专题图层失败:', error);
  }
}

// 移除专题图层
function removeThematicLayers(map) {
  try {
    const layers = ['bridge_layer', 'manhole_layer'];
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(layerId)) {
        map.removeSource(layerId);
      }
    });
    console.log('专题图层移除完成');
  } catch (error) {
    console.error('移除专题图层失败:', error);
  }
}

// 地图复位
function handleReset() {
  if (!mapInstance?.value) return;
  
  const map = mapInstance.value;
  try {
    map.flyTo({
      center: [115.133954, 29.823198], // 阳新县中心坐标
      zoom: 10,
      duration: 2000
    });
    console.log('地图复位完成');
  } catch (error) {
    console.error('地图复位失败:', error);
  }
}

// 指北针切换
function handleCompassToggle() {
  if (!mapInstance?.value) return;
  
  compassMode.value = !compassMode.value;
  const map = mapInstance.value;
  
  try {
    if (compassMode.value) {
      mapboxUtils.addCompassControl(map, 'top-right');
    } else {
      // 移除指北针控件
      const compassControl = map.getControl('compass');
      if (compassControl) {
        map.removeControl(compassControl);
      }
    }
    console.log(`指北针${compassMode.value ? '开启' : '关闭'}`);
  } catch (error) {
    console.error('指北针操作失败:', error);
  }
}

// 测距工具切换
function handleDistanceToggle() {
  if (!mapInstance?.value) return;
  
  distanceMode.value = !distanceMode.value;
  const map = mapInstance.value;
  
  try {
    if (distanceMode.value) {
      mapboxUtils.enableDistanceMode(map);
    } else {
      mapboxUtils.disableDistanceMode(map);
    }
    console.log(`测距工具${distanceMode.value ? '开启' : '关闭'}`);
  } catch (error) {
    console.error('测距工具操作失败:', error);
  }
}
</script>

<style scoped>
.mapbox-tools-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tools-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tool-button {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tool-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 1);
}

.tool-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-button {
    width: 40px;
    height: 40px;
  }
  
  .tool-group {
    padding: 6px;
  }
}
</style>
