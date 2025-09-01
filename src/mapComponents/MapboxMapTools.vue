<template>
  <div class="mapbox-tools-container">
    <!-- 地图控制工具 -->
    <div class="tools-section">
      <div class="tool-group">
        <a-button
          class="tool-button"
          type="primary"
          size="small"
          @click="handleHome"
          title="回到初始位置"
        >
          <template #icon>
            <HomeOutlined />
          </template>
        </a-button>
        
        <a-button
          class="tool-button"
          type="primary"
          size="small"
          @click="handleReset"
          title="地图复位"
        >
          <template #icon>
            <ReloadOutlined />
          </template>
        </a-button>

        <a-button
          class="tool-button"
          type="primary"
          size="small"
          @click="handleCompass"
          title="指北针"
        >
          <template #icon>
            <CompassOutlined />
          </template>
        </a-button>

        <a-button
          class="tool-button"
          :type="distanceMode ? 'primary' : 'default'"
          size="small"
          @click="handleDistance"
          title="测距工具"
        >
          <template #icon>
            <RulerOutlined />
          </template>
        </a-button>
        
        <a-button
          class="tool-button"
          type="primary"
          size="small"
          @click="handleFullscreen"
          title="全屏显示"
        >
          <template #icon>
            <FullscreenOutlined />
          </template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from "vue";
import { 
  HomeOutlined, 
  FullscreenOutlined, 
  ReloadOutlined, 
  CompassOutlined, 
  RulerOutlined 
} from "@ant-design/icons-vue";
import { mapboxUtils } from "../mapUtils/mapboxUtils";

// 注入地图实例
const mapInstance = inject("mapInstance");

// 测距模式状态
const distanceMode = ref(false);

// 回到初始位置
function handleHome() {
  if (mapInstance?.value) {
    mapInstance.value.flyTo({
      center: [115.133954, 29.823198], // 阳新县中心坐标
      zoom: 10,
      duration: 2000
    });
  }
}

// 地图复位
function handleReset() {
  if (mapInstance?.value) {
    mapboxUtils.resetMap(mapInstance.value);
  }
}

// 指北针控件
function handleCompass() {
  if (mapInstance?.value) {
    mapboxUtils.addCompassControl(mapInstance.value, 'top-right');
  }
}

// 测距工具
function handleDistance() {
  if (mapInstance?.value) {
    if (!distanceMode.value) {
      mapboxUtils.enableDistanceMode(mapInstance.value);
      distanceMode.value = true;
    } else {
      mapboxUtils.disableDistanceMode(mapInstance.value);
      distanceMode.value = false;
    }
  }
}

// 全屏显示
function handleFullscreen() {
  if (mapInstance?.value) {
    if (mapInstance.value.isFullscreen()) {
      mapInstance.value.exitFullscreen();
    } else {
      mapInstance.value.enterFullscreen();
    }
  }
}
</script>

<style scoped>
.mapbox-tools-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tools-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.tool-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mapbox-tools-container {
    top: 10px;
    right: 10px;
  }
  
  .tool-button {
    width: 36px;
    height: 36px;
  }
}
</style>
