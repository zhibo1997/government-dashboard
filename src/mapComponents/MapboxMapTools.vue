<template>
  <div class="mapbox-map-tools">
    <!-- 底图切换工具 -->
    <n-popover trigger="click" placement="right">
      <template #trigger>
        <div class="tool-button" title="切换底图">
          <img src="/src/assets/map-img/basemap.webp" alt="底图" class="tool-icon" />
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
    <n-popover trigger="click" placement="right">
      <template #trigger>
        <div class="tool-button" title="专题图层">
          <img src="/src/assets/map-img/layer.webp" alt="图层" class="tool-icon" />
        </div>
      </template>
      <div class="layer-selector">
        <div class="layer-title">专题图层</div>
        <div class="layer-options">
          <div 
            v-for="layer in thematicLayers" 
            :key="layer.id"
            class="layer-option"
            @click="toggleLayer(layer.id)"
          >
            <n-checkbox 
              :checked="layer.visible" 
              @update:checked="toggleLayer(layer.id)"
            >
              {{ layer.name }}
            </n-checkbox>
          </div>
        </div>
      </div>
    </n-popover>

    <!-- 测量工具 -->
    <n-popover trigger="click" placement="right">
      <template #trigger>
        <div class="tool-button" title="测量工具">
          <img src="/src/assets/map-img/ranging.webp" alt="测量" class="tool-icon" />
        </div>
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
    </n-popover>

    <!-- 重置工具 -->
    <div class="tool-button" title="重置地图" @click="resetMap">
      <img src="/src/assets/map-img/reset.webp" alt="重置" class="tool-icon" />
    </div>

    <!-- 指北针 -->
    <div class="tool-button" title="指北针">
      <img src="/src/assets/map-img/compass.webp" alt="指北针" class="tool-icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { NPopover, NCheckbox } from 'naive-ui'
import type { Map as MapboxMap } from 'mapbox-gl'
import { mapboxUtils } from '@/mapUtils/mapboxUtils'

// 注入地图实例
const mapInstance = inject<{ value: MapboxMap | null }>('mapboxMap')
const map = computed(() => mapInstance?.value)

// 当前底图类型
const currentBasemap = ref<string>('vec')

// 底图选项
const basemapOptions = ref([
  {
    type: 'vec',
    name: '矢量'
  },
  {
    type: 'img',
    name: '影像'
  },
  {
    type: 'ter',
    name: '地形'
  }
])

// 专题图层
const thematicLayers = ref([
  { id: 'administrative', name: '行政区划', visible: true },
  { id: 'poi', name: 'POI点位', visible: false },
  { id: 'traffic', name: '交通路网', visible: false },
  { id: 'building', name: '建筑物', visible: false }
])

/**
 * 切换底图
 */
const switchBasemap = (type: string) => {
  if (!map.value || currentBasemap.value === type) return
  
  try {
    // 使用mapboxUtils创建新的天地图样式并应用
    const newStyle = mapboxUtils.createSimpleTiandituStyle(type as 'vec' | 'img' | 'ter')
    map.value.setStyle(newStyle)
    currentBasemap.value = type
  } catch (error) {
    console.error('切换底图失败:', error)
  }
}

/**
 * 切换专题图层
 */
const toggleLayer = (layerId: string) => {
  const layer = thematicLayers.value.find(l => l.id === layerId)
  if (!layer || !map.value) return
  
  layer.visible = !layer.visible
  
  try {
    // 使用mapbox原生API切换图层可见性
    const visibility = layer.visible ? 'visible' : 'none'
    if (map.value.getLayer(layerId)) {
      map.value.setLayoutProperty(layerId, 'visibility', visibility)
    }
  } catch (error) {
    console.error('切换图层失败:', error)
  }
}

/**
 * 开始距离测量
 */
const startDistanceMeasure = () => {
  if (!map.value) return
  // TODO: 实现距离测量功能
  console.log('开始距离测量')
}

/**
 * 开始面积测量
 */
const startAreaMeasure = () => {
  if (!map.value) return
  // TODO: 实现面积测量功能
  console.log('开始面积测量')
}

/**
 * 清除测量结果
 */
const clearMeasure = () => {
  if (!map.value) return
  // TODO: 实现清除测量功能
  console.log('清除测量结果')
}

/**
 * 重置地图
 */
const resetMap = () => {
  if (!map.value) return
  
  try {
    mapboxUtils.resetMap(map.value)
  } catch (error) {
    console.error('重置地图失败:', error)
  }
}

onMounted(() => {
  if (!map.value) {
    console.warn('MapboxMapTools: 未找到地图实例')
  }
})
</script>

<style scoped>
.mapbox-map-tools {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.tool-button {
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid #d9d9d9;
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
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 底图选择器样式 */
.basemap-selector {
  width: 200px;
  padding: 12px;
}

.basemap-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #262626;
}

.basemap-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  background: #f5f5f5;
}

.basemap-option.active {
  background: #e6f4ff;
  border-color: #1677ff;
}

.basemap-preview {
  width: 40px;
  height: 30px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-content {
  font-size: 10px;
  color: #666;
  text-align: center;
  font-weight: 500;
}

/* 矢量底图预览 */
.preview-vec {
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
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
  font-size: 14px;
  color: #262626;
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

.tool-option:hover {
  background: #f5f5f5;
  color: #1677ff;
}
</style>