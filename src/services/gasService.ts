/*
 * @Author: Do not edit
 * @Date: 2025-11-22 12:20:48
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-23 23:43:52
 * @Description: 
 */
/**
 * 燃气模块服务层
 * 基于 gas.ts 生成的 API 客户端，提供函数化调用方式
 */

import { createGasApi } from "@/api/apiFactory";

const gasApi = createGasApi();

/**
 * 获取燃气管网按长度占比统计
 * @returns 燃气管网长度占比数据
 */
export async function getGasCdRatio() {
  const res = await gasApi.gspspDtransPubunderpipeline.gasCdRatioList();
  return res.data || [];
}

/**
 * 获取燃气管网按材质占比统计
 * @returns 燃气管网材质占比数据
 */
export async function getGasMaterialRatio() {
  const res = await gasApi.gspspDtransPubunderpipeline.gasMaterialRatioList();
  return res.data || [];
}

/**
 * 获取燃气管网管点数量占比统计
 * @returns 燃气管网管点数量占比数据
 */
export async function getGasPubunderpointRatio() {
  const res = await gasApi.gspspDtransPubunderpipeline.gasPubunderpointRatioList();
  return res.data || [];
}

/**
 * 获取应急能力数量统计
 * @returns 应急能力数量统计数据
 */
export async function getEmergencyCapacityList() {
  const res = await gasApi.yjnl.listList();
  return res.data || [];
}

/**
 * 获取天然气基础设施数量统计
 * @returns 天然气基础设施数量统计数据
 */
export async function getNaturalGasCountList() {
  const res = await gasApi.jcss.trqCountListList();
  return res.data || [];
}

/**
 * 获取液化气基础设施数量统计
 * @returns 液化气基础设施数量统计数据
 */
export async function getLiquefiedGasCountList() {
  const res = await gasApi.jcss.yhqCountListList();
  return res.data || [];
}

/**
 * 获取燃气企业视图分页列表
 * @param params 查询参数
 * @returns 燃气企业分页列表数据
 */
export async function getGasEnterprisePageList(params?: {
  page?: string;
  rows?: string;
  rqlx?: string;
  qymc?: string;
}) {
  const res = await gasApi.gspspDtransGas.pageList(params);
  return res.data || [];
}

/**
 * 获取燃气企业台账详情信息
 * @param lsh 流水号
 * @returns 燃气企业台账详情数据
 */
export async function getGasEnterpriseLedgerDetail(lsh: string) {
  const res = await gasApi.gspspDtransGas.gasenterpriseledgerDetail(lsh);
  return res.data || {};
}

/**
 * 获取瓶装气企业台账详情信息
 * @param lsh 流水号
 * @returns 瓶装气企业台账详情数据
 */
export async function getBottleGasEnterpriseLedgerDetail(lsh: string) {
  const res = await gasApi.gspspDtransGas.bottlegasenterpriseledgerDetail(lsh);
  return res.data || {};
}

/**
 * 获取燃气场站分页列表
 * @param params 查询参数
 * @returns 燃气场站分页列表数据
 */
export async function getGasStationPageList(params?: {
  page?: string;
  rows?: string;
  ssqy?: string;
  czmc?: string;
  Czlx?: string;
  Yysfzc?: string;
}) {
  const filteredParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  ) : undefined;
  const res = await gasApi.gspspDtransGas.gasfldstationPageList(filteredParams);
  return res.data || [];
}

/**
 * 获取用气用户分页列表
 * @param params 查询参数
 * @returns 用气用户分页列表数据
 */
export async function getGasUserPageList(params?: {
  page?: string;
  rows?: string;
  sqqybm?: string;
  Yhmc?: string;
  Yhlx?: string;
  Yysfzc?: number;
}) {
  const res = await gasApi.gspspDtransGas.bottlegasuserPageList(params);
  return res.data || [];
}

/**
 * 获取某目标编码下的监测设备列表
 * @param params 查询参数
 * @returns 监测设备分页列表数据
 */
export async function getTargetEquipmentPageList(params?: {
  page?: string;
  rows?: string;
  glmbbh?: string;
  sbmc?: string;
  sszx?: string;
  gdfs?: string;
}) {
  const res = await gasApi.gspspDtrans.glmbbhEqpPageList(params);
  return res.data || [];
}

/**
 * 获取监测设备列表分页
 * @param params 查询参数
 * @returns 监测设备分页列表数据
 */
export async function getEquipmentPageList(params?: {
  page?: string;
  rows?: string;
  sszx?: string;
  sbmc?: string;
  sblx?: string;
}) {
  const res = await gasApi.gspspDtrans.eqpPageList(params);
  return res.data || [];
}

/**
 * 获取瓶装气企业台账列表
 * @returns 瓶装气企业台账列表数据
 */
export async function getBottleGasEnterpriseLedgerList() {
  const res = await gasApi.gspspDtransGas.bottlegasenterpriseledgerListList();
  return res.data || [];
}

/**
 * 获取燃气企业台账列表
 * @returns 燃气企业台账列表数据
 */
export async function getGasEnterpriseLedgerList() {
  const res = await gasApi.gspspDtransGas.gasenterpriseledgerListList();
  return res.data || [];
}
/**
 * 获取燃气在线状态
 */
export async function getGasOnlineStatus() {
  const res = await gasApi.gspspDtransPubmnteqpinfo.gasRateListList();
  return res.data || [];
}

/**
 * 获取监测设备运行状态统计列表
 * @returns 监测设备运行状态统计数据
 */
export async function getEquipmentOperationStatusList() {
  const res = await gasApi.gspspDtransGas.jcsbYxztSjtjListList();
  return res.data || [];
}

/**
 * 获取燃气预警类型统计列表
 * @returns 燃气预警类型统计数据
 */
export async function getGasWarningTypeList() {
  const res = await gasApi.gspspDtransGas.gasYjListListList();
  return res.data || [];
}
