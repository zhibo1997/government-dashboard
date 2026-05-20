<template>
  <div class="left-content">
    <!-- 纵览模块 -->
    <OverviewModule />

    <!-- 桥梁监控模块 -->
    <BridgeMonitoringModule />

    <!-- 应急资源模块（从右下移过来） -->
    <BridgeEmergencyResourceModule />
  </div>
</template>

<script setup>
import OverviewModule from './components/OverviewModule.vue';
import BridgeMonitoringModule from './components/BridgeMonitoringModule.vue';
import BridgeEmergencyResourceModule from '../GasModule/components/EmergencyResourceModule.vue';
</script>

<style lang="scss" scoped>
</style>
