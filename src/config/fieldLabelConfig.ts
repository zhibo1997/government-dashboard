/**
 * 字段中文映射配置
 * 统一管理各模块详情弹窗的字段标签
 */

// 通用字段映射（多个模块共用）
export const COMMON_FIELDS: Record<string, string> = {
  lsh: '流水号',
  dsbm: '市州编码',
  qhbm: '区划编码',
  jd: '经度',
  wd: '纬度',
  yskzjbz: '原始库主键',
  sjtbzt: '同步状态',
  tbsj: '同步时间',
  sjly: '数据来源',
  sjbb: '数据版本',
}

// 燃气井盖字段映射
export const GAS_MANHOLE_COVER_FIELDS: Record<string, string> = {
  jgbh: '编号',
  dz: '地址',
  qsdw: '权属单位',
  jgxh: '井盖型号',
  jglx: '井盖类型',
  jggg: '井盖规格',
  jgcz: '井盖材质',
  jgzh: '井盖字号',
  gdsynx: '管道使用年限',
  azrq: '安装日期',
  sswzlx: '所属位置类型',
  jgzt: '井盖状态',
  sfgnxwh: '是否功能型维护',
  wxdwmc: '维修单位名称',
  zjycdwxsj: '最后一次维修时间',
  zjycdwxjl: '最后一次维修记录',
  sfjc: '是否检查',
  glgxbm: '关联管线编码',
}

// 燃气企业字段映射
export const GAS_ENTERPRISE_FIELDS: Record<string, string> = {
  qybm: '企业编码',
  qymc: '企业名称',
  xxdz: '详细地址',
  jyqy: '经营区域',
  zgrs: '职工人数',
  yyyjsl: '拥有窨井数量',
  yyczsl: '拥有厂站数量',
  yygxcd: '拥有管线长度',
  lxr: '联系人',
  lxdh: '联系电话',
  rqlx: '燃气类型',
}

// 液化气企业字段映射
export const BOTTLE_GAS_ENTERPRISE_FIELDS: Record<string, string> = {
  qybm: '企业编码',
  qymc: '企业名称',
  xxdz: '详细地址',
  jyqy: '经营区域',
  yhqpsl: '液化气瓶数量',
  zgrs: '职工人数',
  czgsl: '充装工数量',
  sqgsl: '送气工数量',
  khzs: '客户总数',
  jmkhsl: '居民客户数量',
  fjmkhsl: '非居民客户数量',
  ysclsl: '运输车辆数量',
  azdwsbclsl: '安装定位设备车辆数量',
  qyfzrxm: '企业负责人姓名',
  qyjyyxq: '企业经营有效期',
}

// 供水水源地字段映射
export const WATER_SOURCE_FIELDS: Record<string, string> = {
  sydbh: '水源地编号',
  symc: '水源地名称',
  syddz: '水源地地址',
  sylx: '水源类型',
  sydj: '水源等级',
  sjll: '设计流量',
  sjzl: '设计水量',
}

// 供水水厂字段映射
export const WATER_PLANT_FIELDS: Record<string, string> = {
  ccbh: '水厂编号',
  ccmc: '水厂名称',
  ccdz: '水厂地址',
  cclx: '水厂类型',
  sjcl: '设计处理能力',
  sjcll: '设计处理量',
}

// 供水泵站字段映射
export const WATER_PUMP_STATION_FIELDS: Record<string, string> = {
  bzbh: '泵站编号',
  bzmc: '泵站名称',
  bzdz: '泵站地址',
  bzlz: '泵站类型',
  sjll: '设计流量',
}

// 应急专家字段映射
export const EMERGENCY_EXPERT_FIELDS: Record<string, string> = {
  xm: '姓名',
  xb: '性别',
  zyjstc: '专业技术特长',
  gzdw: '工作单位',
  zw: '职务',
  zc: '职称',
  dwdz: '单位地址',
  sj: '手机',
  mz: '民族',
  zzmm: '政治面貌',
  xl: '学历',
  sxzy: '所学专业',
}

// 救援队伍字段映射
export const EMERGENCY_TEAM_FIELDS: Record<string, string> = {
  dwmc: '单位名称',
  dwlx: '单位类型',
  dwgm: '单位规模',
  lsdw: '隶属单位',
  dwwz: '单位位置',
  zyfzr: '主要负责人',
  lxdh: '联系电话',
}

// 救援人员字段映射
export const EMERGENCY_PERSONNEL_FIELDS: Record<string, string> = {
  ryxm: '人员姓名',
  ssdw: '所属单位',
  zw: '职务',
  zytc: '专业特长',
  rydh: '人员电话',
}

// 救援车辆字段映射
export const EMERGENCY_VEHICLE_FIELDS: Record<string, string> = {
  mc: '名称',
  lx: '类型',
  cph: '车牌号',
  jyclssdw: '所属单位',
  fzrxm: '负责人',
  fzrlxdh: '负责人电话',
  cpnl: '车辆能力',
}

// 救援仓库字段映射
export const EMERGENCY_WAREHOUSE_FIELDS: Record<string, string> = {
  ckmc: '仓库名称',
  ckdz: '仓库地址',
  cklx: '仓库类型',
  ckmj: '仓库面积',
  fzrxm: '负责人',
  fzrlxdh: '负责人电话',
}

/**
 * 根据模块类型获取字段映射
 * @param moduleType 模块类型
 * @returns 字段映射对象
 */
export function getFieldMapping(moduleType: string): Record<string, string> {
  const mappingMap: Record<string, Record<string, string>> = {
    '燃气井盖': GAS_MANHOLE_COVER_FIELDS,
    '燃气企业': GAS_ENTERPRISE_FIELDS,
    '液化气企业': BOTTLE_GAS_ENTERPRISE_FIELDS,
    '水源地': WATER_SOURCE_FIELDS,
    '水厂': WATER_PLANT_FIELDS,
    '供水泵站': WATER_PUMP_STATION_FIELDS,
    '应急专家': EMERGENCY_EXPERT_FIELDS,
    '救援队伍': EMERGENCY_TEAM_FIELDS,
    '救援人员': EMERGENCY_PERSONNEL_FIELDS,
    '救援车辆': EMERGENCY_VEHICLE_FIELDS,
    '救援仓库': EMERGENCY_WAREHOUSE_FIELDS,
  }

  return { ...COMMON_FIELDS, ...(mappingMap[moduleType] || {}) }
}
