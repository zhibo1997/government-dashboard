import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// 独立布局页面
import LoginView from '../views/LoginView.vue'

// 持久化布局组件
import PersistentLayout from '@/layouts/PersistentLayout.vue'

// 业务模块（简化后的子路由组件）
import WaterSupplyView from '../views/WaterSupply/index.vue'
import GasModule from '../views/GasModule/index.vue'
import BridgeModule from '../views/BridgeModule/index.vue'
import HomeModule from '../views/HomeModule/index.vue'
import DrainageModule from '../views/DrainageModule/index.vue'

const routes: RouteRecordRaw[] = [
  // 独立布局：登录页
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      desc: '登录 - 安全综合检测预警平台'
    }
  },
  
  // 持久化布局：业务模块父路由
  {
    path: '/',
    component: PersistentLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: HomeModule,
        meta: {
          requiresAuth: true,
          desc: '综合态势'
        }
      },
      {
        path: 'waterProject',
        name: 'waterProject',
        component: WaterSupplyView,
        meta: {
          requiresAuth: true,
          desc: '供水专项'
        }
      },
      {
        path: 'gas',
        name: 'gas',
        component: GasModule,
        meta: {
          requiresAuth: true,
          desc: '燃气专项'
        }
      },
      {
        path: 'bridge',
        name: 'bridge',
        component: BridgeModule,
        meta: {
          requiresAuth: true,
          desc: '桥梁专项'
        }
      },
      {
        path: 'drainage',
        name: 'drainage',
        component: DrainageModule,
        meta: {
          requiresAuth: true,
          desc: '排水专项'
        }
      }
    ]
  },
  
  // 404 处理
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
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
        next({ name: '/' }) // 或 next('/')
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