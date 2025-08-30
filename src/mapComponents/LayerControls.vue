<template>
  <div class="layer-controls">
    <!-- 基础图层控制 -->
    <div class="tool-group">
      <div class="tool-title">基础图层</div>
      <div class="tool-buttons">
        <button
          v-for="layer in layerControls"
          :key="layer.id"
          :class="['tool-btn', { active: layer.visible }]"
          @click="toggleLayer(layer)"
          :title="layer.name"
        >
          <i :class="layer.icon"></i>
          <span class="btn-text">{{ layer.name }}</span>
        </button>
      </div>
    </div>
    
    <!-- 业务图层树 -->
    <div class="tool-group layer-tree-group">
      <div class="tool-title">
        <span>业务图层</span>
        <button 
          class="toggle-btn"
          @click="toggleLayerTree"
          :title="showLayerTree ? '收起图层树' : '展开图层树'"
        >
          <i :class="showLayerTree ? 'icon-chevron-up' : 'icon-chevron-down'"></i>
        </button>
      </div>
      
      <div v-if="showLayerTree" class="layer-tree-container">
        <LayerTreeIntegration />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useMapStore } from '../stores/mapStore';
import { cesiumUtils } from '../mapUtils/cesiumUtils';
import LayerTreeIntegration from '../components/LayerTreeIntegration.vue';

// 注入地图实例
const mapInstance = inject('mapInstance');

// 使用地图store
const mapStore = useMapStore();

// 响应式数据
const showLayerTree = ref(true);

// 图层控制配置
const layerControls = ref([
  {
    id: 'satellite',
    name: '卫星图',
    icon: 'icon-satellite',
    visible: false,
    type: 'imagery'
  },
  {
    id: 'terrain',
    name: '地形图',
    icon: 'icon-terrain',
    visible: false,
    type: 'terrain'
  },
  {
    id: 'labels',
    name: '标注',
    icon: 'icon-labels',
    visible: true,
    type: 'labels'
  }
]);

// 切换图层树显示
const toggleLayerTree = () => {
  showLayerTree.value = !showLayerTree.value;
};

// 切换图层显示
const toggleLayer = (layer) => {
  const viewer = mapStore.viewer;
  if (!viewer) return;
  
  layer.visible = !layer.visible;
  
  switch (layer.type) {
    case 'imagery':
      // 使用cesiumUtils切换影像图层
      if (layer.visible) {
        cesiumUtils.addTiandituImagery();
      } else {
        cesiumUtils.removeTiandituImagery();
      }
      // 更新store状态
      mapStore.setLayerState('satellite', layer.visible);
      break;
    case 'terrain':
      // 使用cesiumUtils切换地形
      cesiumUtils.toggleTerrain(layer.visible);
      // 更新store状态
      mapStore.setLayerState('terrain', layer.visible);
      break;
    case 'labels':
      // 切换标注显示
      viewer.entities.values.forEach(entity => {
        if (entity.label) {
          entity.label.show = layer.visible;
        }
      });
      // 更新store状态
      mapStore.setLayerState('labels', layer.visible);
      break;
  }
};
</script>

<style lang="scss" scoped>
.layer-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-group {
  margin-bottom: 20px;
  
  .tool-title {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 10px;
    padding: 0 5px;
  }
  
  .tool-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .tool-btn {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: var(--primary-color);
      }
      
      &.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: #fff;
      }
      
      i {
        margin-right: 8px;
        font-size: 16px;
      }
      
      .btn-text {
        font-size: 12px;
      }
    }
  }
  
  &.layer-tree-group {
    .tool-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .toggle-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 2px;
        border-radius: 2px;
        transition: all 0.2s;
        
        &:hover {
          color: var(--primary-color);
          background: rgba(255, 255, 255, 0.1);
        }
        
        i {
          font-size: 12px;
        }
      }
    }
  }
}

.layer-tree-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>