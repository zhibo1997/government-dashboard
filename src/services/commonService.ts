/**
 * 通用服务层（登录、数据字典等）
 * 直接调用后端接口
 */

import { get, post } from './httpClient'
import { DEFAULT_COMMON_PARAMS } from './config'

// ========== 类型定义 ==========

/**
 * 监测数据项（jcz）结构
 */
export interface MonitoringDataItem {
  jcz: string | number // 监测值
  jcdw: string // 监测单位
}

/**
 * 监测点位最新监测数据
 */
export interface MonitoringPointData {
  jdxx: number // 经度
  wdxx: number // 纬度
  sbmc: string // 设备名称
  sszx: string // 所属专项
  jcsj: number // 监测时间
  jcz: string // 监测值（JSON字符串，包含多个指标数据）
  sbbh: string // 设备编号
  sblx: string // 设备类型
}

// ========== 登录相关接口 ==========

export interface LoginInputDto {
  account: string
  password: string
}

/**
 * 获取 RSA 公钥
 */
export async function getPublicKey(): Promise<any> {
  const res = await get<any>('/login/publicKey', undefined, { skipAuth: true })
  return res
}

/**
 * 用户登录
 */
export async function login(account: string, password: string) {
  const loginData: LoginInputDto = { account, password }
  const res = await post<any>('/login', loginData, { skipAuth: true })
  return res
}

// ========== 数据字典接口 ==========

/**
 * 获取数据字典明细（根据分类编号）
 */
export async function getDataItemDetails(code: string) {
  const res = await get<any>(`/data/dataitem/details/${code}`)
  return res.data || []
}

/**
 * 获取多个数据字典明细根据分类编码逗号分隔
 */
export async function getDataItemDetailsByCodes(codes: string) {
  const res = await get<any>(`/data/dataitem/details/all/${codes}`)
  return res.data || []
}

/**
 * 优化的字典数据获取函数，带缓存功能
 */
export async function getDataItems(code: string): Promise<any[]> {
  const result = await getDataItemDetailsByCodes(code)

  if (Array.isArray(result) && result.length > 0) {
    const dict = result[0]

    if (dict.itemCode && Array.isArray(dict.itemDetailEntityList)) {
      const items = dict.itemDetailEntityList.map((item: any) => ({
        f_ItemValue: item.f_ItemValue,
        f_ItemName: item.f_ItemName,
        f_SimpleSpelling: item.f_SimpleSpelling,
      }))
      return items
    }
  }

  return []
}

// ========== 应急资源接口 ==========

/**
 * 获取应急能力数量统计（通用，按所属专项筛选）
 */
export async function getEmergencyCapacityList(params?: { Sszx?: string }) {
  const res = await get<any>('/yjnl/list', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

// ========== 综合态势接口 ==========

/**
 * 获取各专项设备在线离线数量和比例
 * @param sszx 所属专项代码
 */
export async function getSpecialRateList(sszx: string) {
  const res = await get<any>('/gspspDtransPubmnteqpinfo/specialRateList', { sszx })
  return res.data || []
}

// ========== 图层接口 ==========

/**
 * 获取图层树
 */
export async function getLayerTree({ SszxCode }: { SszxCode: string }) {
  const res = await get<any>('/layer/tree', { SszxCode })
  return res.data
}

// ========== 监测设备接口 ==========

/**
 * 地图-获取监测点位最新监测数据
 * @param sszx 所属专项（可选）
 * @param sblx 设备类型（可选）
 */
export async function getMonitoringPointLatestData(sszx?: string, sblx?: string): Promise<MonitoringPointData[]> {
  // 构建参数对象，过滤掉 undefined 值
  const params: Record<string, string> = {}
  if (sszx) params.sszx = sszx
  if (sblx) params.sblx = sblx
  
  const res = await get<any>('/gspspDtransPubmnteqpinfo/new/pubmntdata', params)
  return (res.data || []) as MonitoringPointData[]
}

// ========== 密码加密工具 ==========

/**
 * 使用 RSA 公钥加密密码
 */
export async function encryptPasswordWithPublicKey(
  password: string,
  publicKey: string
): Promise<string> {
  if (!publicKey) {
    console.warn('公钥为空，将使用原始密码')
    return password
  }

  try {
    let JSEncrypt
    if (typeof window !== 'undefined' && (window as any).JSEncrypt) {
      JSEncrypt = (window as any).JSEncrypt
    } else {
      const jsEncryptModule = await import('jsencrypt')
      JSEncrypt = jsEncryptModule.default
    }
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey)
    const encrypted = encrypt.encrypt(password)

    if (!encrypted) {
      console.error('密码加密失败')
      return password
    }

    return encrypted
  } catch (error) {
    console.error('密码加密异常:', error)
    return password
  }
}
