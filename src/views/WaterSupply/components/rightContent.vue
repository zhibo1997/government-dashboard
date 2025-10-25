<template>
  <div class="right-content">
    <MonitoringEquipmentModule />
    <RiskHazardModule />
    <EarlyWarningModule />
  </div>
</template>

<script setup>
import MonitoringEquipmentModule from './MonitoringEquipmentModule.vue';
import RiskHazardModule from './RiskHazardModule.vue';
import EarlyWarningModule from './EarlyWarningModule.vue';
</script>

<style lang="scss" scoped>
.right-content {
  display: flex;
  flex-direction: column;
}
</style>
