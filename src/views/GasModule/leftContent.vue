<template>
  <div class="left-content">
    <!-- 基础设施模块 -->
    <InfrastructureModule />

    <!-- 燃气管网模块 -->
    <GasPipelineModule />

    <!-- 应急资源模块（从右下移过来） -->
    <EmergencyResourceModule />
  </div>
</template>

<script setup>
import InfrastructureModule from './components/InfrastructureModule.vue';
import GasPipelineModule from './components/GasPipelineModule.vue';
import EmergencyResourceModule from '@/components/EmergencyResourceModule.vue';
</script>

<style lang="scss" scoped>
</style>
