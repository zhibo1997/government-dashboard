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
      <!-- 图层树 -->
      <div class="toolbar-item" :class="{ active: showLayerTreePanel }" title="图层树">
        <div class="tool-icon" @click="toggleLayerTreePanel">
          <img src="@/assets/map/map_tree.webp" alt="" />
        </div>
        <!-- 图层树面板 -->
        <transition name="slide-left">
          <div v-show="showLayerTreePanel" class="layer-tree-panel">
            <OptimizedLayerTree ref="layerTreeRef" :viewer-instance="props.viewerInstance" @load-mvt="handleLoadMVT"
              @load-3dtiles="handleLoad3DTiles" @layer-toggle="handleLayerToggle"
              @layer-opacity-change="handleLayerOpacityChange" @toggle-device-type="handleToggleDeviceType" />
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

      <!-- 桥梁模型 -->
      <div class="toolbar-item model-tool" :class="{ active: showBridgePanel }" @click="toggleBridgePanel" title="桥梁模型">
        <div class="tool-icon">
          <img src="@/assets/map/桥梁模型.webp" alt="" />
        </div>
      </div>

      <!-- 燃气模型 -->
      <div class="toolbar-item model-tool" :class="{ active: showGasPanel }" @click="toggleGasPanel" title="燃气模型">
        <div class="tool-icon">
          <img src="@/assets/map/燃气模型.webp" alt="" />
        </div>
      </div>

      <!-- 默认3D Tiles -->
      <div class="toolbar-item model-tool" :class="{ active: props.defaultTilesetVisible }"
        @click="$emit('toggle-default-tileset')" title="默认3D Tiles">
        <div class="tool-icon">
          <img src="@/assets/map/white_membrane.webp" alt="" />
        </div>
      </div>
      <div class="toolbar-item model-tool" :class="{ active: showRiskPointPanel }" @click="toggleRiskPointPanel" title="风险点">
        <div class="tool-icon">
          <img src="@/assets/map/风险点.webp" alt="" />
        </div>
      </div>
    </template>

    <!-- 桥梁模型面板（独立定位） -->
    <transition name="slide-left">
      <div v-show="showBridgePanel" class="bridge-panel" @click.stop>
        <BridgeModelPanel
          :viewer-instance="props.viewerInstance"
          @load-3dtiles="handleLoad3DTiles"
          @layer-toggle="handleLayerToggle"
          @equipment-activate="handleEquipmentActivate"
        />
      </div>
    </transition>

    <!-- 燃气模型面板（独立定位） -->
    <transition name="slide-left">
      <div v-show="showGasPanel" class="gas-panel" @click.stop>
        <GasModelPanel
          :viewer-instance="props.viewerInstance"
          @load-3dtiles="handleLoad3DTiles"
          @layer-toggle="handleLayerToggle"
        />
      </div>
    </transition>

    <!-- 风险点面板（独立定位） -->
    <transition name="slide-left">
      <div v-show="showRiskPointPanel" class="risk-point-panel-wrapper" @click.stop>
        <RiskPointPanel />
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";
import OptimizedLayerTree from "./OptimizedLayerTree.vue";
import BridgeModelPanel from "./BridgeModelPanel.vue";
import GasModelPanel from "./GasModelPanel.vue";
import RiskPointPanel from "./RiskPointPanel.vue";
import { useMapHooks } from "@/hook/useMapHooks";

const cesiumUtils = useMapHooks();

// 注入监测点位管理 Hook（从 PersistentLayout 传递）
const monitoringPointsHook = inject<any>('monitoringPointsHook');

// Props - 从父组件接收状态
interface Props {
  viewerInstance: any
  sceneMode: 2 | 3
  currentBaseMap: 'vec' | 'img' | 'ter' | 'arcgis'
  compassRotation: number
  defaultTilesetVisible: boolean
}

const props = defineProps<Props>()

// Emits - 通知父组件
const emit = defineEmits<{
  'update:scene-mode': [mode: 2 | 3]
  'update:base-map': [type: 'vec' | 'img' | 'ter' | 'arcgis']
  'reset-map': []
  'toggle-measure': []
  'toggle-default-tileset': []
  'equipment-activate': [bridge: any, active: boolean]
}>()

// 本地UI状态管理
const isCollapsed = ref(false);
const showLayerTreePanel = ref(false);
const showBaseMapPanel = ref(false);
const showBridgePanel = ref(false);
const showGasPanel = ref(false);
const showRiskPointPanel = ref(false);
const showEquipmentDialog = ref(false);
const activeEquipmentBridge = ref<any>({});
const layerTreeRef = ref<any>(null);

// 存储已加载的图层实例
const loadedLayers = ref<Map<string, any>>(new Map());

