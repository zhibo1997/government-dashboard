<!--
 * @Author: Do not edit
 * @Date: 2025-10-16 21:05:49
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-25 17:14:31
 * @Description: 供水大屏左侧内容 - 模块化优化版
-->

<template>
  <div class="left-content">
    <!-- 纵览模块 -->
    <OverviewModule />

    <!-- 供水水质模块 -->
    <WaterQualityModule />

    <!-- 应急资源模块（替换原隐患模块） -->
    <EmergencyResourceModule />
  </div>
</template>

<script setup>
import OverviewModule from './components/OverviewModule.vue'
import WaterQualityModule from './components/WaterQualityModule.vue'
import EmergencyResourceModule from '@/components/EmergencyResourceModule.vue'
</script>

<style lang="scss" scoped>
</style>