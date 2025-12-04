/**
 * 桥梁模块服务层
 * 基于 bridge.ts 生成的 API 客户端，提供函数化调用方式
 */

import { createBridgeApi } from "@/api/apiFactory";

const bridgeApi = createBridgeApi();

/**
 * 获取总览桥梁分类统计列表
 * @returns 桥梁分类统计数据
 */
export async function getBridgeCategoryStats() {
  const res = await bridgeApi.gspspDtransBridge.zsBridgeLxtjListList();
  return res.data || [];
}

/**
 * 获取桥梁分页列表
 * @param params 查询参数
 * @returns 桥梁分页列表数据
 */
export async function getBridgePageList(params?: {
  page?: string;
  rows?: string;
}) {
  const res = await bridgeApi.gspspDtransBridge.pageList(params);
  return res.data || [];
}

/**
 * 获取桥梁专项-监测设备在线数量
 * @returns 监测设备在线数量数据
 */
export async function getBridgeEquipmentOnlineCount() {
  const res = await bridgeApi.gspspDtransPubmnteqpinfo.bridgeRateListList();
  return res.data || [];
}

/**
 * 获取桥梁预警类型统计列表
 * @returns 桥梁预警类型统计数据
 */
export async function getBridgeWarningTypeList() {
  const res = await bridgeApi.gspspDtransGas.bridgeYjListListList();
  return res.data || [];
}