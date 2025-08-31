<template>
  <div class="cesium-map-container">
    <div id="cesium-container" class="cesium-instance">
      <!-- 左侧遮挡层 -->
      <div class="map-mask-left map-mask"></div>
      <!-- 右侧遮挡层 -->
      <div class="map-mask-right map-mask"></div>
      <!-- Cesium地图工具 -->
      <CesiumMapTools />
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
  createApp,
} from "vue";
import * as Cesium from "cesium";
import CesiumMapTools from "./CesiumMapTools.vue";
import InfoWindow from "../components/InfoWindow.vue";
import yangxinGeoJson from "../assets/yangxin.json";
import { useMapStore } from "../stores/mapStore";
import { cesiumUtils } from "@/mapUtils/cesiumUtils";
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

// 初始化Cesium地图
function initCesiumMap() {
  try {
    mapStore.setMapLoading(true);
    // 使用cesiumUtils初始化viewer
    const viewer = cesiumUtils.initViewer("cesium-container");
    
    // 设置到store和ref
    mapStore.setViewer(viewer);
    mapInstance.value = viewer;
    
    // 设置默认相机位置（阳新县区域）
    cesiumUtils.flyTo(115.133954, 29.823198, 50000);
    
    // 地图加载完成后加载数据
    setTimeout(async () => {
      console.log("开始加载地图数据...");
      try {
        await loadGeoJsonData();
        await loadPOIMarkers();
        await loadVectorTileLayers();
      } catch (error) {
        console.error("加载地图数据时发生错误:", error);
      } finally {
        mapStore.setMapLoading(false);
      }
    }, 500);
  } catch (error) {
    console.error("Cesium地图初始化失败:", error);
    mapStore.setMapLoading(false);
  }
}

// 加载并渲染GeoJSON数据
async function loadGeoJsonData() {
  try {
    const viewer = mapStore.viewer;
    if (!viewer) {
      console.error("Viewer未初始化");
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

      // 使用cesiumUtils加载GeoJSON数据
      const geoJsonDataSource = await cesiumUtils.loadGeoJSON(
        dataSource.data,
        {
          stroke: Cesium.Color.fromCssColorString("#fa541c"),
          strokeWidth: 4,
          fill: Cesium.Color.TRANSPARENT,
          clampToGround: true,
        }
      );

      totalFeatures += geoJsonDataSource.entities.values.length;
    }

    console.log("GeoJSON数据加载完成，共渲染", totalFeatures, "个区域");

    // 加载点位数据
    loadPOIMarkers();
  } catch (error) {
    console.error("加载GeoJSON数据失败:", error);
  }
}

