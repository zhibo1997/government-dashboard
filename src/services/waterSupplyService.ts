/**
 * 供水模块服务层
 * 直接调用后端接口
 */

import { get } from './httpClient'
import { BusinessModule, getModuleParams, DEFAULT_COMMON_PARAMS } from './config'

// 默认参数
const defaultParams = getModuleParams(BusinessModule.WATER_SUPPLY)

// 年份参数（全局统一）
export const CURRENT_YEAR = '2025'

/**
 * 获取基础设施总览统计
 */
export async function getWaterOverview(params?: {
  Sszx: string
  Jcsslx?: string
  Sjly?: string
}) {
  const res = await get<any>('/gspspDtransPubbasicfacilitiesinfo/list', { ...defaultParams, ...params })
  return res.data || []
}

/**
 * 获取设备运行状态比例
 */
export async function getDeviceStatusRate(param: {
  Sszx: string
  Sjly?: string
}) {
  const res = await get<any>('/gspspDtransPubmnteqpinfo/rateList', { ...defaultParams, ...param })
  return res.data || []
}

/**
 * 获取设备类型状态统计
 */
export async function getDeviceTypeStatusCount(param: {
  Sszx: string
  Sjly?: string
}) {
  const res = await get<any>('/gspspDtransPubmnteqpinfo/deviceTypeStatusCount', { ...defaultParams, ...param })
  return res?.data || []
}

/**
 * 获取最新水质监测数据
 */
export async function getLatestWaterQuality(param: { Sszx: string }) {
  const res = await get<any>('/gspspDtransPubmnteqpinfo/latestWaterQualityData', { ...defaultParams, ...param })
  return res.data || []
}

/**
 * 获取隐患类型统计
 */
export async function getRiskTypeCount(param: { Glmblx: string }) {
  const queryParam = {
    ...DEFAULT_COMMON_PARAMS,
    ...param,
  }
  const res = await get<any>('/gspspDtransPubrisks/riskTypeCount', queryParam)
  return res.data || []
}

/**
 * 获取隐患整改状态统计
 */
export async function getRiskStatusCount(param: { Glmblx: string }) {
  const queryParam = {
    ...DEFAULT_COMMON_PARAMS,
    ...param,
  }
  const res = await get<any>('/gspspDtransPubrisks/riskStatusCount', queryParam)
  return res.data || []
}

/**
 * 获取供水管网隐患统计
 */
export async function getWaterSupplyRiskCount(param: { Sszx: string }) {
  const res = await get<any>('/gspspDtransPubrisks/waterSupplyRiskCount', { ...defaultParams, ...param })
  return res.data || []
}

/**
 * 获取排水管网隐患统计
 */
export async function getDrainageRiskCount(param: {
  Sszx: string
  Sjly?: string
}) {
  const res = await get<any>('/gspspDtransPubrisks/drainageRiskCount', { ...defaultParams, ...param })
  return res.data || []
}

/**
 * 获取预警统计信息
 */
export async function getWarnStatistics(Sszx: string) {
  const res = await get<any>('/gspspDtransPubmnteawarn/warnStatistics', {
    ...defaultParams,
    Sszx,
  })
  return res?.data || {}
}

/**
 * 获取月度预警统计
 */
export async function getMonthlyWarnStatistics(params?: {
  Sszx: string
  Year?: string
}) {
  const currentYear = params?.Year || CURRENT_YEAR
  const res = await get<any>('/gspspDtransPubmnteawarn/monthlyWarnStatistics', {
    ...defaultParams,
    Year: currentYear,
    Sszx: params?.Sszx,
  })
  return res.data || []
}

/**
 * 获取排查结果统计
 */
export async function getCheckResultStatistics(params?: {
  Sszx: string
  Year?: string
}) {
  const currentYear = params?.Year || CURRENT_YEAR
  const res = await get<any>('/gspspDtransPubmnteawarn/checkResultStatistics', {
    ...defaultParams,
    Year: currentYear,
    Sszx: params?.Sszx,
  })
  return res?.data || []
}

/**
 * 获取供水管线材质占比
 */
export async function getWaterSupplyMaterialRatio(params?: { Sszx: string }) {
  const res = await get<any>('/gspspDtransPubunderpipeline/waterSupplyMaterialRatio', { ...defaultParams, ...params })
  return res?.data || []
}

/**
 * 获取排水管线材质占比
 */
export async function getDrainageMaterialRatio(params?: { Sszx: string }) {
  const res = await get<any>('/gspspDtransPubunderpipeline/drainageMaterialRatio', { ...defaultParams, ...params })
  return res?.data || []
}

/**
 * 获取风险等级数量
 */
