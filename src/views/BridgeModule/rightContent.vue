<template>
  <div class="right-content">
    <!-- 监测设备模块 -->
    <MonitoringDeviceModule />

    <!-- 预警报警模块 -->
    <BridgeWarningAlarmModule />
  </div>
</template>

<script setup>
import MonitoringDeviceModule from './components/MonitoringDeviceModule.vue';
import BridgeWarningAlarmModule from './components/BridgeWarningAlarmModule.vue';
</script>

<style lang="scss" scoped>
</style>
