<template>
  <div class="water-supply-special-container">
    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <!-- 头部区域 -->
      <div class="header">
        <div class="left-tabs tabs">
          <TimeDisplay />
          <div class="tabs-content">
            <div class="left-tab-item tab-item" :class="{ active: activeTab === '燃气专项' }"
              @click="handleTabClick('燃气专项')">
              <span>燃气专项</span>
            </div>
            <div class="left-tab-item tab-item" :class="{ active: activeTab === '桥梁专项' }"
              @click="handleTabClick('桥梁专项')">
              <span>桥梁专项</span>
            </div>
          </div>
        </div>
        <div class="head-title" title="阳新县城市安全综合监测预警平台">
          <img src="@/assets/images/title.png" alt="头部标题" class="head-title-img" />
        </div>
        <div class="right-tabs tabs">
          <div class="tabs-content">
            <div class="right-tab-item tab-item" :class="{ active: activeTab === '供水专项' }"
              @click="handleTabClick('供水专项')">
              <span>供水专项</span>
            </div>
            <div class="right-tab-item tab-item" :class="{ active: activeTab === '排水专项' }"
              @click="handleTabClick('排水专项')">
              <span>排水专项</span>
            </div>
          </div>
          <!-- <span class="weather">多云 26°C</span> -->
          <div class="control-box">
            <a-button type="default" class="btn">
              <img src="@/assets/img/setting_icon.png" alt="" />
            </a-button>
            <a-button type="default" class="btn" @click="handleLogout">
              <img src="@/assets/img/logout_icon.png" alt="" />
            </a-button>
          </div>
        </div>
      </div>

      <!-- 主体容器 -->
      <div class="container">
        <!-- 左侧数据展示区 -->
        <LeftNav />

        <!-- 中间地图区域 -->
        <div class="center-map">
          <MapboxMapComponent />
          <!-- 图例 -->
          <img class="map-legend" src="../assets/map-img/legend.png" alt="地图图例" />
        </div>
        <RightNav />
        <!-- 右侧数据展示区 -->
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { LogoutOutlined } from "@ant-design/icons-vue";
import ResponsiveWrapper from "@/components/ResponsiveWrapper.vue";
import MapboxMapComponent from "@/mapComponents/MapboxMapComponent.vue";
import TimeDisplay from "@/components/TimeDisplay.vue";
import router from "@/router";
// 引入左侧导航组件
import LeftNav from "./components/leftContent.vue";
import RightNav from "./components/rightContent.vue";

// 当前选中的tab，默认为供水专项
const activeTab = ref("供水专项");

// 头部标签点击事件
const handleTabClick = (tab) => {
  activeTab.value = tab;
  console.log("切换专项:", tab);
};

// 退出登录点击事件
const handleLogout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};
</script>

<style lang="scss" scoped>
.water-supply-special-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background-size: cover;

  // 头部样式 - 与NewDashboardView保持一致
  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 201px;
    width: 100%;
    background-image: url("@/assets/img/top-bg.png");
    background-size: 100% 201px;
    z-index: 10;
    position: relative;

    .head-title {
      height: 148px;
      display: flex;
      align-items: center;

      >img {
        margin-top: 18px;
      }
    }

    .tabs {
      display: flex;
      flex-direction: row;
      height: 148px;
      justify-content: space-between;
      padding-top: 28px;
      width: 1254px;

      .tabs-content {
        display: flex;
        flex-direction: row;
      }
    }

    .left-tabs {
      background-image: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));

    }

    .right-tabs {
      background-image: linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));

    }

    .tab-item {
      width: 340px;
      height: 90px;
      text-align: center;
      cursor: pointer;
      margin: 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-size: 400px 105px;
      background-position: -30px -6px;

      &.active {
        span {
          background: linear-gradient(0deg, #3FFEFD 0%, #FFF407 100%);
        }
      }

      &.right-tab-item {
        margin-left: -12px;
        background-image: url("@/assets/img/right-btn.png");

        &.active {
          background-image: url("@/assets/img/right-selected-btn.png");
        }
      }

      &.left-tab-item {
        margin-right: -12px;
        background-image: url("@/assets/img/left-btn.png");

        &.active {
          background-image: url("@/assets/img/left-selected-btn.png");
        }
      }

      >span {
        height: 62px;
        font-family: YouSheBiaoTiHei;
        font-size: 48px;
        color: #ffffff;
        line-height: 56px;
        text-align: left;
        font-style: normal;
        background: linear-gradient(90deg, #FFFFFF 18%, #10ADC0 100%);
        -webkit-background-clip: text !important;
        background-clip: text !important;
        /* 标准属性 */
        -webkit-text-fill-color: transparent !important;
        color: transparent !important;
        /* 标准属性回退 */
      }
    }

    .weather {
      font-family: YEFONTAoYeHei;
      font-size: 32px;
      font-weight: normal;
      color: #ffffff;
    }

    .control-box {
      display: flex;
      padding-top: 22px;
      padding-right: 60px;

      .btn {
        width: 40px;
        height: 40px;
        cursor: pointer;
        margin-left: 32px;
        img{
          width: 100%;
          height: 100%;
        }
        &:hover{
          opacity: 0.8;
        }
      }
    }
  }

  // 主体容器
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;
    // padding: 0 20px 20px;
    position: relative;
    height: calc(100% - 180px);
    z-index: 1;
    top: -56px;
  }

  // 左侧数据展示区域
  .left-content {
    width: 820px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 10;

    padding: 0 0 20px 20px;
    box-sizing: border-box;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
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
    :deep(.mapbox-map-container) {
      width: 100%;
      height: 100%;

      .mapbox-gl-map {
        width: 100%;
        height: 100%;
      }
    }

    .map-legend {
      position: absolute;
      bottom: 20px;
      right: 1150px;
    }
  }

  // 右侧数据展示区域
  .right-content {
    width: 820px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 10;
    padding: 0 0 20px 20px;
    box-sizing: border-box;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
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
  background-image: url("@/assets/img/title-bg.png");

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
    height: calc(100% - 60px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;

  }
}
</style>