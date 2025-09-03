<template>
    <div class="mapbox-map-wrapper">
        <div id="mapbox-container" class="mapbox-instance"></div>
        <MapboxMapTools />
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
import mapboxgl from "@cgcs2000/mapbox-gl";
import yangxinGeoJson from "../assets/yangxin.json";
import MapboxMapTools from "./MapboxMapTools.vue";
import { useMapStore } from "../stores/mapStore";
import { mapboxUtils } from "@/mapUtils/mapboxUtils";
import { dataUtils } from "../mapUtils/dataUtils";



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
const geoJsonData = [
  { data: yangxinGeoJson, name: "阳新县行政区划" },
];

// 桥梁设施图层配置
const bridgeLayerConfig = {
  id: "bridge-facilities",
  name: "桥梁设施",
  type: "symbol",
  visible: true,
  data: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [115.186322, 29.864861] // 示例桥梁位置
        },
        properties: {
          name: "阳新大桥",
          type: "桥梁",
          status: "正常",
          buildYear: "2018"
        }
      },
      {
        type: "Feature", 
        geometry: {
          type: "Point",
          coordinates: [115.200000, 29.850000] // 示例桥梁位置2
        },
        properties: {
          name: "富水河大桥",
          type: "桥梁", 
          status: "正常",
          buildYear: "2020"
        }
      }
    ]
  },
  style: {
    iconImage: "bridge-icon",
    iconSize: 1.2,
    iconColor: "#1677ff",
    textField: ["get", "name"],
    textFont: ["Open Sans Regular"],
    textSize: 12,
    textColor: "#1677ff",
    textOffset: [0, 2],
    textHaloColor: "#ffffff",
    textHaloWidth: 1
  }
};

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
    map.on('load', async () => {
      try {
        await loadGeoJsonData();
        
        // 默认加载桥梁设施图层
        await loadDefaultBridgeLayer();
        
        // 添加指北针控件
        mapboxUtils.addCompassControl(map, 'top-right');
        
        console.log("地图初始化完成，已默认加载桥梁设施图层");
      } catch (error) {
        console.error("加载地图数据时发生错误:", error);
      } finally {
        mapStore.setMapLoading(false);
      }
    });

    // 添加错误处理
    map.on('error', (error) => {
      console.error('地图加载错误:', error);
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
      console.log("🚀 ~ loadGeoJsonData ~ dataSource:", dataSource)
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
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const validTypes = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
  return validTypes.includes(data.type);
}

// 计算总要素数量
function calculateTotalFeatures() {
  let totalFeatures = 0;
  
  for (const dataSource of geoJsonData) {
    if (dataSource.data.type === 'Feature') {
      totalFeatures += 1;
    } else if (dataSource.data.type === 'FeatureCollection') {
      totalFeatures += dataSource.data.features?.length || 0;
    }
  }
  
  return totalFeatures;
}

// 默认加载桥梁设施图层
async function loadDefaultBridgeLayer() {
  if (!mapInstance.value) {
    console.error("地图未初始化，无法加载桥梁设施图层");
    return false;
  }

  try {
    const map = mapInstance.value;
    const bridgeLayerUrl = "http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_bridgebscinfo.json";
    
    // 获取桥梁图层样式配置
    const response = await fetch(bridgeLayerUrl);
    if (!response.ok) {
      throw new Error(`获取桥梁图层配置失败: ${response.status}`);
    }
    
    const styleConfig = await response.json();
    const { layers, sources } = styleConfig;

    // 添加数据源和图层
    for (let layer of layers) {
      const sourceConfig = sources[layer.source];
      
      // 添加数据源（如果不存在）
      if (!map.getSource(layer.source)) {
        map.addSource(layer.source, sourceConfig);
      }
      
      // 添加图层（如果不存在）
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
      }
    }

    // 更新store中的图层状态为可见
    mapStore.updateLayerTreeState({
      layerId: 'bridge_layer',
      visible: true
    });

    console.log("桥梁设施图层默认加载完成");
    return true;

  } catch (error) {
    console.error("默认加载桥梁设施图层失败:", error);
    return false;
  }
}

