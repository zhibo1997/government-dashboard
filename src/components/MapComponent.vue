<template>
  <div class="map-container">
    <div id="tianditu-map" class="map-instance">
      <!-- 左侧遮挡层 -->
      <div class="map-mask-left map-mask"></div>
      <!-- 右侧遮挡层 -->
      <div class="map-mask-right map-mask"></div>
      <!-- 地图工具 -->
      <MapTools />
    </div>
    <!-- <MapLegend /> -->
    <!-- <PoiLegend /> -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick, ref, reactive, provide } from "vue";
import MapTools from "./MapTools.vue";
import yangxinGeoJson from "../assets/yangxin.json";
// import { POI_TYPES, RISK_LEVELS, markerStyles, poiData } from '../data/poiData.js'

// 图层管理
let map = null;
let polygonLayers = [];
let labelLayers = [];
// let markerLayers = []  // 点位标记图层

// 地图实例ref，用于工具组件
const mapInstance = ref(null);

// 提供地图实例给子组件
provide("mapInstance", mapInstance);

// 支持多个GeoJSON数据源
const geoJsonDataSources = [
  { data: yangxinGeoJson, name: "阳新县行政区划" },
  // 可以在这里添加更多的GeoJSON数据源
  // { data: otherGeoJson, name: '其他行政区划' }
];

// 区域边界样式配置（仅轮廓线，无填充）
const boundaryStyle = {
  color: "#531dab",
  weight: 4,
  opacity: 1,
  fillColor: "transparent",
  fillOpacity: 0, // 无填充
};

// 加载并渲染所有GeoJSON数据
function loadGeoJsonData() {
  try {
    // 清除之前的图层
    clearAllLayers();

    let totalFeatures = 0;

    // 遍历所有数据源
    geoJsonDataSources.forEach((dataSource) => {
      if (!dataSource.data) {
        console.warn(`GeoJSON数据源 ${dataSource.name} 格式错误`);
        return;
      }

      // 处理单个Feature或FeatureCollection
      const features =
        dataSource.data.type === "FeatureCollection"
          ? dataSource.data.features
          : [dataSource.data];

      // 遍历每个行政区域
      features.forEach((feature, index) => {
        const { properties, geometry } = feature;
        const areaName = properties.name;

        if (geometry.type === "MultiPolygon") {
          // 处理MultiPolygon类型
          geometry.coordinates.forEach((polygonCoords) => {
            const polygon = createPolygonFromCoords(polygonCoords[0], areaName);
            if (polygon) {
              map.addOverLay(polygon);
              polygonLayers.push(polygon);
              totalFeatures++;
            }
          });
        } else if (geometry.type === "Polygon") {
          // 处理Polygon类型
          const polygon = createPolygonFromCoords(
            geometry.coordinates[0],
            areaName
          );
          if (polygon) {
            map.addOverLay(polygon);
            polygonLayers.push(polygon);
            totalFeatures++;
          }
        }
      });
    });

    console.log("GeoJSON数据加载完成，共渲染", totalFeatures, "个区域");

    // 加载点位数据
    // loadPoiData()
  } catch (error) {
    console.error("加载GeoJSON数据失败:", error);
  }
}

// 清除所有图层
function clearAllLayers() {
  // 清除多边形图层
  polygonLayers.forEach((layer) => {
    if (map && layer) {
      map.removeOverLay(layer);
    }
  });
  polygonLayers = [];

  // 清除标签图层
  labelLayers.forEach((layer) => {
    if (map && layer) {
      map.removeOverLay(layer);
    }
  });
  labelLayers = [];

  // 清除点位标记图层
  // markerLayers.forEach(layer => {
  //   if (map && layer) {
  //     map.removeOverLay(layer)
  //   }
  // })
  // markerLayers = []
}

// 加载点位数据
// function loadPoiData() {
//   try {
//     console.log('开始加载点位数据...')
//
//     poiData.forEach(poi => {
//       const marker = createPoiMarker(poi)
//       if (marker) {
//         map.addOverLay(marker)
//         markerLayers.push(marker)
//       }
//     })
//
//     console.log('点位数据加载完成，共渲染', poiData.length, '个点位')
//   } catch (error) {
//     console.error('加载点位数据失败:', error)
//   }
// }

