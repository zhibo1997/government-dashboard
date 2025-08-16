
<template>
  <ResponsiveWrapper>
    <div class="dashboard-container">
      <!-- 背景图片组件 -->
      <BackgroundImage />
      <!-- Tab导航栏 -->
      <div class="tab-navigation-wrapper">
        <TabNavigation @tab-change="handleTabChange" />
      </div>
      <!-- 地图组件 -->
      <MapComponent />
      <!-- 其他内容区域 -->
    </div>
  </ResponsiveWrapper>
</template>
<script setup>
import { ref } from 'vue'
import ResponsiveWrapper from './components/ResponsiveWrapper.vue'
import MapComponent from './components/MapComponent.vue'
import BackgroundImage from './components/BackgroundImage.vue'
import TabNavigation from './components/TabNavigation.vue'

// 当前激活的tab
const currentTab = ref('comprehensive')

// 处理tab切换
function handleTabChange(tabId) {
  currentTab.value = tabId
  console.log('切换到tab:', tabId)
  // 这里可以添加根据不同tab显示不同内容的逻辑
}
</script>


<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
}

.tab-navigation-wrapper {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  width: auto;
  max-width: 90%;
}

/* 自定义滚动条样式 */
.dashboard-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dashboard-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.dashboard-container::-webkit-scrollbar-thumb {
  background: rgba(22, 119, 255, 0.3);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.dashboard-container::-webkit-scrollbar-thumb:hover {
  background: rgba(22, 119, 255, 0.5);
}

.dashboard-container::-webkit-scrollbar-corner {
  background: transparent;
}

/* Firefox 滚动条样式 */
.dashboard-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(22, 119, 255, 0.3) rgba(0, 0, 0, 0.1);
}
</style>