// 加载桥梁设施图层
async function loadBridgeFacilitiesLayer() {
  if (!mapInstance.value) {
    console.error("地图未初始化，无法加载桥梁设施图层");
    return false;
  }

  try {
    const map = mapInstance.value;
    const sourceId = bridgeLayerConfig.id;

    // 检查数据源是否已存在
    if (map.getSource(sourceId)) {
      console.log("桥梁设施图层已存在，跳过加载");
      return true;
    }

    // 添加桥梁图标（如果不存在）
    if (!map.hasImage("bridge-icon")) {
      // 创建简单的桥梁图标
      const bridgeIcon = createBridgeIcon();
      map.addImage("bridge-icon", bridgeIcon);
    }

    // 添加数据源
    map.addSource(sourceId, {
      type: "geojson",
      data: bridgeLayerConfig.data
    });

    // 添加桥梁图标图层
    map.addLayer({
      id: `${sourceId}-icons`,
      type: "symbol",
      source: sourceId,
      layout: {
        "icon-image": bridgeLayerConfig.style.iconImage,
        "icon-size": bridgeLayerConfig.style.iconSize,
        "icon-allow-overlap": true,
        "text-field": bridgeLayerConfig.style.textField,
        "text-font": bridgeLayerConfig.style.textFont,
        "text-size": bridgeLayerConfig.style.textSize,
        "text-offset": bridgeLayerConfig.style.textOffset,
        "text-anchor": "top"
      },
      paint: {
        "text-color": bridgeLayerConfig.style.textColor,
        "text-halo-color": bridgeLayerConfig.style.textHaloColor,
        "text-halo-width": bridgeLayerConfig.style.textHaloWidth
      }
    });

    // 添加点击事件
    map.on('click', `${sourceId}-icons`, (e) => {
      const feature = e.features[0];
      const coordinates = feature.geometry.coordinates.slice();
      const properties = feature.properties;

      // 创建弹窗内容
      const popupContent = `
        <div style="padding: 12px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1677ff; font-size: 14px;">${properties.name}</h4>
          <div style="font-size: 12px; color: #666;">
            <div><strong>类型：</strong>${properties.type}</div>
            <div><strong>状态：</strong><span style="color: ${properties.status === '正常' ? '#52c41a' : '#ff4d4f'}">${properties.status}</span></div>
            <div><strong>建设年份：</strong>${properties.buildYear}</div>
          </div>
        </div>
      `;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
    });

    // 鼠标悬停效果
    map.on('mouseenter', `${sourceId}-icons`, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', `${sourceId}-icons`, () => {
      map.getCanvas().style.cursor = '';
    });

    console.log("桥梁设施图层加载完成");
    return true;

  } catch (error) {
    console.error("加载桥梁设施图层失败:", error);
    return false;
  }
}

// 创建桥梁图标
function createBridgeIcon() {
  const canvas = document.createElement('canvas');
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 绘制桥梁图标
    ctx.fillStyle = '#1677ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // 绘制桥梁主体
    ctx.fillRect(4, 12, 24, 8);
    ctx.strokeRect(4, 12, 24, 8);

    // 绘制桥墩
    ctx.fillRect(10, 8, 3, 16);
    ctx.fillRect(19, 8, 3, 16);
    ctx.strokeRect(10, 8, 3, 16);
    ctx.strokeRect(19, 8, 3, 16);

    // 绘制桥拱
    ctx.beginPath();
    ctx.arc(16, 20, 6, Math.PI, 0);
    ctx.stroke();
  }

  return canvas;
}

// 默认加载桥梁设施图层
async function loadDefaultBridgeLayer() {
  if (!mapInstance.value) {
    console.error("地图未初始化，无法加载桥梁设施图层");
    return false;
  }

  try {
    const map = mapInstance.value;
    const bridgeLayerUrl = "http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_bridgebscinfo.json";
    
    // 获取桥梁图层样式配置
    const response = await fetch(bridgeLayerUrl);
    if (!response.ok) {
      throw new Error(`获取桥梁图层配置失败: ${response.status}`);
    }
    
    const styleConfig = await response.json();
    const { layers, sources } = styleConfig;

    // 添加数据源和图层
    for (let layer of layers) {
      const sourceConfig = sources[layer.source];
      
      // 添加数据源（如果不存在）
      if (!map.getSource(layer.source)) {
        map.addSource(layer.source, sourceConfig);
      }
      
      // 添加图层（如果不存在）
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
      }
    }

    // 更新store中的图层状态为可见
    mapStore.updateLayerTreeState({
      layerId: 'bridge_layer',
      visible: true
    });

    console.log("桥梁设施图层默认加载完成");
    return true;

  } catch (error) {
    console.error("默认加载桥梁设施图层失败:", error);
    
    // 如果远程加载失败，使用本地示例数据
    console.log("尝试加载本地桥梁设施数据...");
    return await loadBridgeFacilitiesLayer();
  }
}




// 清除所有数据源
function clearAllDataSources() {
  try {
    const map = mapStore.map;
    if (!map) return;

    // 清除GeoJSON图层
    geoJsonData.forEach(dataSource => {
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
</style>
