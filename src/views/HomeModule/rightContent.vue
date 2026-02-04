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
</style>
