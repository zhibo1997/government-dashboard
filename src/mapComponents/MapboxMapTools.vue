<template>
  <div class="mapbox-map-tools">
    <!-- 底图切换工具 -->
    <n-popover
      trigger="click"
      placement="left-start"
      style="padding: 0; background-color: rgba(8, 21, 38, 0.7)"
      :to="false"
    >
      <template #trigger>
        <div class="tool-button" title="切换底图">
          <img
            src="../assets/map-img/basemap.webp"
            alt="底图"
            class="tool-icon"
          />
        </div>
      </template>
      <div class="basemap-selector">
        <div class="basemap-title">选择底图</div>
        <div class="basemap-options">
          <div
            v-for="basemap in basemapOptions"
            :key="basemap.type"
            class="basemap-option"
            :class="{ active: currentBasemap === basemap.type }"
            @click="switchBasemap(basemap.type)"
          >
            <div class="basemap-preview" :class="`preview-${basemap.type}`">
              <div class="preview-content">{{ basemap.name }}</div>
            </div>
            <div class="basemap-name">{{ basemap.name }}</div>
          </div>
        </div>
      </div>
    </n-popover>

    <!-- 专题图层切换工具 -->
    <n-popover
      trigger="click"
      placement="left-start"
      style="padding: 0; background-color: rgba(8, 21, 38, 0.7)"
      :to="false"
    >
      <template #trigger>
        <div class="tool-button" title="专题图层">
          <img
            src="../assets/map-img/layer.webp"
            alt="图层"
            class="tool-icon"
          />
        </div>
      </template>

      <div class="layer-tree-container">
        <div class="layer-tree-header">
          <img
            class="head-icon"
            src="../assets/map-img/tree-head.webp"
            alt=""
          />
          <span class="head-text">图层管理</span>
        </div>
        <LayerTree ref="layerTreeRef" @layer-toggle="handleLayerToggle" />
      </div>
    </n-popover>

    <!-- 重置工具 -->
    <div class="tool-button" title="重置地图" @click="resetMap">
      <img src="../assets/map-img/reset.webp" alt="重置" class="tool-icon" />
    </div>
    <!-- 测量工具 -->
    <div class="tool-button" title="测量工具">
      <img
        src="../assets/map-img/ranging.webp"
        alt="测量"
        class="tool-icon"
      />
    </div>
    <!-- <n-popover trigger="click" placement="right">
      <template #trigger>
      </template>
      <div class="measure-tools">
        <div class="tool-title">测量工具</div>
        <div class="tool-options">
          <div class="tool-option" @click="startDistanceMeasure">
            <span>距离测量</span>
          </div>
          <div class="tool-option" @click="startAreaMeasure">
            <span>面积测量</span>
          </div>
          <div class="tool-option" @click="clearMeasure">
            <span>清除测量</span>
          </div>
        </div>
      </div>
    </n-popover> -->

    <!-- 指北针 -->
    <div class="tool-button" title="指北针">
      <img
        src="../assets/map-img/compass.webp"
        alt="指北针"
        class="tool-icon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed, watchEffect } from "vue";
import type { Ref } from "vue";
import { NPopover, NCheckbox } from "naive-ui";
import type { Map as MapboxMap } from "mapbox-gl";
import { mapboxUtils } from "@/mapUtils/mapboxUtils";
import LayerTree from "../components/LayerTree.vue";

// 注入地图实例 - 直接注入 ref 对象
const mapInstance = inject<Ref<MapboxMap | null>>("mapboxMap");
const map = computed(() => {
  console.log("computed map - mapInstance?.value:", mapInstance?.value);
  return mapInstance?.value;
});

// 添加调试信息
watchEffect(() => {
  console.log("MapboxMapTools watchEffect - mapInstance:", mapInstance);
  console.log(
    "MapboxMapTools watchEffect - mapInstance?.value:",
    mapInstance?.value
  );
  console.log("MapboxMapTools watchEffect - map.value:", map.value);
  if (!map.value) {
    console.warn("MapboxMapTools: 地图实例为空，可能还在初始化中");
  } else {
    console.log("MapboxMapTools: 地图实例已就绪");
  }
});

// 当前底图类型
const currentBasemap = ref<string>("tianditu-base");

// 底图选项
const basemapOptions = ref([
  {
    type: "tianditu-base",
    name: "矢量",
  },
  {
    type: "tianditu-img",
    name: "影像",
  },
  {
    type: "tianditu-ter",
    name: "地形",
  },
]);

// 专题图层
const thematicLayers = ref([
  { id: "administrative", name: "行政区划", visible: true },
  { id: "poi", name: "POI点位", visible: false },
  { id: "traffic", name: "交通路网", visible: false },
  { id: "building", name: "建筑物", visible: false },
]);

/**
 * 切换底图
 */
const switchBasemap = (type: string) => {
  if (!map.value || currentBasemap.value === type) return;
  const mapVal = map.value;
  try {
    const allLayers = ["tianditu-base", "tianditu-img", "tianditu-ter"];
    // 隐藏所有底图
    allLayers.forEach((id) => {
      mapVal.setLayoutProperty(id, "visibility", "none");
    });
    mapVal.setLayoutProperty(type, "visibility", "visible");
    currentBasemap.value = type;
    // if (mapVal.getLayer(type)) {
    // }
  } catch (error) {
    console.error("切换底图失败:", error);
  }
};

// LayerTree 组件引用
const layerTreeRef = ref<InstanceType<typeof LayerTree> | null>(null);

// 专题地图模式状态
const thematicMapMode = ref(false);

