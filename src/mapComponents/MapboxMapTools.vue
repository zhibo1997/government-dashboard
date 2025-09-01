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
import { inject } from "vue";
import { HomeOutlined, FullscreenOutlined } from "@ant-design/icons-vue";

// 注入地图实例
const mapInstance = inject("mapInstance");

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
