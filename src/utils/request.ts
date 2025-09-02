import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { createDiscreteApi } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import router from '../router'
import type { ApiResponse } from '@/types'

const { message } = createDiscreteApi(['message'])

// 请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean
}

// 响应数据接口
interface ResponseData<T = any> {
  code: number
  message?: string
  msg?: string
  data?: T
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/clapi',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加token到请求头
    const authStore = useAuthStore()
    if (authStore.token && config.headers) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    // 开发环境打印请求信息
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data
      })
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    message.error('请求配置错误')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const { data } = response
    
    // 开发环境打印响应信息
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: data
      })
    }
    
    // 统一处理业务状态码
    if (data.code !== undefined) {
      // 成功状态码
      if (data.code === 200 || data.code === 0) {
        return data
      }
      
      // 未授权，清除登录状态并跳转到登录页
      if (data.code === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
        message.error('登录已过期，请重新登录')
        return Promise.reject(new Error('未授权'))
      }
      
      // 其他业务错误
      const errorMessage = data.message || data.msg || '请求失败'
      message.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    
    // 直接返回数据
    return data
  },
  (error: AxiosError<ResponseData>) => {
    console.error('❌ Response Error:', error)
    
    // 网络错误
    if (!error.response) {
      message.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }
    
    const { status, data } = error.response
    
    // 根据HTTP状态码处理错误
    switch (status) {
      case 400:
        message.error(data?.message || '请求参数错误')
        break
      case 401:
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
        message.error('登录已过期，请重新登录')
        break
      case 403:
        message.error('没有权限访问该资源')
        break
      case 404:
        message.error('请求的资源不存在')
        break
      case 500:
        message.error('服务器内部错误')
        break
      case 502:
        message.error('网关错误')
        break
      case 503:
        message.error('服务暂时不可用')
        break
      default:
        message.error(data?.message || `请求失败 (${status})`)
    }
    
    return Promise.reject(error)
  }
)

// 导出请求实例
export default request

// 导出常用请求方法
export const get = <T = any>(url: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> => {
  return request({
    method: 'get',
    url,
    params
  })
}

export const post = <T = any>(url: string, data: Record<string, any> = {}): Promise<ApiResponse<T>> => {
  return request({
    method: 'post',
    url,
    data
  })
}

export const put = <T = any>(url: string, data: Record<string, any> = {}): Promise<ApiResponse<T>> => {
  return request({
    method: 'put',
    url,
    data
  })
}

export const del = <T = any>(url: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> => {
  return request({
    method: 'delete',
    url,
    params
  })
}

// 文件上传
export const upload = <T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
  return request({
    method: 'post',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 文件下载
export const download = (url: string, params: Record<string, any> = {}): Promise<Blob> => {
  return request({
    method: 'get',
    url,
    params,
    responseType: 'blob'
  })
}

// 带有自定义配置的请求方法
export const requestWithConfig = <T = any>(config: RequestConfig): Promise<ApiResponse<T>> => {
  return request(config)
}

// 批量请求
export const batchRequest = async <T = any>(requests: Array<() => Promise<T>>): Promise<T[]> => {
  try {
    const results = await Promise.allSettled(requests.map(req => req()))
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error('Batch request failed:', result.reason)
        throw result.reason
      }
    })
  } catch (error) {
    console.error('Batch request error:', error)
    throw error
  }
}

// 取消请求的工具函数
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// 检查是否为取消请求的错误
export const isCancel = (error: any): boolean => {
  return axios.isCancel(error)
}