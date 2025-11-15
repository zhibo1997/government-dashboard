<template>
  <div class="left-content">
    <!-- 监测管理模块 -->
    <MonitoringManagementModule />

    <!-- 监测综合模块 -->
    <MonitoringComprehensiveModule />

    <!-- 井盖统计模块 -->
    <ManholeStatisticsModule />
  </div>
</template>

<script setup>
import MonitoringManagementModule from './components/MonitoringManagementModule.vue';
import MonitoringComprehensiveModule from './components/MonitoringComprehensiveModule.vue';
import ManholeStatisticsModule from './components/ManholeStatisticsModule.vue';
</script>

<style lang="scss" scoped>
.left-content {
  width: 820px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
  padding: 0 0 20px 20px;
  box-sizing: border-box;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
}
</style>
