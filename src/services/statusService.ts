/**
 * 综合态势模块服务层
 * 直接调用后端接口
 */

import { get } from './httpClient'
import { DEFAULT_COMMON_PARAMS } from './config'

/**
 * 获取风险等级数量统计
 */
export async function getRiskLevelCountList() {
  const res = await get<any>('/zzts/fxdj/count')
  return res.data || {}
}

/**
 * 获取隐患等级数量统计
 */
export async function getHazardLevelCountList() {
  const res = await get<any>('/zzts/yhdj/count')
  return res.data || {}
}

/**
 * 获取监测报警数量统计
 */
export async function getMonitoringAlarmCountList() {
  const res = await get<any>('/zzts/jcbj/count')
  return res.data || []
}

/**
 * 获取预警处置数量统计
 */
export async function getEarlyWarningDisposalCountList() {
  const res = await get<any>('/zzts/yjcz/count')
  return res.data || []
}

/**
 * 获取基础设施总览统计
 */
export async function getBasicFacilitiesOverview(params?: {
  Dsbm?: string
  Qhbm?: string
}) {
  const queryParams = {
    ...DEFAULT_COMMON_PARAMS,
    ...params,
  }
  const res = await get<any>('/gspspDtransPubbasicfacilitiesinfo/list', queryParams)
  const data = res.data || []
  return Array.isArray(data) ? data : []
}
