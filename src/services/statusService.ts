/**
 * 综合态势模块服务层
 * 基于 comprehensiveStatus.ts 生成的 API 客户端，提供函数化调用方式
 */

import { createComprehensiveStatusApi } from "@/api/apiFactory";

const comprehensiveStatusApi = createComprehensiveStatusApi();

/**
 * 获取风险等级数量统计
 * @returns 风险等级数量统计数据
 */
export async function getRiskLevelCountList() {
  const res = await comprehensiveStatusApi.zzts.fxdjCountList();
  return res.data || {};
}

/**
 * 获取隐患等级数量统计
 * @returns 隐患等级数量统计数据
 */
export async function getHazardLevelCountList() {
  const res = await comprehensiveStatusApi.zzts.yhdjCountList();
  return res.data || {};
}

/**
 * 获取监测报警数量统计
 * @returns 监测报警数量统计数据
 */
export async function getMonitoringAlarmCountList() {
  const res = await comprehensiveStatusApi.zzts.jcbjCountList();
  return res.data || {};
}

/**
 * 获取预警处置数量统计
 * @returns 预警处置数量统计数据
 */
export async function getEarlyWarningDisposalCountList() {
  const res = await comprehensiveStatusApi.zzts.yjczCountList();
  return res.data || {};
}

/**
 * 获取基础设施总览统计
 * @param params 查询参数 (市州编码、区划编码等)
 * @returns 基础设施统计数据
 */
export async function getBasicFacilitiesOverview(params?: {
  Dsbm?: string;
  Qhbm?: string;
}) {
  const res = await comprehensiveStatusApi.gspspDtransPubbasicfacilitiesinfo.listList(params);
  const data = res.data || [];
  return Array.isArray(data) ? data : [];
}
