<!--
 * @Author: zhibo1997 1174985654@qq.com
 * @Date: 2025-11-17 19:13:37
 * @LastEditors: 王志博
 * @LastEditTime: 2026-01-04
 * @Description: 排水模块 - 子路由组件（地图、头部由 PersistentLayout 统一管理）
-->
<template>
  <!-- 排水模块内容区域 -->
  <template v-if="!loading">
    <!-- 左侧数据展示区 -->
    <LeftNav />

    <!-- 中间侧边栏（易涝点，暂不启用） -->
    <!-- <SidebarModule /> -->

    <!-- 右侧数据展示区 -->
    <RightNav />
  </template>

  <!-- 加载状态 -->
  <div v-else class="loading-placeholder">
    <span>数据加载中...</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, provide } from 'vue'
// 引入左右内容组件
import LeftNav from './leftContent.vue'
import RightNav from '../WaterSupply/RightContent.vue'
// import SidebarModule from './sidebarModule.vue'
// 引入字典缓存服务
import { getCachedDictionaries } from '@/services/dictionaryService'

const loading = ref(false)

// 定义排水模块配置对象
const moduleConfig = {
  moduleType: 'drainage',
  sszx: 'csaqzx_ps',
  dictPrefix: 'ps',
  imagePath: 'drainage',
  moduleName: '排水',
  dictKey: {
    jcssdstjlx: 'jcssdstjlx_ps',
    yhlx: 'yhlx_ps',
    glmblx: 'glmblx_ps',
    jcsblx: 'jcsblx_ps'
  }
}

// 通过 provide 传递给子组件
provide('MODULE_CONFIG', moduleConfig)

// 在页面初始化时预加载所有字典数据
onBeforeMount(async () => {
  try {
    loading.value = true
    // 批量预加载所有需要的字典数据
    await getCachedDictionaries([
      'jcssdstjlx_ps',  // OverviewModule
      'gwcz',           // PipelineModule
      'yhlx_ps',        // PipelineModule
      'jcsblx_ps',      // MonitoringEquipmentModule
      'zgzt',           // RiskHazardModule
      'yjlx_ps',        // EarlyWarningModule
      'ps_szjcsb',      // WaterQualityModule
      'glmblx_ps',      // WaterQualityModule
    ])
    loading.value = false
    console.log('排水模块字典数据预加载完成')
  } catch (error) {
    loading.value = false
    console.error('字典数据预加载失败:', error)
  }
})

// 定义组件名称
defineOptions({
  name: 'DrainageModule'
})
</script>

<style lang="scss" scoped>
// 排水模块的 module-content 特殊布局
:deep(.data-module .module-content) {
  height: calc(100% - 60px);
  align-items: center;
  justify-content: center;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-size-caption);
}
</style>
