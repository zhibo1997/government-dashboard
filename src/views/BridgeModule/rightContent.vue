<template>
  <div class="right-content">
    <!-- 风险隐患模块 -->
    <BridgeRiskHazardModule />

    <!-- 预警报警模块 -->
    <BridgeWarningAlarmModule />

    <!-- 应急资源模块 -->
    <BridgeEmergencyResourceModule />
  </div>
</template>

<script setup>
import BridgeRiskHazardModule from './components/BridgeRiskHazardModule.vue';
import BridgeWarningAlarmModule from './components/BridgeWarningAlarmModule.vue';
import BridgeEmergencyResourceModule from '../GasModule/components/EmergencyResourceModule.vue';
</script>

<style lang="scss" scoped>
</style>