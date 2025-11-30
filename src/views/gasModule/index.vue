<template>
  <div class="gas-module-container module-container">
    <!-- 中间地图区域 -->
    
    <div class="center-map" data-interactive>
      <!-- <CesiumMap /> -->
    </div>
    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <!-- 头部区域 -->
      <DashboardHeader />

      <!-- 主体容器 -->
      <div class="container">
        <!-- 左侧数据展示区 -->
        <LeftContent />
        <SidebarModule />
        
        <!-- 右侧数据展示区 -->
        <RightContent />
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup lang="ts">
import ResponsiveWrapper from "@/components/ResponsiveWrapper.vue";
import LeftContent from "./leftContent.vue";
import RightContent from "./rightContent.vue";
import DashboardHeader from "@/components/DashboardHeader.vue";
import SidebarModule from "./sidebarModule.vue";
import CesiumMap from "@/mapComponents/Map.vue";

// 定义组件名称以支持keep-alive
defineOptions({
  name: 'GasModule'
});
</script>

<style lang="scss" scoped>
.gas-module-container {
}
</style>
