import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 底部面板类型 */
export type BottomPanelType = 'equipment' | 'camera' | 'monitoring' | null

/**
 * 底部面板状态管理 Store
 * 统一管理底部列表面板的互斥显示状态和侧边栏折叠状态
 */
export const useBottomPanelStore = defineStore('bottomPanel', () => {
  /** 当前激活的底部面板类型，null 表示无面板打开 */
  const activePanel = ref<BottomPanelType>(null)

  /** 面板携带的数据（如 bridgeData、stationData 等） */
  const panelData = ref<Record<string, any>>({})

  /** 侧边栏是否折叠 */
  const sidebarCollapsed = ref(false)

  /** 打开指定类型的底部面板（自动关闭其他面板） */
  function showPanel(type: BottomPanelType, data: Record<string, any> = {}) {
    activePanel.value = type
    panelData.value = data
  }

  /** 关闭底部面板 */
  function hidePanel() {
    activePanel.value = null
    panelData.value = {}
  }

  /** 设置侧边栏折叠状态 */
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  return {
    activePanel,
    panelData,
    sidebarCollapsed,
    showPanel,
    hidePanel,
    setSidebarCollapsed,
  }
})