// 底图类型配置
const baseMapTypes = [
  { value: "img", label: "影像地图", icon: "🛰️" },
  { value: "vec", label: "矢量地图", icon: "🗺️" },
  { value: "ter", label: "地形地图", icon: "🏔️" },
  // { value: "arcgis", label: "ArcGIS影像", icon: "📡" },
] as const;

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  // 收缩时关闭所有面板
  if (isCollapsed.value) {
    showLayerTreePanel.value = false;
    showBaseMapPanel.value = false;
    showBridgePanel.value = false;
    showGasPanel.value = false;
    showRiskPointPanel.value = false;
  }
};

// 切换图层树面板
const toggleLayerTreePanel = () => {
  showLayerTreePanel.value = !showLayerTreePanel.value;
  if (showLayerTreePanel.value) {
    showBaseMapPanel.value = false;
    showBridgePanel.value = false;
    showGasPanel.value = false;
    showRiskPointPanel.value = false;
  }
};

// 切换底图面板
const toggleBaseMapPanel = () => {
  showBaseMapPanel.value = !showBaseMapPanel.value;
  if (showBaseMapPanel.value) {
    showLayerTreePanel.value = false;
    showBridgePanel.value = false;
    showGasPanel.value = false;
    showRiskPointPanel.value = false;
  }
};

// 切换桥梁模型面板
const toggleBridgePanel = () => {
  showBridgePanel.value = !showBridgePanel.value;
  if (showBridgePanel.value) {
    showLayerTreePanel.value = false;
    showBaseMapPanel.value = false;
    showGasPanel.value = false;
    showRiskPointPanel.value = false;
  }
};

// 切换燃气模型面板
const toggleGasPanel = () => {
  showGasPanel.value = !showGasPanel.value;
  if (showGasPanel.value) {
    showLayerTreePanel.value = false;
    showBaseMapPanel.value = false;
    showBridgePanel.value = false;
    showRiskPointPanel.value = false;
  }
};

