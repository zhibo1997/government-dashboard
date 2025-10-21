<!--
 * @Author: Do not edit
 * @Date: 2025-10-20 00:16:12
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 23:53:25
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
// import mapboxgl from 'maplibre-gl';
import mapboxgl from "@cgcs2000/mapbox-gl";
import { tiles3DUtils } from '@/mapUtils/tiles3DUtils';
import { mapboxUtils } from '@/mapUtils/mapboxUtils';
import { useMessage } from 'naive-ui'
const message = useMessage()

// 组件属性
interface Props {
  tilesetUrl?: string;
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tilesetUrl: 'http://webres.cityfun.com.cn/CSSMX/model/YXJG/tileset.json',
  autoLoad: true,
});

// 地图实例
const mapInstance = ref<mapboxgl.Map | null>(null);
// DeckOverlay 实例
const deckOverlay = ref<any>(null);
// 加载状态
const loading = ref(false);
// 3D Tiles 可见性
const tiles3DVisible = ref(true);
// 3D Tiles 透明度
const tiles3DOpacity = ref(100);

// 3D Tiles 图层 ID
const TILES_3D_LAYER_ID = 'tiles-3d-layer';

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
    
    // 使用 mapboxUtils 创建地图
    const map = mapboxUtils.initSimpleTiandituMap('tiles3d-map-container', 'img');
    
    // 设置初始视角（更适合 3D 展示）
    map.setPitch(60);
    map.setBearing(0);
    
    mapInstance.value = map;
    
    // 创建 DeckOverlay
    deckOverlay.value = tiles3DUtils.createDeckOverlay();
    
    // 将 DeckOverlay 添加到地图
    map.addControl(deckOverlay.value);
    
    console.log('DeckOverlay 已添加到地图');
    
    // 地图加载完成后加载 3D Tiles
    map.on('load', () => {
      console.log('地图加载完成');
      
      if (props.autoLoad) {
        load3DTiles();
      }
    });
    
    // 错误处理
    map.on('error', (error) => {
      console.error('地图加载错误:', error);
      message.error('地图加载失败');
    });
    
  } catch (error) {
    console.error('地图初始化失败:', error);
    message.error('地图初始化失败');
  }
}

/**
 * 加载 3D Tiles
 */
function load3DTiles() {
  if (!mapInstance.value || !deckOverlay.value) {
    console.error('地图或 DeckOverlay 未初始化');
    return;
  }
  
  try {
    loading.value = true;
    
    console.log('开始加载 3D Tiles:', props.tilesetUrl);
    
    // 加载 3D Tiles 图层
    tiles3DUtils.load3DTiles(
      deckOverlay.value,
      mapInstance.value as any,
      {
        id: TILES_3D_LAYER_ID,
        name: '3D 模型',
        url: props.tilesetUrl,
        opacity: tiles3DOpacity.value / 100,
        pointSize: 2,
        onTilesetLoad: (tileset) => {
          loading.value = false;
          message.success('3D 模型加载成功');
          console.log('3D Tiles 加载成功:', tileset);
        },
        onTilesetError: (error) => {
          loading.value = false;
          message.error('3D 模型加载失败');
          console.error('3D Tiles 加载失败:', error);
        },
      }
    );
    
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
  if (!deckOverlay.value) return;
  
  tiles3DUtils.update3DTilesLayer(
    deckOverlay.value,
    TILES_3D_LAYER_ID,
    { visible }
  );
  
  console.log(`3D Tiles 可见性已设置为: ${visible}`);
}

/**
 * 处理透明度变化
 */
function handleOpacityChange(value: number) {
  if (!deckOverlay.value) return;
  
  tiles3DUtils.update3DTilesLayer(
    deckOverlay.value,
    TILES_3D_LAYER_ID,
    { opacity: value / 100 }
  );
  
  console.log(`透明度已设置为: ${value}%`);
}

/**
 * 重置视角
 */
function handleResetView() {
  if (!mapInstance.value) return;
  
  mapInstance.value.flyTo({
    center: [115.186322, 29.864861],
    zoom: 15,
    pitch: 60,
    bearing: 0,
    duration: 2000,
  });
  
  message.info('视角已重置');
}

/**
 * 重新加载
 */
function handleReload() {
  if (!deckOverlay.value) return;
  
  // 清除现有图层
  tiles3DUtils.clearAll3DTilesLayers(deckOverlay.value);
  
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
    // 清除 3D Tiles 图层
    if (deckOverlay.value) {
      tiles3DUtils.clearAll3DTilesLayers(deckOverlay.value);
    }
    
    // 移除地图实例
    if (mapInstance.value) {
      mapInstance.value.remove();
      mapInstance.value = null;
    }
    
    deckOverlay.value = null;
  } catch (error) {
    console.error('清理资源失败:', error);
  }
});

// 导出方法供父组件调用
defineExpose({
  load3DTiles,
  mapInstance,
  deckOverlay,
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

/* Mapbox GL 样式覆盖 */
:deep(.mapboxgl-canvas) {
  border-radius: 8px;
}

:deep(.mapboxgl-ctrl-top-left),
:deep(.mapboxgl-ctrl-top-right) {
  top: 20px;
}

:deep(.mapboxgl-ctrl-bottom-left) {
  bottom: 20px;
  left: 20px;
}

/* 比例尺样式 */
:deep(.mapboxgl-ctrl-scale) {
  background-color: rgba(8, 21, 38, 0.7);
  border: 2px solid #1677ff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1677ff;
  backdrop-filter: blur(4px);
}
</style>
