<template>
  <div class="safety-monitoring-container">
    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <!-- 头部区域 -->
      <keep-alive>
        <DashboardHeader />
      </keep-alive>

      <!-- 主体容器 -->
      <div class="container">
        <!-- 左侧监测管理区 -->
        <LeftContent />

        <!-- 中间地图区域 -->
        <div class="center-map">
          <keep-alive>
            <!-- <MapComponent /> -->
          </keep-alive>
        </div>

        <!-- 右侧预警通报区 -->
        <RightContent />
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup>
import ResponsiveWrapper from "@/components/ResponsiveWrapper.vue";
import MapComponent from "@/mapComponents/Map.vue";
import LeftContent from "./leftContent.vue";
import RightContent from "./rightContent.vue";
import DashboardHeader from "@/components/DashboardHeader.vue";
</script>

<style lang="scss" scoped>
.safety-monitoring-container {
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

  // 中间地图区域
  .center-map {
    width: 4096px;
    position: absolute;
    top: 0;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;

    // 确保地图组件填满容器
    :deep(.vc-viewer) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<!-- 公用数据模块样式 - 供子组件使用 -->
<style lang="scss">
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
</style>