// 加载矢量切片图层
async function loadVectorTileLayers() {
  try {
    const viewer = mapStore.viewer;
    if (!viewer) {
      console.error("Viewer未初始化");
      return;
    }

    console.log("开始加载矢量切片图层...");

    // 桥梁图层
    await cesiumUtils.loadVectorTileLayer(
      'bridge_layer',
      'http://192.168.3.249:8080/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT%3Agspsp_dtrans_bridgebscinfo@EPSG%3A4326@pbf/{z}/{x}/{y}.pbf',
      {
        maximumScreenSpaceError: 16,
        maximumMemoryUsage: 512,
        visible: true,
        alpha: 1.0,
        flyTo: false
      }
    );

    // 井盖图层
    await cesiumUtils.loadVectorTileLayer(
      'manhole_layer',
      'http://192.168.3.249:8080/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT%3Agspsp_dtrans_manholecoverbasetinfo@EPSG%3A4326@pbf/{z}/{x}/{y}.pbf',
      {
        maximumScreenSpaceError: 16,
        maximumMemoryUsage: 512,
        visible: true,
        alpha: 1.0,
        flyTo: false
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
    const viewer = mapStore.viewer;
    if (!viewer) {
      console.error("Viewer未初始化");
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
        name: "危险源监测点1",
        position: [115.15, 29.9],
        type: "danger_source",
        description: "地址：阳新县化工园区<br/>监测类型：化学品储存<br/>安全状态：正常<br/>联系电话：0714-7350001",
        icon: weixianyuanIcon,
      },
      {
        id: "poi_4",
        name: "危险源监测点2",
        position: [115.28, 29.82],
        type: "danger_source",
        description: "地址：阳新县工业区东部<br/>监测类型：易燃易爆<br/>安全状态：正常<br/>联系电话：0714-7350002",
        icon: weixianyuanIcon,
      },
      {
        id: "poi_5",
        name: "危险源监测点3",
        position: [115.11, 29.87],
        type: "danger_source",
        description: "地址：阳新县港口码头<br/>监测类型：危险品运输<br/>安全状态：正常<br/>联系电话：0714-7350003",
        icon: weixianyuanIcon,
      },
      {
        id: "poi_6",
        name: "医疗卫生机构1",
        position: [115.25, 29.85],
        type: "medical",
        description: "机构名称：阳新县人民医院<br/>床位数：500张<br/>急救能力：三级甲等<br/>联系电话：0714-7350120",
        icon: yiliaoweishengIcon,
      },
      {
        id: "poi_7",
        name: "医疗卫生机构2",
        position: [115.16, 29.79],
        type: "medical",
        description: "机构名称：阳新县中医院<br/>床位数：300张<br/>急救能力：二级甲等<br/>联系电话：0714-7350121",
        icon: yiliaoweishengIcon,
      },
      {
        id: "poi_8",
        name: "应急避护所1",
        position: [115.18, 29.88],
        type: "shelter",
        description: "场所名称：阳新县体育中心<br/>容纳人数：5000人<br/>设施状态：完好<br/>管理员：王五 13800138005",
        icon: yingjbihusuoIcon,
      },
      {
        id: "poi_9",
        name: "应急避护所2",
        position: [115.24, 29.77],
        type: "shelter",
        description: "场所名称：阳新县文化广场<br/>容纳人数：3000人<br/>设施状态：完好<br/>管理员：赵六 13800138006",
        icon: yingjbihusuoIcon,
      },
      {
        id: "poi_10",
        name: "摄像头监控1",
        position: [115.23, 29.81],
        type: "camera",
        description: "监控点位：县政府大楼前<br/>监控范围：主要道路<br/>设备状态：在线<br/>维护单位：县公安局",
        icon: shexiangtouIcon,
      },
      {
        id: "poi_11",
        name: "摄像头监控2",
        position: [115.13, 29.84],
        type: "camera",
        description: "监控点位：工业园区入口<br/>监控范围：园区道路<br/>设备状态：在线<br/>维护单位：县公安局",
        icon: shexiangtouIcon,
      },
      {
        id: "poi_12",
        name: "摄像头监控3",
        position: [115.27, 29.86],
        type: "camera",
        description: "监控点位：港口码头区域<br/>监控范围：码头作业区<br/>设备状态：在线<br/>维护单位：县公安局",
        icon: shexiangtouIcon,
      },
      {
        id: "poi_13",
        name: "应急仓库1",
        position: [115.17, 29.86],
        type: "warehouse",
        description: "仓库名称：县应急物资储备库<br/>储备物资：救灾帐篷、食品、药品<br/>库存状态：充足<br/>管理员：孙七 13800138007",
        icon: yongjicangkuIcon,
      },
      {
        id: "poi_14",
        name: "应急仓库2",
        position: [115.22, 29.76],
        type: "warehouse",
        description: "仓库名称：县防汛物资仓库<br/>储备物资：沙袋、救生设备、抽水泵<br/>库存状态：充足<br/>管理员：周八 13800138008",
        icon: yongjicangkuIcon,
      },
      {
        id: "poi_15",
        name: "运输保障点",
        position: [115.19, 29.82],
        type: "transport",
        description: "保障单位：阳新县交通运输局<br/>车辆数量：应急车辆50台<br/>服务范围：全县应急运输<br/>联系电话：0714-7350110",
        icon: yunshubaozhangIcon,
      },
      {
        id: "poi_16",
        name: "防护目标",
        position: [115.26, 29.84],
        type: "protection_target",
        description: "目标名称：阳新县水厂<br/>重要等级：一级<br/>防护状态：正常<br/>安保负责人：吴九 13800138009",
        icon: fanghumubiaoIcon,
      },
    ];

    // 使用cesiumUtils批量添加POI标注
    cesiumUtils.addPOIMarkers(poiData);
    
    // 更新store中的POI数据
    poiData.forEach(poi => {
      mapStore.addPOIMarker(poi);
    });

    console.log(`成功加载 ${poiData.length} 个POI标注`);

    // 添加点击事件监听器
    viewer.selectedEntityChanged.addEventListener(function () {
      const selectedEntity = viewer.selectedEntity;
      if (selectedEntity && selectedEntity.billboard) {
        openInfoWindow(selectedEntity);
      }
    });
  } catch (error) {
    console.error("加载POI标注时发生错误:", error);
  }
}

// 打开信息窗口
function openInfoWindow(entity) {
  try {
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
        viewer.selectedEntity = undefined;
      },
      onDetail: () => {
        console.log("查看详情");
      },
    });

    // 挂载组件到临时容器
    app.mount(tempContainer);

    console.log(`打开信息窗口: ${entity.name}`);
  } catch (error) {
    console.error(`打开信息窗口失败:`, error);
  }
}

// 清除所有数据源
function clearAllDataSources() {
  const viewer = mapStore.viewer;
  if (!viewer) return;
  
  // 使用cesiumUtils清除所有数据源
  cesiumUtils.clearAllData();
  
  // 清除store中的数据
  mapStore.clearGeoJSONData();
  mapStore.clearPOIData();
}

onMounted(async () => {
  // 等待DOM渲染完成后初始化地图
  await nextTick();
  initCesiumMap();
});

onUnmounted(() => {
  console.log("CesiumMapComponent 组件卸载，开始清理资源...");

  // 使用cesiumUtils销毁viewer和清理资源
  cesiumUtils.destroy();
  
  // 清理store状态
  mapStore.setViewer(null);
  mapStore.clearGeoJSONData();
  mapStore.clearPOIData();
});
</script>

<style scoped>
.cesium-map-container {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 1;
  height: 100%;
  width: 100%;
}

.cesium-instance {
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