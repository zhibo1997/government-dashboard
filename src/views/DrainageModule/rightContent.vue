<!--
 * @Author: Do not edit
 * @Date: 2025-10-28 23:32:22
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-04 21:25:57
 * @Description: 
-->
<template>
  <div class="right-content">
    <MonitoringEquipmentModule />
    <RiskHazardModule />
    <EarlyWarningModule />
  </div>
</template>

<script setup>
import MonitoringEquipmentModule from '../WaterSupply/components/MonitoringEquipmentModule.vue';
import RiskHazardModule from '../WaterSupply/components/RiskHazardModule.vue';
import EarlyWarningModule from '../WaterSupply/components/EarlyWarningModule.vue';
</script>

<style lang="scss" scoped>
.right-content {
  display: flex;
  flex-direction: column;
}
</style>
