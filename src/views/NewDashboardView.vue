<template>
  <div class="new-dashboard-container">
    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <div class="header">
        <div class="left-tabs tabs">
          <TimeDisplay />
          <div class="tabs-content">
            <div class="left-tab-item tab-item" :class="{ active: activeTab === '燃气专项' }" @click="handleTabClick('燃气专项')">
              <span>燃气专项</span>
            </div>
            <div class="left-tab-item tab-item" :class="{ active: activeTab === '桥梁专项' }" @click="handleTabClick('桥梁专项')">
              <span>桥梁专项</span>
            </div>
          </div>
        </div>
        <div class="head-title" title="阳新县城市安全综合监测预警平台">
          <img src="../assets/images/title.png" alt="头部标题" class="head-title-img" />
        </div>
        <div class="right-tabs tabs">
          <div class="tabs-content">
            <div class="right-tab-item tab-item" :class="{ active: activeTab === '供水专项' }" @click="handleTabClick('供水专项')">
              <span>供水专项</span>
            </div>
            <div class="right-tab-item tab-item" :class="{ active: activeTab === '排水专项' }" @click="handleTabClick('排水专项')">
              <span>排水专项</span>
            </div>
          </div>
          <span class="weather">多云 26°C</span>
          <div class="control-box">
            
          </div>
        </div>
      </div>
      <div class="container">
        <!-- 左侧导航图片 -->
        <div class="left-nav">
          <img src="../assets/map-img/left-nav.webp" alt="左侧导航" class="nav-image" />
        </div>

        <!-- 中间地图区域 -->
        <div class="center-map">
          <MapboxMapComponent />
          <MapboxMapTools />
        </div>

        <!-- 右侧内容区域 -->
        <div class="right-content">
          <!-- 右侧第一张图 -->
          <div class="right-image">
            <img src="../assets/map-img/right1.png" alt="右侧内容1" class="content-image" />
          </div>

          <!-- 右侧第二张图 -->
          <div class="right-image">
            <img src="../assets/map-img/right2.png" alt="右侧内容2" class="content-image" />
          </div>

          <!-- 右侧第三张图 -->
          <div class="right-image">
            <img src="../assets/map-img/right3.png" alt="右侧内容3" class="content-image" />
          </div>
        </div>
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ResponsiveWrapper from "../components/ResponsiveWrapper.vue";
import MapboxMapComponent from "../mapComponents/MapboxMapComponent.vue";
import MapboxMapTools from "../mapComponents/MapboxMapTools.vue";
import TimeDisplay from "../components/TimeDisplay.vue";

// 当前选中的tab
const activeTab = ref('燃气专项');

// 头部点击时间
const handleTabClick = (tab) => {
  activeTab.value = tab;
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
    flex:1;
    padding: 0 20px 20px;
    position: relative;
  }


  // 中间地图区域
  .center-map {
    width: 3000px; 
    position: absolute;
    top: 0;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0) 100%);


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
      background: url("@/assets/images/header-bg.webp") no-repeat;
      background-size: 100% 100%;
      height: 148px;
    pointer-events: none;

      >img {
        margin-top: 18px;
      }
    }
    .tabs{
      display: flex;
      flex-direction: row;
      width: 1417px;
      height: 100%;
      justify-content: space-between;
      padding-top: 28px;
      .tabs-content{
        display: flex;
        flex-direction: row;
      }
    }
    .left-tabs {
      background: url("@/assets/images/left-header.webp") no-repeat;
      background-size: 100% 72px;
      background-position-y: 72px;
      padding-right: 200px;
    }

    .right-tabs {
        background: url("@/assets/images/right-header.webp") no-repeat;
      background-size: 100% 72px;
      background-position-y: 72px;
        padding-left: 200px;
    }

    .tab-item {
      width: 301.85px;
      height: 72px;
      background: url("@/assets/images/notSelected.webp") no-repeat;
      background-size: cover;
      text-align: center;
      cursor: pointer;
      margin:0 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      >span {
        font-family: YEFONTAoYeHei;
        font-size: 42px;
        font-weight: normal;
        line-height: normal;
        color: #ffffff;
      }

      &.active {
        background: url("@/assets/images/selected.webp") no-repeat;
        background-size: cover;
      }
    }

    .weather {
      font-family: YEFONTAoYeHei;
      font-size: 32px;
      font-weight: normal;
      color: #ffffff;
    }
  }
</style>
