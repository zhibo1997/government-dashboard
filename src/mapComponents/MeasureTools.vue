<template>
  <div class="tool-group">
    <div class="tool-title">测量工具</div>
    <div class="tool-buttons">
      <button
        v-for="measure in measureTools"
        :key="measure.id"
        :class="['tool-btn', { active: measure.active }]"
        @click="handleMeasureClick(measure)"
        :title="measure.name"
      >
        <i :class="measure.icon"></i>
        <span class="btn-text">{{ measure.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useMapStore } from '../stores/mapStore';
import { cesiumUtils } from '../mapUtils/cesiumUtils';

// 注入地图实例
const mapInstance = inject('mapInstance');

// 使用地图store
const mapStore = useMapStore();

// 测量工具配置
const measureTools = ref([
  {
    id: 'distance',
    name: '距离',
    icon: 'icon-distance',
    active: false,
    type: 'distance'
  },
  {
    id: 'area',
    name: '面积',
    icon: 'icon-area',
    active: false,
    type: 'area'
  },
  {
    id: 'height',
    name: '高度',
    icon: 'icon-height',
    active: false,
    type: 'height'
  }
]);

// 处理测量工具点击
const handleMeasureClick = (measure) => {
  const viewer = mapStore.viewer;
  if (!viewer) return;
  
  // 如果点击的是当前激活的工具，则取消激活
  if (mapStore.measureState.currentTool === measure.type) {
    cesiumUtils.stopMeasure();
    mapStore.setMeasureState(false, null);
    measure.active = false;
    return;
  }
  
  // 先停止之前的测量
  cesiumUtils.stopMeasure();
  
  // 重置所有工具状态
  measureTools.value.forEach(tool => tool.active = false);
  
  // 激活新工具
  measure.active = true;
  mapStore.setMeasureState(true, measure.type);
  
  // 根据工具类型启动相应的测量
  switch (measure.type) {
    case 'distance':
      cesiumUtils.startDistanceMeasure();
      break;
    case 'area':
      cesiumUtils.startAreaMeasure();
      break;
    case 'height':
      cesiumUtils.startHeightMeasure();
      break;
  }
};

// 清除测量结果
const clearMeasurements = () => {
  cesiumUtils.clearMeasureResults();
  mapStore.setMeasureState(false, null);
  measureTools.value.forEach(tool => tool.active = false);
};

// 暴露清除方法给父组件
defineExpose({
  clearMeasurements
});
</script>

<style lang="scss" scoped>
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
}
</style>