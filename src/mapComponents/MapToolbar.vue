<template>
  <div class="map-toolbar" :class="{ collapsed: isCollapsed }">
    <!-- 收缩按钮 -->
    <div class="toolbar-item" @click="toggleCollapse" title="收缩/展开">
      <div class="tool-icon">
        <img src="@/assets/map/collapse.webp" alt="" />
      </div>
    </div>

    <!-- 工具按钮组 (收缩时隐藏) -->
    <template v-if="!isCollapsed">
      <!-- 图层树 -->
      <div class="toolbar-item" :class="{ active: showLayerTreePanel }" title="图层树">
        <div class="tool-icon" @click="toggleLayerTreePanel">
          <img src="@/assets/map/map_tree.webp" alt="" />
        </div>
        <!-- 图层树面板 -->
        <transition name="slide-left">
          <div v-if="showLayerTreePanel" class="layer-tree-panel">
            <OptimizedLayerTree ref="layerTreeRef" :viewer-instance="props.viewerInstance" @load-mvt="handleLoadMVT"
              @load-3dtiles="handleLoad3DTiles" @layer-toggle="handleLayerToggle"
              @layer-opacity-change="handleLayerOpacityChange" />
          </div>
        </transition>
      </div>

      <!-- 底图切换 -->
      <div class="toolbar-item" :class="{ active: showBaseMapPanel }" @click.stop="toggleBaseMapPanel" title="底图切换">
        <div class="tool-icon">
          <img src="@/assets/map/base_map.webp" alt="" />
        </div>
        <!-- 底图切换面板 -->
        <transition name="slide-left">
          <div v-if="showBaseMapPanel" class="base-map-panel">
            <div class="panel-title">底图切换</div>
            <div class="base-map-options">
              <div v-for="item in baseMapTypes" :key="item.value" class="base-map-option"
                :class="{ active: props.currentBaseMap === item.value }" @click.stop="switchBaseMap(item.value)">
                <div class="option-icon">{{ item.icon }}</div>
                <div class="option-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 地图重置 -->
      <div class="toolbar-item" @click="resetMap" title="重置地图">
        <div class="tool-icon">
          <img src="@/assets/map/reset_map.webp" alt="" />
        </div>
      </div>

      <!-- 2D/3D切换 -->
      <div class="toolbar-item" @click="toggleViewMode" title="2D/3D切换">
        <div class="tool-icon">
          <img src="@/assets/map/view_mode.webp" alt="" />
        </div>
      </div>

      <!-- 指北针 -->
      <div class="toolbar-item" @click="resetNorth" title="指北针">
        <div class="tool-icon compass" :style="{ transform: `rotate(${props.compassRotation}deg)` }">
          <img src="@/assets/map/compass.webp" alt="" />
        </div>
      </div>

      <!-- 测量工具 -->
      <div class="toolbar-item" @click="$emit('toggle-measure')" title="测量工具">
        <div class="tool-icon">
          <img src="@/assets/map/measure.webp" alt="" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import OptimizedLayerTree from "./OptimizedLayerTree.vue";
import cesiumUtils from "@/mapUtils/mapUtils";

// Props - 从父组件接收状态
interface Props {
  viewerInstance: any
  sceneMode: 2 | 3
  currentBaseMap: 'vec' | 'img' | 'ter'
  compassRotation: number
}

const props = defineProps<Props>()

// Emits - 通知父组件
const emit = defineEmits<{
  'update:scene-mode': [mode: 2 | 3]
  'update:base-map': [type: 'vec' | 'img' | 'ter']
  'reset-map': []
  'toggle-measure': []
}>()

// 本地UI状态管理
const isCollapsed = ref(false);
const showLayerTreePanel = ref(false);
const showBaseMapPanel = ref(false);
const layerTreeRef = ref<any>(null);

// 存储已加载的图层实例
const loadedLayers = ref<Map<string, any>>(new Map());

