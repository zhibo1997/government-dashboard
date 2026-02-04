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
</style>