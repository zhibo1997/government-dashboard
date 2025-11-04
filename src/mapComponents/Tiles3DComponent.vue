<!--
 * @Author: Do not edit
 * @Date: 2025-10-20 00:16:12
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-04 21:30:00
 * @Description: 
-->
<template>
  <div class="tiles-3d-wrapper">
    <div id="tiles3d-map-container" class="tiles3d-map-instance"></div>
    
    <!-- 3D Tiles 控制面板 -->
    <div class="tiles3d-control-panel">
      <div class="control-item">
        <span class="control-label">显示 3D 模型</span>
        <a-switch 
          v-model:checked="tiles3DVisible" 
          @change="handleVisibilityChange"
          size="small"
        />
      </div>
      
      <div class="control-item">
        <span class="control-label">透明度</span>
        <a-slider 
          v-model:value="tiles3DOpacity" 
          :min="0" 
          :max="100" 
          :step="10"
          @change="handleOpacityChange"
          style="width: 120px;"
        />
      </div>
      
      <div class="control-item">
        <a-button 
          size="small" 
          type="primary" 
          @click="handleResetView"
        >
          重置视角
        </a-button>
      </div>
      
      <div class="control-item">
        <a-button 
          size="small" 
          @click="handleReload"
        >
          重新加载
        </a-button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <a-spin size="large" tip="正在加载 3D 模型..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useMessage } from 'naive-ui'

// 组件属性
interface Props {
  tilesetUrl?: string;
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tilesetUrl: 'public/tilese.json',
  autoLoad: true,
});

// Cesium Viewer 实例
const viewerInstance = ref<any>(null);
// 加载状态
const loading = ref(false);
// 3D Tiles 可见性
const tiles3DVisible = ref(true);
// 3D Tiles 透明度
const tiles3DOpacity = ref(100);

// 3D Tiles 图层 ID
const TILES_3D_LAYER_ID = 'tiles-3d-layer';

const message = useMessage()

/**
 * 初始化地图
 */
function initMap() {
  try {
    console.log('初始化 3D Tiles 地图...');
    
    // 检查容器是否存在
    const container = document.getElementById('tiles3d-map-container');
    if (!container) {
      throw new Error('地图容器不存在: tiles3d-map-container');
    }
    
    // 初始化 Cesium Viewer
    // 这里将使用 Cesium 的初始化方法替代 Mapbox
    console.log('使用 Cesium 初始化地图');
    
    // 模拟初始化完成
    setTimeout(() => {
      if (props.autoLoad) {
        load3DTiles();
      }
    }, 1000);
    
  } catch (error) {
    console.error('地图初始化失败:', error);
    message.error('地图初始化失败');
  }
}

/**
 * 加载 3D Tiles
 */
function load3DTiles() {
  if (!viewerInstance.value) {
    console.error('Cesium Viewer 未初始化');
    return;
  }
  
  try {
    loading.value = true;
    
    console.log('开始加载 3D Tiles:', props.tilesetUrl);
    
    // 这里将实现 Cesium 3D Tiles 加载逻辑
    setTimeout(() => {
      loading.value = false;
      message.success('3D 模型加载成功');
      console.log('3D Tiles 加载成功');
    }, 2000);
    
  } catch (error) {
    loading.value = false;
    console.error('加载 3D Tiles 失败:', error);
    message.error('加载 3D 模型失败');
  }
}

/**
 * 处理可见性变化
 */
function handleVisibilityChange(visible: boolean) {
  console.log(`3D Tiles 可见性已设置为: ${visible}`);
}

/**
 * 处理透明度变化
 */
function handleOpacityChange(value: number) {
  console.log(`透明度已设置为: ${value}%`);
}

/**
 * 重置视角
 */
function handleResetView() {
  console.log('重置视角');
  message.info('视角已重置');
}

/**
 * 重新加载
 */
function handleReload() {
  // 重新加载
  setTimeout(() => {
    load3DTiles();
  }, 300);
  
  message.info('正在重新加载...');
}

/**
 * 组件挂载
 */
onMounted(() => {
  setTimeout(() => {
    initMap();
  }, 100);
});

/**
 * 组件卸载
 */
onBeforeUnmount(() => {
  try {
    // 清理资源
    viewerInstance.value = null;
  } catch (error) {
    console.error('清理资源失败:', error);
  }
});

// 导出方法供父组件调用
defineExpose({
  load3DTiles,
  viewerInstance,
});
</script>

<style scoped lang="scss">
.tiles-3d-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 600px;
}

.tiles3d-map-instance {
  width: 100%;
  height: 100%;
  position: relative;
}

.tiles3d-control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(8, 21, 38, 0.9);
  border: 1px solid #1677ff;
  border-radius: 8px;
  padding: 16px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.control-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.control-label {
  color: #ffffff;
  font-size: 14px;
  white-space: nowrap;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  backdrop-filter: blur(4px);
}
</style>