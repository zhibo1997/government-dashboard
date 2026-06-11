/**
 * 监控视频服务层
 * 对接 gspspDtransSurveillanceVideo 接口
 */

import { get } from './httpClient'

// ========== 类型定义 ==========

/** 监控视频分页请求参数 */
export interface SurveillanceVideoPageParams {
  page: string       // 页码
  rows: string       // 每页条数
  spmc?: string      // 视频名称（模糊搜索）
  spszwz?: string    // 所在位置（桥梁名称筛选）
  sszx: string       // 所属专项
}

/** 监控视频项 */
export interface SurveillanceVideoItem {
  lsh: string        // 流水号
  spmc: string       // 视频名称
  sszx: string       // 所属专项
  [key: string]: any
}

/** 分页响应 */
export interface SurveillanceVideoPageResult {
  rows: SurveillanceVideoItem[]
  total: number
}

// ========== 接口方法 ==========

/**
 * 获取监控视频分页列表
 */
export async function getSurveillanceVideoPage(params: SurveillanceVideoPageParams): Promise<SurveillanceVideoPageResult> {
  const res = await get<any>('/gspspDtransSurveillanceVideo/page', params)
  return res.data
}

/**
 * 获取监控视频详情
 * @param lsh 视频流水号
 */
export async function getSurveillanceVideoDetail(lsh: string): Promise<SurveillanceVideoItem> {
  const res = await get<any>(`/gspspDtransSurveillanceVideo/${lsh}`)
  return res.data
}
