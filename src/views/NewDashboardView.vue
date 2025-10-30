<template>
  <div class="new-dashboard-container">
    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <!-- 使用新的头部组件 -->
      <keep-alive>
        <DashboardHeader />
      </keep-alive>

      <div class="container">
        <!-- 左侧导航图片 -->
        <div class="left-nav">
          <img
            src="../assets/map-img/left-nav.webp"
            alt="左侧导航"
            class="nav-image"
          />
        </div>

        <!-- 中间地图区域 -->
        <div class="center-map">
          <keep-alive>
            <MapboxMapComponent />
          </keep-alive>
          <!-- 图例 -->
          <img class="map-legend" src="../assets/map-img/legend.png" alt="" />
        </div>

        <!-- 右侧内容区域 -->
        <div class="right-content">
          <!-- 右侧第一张图 -->
          <div class="right-image">
            <img
              src="../assets/map-img/right1.png"
              alt="右侧内容1"
              class="content-image"
            />
          </div>

          <!-- 右侧第二张图 -->
          <div class="right-image">
            <img
              src="../assets/map-img/right2.png"
              alt="右侧内容2"
              class="content-image"
            />
          </div>

          <!-- 右侧第三张图 -->
          <div class="right-image">
            <img
              src="../assets/map-img/right3.png"
              alt="右侧内容3"
              class="content-image"
            />
          </div>
        </div>
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup>
import ResponsiveWrapper from "../components/ResponsiveWrapper.vue";
import MapboxMapComponent from "../mapComponents/MapboxMapComponent.vue";
// 引入新的头部组件
import DashboardHeader from "../components/DashboardHeader.vue";
</script>

<style lang="scss" scoped>
.new-dashboard-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background-image: url("@/assets/images/viewer-bg.webp");
  background-size: cover;

  // 左侧导航区域
  .left-nav {
    width: 1160px;
    height: 100%;
    position: relative;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);

    .nav-image {
      width: 100%;
      object-fit: cover;
      display: block;
      user-select: none;
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
      user-drag: none;
      pointer-events: none;
    }
  }

  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;
    padding: 0 20px 20px;
    position: relative;
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
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      transparent 20%,
      transparent 80%,
      rgba(0, 0, 0, 0) 100%
    );

    // 确保地图组件填满容器
    :deep(.mapbox-map-container) {
      width: 100%;
      height: 100%;

      .mapbox-gl-map {
        width: 100%;
        height: 100%;
      }
    }
  }

  // 右侧内容区域
  .right-content {
    width: 1120px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    padding: 16px;
    border-radius: 8px;

    .right-image {
      flex: 1;
      width: 100%;

      .content-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        user-select: none;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
    }
  }
}

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 1150px;
}
</style>
