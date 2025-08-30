<template>
  <div class="tool-group">
    <div class="tool-title">视图控制</div>
    <div class="tool-buttons">
      <button
        v-for="control in viewControls"
        :key="control.id"
        :class="['tool-btn', { active: control.active }]"
        @click="handleViewControl(control)"
        :title="control.name"
      >
        <i :class="control.icon"></i>
        <span class="btn-text">{{ control.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useMapStore } from "../stores/mapStore";
import { cesiumUtils } from '../mapUtils/cesiumUtils';

// 注入地图实例
const mapInstance = inject('mapInstance');

// 使用地图store
const mapStore = useMapStore();

// 视图控制配置
const viewControls = ref([
  {
    id: 'reset',
    name: '复位',
    icon: 'icon-reset',
    active: false,
    type: 'reset'
  },
  {
    id: 'fullscreen',
    name: '全屏',
    icon: 'icon-fullscreen',
    active: false,
    type: 'fullscreen'
  },
  {
    id: 'view2d',
    name: '2D',
    icon: 'icon-2d',
    active: false,
    type: '2d'
  },
  {
    id: 'view3d',
    name: '3D',
    icon: 'icon-3d',
    active: true,
    type: '3d'
  }
]);

// 处理视图控制
const handleViewControl = (control) => {
  const viewer = mapStore.viewer;
  if (!viewer) return;
  
  switch (control.type) {
    case 'reset':
      cesiumUtils.resetView();
      break;
    case 'fullscreen':
      toggleFullscreen(control);
      mapStore.setMapState('fullscreen', control.active);
      break;
    case '2d':
      cesiumUtils.switchTo2D();
      updateViewModeButtons('2d');
      mapStore.setMapState('viewMode', '2d');
      break;
    case '3d':
      cesiumUtils.switchTo3D();
      updateViewModeButtons('3d');
      mapStore.setMapState('viewMode', '3d');
      break;
  }
};

// 更新视图模式按钮状态
const updateViewModeButtons = (activeMode) => {
  viewControls.value.forEach(ctrl => {
    if (ctrl.type === '2d' || ctrl.type === '3d') {
      ctrl.active = ctrl.type === activeMode;
    }
  });
};

// 切换全屏
const toggleFullscreen = (control) => {
  if (!document.fullscreenElement) {
    // 进入全屏
    const container = document.getElementById('cesium-container');
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
    control.active = true;
    control.icon = 'icon-exit-fullscreen';
    control.name = '退出全屏';
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    control.active = false;
    control.icon = 'icon-fullscreen';
    control.name = '全屏';
  }
};

// 监听全屏状态变化
document.addEventListener('fullscreenchange', () => {
  const fullscreenControl = viewControls.value.find(ctrl => ctrl.type === 'fullscreen');
  if (fullscreenControl) {
    if (!document.fullscreenElement) {
      fullscreenControl.active = false;
      fullscreenControl.icon = 'icon-fullscreen';
      fullscreenControl.name = '全屏';
    }
  }
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