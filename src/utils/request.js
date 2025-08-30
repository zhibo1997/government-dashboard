import axios from 'axios'
import { message } from 'ant-design-vue'
import { useAuthStore } from '../stores/auth'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/clapi',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const authStore = useAuthStore()
    if (authStore.token) {
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
  (error) => {
    console.error('❌ Request Error:', error)
    message.error('请求配置错误')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
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
  (error) => {
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
export const get = (url, params = {}) => {
  return request({
    method: 'get',
    url,
    params
  })
}

export const post = (url, data = {}) => {
  return request({
    method: 'post',
    url,
    data
  })
}

export const put = (url, data = {}) => {
  return request({
    method: 'put',
    url,
    data
  })
}

export const del = (url, params = {}) => {
  return request({
    method: 'delete',
    url,
    params
  })
}

// 文件上传
export const upload = (url, formData) => {
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
export const download = (url, params = {}) => {
  return request({
    method: 'get',
    url,
    params,
    responseType: 'blob'
  })
}