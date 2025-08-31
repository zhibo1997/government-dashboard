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
import {
  onMounted,
  onUnmounted,
  nextTick,
  ref,
  reactive,
  provide,
  createApp,
} from "vue";
import MapTools from "./MapTools.vue";
import InfoWindow from "../InfoWindow.vue";
import yangxinGeoJson from "@/assets/yangxin.json";
// 导入图标资源
import dizhizaihaiyinghuandianIcon from "@/assets/icons/dizhizaihaiyinghuandian.png";
import weixianyuanIcon from "@/assets/icons/weixianyuan.png";
import yiliaoweishengIcon from "@/assets/icons/yiliaoweisheng.png";
import yingjbihusuoIcon from "@/assets/icons/yingjibihusuo.png";
import shexiangtouIcon from "@/assets/icons/shexiangtou.png";
import yongjicangkuIcon from "@/assets/icons/yongjicangku.png";
import yunshubaozhangIcon from "@/assets/icons/yunshubaozhang.png";
import fanghumubiaoIcon from "@/assets/icons/fanghumubiao.png";
// import { POI_TYPES, RISK_LEVELS, markerStyles, poiData } from '../data/poiData.js'

// 图层管理
let map = null;
let polygonLayers = [];
let labelLayers = [];
let markerLayers = []; // 点位标记图层

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
  color: "#fa541c",
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
    loadCustomMarkers();
  } catch (error) {
    console.error("加载GeoJSON数据失败:", error);
  }
}

