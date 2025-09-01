<template>
  <div class="mapbox-map-container">
    <div id="mapbox-container" class="mapbox-instance">
      <!-- 左侧遮挡层 -->
      <div class="map-mask-left map-mask"></div>
      <!-- 右侧遮挡层 -->
      <div class="map-mask-right map-mask"></div>
      <!-- Mapbox地图工具 -->
      <MapboxMapTools />
    </div>
  </div>
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  nextTick,
  ref,
  provide,
} from "vue";
import mapboxgl from "mapbox-gl";
import MapboxMapTools from "./MapboxMapTools.vue";
import InfoWindow from "../components/InfoWindow.vue";
import yangxinGeoJson from "../assets/yangxin.json";
import { useMapStore } from "../stores/mapStore";
import { mapboxUtils } from "@/mapUtils/mapboxUtils";
import { dataUtils } from "../mapUtils/dataUtils";

// 导入图标资源
import dizhizaihaiyinghuandianIcon from "../assets/icons/dizhizaihaiyinghuandian.png";
import weixianyuanIcon from "../assets/icons/weixianyuan.png";
import yiliaoweishengIcon from "../assets/icons/yiliaoweisheng.png";
import yingjbihusuoIcon from "../assets/icons/yingjibihusuo.png";
import shexiangtouIcon from "../assets/icons/shexiangtou.png";
import yongjicangkuIcon from "../assets/icons/yongjicangku.png";
import yunshubaozhangIcon from "../assets/icons/yunshubaozhang.png";
import fanghumubiaoIcon from "../assets/icons/fanghumubiao.png";

// 使用地图store
const mapStore = useMapStore();

// 地图实例ref，用于工具组件
const mapInstance = ref(null);

// 提供地图实例给子组件
provide("mapInstance", mapInstance);

// 支持多个GeoJSON数据源
const geoJsonData = [
  { data: yangxinGeoJson, name: "阳新县行政区划" },
];

// 初始化Mapbox地图
function initMapboxMap() {
  try {
    console.log("开始初始化Mapbox地图...");
    mapStore.setMapLoading(true);
    
    // 检查容器是否存在
    const container = document.getElementById("mapbox-container");
    if (!container) {
      throw new Error("地图容器不存在: mapbox-container");
    }
    
    console.log("地图容器找到，开始创建地图实例...");
    console.log("容器尺寸:", container.offsetWidth, "x", container.offsetHeight);
    
    // 使用mapboxUtils初始化map
    const map = mapboxUtils.initMap("mapbox-container");
    
    console.log("地图实例创建成功:", map);
    
    // 设置到store和ref
    mapStore.setMap(map);
    mapInstance.value = map;
    
    // 地图加载完成后加载数据
    map.on('load', async () => {
      console.log("地图加载完成，开始加载数据...");
      try {
        // 地图加载完成后，设置默认相机位置
        map.flyTo({
          center: [115.133954, 29.823198], // 阳新县中心坐标
          zoom: 10,
          duration: 2000
        });
        
        console.log("相机位置设置完成");
        
        await loadGeoJSONData();
        await loadPOIMarkers();
        await loadVectorTileLayers();
        
        console.log("所有数据加载完成");
      } catch (error) {
        console.error("加载地图数据时发生错误:", error);
      } finally {
        mapStore.setMapLoading(false);
        console.log("地图初始化完成");
      }
    });

    // 添加错误处理
    map.on('error', (error) => {
      console.error('地图加载错误:', error);
      mapStore.setMapLoading(false);
    });

    // 添加样式加载完成事件
    map.on('styledata', () => {
      console.log("地图样式加载完成");
    });

    // 添加数据加载事件
    map.on('sourcedata', (event) => {
      if (event.isSourceLoaded) {
        console.log("数据源加载完成:", event.sourceId);
      }
    });

    // 添加渲染事件
    map.on('render', () => {
      if (!map.isStyleLoaded()) {
        console.log("地图样式正在加载中...");
      }
    });

  } catch (error) {
    console.error("Mapbox地图初始化失败:", error);
    mapStore.setMapLoading(false);
  }
}

// 加载并渲染GeoJSON数据
async function loadGeoJsonData() {
  try {
    const map = mapStore.map;
    if (!map) {
      console.error("Map未初始化");
      return;
    }

    // 清除之前的数据源
    clearAllDataSources();

    let totalFeatures = 0;

    // 遍历所有数据源
    for (const dataSource of geoJsonData) {
      if (!dataUtils.validateGeoJSON(dataSource.data)) {
        console.warn(`GeoJSON数据源 ${dataSource.name} 格式错误`);
        continue;
      }

      // 使用mapboxUtils加载GeoJSON数据
      const sourceId = `geojson-${dataSource.name}`;
      await mapboxUtils.loadGeoJSON(
        map,
        sourceId,
        dataSource.data,
        {
          strokeColor: "#fa541c",
          strokeWidth: 2,
          fillColor: "rgba(250, 84, 28, 0.1)",
        }
      );

      totalFeatures += dataSource.data.features.length;
    }

    console.log("GeoJSON数据加载完成，共渲染", totalFeatures, "个区域");
  } catch (error) {
    console.error("加载GeoJSON数据失败:", error);
  }
}