// 切换风险点面板
const toggleRiskPointPanel = () => {
  showRiskPointPanel.value = !showRiskPointPanel.value;
  if (showRiskPointPanel.value) {
    showLayerTreePanel.value = false;
    showBaseMapPanel.value = false;
    showBridgePanel.value = false;
    showGasPanel.value = false;
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
const handleLoad3DTiles = async (url: string, layerId: string, options?: { flyTo?: boolean }) => {
  if (!props.viewerInstance) {
    console.warn("⚠️ Viewer 实例未就绪");
    return;
  }

  try {
    console.log(`🔄 加载3D Tiles图层: ${url}`);

    const tileset = await cesiumUtils.load3DTiles(props.viewerInstance, url, options);
    loadedLayers.value.set(layerId, { type: "3dtiles", instance: tileset });

    console.log(`✅ 3D Tiles图层加载成功: ${layerId}`);

    // 调试：遍历 tileset 内部子模型结构
    if (layerId.includes('-') && layerId.length > 30) {
      try {
        const Cesium = (window as any).Cesium;
        const root = tileset.root;
        const traverse = (tile: any, depth = 0) => {
          const indent = '  '.repeat(depth);
          const bs = tile.boundingSphere;
          const center = bs ? Cesium.Cartographic.fromCartesian(bs.center) : null;
          const lat = center ? Cesium.Math.toDegrees(center.latitude).toFixed(6) : '?';
          const lon = center ? Cesium.Math.toDegrees(center.longitude).toFixed(6) : '?';
          const height = center ? center.height.toFixed(2) : '?';
          const content = tile.content;
          const featuresCount = content?.featuresLength ?? content?.innerContents?.length ?? 0;
          const childrenCount = tile.children?.length ?? 0;
          console.log(`${indent}Tile: center=[${lon}, ${lat}, ${height}] radius=${bs?.radius?.toFixed(2) ?? '?'} features=${featuresCount} children=${childrenCount}`);
          if (tile.children) {
            for (const child of tile.children) {
              traverse(child, depth + 1);
            }
          }
        };
        console.log(`--- Tileset ${layerId} 结构 ---`);
        traverse(root);
        console.log(`--- 遍历结束 ---`);
      } catch (e) {
        console.log('遍历tileset失败:', e);
      }
    }
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

// 处理监测设备激活/取消
const handleEquipmentActivate = (bridge: any, active: boolean) => {
  if (active) {
    const applyStyle = () => {
      // 桥梁模型变透明
      const bridgeLayer = loadedLayers.value.get(bridge.id);
      if (bridgeLayer?.type === "3dtiles" && bridgeLayer.instance) {
        cesiumUtils.set3DTilesStyle(bridgeLayer.instance, {
          color: `color('white', 0.7)`,
        });
      }
      // 设备模型高亮
      if (bridge.equipment?.id) {
        const eqLayer = loadedLayers.value.get(bridge.equipment.id);
        if (eqLayer?.type === "3dtiles" && eqLayer.instance) {
          cesiumUtils.set3DTilesStyle(eqLayer.instance, {
            color: `color('cyan', 1.0)`,
          });
        }
      }
    };

    const bridgeLayer = loadedLayers.value.get(bridge.id);
    const eqLayer = bridge.equipment?.id ? loadedLayers.value.get(bridge.equipment.id) : null;
    if (bridgeLayer && eqLayer) {
      applyStyle();
    } else {
      const timer = setInterval(() => {
        const bl = loadedLayers.value.get(bridge.id);
        const el = bridge.equipment?.id ? loadedLayers.value.get(bridge.equipment.id) : null;
        if (bl && el) {
          clearInterval(timer);
          applyStyle();
        }
      }, 200);
      setTimeout(() => clearInterval(timer), 10000);
    }
  } else {
    // 恢复桥梁模型
    const bridgeLayer = loadedLayers.value.get(bridge.id);
    if (bridgeLayer?.type === "3dtiles" && bridgeLayer.instance) {
      cesiumUtils.set3DTilesStyle(bridgeLayer.instance, {
        color: `color('white', 1.0)`,
      });
    }
    // 恢复设备模型
    if (bridge.equipment?.id) {
      const eqLayer = loadedLayers.value.get(bridge.equipment.id);
      if (eqLayer?.type === "3dtiles" && eqLayer.instance) {
        cesiumUtils.set3DTilesStyle(eqLayer.instance, {
          color: `color('white', 1.0)`,
        });
      }
    }
  }

  activeEquipmentBridge.value = active ? { qlbh: bridge.qlbh, llmc: bridge.name } : {};
  showEquipmentDialog.value = active;
  emit('equipment-activate', bridge, active);
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

// 处理 specialLayer 设备类型切换
const handleToggleDeviceType = async (sblx: string, visible: boolean) => {
  console.log("🚀 ~ handleToggleDeviceType ~ visible:", visible)
  if (!monitoringPointsHook || !monitoringPointsHook.value) {
    console.warn('⚠️ 监测点位管理 Hook 未注入');
    return;
  }

  try {
    console.log(`🔄 specialLayer 触发设备类型切换: ${sblx} - ${visible ? '显示' : '隐藏'}`);
    
    // 调用 Hook 的设备类型切换方法
    await monitoringPointsHook.value.toggleDeviceType(sblx, visible);
    
    console.log('✅ specialLayer 设备类型切换成功');
  } catch (error) {
    console.error('❌ specialLayer 设备类型切换失败:', error);
  }
};

// 切换底图
const switchBaseMap = (type: "vec" | "img" | "ter" | "arcgis") => {
  const typeNames: Record<'vec' | 'img' | 'ter' | 'arcgis', string> = {
    'img': '影像',
    'vec': '矢量',
    'ter': '地形',
    'arcgis': 'ArcGIS影像'
  }
  emit('update:base-map', type)
  showBaseMapPanel.value = false
  console.log(`✅ 底图已切换为: ${typeNames[type]}`)
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
    // 只改变相机方向，保持当前位置不变，并添加平滑旋转动画
    const currentPosition = props.viewerInstance.camera.position;
    props.viewerInstance.camera.flyTo({
      destination: currentPosition,
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 1.5, // 旋转动画持续时间（秒）
      complete: () => {
        console.log("✅ 重置指北方向");
      },
      cancel: () => {
        console.warn("⚠️ 重置指北方向操作已取消");
      },
    });
  }
};

// 暴露方法和状态
defineExpose({
  isCollapsed,
  loadedLayers,
  layerTreeRef,
  showEquipmentDialog,
  activeEquipmentBridge,
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

      &.model-tool .tool-icon {
        width: 90%;
        height: 90%;
      }

    &.active {
      border-color: #1677ff;
      background: rgba(22, 119, 255, 0.25);
    }

    .tool-icon {
      display: flex;
      padding: 8px;
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
        color: #ddd;
        text-shadow: 0 2px 8px rgba(22, 119, 255, 0.5);
        svg {
          width: 48px;
          height: 48px;
        }
      }
    }
  }

  // 图层树面板
  .layer-tree-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 560px;
    max-height: 780px;
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
    width: 380px;
    background: rgba(11, 28, 45, 0.65);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);

    .panel-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .base-map-options {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .base-map-option {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateX(-4px);
        }

        &.active {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);

          .option-label {
            color: #1890ff;
            font-weight: 700;
          }
        }

        .option-icon {
          font-size: 36px;
        }

        .option-label {
          font-size: 28px;
          color: #ffffff;
          flex: 1;
        }
      }
    }
  }

  // 桥梁模型面板（独立定位，不嵌套在 toolbar-item 内）
  > .bridge-panel {
    position: absolute;
    right: 100%;
    bottom: 0;
    margin-right: 16px;
    width: 1100px;
    height: 320px;
    background: rgba(11, 28, 45, 0.65);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  // 燃气模型面板
  > .gas-panel {
    position: absolute;
    right: 100%;
    bottom: 0;
    margin-right: 16px;
    width: 1100px;
    height: 240px;
    background: rgba(11, 28, 45, 0.65);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  // 风险点面板
  > .risk-point-panel-wrapper {
    position: absolute;
    right: 100%;
    bottom: 0;
    margin-right: 16px;
    width: 800px;
    height: 460px;
    background: rgba(11, 28, 45, 0.65);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    overflow: hidden;
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