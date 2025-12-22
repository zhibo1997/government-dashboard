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
.right-content {
  width: 820px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
  padding: 0 20px 20px 0;
  box-sizing: border-box;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
}
</style>