// 创建点位标记
// function createPoiMarker(poi) {
//   try {
//     const { coordinates, type, riskLevel, name, description } = poi
//     const [lng, lat] = coordinates
//
//     // 获取样式配置
//     const style = markerStyles[type]?.[riskLevel]
//     if (!style) {
//       console.warn(`未找到点位样式配置: ${type}-${riskLevel}`)
//       return null
//     }
//
//     // 创建标记点
//     const position = new T.LngLat(lng, lat)
//     const marker = new T.Marker(position)
//
//     // 设置标记图标
//     const icon = new T.Icon({
//       iconUrl: createMarkerIcon(style.color, style.icon),
//       iconSize: new T.Point(32, 32),
//       iconAnchor: new T.Point(16, 32)
//     })
//     marker.setIcon(icon)
//
//     // 添加标记标签
//     const label = new T.Label({
//       text: name,
//       position: position,
//       offset: new T.Point(0, -40)
//     })
//
//     // 设置标签样式
//     label.setStyle({
//       color: style.color,
//       fontSize: '12px',
//       fontWeight: 'bold',
//       backgroundColor: 'rgba(255, 255, 255, 0.9)',
//       border: `2px solid ${style.color}`,
//       borderRadius: '4px',
//       padding: '2px 6px',
//       textAlign: 'center'
//     })
//
//     map.addOverLay(label)
//     markerLayers.push(label)
//
//     return marker
//   } catch (error) {
//     console.error('创建点位标记失败:', error)
//     return null
//   }
// }

// 创建标记图标（SVG格式）
// function createMarkerIcon(color, emoji) {
//   const svg = `
//     <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
//       <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
//       <text x="16" y="20" text-anchor="middle" font-size="14" fill="white">${emoji}</text>
//     </svg>
//   `
//   return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
// }

// 创建多边形（仅轮廓线）
function createPolygonFromCoords(coordinates, areaName) {
  try {
    const points = coordinates.map((coord) => new T.LngLat(coord[0], coord[1]));

    const polygon = new T.Polygon(points, boundaryStyle);

    // 创建区域标签
    createAreaLabel(points, areaName);

    return polygon;
  } catch (error) {
    console.error("创建多边形失败:", error);
    return null;
  }
}

// 创建区域标签
function createAreaLabel(points, areaName) {
  try {
    // 计算多边形中心点
    const center = calculatePolygonCenter(points);

    // 创建标签，使用天地图API的正确方式
    const label = new T.Label({
      text: areaName,
      position: center,
      offset: new T.Point(0, 0),
    });

    // 天地图API的Label可能不支持setStyle方法
    // 直接添加到地图上，使用默认样式
    map.addOverLay(label);
    labelLayers.push(label);
  } catch (error) {
    console.error("创建标签失败:", error);
  }
}

// 计算多边形中心点
function calculatePolygonCenter(points) {
  let totalLng = 0;
  let totalLat = 0;

  points.forEach((point) => {
    totalLng += point.lng;
    totalLat += point.lat;
  });

  return new T.LngLat(totalLng / points.length, totalLat / points.length);
}

// 初始化天地图
function initTiandituMap() {
  try {
    // 检查天地图API是否加载
    if (typeof T === "undefined") {
      console.error("天地图API未加载，请检查网络连接或API密钥");
      return;
    }

    // 创建地图实例
    // 设置默认为混合地图
    var imageURL =
      "http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=8e9b6992f51c6dda16ba9c653bcabba1";

    var layer = new T.TileLayer(imageURL, { minZoom: 1, maxZoom: 18 });

    map = new T.Map("tianditu-map", {
      layers: [layer],
    });

    // 将地图实例赋值给ref，供工具组件使用
    mapInstance.value = map;

    // 设置默认地图中心点和缩放级别
    // 默认显示湖北省黄石市区域（包含阳新县）
    const defaultCenter = new T.LngLat(115.133954, 29.823198);
    map.centerAndZoom(defaultCenter, 11);

    // 添加地图类型控件
    const ctrl = new T.Control.MapType();
    map.addControl(ctrl);

    // 地图加载完成后加载GeoJSON数据
    setTimeout(() => {
      console.log("开始加载GeoJSON数据...");
      loadGeoJsonData();
    }, 200);
  } catch (error) {
    console.error("天地图初始化失败:", error);
  }
}

onMounted(async () => {
  // 等待DOM渲染完成后初始化地图
  await nextTick();
  initTiandituMap();
});

onUnmounted(() => {
  // 清除图层
  polygonLayers.forEach((layer) => {
    if (map && layer) {
      map.removeOverLay(layer);
    }
  });
  polygonLayers = [];

  // 清除标签
  labelLayers.forEach((layer) => {
    if (map && layer) {
      map.removeOverLay(layer);
    }
  });
  labelLayers = [];

  // 销毁地图实例
  if (map) {
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  /* 渐变 */
  z-index: 1;
  height: 100%;
  width: 2400px;
}

.map-instance {
  position: relative;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
}
.map-mask {
  position: absolute;
  top: 0;
  z-index: 4000;
  width: 400px;
  height: 100%;
  pointer-events: none;
}
/* 左侧遮挡层 */
.map-mask-left {
  top: 0;
  left: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 1), transparent);
}

/* 右侧遮挡层 */
.map-mask-right {
  right: 0;
  background: linear-gradient(to left, rgba(0, 0, 0, 1), transparent);
}
</style>
