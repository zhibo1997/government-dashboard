/**
 * 字段中文映射配置（统一管理）
 * 所有模块共用一个映射表，key 为字段名，value 为中文标签
 */

export const FIELD_LABEL_MAP: Record<string, string> = {
  // ========== 通用字段 ==========
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

  // ========== 燃气井盖 ==========
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

  // ========== 燃气企业 ==========
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

  // ========== 液化气企业 ==========
  yhqpsl: '液化气瓶数量',
  czgsl: '充装工数量',
  sqgsl: '送气工数量',
  khzs: '客户总数',
  jmkhsl: '居民客户数量',
  fjmkhsl: '非居民客户数量',
  ysclsl: '运输车辆数量',
  azdwsbclsl: '安装定位设备车辆数量',
  qyfzrxm: '企业负责人姓名',
  qyjyyxq: '企业经营有效期',

  // ========== 供水水源地 ==========
  sydbh: '水源地编号',
  sydmc: '水源地名称',
  sydlx: '水源地类型',
  bhqjb: '保护区级别',
  zdmj: '占地面积',
  gldw: '管理单位',
  zbdh: '值班电话',
  sjlydw: '数据来源单位',
  sydtp: '水源地图片',
  sydjj: '水源地简介',

  // ========== 供水水厂 ==========
  scbh: '水厂编号',
  scmc: '水厂名称',
  gsnl: '供水能力',
  trsysj: '投入使用时间',
  sctp: '水厂图片',
  scjj: '水厂简介',

  // ========== 供水泵站 ==========
  bzbh: '泵站编号',
  bzmc: '泵站名称',
  bzdz: '泵站地址',
  bzlz: '泵站类型',

  // ========== 排水污水厂 ==========
  csbz: '出水标准',
  jsbz: '进水标准',
  psqx: '排水去向',
  clgm: '处理规模',
  gldwmc: '管理单位名称',

  // ========== 排水河道 ==========
  hlbh: '河流编号',
  hlmc: '河流名称',
  hlcd: '河流长度',
  qdjd: '起点经度',
  qdwd: '起点纬度',
  qdxxdz: '起点详细地址',
  jsdjd: '结束点经度',
  jsdwd: '结束点纬度',
  jsdxxdz: '结束点详细地址',
  sssx: '所属水系',
  czs: '测站数量',
  hdlx: '河道流向',

  // ========== 桥梁 ==========
  qlbh: '桥梁编号',
  llmc: '桥梁名称',
  qljg: '桥梁结构',
  kjzh: '孔跨组合',
  qlzcd: '桥梁总长',
  qlk: '桥梁宽',
  qjdxx: '起点经度',
  qwdxx: '起点纬度',
  yhdw: '养护单位',
  jsdwmc: '建设单位名称',
  jsnd: '建设年代',
  sjdwmc: '设计单位名称',
  jldwmc: '监理单位名称',
  sgdwmc: '施工单位名称',
  qljbxxms: '桥梁基本信息描述',
  qljsgm: '桥梁建设规模',
  qlyhdj: '桥梁养护等级',
  zynl: '主要年限',
  qltp: '桥梁图片',
  hysx: '行业属性',
  qllx: '桥梁类型',
  ssdl: '所属道路',
  qswz: '起始位置',
  zzwz: '终止位置',
  kfsj: '开放时间',
  jgrq: '竣工日期',
  ztdj: '状态等级',

  // ========== 应急专家 ==========
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
  sfflzj: '是否防涝专家',

  // ========== 救援队伍 ==========
  dwmc: '单位名称',
  dwlx: '单位类型',
  dwgm: '单位规模',
  lsdw: '隶属单位',
  dwwz: '单位位置',
  zyfzr: '主要负责人',

  // ========== 救援人员 ==========
  ryxm: '人员姓名',
  ssdw: '所属单位',
  zytc: '专业特长',
  rydh: '人员电话',

  // ========== 救援车辆 ==========
  mc: '名称',
  lx: '类型',
  cph: '车牌号',
  jyclssdw: '所属单位',
  fzrxm: '负责人',
  fzrlxdh: '负责人电话',
  cpnl: '车辆能力',

  // ========== 救援仓库 ==========
  jyckbh: '救援仓库编号',
  jyckmc: '救援仓库名称',
  jycklx: '救援仓库类型',
  tzms: '特征简述',
  ssdwmc: '所属单位名称',
  jzmj: '建筑面积',
  jyckzywp: '救援仓库主要物品',
  fzr: '负责人',
  fzrdh: '负责人电话',
  zgjgdw: '主管监管单位',
}

/**
 * 将数据对象的 key 映射为中文标签
 * @param data 原始数据对象
 * @param filterKeys 需要过滤掉的 key 列表（可选）
 * @returns 映射后的数组 [{ label, value }]
 */
export function mapToLabelValue(
  data: Record<string, any>,
  filterKeys: string[] = [],
  dictMap: Record<string, { value: string; label: string }[]> = {},
): { label: string; value: any }[] {
  const defaultFilter = ['lsh', 'dsbm', 'qhbm', 'yskzjbz', 'sjtbzt', 'tbsj', 'sjly', 'sjbb', 'jd', 'wd', 'qjdxx', 'qwdxx', 'objectid', '_description']
  const allFilter = [...defaultFilter, ...filterKeys]

  return Object.entries(data)
    .filter(([key]) => !allFilter.includes(key) && data[key] !== null && data[key] !== undefined)
    .map(([key, value]) => {
      // 字典映射：将 code 转为中文
      let displayValue = value
      if (dictMap[key] && typeof value === 'string') {
        const found = dictMap[key].find((d) => d.value === value)
        if (found) displayValue = found.label
      }
      return {
        label: FIELD_LABEL_MAP[key] || key,
        value: displayValue,
      }
    })
}
