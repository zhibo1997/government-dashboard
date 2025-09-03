import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMapLayersStore = defineStore('mapLayers', () => {
  // 图层状态
  const layerStates = ref({
    bridge_layer: {
      visible: false,
      opacity: 1.0,
      url: "http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_bridgebscinfo.json",
      checked: false
    },
    manhole_layer: {
      visible: false,
      opacity: 1.0,
      url: "http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_manholecoverbasetinfo.json",
      checked: false
    },
  })

  // 勾选的图层keys
  const checkedKeys = ref([])

  // 展开的节点keys
  const expandedKeys = ref(['gas_special', 'bridge_special'])

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
  function updateLayerState(layerKey, updates) {
    if (layerStates.value[layerKey]) {
      layerStates.value[layerKey] = {
        ...layerStates.value[layerKey],
        ...updates
      }
    }
  }

  function setLayerVisible(layerKey, visible) {
    updateLayerState(layerKey, { visible, checked: visible })
    updateCheckedKeys()
  }

  function setLayerOpacity(layerKey, opacity) {
    updateLayerState(layerKey, { opacity })
  }

  function setLayerChecked(layerKey, checked) {
    updateLayerState(layerKey, { checked, visible: checked })
    updateCheckedKeys()
  }

  function updateCheckedKeys() {
    checkedKeys.value = Object.entries(layerStates.value)
      .filter(([key, state]) => state.checked)
      .map(([key]) => key)
  }

  function setCheckedKeys(keys) {
    checkedKeys.value = keys
    // 同步更新图层状态
    Object.keys(layerStates.value).forEach(layerKey => {
      const isChecked = keys.includes(layerKey)
      layerStates.value[layerKey].checked = isChecked
      layerStates.value[layerKey].visible = isChecked
    })
  }

  function setExpandedKeys(keys) {
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