// 加载矢量切片图层
async function loadVectorTileLayers() {
  try {
    const map = mapStore.map;
    if (!map) {
      console.error("Map未初始化");
      return;
    }

    console.log("开始加载矢量切片图层...");

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

    console.log("矢量切片图层加载完成");

  } catch (error) {
    console.error("加载矢量切片图层失败:", error);
  }
}

// 加载POI标注
function loadPOIMarkers() {
  try {
    const map = mapStore.map;
    if (!map) {
      console.error("Map未初始化");
      return;
    }

    // POI数据
    const poiData = [
      {
        id: "poi_1",
        name: "地质灾害隐患点1",
        position: [115.2167, 29.8333],
        type: "disaster_point",
        description: "地址：阳新县兴国镇政府附近<br/>风险等级：中等<br/>监测状态：正常<br/>负责人：张三 13800138001",
        icon: dizhizaihaiyinghuandianIcon,
      },
      {
        id: "poi_2",
        name: "地质灾害隐患点2",
        position: [115.12, 29.78],
        type: "disaster_point",
        description: "地址：阳新县白沙镇山区<br/>风险等级：高<br/>监测状态：预警<br/>负责人：李四 13800138002",
        icon: dizhizaihaiyinghuandianIcon,
      },
      {
        id: "poi_3",
        name: "危险源监测点",
        position: [115.25, 29.85],
        type: "hazard_source",
        description: "地址：阳新县工业园区<br/>监测类型：化学品<br/>风险等级：高<br/>负责人：王五 13800138003",
        icon: weixianyuanIcon,
      },
      {
        id: "poi_4",
        name: "医疗卫生点",
        position: [115.15, 29.82],
        type: "medical",
        description: "地址：阳新县人民医院<br/>服务类型：综合医院<br/>床位：500张<br/>负责人：赵六 13800138004",
        icon: yiliaoweishengIcon,
      },
      {
        id: "poi_5",
        name: "应急避难所",
        position: [115.18, 29.79],
        type: "emergency_shelter",
        description: "地址：阳新县体育中心<br/>容纳人数：2000人<br/>设施：医疗、餐饮<br/>负责人：钱七 13800138005",
        icon: yingjbihusuoIcon,
      },
      {
        id: "poi_6",
        name: "监控摄像头",
        position: [115.22, 29.81],
        type: "camera",
        description: "地址：阳新县主要路口<br/>监控范围：500米<br/>状态：正常<br/>负责人：孙八 13800138006",
        icon: shexiangtouIcon,
      },
      {
        id: "poi_7",
        name: "应急物资仓库",
        position: [115.16, 29.84],
        type: "warehouse",
        description: "地址：阳新县物流园区<br/>物资类型：救援装备<br/>库存：充足<br/>负责人：周九 13800138007",
        icon: yongjicangkuIcon,
      },
      {
        id: "poi_8",
        name: "运输保障点",
        position: [115.19, 29.77],
        type: "transport",
        description: "地址：阳新县交通枢纽<br/>车辆数量：50辆<br/>状态：待命<br/>负责人：吴十 13800138008",
        icon: yunshubaozhangIcon,
      },
      {
        id: "poi_9",
        name: "防护目标点",
        position: [115.21, 29.83],
        type: "protection_target",
        description: "地址：阳新县重要设施<br/>保护等级：一级<br/>措施：24小时监控<br/>负责人：郑十一 13800138009",
        icon: fanghumubiaoIcon,
      },
    ];

    // 使用mapboxUtils添加POI标注
    mapboxUtils.addPOIMarkers(map, poiData);

  } catch (error) {
    console.error("加载POI标注失败:", error);
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
        map.removeLayer(`${sourceId}-layer`);
        map.removeSource(sourceId);
      }
    });

    // 清除POI标注
    mapboxUtils.clearPOIMarkers(map);

    console.log("所有数据源已清除");
  } catch (error) {
    console.error("清除数据源失败:", error);
  }
}

// 组件挂载时初始化地图
onMounted(() => {
  nextTick(() => {
    initMapboxMap();
  });
});

// 组件卸载时清理资源
onUnmounted(() => {
  try {
    if (mapInstance.value) {
      mapInstance.value.remove();
      mapInstance.value = null;
    }
    mapStore.setMap(null);
  } catch (error) {
    console.error("清理地图资源失败:", error);
  }
});
</script>

<style scoped>
.mapbox-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
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