// 图层显隐切换
const handleLayerToggle = (
  layerKey: string,
  visible: boolean,
  layerUrl: string
) => {
  // 直接从 mapInstance 获取值，而不是通过 computed
  const currentMap = mapInstance?.value;
  if (!currentMap) {
    console.warn("handleLayerToggle: 地图实例为空，mapInstance:", mapInstance);
    return;
  }

  console.log("使用地图实例:", currentMap);
  const mapVal = currentMap;
  try {
    if (visible) {
      // 加载矢量瓦片图层 - 这里需要根据实际需求实现
      loadVectorTileLayer(layerKey, layerUrl);
    } else {
      console.log(`移除图层: ${layerKey}`);
      removeLayerAndSources(layerKey, layerUrl);
    }

    // 更新专题地图模式状态
    const thematicLayers = ["bridge_layer", "manhole_layer"];
    const hasVisibleThematicLayer = thematicLayers.some((layer) => {
      const layerObj = mapVal.getLayer(layer);
      return (
        layerObj && mapVal.getLayoutProperty(layer, "visibility") === "visible"
      );
    });
    thematicMapMode.value = hasVisibleThematicLayer;
  } catch (error) {
    console.error("图层切换失败:", error);
    // 如果操作失败，回滚LayerTree状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerKey, { visible: !visible });
    }
  }
};
async function loadVectorTileLayer(layerKey: string, url: string) {
  // 获取样式配置
  const response = await fetch(url);
  const styleConfig = await response.json();
  const { layers, sources } = styleConfig;
  for (let layer of layers) {
    console.log(
      "🚀 ~ loadVectorTileLayer ~ styleConfig:",
      layer,
      sources[layer.source]
    );
    map.value?.addSource(layer.source, sources[layer.source]);
    map.value?.addLayer(layer);
  }
}
const removeLayerAndSources = async (layerKey: string, layerUrl: string) => {
  if (!map.value) return;
  const response = await fetch(layerUrl);
  const styleConfig = await response.json();

  const { layers } = styleConfig;
  for (let layer of layers) {
    map.value?.removeLayer(layer.id);
    map.value?.removeSource(layer.id);
  }
};

/**
 * 开始距离测量
 */
const startDistanceMeasure = () => {
  if (!map.value) return;
  // TODO: 实现距离测量功能
  console.log("开始距离测量");
};

/**
 * 开始面积测量
 */
const startAreaMeasure = () => {
  if (!map.value) return;
  // TODO: 实现面积测量功能
  console.log("开始面积测量");
};

/**
 * 清除测量结果
 */
const clearMeasure = () => {
  if (!map.value) return;
  // TODO: 实现清除测量功能
  console.log("清除测量结果");
};

/**
 * 重置地图
 */
const resetMap = () => {
  if (!map.value) return;

  try {
    mapboxUtils.resetMap(map.value);
  } catch (error) {
    console.error("重置地图失败:", error);
  }
};

onMounted(() => {
  if (!map.value) {
    console.warn("MapboxMapTools: 未找到地图实例");
  }
});
</script>

<style scoped>
.mapbox-map-tools {
  position: absolute;
  top: 20px;
  right: 600px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  background: rgba(8, 21, 38, 0.7);
}

.tool-button {
  width: 80px;
  height: 80px;
  border-bottom: 1px solid #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-button:hover {
  background: #f5f5f5;
  border-color: #1677ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

/* 底图选择器样式 */
.basemap-selector {
  width: 300px;
  padding: 24px;
}

.basemap-title {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #fff;
}

.basemap-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.basemap-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.basemap-option:hover {
  border-color: #1677ff;
}

.basemap-option.active {
  color: #262626;
  background: #e6f4ff;
  border-color: #1677ff;
}

.basemap-preview {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-content {
  font-size: 22px;
  color: #fff;
  text-align: center;
  font-weight: 500;
}

/* 矢量底图预览 */
.preview-vec {
  background:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 6px 6px;
  background-position:
    0 0,
    0 3px,
    3px -3px,
    -3px 0px;
  background-color: #fafafa;
}

/* 影像底图预览 */
.preview-img {
  background: linear-gradient(135deg, #4caf50 0%, #81c784 50%, #66bb6a 100%);
}

.preview-img .preview-content {
  color: #fff;
}

/* 地形底图预览 */
.preview-ter {
  background: linear-gradient(135deg, #8bc34a 0%, #d4edda 50%, #f5f2ea 100%);
}

.basemap-name {
  font-size: 28px;
  color: #fff;
}

/* 图层选择器样式 */
.layer-selector {
  width: 180px;
  padding: 12px;
}

.layer-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #262626;
}

.layer-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-option {
  padding: 4px 0;
}

/* 测量工具样式 */
.measure-tools {
  width: 160px;
  padding: 12px;
}

.tool-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #262626;
}

.tool-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #262626;
}

.layer-tree-container {
  width: 387px;
  height: 453px;
  border-radius: 10px;
  opacity: 1;
  background: linear-gradient(
    180deg,
    rgba(84, 169, 255, 0.5) 0%,
    rgba(84, 169, 255, 0) 103px,
    transparent 100%
  );

  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);

  .layer-tree-header {
    display: flex;
    height: 103px;
    align-items: center;
    padding-left: 32px;
    border-bottom: 2px solid #ffffff;
    .head-icon {
      width: 28px;
      height: 30px;
    }
    .head-text {
      font-family: Source Han Sans;
      font-size: 32px;
      font-weight: 500;
      line-height: normal;
      color: #ffffff;
      margin-left: 17px;
    }
  }
}
.tool-option:hover {
  background: #f5f5f5;
  color: #1677ff;
}
</style>
