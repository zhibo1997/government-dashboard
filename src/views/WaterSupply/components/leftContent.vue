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

    <!-- 供水管网模块 -->
    <PipelineModule />
  </div>
</template>

<script setup>
import OverviewModule from './OverviewModule.vue'
import WaterQualityModule from './WaterQualityModule.vue'
import PipelineModule from './PipelineModule.vue'
</script>

<style lang="scss" scoped>
.left-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>