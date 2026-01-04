/**
 * API 配置模块
 * 管理业务模块配置和公共参数
 */

// ========== 业务模块枚举 ==========

export enum BusinessModule {
  /** 供水 */
  WATER_SUPPLY = 'csaqzx_gs',
  /** 排水 */
  DRAINAGE = 'csaqzx_ps',
  /** 燃气 */
  GAS = 'csaqzx_rq',
  /** 桥梁 */
  BRIDGE = 'csaqzx_ql',
  /** 燃气终端用户 */
  GAS_END_USER = 'csaqzx_rqzdyh',
  /** 瓶装液化气 */
  BOTTLED_LPG = 'csaqzx_pzyhq',
  /** 第三方施工 */
  THIRD_PARTY_CONSTRUCTION = 'csaqzx_sfsg',
}

// ========== 公共参数接口 ==========

export interface CommonParams {
  /** 市州编码 */
  Dsbm: string
  /** 区划编码 */
  Qhbm: string
  /** 所属专项 */
  Sszx?: string
  /** 数据来源 */
  Sjly?: string
}

// ========== 默认公共参数（阳新县） ==========

export const DEFAULT_COMMON_PARAMS: Omit<CommonParams, 'Sszx'> = {
  Dsbm: '420200', // 黄石市
  Qhbm: '420222', // 阳新县
}

/**
 * 获取业务模块的默认参数
 */
export function getModuleParams(module?: BusinessModule): CommonParams {
  return {
    ...DEFAULT_COMMON_PARAMS,
    ...(module ? { Sszx: module } : {}),
  }
}

/**
 * 合并参数（自定义参数优先）
 */
export function mergeParams<T extends Record<string, any>>(
  defaultParams: Partial<CommonParams>,
  customParams?: T
): Partial<CommonParams> & T {
  return {
    ...defaultParams,
    ...customParams,
  } as Partial<CommonParams> & T
}

// ========== 基础设施类型编码 ==========

export const FacilityTypeCode = {
  // 燃气
  GAS_PIPELINE: 'jcssdstj0101',           // 天然气管网（公里）
  GAS_STATION: 'jcssdstj0102',            // 天然气场站（个）
  GAS_ENTERPRISE: 'jcssdstj0103',         // 天然气运营企业（个）
  
  // 燃气终端用户
  GAS_RESIDENTIAL: 'jcssdstj0201',        // 燃气居民用户（户）
  GAS_COMMERCIAL: 'jcssdstj0202',         // 燃气工商业用户（户）
  
  // 瓶装液化气
  LPG_BOTTLE: 'jcssdstj0301',             // 液化气瓶（个）
  LPG_ENTERPRISE: 'jcssdstj0302',         // 液化气运营企业（个）
  LPG_SUPPLY_STATION: 'jcssdstj0303',     // 供应站（个）
  LPG_FILLING_STATION: 'jcssdstj0304',    // 灌装站（个）
  LPG_FILLING_SCALE: 'jcssdstj0305',      // 灌装秤（个）
  LPG_VEHICLE: 'jcssdstj0306',            // 运输车（辆）
  
  // 排水
  DRAINAGE_PIPELINE: 'jcssdstj0401',      // 排水管网（公里）
  RAIN_PIPELINE: 'jcssdstj0402',          // 雨水管网（公里）
  SEWAGE_PIPELINE: 'jcssdstj0403',        // 污水管网（公里）
  COMBINED_PIPELINE: 'jcssdstj0404',      // 雨污合流管网（公里）
  SEWAGE_PLANT: 'jcssdstj0405',           // 污水厂（个）
  DRAINAGE_PUMP: 'jcssdstj0406',          // 排水泵站（个）
  WATERLOGGING_POINT: 'jcssdstj0407',     // 易积水点（个）
  RIVER: 'jcssdstj0408',                  // 河道（条）
  RIVER_STATION: 'jcssdstj0409',          // 河道测站（个）
  RAINFALL_STATION: 'jcssdstj0410',       // 雨量站（个）
  
  // 供水
  WATER_SUPPLY_PIPELINE: 'jcssdstj0501',  // 供水管网（公里）
  FIRE_HYDRANT: 'jcssdstj0502',           // 市政消火栓（个）
  WATER_SOURCE: 'jcssdstj0503',           // 水源地（个）
  WATER_PLANT: 'jcssdstj0504',            // 水厂（个）
  WATER_PUMP: 'jcssdstj0505',             // 供水泵站（个）
  WATER_BIG_USER: 'jcssdstj0506',         // 供水大用户（户）
  
  // 桥梁
  BRIDGE: 'jcssdstj0601',                 // 桥梁（座）
  LARGE_BRIDGE: 'jcssdstj0602',           // 大桥及特大桥（座）
  OVERPASS: 'jcssdstj0603',               // 立交桥（座）
  CULVERT: 'jcssdstj0604',                // 涵洞（个）
} as const
