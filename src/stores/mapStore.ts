import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  MapState, 
  LayerState, 
  MeasureState, 
  POIState, 
  GeoJsonState,
  LayerTreeState,
  POIMarker,
  MeasureResult
} from '@/types'

/**
 * 地图状态管理 Store
 * 管理 Mapbox map 实例、地图状态、图层状态、测量工具状态、POI 数据状态和 GeoJSON 数据状态
 */
export const useMapStore = defineStore('map', () => {
  // Mapbox map 实例
  const map = ref<any>(null)

  // 地图状态
  const mapState = ref<MapState>({
    isInitialized: false,
    isLoading: false,
    viewMode: '2D',
    isFullscreen: false
  })

  // 图层状态
  const layerState = ref<LayerState>({
    satellite: true,
    terrain: false,
    labels: true,
    baseMap: 'mapbox',
    customLayers: new Map()
  })

  // 图层树状态
  const layerTreeState = ref<LayerTreeState>({
    tree: [],
    expandedNodes: new Set(),
    selectedLayer: null,
    layerStates: new Map()
  })

  // 测量工具状态
  const measureState = ref<MeasureState>({
    isActive: false,
    currentTool: null,
    results: []
  })

  // POI 数据状态
  const poiState = ref<POIState>({
    markers: [],
    selectedMarker: null,
    showInfoWindow: false
  })

  // GeoJSON 数据状态
  const geoJsonState = ref<GeoJsonState>({
    dataSources: [],
    isLoading: false,
    error: null
  })

  // Computed properties
  const isMapReady = computed(() => {
    return map.value !== null && mapState.value.isInitialized
  })

  const activeMeasureTool = computed(() => {
    return measureState.value.isActive ? measureState.value.currentTool : null
  })

  const visiblePOIs = computed(() => {
    return poiState.value.markers.filter(marker => marker.visible !== false)
  })

  const totalDataSources = computed(() => {
    return geoJsonState.value.dataSources.length
  })

  const activeCustomLayers = computed(() => {
    return Array.from(layerState.value.customLayers.values()).filter(layer => layer.visible)
  })

  const layerTreeNodes = computed(() => {
    return layerTreeState.value.tree
  })

  // Actions
  const setMap = (mapboxMap: any): void => {
    map.value = mapboxMap
  }

  const setMapInitialized = (initialized: boolean): void => {
    mapState.value.isInitialized = initialized
  }

  const setMapLoading = (loading: boolean): void => {
    mapState.value.isLoading = loading
  }

  const setViewMode = (mode: '2D' | '3D'): void => {
    mapState.value.viewMode = mode
  }

  const setFullscreen = (fullscreen: boolean): void => {
    mapState.value.isFullscreen = fullscreen
  }

  const toggleSatelliteLayer = (): void => {
    layerState.value.satellite = !layerState.value.satellite
  }

  const toggleTerrainLayer = (): void => {
    layerState.value.terrain = !layerState.value.terrain
  }

  const toggleLabelsLayer = (): void => {
    layerState.value.labels = !layerState.value.labels
  }

  const setBaseMap = (baseMap: string): void => {
    layerState.value.baseMap = baseMap
  }

  const setMeasureActive = (active: boolean): void => {
    measureState.value.isActive = active
    if (!active) {
      measureState.value.currentTool = null
    }
  }

  const setCurrentMeasureTool = (tool: 'distance' | 'area' | null): void => {
    measureState.value.currentTool = tool
    measureState.value.isActive = tool !== null
  }

  const addMeasureResult = (result: MeasureResult): void => {
    measureState.value.results.push(result)
  }

  const clearMeasureResults = (): void => {
    measureState.value.results = []
  }

  const removeMeasureResult = (id: string): void => {
    const index = measureState.value.results.findIndex(result => result.id === id)
    if (index > -1) {
      measureState.value.results.splice(index, 1)
    }
  }

  const setPOIMarkers = (markers: POIMarker[]): void => {
    poiState.value.markers = markers
  }

  const addPOIMarker = (marker: POIMarker): void => {
    poiState.value.markers.push(marker)
  }

  const removePOIMarker = (id: string): void => {
    const index = poiState.value.markers.findIndex(marker => marker.id === id)
    if (index > -1) {
      poiState.value.markers.splice(index, 1)
    }
  }

  const setSelectedMarker = (marker: POIMarker | null): void => {
    poiState.value.selectedMarker = marker
  }

  const setShowInfoWindow = (show: boolean): void => {
    poiState.value.showInfoWindow = show
  }

  const clearPOIMarkers = (): void => {
    poiState.value.markers = []
    poiState.value.selectedMarker = null
    poiState.value.showInfoWindow = false
  }

  const setGeoJsonLoading = (loading: boolean): void => {
    geoJsonState.value.isLoading = loading
  }

  const setGeoJsonError = (error: string | null): void => {
    geoJsonState.value.error = error
  }

  const addDataSource = (dataSource: any): void => {
    geoJsonState.value.dataSources.push(dataSource)
  }

  const removeDataSource = (dataSource: any): void => {
    const index = geoJsonState.value.dataSources.indexOf(dataSource)
    if (index > -1) {
      geoJsonState.value.dataSources.splice(index, 1)
    }
  }

  const clearDataSources = (): void => {
    geoJsonState.value.dataSources = []
  }

  const updatePOIMarker = (id: string, updates: Partial<POIMarker>): void => {
    const marker = poiState.value.markers.find(m => m.id === id)
    if (marker) {
      Object.assign(marker, updates)
    }
  }

  const togglePOIVisibility = (id: string): void => {
    const marker = poiState.value.markers.find(m => m.id === id)
    if (marker) {
      marker.visible = !(marker.visible ?? true)
    }
  }

  const resetMapState = (): void => {
    mapState.value = {
      isInitialized: false,
      isLoading: false,
      viewMode: '2D',
      isFullscreen: false
    }
  }

  const resetLayerState = (): void => {
    layerState.value = {
      satellite: true,
      terrain: false,
      labels: true,
      baseMap: 'mapbox',
      customLayers: new Map()
    }
  }

  // 图层树管理方法
  const setLayerTree = (tree: any[]): void => {
    layerTreeState.value.tree = tree
  }

  const updateLayerTreeState = (update: {
    layerId: string
    visible?: boolean
    opacity?: number
    loading?: boolean
    error?: string | null
  }): void => {
    const currentState = layerTreeState.value.layerStates.get(update.layerId) || {
      visible: false,
      opacity: 1,
      loading: false,
      error: null
    }
    
    const newState = { ...currentState, ...update }
    layerTreeState.value.layerStates.set(update.layerId, newState)
  }

  const toggleLayerTreeNode = (nodeId: string): void => {
    if (layerTreeState.value.expandedNodes.has(nodeId)) {
      layerTreeState.value.expandedNodes.delete(nodeId)
    } else {
      layerTreeState.value.expandedNodes.add(nodeId)
    }
  }

  const setSelectedLayer = (layerId: string | null): void => {
    layerTreeState.value.selectedLayer = layerId
  }

  const addCustomLayer = (layerId: string, layerData: any): void => {
    layerState.value.customLayers.set(layerId, {
      id: layerId,
      data: layerData,
      visible: true,
      opacity: 1,
      type: 'geojson'
    })
  }

  const removeCustomLayer = (layerId: string): void => {
    layerState.value.customLayers.delete(layerId)
    layerTreeState.value.layerStates.delete(layerId)
  }

  const updateCustomLayerVisibility = (layerId: string, visible: boolean): void => {
    const layer = layerState.value.customLayers.get(layerId)
    if (layer) {
      layer.visible = visible
    }
  }

  const updateCustomLayerOpacity = (layerId: string, opacity: number): void => {
    const layer = layerState.value.customLayers.get(layerId)
    if (layer) {
      layer.opacity = opacity
    }
  }

  const clearCustomLayers = (): void => {
    layerState.value.customLayers.clear()
    layerTreeState.value.layerStates.clear()
  }

  const resetLayerTreeState = (): void => {
    layerTreeState.value = {
      tree: [],
      expandedNodes: new Set(),
      selectedLayer: null,
      layerStates: new Map()
    }
  }

  const resetMeasureState = (): void => {
    measureState.value = {
      isActive: false,
      currentTool: null,
      results: []
    }
  }

  const resetAllStates = (): void => {
    resetMapState()
    resetLayerState()
    resetMeasureState()
    resetLayerTreeState()
    clearPOIMarkers()
    clearDataSources()
    setGeoJsonError(null)
  }

  return {
    // State
    map,
    mapState,
    layerState,
    layerTreeState,
    measureState,
    poiState,
    geoJsonState,
    
    // Computed
    isMapReady,
    activeMeasureTool,
    visiblePOIs,
    totalDataSources,
    activeCustomLayers,
    layerTreeNodes,
    
    // Actions
    setMap,
    setMapInitialized,
    setMapLoading,
    setViewMode,
    setFullscreen,
    toggleSatelliteLayer,
    toggleTerrainLayer,
    toggleLabelsLayer,
    setBaseMap,
    setMeasureActive,
    setCurrentMeasureTool,
    addMeasureResult,
    clearMeasureResults,
    removeMeasureResult,
    setPOIMarkers,
    addPOIMarker,
    removePOIMarker,
    setSelectedMarker,
    setShowInfoWindow,
    clearPOIMarkers,
    setGeoJsonLoading,
    setGeoJsonError,
    addDataSource,
    removeDataSource,
    clearDataSources,
    updatePOIMarker,
    togglePOIVisibility,
    resetMapState,
    resetLayerState,
    resetMeasureState,
    resetAllStates,
    // Layer Tree Actions
    setLayerTree,
    updateLayerTreeState,
    toggleLayerTreeNode,
    setSelectedLayer,
    addCustomLayer,
    removeCustomLayer,
    updateCustomLayerVisibility,
    updateCustomLayerOpacity,
    clearCustomLayers,
    resetLayerTreeState
  }
})