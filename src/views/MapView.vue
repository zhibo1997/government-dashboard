<template>
  <div class="map-view">
    <!-- 地图容器 -->
    <div class="map-wrapper">
      <Map ref="mapRef" @layer-visibility-change="handleLayerVisibilityChange" />
    </div>


    <!-- 控制按钮 -->
    <div class="map-controls">
      <n-space direction="vertical">
        <n-button type="primary" @click="toggleLayerPanel">
          {{ showLayerPanel ? "隐藏图层" : "显示图层" }}
        </n-button>

        <a-button @click="testQuery"> 测试点位查询 </a-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NSpace, NButton, createDiscreteApi } from "naive-ui";
import Map from "@/mapComponents/Map.vue";
import LayerManager from "@/mapComponents/LayerManager.vue";
import MapToolbar from "@/mapComponents/MapToolbar.vue";

const { message } = createDiscreteApi(["message"]);
// 组件引用
const mapRef = ref<InstanceType<typeof Map>>();
const layerManagerRef = ref<InstanceType<typeof LayerManager>>();

// 图层面板显示状态
const showLayerPanel = ref(true);

/**
 * 处理图层可见性变化
 */
function handleLayerVisibilityChange(event: {
  layerKey: string;
  visible: boolean;
}) {
  console.log("图层可见性变化:", event);

  const { layerKey, visible } = event;

  // 根据图层key处理不同的图层
  switch (layerKey) {
    case "bridge-layer":
      // MVT图层的可见性由图层树控制
      message.info(`桥梁图层${visible ? "显示" : "隐藏"}`);
      break;

    case "mvt-layer":
      message.info(`MVT图层${visible ? "显示" : "隐藏"}`);
      break;

    case "yangxin-boundary":
      message.info(`边界图层${visible ? "显示" : "隐藏"}`);
      break;

    default:
      console.log(`未处理的图层: ${layerKey}`);
  }
}

/**
 * 处理图层透明度变化
 */
function handleLayerOpacityChange(event: {
  layerKey: string;
  opacity: number;
}) {
  console.log("图层透明度变化:", event);
  const { layerKey, opacity } = event;
  message.info(`${layerKey} 透明度: ${Math.round(opacity * 100)}%`);
}

/**
 * 处理定位图层
 */
function handleLocateLayer(event: { layerKey: string }) {
  console.log("定位图层:", event);
  message.info(`定位到图层: ${event.layerKey}`);

  // 这里可以实现相机飞行到图层范围
  // if (mapRef.value?.viewerInstance) {
  //   const viewer = mapRef.value.viewerInstance
  //   // 实现定位逻辑
  // }
}

/**
 * 切换图层面板显示
 */
function toggleLayerPanel() {
  showLayerPanel.value = !showLayerPanel.value;
}

/**
 * 处理测量工具切换
 */
function handleToggleMeasure() {
  if (mapRef.value?.toggleMeasureTool) {
    mapRef.value.toggleMeasureTool()
  }
}

/**
 * 测试点位查询
 */
async function testQuery() {
  try {
    message.loading({ content: "正在查询...", key: "query" });

    // 测试查询阳新县中心附近的桥梁
    if (mapRef.value?.queryFeatureInfo) {
      await mapRef.value.queryFeatureInfo(115.133954, 29.823198);
      message.success({ content: "查询完成，请查看控制台", key: "query" });
    }
  } catch (error) {
    message.error({ content: "查询失败", key: "query" });
    console.error("查询失败:", error);
  }
}
</script>

<style scoped>
.map-view {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}
.map-toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.layer-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.layer-panel.hidden {
  transform: translateX(calc(100% + 20px));
}

.map-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

:deep(.ant-btn) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
