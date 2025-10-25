/**
 * API 统一导出入口
 * 
 * 使用说明：
 * 1. 业务模块 API：使用工厂函数创建
 *    import { createWaterSupplyApi } from '@/api'
 *    const api = createWaterSupplyApi()
 * 
 * 2. 服务层函数：直接调用（推荐）
 *    import { login, getWaterOverview } from '@/services/commonService'
 *    const data = await login('username', 'password')
 * 
 * 3. 通用接口（向后兼容）
 *    import { getPublicKey, login } from '@/api'
 */

// ========== API 工厂函数 ==========
export {
  createApiClient, // 泛型工厂函数
  createWaterSupplyApi,
  createDrainageApi,
  createGasApi,
  createBridgeApi,
  createCommonApi,
} from './apiFactory'

// ========== 配置相关 ==========
export { BusinessModule, getModuleParams, mergeParams } from './apiConfig'
export type { CommonParams } from './apiConfig'

// ========== 类型导出 ==========
export type { Api as WaterSupplyApi } from './waterSupplyAndDrainage'
export type { Api as CommonApi } from './common'

// ========== 向后兼容：通用接口（已被 commonService 取代） ==========
import { get, post } from '@/utils/request'
import type { ApiResponse, PublicKeyResponse, LoginResponse, LoginParams } from '@/types'

/**
 * @deprecated 请使用 commonService.getPublicKey()
 */
export function getPublicKey(): Promise<ApiResponse<string>> {
  return get<string>('/login/publickey')
}

/**
 * @deprecated 请使用 commonService.login(username, password)
 */
export function login(
  username: string,
  password: string,
  code?: string,
  uuid?: string
): Promise<ApiResponse<LoginResponse>> {
  const data: LoginParams = { account: username, password, code, uuid }
  return post<LoginResponse>('/login', data)
}

/**
 * @deprecated 请使用 commonService.login(params.account, params.password)
 */
export function loginWithParams(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
  return post<LoginResponse>('/login', params)
}

/**
 * @deprecated 请使用 commonService.getModuleTree() 或自己封装
 */
export function getLayerTree(): Promise<ApiResponse<any>> {
  return get<any>('/layer/tree')
}
