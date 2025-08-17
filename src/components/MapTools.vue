<template>
  <div class="map-tools">
    <div class="tool-button" @click="zoomIn" title="放大">
      <svg class="tool-icon" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
        <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2"/>
        <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
    
    <div class="tool-button" @click="zoomOut" title="缩小">
      <svg class="tool-icon" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
        <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
    
    <div class="tool-button" @click="resetView" title="复位">
      <svg class="tool-icon" viewBox="0 0 24 24" fill="none">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" stroke-width="2"/>
        <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" stroke-width="2"/>
        <path d="M8 16l-5 5v-5h5" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入地图实例
const mapInstance = inject('mapInstance', null)

// 放大地图
const zoomIn = () => {
  if (mapInstance && mapInstance.value) {
    const currentZoom = mapInstance.value.getZoom()
    mapInstance.value.setZoom(currentZoom + 1)
  }
}

// 缩小地图
const zoomOut = () => {
  if (mapInstance && mapInstance.value) {
    const currentZoom = mapInstance.value.getZoom()
    mapInstance.value.setZoom(currentZoom - 1)
  }
}

// 复位地图视图
const resetView = () => {
  if (mapInstance && mapInstance.value) {
    // 复位到初始中心点和缩放级别
    const defaultCenter = new T.LngLat(115.133954, 29.823198)
    mapInstance.value.centerAndZoom(defaultCenter, 11)
  }
}
</script>

<style scoped>
.map-tools {
  position: absolute;
  top: 220px;
  right: 700px;
  display: flex;
  flex-direction: column;
  z-index: 4000;
}

.tool-button {
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  color: rgba(0, 0, 0, 0.65);
  padding: 8px;
}

.tool-button:hover {
  background: #f5f5f5;
  border-color: #1677ff;
  color: #1677ff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.15);
}

.tool-button:active {
  background: #e6f4ff;
  border-color: #0958d9;
  color: #0958d9;
  transform: translateY(1px);
}

.tool-icon {
  width: 24px;
  height: 24px;
  stroke-width: 3;
}
</style>