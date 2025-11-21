import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import NewDashboardView from '../views/NewDashboardView.vue'
import WaterSupplyView from '../views/WaterSupply/index.vue'
import MapView from '@/views/MapView.vue'
import GasModule from '../views/GasModule/index.vue'

const routes: RouteRecordRaw[] = [
  // 👇 新增：根路径重定向到默认页面
  {
    path: '/',
    redirect: '/gas' // 或 '/bridge'，按需选择
  },
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
    component: GasModule,
    meta: {
      requiresAuth: false,
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
    redirect: '/' // 现在 / 有定义了，不会死循环
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // 初始化认证（仅首次）
  if (from.name === undefined) {
    authStore.initAuth()
  }

  if (to.meta.requiresAuth) {
    const isValidToken = await authStore.validateToken()
    if (!isValidToken) {
      authStore.logout()
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  } else {
    // 已登录用户访问登录页，跳转到首页
    if (to.name === 'Login' && authStore.isLoggedIn) {
      const isValidToken = await authStore.validateToken()
      if (isValidToken) {
        // ✅ 修复：跳转到存在的路由
        next({ name: 'mapView' }) // 或 next('/')
        return
      } else {
        authStore.logout()
      }
    }
  }

  next()
})

router.afterEach((to, from) => {
  console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

export default router