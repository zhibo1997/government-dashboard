<!--
 * @Description: 首页模块 - 子路由组件（地图、头部由 PersistentLayout 统一管理）
 * @Date: 2026-01-04
-->
<template>
  <!-- 首页模块内容区域 -->
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
import LeftContent from './leftContent.vue'
import RightContent from './rightContent.vue'
import { onMounted, ref, onBeforeMount } from 'vue'
import { getCachedDictionaries } from '@/services/dictionaryService'

// 定义组件名称
defineOptions({
  name: 'HomeModule'
})

const loading = ref(false)

// 在页面初始化时预加载所有字典数据
const preloadDictionaries = async () => {
  try {
    loading.value = true
    await getCachedDictionaries([
      'jcsstjlx',
      'fxdj',
      'yhdj',
      'bjjb',
      'yjczzt',
      'jcsblx'
    ])
    console.log('首页模块字典数据预加载完成')
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('字典数据预加载失败:', error)
  }
}

onBeforeMount(() => {
  console.log('HomeModule 即将挂载')
})

onMounted(async () => {
  console.log('HomeModule 已挂载，开始预加载字典数据')
  await preloadDictionaries()
})
</script>

<style lang="scss">
.module-title {
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
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
  font-size: var(--font-size-caption);
}
</style>
