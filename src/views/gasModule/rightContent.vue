<template>
  <div class="right-content">
    <!-- 预警通报模块 -->
    <WarningNotificationModule />

    <!-- 座舱管理模块 -->
    <CockpitManagementModule />
  </div>
</template>

<script setup>
import WarningNotificationModule from './components/WarningNotificationModule.vue';
import CockpitManagementModule from './components/CockpitManagementModule.vue';
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
