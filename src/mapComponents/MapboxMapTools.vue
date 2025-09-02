<template>
  <div class="mapbox-tools-container">
    <div class="tools-section">
      <div class="tool-group">

        <!-- 专题地图 -->
        <a-popover
          v-model:open="layerTreeVisible"
          title="图层管理"
          placement="left"
          :width="320"
          trigger="click"
        >
          <template #content>
            <LayerTree 
              ref="layerTreeRef"
              @layer-toggle="handleLayerToggle"
              @layer-opacity-change="handleLayerOpacityChange"
            />
          </template>
        <a-button
          class="tool-button"
          :type="thematicMapMode ? 'primary' : 'default'"
          size="small"
          title="专题地图"
        >
          <img class="tool-button-img" src="@/assets/map-img/layer.webp" alt="" />
        </a-button>
        </a-popover>

        <!-- 地图复位 -->
        <a-button
          class="tool-button"
          type="default"
          size="small"
          @click="handleReset"
          title="地图复位"
        >
          <img class="tool-button-img" src="@/assets/map-img/reset.webp" alt="" />
        </a-button>

        <!-- 指北针 -->
        <a-button
          class="tool-button"
          :type="compassMode ? 'primary' : 'default'"
          size="small"
          @click="handleCompassToggle"
          title="指北针"
        >
          <img class="tool-button-img" src="@/assets/map-img/compass.webp" alt="" />
        </a-button>

        <!-- 测距工具 -->
        <a-button
          class="tool-button"
          :type="distanceMode ? 'primary' : 'default'"
          size="small"
          @click="handleDistanceToggle"
          title="测距工具"
        >
          <img class="tool-button-img" src="@/assets/map-img/ranging.webp" alt="" />
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, computed } from "vue";
import {
  MenuOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  CompassOutlined,
  LineOutlined,
} from "@ant-design/icons-vue";
import { mapboxUtils } from "../mapUtils/mapboxUtils";
import { useMapStore } from "../stores/mapStore";
import LayerTree from "../components/LayerTree.vue";

// 注入地图实例
const mapInstance = inject("mapInstance");
const mapStore = useMapStore();

// 功能状态管理
const thematicMapMode = ref(false);
const compassMode = ref(false);
const distanceMode = ref(false);

// 图层树状态
const layerTreeVisible = ref(false);
const layerTreeRef = ref(null);

// 获取地图实例的computed属性
const map = computed(() => {
  return mapInstance?.value || mapStore.map;
});



// 图层显隐切换
function handleLayerToggle(layerKey, visible) {
  const mapInstance = map.value;
  if (!mapInstance) return;

  try {
    switch (layerKey) {
      case 'bridge_layer':
        if (visible) {
          loadBridgeLayer(mapInstance);
        } else {
          // 只隐藏图层，不删除source
          toggleLayerVisibility(mapInstance, 'bridge_layer', false);
        }
        break;
      case 'manhole_layer':
        if (visible) {
          loadManholeLayer(mapInstance);
        } else {
          // 只隐藏图层，不删除source
          toggleLayerVisibility(mapInstance, 'manhole_layer', false);
        }
        break;

      default:
        console.warn(`未知图层: ${layerKey}`);
    }
    
    // 更新专题地图模式状态
    const thematicLayers = ['bridge_layer', 'manhole_layer'];
    const hasVisibleThematicLayer = thematicLayers.some(layer => {
      const layerObj = mapInstance.getLayer(layer);
      return layerObj && mapInstance.getLayoutProperty(layer, 'visibility') === 'visible';
    });
    thematicMapMode.value = hasVisibleThematicLayer;
    
  } catch (error) {
    console.error("图层切换失败:", error);
    // 如果操作失败，回滚LayerTree状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerKey, { visible: !visible });
    }
  }
}

// 图层透明度变化
function handleLayerOpacityChange(layerKey, opacity) {
  const mapInstance = map.value;
  if (!mapInstance) return;

  try {
    switch (layerKey) {
      case 'bridge_layer':
        setLayerOpacity(mapInstance, 'bridge_layer', opacity);
        break;
      case 'manhole_layer':
        setLayerOpacity(mapInstance, 'manhole_layer', opacity);
        break;

      default:
        console.warn(`未知图层: ${layerKey}`);
    }
  } catch (error) {
    console.error("图层透明度设置失败:", error);
  }
}

