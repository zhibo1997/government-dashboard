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
