<template>
  <div class="cesium-map-tools">
    <!-- 工具栏容器 -->
    <div class="tools-container">
      <!-- 地图工具 -->
      <div v-for="group in mapTools" :key="group.title" class="tool-group">
        <div class="tool-title">{{ group.title }}</div>
        <div class="tool-buttons">
          <button
            v-for="tool in group.tools"
            :key="tool.id"
            :class="['tool-btn', { active: tool.active }]"
            @click="handleToolClick(tool)"
          >
            <i :class="tool.icon"></i>
            <span class="btn-text">{{ tool.name }}</span>
          </button>
        </div>
      </div>
      
      <!-- 图层控制工具 -->
      <LayerControls />
      
      <!-- 测量工具 -->
      <MeasureTools ref="measureToolsRef" />
      
      <!-- 视图控制 -->
      <ViewControls />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LayerControls from "./LayerControls.vue";
import MeasureTools from "./MeasureTools.vue";
import ViewControls from "./ViewControls.vue";
import { useMapStore } from "../stores/mapStore";
import { cesiumUtils } from "../mapUtils/cesiumUtils";

// 使用地图store
const mapStore = useMapStore();

// 测量工具组件引用
const measureToolsRef = ref(null);

// 定义事件
const emit = defineEmits(['tool-click']);

// 工具配置
const mapTools = ref([
  {
    title: '图层控制',
    tools: [
      { id: 'satellite', name: '卫星图层', icon: 'icon-satellite', type: 'toggle', active: false },
      { id: 'label', name: '标注图层', icon: 'icon-label', type: 'toggle', active: false },
      { id: 'boundary', name: '边界图层', icon: 'icon-boundary', type: 'toggle', active: false },
      { id: 'marker', name: 'POI标记', icon: 'icon-marker', type: 'toggle', active: false }
    ]
  },
  {
    title: '交互工具',
    tools: [
      { id: 'pan', name: '平移', icon: 'icon-pan', type: 'radio', active: true },
      { id: 'identify', name: '识别', icon: 'icon-identify', type: 'radio', active: false },
      { id: 'draw', name: '绘制', icon: 'icon-draw', type: 'radio', active: false },
      { id: 'clear', name: '清除', icon: 'icon-clear', type: 'action', active: false }
    ]
  }
]);

// 处理工具点击
const handleToolClick = (tool) => {
  const viewer = mapStore.viewer;
  if (!viewer) return;
  
  console.log('Tool clicked:', tool.name);
  
  // 根据工具类型执行相应操作
  switch (tool.id) {
    case 'satellite':
      cesiumUtils.toggleImageryLayer('satellite');
      tool.active = !tool.active;
      mapStore.setLayerState('satellite', tool.active);
      break;
    case 'label':
      cesiumUtils.toggleImageryLayer('label');
      tool.active = !tool.active;
      mapStore.setLayerState('label', tool.active);
      break;
    case 'boundary':
      cesiumUtils.toggleImageryLayer('boundary');
      tool.active = !tool.active;
      mapStore.setLayerState('boundary', tool.active);
      break;
    case 'marker':
      cesiumUtils.togglePOIMarkers();
      tool.active = !tool.active;
      mapStore.setLayerState('poi', tool.active);
      break;
    case 'pan':
      cesiumUtils.setInteractionMode('pan');
      updateToolStates('pan');
      mapStore.setMapState('interactionMode', 'pan');
      break;
    case 'identify':
      cesiumUtils.setInteractionMode('identify');
      updateToolStates('identify');
      mapStore.setMapState('interactionMode', 'identify');
      break;
    case 'draw':
      cesiumUtils.setInteractionMode('draw');
      updateToolStates('draw');
      mapStore.setMapState('interactionMode', 'draw');
      break;
    case 'clear':
      cesiumUtils.clearAllData();
      mapStore.clearAllData();
      break;
    default:
      // 切换工具激活状态
      if (tool.type === 'toggle') {
        tool.active = !tool.active;
      }
      break;
  }
  
  // 发送事件给父组件
  emit('tool-click', tool);
};

// 更新工具状态
const updateToolStates = (activeToolId) => {
  mapTools.value.forEach(group => {
    group.tools.forEach(tool => {
      if (tool.type === 'radio') {
        tool.active = tool.id === activeToolId;
      }
    });
  });
};

// 清除测量结果
function clearMeasureResults() {
  if (measureToolsRef.value) {
    measureToolsRef.value.clearMeasureResults();
  }
}
</script>

<style scoped>
.cesium-map-tools {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 5000;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.tools-container {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 16px;
  min-width: 200px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tool-group {
  margin-bottom: 20px;
}

.tool-group:last-child {
  margin-bottom: 0;
}

.tool-title {
  color: var(--text-primary, rgba(255, 255, 255, 0.9));
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--primary-color, #1677ff);
  color: var(--text-primary, rgba(255, 255, 255, 0.9));
  transform: translateY(-1px);
}

.tool-btn.active {
  background: var(--primary-color, #1677ff);
  border-color: var(--primary-color, #1677ff);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
}

.tool-btn i {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.btn-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
}

/* 图标样式 - 使用字体图标或者可以替换为实际的图标字体 */
.icon-satellite::before { content: "🛰️"; }
.icon-label::before { content: "🏷️"; }
.icon-boundary::before { content: "🗺️"; }
.icon-marker::before { content: "📍"; }
.icon-pan::before { content: "✋"; }
.icon-identify::before { content: "🔍"; }
.icon-draw::before { content: "✏️"; }
.icon-clear::before { content: "🗑️"; }
.icon-distance::before { content: "📏"; }
.icon-area::before { content: "📐"; }
.icon-height::before { content: "📊"; }
.icon-home::before { content: "🏠"; }
.icon-fullscreen::before { content: "⛶"; }
.icon-3d::before { content: "🎲"; }
.icon-2d::before { content: "🗂️"; }

/* 滚动条样式 */
.tools-container::-webkit-scrollbar {
  width: 6px;
}

.tools-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.tools-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.tools-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>