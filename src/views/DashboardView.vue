<template>
  <div class="dashboard-container">
    <ResponsiveWrapper>
      <!-- 用户信息栏 -->
      <div class="user-info">
        <span class="welcome-text">欢迎，{{ authStore.user?.username }}</span>
        <a-button type="text" @click="handleLogout" class="logout-btn">
          <template #icon>
            <LogoutOutlined />
          </template>
          退出登录
        </a-button>
      </div>
      
      <!-- 时间显示 -->
      <TimeDisplay />
      
      <!-- 背景图片 -->
      <BackgroundImage />
      
      <!-- 地图组件 -->
      <MapComponent />
      
      <!-- 其他组件可以在这里添加 -->
      <!-- <TabNavigation :current-tab="currentTab" @tab-change="handleTabChange" /> -->
    </ResponsiveWrapper>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LogoutOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '../stores/auth'
import ResponsiveWrapper from '../components/ResponsiveWrapper.vue'
import TimeDisplay from '../components/TimeDisplay.vue'
import BackgroundImage from '../components/BackgroundImage.vue'
import MapComponent from '../components/MapComponent.vue'
// import TabNavigation from '../components/TabNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

// 当前选中的标签页
const currentTab = ref('map')

// 标签页切换处理
const handleTabChange = (tab) => {
  currentTab.value = tab
}

// 退出登录
const handleLogout = () => {
  authStore.logout()
  message.success('已退出登录')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 100vh;
  position: relative;
  
  .user-info {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 16px;
    border-radius: 6px;
    backdrop-filter: blur(10px);
    
    .welcome-text {
      color: #fff;
      font-size: 14px;
    }
    
    .logout-btn {
      color: #fff;
      
      &:hover {
        color: var(--primary-color);
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
    .user-info {
      top: 10px;
      right: 10px;
      padding: 6px 12px;
      
      .welcome-text {
        font-size: 12px;
      }
    }
  }
}
</style>