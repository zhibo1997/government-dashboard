<!--
 * @Description: 持久化布局组件 - 地图和头部在路由切换时保持不变
 * @Date: 2026-01-04
 * 
 * 设计说明：
 * 1. 该组件作为嵌套路由的父组件，始终保持挂载状态
 * 2. CesiumMap、DashboardHeader、ResponsiveWrapper 不会随路由切换而销毁重建
 * 3. 子路由内容通过 <router-view> 渲染，路由切换时自动刷新
 * 4. 使用 :key="route.fullPath" 确保子组件在路由变化时强制重新创建
-->
<template>
  <div class="persistent-layout module-container">
    <!-- 持久化层：地图组件 - 不随路由切换而重新渲染 -->
    <div class="center-map" data-interactive>
      <CesiumMap ref="mapRef" />
    </div>

    <!-- 持久化层：响应式容器 + 头部导航 -->
    <ResponsiveWrapper>
      <DashboardHeader />

      <!-- 主体容器 -->
      <div class="container">
        <!-- 子路由出口：路由切换时此处内容会更新，但布局框架保持不变 -->
        <router-view v-slot="{ Component, route }">
          <!-- 使用 key 确保路由切换时子组件强制刷新 -->
          <component :is="Component" :key="route.fullPath" />
        </router-view>
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import ResponsiveWrapper from '@/components/ResponsiveWrapper.vue'
import CesiumMap from '@/mapComponents/Map.vue'
import DashboardHeader from '@/components/DashboardHeader.vue'

// 地图组件引用，可供子组件通过 inject 获取
const mapRef = ref<InstanceType<typeof CesiumMap> | null>(null)

// 向子组件提供地图实例引用
provide('MAP_INSTANCE', mapRef)

// 向子组件提供监测点位管理 Hook（通过 computed 确保响应式）
provide('monitoringPointsHook', computed(() => mapRef.value?.monitoringPoints))
</script>

<style lang="scss" scoped>
.persistent-layout {
  width: 100%;
  height: 100vh;
  position: relative;
  background-size: cover;
}
</style>