// 加载桥梁图层
async function loadBridgeLayer(map) {
  try {
    await mapboxUtils.loadVectorTileLayer(
      map,
      "bridge_layer",
      "http://192.168.3.249:8080/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT%3Agspsp_dtrans_bridgebscinfo@EPSG%3A4326@pbf/{z}/{x}/{y}.pbf",
      {
        visible: true,
        opacity: 1.0,
      }
    );
    console.log("桥梁图层加载完成");
  } catch (error) {
    console.error("加载桥梁图层失败:", error);
  }
}

// 加载井盖图层
async function loadManholeLayer(map) {
  try {
    await mapboxUtils.loadVectorTileLayer(
      map,
      "manhole_layer",
      "http://192.168.3.249:8080/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT%3Agspsp_dtrans_manholecoverbasetinfo@EPSG%3A4326@pbf/{z}/{x}/{y}.pbf",
      {
        visible: true,
        opacity: 1.0,
      }
    );
    console.log("井盖图层加载完成");
  } catch (error) {
    console.error("加载井盖图层失败:", error);
  }
}

// 移除图层
function removeLayer(map, layerId) {
  try {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(layerId)) {
      map.removeSource(layerId);
    }
    console.log(`图层 ${layerId} 移除完成`);
  } catch (error) {
    console.error(`移除图层 ${layerId} 失败:`, error);
  }
}

// 切换图层可见性
function toggleLayerVisibility(map, layerId, visible) {
  try {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      console.log(`图层 ${layerId} 可见性设置为: ${visible}`);
    }
  } catch (error) {
    console.error(`设置图层 ${layerId} 可见性失败:`, error);
  }
}

// 设置图层透明度
function setLayerOpacity(map, layerId, opacity) {
  try {
    if (map.getLayer(layerId)) {
      // 根据图层类型设置不同的透明度属性
      const layer = map.getLayer(layerId);
      if (layer.type === 'fill') {
        map.setPaintProperty(layerId, 'fill-opacity', opacity);
      } else if (layer.type === 'line') {
        map.setPaintProperty(layerId, 'line-opacity', opacity);
      } else if (layer.type === 'circle') {
        map.setPaintProperty(layerId, 'circle-opacity', opacity);
      }
      console.log(`图层 ${layerId} 透明度设置为: ${opacity}`);
    }
  } catch (error) {
    console.error(`设置图层 ${layerId} 透明度失败:`, error);
  }
}

// 移除专题图层
function removeThematicLayers(map) {
  try {
    const layers = ["bridge_layer", "manhole_layer"];
    layers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(layerId)) {
        map.removeSource(layerId);
      }
    });
    console.log("专题图层移除完成");
  } catch (error) {
    console.error("移除专题图层失败:", error);
  }
}

// 地图复位
function handleReset() {
  const mapInstance = map.value;
  if (!mapInstance) return;
  try {
    mapInstance.flyTo({
      center: [115.133954, 29.823198], // 阳新县中心坐标
      zoom: 10,
      duration: 2000,
    });
    console.log("地图复位完成");
  } catch (error) {
    console.error("地图复位失败:", error);
  }
}

// 指北针切换
function handleCompassToggle() {
  const mapInstance = map.value;
  if (!mapInstance) return;

  compassMode.value = !compassMode.value;

  try {
    if (compassMode.value) {
      mapboxUtils.addCompassControl(mapInstance, "top-right");
    } else {
      // 移除指北针控件
      const compassControl = mapInstance.getControl("compass");
      if (compassControl) {
        mapInstance.removeControl(compassControl);
      }
    }
    console.log(`指北针${compassMode.value ? "开启" : "关闭"}`);
  } catch (error) {
    console.error("指北针操作失败:", error);
  }
}

// 测距工具切换
function handleDistanceToggle() {
  const mapInstance = map.value;
  if (!mapInstance) return;

  distanceMode.value = !distanceMode.value;

  try {
    if (distanceMode.value) {
      mapboxUtils.enableDistanceMode(mapInstance);
    } else {
      mapboxUtils.disableDistanceMode(mapInstance);
    }
    console.log(`测距工具${distanceMode.value ? "开启" : "关闭"}`);
  } catch (error) {
    console.error("测距工具操作失败:", error);
  }
}
</script>

<style scoped>
.mapbox-tools-container {
  position: absolute;
  top: 100px;
  right: 600px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tools-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 16px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.tool-button {
  width: 72px !important;
  height: 72px;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  
  .tool-button-img {
    width: 100%;
  }
}

.tool-button:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.4);
}

.tool-button:active {
  transform: translateY(0);
}



/* 响应式设计 */
@media (max-width: 768px) {
  .tool-button {
    width: 80px;
    height: 80px;
  }

  .tool-group {
    padding: 12px;
  }
}
</style>
