<template>
  <div class="new-dashboard-container">
    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <div class="header">
        <div class="left-tabs">
          <TimeDisplay />
          <div
            class="left-tab-item tab-item"
            @click="handleTabClick('燃气专项')"
          >
            <span>燃气专项</span>
          </div>
          <div
            class="left-tab-item tab-item"
            @click="handleTabClick('桥梁专项')"
          >
            <span>桥梁专项</span>
          </div>
        </div>
        <div class="head-title" title="阳新县城市安全综合监测预警平台">
          <img
            src="../assets/images/title.png"
            alt="头部标题"
            class="head-title-img"
          />
        </div>
        <div class="right-tabs">
          <div
            class="right-tab-item tab-item"
            @click="handleTabClick('供水专项')"
          >
            <span>供水专项</span>
          </div>
          <div
            class="right-tab-item tab-item"
            @click="handleTabClick('排水专项')"
          >
            <span>排水专项</span>
          </div>
        </div>
      </div>
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
          <!-- <MapboxMapComponent /> -->
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
import TimeDisplay from "../components/TimeDisplay.vue";

// 头部点击时间
const handleTabClick = (tab) => {
  console.log(tab);
};
</script>

<style lang="scss" scoped>
.new-dashboard-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background-image: url("@/assets/images/viewer-bg.webp");
  background-size: cover;
  // 主要布局容器
  .responsive-wrapper {
    display: flex;
    width: 4096px;
    height: 1920px;
  }

  // 左侧导航区域
  .left-nav {
    width: 1180px;
    height: 100%;
    position: relative;
    padding: 20px 60px;

    .nav-image {
      width: 100%;
      object-fit: cover;
      display: block;
    }
  }
  .container {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 148px;
    .head-title {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      width: 2032px;
      background: url("@/assets/images/header-bg.webp") no-repeat center center;
    }
    .left-tabs {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: url("@/assets/images/left-header.webp") no-repeat center
        center;
    }
    .right-tabs {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: url("@/assets/images/left-header.webp") no-repeat center
        center;
    }
    .tab-item {
      width: 301.85px;
      height: 72px;
      background: url("@/assets/images/notSelected.webp") no-repeat center
        center;
      background-size: cover;
      text-align: center;
      cursor: pointer;
      > span {
        font-family: YEFONTAoYeHei;
        font-size: 42px;
        font-weight: normal;
        line-height: normal;
        color: #ffffff;
      }
    }
  }
  // 中间地图区域
  .center-map {
    // width: 1856px; // 4096 - 1120 - 1120 = 1856px
    width: 100%;
    height: 100%;
    position: relative;

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

    .right-image {
      flex: 1;
      height: calc(1920px / 3); // 每张图片占1/3高度

      .content-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }
  }
}
</style>
