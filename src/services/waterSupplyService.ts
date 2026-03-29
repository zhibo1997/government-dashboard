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
