import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      title: '登录 - 安全综合检测预警平台'
    }
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/NewDashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: '安全综合检测预警平台'
    }
  },
  {
    path: '/waterProject',
    name: 'waterProject',
    component: () => import('../views/WaterSupply/index.vue'),
    meta: {
      requiresAuth: true,
      title: '供水专项'
    }
  },
  {
    path: '/tiles3d',
    name: 'tiles3d',
    component: () => import('../views/Tiles3DView.vue'),
    meta: {
      requiresAuth: false,
      title: '3D Tiles 模型展示'
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
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 只在应用启动时初始化认证状态，避免每次路由都重新初始化
  if (from.name === undefined) {
    authStore.initAuth()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {

    // 验证token有效性
    const isValidToken = await authStore.validateToken()
    if (!isValidToken) {
      authStore.logout()
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  } else {
    // 如果已登录且访问登录页，重定向到仪表板
    if (to.name === 'Login' && authStore.isLoggedIn) {
      const isValidToken = await authStore.validateToken()
      if (isValidToken) {
        next({ name: 'dashboard' })
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