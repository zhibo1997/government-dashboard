import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      // requiresAuth: false,
      title: '登录 - 政府大屏系统'
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: '政府大屏系统'
    }
  },
  {
    path: '/cesium-map',
    name: 'CesiumMap',
    component: () => import('../views/CesiumMapView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Cesium地图 - 政府大屏系统'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 初始化认证状态
  authStore.initAuth()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 检查是否已登录
    if (!authStore.isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    
    // 验证token有效性
    const isValidToken = await authStore.validateToken()
    if (!isValidToken) {
      authStore.logout()
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  } else {
    // 如果已登录且访问登录页，重定向到首页
    if (to.name === 'Login' && authStore.isLoggedIn) {
      const isValidToken = await authStore.validateToken()
      if (isValidToken) {
        next({ name: 'Home' })
        return
      } else {
        authStore.logout()
      }
    }
  }
  
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计等逻辑
  console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

export default router