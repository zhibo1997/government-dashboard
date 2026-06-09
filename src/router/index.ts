import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMapStore } from '../stores/mapStore'

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
          desc: '供水专项',
          defaultLayerIds: [
            '5b42b88c-8fec-46b0-a9b5-3f35c8eb2067',
            'c665ebf0-7327-473a-9743-42fc5ea2d111'
          ]
        }
      },
      {
        path: 'gas',
        name: 'gas',
        component: GasModule,
        meta: {
          requiresAuth: true,
          desc: '燃气专项',
          defaultLayerIds: [
            '1b30d4d8-fd3c-4b21-86ab-f534e333a3c3',
            'e9f47982-3a43-4d16-817c-80f6b65e0566'
          ]
        }
      },
      {
        path: 'bridge',
        name: 'bridge',
        component: BridgeModule,
        meta: {
          requiresAuth: true,
          desc: '桥梁专项',
          defaultLayerIds: [
            '06ad0be1-f8fd-44fb-92ec-be82de6f8f38',
            '919829ed-9c4d-43ae-9a94-1ff0cef22a3f',
            'ecb4e7b6-6a2e-4948-85b0-0c5975816e07',
            'aa50cee7-c4f6-4315-bcb1-f89aea7c00c0'
          ]
        }
      },
      {
        path: 'drainage',
        name: 'drainage',
        component: DrainageModule,
        meta: {
          requiresAuth: true,
          desc: '排水专项',
          defaultLayerIds: [
            '5b42b88c-8fec-46b0-a9b5-3f35c8eb2067',
            'c665ebf0-7327-473a-9743-42fc5ea2d111'
          ]
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

    // 页面刷新时提前加载图层树数据
    const mapStore = useMapStore()
    if (!mapStore.layerTreeLoaded) {
      await mapStore.fetchLayerTree()
    }
  } else {
    // 已登录用户访问登录页，跳转到首页
    if (to.name === 'Login' && authStore.isLoggedIn) {
      const isValidToken = await authStore.validateToken()
      if (isValidToken) {
        // ✅ 修复：跳转到存在的路由（使用name: 'home'而不是'/'）
        next({ name: 'home' })
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