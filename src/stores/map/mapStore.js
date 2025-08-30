import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useMapStore = defineStore('map', () => {
  // Cesium viewer 实例
  const viewer = ref(null)
  
  // 地图状态
  const mapState = reactive({
    isInitialized: false,
    isLoading: false,
    currentView: '3D', // '2D' | '3D'
    isFullscreen: false
  })
  
  // 图层状态
  const layerState = reactive({
    showSatellite: false,
    showTerrain: false,
    showLabels: true,
    currentBaseLayer: 'tianditu' // 'tianditu' | 'satellite'
  })
  
  // 测量工具状态
  const measureState = reactive({
    isActive: false,
    currentTool: null, // 'distance' | 'area' | 'height'
    results: []
  })
  
  // POI 数据状态
  const poiState = reactive({
    markers: [],
    selectedMarker: null,
    showInfoWindow: false
  })
  
  // GeoJSON 数据状态
  const geoJsonState = reactive({
    dataSources: [],
    isLoaded: false
  })
  
  // Actions
  const setViewer = (cesiumViewer) => {
    viewer.value = cesiumViewer
    mapState.isInitialized = true
  }
  
  const setMapLoading = (loading) => {
    mapState.isLoading = loading
  }
  
  const toggleView = () => {
    mapState.currentView = mapState.currentView === '3D' ? '2D' : '3D'
  }
  
  const toggleFullscreen = () => {
    mapState.isFullscreen = !mapState.isFullscreen
  }
  
  const setBaseLayer = (layerType) => {
    layerState.currentBaseLayer = layerType
  }
  
  const toggleLayer = (layerName) => {
    switch (layerName) {
      case 'satellite':
        layerState.showSatellite = !layerState.showSatellite
        break
      case 'terrain':
        layerState.showTerrain = !layerState.showTerrain
        break
      case 'labels':
        layerState.showLabels = !layerState.showLabels
        break
    }
  }
  
  const setMeasureTool = (tool) => {
    measureState.currentTool = tool
    measureState.isActive = !!tool
  }
  
  const addMeasureResult = (result) => {
    measureState.results.push({
      id: Date.now(),
      type: measureState.currentTool,
      value: result.value,
      unit: result.unit,
      timestamp: new Date()
    })
  }
  
  const clearMeasureResults = () => {
    measureState.results = []
  }
  
  const addPOIMarker = (marker) => {
    poiState.markers.push({
      id: Date.now(),
      ...marker
    })
  }
  
  const selectPOIMarker = (markerId) => {
    poiState.selectedMarker = poiState.markers.find(m => m.id === markerId)
    poiState.showInfoWindow = true
  }
  
  const closePOIInfo = () => {
    poiState.selectedMarker = null
    poiState.showInfoWindow = false
  }
  
  const addGeoJsonDataSource = (dataSource) => {
    geoJsonState.dataSources.push(dataSource)
    geoJsonState.isLoaded = true
  }
  
  const clearAllData = () => {
    // 清理所有数据和状态
    poiState.markers = []
    poiState.selectedMarker = null
    poiState.showInfoWindow = false
    geoJsonState.dataSources = []
    geoJsonState.isLoaded = false
    measureState.results = []
    measureState.isActive = false
    measureState.currentTool = null
  }
  
  const resetMapState = () => {
    // 重置地图状态（保留viewer实例）
    mapState.isLoading = false
    mapState.currentView = '3D'
    mapState.isFullscreen = false
    layerState.showSatellite = false
    layerState.showTerrain = false
    layerState.showLabels = true
    layerState.currentBaseLayer = 'tianditu'
    clearAllData()
  }
  
  return {
    // State
    viewer,
    mapState,
    layerState,
    measureState,
    poiState,
    geoJsonState,
    
    // Actions
    setViewer,
    setMapLoading,
    toggleView,
    toggleFullscreen,
    setBaseLayer,
    toggleLayer,
    setMeasureTool,
    addMeasureResult,
    clearMeasureResults,
    addPOIMarker,
    selectPOIMarker,
    closePOIInfo,
    addGeoJsonDataSource,
    clearAllData,
    resetMapState
  }
})