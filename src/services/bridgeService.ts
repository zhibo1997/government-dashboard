/**
 * 桥梁模块服务层
 * 直接调用后端接口
 */

import { get } from './httpClient'
import { BusinessModule, getModuleParams } from './config'

// 默认参数
const defaultParams = getModuleParams(BusinessModule.BRIDGE)

/**
 * 获取总览桥梁分类统计列表
 */
export async function getBridgeCategoryStats() {
  const res = await get<any>('/gspspDtransBridge/zsBridgeLxtj/list', defaultParams)
  return res.data || []
}

/**
 * 获取桥梁分页列表
 */
export async function getBridgePageList(params?: {
  page?: string
  rows?: string
  Llmc?: string
  Qljg?: string
  Qllx?: string
}) {
  const res = await get<any>('/gspspDtransBridge/page', { ...defaultParams, ...params })
  return res.data || []
}

/**
 * 获取桥梁专项-监测设备在线数量
 */
export async function getBridgeEquipmentOnlineCount() {
  const res = await get<any>('/gspspDtransPubmnteqpinfo/bridge/rateList', defaultParams)
  return res.data || []
}

/**
 * 获取桥梁预警类型统计列表
 */
export async function getBridgeWarningTypeList() {
  const res = await get<any>('/gspspDtransBridge/yjlxSstj/list', defaultParams)
  return res.data || []
}

/**
 * 获取桥梁监测设备运行状态统计列表
 */
export async function getBridgeEquipmentRunStatusList() {
  const res = await get<any>('/gspspDtransBridge/jscbYxztSstj/list', defaultParams)
  return res.data || []
}