// 底图类型配置
const baseMapTypes = [
  { value: "img", label: "影像地图", icon: "🛰️" },
  { value: "vec", label: "矢量地图", icon: "🗺️" },
  { value: "ter", label: "地形地图", icon: "🏔️" },
] as const;

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  // 收缩时关闭所有面板
  if (isCollapsed.value) {
    showLayerTreePanel.value = false;
    showBaseMapPanel.value = false;
  }
};

// 切换图层树面板
const toggleLayerTreePanel = () => {
  showLayerTreePanel.value = !showLayerTreePanel.value;
  // 打开图层树时关闭底图面板
  if (showLayerTreePanel.value) {
    showBaseMapPanel.value = false;
  }
};

// 切换底图面板
const toggleBaseMapPanel = () => {
  showBaseMapPanel.value = !showBaseMapPanel.value;
  // 打开底图面板时关闭图层树
  if (showBaseMapPanel.value) {
    showLayerTreePanel.value = false;
  }
};

// 处理加载MVT图层
const handleLoadMVT = async (url: string, layerId: string) => {
  if (!props.viewerInstance) {
    console.warn("⚠️ Viewer 实例未就绪");
    return;
  }

  try {
    console.log(`🔄 加载MVT图层: ${url}`);

    // loadMVTLayer 返回的是 ImageryLayer 对象
    const imageryLayer = await cesiumUtils.loadMVTLayer(props.viewerInstance, url);
    loadedLayers.value.set(layerId, { type: "mvt", instance: imageryLayer });

    console.log(`✅ MVT图层加载成功: ${layerId}`);
  } catch (error: any) {
    const errorMessage = error?.message || error;
    console.error(`❌ MVT图层加载失败: ${layerId}`, errorMessage);

    // 更新图层树状态 - 显示具体错误信息
    if (layerTreeRef.value) {
      let userFriendlyError = "加载失败";

      if (errorMessage.includes("404") || errorMessage.includes("不存在")) {
        userFriendlyError = "样式文件不存在";
      } else if (
        errorMessage.includes("version") ||
        errorMessage.includes("sources") ||
        errorMessage.includes("layers")
      ) {
        userFriendlyError = "样式文件格式错误";
      }

      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: userFriendlyError,
      });
    }
  }
};

// 处理加载3D Tiles图层
const handleLoad3DTiles = async (url: string, layerId: string) => {
  if (!props.viewerInstance) {
    console.warn("⚠️ Viewer 实例未就绪");
    return;
  }

  try {
    console.log(`🔄 加载3D Tiles图层: ${url}`);

    const tileset = await cesiumUtils.load3DTiles(props.viewerInstance, url);
    loadedLayers.value.set(layerId, { type: "3dtiles", instance: tileset });

    console.log(`✅ 3D Tiles图层加载成功: ${layerId}`);
  } catch (error: any) {
    const errorMessage = error?.message || error;
    console.error(`❌ 3D Tiles图层加载失败: ${layerId}`, errorMessage);

    // 更新图层树状态 - 显示具体错误信息
    if (layerTreeRef.value) {
      let userFriendlyError = "加载失败";

      if (
        errorMessage.includes("404") ||
        errorMessage.includes("Failed to fetch")
      ) {
        userFriendlyError = "3D模型文件不存在";
      } else if (errorMessage.includes("not a function")) {
        userFriendlyError = "Cesium版本不兼容";
      }

      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: userFriendlyError,
      });
    }
  }
};

// 处理图层显隐切换
const handleLayerToggle = (
  layerId: string,
  visible: boolean,
  layerData: any
) => {
  console.log(`${visible ? "显示" : "隐藏"}图层:`, layerId);

  const layer = loadedLayers.value.get(layerId);

  if (!visible && layer) {
    // 隐藏图层
    if (layer.type === "3dtiles") {
      cesiumUtils.set3DTilesVisibility(layer.instance, false);
    } else if (layer.type === "mvt") {
      // MVT图层显隐控制 - 使用 ImageryLayer 的 show 属性
      if (layer.instance) {
        layer.instance.show = false;
        console.log(`✅ MVT图层已隐藏: ${layerId}`);
      }
    }
  } else if (visible && !layer) {
    // 图层未加载,需要加载
    if (layerData.type === "mvt") {
      handleLoadMVT(layerData.url, layerId);
    } else if (layerData.type === "3dTile") {
      handleLoad3DTiles(layerData.url, layerId);
    }
  } else if (visible && layer) {
    // 显示已加载的图层
    if (layer.type === "3dtiles") {
      cesiumUtils.set3DTilesVisibility(layer.instance, true);
    } else if (layer.type === "mvt") {
      // MVT图层显示控制 - 使用 ImageryLayer 的 show 属性
      if (layer.instance) {
        layer.instance.show = true;
        console.log(`✅ MVT图层已显示: ${layerId}`);
      }
    }
  }
};