export async function getRiskLevelCount(param: {
  Glmblx?: string
  Sszx?: string
}) {
  const queryParam = {
    ...DEFAULT_COMMON_PARAMS,
    ...param,
  }
  const res = await get<any>('/gspspDtransPubrisks/inventory/riskStatusCount', queryParam)
  return res?.data || []
}

/**
 * 获取隐患等级数量
 */
export async function getHazardLevelCountList(param: {
  Sszx: string
  Sjly?: string
}) {
  const queryParam = {
    ...DEFAULT_COMMON_PARAMS,
    ...param,
  }
  const res = await get<any>('/gspspDtransPubrisks/yhdj/riskTypeCount', queryParam)
  return res?.data || []
}

// ========== 积水易涝点位接口 ==========

/** 积水易涝点位分页请求参数 */
export interface DrainFloodPageParams {
  page: string
  rows: string
  jsdmc?: string     // 积水点名称（模糊搜索）
  dsbm?: string      // 市州编码
  qhbm?: string      // 区划编码
  zgzt?: string       // 整改状态
}

/** 积水易涝点位分页结果 */
export interface DrainFloodPageResult {
  rows: any[]
  total: number
  records: number
}

/**
 * 获取积水易涝点位分页
 */
export async function getDrainFloodPage(params: DrainFloodPageParams): Promise<DrainFloodPageResult> {
  const res = await get<any>('/gspspDtransDrainfloodpropots/page', { ...defaultParams, ...params })
  return res.data || { rows: [], total: 0, records: 0 }
}

/**
 * 获取积水易涝点位详情
 * @param lsh 流水号
 */
export async function getDrainFloodDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransDrainfloodpropots/${lsh}`)
  return res.data
}

// ========== 供水专项接口 (20260621新增) ==========

/**
 * 获取供水专项统计指标
 */
export async function getWaterSupplyStats(params?: { Sszx?: string }) {
  const res = await get<any>('/gspspDtransWaterSupply/gsZxtjzb/list', { ...defaultParams, ...params })
  return res.data || []
}

/**
 * 获取水源地点位信息
 */
export async function getWaterSourceCoordinateList() {
  const res = await get<any>('/gspspDtransWaterSupply/watersrcinfo/coordinate/list', defaultParams)
  return res.data || []
}

/**
 * 获取水厂点位信息
 */
export async function getWaterPlantCoordinateList() {
  const res = await get<any>('/gspspDtransWaterSupply/waterplantinfo/coordinate/list', defaultParams)
  return res.data || []
}

/**
 * 获取供水泵站点位信息
 */
export async function getWaterPumpStationCoordinateList() {
  const res = await get<any>('/gspspDtransWaterSupply/watersupplypumpingstation/coordinate/list', defaultParams)
  return res.data || []
}

/**
 * 获取水源地详情
 */
export async function getWaterSourceDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransWaterSupply/watersrcinfo/${lsh}`)
  return res.data || {}
}

/**
 * 获取水厂详情
 */
export async function getWaterPlantDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransWaterSupply/waterplantinfo/${lsh}`)
  return res.data || {}
}

/**
 * 获取供水泵站详情
 */
export async function getWaterPumpStationDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransWaterSupply/watersupplypumpingstation/${lsh}`)
  return res.data || {}
}

// ========== 排水专项接口 (20260621新增) ==========

/**
 * 获取排水专项统计指标
 */
export async function getDrainageStats(params?: { Sszx?: string }) {
  const res = await get<any>('/gspspDtransDrainage/psZxtjzb/list', { ...defaultParams, ...params })
  return res.data || []
}

/**
 * 获取易积水点点位
 */
export async function getDrainFloodCoordinateList() {
  const res = await get<any>('/gspspDtransDrainage/drainfloodpropots/coordinate/list', defaultParams)
  return res.data || []
}

/**
 * 获取河道点位
 */
export async function getDrainRiverCoordinateList() {
  const res = await get<any>('/gspspDtransDrainage/drainriver/coordinate/list', defaultParams)
  return res.data || []
}

/**
 * 获取污水处理厂点位信息
 */
export async function getSewageTreatmentPlantCoordinateList() {
  const res = await get<any>('/gspspDtransDrainage/sewagetreatmentplant/coordinate/list', defaultParams)
  return res.data || []
}

/**
 * 获取易积水点详情
 */
export async function getDrainFloodDetailByLsh(lsh: string) {
  const res = await get<any>(`/gspspDtransDrainage/drainfloodpropots/${lsh}`)
  return res.data || {}
}

/**
 * 获取河道详情
 */
export async function getDrainRiverDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransDrainage/drainriver/${lsh}`)
  return res.data || {}
}

/**
 * 获取污水处理厂详情
 */
export async function getSewageTreatmentPlantDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransDrainage/sewagetreatmentplant/${lsh}`)
  return res.data || {}
}
