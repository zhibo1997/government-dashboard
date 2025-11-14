import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import NewDashboardView from '../views/NewDashboardView.vue'
import WaterSupplyView from '../views/WaterSupply/index.vue'
import SafetyMonitoringView from '../views/SafetyMonitoring/index.vue'
import MapView from '@/views/MapView.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
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
    path: '/mapView',
    name: 'mapView',
    component: MapView,
    meta: {
      requiresAuth: false,
    }
  },
  {
    path: '/',
    name: 'home',
    component: SafetyMonitoringView,
    meta: {
      requiresAuth: true,
      title: '阳新县城市安全综合监测预警平台'
    }
  },
  {
    path: '/waterProject',
    name: 'waterProject',
    component: WaterSupplyView,
    meta: {
      requiresAuth: true,
      title: '供水专项'
    }
  },
  {
    path: '/gas',
    name: 'gas',
    component: NewDashboardView,
    meta: {
      requiresAuth: true,
      title: '燃气专项'
    }
  },
  {
    path: '/bridge',
    name: 'bridge',
    component: NewDashboardView,
    meta: {
      requiresAuth: true,
      title: '桥梁专项'
    }
  },
  {
    path: '/drainage',
    name: 'drainage',
    component: NewDashboardView,
    meta: {
      requiresAuth: true,
      title: '排水专项'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/' // 404页面重定向到主页
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
    document.title = to.meta.title as string
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
        next({ name: 'home' }) // 登录后重定向到主页
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