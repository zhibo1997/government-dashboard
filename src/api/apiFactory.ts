/**
 * API 工厂函数（泛型版本）
 * 用于创建任意 swagger-typescript-api 生成的 API 客户端实例
 * 支持统一的拦截器配置和业务模块参数注入
 */

import type { AxiosInstance, AxiosRequestConfig, ResponseType } from 'axios'
import { createDiscreteApi } from 'naive-ui'
import { BusinessModule, getModuleParams, mergeParams, type CommonParams } from './apiConfig'

const { message } = createDiscreteApi(['message'])

/**
 * 获取认证 Token
 */
const getAuthToken = (): string => {
  return localStorage.getItem('token') || ''
}

/**
 * API 配置接口（与 swagger 生成的保持一致）
 */
export interface ApiConfig<SecurityDataType = unknown> {
  baseURL?: string
  timeout?: number
  headers?: any
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void
  secure?: boolean
  format?: ResponseType
  [key: string]: any
}

/**
 * API 构造函数类型
 */
type ApiConstructor<TClient> = new (config: ApiConfig) => TClient

/**
 * API 客户端必须包含的接口
 */
interface ApiClientBase {
  instance: AxiosInstance
}

/**
 * API 实例配置选项
 */
interface ApiClientOptions {
  /** 业务模块（自动应用默认参数） */
  module?: BusinessModule
  /** 自定义默认参数（会覆盖模块默认参数） */
  defaultParams?: Partial<CommonParams>
  /** 是否自动添加公共参数（默认 true） */
  autoInjectParams?: boolean
  /** 自定义 axios 配置 */
  axiosConfig?: Partial<AxiosRequestConfig>
}

/**
 * 泛型 API 客户端工厂函数
 * @param ApiCtor swagger-typescript-api 生成的 Api 类构造函数
 * @param options 配置选项
 * @returns 配置好的 API 客户端实例
 */
export function createApiClient<TClient extends ApiClientBase>(
  ApiCtor: ApiConstructor<TClient>,
  options: ApiClientOptions = {}
): TClient {
  const {
    module,
    defaultParams = {},
    autoInjectParams = true,
    axiosConfig = {},
  } = options

  // 计算最终的默认参数
  let finalDefaultParams: Partial<CommonParams> = {}
  if (module) {
    finalDefaultParams = getModuleParams(module)
  }
  finalDefaultParams = mergeParams(finalDefaultParams, defaultParams)

  // 创建 API 配置
  const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || '/clapi'
  const apiConfig: ApiConfig = {
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...axiosConfig,
  }

  // 使用传入的构造函数创建 API 实例
  const api = new ApiCtor(apiConfig)

  // 配置请求拦截器
  api.instance.interceptors.request.use(
    (config) => {
      // 添加认证 Token
      const token = getAuthToken()
      if (token && config.headers) {
        config.headers['Authorization'] = token
      }

      // 自动注入公共参数
      if (autoInjectParams && Object.keys(finalDefaultParams).length > 0) {
        config.params = {
          ...finalDefaultParams,
          ...config.params, // 请求时传入的参数优先级更高
        }
      }

      // 开发环境日志
      if ((import.meta as any).env?.DEV) {
        console.log('[API Request]', {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
          data: config.data,
        })
      }

      return config
    },
    (error) => {
      console.error('[Request Error]', error)
      message.error('请求配置错误')
      return Promise.reject(error)
    }
  )

  // 配置响应拦截器
  api.instance.interceptors.response.use(
    (response) => {
      // 开发环境日志
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

        // 未授权
        if (response.data.code === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
          message.error('登录已过期，请重新登录')
          return Promise.reject(new Error('未授权'))
        }

        // 其他业务错误
        const errorMessage = response.data.info || response.data.message || '请求失败'
        message.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      }

      return response.data
    },
    (error) => {
      console.error('[Response Error]', error)

      // 网络错误
      if (!error.response) {
        message.error('网络连接失败，请检查网络设置')
        return Promise.reject(error)
      }

      const { status, data } = error.response

      // HTTP 状态码处理
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          window.location.href = '/login'
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

  return api
}

// ========== 便捷工厂函数（业务模块专用） ==========

import { Api as WaterSupplyApi } from './waterSupplyAndDrainage'
import { Api as CommonApi } from './common'

/**
 * 创建供水模块 API 实例
 */
export function createWaterSupplyApi(): WaterSupplyApi<unknown> {
  return createApiClient(WaterSupplyApi, { module: BusinessModule.WATER_SUPPLY })
}

/**
 * 创建排水模块 API 实例
 */
export function createDrainageApi(): WaterSupplyApi<unknown> {
  return createApiClient(WaterSupplyApi, { module: BusinessModule.DRAINAGE })
}

/**
 * 创建燃气模块 API 实例
 */
export function createGasApi(): WaterSupplyApi<unknown> {
  return createApiClient(WaterSupplyApi, { module: BusinessModule.GAS })
}

/**
 * 创建桥梁模块 API 实例
 */
export function createBridgeApi(): WaterSupplyApi<unknown> {
  return createApiClient(WaterSupplyApi, { module: BusinessModule.BRIDGE })
}

/**
 * 创建通用 API 实例（登录、数据字典等）
 * 不注入业务模块参数
 */
export function createCommonApi(): CommonApi<unknown> {
  return createApiClient(CommonApi, { autoInjectParams: false })
}
