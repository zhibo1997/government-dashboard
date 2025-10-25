/**
 * API 业务模块配置
 * 用于管理不同业务模块的默认参数
 */

// 业务模块枚举
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

// 公共参数接口
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

// 默认公共参数（阳新县）
export const DEFAULT_COMMON_PARAMS: Omit<CommonParams, 'Sszx'> = {
  Dsbm: '420200', // 黄石市
  Qhbm: '420222', // 阳新县
}

// 业务模块配置映射
export const MODULE_CONFIG: Record<BusinessModule, CommonParams> = {
  [BusinessModule.WATER_SUPPLY]: {
    ...DEFAULT_COMMON_PARAMS,
    Sszx: BusinessModule.WATER_SUPPLY,
  },
  [BusinessModule.DRAINAGE]: {
    ...DEFAULT_COMMON_PARAMS,
    Sszx: BusinessModule.DRAINAGE,
  },
  [BusinessModule.GAS]: {
    ...DEFAULT_COMMON_PARAMS,
    Sszx: BusinessModule.GAS,
  },
  [BusinessModule.BRIDGE]: {
    ...DEFAULT_COMMON_PARAMS,
    Sszx: BusinessModule.BRIDGE,
  },
  [BusinessModule.GAS_END_USER]: {
    ...DEFAULT_COMMON_PARAMS,
    Sszx: BusinessModule.GAS_END_USER,
  },
  [BusinessModule.BOTTLED_LPG]: {
    ...DEFAULT_COMMON_PARAMS,
    Sszx: BusinessModule.BOTTLED_LPG,
  },
  [BusinessModule.THIRD_PARTY_CONSTRUCTION]: {
    ...DEFAULT_COMMON_PARAMS,
    Sszx: BusinessModule.THIRD_PARTY_CONSTRUCTION,
  },
}

/**
 * 获取业务模块的默认参数
 * @param module 业务模块
 * @returns 默认参数对象
 */
export function getModuleParams(module: BusinessModule): CommonParams {
  return { ...MODULE_CONFIG[module] }
}

/**
 * 合并参数（自定义参数优先）
 * @param defaultParams 默认参数
 * @param customParams 自定义参数
 * @returns 合并后的参数
 */
export function mergeParams(
  defaultParams: Partial<CommonParams>,
  customParams?: Partial<CommonParams>
): Partial<CommonParams> {
  return {
    ...defaultParams,
    ...customParams,
  }
}
