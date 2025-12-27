<template>
  <div class="left-content">
    <!-- 总览模块 -->
    <OverviewModule />

    <!-- 风险隐患模块 -->
    <RiskHazardModule />
  </div>
</template>

<script setup>
import OverviewModule from './components/OverviewModule.vue'
import RiskHazardModule from './components/RiskHazardModule.vue'
</script>

<style lang="scss" scoped>
.left-content {
  width: 820px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
  padding: 0 0 20px 20px;
  box-sizing: border-box;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
}
</style>
