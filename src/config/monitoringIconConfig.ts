/**
 * 监测设备图标配置
 * @description 设备类型(sblx)直接对应 public/images/equipmentIcons/{sblx}.svg
 */

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
  const baseUrl = import.meta.env.VITE_BASE_URL
  return `${baseUrl}/images/equipmentIcons/${sblx}.svg`
}

/**
 * 根据设备类型获取设备名称
 * @param sblx 设备类型编码
 * @returns 设备类型名称
 */
export function getDeviceTypeName(_sblx: string): string {
  return '未知设备'
}

/**
 * 根据所属专项获取专项名称
 * @param sszx 所属专项编码
 * @returns 专项名称
 */
export function getSszxName(sszx: string): string {
  const map: Record<string, string> = {
    'csaqzx_rq': '燃气监测',
    'csaqzx_gs': '供水监测',
    'csaqzx_ql': '桥梁监测',
    'csaqzx_ps': '排水监测',
    'csaqzx_rqzdyh': '燃气终端用户',
    'csaqzx_pzyhq': '瓶装液化气',
  }
  return map[sszx] || '未知专项'
}

/**
 * 根据监测指标编码获取指标名称
 * @param code 监测指标编码
 * @returns 指标名称
 */
export function getIndicatorName(code: string): string {
  const map: Record<string, string> = {
    'jczb0101': '可燃气体浓度',
    'jczb0102': '温度',
    'jczb0103': '湿度',
    'jczb0104': '压力',
    'jczb0105': '流量',
    'jczb0122': '报警状态',
    'jczb0501': '应变值',
    'jczb0502': '挠度值',
    'jczb0503': '加速度值',
    'jczb0504': '裂缝宽度',
    'jczb0505': '位移值',
  }
  return map[code] || code
}
