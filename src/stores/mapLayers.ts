import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 图层状态类型定义
interface LayerState {
  visible: boolean
  opacity: number
  checked: boolean
}

export const useMapLayersStore = defineStore('mapLayers', () => {
  // 图层状态
  const layerStates = ref<Record<string, LayerState>>({
    bridge_layer: {
      visible: false,
      opacity: 1.0,
      checked: false
    },
    manhole_layer: {
      visible: false,
      opacity: 1.0,
      checked: false
    },
  })

  // 勾选的图层keys
  const checkedKeys = ref<string[]>([])

  // 展开的节点keys
  const expandedKeys = ref<string[]>(['gas_special', 'bridge_special'])

  // 计算属性：获取所有勾选的图层
  const checkedLayers = computed(() => {
    return Object.entries(layerStates.value)
      .filter(([key, state]) => state.checked)
      .map(([key, state]) => ({ key, ...state }))
  })

  // 计算属性：获取可见的图层
  const visibleLayers = computed(() => {
    return Object.entries(layerStates.value)
      .filter(([key, state]) => state.visible)
      .map(([key, state]) => ({ key, ...state }))
  })

  // Actions
  function updateLayerState(layerKey: string, updates: Partial<LayerState>) {
    if (layerStates.value[layerKey]) {
      layerStates.value[layerKey] = {
        ...layerStates.value[layerKey],
        ...updates
      }
    }
  }

  function setLayerVisible(layerKey: string, visible: boolean) {
    updateLayerState(layerKey, { visible, checked: visible })
    updateCheckedKeys()
  }

  function setLayerOpacity(layerKey: string, opacity: number) {
    updateLayerState(layerKey, { opacity })
  }

  function setLayerChecked(layerKey: string, checked: boolean) {
    updateLayerState(layerKey, { checked, visible: checked })
    updateCheckedKeys()
  }

  function updateCheckedKeys() {
    checkedKeys.value = Object.entries(layerStates.value)
      .filter(([key, state]) => state.checked)
      .map(([key]) => key)
  }

  function setCheckedKeys(keys: string[]) {
    checkedKeys.value = keys
    // 同步更新图层状态
    Object.keys(layerStates.value).forEach(layerKey => {
      const isChecked = keys.includes(layerKey)
      layerStates.value[layerKey].checked = isChecked
      layerStates.value[layerKey].visible = isChecked
    })
  }

  function setExpandedKeys(keys: string[]) {
    expandedKeys.value = keys
  }

  // 初始化
  function initializeStore() {
    updateCheckedKeys()
  }

  return {
    // State
    layerStates,
    checkedKeys,
    expandedKeys,
    
    // Getters
    checkedLayers,
    visibleLayers,
    
    // Actions
    updateLayerState,
    setLayerVisible,
    setLayerOpacity,
    setLayerChecked,
    setCheckedKeys,
    setExpandedKeys,
    initializeStore
  }
})