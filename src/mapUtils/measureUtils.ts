// import mapboxgl from 'maplibre-gl'
import mapboxgl from "@cgcs2000/mapbox-gl";
import * as turf from '@turf/turf'

export interface MeasurePoint {
  lng: number
  lat: number
}

export interface MeasureResult {
  id: string
  type: 'distance' | 'area'
  points: MeasurePoint[]
  value: number
  unit: string
  label: string
  geojson: any
}

export interface MeasureOptions {
  lineColor?: string
  lineWidth?: number
  pointColor?: string
  pointRadius?: number
  fillColor?: string
  fillOpacity?: number
  textColor?: string
  textSize?: number
  showTooltip?: boolean
  precision?: number
}

export class MapboxMeasureTool {
  private map: mapboxgl.Map
  private isActive: boolean = false
  private currentTool: 'distance' | 'area' | null = null
  private currentPoints: MeasurePoint[] = []
  private currentMeasureId: string | null = null
  private results: MeasureResult[] = []
  private options: Required<MeasureOptions>
  private clickHandler: ((e: mapboxgl.MapMouseEvent) => void) | null = null
  private mouseMoveHandler: ((e: mapboxgl.MapMouseEvent) => void) | null = null
  private dblClickHandler: ((e: mapboxgl.MapMouseEvent) => void) | null = null
  private keyHandler: ((e: KeyboardEvent) => void) | null = null

  constructor(map: mapboxgl.Map, options: MeasureOptions = {}) {
    this.map = map
    this.options = {
      lineColor: options.lineColor || '#ff0000',
      lineWidth: options.lineWidth || 3,
      pointColor: options.pointColor || '#ff0000',
      pointRadius: options.pointRadius || 6,
      fillColor: options.fillColor || '#ff0000',
      fillOpacity: options.fillOpacity || 0.2,
      textColor: options.textColor || '#000000',
      textSize: options.textSize || 14,
      showTooltip: options.showTooltip !== false,
      precision: options.precision || 2
    }
    
    this.initializeSources()
    this.setupKeyboardHandler()
  }

  /**
   * 初始化数据源和图层
   */
  private initializeSources(): void {
    // 添加测量点数据源
    if (!this.map.getSource('measure-points')) {
      this.map.addSource('measure-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })
    }

    // 添加测量线数据源
    if (!this.map.getSource('measure-lines')) {
      this.map.addSource('measure-lines', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })
    }

    // 添加测量面数据源
    if (!this.map.getSource('measure-polygons')) {
      this.map.addSource('measure-polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })
    }

    // 添加测量标签数据源
    if (!this.map.getSource('measure-labels')) {
      this.map.addSource('measure-labels', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })
    }

    // 添加临时线数据源（鼠标跟随）
    if (!this.map.getSource('measure-temp-line')) {
      this.map.addSource('measure-temp-line', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })
    }

