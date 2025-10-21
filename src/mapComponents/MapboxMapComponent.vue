<template>
  <div class="mapbox-map-wrapper">
    <div id="mapbox-container" class="mapbox-instance"></div>
    <!-- <MapboxMapTools /> -->
  </div>
</template>

<script setup>
import {
  onMounted,
  onBeforeUnmount,
  nextTick,
  ref,
  provide,
  watchEffect,
} from "vue";
// import mapboxgl from "maplibre-gl";
import mapboxgl from "@cgcs2000/mapbox-gl";
import yangxinGeoJson from "../assets/yangxin.json";
import MapboxMapTools from "./MapboxMapTools.vue";
import { useMapStore } from "../stores/mapStore";
import { mapboxUtils } from "@/mapUtils/mapboxUtils";
import { dataUtils } from "../mapUtils/dataUtils";
import { mapConfig } from "@/config/mapConfig";
import { getLayerTree } from "@/api";
import { validateLayerTreeData } from "@/mapUtils/layerTreeUtils";

// 使用地图store
const mapStore = useMapStore();

// 地图实例ref，用于工具组件
const mapInstance = ref(null);

// 提供地图实例给子组件
provide("mapboxMap", mapInstance);

// 开发模式检查，避免重复初始化
const isDev = import.meta.env.DEV;
const isInitialized = ref(false);

// 支持多个GeoJSON数据源
const geoJsonData = [{ data: yangxinGeoJson, name: "阳新县行政区划" }];
const bridgeLayerUrl = mapConfig.layerUrls.bridge;
// GeoJSON数据加载状态
const geoJsonLoaded = ref(false);

// 初始化Mapbox地图
function initMapboxMap() {
  try {
    // 开发模式下避免重复初始化
    if (isDev && isInitialized.value) {
      console.log("开发模式：地图已初始化，跳过重复初始化");
      return;
    }

    console.log("初始化Mapbox地图...");
    mapStore.setMapLoading(true);

    // 检查容器是否存在
    const container = document.getElementById("mapbox-container");
    if (!container) {
      throw new Error("地图容器不存在: mapbox-container");
    }

    // 使用简化的天地图初始化方法
    const map = mapboxUtils.initSimpleTiandituMap("mapbox-container", "vec");

    // 设置到store和ref
    mapStore.setMap(map);
    mapInstance.value = map;
    isInitialized.value = true;

    // 地图加载完成后加载数据
    map.on("load", async () => {
      try {
        await loadGeoJsonData();

        mapboxUtils.loadVectorTileLayer(map,bridgeLayerUrl);
        // 添加指北针控件
        mapboxUtils.addCompassControl(map, "top-right");

        console.log("地图初始化完成，已默认加载桥梁设施图层");
      } catch (error) {
        console.error("加载地图数据时发生错误:", error);
      } finally {
        mapStore.setMapLoading(false);
      }
    });

    // 添加错误处理
    map.on("error", (error) => {
      console.error("地图加载错误:", error);
      mapStore.setMapLoading(false);
    });
  } catch (error) {
    console.error("Mapbox地图初始化失败:", error);
    mapStore.setMapLoading(false);
  }
}

// 加载并渲染GeoJSON数据
async function loadGeoJsonData() {
  if (!mapInstance.value) {
    console.error("地图未初始化，无法加载GeoJSON数据");
    return false;
  }

  try {
    // 设置加载状态
    geoJsonLoaded.value = false;

    // 清除之前的数据源
    clearAllDataSources();

    const loadPromises = [];

    // 并行加载所有数据源以提升性能
    for (const dataSource of geoJsonData) {
      const loadPromise = loadSingleGeoJsonSource(dataSource);
      loadPromises.push(loadPromise);
    }

    // 等待所有数据源加载完成
    await Promise.all(loadPromises);

    // 计算总要素数量
    const totalFeatures = calculateTotalFeatures();

    geoJsonLoaded.value = true;
    console.log(`GeoJSON数据加载完成，共渲染 ${totalFeatures} 个区域`);
    return true;
  } catch (error) {
    console.error("加载GeoJSON数据失败:", error);
    geoJsonLoaded.value = false;
    return false;
  }
}

// 加载单个GeoJSON数据源
async function loadSingleGeoJsonSource(dataSource) {
  try {
    const sourceId = `geojson-${dataSource.name}`;

    // 验证数据格式
    if (!isValidGeoJsonData(dataSource.data)) {
      throw new Error(`数据源 ${dataSource.name} 格式无效`);
    }

    // 使用mapboxUtils加载GeoJSON数据
    await mapboxUtils.loadGeoJSON(
      mapInstance.value,
      sourceId,
      dataSource.data,
      {
        strokeColor: "#1677ff", // 使用Ant Design主色
        strokeWidth: 2,
        fillColor: "rgba(22, 119, 255, 0.1)", // 使用Ant Design主色透明度
      }
    );

    console.log(`数据源 ${dataSource.name} 加载完成`);
  } catch (error) {
    console.error(`加载数据源 ${dataSource.name} 失败:`, error);
    throw error;
  }
}

