/**
 * 燃气模块服务层
 * 直接调用后端接口
 */

import { get } from './httpClient'
import { BusinessModule, getModuleParams } from './config'

// 默认参数
const defaultParams = getModuleParams(BusinessModule.GAS)

/**
 * 获取燃气管网按长度占比统计
 */
export async function getGasCdRatio() {
  const res = await get<any>('/gspspDtransPubunderpipeline/gasCdRatio', defaultParams)
  return res.data || []
}

/**
 * 获取燃气管网按材质占比统计
 */
export async function getGasMaterialRatio() {
  const res = await get<any>('/gspspDtransPubunderpipeline/gasMaterialRatio', defaultParams)
  return res.data || []
}

/**
 * 获取燃气管网管点数量占比统计
 */
export async function getGasPubunderpointRatio() {
  const res = await get<any>('/gspspDtransPubunderpipeline/gasPubunderpointRatio', defaultParams)
  return res.data || []
}

/**
 * 获取应急能力数量统计
 */
export async function getEmergencyCapacityList() {
  const res = await get<any>('/yjnl/list', defaultParams)
  return res.data || []
}

/**
 * 获取天然气基础设施数量统计
 */
export async function getNaturalGasCountList() {
  const res = await get<any>('/jcss/trq/count/list', defaultParams)
  return res.data || []
}

/**
 * 获取液化气基础设施数量统计
 */
export async function getLiquefiedGasCountList() {
  const res = await get<any>('/jcss/yhq/count/list', defaultParams)
  return res.data || []
}

/**
 * 获取燃气企业视图分页列表
 */
export async function getGasEnterprisePageList(params?: {
  page?: string
  rows?: string
  rqlx?: string
  qymc?: string
}) {
  const res = await get<any>('/gspspDtransGas/page', { ...defaultParams, ...params })
  return res.data || {}
}

/**
 * 获取燃气企业台账详情信息
 */
export async function getGasEnterpriseLedgerDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransGas/gasenterpriseledger/${lsh}`, defaultParams)
  return res.data || {}
}

/**
 * 获取瓶装气企业台账详情信息
 */
export async function getBottleGasEnterpriseLedgerDetail(lsh: string) {
  const res = await get<any>(`/gspspDtransGas/bottlegasenterpriseledger/${lsh}`, defaultParams)
  return res.data || {}
}

/**
 * 获取燃气场站分页列表
 */
export async function getGasStationPageList(params?: {
  page?: string
  rows?: string
  Ssqybm?: string
  czmc?: string
  Czlx?: string
  Yysfzc?: string
}) {
  const filteredParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      )
    : undefined
  const res = await get<any>('/gspspDtransGas/gasfldstation/page', params)
  return res.data || []
}

/**
 * 获取用气用户分页列表
 */
export async function getGasUserPageList(params?: {
  page?: string
  rows?: string
  sqqybm?: string
  Yhmc?: string
  Yhlx?: string
  Yysfzc?: number
}) {
  const res = await get<any>('/gspspDtransGas/bottlegasuser/page', { ...defaultParams, ...params })
  return res.data || []
}

/**
 * 获取某目标编码下的监测设备列表
 */
export async function getTargetEquipmentPageList(params?: {
  page?: string
  rows?: string
  glmbbh?: string
  sbmc?: string
  sszx?: string
  gdfs?: string
}) {
  const res = await get<any>('/gspspDtrans/glmbbh/eqp/page', { ...defaultParams, ...params })
  return res.data || []
}

/**
 * 获取监测设备列表分页
 */
export async function getEquipmentPageList(params?: {
  page?: string
  rows?: string
  sszx?: string
  sbmc?: string
  sblx?: string
}) {
  const res = await get<any>('/gspspDtrans/eqp/page', { ...defaultParams, ...params })
  return res.data || []
}

/**
 * 获取瓶装气企业台账列表
 */
export async function getBottleGasEnterpriseLedgerList() {
  const res = await get<any>('/gspspDtransGas/bottlegasenterpriseledger/list', defaultParams)
  return res.data || []
}

/**
 * 获取燃气企业台账列表
 */
export async function getGasEnterpriseLedgerList() {
  const res = await get<any>('/gspspDtransGas/gasenterpriseledger/list', defaultParams)
  return res.data || []
}

/**
 * 获取燃气在线状态
 */
export async function getGasOnlineStatus() {
  const res = await get<any>('/gspspDtransPubmnteqpinfo/gas/rateList', defaultParams)
  return res.data || []
}

/**
 * 获取监测设备运行状态统计列表
 */
export async function getEquipmentOperationStatusList() {
  const res = await get<any>('/gspspDtransGas/jcsbYxztSjtj/list', defaultParams)
  return res.data || []
}

/**
 * 获取燃气预警类型统计列表
 */
export async function getGasWarningTypeList() {
  const res = await get<any>('/gspspDtransGas/gasYjList/list', defaultParams)
  return res.data || []
}