    this.addLayers()
  }

  /**
   * 添加图层
   */
  private addLayers(): void {
    // 测量面图层
    if (!this.map.getLayer('measure-polygons-fill')) {
      this.map.addLayer({
        id: 'measure-polygons-fill',
        type: 'fill',
        source: 'measure-polygons',
        paint: {
          'fill-color': this.options.fillColor,
          'fill-opacity': this.options.fillOpacity
        }
      })
    }

    if (!this.map.getLayer('measure-polygons-stroke')) {
      this.map.addLayer({
        id: 'measure-polygons-stroke',
        type: 'line',
        source: 'measure-polygons',
        paint: {
          'line-color': this.options.lineColor,
          'line-width': this.options.lineWidth
        }
      })
    }

    // 测量线图层
    if (!this.map.getLayer('measure-lines')) {
      this.map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'measure-lines',
        paint: {
          'line-color': this.options.lineColor,
          'line-width': this.options.lineWidth
        }
      })
    }

    // 临时线图层
    if (!this.map.getLayer('measure-temp-line')) {
      this.map.addLayer({
        id: 'measure-temp-line',
        type: 'line',
        source: 'measure-temp-line',
        paint: {
          'line-color': this.options.lineColor,
          'line-width': this.options.lineWidth,
          'line-dasharray': [2, 2]
        }
      })
    }

    // 测量点图层
    if (!this.map.getLayer('measure-points')) {
      this.map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'measure-points',
        paint: {
          'circle-color': this.options.pointColor,
          'circle-radius': this.options.pointRadius,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      })
    }

    // 测量标签图层
    if (!this.map.getLayer('measure-labels')) {
      this.map.addLayer({
        id: 'measure-labels',
        type: 'symbol',
        source: 'measure-labels',
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Regular'],
          'text-size': this.options.textSize,
          'text-anchor': 'center',
          'text-offset': [0, -1]
        },
        paint: {
          'text-color': this.options.textColor,
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      })
    }
  }

  /**
   * 设置键盘事件处理
   */
  private setupKeyboardHandler(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.cancelCurrentMeasure()
      } else if (e.key === 'Enter' && this.currentTool === 'area' && this.currentPoints.length >= 3) {
        this.finishAreaMeasure()
      }
    }
  }

  /**
   * 开始距离测量
   */
  startDistanceMeasure(): void {
    this.stopMeasure()
    this.currentTool = 'distance'
    this.isActive = true
    this.currentPoints = []
    this.currentMeasureId = this.generateId()
    
    this.map.getCanvas().style.cursor = 'crosshair'
    this.setupEventHandlers()
    
    // 添加键盘监听
    document.addEventListener('keydown', this.keyHandler!)
  }

  /**
   * 开始面积测量
   */
  startAreaMeasure(): void {
    this.stopMeasure()
    this.currentTool = 'area'
    this.isActive = true
    this.currentPoints = []
    this.currentMeasureId = this.generateId()
    
    this.map.getCanvas().style.cursor = 'crosshair'
    this.setupEventHandlers()
    
    // 添加键盘监听
    document.addEventListener('keydown', this.keyHandler!)
  }

  /**
   * 停止测量
   */
  stopMeasure(): void {
    this.isActive = false
    this.currentTool = null
    this.currentPoints = []
    this.currentMeasureId = null
    
    this.map.getCanvas().style.cursor = ''
    this.removeEventHandlers()
    this.clearTempLine()
    
    // 移除键盘监听
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler)
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    this.clickHandler = (e: mapboxgl.MapMouseEvent) => {
      this.handleMapClick(e)
    }
    
    this.mouseMoveHandler = (e: mapboxgl.MapMouseEvent) => {
      this.handleMouseMove(e)
    }
    
    this.dblClickHandler = (e: mapboxgl.MapMouseEvent) => {
      this.handleDoubleClick(e)
    }

    this.map.on('click', this.clickHandler)
    this.map.on('mousemove', this.mouseMoveHandler)
    this.map.on('dblclick', this.dblClickHandler)
  }

  /**
   * 移除事件处理器
   */
  private removeEventHandlers(): void {
    if (this.clickHandler) {
      this.map.off('click', this.clickHandler)
      this.clickHandler = null
    }
    
    if (this.mouseMoveHandler) {
      this.map.off('mousemove', this.mouseMoveHandler)
      this.mouseMoveHandler = null
    }
    
    if (this.dblClickHandler) {
      this.map.off('dblclick', this.dblClickHandler)
      this.dblClickHandler = null
    }
  }

  /**
   * 处理地图点击事件
   */
  private handleMapClick(e: mapboxgl.MapMouseEvent): void {
    if (!this.isActive || !this.currentMeasureId) return

    const point: MeasurePoint = {
      lng: e.lngLat.lng,
      lat: e.lngLat.lat
    }

    this.currentPoints.push(point)
    this.updatePointsDisplay()

    if (this.currentTool === 'distance') {
      // 距离测量支持连续多点，不自动结束
      if (this.currentPoints.length >= 2) {
        this.updateDistanceDisplay()
      }
    } else if (this.currentTool === 'area') {
      if (this.currentPoints.length >= 3) {
        this.updateAreaDisplay()
      }
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(e: mapboxgl.MapMouseEvent): void {
    if (!this.isActive || this.currentPoints.length === 0) return

    const currentPoint: MeasurePoint = {
      lng: e.lngLat.lng,
      lat: e.lngLat.lat
    }

    this.updateTempLine(currentPoint)
  }

  /**
   * 处理双击事件
   */
  private handleDoubleClick(e: mapboxgl.MapMouseEvent): void {
    e.preventDefault()
    
    if (this.currentTool === 'distance' && this.currentPoints.length >= 2) {
      this.finishDistanceMeasure()
    } else if (this.currentTool === 'area' && this.currentPoints.length >= 3) {
      this.finishAreaMeasure()
    }
  }

  /**
   * 更新距离显示
   */
  private updateDistanceDisplay(): void {
    if (this.currentPoints.length < 2) return

    const line = turf.lineString(this.currentPoints.map(p => [p.lng, p.lat]))
    
    // 添加或更新线条
    const source = this.map.getSource('measure-lines') as mapboxgl.GeoJSONSource
    const existingData = source._data as any
    const features = [...(existingData?.features || [])]
    
    const lineFeature = {
      ...line,
      properties: {
        id: this.currentMeasureId,
        type: 'distance'
      }
    }
    
    const existingIndex = features.findIndex((f: any) => f.properties.id === this.currentMeasureId)
    if (existingIndex >= 0) {
      features[existingIndex] = lineFeature
    } else {
      features.push(lineFeature)
    }
    
    source.setData({
      type: 'FeatureCollection',
      features
    })
  }

  /**
   * 更新临时线显示
   */
  private updateTempLine(currentPoint: MeasurePoint): void {
    if (this.currentPoints.length === 0) return

    const lastPoint = this.currentPoints[this.currentPoints.length - 1]
    const tempLineFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [lastPoint.lng, lastPoint.lat],
          [currentPoint.lng, currentPoint.lat]
        ]
      },
      properties: {}
    }

    const source = this.map.getSource('measure-temp-line') as mapboxgl.GeoJSONSource
    source.setData({
      type: 'FeatureCollection',
      features: [tempLineFeature]
    })
  }

  /**
   * 清除临时线
   */
  private clearTempLine(): void {
    const source = this.map.getSource('measure-temp-line') as mapboxgl.GeoJSONSource
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      })
    }
  }

  /**
   * 更新点显示
   */
  private updatePointsDisplay(): void {
    const features = this.currentPoints.map((point, index) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [point.lng, point.lat]
      },
      properties: {
        id: this.currentMeasureId,
        index
      }
    }))

    const source = this.map.getSource('measure-points') as mapboxgl.GeoJSONSource
    const existingData = source._data as any
    const allFeatures = [...(existingData?.features || []), ...features]
    
    source.setData({
      type: 'FeatureCollection',
      features: allFeatures
    })
  }

  /**
   * 完成距离测量
   */
  private finishDistanceMeasure(): void {
    if (this.currentPoints.length < 2 || !this.currentMeasureId) return

    const line = turf.lineString(this.currentPoints.map(p => [p.lng, p.lat]))
    const distance = turf.length(line, { units: 'kilometers' })
    
    let value: number
    let unit: string
    let label: string

    if (distance < 1) {
      value = distance * 1000
      unit = 'm'
      label = `${value.toFixed(this.options.precision)}m`
    } else {
      value = distance
      unit = 'km'
      label = `${value.toFixed(this.options.precision)}km`
    }

    const result: MeasureResult = {
      id: this.currentMeasureId,
      type: 'distance',
      points: [...this.currentPoints],
      value,
      unit,
      label,
      geojson: line
    }

    this.results.push(result)
    this.addLineToMap(result)
    this.addLabelToMap(result)
    this.stopMeasure()
  }

  /**
   * 更新面积显示
   */
  private updateAreaDisplay(): void {
    if (this.currentPoints.length < 3) return

    const coordinates = [...this.currentPoints.map(p => [p.lng, p.lat]), [this.currentPoints[0].lng, this.currentPoints[0].lat]]
    const polygon = turf.polygon([coordinates])
    
    const source = this.map.getSource('measure-polygons') as mapboxgl.GeoJSONSource
    const existingData = source._data as any
    const features = [...(existingData?.features || [])]
    
    // 更新或添加当前多边形
    const existingIndex = features.findIndex((f: any) => f.properties.id === this.currentMeasureId)
    const polygonFeature = {
      ...polygon,
      properties: {
        id: this.currentMeasureId,
        type: 'area'
      }
    }
    
    if (existingIndex >= 0) {
      features[existingIndex] = polygonFeature
    } else {
      features.push(polygonFeature)
    }
    
    source.setData({
      type: 'FeatureCollection',
      features
    })
  }

  /**
   * 完成面积测量
   */
  private finishAreaMeasure(): void {
    if (this.currentPoints.length < 3 || !this.currentMeasureId) return

    const coordinates = [...this.currentPoints.map(p => [p.lng, p.lat]), [this.currentPoints[0].lng, this.currentPoints[0].lat]]
    const polygon = turf.polygon([coordinates])
    const area = turf.area(polygon)
    
    let value: number
    let unit: string
    let label: string

    if (area < 10000) {
      value = area
      unit = 'm²'
      label = `${value.toFixed(this.options.precision)}m²`
    } else if (area < 1000000) {
      value = area / 10000
      unit = '公顷'
      label = `${value.toFixed(this.options.precision)}公顷`
    } else {
      value = area / 1000000
      unit = 'km²'
      label = `${value.toFixed(this.options.precision)}km²`
    }

    const result: MeasureResult = {
      id: this.currentMeasureId,
      type: 'area',
      points: [...this.currentPoints],
      value,
      unit,
      label,
      geojson: polygon
    }

    this.results.push(result)
    this.addLabelToMap(result)
    this.stopMeasure()
  }

  /**
   * 添加线到地图
   */
  private addLineToMap(result: MeasureResult): void {
    const source = this.map.getSource('measure-lines') as mapboxgl.GeoJSONSource
    const existingData = source._data as any
    const features = [...(existingData?.features || []), {
      ...result.geojson,
      properties: {
        id: result.id,
        type: result.type
      }
    }]
    
    source.setData({
      type: 'FeatureCollection',
      features
    })
  }

  /**
   * 添加标签到地图
   */
  private addLabelToMap(result: MeasureResult): void {
    if (!this.options.showTooltip) return

    let labelPoint: [number, number]
    
    if (result.type === 'distance') {
      // 距离标签放在线的中点
      const line = result.geojson
      const midpoint = turf.midpoint(
        turf.point(line.geometry.coordinates[0]),
        turf.point(line.geometry.coordinates[line.geometry.coordinates.length - 1])
      )
      labelPoint = midpoint.geometry.coordinates as [number, number]
    } else {
      // 面积标签放在质心
      const centroid = turf.centroid(result.geojson)
      labelPoint = centroid.geometry.coordinates as [number, number]
    }

    const labelFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: labelPoint
      },
      properties: {
        id: result.id,
        label: result.label,
        type: result.type
      }
    }

    const source = this.map.getSource('measure-labels') as mapboxgl.GeoJSONSource
    const existingData = source._data as any
    const features = [...(existingData?.features || []), labelFeature]
    
    source.setData({
      type: 'FeatureCollection',
      features
    })
  }

  /**
   * 取消当前测量
   */
  private cancelCurrentMeasure(): void {
    if (!this.isActive) return
    
    // 清除当前测量的点
    if (this.currentMeasureId) {
      this.removeMeasureById(this.currentMeasureId)
    }
    
    this.stopMeasure()
  }

  /**
   * 删除指定ID的测量结果
   */
  removeMeasureById(id: string): void {
    // 从结果数组中移除
    this.results = this.results.filter(result => result.id !== id)
    
    // 从各个数据源中移除相关要素
    this.removeFeatureFromSource('measure-points', id)
    this.removeFeatureFromSource('measure-lines', id)
    this.removeFeatureFromSource('measure-polygons', id)
    this.removeFeatureFromSource('measure-labels', id)
  }

  /**
   * 从数据源中移除要素
   */
  private removeFeatureFromSource(sourceName: string, id: string): void {
    const source = this.map.getSource(sourceName) as mapboxgl.GeoJSONSource
    if (!source) return
    
    const existingData = source._data as any
    if (!existingData?.features) return
    
    const filteredFeatures = existingData.features.filter((feature: any) => 
      feature.properties.id !== id
    )
    
    source.setData({
      type: 'FeatureCollection',
      features: filteredFeatures
    })
  }

  /**
   * 清除所有测量结果
   */
  clearAllMeasures(): void {
    this.stopMeasure()
    this.results = []
    
    // 清除所有数据源
    const sources = ['measure-points', 'measure-lines', 'measure-polygons', 'measure-labels', 'measure-temp-line']
    sources.forEach(sourceName => {
      const source = this.map.getSource(sourceName) as mapboxgl.GeoJSONSource
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: []
        })
      }
    })
  }

  /**
   * 获取所有测量结果
   */
  getAllResults(): MeasureResult[] {
    return [...this.results]
  }

  /**
   * 获取指定ID的测量结果
   */
  getResultById(id: string): MeasureResult | undefined {
    return this.results.find(result => result.id === id)
  }

  /**
   * 更新样式选项
   */
  updateOptions(newOptions: Partial<MeasureOptions>): void {
    this.options = { ...this.options, ...newOptions }
    this.updateLayerStyles()
  }

  /**
   * 更新图层样式
   */
  private updateLayerStyles(): void {
    // 更新线样式
    if (this.map.getLayer('measure-lines')) {
      this.map.setPaintProperty('measure-lines', 'line-color', this.options.lineColor)
      this.map.setPaintProperty('measure-lines', 'line-width', this.options.lineWidth)
    }
    
    if (this.map.getLayer('measure-temp-line')) {
      this.map.setPaintProperty('measure-temp-line', 'line-color', this.options.lineColor)
      this.map.setPaintProperty('measure-temp-line', 'line-width', this.options.lineWidth)
    }
    
    if (this.map.getLayer('measure-polygons-stroke')) {
      this.map.setPaintProperty('measure-polygons-stroke', 'line-color', this.options.lineColor)
      this.map.setPaintProperty('measure-polygons-stroke', 'line-width', this.options.lineWidth)
    }
    
    // 更新点样式
    if (this.map.getLayer('measure-points')) {
      this.map.setPaintProperty('measure-points', 'circle-color', this.options.pointColor)
      this.map.setPaintProperty('measure-points', 'circle-radius', this.options.pointRadius)
    }
    
    // 更新面样式
    if (this.map.getLayer('measure-polygons-fill')) {
      this.map.setPaintProperty('measure-polygons-fill', 'fill-color', this.options.fillColor)
      this.map.setPaintProperty('measure-polygons-fill', 'fill-opacity', this.options.fillOpacity)
    }
    
    // 更新文本样式
    if (this.map.getLayer('measure-labels')) {
      this.map.setPaintProperty('measure-labels', 'text-color', this.options.textColor)
      this.map.setLayoutProperty('measure-labels', 'text-size', this.options.textSize)
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `measure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁测量工具
   */
  destroy(): void {
    this.stopMeasure()
    this.clearAllMeasures()
    
    // 移除图层
    const layers = [
      'measure-labels',
      'measure-points', 
      'measure-temp-line',
      'measure-lines',
      'measure-polygons-stroke',
      'measure-polygons-fill'
    ]
    
    layers.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId)
      }
    })
    
    // 移除数据源
    const sources = ['measure-points', 'measure-lines', 'measure-polygons', 'measure-labels', 'measure-temp-line']
    sources.forEach(sourceId => {
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId)
      }
    })
  }
}

/**
 * 创建测量工具实例
 */
export function createMeasureTool(map: mapboxgl.Map, options?: MeasureOptions): MapboxMeasureTool {
  return new MapboxMeasureTool(map, options)
}

/**
 * 格式化距离显示
 */
export function formatDistance(distance: number, precision: number = 2): { value: number; unit: string; label: string } {
  if (distance < 1) {
    const value = distance * 1000
    return {
      value,
      unit: 'm',
      label: `${value.toFixed(precision)}m`
    }
  } else {
    return {
      value: distance,
      unit: 'km', 
      label: `${distance.toFixed(precision)}km`
    }
  }
}

/**
 * 格式化面积显示
 */
export function formatArea(area: number, precision: number = 2): { value: number; unit: string; label: string } {
  if (area < 10000) {
    return {
      value: area,
      unit: 'm²',
      label: `${area.toFixed(precision)}m²`
    }
  } else if (area < 1000000) {
    const value = area / 10000
    return {
      value,
      unit: '公顷',
      label: `${value.toFixed(precision)}公顷`
    }
  } else {
    const value = area / 1000000
    return {
      value,
      unit: 'km²',
      label: `${value.toFixed(precision)}km²`
    }
  }
}