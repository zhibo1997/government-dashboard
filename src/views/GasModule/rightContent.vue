<template>
  <div class="right-content">
    <!-- 风险隐患模块 -->
    <RiskHazardModule />

    <!-- 预警报警模块 -->
    <WarningAlarmModule />

    <!-- 应急资源模块 -->
    <EmergencyResourceModule />
  </div>
</template>

<script setup>
import RiskHazardModule from './components/RiskHazardModule.vue';
import WarningAlarmModule from './components/WarningAlarmModule.vue';
import EmergencyResourceModule from './components/EmergencyResourceModule.vue';
</script>

<style lang="scss" scoped>
</style>
