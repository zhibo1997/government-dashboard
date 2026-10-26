<template>
  <div class="map-toolbar" :class="{ collapsed: isCollapsed, expanded: isMapExpanded }">
    <!-- 退出三维 -->
    <div v-if="bridgeModelStore.loadedTilesets.length > 0" class="toolbar-item exit-3d" @click="exit3DMode" title="退出三维">
      <div class="tool-icon">
        <n-icon size="28" color="#4FC3F7" :component="EnterOutline" />
      </div>
    </div>

    <!-- 展开/收起地图 -->
    <div class="toolbar-item" :class="{ active: isMapExpanded }" @click="toggleMapExpand" title="展开地图">
      <div class="tool-icon">
        <svg v-if="!isMapExpanded" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M120 380V180c0-11 9-20 20-20h200" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M904 380V180c0-11-9-20-20-20H684" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M120 644v200c0 11 9 20 20 20h200" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M904 644v200c0 11-9 20-20 20H684" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M340 160H140c-11 0-20 9-20 20v200" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M684 160h200c11 0 20 9 20 20v200" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M340 864H140c-11 0-20-9-20-20V644" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M684 864h200c11 0 20-9 20-20V644" stroke="#4FC3F7" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <!-- 复位桥梁视角 -->
    <div v-if="props.sceneMode === 3 && bridgeModelStore.loadedTilesets.length > 0" class="toolbar-item" @click="resetBridgeView" title="复位桥梁视角">
      <div class="tool-icon">
        <img src="@/assets/map/reset_map.webp" alt="" />
      </div>
    </div>

    <!-- 收缩按钮 -->
    <div class="toolbar-item" @click="toggleCollapse" title="收缩/展开">
      <div class="tool-icon">
        <img src="@/assets/map/collapse.webp" alt="" />
      </div>
    </div>

    <!-- 工具按钮组 (收缩时隐藏) -->
    <div v-show="!isCollapsed" class="toolbar-buttons">
      <!-- 底图切换 -->
      <div class="toolbar-item" :class="{ active: showBaseMapPanel }" @click.stop="toggleBaseMapPanel" title="底图切换">
        <div class="tool-icon">
          <img src="@/assets/map/base_map.webp" alt="" />
        </div>
        <!-- 底图切换面板 -->
        <transition name="slide-left">
          <div v-if="showBaseMapPanel" class="base-map-panel" @click.stop>
            <div class="panel-header">
              <span class="panel-title">底图切换</span>
              <span class="panel-badge">GIS MAPS</span>
            </div>
            <div class="base-map-options">
              <div
                v-for="item in baseMapTypes"
                :key="item.value"
                class="base-map-option"
                :class="{ active: props.currentBaseMap === item.value }"
                @click.stop="switchBaseMap(item.value)"
              >
                <!-- 精美科技矢量图标 -->
                <div class="option-icon-box">
                  <!-- yxx_image (阳新影像) -->
                  <svg v-if="item.value === 'yxx_image'" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-svg-icon">
                    <defs>
                      <linearGradient id="lensGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#00f0ff" />
                        <stop offset="100%" stop-color="#0066ff" />
                      </linearGradient>
                      <radialGradient id="apertureGlow" cx="24" cy="24" r="14" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.6"/>
                        <stop offset="70%" stop-color="#0055ff" stop-opacity="0.2"/>
                        <stop offset="100%" stop-color="#001840" stop-opacity="0.8"/>
                      </radialGradient>
                    </defs>
                    <path d="M 10 16 V 10 H 16" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M 38 16 V 10 H 32" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M 10 32 V 38 H 16" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M 38 32 V 38 H 32" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="24" cy="24" r="15" stroke="url(#lensGrad)" stroke-width="2.5" fill="url(#apertureGlow)"/>
                    <circle cx="24" cy="24" r="10" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8"/>
                    <line x1="24" y1="17" x2="24" y2="21" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                    <line x1="24" y1="27" x2="24" y2="31" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                    <line x1="17" y1="24" x2="21" y2="24" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                    <line x1="27" y1="24" x2="31" y2="24" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="24" cy="24" r="2.5" fill="#ffffff"/>
                  </svg>

                  <!-- yxx_blue (蓝色底图) -->
                  <svg v-else-if="item.value === 'yxx_blue'" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-svg-icon">
                    <defs>
                      <linearGradient id="globeGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#00d2ff"/>
                        <stop offset="100%" stop-color="#1890ff"/>
                      </linearGradient>
                      <radialGradient id="globeSphere" cx="24" cy="24" r="17" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#00a8ff" stop-opacity="0.35"/>
                        <stop offset="85%" stop-color="#003366" stop-opacity="0.7"/>
                        <stop offset="100%" stop-color="#001a33" stop-opacity="0.9"/>
                      </radialGradient>
                    </defs>
                    <circle cx="24" cy="24" r="17" stroke="url(#globeGrad)" stroke-width="2.5" fill="url(#globeSphere)"/>
                    <line x1="7" y1="24" x2="41" y2="24" stroke="#00f0ff" stroke-width="1.5" opacity="0.8"/>
                    <path d="M 10 16 Q 24 20 38 16" stroke="#00d2ff" stroke-width="1.5" fill="none" opacity="0.7"/>
                    <path d="M 10 32 Q 24 28 38 32" stroke="#00d2ff" stroke-width="1.5" fill="none" opacity="0.7"/>
                    <ellipse cx="24" cy="24" rx="8" ry="17" stroke="#00f0ff" stroke-width="1.5" fill="none" opacity="0.75"/>
                    <line x1="24" y1="7" x2="24" y2="41" stroke="#00f0ff" stroke-width="1.5" opacity="0.7"/>
                    <circle cx="24" cy="16" r="2" fill="#ffffff"/>
                    <circle cx="32" cy="24" r="2" fill="#ffffff"/>
                    <circle cx="16" cy="24" r="1.5" fill="#00f0ff"/>
                    <circle cx="24" cy="32" r="1.5" fill="#00f0ff"/>
                  </svg>

                  <!-- img (影像地图) -->
                  <svg v-else-if="item.value === 'img'" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-svg-icon">
                    <defs>
                      <linearGradient id="satBody" x1="18" y1="10" x2="30" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#48c6ef"/>
                        <stop offset="100%" stop-color="#6f86d6"/>
                      </linearGradient>
                      <linearGradient id="scanBeam" x1="24" y1="22" x2="24" y2="42" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.6"/>
                        <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.05"/>
                      </linearGradient>
                    </defs>
                    <polygon points="24,20 10,42 38,42" fill="url(#scanBeam)"/>
                    <path d="M 9 42 Q 24 38 39 42" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
                    <path d="M 14 34 Q 24 31 34 34" stroke="#00f0ff" stroke-width="1.5" opacity="0.6" stroke-dasharray="3 2"/>
                    <rect x="7" y="12" width="10" height="7" rx="1.5" fill="#1e3c72" stroke="#00f0ff" stroke-width="1.5"/>
                    <line x1="12" y1="12" x2="12" y2="19" stroke="#00f0ff" stroke-width="1"/>
                    <line x1="17" y1="15.5" x2="20" y2="15.5" stroke="#00f0ff" stroke-width="2"/>
                    <rect x="31" y="12" width="10" height="7" rx="1.5" fill="#1e3c72" stroke="#00f0ff" stroke-width="1.5"/>
                    <line x1="36" y1="12" x2="36" y2="19" stroke="#00f0ff" stroke-width="1"/>
                    <line x1="28" y1="15.5" x2="31" y2="15.5" stroke="#00f0ff" stroke-width="2"/>
                    <rect x="20" y="10" width="8" height="11" rx="2" fill="url(#satBody)" stroke="#ffffff" stroke-width="1.5"/>
                    <circle cx="24" cy="7" r="1.5" fill="#00f0ff"/>
                    <line x1="24" y1="8.5" x2="24" y2="10" stroke="#00f0ff" stroke-width="1.5"/>
                  </svg>

                  <!-- vec (矢量地图) -->
                  <svg v-else-if="item.value === 'vec'" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-svg-icon">
                    <defs>
                      <linearGradient id="mapCardGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#16222f"/>
                        <stop offset="100%" stop-color="#0f3460"/>
                      </linearGradient>
                      <linearGradient id="pinGrad" x1="24" y1="10" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#ff9f43"/>
                        <stop offset="100%" stop-color="#ee5253"/>
                      </linearGradient>
                    </defs>
                    <path d="M 8 13 L 18 9 L 30 14 L 40 10 V 35 L 30 39 L 18 34 L 8 38 Z" fill="url(#mapCardGrad)" stroke="#00f0ff" stroke-width="1.5" stroke-linejoin="round"/>
                    <path d="M 18 9 V 34" stroke="#00f0ff" stroke-width="1.5" opacity="0.6" stroke-dasharray="2 2"/>
                    <path d="M 30 14 V 39" stroke="#00f0ff" stroke-width="1.5" opacity="0.6" stroke-dasharray="2 2"/>
                    <path d="M 10 26 Q 22 18 38 24" stroke="#feca57" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                    <path d="M 14 32 L 26 22 L 36 30" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
                    <path d="M 24 10 C 20.7 10 18 12.7 18 16 C 18 20.8 24 26 24 26 C 24 26 30 20.8 30 16 C 30 12.7 27.3 10 24 10 Z" fill="url(#pinGrad)"/>
                    <circle cx="24" cy="15.5" r="2" fill="#ffffff"/>
                  </svg>

                  <!-- ter (地形地图) -->
                  <svg v-else-if="item.value === 'ter'" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-svg-icon">
                    <defs>
                      <linearGradient id="mountFront" x1="18" y1="18" x2="36" y2="38" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#00f2fe"/>
                        <stop offset="100%" stop-color="#4facfe"/>
                      </linearGradient>
                      <linearGradient id="mountBack" x1="10" y1="20" x2="26" y2="38" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#38ef7d"/>
                        <stop offset="100%" stop-color="#11998e"/>
                      </linearGradient>
                    </defs>
                    <polygon points="17,14 6,36 28,36" fill="url(#mountBack)" opacity="0.75"/>
                    <polygon points="17,14 17,36 28,36" fill="#094d46" opacity="0.4"/>
                    <path d="M 7 39 Q 24 33 41 39" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.8"/>
                    <path d="M 10 43 Q 24 38 38 43" stroke="#00f0ff" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5"/>
                    <polygon points="31,18 19,38 43,38" fill="url(#mountFront)"/>
                    <polygon points="31,18 31,38 43,38" fill="#003566" opacity="0.45"/>
                    <polygon points="31,18 28,23 31,22 34,24" fill="#ffffff"/>
                    <polygon points="17,14 14,19 17,18 20,20" fill="#ffffff" opacity="0.9"/>
                  </svg>
                </div>

                <!-- 文字标签与副标题 -->
                <div class="option-content">
                  <div class="option-label">{{ item.label }}</div>
                  <div class="option-desc">{{ item.desc }}</div>
                </div>

                <!-- 选中状态指示器 -->
                <div class="option-indicator">
                  <div v-if="props.currentBaseMap === item.value" class="indicator-active">
                    <svg viewBox="0 0 20 20" fill="none" class="indicator-icon">
                      <circle cx="10" cy="10" r="9" fill="rgba(0, 229, 255, 0.2)" stroke="#00e5ff" stroke-width="2"/>
                      <path d="M6 10.5L8.5 13L14 7.5" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div v-else class="indicator-default"></div>
                </div>
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
    </div>

    <!-- 桥梁模型面板（独立定位） -->
    <transition name="slide-left">
      <div v-show="showBridgePanel" class="bridge-panel" @click.stop>
        <BridgeModelPanel
          :viewer-instance="props.viewerInstance"
          @load-3dtiles="handleLoad3DTiles"
          @layer-toggle="handleLayerToggle"
          @equipment-activate="handleEquipmentActivate"
          @close-panel="showBridgePanel = false"
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
import { NIcon } from "naive-ui";
import { EnterOutline } from "@vicons/ionicons5";
import { useBridgeModelStore } from "@/stores/bridgeModelStore";
import OptimizedLayerTree from "./OptimizedLayerTree.vue";
import BridgeModelPanel from "./BridgeModelPanel.vue";
import GasModelPanel from "./GasModelPanel.vue";
import RiskPointPanel from "./RiskPointPanel.vue";
import { useMapHooks } from "@/hook/useMapHooks";

const cesiumUtils = useMapHooks();
const bridgeModelStore = useBridgeModelStore();

// 注入监测点位管理 Hook（从 PersistentLayout 传递）
const monitoringPointsHook = inject<any>('monitoringPointsHook');

// Props - 从父组件接收状态
interface Props {
  viewerInstance: any
  sceneMode: 2 | 3
  currentBaseMap: 'vec' | 'img' | 'ter' | 'yxx_blue' | 'yxx_image'
  compassRotation: number
  defaultTilesetVisible: boolean
}

const props = defineProps<Props>()

// Emits - 通知父组件
const emit = defineEmits<{
  'update:scene-mode': [mode: 2 | 3]
  'update:base-map': [type: 'vec' | 'img' | 'ter' | 'yxx_blue' | 'yxx_image']
  'reset-map': []
  'toggle-measure': []
  'toggle-default-tileset': []
  'toggle-map-expand': []
  'set-map-expand': [value: boolean]
  'equipment-activate': [bridge: any, active: boolean]
}>()

// 本地UI状态管理
const isCollapsed = ref(true);
const isMapExpanded = ref(false);
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
  { value: "yxx_image", label: "阳新影像", desc: "本地高分卫星遥感" },
  { value: "yxx_blue", label: "蓝色底图", desc: "深蓝科技主题底图" },
  { value: "img", label: "影像地图", desc: "国家天地图遥感影像" },
  { value: "vec", label: "矢量地图", desc: "国家天地图标准路网" },
  { value: "ter", label: "地形地图", desc: "国家天地图高程晕渲" },
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

// 切换展开地图（隐藏左右面板）
const toggleMapExpand = () => {
  isMapExpanded.value = !isMapExpanded.value;
  emit('toggle-map-expand');
  // 展开时关闭所有子面板
  if (isMapExpanded.value) {
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

  // 图层显隐变化后请求渲染
  props.viewerInstance?.scene?.requestRender();
};

// 处理监测设备激活/取消
const handleEquipmentActivate = (bridge: any, active: boolean) => {
  console.log('🎯 handleEquipmentActivate:', bridge.name, 'active:', active);
  console.log('  已加载图层:', [...loadedLayers.value.keys()]);
  if (active) {
    const applyStyle = () => {
      // 桥梁模型变透明
      const bridgeLayer = loadedLayers.value.get(bridge.id);
      if (bridgeLayer?.type === "3dtiles" && bridgeLayer.instance) {
        cesiumUtils.set3DTilesStyle(bridgeLayer.instance, {
          color: `color('white', 0.45)`,
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
    props.viewerInstance?.scene?.requestRender();
  } catch (error) {
    console.error('❌ specialLayer 设备类型切换失败:', error);
  }
};

// 切换底图
const switchBaseMap = (type: "vec" | "img" | "ter" | "yxx_blue" | "yxx_image") => {
  const typeNames: Record<'vec' | 'img' | 'ter' | 'yxx_blue' | 'yxx_image', string> = {
    'img': '影像',
    'vec': '矢量',
    'ter': '地形',
    'yxx_blue': '阳新蓝色底图',
    'yxx_image': '阳新2026影像'
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

// 复位到当前桥梁模型视角
const resetBridgeView = () => {
  if (!props.viewerInstance) return
  const tilesets = bridgeModelStore.loadedTilesets
  if (tilesets.length > 0) {
    // 第一个 tileset 是桥梁模型
    props.viewerInstance.zoomTo(tilesets[0])
  }
}

// 退出三维模式：卸载模型 + 切回2D + 收缩地图（显示侧边栏）+ 复位全域
const exit3DMode = () => {
  unloadAll()
  bridgeModelStore.clearAll()
  // 视角切到俯视（保持 3D 模式）
  if (props.viewerInstance) {
    const Cesium = (window as any).Cesium
    if (Cesium) {
      const camera = props.viewerInstance.camera
      const pos = camera.positionCartographic
      console.log('📷 当前相机位置:', pos.longitude, pos.latitude, pos.height)
      camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, 1000),
        orientation: {
          heading: 0,
          pitch: -Math.PI / 2,
          roll: 0,
        },
        duration: 1.5,
      })
      console.log('📷 flyTo 俯视已触发')
    }
  }
  isMapExpanded.value = false
  emit('set-map-expand', false)
  console.log('🔄 exit3DMode: isMapExpanded set to false, emitted set-map-expand')
  bridgeModelStore.reloadScatter()
  console.log('✅ 已退出三维视角')
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

// 重置展开状态（路由切换时调用）
function resetExpandState() {
  isMapExpanded.value = false;
}

// 暴露方法和状态
defineExpose({
  isCollapsed,
  isMapExpanded,
  loadedLayers,
  layerTreeRef,
  showEquipmentDialog,
  activeEquipmentBridge,
  unloadAll,
  resetExpandState,
});

/**
 * 卸载所有已加载的图层（路由切换时调用）
 * 清除 3D Tiles、MVT 等所有通过 MapToolbar 加载的图层
 */
function unloadAll() {
  if (!props.viewerInstance) return;

  loadedLayers.value.forEach((layer, layerId) => {
    try {
      if (layer.type === '3dtiles') {
        cesiumUtils.remove3DTiles(props.viewerInstance, layer.instance);
      } else if (layer.type === 'mvt') {
        // MVT 图层通过 ImageryLayer 加载，移除 imageryProvider
        if (layer.instance) {
          layer.instance.show = false;
        }
      }
      console.log(`✅ 已卸载图层: ${layerId}`);
    } catch (e) {
      console.warn(`⚠️ 卸载图层失败: ${layerId}`, e);
    }
  });

  loadedLayers.value.clear();
  console.log('✅ 所有已加载图层已清除');
}
</script>

<style lang="scss" scoped>
.map-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1000;
  transition: all 0.3s ease;

  .toolbar-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &.collapsed {
    gap: 0;

    .toolbar-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &.expanded {
    right: 22px !important;
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
      align-items: center;
      justify-content: center;
      padding: 8px;
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;

      svg {
        width: 48px;
        height: 48px;
      }

      &:hover {
        transform: scale(1.2);
      }

      &.compass {
        transition: transform 0.6s ease;
      }

      .icon-placeholder {
        font-size: var(--font-size-subtitle);
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
    width: 410px;
    background: rgba(11, 28, 45, 0.88);
    backdrop-filter: blur(16px);
    border: 2px solid rgba(22, 119, 255, 0.4);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(22, 119, 255, 0.15);

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .panel-title {
        font-size: var(--font-size-subtitle);
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 1px;
      }

      .panel-badge {
        font-size: var(--font-size-mini);
        color: #00e5ff;
        background: rgba(0, 229, 255, 0.12);
        border: 1px solid rgba(0, 229, 255, 0.35);
        border-radius: 4px;
        padding: 2px 8px;
        letter-spacing: 1px;
        font-weight: 600;
      }
    }

    .base-map-options {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .base-map-option {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.25s ease;

        &:hover {
          background: rgba(0, 229, 255, 0.08);
          border-color: rgba(0, 229, 255, 0.4);
          transform: translateX(-4px);
        }

        &.active {
          background: linear-gradient(90deg, rgba(0, 229, 255, 0.2) 0%, rgba(22, 119, 255, 0.12) 100%);
          border-color: #00e5ff;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.25), inset 0 0 12px rgba(0, 229, 255, 0.1);

          .option-icon-box {
            border-color: #00e5ff;
            background: linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(22, 119, 255, 0.4));
            box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
          }

          .option-label {
            color: #00f0ff;
            font-weight: 700;
            text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
          }

          .option-desc {
            color: rgba(0, 229, 255, 0.85);
          }
        }

        .option-icon-box {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(22, 119, 255, 0.15), rgba(0, 229, 255, 0.05));
          border: 1px solid rgba(0, 229, 255, 0.25);
          transition: all 0.3s ease;

          .map-svg-icon {
            width: 36px;
            height: 36px;
          }
        }

        .option-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;

          .option-label {
            font-size: var(--font-size-heading);
            color: #ffffff;
            font-weight: 600;
            transition: color 0.3s ease;
          }

          .option-desc {
            font-size: var(--font-size-mini);
            color: rgba(255, 255, 255, 0.55);
            transition: color 0.3s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .option-indicator {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;

          .indicator-active {
            display: flex;
            align-items: center;
            justify-content: center;

            .indicator-icon {
              width: 22px;
              height: 22px;
            }
          }

          .indicator-default {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }
        }

        &:hover .indicator-default {
          border-color: rgba(0, 229, 255, 0.5);
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
    height: 520px;
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