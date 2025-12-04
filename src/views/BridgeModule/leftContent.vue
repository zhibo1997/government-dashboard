<template>
  <div class="left-content">
    <!-- 纵览模块 -->
    <OverviewModule />

    <!-- 桥梁监控模块 -->
    <BridgeMonitoringModule />

    <!-- 监测设备模块 -->
    <MonitoringDeviceModule />
  </div>
</template>

<script setup>
import OverviewModule from './components/OverviewModule.vue';
import BridgeMonitoringModule from './components/BridgeMonitoringModule.vue';
import MonitoringDeviceModule from './components/MonitoringDeviceModule.vue';
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