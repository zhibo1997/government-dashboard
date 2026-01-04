/**
 * 统一 HTTP 客户端模块
 * 提供统一的请求配置、拦截器和错误处理
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { createDiscreteApi } from 'naive-ui'
import router from '@/router'

const { message } = createDiscreteApi(['message'])

// ========== Token 管理 ==========

/** Token 失效处理标志 */
let isHandlingTokenExpired = false

/** Token 是否已失效标志 */
let tokenInvalid = false

/** 获取认证 Token */
const getAuthToken = (): string => {
  return localStorage.getItem('token') || ''
}

/** 重置 token 失效处理标志 */
export function resetTokenExpiredFlag(): void {
  isHandlingTokenExpired = false
  tokenInvalid = false
}

// ========== 消息防重复 ==========

const messageDedupMap = new Map<string, number>()

function showMessageOnce(msg: string): void {
  const now = Date.now()
  const lastShownTime = messageDedupMap.get(msg)
  
  if (!lastShownTime || now - lastShownTime >= 1000) {
    message.error(msg)
    messageDedupMap.set(msg, now)
  }
  
  messageDedupMap.forEach((time, key) => {
    if (now - time >= 1000) {
      messageDedupMap.delete(key)
    }
  })
}

// ========== 请求队列 ==========

class RequestQueue {
  private queue: Array<{
    requestFn: () => Promise<any>
    resolve: (value: any) => void
    reject: (reason?: any) => void
  }> = []
  private running = 0
  private concurrency = 4

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject })
      this.process()
    })
  }

  cancel(): void {
    while (this.queue.length > 0) {
      const { reject } = this.queue.shift()!
      reject(new Error('Token 已失效，请重新登录'))
    }
  }

  private process() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { requestFn, resolve, reject } = this.queue.shift()!
      this.running++

      requestFn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--
          this.process()
        })
    }
  }
}

const requestQueue = new RequestQueue()

// ========== 创建 HTTP 实例 ==========

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || '/clapi'

const httpInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
httpInstance.interceptors.request.use(
  (config) => {
    const skipAuth = (config as any).skipAuth === true
    
    if (!skipAuth && tokenInvalid) {
      return Promise.reject(new Error('Token 已失效，请重新登录'))
    }

    if (!skipAuth) {
      const token = getAuthToken()
      if (token && config.headers) {
        config.headers['Authorization'] = token
      }
    }

    if ((import.meta as any).env?.DEV) {
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
        skipAuth,
      })
    }

    delete (config as any).skipAuth
    return config
  },
  (error) => {
    console.error('[Request Error]', error)
    showMessageOnce('请求配置错误')
    return Promise.reject(error)
  }
)

// 响应拦截器
httpInstance.interceptors.response.use(
  (response) => {
    const skipAuth = (response.config as any).skipAuth === true
    
    if ((import.meta as any).env?.DEV) {
      console.log('[API Response]', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      })
    }

    // 处理业务状态码
    if (response.data?.code !== undefined) {
      if (response.data.code === 200 || response.data.code === 0) {
        return response.data
      }

      if (response.data.code === 401) {
        if (!skipAuth) {
          tokenInvalid = true
          requestQueue.cancel()
          
          if (!isHandlingTokenExpired) {
            isHandlingTokenExpired = true
            localStorage.removeItem('token')
            showMessageOnce('登录已过期，请重新登录')
            router.push('/login')
          }
        }
        return Promise.reject(new Error('未授权'))
      }

      const errorMessage = response.data.info || response.data.message || '请求失败'
      showMessageOnce(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    return response.data
  },
  (error) => {
    console.error('[Response Error]', error)

    if (!error.response) {
      showMessageOnce('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }

    const { status, data, config } = error.response
    const skipAuth = (config as any)?.skipAuth === true

    switch (status) {
      case 401:
        if (!skipAuth) {
          tokenInvalid = true
          requestQueue.cancel()
          
          if (!isHandlingTokenExpired) {
            isHandlingTokenExpired = true
            localStorage.removeItem('token')
            showMessageOnce('登录已过期，请重新登录')
            router.push('/login')
          }
        }
        break
      case 500:
        localStorage.removeItem('token')
        router.push('/login')
        showMessageOnce('登录已过期，请重新登录')
        break
      case 403:
        showMessageOnce('没有权限访问该资源')
        break
      case 404:
        showMessageOnce('请求的资源不存在')
        break
      case 502:
        showMessageOnce('网关错误')
        break
      case 503:
        showMessageOnce('服务暂时不可用')
        break
      default:
        showMessageOnce(data?.message || `请求失败 (${status})`)
    }

    return Promise.reject(error)
  }
)

// ========== 请求方法封装 ==========

export interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  /** 跳过认证（不添加 token） */
  skipAuth?: boolean
}

/**
 * GET 请求
 */
export async function get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
  return requestQueue.add(() =>
    httpInstance.request<any, T>({
      url,
      method: 'GET',
      params,
      ...options,
    })
  )
}

/**
 * POST 请求
 */
export async function post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return requestQueue.add(() =>
    httpInstance.request<any, T>({
      url,
      method: 'POST',
      data,
      ...options,
    })
  )
}

/**
 * PUT 请求
 */
export async function put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
  return requestQueue.add(() =>
    httpInstance.request<any, T>({
      url,
      method: 'PUT',
      data,
      ...options,
    })
  )
}

/**
 * DELETE 请求
 */
export async function del<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
  return requestQueue.add(() =>
    httpInstance.request<any, T>({
      url,
      method: 'DELETE',
      params,
      ...options,
    })
  )
}

export default httpInstance