// 处理图层透明度变化
const handleLayerOpacityChange = (layerId: string, opacity: number) => {
  console.log(`调整图层透明度: ${layerId}, ${opacity}`);

  const layer = loadedLayers.value.get(layerId);

  if (layer) {
    if (layer.type === "3dtiles" && layer.instance) {
      // 3D Tiles透明度控制
      cesiumUtils.set3DTilesStyle(layer.instance, {
        color: `color('white', ${opacity})`,
      });
    } else if (layer.type === "mvt" && layer.instance) {
      // MVT图层透明度控制 - 使用 ImageryLayer 的 alpha 属性
      layer.instance.alpha = opacity;
      console.log(`✅ MVT图层透明度已设置: ${layerId} = ${opacity}`);
    }
  }
};

// 切换底图
const switchBaseMap = (type: "vec" | "img" | "ter") => {
  emit('update:base-map', type)
  showBaseMapPanel.value = false
  console.log(`✅ 请求切换底图: ${type}`)
}

// 重置地图
const resetMap = () => {
  emit('reset-map')
  console.log('✅ 请求重置地图')
}

// 切换2D/3D视图
const toggleViewMode = () => {
  const newMode = props.sceneMode === 2 ? 3 : 2
  emit('update:scene-mode', newMode)
  console.log(`✅ 请求切换视图模式: ${newMode === 2 ? '2D' : '3D'}`)
}

// 重置指北
const resetNorth = () => {
  if (!props.viewerInstance) {
    console.warn("⚠️ Viewer 实例未就绪");
    return;
  }

  const Cesium = (window as any).Cesium;
  if (Cesium) {
    props.viewerInstance.camera.setView({
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
    });
    console.log("✅ 重置指北方向");
  }
};

// 暴露方法
defineExpose({
  isCollapsed,
  loadedLayers,
  layerTreeRef,
});
</script>

<style lang="scss" scoped>
.map-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1000;
  transition: all 0.3s ease;

  &.collapsed {
    gap: 0;

    .toolbar-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .toolbar-item {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-image: url("@/assets/map/tools_bg.webp");
    background-size: 100% 100%;


    &.active {
      border-color: #1677ff;
      background: rgba(22, 119, 255, 0.25);
    }

    .tool-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;


      &:hover {
        transform: scale(1.2);
      }

      &.compass {
        transition: transform 0.6s ease;
      }

      .icon-placeholder {
        font-size: 32px;
        color: #1677ff;
        text-shadow: 0 2px 8px rgba(22, 119, 255, 0.5);
      }
    }
  }

  // 图层树面板
  .layer-tree-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 400px;
    max-height: 600px;
    background: rgba(11, 28, 45, 0.65);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // 底图切换面板
  .base-map-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 240px;
    background: rgba(0, 15, 35, 0.65);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);
    }

    .base-map-options {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .base-map-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(22, 119, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(22, 119, 255, 0.15);
          border-color: rgba(22, 119, 255, 0.5);
          transform: translateX(-4px);
        }

        &.active {
          background: rgba(22, 119, 255, 0.25);
          border-color: #1677ff;

          .option-label {
            color: #1677ff;
            font-weight: bold;
          }
        }

        .option-icon {
          font-size: 24px;
        }

        .option-label {
          font-size: 16px;
          color: #ffffff;
          flex: 1;
        }
      }
    }
  }

  // 面板滑入动画
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: all 0.3s ease;
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>
