/**
 * 监测设备图标映射配置
 * @description 根据设备类型(sblx)字段映射对应的图标文件
 */

/**
 * 设备类型到图标文件的映射表
 * key: 设备类型编码 (sblx字段值)
 * value: 图标文件名
 */
export const DEVICE_ICON_MAP: Record<string, string> = {
  // 燃气监测设备
  'jcsblx0101': '0101-可燃气体监测仪.svg',
  
  // 桥梁监测设备
  'jcsblx0501': '0501-温度传感器.svg',
  'jcsblx0502': '0502-应变传感器.svg',
  'jcsblx0503': '0503-加速度传感器.svg',
  'jcsblx0510': '0510-裂缝计.svg',
}

/**
 * 设备类型名称映射表
 * key: 设备类型编码
 * value: 设备类型中文名称
 */
export const DEVICE_TYPE_NAME_MAP: Record<string, string> = {
  'jcsblx0101': '可燃气体监测仪',
  'jcsblx0501': '温度传感器',
  'jcsblx0502': '应变传感器',
  'jcsblx0503': '加速度传感器',
  'jcsblx0510': '裂缝计',
}

/**
 * 所属专项名称映射
 */
export const SSZX_NAME_MAP: Record<string, string> = {
  'csaqzx_rq': '燃气监测',
  'csaqzx_gs': '供水监测',
  'csaqzx_ql': '桥梁监测',
  'csaqzx_ps': '排水监测',
  'csaqzx_rqzdyh': '燃气终端用户',
  'csaqzx_pzyhq': '瓶装液化气',
}

/**
 * 监测指标名称映射 (jcz JSON 中的 key)
 */
export const MONITORING_INDICATOR_MAP: Record<string, string> = {
  'jczb0101': '可燃气体浓度',
  'jczb0102': '温度',
  'jczb0103': '湿度',
  'jczb0104': '压力',
  'jczb0105': '流量',
  'jczb0122': '报警状态',
  // 桥梁监测指标
  'jczb0501': '应变值',
  'jczb0502': '挠度值',
  'jczb0503': '加速度值',
  'jczb0504': '裂缝宽度',
  'jczb0505': '位移值',
}

/**
 * 默认图标（当设备类型未匹配时使用）
 */
export const DEFAULT_ICON = '0101-可燃气体监测仪.svg'

/**
 * 图标大小配置
 */
export const ICON_SIZE = 32

/**
 * 根据设备类型获取图标URL
 * @param sblx 设备类型编码
 * @returns 图标URL
 */
export function getDeviceIconUrl(sblx: string): string {
  const iconFile = DEVICE_ICON_MAP[sblx] || DEFAULT_ICON
  return new URL(`../assets/img/icon/${iconFile}`, import.meta.url).href
}

/**
 * 根据设备类型获取设备名称
 * @param sblx 设备类型编码
 * @returns 设备类型名称
 */
export function getDeviceTypeName(sblx: string): string {
  return DEVICE_TYPE_NAME_MAP[sblx] || '未知设备'
}

/**
 * 根据所属专项获取专项名称
 * @param sszx 所属专项编码
 * @returns 专项名称
 */
export function getSszxName(sszx: string): string {
  return SSZX_NAME_MAP[sszx] || '未知专项'
}

/**
 * 根据监测指标编码获取指标名称
 * @param code 监测指标编码
 * @returns 指标名称
 */
export function getIndicatorName(code: string): string {
  return MONITORING_INDICATOR_MAP[code] || code
}
