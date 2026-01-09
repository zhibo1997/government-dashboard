<!--
 * @Description: 首页模块 - 子路由组件（地图、头部由 PersistentLayout 统一管理）
 * @Date: 2026-01-04
-->
<template>
  <!-- 首页模块内容区域 -->
  <template v-if="!loading">
    <!-- 左侧数据展示区 -->
    <LeftContent />
    
    <!-- 图层开关控件（位于左侧内容区底部） -->
    <div class="layer-switch-wrapper">
      <LayerSwitch @layer-toggle="handleLayerToggle" />
    </div>

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
import LayerSwitch from './components/LayerSwitch.vue'
import { onBeforeMount, ref, inject } from 'vue'
import { getCachedDictionaries } from '@/services/dictionaryService'

// 定义组件名称
defineOptions({
  name: 'HomeModule'
})

const loading = ref(false)

// 注入监测点位管理 Hook（从 PersistentLayout 传递）
const monitoringPointsHook = inject<any>('monitoringPointsHook')

// 在页面初始化时预加载所有字典数据
onBeforeMount(async () => {
  try {
    loading.value = true
    // 批量预加载所有需要的字典数据
    await getCachedDictionaries([
      'jcsstjlx',   // OverviewModule
      'fxdj',       // RiskHazardModule
      'yhdj',       // RiskHazardModule
      'bjjb',       // MonitoringAlarmModule
      'yjczzt',     // MonitoringEarlyWarningModule
    ])
    console.log('首页模块字典数据预加载完成')
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('字典数据预加载失败:', error)
  }
})

/**
 * 处理图层开关切换
 */
const handleLayerToggle = async (payload: { sszx: string; visible: boolean }) => {
  if (!monitoringPointsHook || !monitoringPointsHook.value) {
    console.warn('⚠️ 监测点位管理 Hook 未注入')
    return
  }
  
  console.log(`🔄 首页触发图层切换: ${payload.sszx} - ${payload.visible ? '显示' : '隐藏'}`)
  
  try {
    // 调用 Hook 的切换方法
    await monitoringPointsHook.value.toggleSszx(payload.sszx, payload.visible)
    console.log('✅ 图层切换成功')
  } catch (error) {
    console.error('❌ 图层切换失败:', error)
  }
}
</script>

<style lang="scss">
.module-title {
  -webkit-background-clip: text !important;
  background-clip: text !important; /* 标准属性 */
  -webkit-text-fill-color: transparent !important;
  color: transparent !important; /* 标准属性回退 */
  background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
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

.layer-switch-wrapper {
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 15;
}
</style>
