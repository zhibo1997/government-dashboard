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
export async function getDeviceStatusRate() {
  const res = await waterApi.gspspDtransPubmnteqpinfo.rateListList();
  return res.data || [];
}

/**
 * 获取设备类型状态统计
 * @returns 设备类型统计数据
 */
export async function getDeviceTypeStatusCount() {
  const res =
    await waterApi.gspspDtransPubmnteqpinfo.deviceTypeStatusCountList();
  return res?.data || [];
}

/**
 * 获取最新水质监测数据
 * @returns 水质监测数据
 */
export async function getLatestWaterQuality() {
  const res =
    await waterApi.gspspDtransPubmnteqpinfo.latestWaterQualityDataList();
  return res.data||[];
}

/**
 * 获取隐患类型统计
 * @returns 隐患类型统计数据
 */
export async function getRiskTypeCount() {
  const res = await waterApi.gspspDtransPubrisks.riskTypeCountList();
  return res.data || [];
}

/**
 * 获取隐患整改状态统计
 * @returns 隐患整改状态数据
 */
export async function getRiskStatusCount() {
  const res = await waterApi.gspspDtransPubrisks.riskStatusCountList();
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
export async function getWarnStatistics(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  const res = await waterApi.gspspDtransPubmnteawarn.warnStatisticsList({
    Year: currentYear,
  });
  return res?.data||[];
}

/**
 * 获取月度预警统计
 * @param year 年份（可选）
 * @returns 月度预警统计数据
 */
export async function getMonthlyWarnStatistics(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  const res = await waterApi.gspspDtransPubmnteawarn.monthlyWarnStatisticsList({
    Year: currentYear,
  });
  return res.data||[];
}

/**
 * 获取排查结果统计
 * @param year 年份（可选）
 * @returns 排查结果统计数据
 */
export async function getCheckResultStatistics(year?: string) {
  const currentYear = year || new Date().getFullYear().toString();
  const res = await waterApi.gspspDtransPubmnteawarn.checkResultStatisticsList({
    Year: currentYear,
  });
  return res;
}

/**
 * 获取供水管线材质占比
 * @returns 管线材质占比数据
 */
export async function getWaterSupplyMaterialRatio() {
  const res =
    await waterApi.gspspDtransPubunderpipeline.waterSupplyMaterialRatioList();
  return res;
}
