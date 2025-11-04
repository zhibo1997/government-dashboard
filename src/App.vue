<!--
 * @Author: Do not edit
 * @Date: 2025-10-30 20:50:05
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-30 22:40:25
 * @Description: 
-->
<script setup lang="ts">
import { NMessageProvider, NDialogProvider, NConfigProvider, zhCN, dateZhCN } from 'naive-ui'
import DashboardHeader from './components/DashboardHeader.vue'
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-dialog-provider>
      <n-message-provider>
        <DashboardHeader />
        <RouterView />
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style scoped>
/* 全局样式调整 */
:deep(.n-config-provider) {
  width: 100%;
  height: 100%;
}
</style>
