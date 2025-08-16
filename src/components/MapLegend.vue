<template>
  <div class="map-legend">
    <div class="legend-header">
      <span class="legend-title">图例</span>
    </div>
    <div class="legend-content">
      <div 
        v-for="item in legendItems" 
        :key="item.id"
        class="legend-item"
      >
        <div 
          class="legend-icon"
          :style="{ backgroundColor: item.color }"
        >
          <i :class="item.icon"></i>
        </div>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-count">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 图例数据
const legendItems = ref([
  {
    id: 1,
    label: '监控站点',
    icon: 'icon-monitor',
    color: '#1677ff',
    count: 336
  },
  {
    id: 2,
    label: '监测预警',
    icon: 'icon-warning',
    color: '#faad14',
    count: 12
  },
  {
    id: 3,
    label: '应急设备',
    icon: 'icon-emergency',
    color: '#ff4d4f',
    count: 5
  },
  {
    id: 4,
    label: '地址文章检查点',
    icon: 'icon-checkpoint',
    color: '#52c41a',
    count: 237
  },
  {
    id: 5,
    label: '应急避难',
    icon: 'icon-shelter',
    color: '#722ed1',
    count: 356
  }
])

// 暴露组件方法
defineExpose({
  legendItems
})
</script>

<style lang="scss" scoped>
.map-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  
  .legend-header {
    margin-bottom: 12px;
    
    .legend-title {
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Microsoft YaHei', sans-serif;
    }
  }
  
  .legend-content {
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 6px 0;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .legend-icon {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        i {
          font-size: 8px;
          color: #ffffff;
        }
      }
      
      .legend-label {
        flex: 1;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-family: 'Microsoft YaHei', sans-serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .legend-count {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        font-weight: 500;
        margin-left: 8px;
        min-width: 30px;
        text-align: right;
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .map-legend {
    width: 180px;
    top: 15px;
    right: 15px;
    padding: 12px;
    
    .legend-header {
      .legend-title {
        font-size: 14px;
      }
    }
    
    .legend-content {
      .legend-item {
        .legend-label {
          font-size: 12px;
        }
        
        .legend-count {
          font-size: 11px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .map-legend {
    width: 160px;
    top: 10px;
    right: 10px;
    padding: 10px;
    
    .legend-content {
      .legend-item {
        margin-bottom: 6px;
        
        .legend-icon {
          width: 14px;
          height: 14px;
          margin-right: 6px;
        }
        
        .legend-label {
          font-size: 11px;
        }
        
        .legend-count {
          font-size: 10px;
          min-width: 25px;
        }
      }
    }
  }
}
</style>