// 添加自定义标注
function loadCustomMarkers() {
  try {
    console.log("开始添加自定义标注...");

    // 定义不同类型的标注点数据
    const markerData = [
      {
        name: "地质灾害隐患点1",
        position: [115.2167, 29.8333],
        iconPath: dizhizaihaiyinghuandianIcon,
        description:
          "地址：阳新县兴国镇政府附近<br/>风险等级：中等<br/>监测状态：正常<br/>负责人：张三 13800138001",
      },
      {
        name: "地质灾害隐患点2",
        position: [115.12, 29.78],
        iconPath: dizhizaihaiyinghuandianIcon,
        description:
          "地址：阳新县白沙镇山区<br/>风险等级：高<br/>监测状态：预警<br/>负责人：李四 13800138002",
      },
      {
        name: "危险源监测点1",
        position: [115.15, 29.9],
        iconPath: weixianyuanIcon,
        description:
          "地址：阳新县化工园区<br/>监测类型：化学品储存<br/>安全状态：正常<br/>联系电话：0714-7350001",
      },
      {
        name: "危险源监测点2",
        position: [115.28, 29.82],
        iconPath: weixianyuanIcon,
        description:
          "地址：阳新县工业区东部<br/>监测类型：易燃易爆<br/>安全状态：正常<br/>联系电话：0714-7350002",
      },
      {
        name: "危险源监测点3",
        position: [115.11, 29.87],
        iconPath: weixianyuanIcon,
        description:
          "地址：阳新县港口码头<br/>监测类型：危险品运输<br/>安全状态：正常<br/>联系电话：0714-7350003",
      },
      {
        name: "医疗卫生机构1",
        position: [115.25, 29.85],
        iconPath: yiliaoweishengIcon,
        description:
          "机构名称：阳新县人民医院<br/>床位数：500张<br/>急救能力：三级甲等<br/>联系电话：0714-7350120",
      },
      {
        name: "医疗卫生机构2",
        position: [115.16, 29.79],
        iconPath: yiliaoweishengIcon,
        description:
          "机构名称：阳新县中医院<br/>床位数：300张<br/>急救能力：二级甲等<br/>联系电话：0714-7350121",
      },
      {
        name: "应急避护所1",
        position: [115.18, 29.88],
        iconPath: yingjbihusuoIcon,
        description:
          "场所名称：阳新县体育中心<br/>容纳人数：5000人<br/>设施状态：完好<br/>管理员：王五 13800138005",
      },
      {
        name: "应急避护所2",
        position: [115.24, 29.77],
        iconPath: yingjbihusuoIcon,
        description:
          "场所名称：阳新县文化广场<br/>容纳人数：3000人<br/>设施状态：完好<br/>管理员：赵六 13800138006",
      },
      {
        name: "摄像头监控1",
        position: [115.23, 29.81],
        iconPath: shexiangtouIcon,
        description:
          "监控点位：县政府大楼前<br/>监控范围：主要道路<br/>设备状态：在线<br/>维护单位：县公安局",
      },
      {
        name: "摄像头监控2",
        position: [115.13, 29.84],
        iconPath: shexiangtouIcon,
        description:
          "监控点位：工业园区入口<br/>监控范围：园区道路<br/>设备状态：在线<br/>维护单位：县公安局",
      },
      {
        name: "摄像头监控3",
        position: [115.27, 29.86],
        iconPath: shexiangtouIcon,
        description:
          "监控点位：港口码头区域<br/>监控范围：码头作业区<br/>设备状态：在线<br/>维护单位：县公安局",
      },
      {
        name: "应急仓库1",
        position: [115.17, 29.86],
        iconPath: yongjicangkuIcon,
        description:
          "仓库名称：县应急物资储备库<br/>储备物资：救灾帐篷、食品、药品<br/>库存状态：充足<br/>管理员：孙七 13800138007",
      },
      {
        name: "应急仓库2",
        position: [115.22, 29.76],
        iconPath: yongjicangkuIcon,
        description:
          "仓库名称：县防汛物资仓库<br/>储备物资：沙袋、救生设备、抽水泵<br/>库存状态：充足<br/>管理员：周八 13800138008",
      },
      {
        name: "运输保障点",
        position: [115.19, 29.82],
        iconPath: yunshubaozhangIcon,
        description:
          "保障单位：阳新县交通运输局<br/>车辆数量：应急车辆50台<br/>服务范围：全县应急运输<br/>联系电话：0714-7350110",
      },
      {
        name: "防护目标",
        position: [115.26, 29.84],
        iconPath: fanghumubiaoIcon,
        description:
          "目标名称：阳新县水厂<br/>重要等级：一级<br/>防护状态：正常<br/>安保负责人：吴九 13800138009",
      },
    ];

    // 创建标注点
    markerData.forEach((data, index) => {
      try {
        // 创建自定义图标
        const icon = new T.Icon({
          iconUrl: data.iconPath,
          iconSize: new T.Point(42, 80),
          iconAnchor: new T.Point(16, 32),
        });

        // 创建标记点
        const marker = new T.Marker(
          new T.LngLat(data.position[0], data.position[1]),
          { icon: icon }
        );

        // 添加点击事件监听器
        addClickHandler(data, marker);

        // 添加到地图
        map.addOverLay(marker);
        markerLayers.push(marker);

        console.log(
          `添加标注点: ${data.name} at [${data.position[0]}, ${data.position[1]}]`
        );
      } catch (error) {
        console.error(`添加标注点 ${data.name} 失败:`, error);
      }
    });

    // 为标注点添加点击事件处理函数
    function addClickHandler(data, marker) {
      marker.addEventListener("click", function (e) {
        openInfoWindow(data, e);
      });
    }

    // 打开信息窗口
    function openInfoWindow(data, e) {
      try {
        const point = e.lnglat;

        // 创建一个临时的DOM容器
        const tempContainer = document.createElement("div");

        // 创建Vue应用实例
        const app = createApp(InfoWindow, {
          title: "桥梁监测预警",
          infoItems: [
            { label: "桥梁名称", value: "莲花湖一桥" },
            { label: "桥梁类型", value: "斜拉桥" },
            { label: "在役年限", value: "15年" },
            { label: "养护类型", value: "巡检" },
          ],
          maintenanceUnit: {
            label: "养护单位",
            value: "阳新绿洲园林绿化养护有限公司",
          },
          statusMessage: "2号光纤光栅温度计 温度异常",
          onClose: () => {
            map.closeInfoWindow();
          },
          onDetail: () => {
            console.log("查看详情");
          },
        });

        // 挂载组件到临时容器
        app.mount(tempContainer);

        // 获取渲染后的HTML内容
        const content = tempContainer.innerHTML;

        // 创建信息窗口
        const infoWindow = new T.InfoWindow(content, {
          offset: new T.Point(0, -40),
        });

        // 打开信息窗口
        map.openInfoWindow(infoWindow, point);

        // 添加关闭按钮事件监听
        setTimeout(() => {
          const closeBtn = document.querySelector(".close-btn");
          if (closeBtn) {
            closeBtn.addEventListener("click", () => {
              map.closeInfoWindow();
            });
          }

          const detailBtn = document.querySelector(".detail-btn");
          if (detailBtn) {
            detailBtn.addEventListener("click", () => {
              console.log("查看详情");
            });
          }
        }, 100);

        console.log(`打开信息窗口: 桥梁监测预警`);
      } catch (error) {
        console.error(`打开信息窗口失败:`, error);
      }
    }

    console.log("自定义标注添加完成，共添加", markerLayers.length, "个标注点");
  } catch (error) {
    console.error("添加自定义标注失败:", error);
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
  markerLayers.forEach((layer) => {
    if (map && layer) {
      map.removeOverLay(layer);
    }
  });
  markerLayers = [];
}

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
    const imageURL =
      "http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=8e9b6992f51c6dda16ba9c653bcabba1";
    //创建自定义图层对象
   const lay = new T.TileLayer(imageURL, { minZoom: 1, maxZoom: 18 });

    // 创建地图实例
    map = new T.Map("tianditu-map", {layers:[lay]});

    // 将地图实例赋值给ref，供工具组件使用
    mapInstance.value = map;

    // 设置默认地图中心点和缩放级别
    // 默认显示湖北省黄石市区域（包含阳新县）
    const defaultCenter = new T.LngLat(115.133954, 29.823198);
    map.centerAndZoom(defaultCenter, 11);

    // 添加地图类型控件
    // const ctrl = new T.Control.MapType();
    // map.addControl(ctrl);

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

  // 清除标记
  markerLayers.forEach((layer) => {
    if (map && layer) {
      map.removeOverLay(layer);
    }
  });
  markerLayers = [];

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
