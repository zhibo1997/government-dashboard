<template>
  <div class="map-legend">
    <div class="legend-header">
      <span class="title">设备图例</span>
    </div>
    <div class="legend-list">
      <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
        <img :src="item.icon" :alt="item.name" class="legend-icon" />
        <span class="legend-label">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DEVICE_ICON_MAP, DEVICE_TYPE_NAME_MAP } from '@/config/monitoringIconConfig'

// 定义图例项接口
interface LegendItem {
  type: string
  name: string
  icon: string
}

const baseUrl = import.meta.env.VITE_BASE_URL

// 生成图例数据
const legendItems = computed<LegendItem[]>(() => {
  return Object.keys(DEVICE_ICON_MAP).map(type => {
    const iconName = DEVICE_ICON_MAP[type]
    return {
      type,
      name: DEVICE_TYPE_NAME_MAP[type] || '未知设备',
      // 使用与 useMonitoringPoints.ts 一致的图片路径逻辑
      icon: `${baseUrl}/images/equipmentIcons/${iconName}`
    }
  })
})
</script>

<style lang="scss" scoped>
.map-legend {
  position: absolute;
  bottom: 40px;
  right: 840px;
  width: 200px;
  background: rgba(13, 26, 62, 0.8);
  border: 1px solid rgba(0, 246, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 246, 255, 0.2) inset;
  border-radius: 4px;
  padding: 16px;
  z-index: 5;
  pointer-events: auto;
  backdrop-filter: blur(4px);

  .legend-header {
    margin-bottom: 12px;
    padding-left: 10px;
    border-left: 4px solid #00f6ff;
    
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 5px rgba(0, 246, 255, 0.5);
    }
  }

  .legend-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .legend-icon {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      .legend-label {
        font-size: 16px;
        color: #e0e0e0;
        white-space: nowrap;
      }
    }
  }
}
</style>
