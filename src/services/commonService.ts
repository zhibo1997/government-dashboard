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
export async function getSpecialRateList() {
  const res = await get<any>('/gspspDtransPubmnteqpinfo/specialRateList')
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

// ========== 综合态势接口 ==========

/**
 * 综合态势-专项风险等级数量统计
 */
export async function getRiskLevelCountBySszx(params?: { Sszx?: string }) {
  const res = await get<any>('/zzts/fxdj/count', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

/**
 * 综合态势-专项隐患等级数量统计
 */
export async function getHazardLevelCountBySszx(params?: { Sszx?: string }) {
  const res = await get<any>('/zzts/yhdj/count', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

/**
 * 综合态势-专项监测报警数量统计
 */
export async function getAlarmCountBySszx(params?: { Sszx?: string }) {
  const res = await get<any>('/zzts/jcbj/count', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

/**
 * 综合态势-专项预警处置数量统计
 */
export async function getWarningDisposalCountBySszx(params?: { Sszx?: string }) {
  const res = await get<any>('/zzts/yjcz/count', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

/**
 * 综合态势-专项预警处置-分页列表
 */
export async function getWarningDisposalPage(params?: {
  page?: string
  rows?: string
  Sszx?: string
}) {
  const res = await get<any>('/zzts/yjcz/operate/page', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || {}
}

// ========== 危房数据接口 ==========

/**
 * 获取危房统计信息
 */
export async function getDangerHouseStatistics() {
  const res = await get<any>('/gspspDtransDangerhousebscinfon/statistics', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 监测设备类别数量统计
 */
export async function getDangerHouseEquipmentCount() {
  const res = await get<any>('/gspspDtransDangerhousebscinfon/eqp/count', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 某类别监测设备运行状态统计
 */
export async function getDangerHouseEquipmentRunStatus(params: { Sblx: string }) {
  const res = await get<any>('/gspspDtransDangerhousebscinfon/eqp/run/status/count', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

/**
 * 获取监测对象列表
 */
export async function getDangerHouseList() {
  const res = await get<any>('/gspspDtransDangerhousebscinfon/list', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 监测对象设备类型聚合统计
 */
export async function getDangerHouseObjectEquipmentCount() {
  const res = await get<any>('/gspspDtransDangerhousebscinfon/object/eqp/count', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 监测对象某类监测设备运行状态
 */
export async function getDangerHouseObjectEquipmentRunStatusCount(params: { Sblx: string }) {
  const res = await get<any>('/gspspDtransDangerhousebscinfon/object/eqp/run/status/count', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

/**
 * 监测对象某类监测设备运行状态和设备列表
 */
export async function getDangerHouseObjectEquipmentRunStatus(params: { Sblx: string }) {
  const res = await get<any>('/gspspDtransDangerhousebscinfon/object/eqp/run/status', { ...DEFAULT_COMMON_PARAMS, ...params })
  return res.data || []
}

// ========== 应急资源接口 (20260621新增) ==========

/**
 * 获取救援仓库列表
 */
export async function getWarehouseCoordinateList() {
  const res = await get<any>('/gspspDtransWarehouse/coordinate/list', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 获取救援仓库详情
 */
export async function getWarehouseDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransWarehouse/${lsh}`)
  return res.data || {}
}

/**
 * 获取应急专家列表
 */
export async function getEmergencySpecialistList() {
  const res = await get<any>('/gspspDtransEmergencyspecialist/list', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 获取应急专家详情
 */
export async function getEmergencySpecialistDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransEmergencyspecialist/${lsh}`)
  return res.data || {}
}

/**
 * 获取救援车辆列表
 */
export async function getEmergencyVehiclesList() {
  const res = await get<any>('/gspspDtransEmergencyvehicles/list', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 获取救援队伍列表
 */
export async function getTeamInformationList() {
  const res = await get<any>('/gspspDtransTeaminformation/list', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 获取救援人员列表
 */
export async function getTeamPersonList() {
  const res = await get<any>('/gspspDtransTeamperson/list', DEFAULT_COMMON_PARAMS)
  return res.data || []
}

/**
 * 救援车辆详情
 */
export async function getEmergencyVehicleDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransEmergencyvehicles/${lsh}`)
  return res.data || {}
}

/**
 * 救援队伍详情
 */
export async function getTeamInformationDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransTeaminformation/${lsh}`)
  return res.data || {}
}

/**
 * 救援人员详情
 */
export async function getTeamPersonDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransTeamperson/${lsh}`)
  return res.data || {}
}
