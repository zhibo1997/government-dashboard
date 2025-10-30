<template>
  <div class="header">
    <div class="left-tabs tabs">
      <TimeDisplay />
      <div class="tabs-content">
        <div 
          class="left-tab-item tab-item" 
          :class="{ active: activeTab === '燃气专项' }" 
          @click="handleTabClick('燃气专项')"
        >
          <span>燃气专项</span>
        </div>
        <div 
          class="left-tab-item tab-item" 
          :class="{ active: activeTab === '桥梁专项' }" 
          @click="handleTabClick('桥梁专项')"
        >
          <span>桥梁专项</span>
        </div>
      </div>
    </div>
    <div class="head-title" title="阳新县城市安全综合监测预警平台">
      <img src="@/assets/images/title.png" alt="头部标题" class="head-title-img" />
    </div>
    <div class="right-tabs tabs">
      <div class="tabs-content">
        <div 
          class="right-tab-item tab-item" 
          :class="{ active: activeTab === '供水专项' }" 
          @click="handleTabClick('供水专项')"
        >
          <span>供水专项</span>
        </div>
        <div 
          class="right-tab-item tab-item" 
          :class="{ active: activeTab === '排水专项' }" 
          @click="handleTabClick('排水专项')"
        >
          <span>排水专项</span>
        </div>
      </div>
      <div class="control-box">
        <a-button type="default" class="btn" @click="handleSystemAdmin">
          <img src="@/assets/img/setting_icon.png" alt="" />
        </a-button>
        <a-button type="default" class="btn" @click="handleLogout">
          <img src="@/assets/img/logout_icon.png" alt="" />
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TimeDisplay from "@/components/TimeDisplay.vue";

// 初始化路由
const router = useRouter();
const route = useRoute();

// 当前选中的tab，默认根据路由路径确定
const activeTab = ref(getActiveTabFromRoute());

// 根据当前路由确定激活的标签页
function getActiveTabFromRoute() {
  const path = route.path;
  if (path.includes('/waterProject')) return '供水专项';
  if (path.includes('/gas')) return '燃气专项';
  if (path.includes('/bridge')) return '桥梁专项';
  if (path.includes('/drainage')) return '排水专项';
  return '供水专项'; // 默认值
}

// 头部标签点击事件
const handleTabClick = (tab) => {
  console.log("🚀 ~ handleTabClick ~ tab:", tab)
  // 更新激活状态
  activeTab.value = tab;
  
  // 根据标签切换路由
  switch (tab) {
    case '燃气专项':
      router.push('/gas');
      break;
    case '桥梁专项':
      router.push('/bridge');
      break;
    case '供水专项':
      router.push('/waterProject');
      break;
    case '排水专项':
      router.push('/drainage');
      break;
    default:
      router.push('/');
  }
};

// 系统管理按钮点击事件
const handleSystemAdmin = () => {
  console.log('系统管理');
  // 这里可以添加系统管理的逻辑
};

// 退出登录点击事件
const handleLogout = () => {
  // 这里可以添加退出登录的逻辑
  localStorage.removeItem("token");
  router.push("/login");
};
</script>

<style lang="scss" scoped>
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

  .control-box {
    display: flex;
    padding-top: 22px;
    padding-right: 60px;

    .btn {
      width: 40px;
      height: 40px;
      cursor: pointer;
      margin-left: 32px;

      img {
        width: 100%;
        height: 100%;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>