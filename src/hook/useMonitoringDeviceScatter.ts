/**
 * 监测设备散点管理 Hook（各专项共用）
 * @description 封装散点初始化、切换、清理、点击弹窗逻辑，组件只管调用
 */

import { ref } from 'vue'
import { useVueCesium } from 'vue-cesium'
import { useGasOverviewPoints } from './useGasOverviewPoints'
import { getMonitoringPointLatestData } from '@/services/commonService'

/** 根据 sblx 编码获取图标 URL */
const getDeviceIconUrl = (sblx: string): string => {
  return new URL(`../assets/img/points/监测设备图标/${sblx}.png`, import.meta.url).href
}

export interface MonitoringDeviceScatterOptions {
  /** 获取设备点位数据的 API，默认 getMonitoringPointLatestData */
  fetchPointsApi?: (sblx: string) => Promise<any[]>
  /** 从 API 返回的单条数据中提取坐标，默认取 jdxx/wdxx 或 pointInfo.jd/wd */
  extractCoords?: (item: any) => { lsh: string; jd: number; wd: number; name: string; raw: any } | null
}

const defaultExtractCoords = (item: any) => {
  const jd = item.jdxx ?? item.pointInfo?.jd
  const wd = item.wdxx ?? item.pointInfo?.wd
  if (!jd || !wd) return null
  return {
    lsh: item.lsh || item.sbbh || '',
    jd,
    wd,
    name: item.sbmc || item.sbbh || '',
    raw: item,
  }
}

export function useMonitoringDeviceScatter(options: MonitoringDeviceScatterOptions = {}) {
  const {
    fetchPointsApi = (sblx: string) => getMonitoringPointLatestData(undefined, sblx),
    extractCoords = defaultExtractCoords,
  } = options

  const { init: initMapPoints, addPoints, clearPoints, setupClickHandler } = useGasOverviewPoints()
  const $vc = useVueCesium()

  /** 当前选中的设备类型 */
  const activeDeviceType = ref<string | null>(null)

  /** 弹窗状态 */
  const popupVisible = ref(false)
  const popupData = ref<any>(null)

  /** 关闭弹窗 */
  const closePopup = () => {
    popupVisible.value = false
    popupData.value = null
  }

  /** 初始化散点（需在 onMounted 中调用） */
  const init = async () => {
    const readyObj = await $vc.creatingPromise
    await initMapPoints(readyObj.viewer)
  }

  /**
   * 切换设备散点
   * @param sblx 设备类型编码
   * @param displayName 显示名称
   * @returns 是否为取消选中
   */
  const toggleDevicePoints = async (
    sblx: string,
    displayName: string
  ): Promise<boolean> => {
    // 取消选中
    if (activeDeviceType.value === sblx) {
      activeDeviceType.value = null
      clearPoints()
      closePopup()
      return true
    }

    activeDeviceType.value = sblx
    closePopup()

    try {
      const rows = await fetchPointsApi(sblx)
      const points = rows.map(extractCoords).filter(Boolean) as Array<{ lsh: string; jd: number; wd: number; name: string; raw: any }>

      if (points.length > 0) {
        const iconUrl = getDeviceIconUrl(sblx)
        // 512×797 比例，宽度 32 不变，高度 ≈ 50
        addPoints(points, displayName, iconUrl, undefined, 32, 50)
        setupClickHandler((point: any) => {
          // 点击散点 → 将原始数据传给弹窗（不改变地图视角）
          const matched = points.find(p => p.lsh === point.lsh)
          popupData.value = matched?.raw || point
          popupVisible.value = true
        }, true)
      } else {
        clearPoints()
      }
    } catch (e) {
      console.error('获取监测设备数据失败:', e)
    }

    return false
  }

  /** 清除散点和选中状态 */
  const clear = () => {
    activeDeviceType.value = null
    clearPoints()
    closePopup()
  }

  return {
    activeDeviceType,
    popupVisible,
    popupData,
    init,
    toggleDevicePoints,
    clear,
    closePopup,
  }
}