// 验证GeoJSON数据格式
function isValidGeoJsonData(data) {
  if (!data || typeof data !== "object") {
    return false;
  }

  const validTypes = [
    "Feature",
    "FeatureCollection",
    "Point",
    "LineString",
    "Polygon",
    "MultiPoint",
    "MultiLineString",
    "MultiPolygon",
    "GeometryCollection",
  ];
  return validTypes.includes(data.type);
}

// 计算总要素数量
function calculateTotalFeatures() {
  let totalFeatures = 0;

  for (const dataSource of geoJsonData) {
    if (dataSource.data.type === "Feature") {
      totalFeatures += 1;
    } else if (dataSource.data.type === "FeatureCollection") {
      totalFeatures += dataSource.data.features?.length || 0;
    }
  }

  return totalFeatures;
}

// 清除所有数据源
function clearAllDataSources() {
  try {
    const map = mapStore.map;
    if (!map) return;

    // 清除GeoJSON图层
    geoJsonData.forEach((dataSource) => {
      const sourceId = `geojson-${dataSource.name}`;
      if (map.getSource(sourceId)) {
        // 移除填充图层
        if (map.getLayer(`${sourceId}-fill`)) {
          map.removeLayer(`${sourceId}-fill`);
        }
        // 移除边框图层
        if (map.getLayer(`${sourceId}-stroke`)) {
          map.removeLayer(`${sourceId}-stroke`);
        }
        // 移除数据源
        map.removeSource(sourceId);
      }
    });

    // 清除POI标注
    mapboxUtils.clearPOIMarkers(map);
  } catch (error) {
    console.error("清除数据源失败:", error);
  }
}

async function loadMapTree() {
  try {
    const response = await getLayerTree();
    if (response && response.data) {
      // 验证数据格式
      if (validateLayerTreeData(response.data)) {
        // 存储到 store
        mapStore.setLayerTree(response.data);
        
        // 存储到 localStorage
        localStorage.setItem('layerTreeData', JSON.stringify(response.data));
        
        console.log("图层树数据加载完成:", response.data);
      } else {
        console.error("图层树数据格式无效");
        throw new Error("图层树数据格式无效");
      }
    } else {
      console.warn("图层树数据为空");
      throw new Error("图层树数据为空");
    }
  } catch (error) {
    console.error("加载图层树数据失败:", error);
  }
}

// 组件挂载时初始化地图
onMounted(() => {
  // 开发模式下减少延迟，生产模式保持延迟
  const delay = isDev ? 100 : 500;

  setTimeout(() => {
    // 检查容器是否存在
    const container = document.getElementById("mapbox-container");
    if (container && !isInitialized.value) {
      initMapboxMap();
    }
  }, delay);
  loadMapTree();
});

// 组件卸载时清理资源
onBeforeUnmount(() => {
  try {
    // 开发模式下不清理地图实例，避免热更新时重新初始化
    if (!isDev && mapInstance.value) {
      mapInstance.value.remove();
      mapInstance.value = null;
      isInitialized.value = false;
      geoJsonLoaded.value = false;
    }

    // 只在生产模式下清理store
    if (!isDev) {
      mapStore.setMap(null);
    }
  } catch (error) {
    console.error("清理地图资源失败:", error);
  }
});
</script>

<style scoped>
.mapbox-map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: calc(100vh - 148px); /* 确保最小高度 */
}

.mapbox-instance {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-mask {
  position: absolute;
  top: 0;
  width: 200px;
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
  pointer-events: none;
  z-index: 1000;
}

.map-mask-left {
  left: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
}

.map-mask-right {
  right: 0;
  background: linear-gradient(270deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
}

/* Mapbox GL JS 样式覆盖 */
:deep(.mapboxgl-canvas) {
  border-radius: 8px;
  width: 100% !important;
  height: 100% !important;
}

:deep(.mapboxgl-popup) {
  max-width: 300px;
}

:deep(.mapboxgl-popup-content) {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.mapboxgl-popup-close-button) {
  font-size: 16px;
  color: var(--text-secondary);
}

:deep(.mapboxgl-popup-close-button:hover) {
  color: var(--text-primary);
}
:deep(.mapboxgl-control-container){
  position: absolute;
  top: 600px;
  right: 1200px;
  display: none;
}

/* 比例尺样式自定义 - 增大文字尺寸 */
:deep(.mapboxgl-ctrl-scale) {
  background-color: rgba(8, 21, 38, 0.7);
  border: 2px solid #1677ff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 26px !important;
  font-weight: 600;
  color: #1677ff;
  line-height: 1.2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}

:deep(.mapboxgl-ctrl-scale:not(:first-child)) {
  border-top: 2px solid #1677ff;
  margin-top: 2px;
}
</style>
