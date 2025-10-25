/**
 * 供水模块数据管理 Composable
 * 封装供水相关的所有 API 调用和状态管理
 */

import { ref, computed } from 'vue'
import { createWaterSupplyApi } from '@/api/apiFactory'
import type { Ref } from 'vue'

// API 实例（单例模式，所有使用该 composable 的组件共享）
const waterApi = createWaterSupplyApi()

/**
 * 供水总览数据项
 */
export interface OverviewDataItem {
  id: string
  name: string
  value: number
  unit: string
  icon: string
  description: string
}

/**
 * 使用供水数据
 */
export function useWaterSupplyData() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 获取基础设施总览数据
   */
  const getOverviewData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.overviewData.List()
      console.log('📊 供水总览数据:', response)
      return response.data || []
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取总览数据失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取设备运行状态比例
   */
  const getDeviceStatusRate = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.gspspDtransPubmnteqpinfo.rateListList()
      console.log('📊 设备运行状态:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取设备状态失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取设备类型状态统计
   */
  const getDeviceTypeStatusCount = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.gspspDtransPubmnteqpinfo.deviceTypeStatusCountList()
      console.log('📊 设备类型统计:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取设备类型统计失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取最新水质监测数据
   */
  const getLatestWaterQuality = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.gspspDtransPubmnteqpinfo.latestWaterQualityDataList()
      console.log('💧 水质监测数据:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取水质数据失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取隐患类型统计
   */
  const getRiskTypeCount = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.gspspDtransPubrisks.riskTypeCountList()
      console.log('⚠️ 隐患类型统计:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取隐患统计失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取隐患整改状态统计
   */
  const getRiskStatusCount = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.gspspDtransPubrisks.riskStatusCountList()
      console.log('⚠️ 隐患整改状态:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取隐患整改状态失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取供水管网隐患统计
   */
  const getWaterSupplyRiskCount = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.gspspDtransPubrisks.waterSupplyRiskCountList()
      console.log('⚠️ 供水管网隐患:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取管网隐患失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取预警统计信息
   * @param year 年份，默认当前年份
   */
  const getWarnStatistics = async (year?: string) => {
    loading.value = true
    error.value = null

    const currentYear = year || new Date().getFullYear().toString()

    try {
      const response = await waterApi.gspspDtransPubmnteawarn.warnStatisticsList({
        Year: currentYear,
      })
      console.log('📢 预警统计:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取预警统计失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取月度预警统计
   * @param year 年份，默认当前年份
   */
  const getMonthlyWarnStatistics = async (year?: string) => {
    loading.value = true
    error.value = null

    const currentYear = year || new Date().getFullYear().toString()

    try {
      const response = await waterApi.gspspDtransPubmnteawarn.monthlyWarnStatisticsList({
        Year: currentYear,
      })
      console.log('📅 月度预警统计:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取月度预警统计失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取排查结果统计
   * @param year 年份，默认当前年份
   */
  const getCheckResultStatistics = async (year?: string) => {
    loading.value = true
    error.value = null

    const currentYear = year || new Date().getFullYear().toString()

    try {
      const response = await waterApi.gspspDtransPubmnteawarn.checkResultStatisticsList({
        Year: currentYear,
      })
      console.log('🔍 排查结果统计:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取排查结果失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取供水管线材质占比
   */
  const getWaterSupplyMaterialRatio = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await waterApi.gspspDtransPubunderpipeline.waterSupplyMaterialRatioList()
      console.log('🔧 管线材质占比:', response)
      return response
    } catch (e) {
      error.value = e as Error
      console.error('❌ 获取管线材质数据失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    // 基础数据
    getOverviewData,
    // 设备状态
    getDeviceStatusRate,
    getDeviceTypeStatusCount,
    // 水质监测
    getLatestWaterQuality,
    // 隐患统计
    getRiskTypeCount,
    getRiskStatusCount,
    getWaterSupplyRiskCount,
    // 预警统计
    getWarnStatistics,
    getMonthlyWarnStatistics,
    getCheckResultStatistics,
    // 管网信息
    getWaterSupplyMaterialRatio,
  }
}

/**
 * 使用供水总览数据（带转换逻辑）
 */
export function useWaterSupplyOverview() {
  const { loading, error, getOverviewData } = useWaterSupplyData()

  // 总览数据模板
  const overviewTemplate: OverviewDataItem[] = [
    {
      id: 'source',
      name: '水源地',
      value: 0,
      unit: '个',
      icon: 'water_source',
      description: '供水系统的源头设施',
    },
    {
      id: 'water_treatment',
      name: '水厂',
      value: 0,
      unit: '个',
      icon: 'water_treatment',
      description: '自来水处理与供应中心',
    },
    {
      id: 'pump_station',
      name: '供水泵站',
      value: 0,
      unit: '个',
      icon: 'pump_station',
      description: '加压输送供水的泵站',
    },
    {
      id: 'fire_hydrant',
      name: '市政消火栓',
      value: 0,
      unit: '个',
      icon: 'fire_hydrant',
      description: '城市公共消防用水设施',
    },
    {
      id: 'pipeline',
      name: '供水管网',
      value: 0,
      unit: '公里',
      icon: 'pipeline',
      description: '城市供水管道总长度',
    },
    {
      id: 'major_customer',
      name: '供水大户',
      value: 0,
      unit: '户',
      icon: 'major_customer',
      description: '大型用水单位或企业用户',
    },
  ]

  const overviewData: Ref<OverviewDataItem[]> = ref([...overviewTemplate])

  /**
   * 基础设施类型映射
   */
  const typeMapping: Record<string, string> = {
    jcssdstj0502: 'fire_hydrant', // 市政消火栓
    jcssdstj0503: 'source', // 水源地
    jcssdstj0504: 'water_treatment', // 水厂
    jcssdstj0505: 'pump_station', // 供水泵站
    jcssdstj0506: 'major_customer', // 供水大用户
    jcssdstj0501: 'pipeline', // 供水管网
  }

  /**
   * 加载并转换总览数据
   */
  const loadOverviewData = async () => {
    try {
      const data = await getOverviewData()

      if (data && Array.isArray(data)) {
        // 更新 overviewData 中的值
        data.forEach((item: any) => {
          const targetId = typeMapping[item.jcsslx]
          if (targetId) {
            const targetItem = overviewData.value.find((d) => d.id === targetId)
            if (targetItem) {
              targetItem.value = item.jcsstjsl || 0
            }
          }
        })
      }
    } catch (e) {
      console.error('❌ 加载总览数据失败:', e)
      throw e
    }
  }

  return {
    loading,
    error,
    overviewData,
    loadOverviewData,
  }
}
