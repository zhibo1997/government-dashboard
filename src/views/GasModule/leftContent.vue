<template>
  <div class="left-content">
    <!-- 基础设施模块 -->
    <InfrastructureModule />

    <!-- 燃气管网模块 -->
    <GasPipelineModule />

    <!-- 监测设备模块 -->
    <MonitoringDeviceModule />
  </div>
</template>

<script setup>
import InfrastructureModule from './components/InfrastructureModule.vue';
import GasPipelineModule from './components/GasPipelineModule.vue';
import MonitoringDeviceModule from './components/MonitoringDeviceModule.vue';
</script>

<style lang="scss" scoped>
</style>
