/**
 * 海康威视监控服务
 * 提供摄像头列表和视频流获取
 */

import { post } from './httpClient'

// ========== 类型定义 ==========

/** 摄像头信息 */
export interface CameraItem {
  cameraIndexCode: string  // 摄像头唯一编码
  cameraName: string       // 摄像头名称
  cameraTypeName?: string  // 摄像头类型
  channelName?: string     // 通道名称
  channelType?: number     // 通道类型
  capabilitySetName?: string
  cameraType?: number
  status?: number          // 状态：0-离线，1-在线
  [key: string]: any
}

/** 摄像头列表请求参数 */
export interface CameraListParams {
  pageNo: number
  pageSize: number
}

/** 摄像头列表响应 */
export interface CameraListResult {
  list: CameraItem[]
  total: number
  pageNo: number
  pageSize: number
}

/** 视频流请求参数 */
export interface CameraPreviewParams {
  cameraIndexCode: string  // 摄像头唯一编码
  streamType: number       // 流类型：0-主码流，1-子码流
  protocol: string         // 协议：hls / rtsp / rtmp 等
  transmode?: number       // 传输模式：0-UDP，1-TCP
}

/** 视频流响应 */
export interface CameraPreviewResult {
  url: string  // 视频流地址
}

// ========== 接口方法 ==========

/**
 * 获取监控设备列表
 */
export async function getCameraList(params: CameraListParams): Promise<CameraListResult> {
  const res = await post<any>('/hikvision/cameras', params)
  return res.data
}

/**
 * 获取指定监控设备视频流地址
 */
export async function getCameraPreviewUrl(params: CameraPreviewParams): Promise<CameraPreviewResult> {
  const res = await post<any>('/hikvision/cameras/preview-url', params)
  return res.data
}
