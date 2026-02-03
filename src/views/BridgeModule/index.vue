<!--
 * @Description: 桥梁模块 - 子路由组件（地图、头部由 PersistentLayout 统一管理）
 * @Date: 2026-01-04
-->
<template>
  <!-- 桥梁模块内容区域 -->
  <template v-if="!loading">
    <!-- 左侧数据展示区 -->
    <LeftContent />
    
    <!-- 中间侧边栏 -->
    <SidebarModule />

    <!-- 右侧数据展示区 -->
    <RightContent />
  </template>
  
  <!-- 加载状态 -->
  <div v-else class="loading-placeholder">
    <span>数据加载中...</span>
  </div>
</template>

<script setup lang="ts">
import LeftContent from './leftContent.vue'
import RightContent from './rightContent.vue'
import SidebarModule from './sidebarModule.vue'
import { onBeforeMount, ref } from 'vue'
import { getCachedDictionaries } from '@/services/dictionaryService'

// 定义组件名称
defineOptions({
  name: 'BridgeModule'
})

const loading = ref(false)

// 在页面初始化时预加载所有字典数据
onBeforeMount(async () => {
  try {
    loading.value = true
    // 批量预加载所有需要的字典数据
    await getCachedDictionaries([
      'jcssdstjlx_ql',
      'glmblx_ql',
      'fxdj',
      'zgzt',
      'csaqzx_ql'
    ])
    console.log('桥梁模块字典数据预加载完成')
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('桥梁模块初始化失败:', error)
  }
})
</script>

<style lang="scss">
.module-title {
  -webkit-background-clip: text !important;
  background-clip: text !important; /* 标准属性 */
  -webkit-text-fill-color: transparent !important;
  color: transparent !important; /* 标准属性回退 */
  background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
}
</style>

<style lang="scss" scoped>
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