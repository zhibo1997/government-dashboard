<template>
  <div class="right-content">
    <!-- 监测设备模块（从左移过来） -->
    <MonitoringDeviceModule />

    <!-- 预警报警模块 -->
    <WarningAlarmModule />
  </div>
</template>

<script setup>
import MonitoringDeviceModule from './components/MonitoringDeviceModule.vue';
import WarningAlarmModule from './components/WarningAlarmModule.vue';
</script>

<style lang="scss" scoped>
</style>
