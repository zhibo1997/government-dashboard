<template>
  <div class="right-content">
    <!-- 监测报警模块 -->
    <MonitoringAlarmModule />

    <!-- 监测预警模块 -->
    <MonitoringEarlyWarningModule />
  </div>
</template>

<script setup>
import MonitoringAlarmModule from './components/MonitoringAlarmModule.vue'
import MonitoringEarlyWarningModule from './components/MonitoringEarlyWarningModule.vue'
</script>

<style lang="scss" scoped>
.right-content {
  width: 820px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
  padding: 0 20px 20px 0;
  box-sizing: border-box;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
}
</style>
