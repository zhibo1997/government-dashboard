/**
 * 监测设备与指标统一解析工具模块
 * 提供单一事实来源（Single Source of Truth），统一处理点位名称提取、错别字修正、状态量映射及单位纠偏
 */

/**
 * 1. 统一提取设备点位展示名称（与地图标注 100% 保持一致口径）
 * 规则：
 * - 优先取地图散点 Icon 上实际标注的名称（_pointName / name）
 * - 去除管理单位编码中的 420200420222 前缀（例如 420200420222tyb11 -> tyb11）
 * - 兜底使用设备编号 sbbh 或设备名称 sbmc
 */
export function getPointDisplayName(data: any): string {
  if (!data) return '设备详情'
  if (data._pointName) return data._pointName
  if (data.name) return data.name

  const code = (data.gldwbh || data.dwbm || data.bh || '').replace(/^420200420222/, '')
  if (code) return code

  return data.sbbh || data.sbmc || '设备详情'
}

/**
 * 2. 指标名称错别字修正与标准化
 * 修正说明：后端字典中录入人员误将“水浸”录成了同音错别字“水侵”，在此统一自动纠正
 */
export function normalizeIndicatorName(rawName: string): string {
  if (!rawName) return ''
  return rawName.replace(/水侵/g, '水浸')
}

/**
 * 3. 状态型指标枚举映射配置表（未来新增任何状态字段仅需在此扩展）
 */
const STATUS_INDICATOR_MAPPINGS: Array<{
  match: (name: string, key?: string) => boolean
  map: Record<string, string>
  hasUnit: boolean
}> = [
  {
    // 水浸状态：0 正常，1 发生水浸（无物理单位）
    match: (name, key) => {
      const n = (name || '').toLowerCase()
      const k = (key || '').toLowerCase()
      return n.includes('水浸') || n.includes('水侵') || k === 'sqzt' || k === 'sjzt' || k.includes('water')
    },
    map: {
      '0': '正常',
      '1': '发生水浸',
      '正常': '正常',
      '发生水浸': '发生水浸',
    },
    hasUnit: false,
  },
]

/**
 * 4. 格式化单条指标数据（数值状态翻译、单位清洗纠偏）
 */
export function formatIndicatorItem(name: string, rawValue: any, rawUnit?: string, key?: string) {
  const normalizedName = normalizeIndicatorName(name)
  const valStr = String(rawValue ?? '').trim()

  for (const config of STATUS_INDICATOR_MAPPINGS) {
    if (config.match(normalizedName, key)) {
      let mappedVal = config.map[valStr]
      if (!mappedVal && !isNaN(Number(valStr)) && valStr !== '') {
        mappedVal = Number(valStr) === 1 ? '发生水浸' : (Number(valStr) === 0 ? '正常' : valStr)
      }
      mappedVal = mappedVal || (valStr || '—')
      return {
        name: normalizedName,
        value: mappedVal,
        unit: config.hasUnit ? (rawUnit || '') : '',
        isStatus: true,
      }
    }
  }

  // 数值型指标：单位清洗与纠偏
  let unit = (rawUnit && String(rawUnit).trim()) || ''

  // 温度单位标准化
  if (normalizedName.includes('温度') && (unit.toLowerCase() === 'c' || !unit)) {
    unit = '℃'
  }

  // 水位/水深/积水深度单位标准化为 m（统一基础信息与历史趋势图的单位展示，修正历史数据中误标的 mm）
  const isWaterLevel =
    normalizedName.includes('水位') ||
    normalizedName.includes('水深') ||
    normalizedName.includes('积水') ||
    (key && (key.toLowerCase() === 'sw' || key.toLowerCase().includes('water_level') || key.toLowerCase().includes('shuiwei')))

  if (isWaterLevel) {
    unit = 'm'
  }

  return {
    name: normalizedName,
    value: rawValue ?? '—',
    unit,
    isStatus: false,
  }
}

/**
 * 5. 统一解析 jcz JSON 字符串为前端展示列表
 */
export function parseMonitoringValues(
  rawJcz: any,
  dictMap: Record<string, { name: string; unit?: string }> = {},
  fallbackData?: any
): Array<{ key: string; name: string; value: string; unit: string; isStatus?: boolean }> {
  const result: Array<{ key: string; name: string; value: string; unit: string; isStatus?: boolean }> = []

  if (rawJcz) {
    try {
      const jcz = typeof rawJcz === 'string' ? JSON.parse(rawJcz) : rawJcz
      Object.entries(jcz).forEach(([key, val]: [string, any]) => {
        const dictItem = dictMap[key]
        const dictName = dictItem?.name || key
        // 优先取接口自身返回的单位（jcdw），若接口未返回则回退至字典配置的单位
        const unit = (val?.jcdw && String(val.jcdw).trim()) || dictItem?.unit || ''
        const formatted = formatIndicatorItem(dictName, val?.jcz, unit, key)
        result.push({
          key,
          name: formatted.name,
          value: formatted.value,
          unit: formatted.unit,
          isStatus: formatted.isStatus,
        })
      })
    } catch (e) {
      console.warn('解析监测值 JSON 失败:', e)
    }
  }

  // 兜底：若设备根对象自身含有未包装在 jcz 中的水浸字段
  if (fallbackData) {
    const hasWater = result.some(item => item.name.includes('水浸'))
    if (!hasWater) {
      for (const [k, v] of Object.entries(fallbackData)) {
        if (k === 'jcz' || k === 'jcsj') continue
        if (k.toLowerCase().includes('water') || k.includes('水浸') || k.includes('水侵') || k === 'sqzt' || k === 'sjzt') {
          const formatted = formatIndicatorItem('水浸状态', v, '', k)
          result.push({
            key: k,
            name: formatted.name,
            value: formatted.value,
            unit: formatted.unit,
            isStatus: true,
          })
          break
        }
      }
    }
  }

  return result
}
