<template>
  <div class="left-content">
    <!-- 排水总览模块 -->
    <DrainageOverviewModule />

    <!-- 排水水质模块（复用供水水质模块） -->
    <WaterQualityModule />

    <!-- 应急资源模块 -->
    <EmergencyResourceModule />
  </div>
</template>

<script setup>
import DrainageOverviewModule from './components/DrainageOverviewModule.vue'
import WaterQualityModule from '../WaterSupply/components/WaterQualityModule.vue'
import EmergencyResourceModule from '@/components/EmergencyResourceModule.vue'
</script>

<style lang="scss" scoped>
</style>
