<template>
  <div class="left-content">
    <!-- 总览模块 -->
    <OverviewModule />

    <!-- 监测设备模块 -->
    <MonitoringDeviceModule />
  </div>
</template>

<script setup>
import OverviewModule from './components/OverviewModule.vue'
import MonitoringDeviceModule from './components/MonitoringDeviceModule.vue'
</script>

<style lang="scss" scoped>
</style>
