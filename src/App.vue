<!--
 * @Author: Do not edit
 * @Date: 2025-10-30 20:50:05
 * @LastEditors: zhibo1997 1174985654@qq.com
 * @LastEditTime: 2025-11-19 23:01:11
 * @Description: 
-->
<script setup lang="ts">
import { NMessageProvider, NDialogProvider, NConfigProvider, zhCN, dateZhCN } from 'naive-ui'
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-dialog-provider>
      <n-message-provider>
        <RouterView v-slot="{ Component }">
          <keep-alive :include="['WaterSupplyView', 'GasModule']">
            <component :is="Component" />
          </keep-alive>
        </RouterView>
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

<!-- 全局通用样式 - 供所有子组件使用 -->
<style lang="scss">
// 左侧数据展示区域
.container{
  >.left-content {
    width: 820px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 10;
    padding: 0 0 20px 20px;
    box-sizing: border-box;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.8), 60%, rgba(0, 0, 0, 0));
  }
  
  // 右侧数据展示区域
  >.right-content {
    width: 820px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 10;
    padding: 0 0 20px 20px;
    box-sizing: border-box;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.8), 60%, rgba(0, 0, 0, 0));
  }

}

// 数据模块通用样式（非scoped，可被子组件继承）
.data-module {
  flex: 1;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(22, 119, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  background-size: 100% 100%;
  background-image: url("@/assets/img/title-bg.webp");

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(22, 119, 255, 0.4);
  }

  .module-header {
    height: 90px;
    display: flex;
    align-items: center;

    .module-title {
      font-family: YouSheBiaoTiHei;
      font-size: 44px;
      color: #ffffff;
      text-align: left;
      font-style: normal;
      padding-left: 140px;
    }
  }

  .module-content {
    flex: 1;
    padding: 40px 30px;
    height: calc(100% - 90px);
    display: flex;
    flex-direction: column;
    border-radius: 8px;
  }
}

// 供水模块特有样式
.map-toolbar {
  position: absolute;
  right: 830px;
  top: 20px;
}

// 渐变文字效果
.gradient-text {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

// 通用容器布局样式
.module-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background-size: cover;

  // 主体容器
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;
    position: relative;
    height: calc(100% - 180px);
    z-index: 1;
    top: -56px;
  }

  // 中间地图区域通用样式
  .center-map {
    width: 100%;
    position: absolute;
    top: 0;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    pointer-events: auto;

    // 确保地图组件填满容器
    :deep(.vc-viewer) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
