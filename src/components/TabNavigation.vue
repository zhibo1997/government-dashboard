<template>
  <div class="tab-navigation">
    <div class="tab-container">
      <div 
        v-for="(tab, index) in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ 'active': activeTab === tab.id }"
        @click="handleTabClick(tab.id)"
      >
        {{ tab.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

// 定义事件
const emit = defineEmits(['tab-change'])

// Tab数据
const tabs = ref([
  { id: 'comprehensive', label: '综合态势' },
  { id: 'gas', label: '燃气专项' },
  { id: 'bridge', label: '桥梁专项' },
  { id: 'water-supply', label: '供水专项' },
  { id: 'drainage', label: '排水专项' },
  { id: 'social-resources', label: '社会资源' }
])

// 当前激活的tab
const activeTab = ref('comprehensive')

// 处理tab点击
function handleTabClick(tabId) {
  if (activeTab.value !== tabId) {
    activeTab.value = tabId
    emit('tab-change', tabId)
  }
}

// 暴露方法供父组件使用
defineExpose({
  activeTab,
  setActiveTab: (tabId) => {
    activeTab.value = tabId
  }
})
</script>

<style scoped>
.tab-navigation {
  position: relative;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-container {
  display: flex;
  border-radius: 8px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  padding: 8px 20px;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  user-select: none;
  background: transparent;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 192, 105, 0.2);
    transform: translateY(-1px);
  }
  
  &.active {
    color: #ffffff;
    background: #ffc069;
    box-shadow: 0 2px 8px rgba(255, 192, 105, 0.3);
    font-weight: 600;
    transform: translateY(-1px);
    
    &:hover {
      color: #ffffff;
      background: #ffc069;
      transform: translateY(-1px);
    }
  }
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .tab-item {
    padding: 12px 18px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .tab-container {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .tab-item {
    flex: 0 0 calc(50% - 2px);
    padding: 10px 14px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .tab-item {
    flex: 0 0 calc(33.333% - 3px);
    padding: 8px 10px;
    font-size: 14px;
  }
}
</style>