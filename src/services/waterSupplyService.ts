/**
 * 供水模块服务层
 * 基于 waterSupplyAndDrainage.ts 生成的 API 客户端，提供函数化调用方式
 */

import { createWaterSupplyApi } from "@/api/apiFactory";

const waterApi = createWaterSupplyApi();

/**
 * 获取基础设施总览统计
 * @param params 查询参数
 * @returns 基础设施统计数据
 */
export async function getWaterOverview(params?: {
  Sszx: string;
  Jcsslx?: string;
  Sjly?: string;
}) {
  const res = await waterApi.overviewData.List(params);
  return res.data || [];
}

/**
 * 获取设备运行状态比例
 * @returns 设备状态比例数据
 */
export async function getDeviceStatusRate(param: {
  Sszx: string;
  Sjly?: string;
}) {
  const res = await waterApi.gspspDtransPubmnteqpinfo.rateListList(param);
  return res.data || [];
}

/**
 * 获取设备类型状态统计
 * @returns 设备类型统计数据
 */
export async function getDeviceTypeStatusCount(param: {
  Sszx: string;
  Sjly?: string;
}) {
  const res =
    await waterApi.gspspDtransPubmnteqpinfo.deviceTypeStatusCountList(param);
  return res?.data || [];
}

/**
 * 获取最新水质监测数据
 * @returns 水质监测数据
 */
export async function getLatestWaterQuality(param:{Sszx:string}) {
  const res =
    await waterApi.gspspDtransPubmnteqpinfo.latestWaterQualityDataList(param);
  return res.data || [];
}

/**
 * 获取隐患类型统计
 * @returns 隐患类型统计数据
 */
export async function getRiskTypeCount(param:{
  Glmblx: string;
}) {
  const queryParam = {
    Dsbm: "420200",
    Qhbm: "420222",
    ...param
  }
  const res = await waterApi.gspspDtransPubrisks.riskTypeCountList(queryParam);
  return res.data || [];
}

/**
 * 获取隐患整改状态统计
 * @param param 查询参数
 * @param Glmblx 关联目标类型，逗号分割
 * @returns 隐患整改状态数据
 */
export async function getRiskStatusCount(param: {
  Glmblx: string;
}) {
  const queryParam = {
    Dsbm: "420200",
    Qhbm: "420222",
    ...param
  }
  const res = await waterApi.gspspDtransPubrisks.riskStatusCountList(queryParam);
  return res.data || [];
}

/**
 * 获取供水管网隐患统计
 * @returns 供水管网隐患数据
 */
export async function getWaterSupplyRiskCount() {
  const res = await waterApi.gspspDtransPubrisks.waterSupplyRiskCountList();
  return res.data || [];
}

/**
 * 获取预警统计信息
 * @param year 年份（可选）
 * @returns 预警统计数据
 */
export async function getWarnStatistics(Sszx:string) {
  const res = await waterApi.gspspDtransPubmnteawarn.warnStatisticsList({
    Year: '2025',
    Sszx
  });
  return res?.data || {};
}

/**
 * 获取月度预警统计
 * @param params 查询参数
 * @returns 月度预警统计数据
 */
export async function getMonthlyWarnStatistics(params?: {
  Sszx: string;
  Year?: string;
}) {
  const currentYear = params?.Year || new Date().getFullYear().toString();
  const res = await waterApi.gspspDtransPubmnteawarn.monthlyWarnStatisticsList({
    Year: currentYear,
    Sszx: params?.Sszx
  });
  return res.data || [];
}

/**
 * 获取排查结果统计
 * @param params 查询参数
 * @returns 排查结果统计数据
 */
export async function getCheckResultStatistics(params?: {
  Sszx: string;
  Year?: string;
}) {
  const currentYear = params?.Year || new Date().getFullYear().toString();
  const res = await waterApi.gspspDtransPubmnteawarn.checkResultStatisticsList({
    Year: currentYear,
    Sszx: params?.Sszx
  });
  return res?.data || [];
}

/**
 * 获取供水管线材质占比
 * @param params 查询参数
 * @returns 管线材质占比数据
 */
export async function getWaterSupplyMaterialRatio(params?: {
  Sszx: string;
}) {
  const res =
    await waterApi.gspspDtransPubunderpipeline.waterSupplyMaterialRatioList(params);
  return res?.data || [];
}
/**
 * 获取風险等级数量
 * @param param 查询參数
 */
export async function getRiskLevelCount(param: {
  Glmblx: string;
}) {
  const queryParam = {
    Dsbm: "420200",
    Qhbm: "420222",
    ...param
  }
  const res = await waterApi.gspspDtransPubrisks.inventoryRiskStatusCountList(queryParam);
  return res?.data || [];
}
/**
 * 获取隐患等级数量
 * @param param 查询参数
 */
export async function getHazardLevelCountList(param: {
  Sszx: string;
  Sjly?: string;
}) {
  const queryParam = {
    Dsbm: "420200",
    Qhbm: "420222",
    ...param
  }
  const res = await waterApi.gspspDtransPubrisks.riskLevelList(queryParam);
  return res?.data || [];
}
