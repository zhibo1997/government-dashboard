<!--
 * @Author: zhibo1997 1174985654@qq.com
 * @Date: 2025-11-17 19:13:37
 * @LastEditors: 王志博
 * @LastEditTime: 2026-01-04
 * @Description: 供水模块 - 子路由组件（地图、头部由 PersistentLayout 统一管理）
-->
<template>
  <!-- 供水模块内容区域 -->
  <template v-if="!loading">
    <!-- 左侧数据展示区 -->
    <LeftContent />
    
    <!-- 右侧数据展示区 -->
    <RightContent />
  </template>
  
  <!-- 加载状态 -->
  <div v-else class="loading-placeholder">
    <span>数据加载中...</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, provide, ref } from 'vue'
// 引入左右内容组件
import LeftContent from './leftContent.vue'
import RightContent from './rightContent.vue'
// 引入字典缓存服务
import { getCachedDictionaries } from '@/services/dictionaryService'

const loading = ref(false)

// 定义供水模块配置对象
const moduleConfig = {
  moduleType: 'waterSupply',
  sszx: 'csaqzx_gs',
  dictPrefix: 'gs',
  imagePath: 'waterSupply',
  moduleName: '供水',
  dictKey: {
    jcssdstjlx: 'jcssdstjlx_gs',
    yhlx: 'yhlx_gs',
    glmblx: 'glmblx_gs',
    jcsblx: 'jcsblx_gs'
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
      'jcssdstjlx_gs',  // OverviewModule
      'gwcz',           // PipelineModule
      'yhlx_gs',        // PipelineModule
      'jcsblx_gs',      // MonitoringEquipmentModule
      'zgzt',           // RiskHazardModule
      'yjlx_gs',        // EarlyWarningModule
      'gs_szjcsb',      // WaterQualityModule
      'glmblx_gs',      // WaterQualityModule
    ])
    loading.value = false
    console.log('供水模块字典数据预加载完成')
  } catch (error) {
    loading.value = false
    console.error('字典数据预加载失败:', error)
  }
})

// 定义组件名称
defineOptions({
  name: 'WaterSupplyView'
})
</script>

<style lang="scss" scoped>
// 供水模块的 module-content 特殊布局
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
  font-size: 16px;
}
</style>
