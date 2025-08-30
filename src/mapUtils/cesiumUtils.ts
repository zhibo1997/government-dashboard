import * as Cesium from 'cesium'
import type { 
  Coordinates, 
  POIMarker, 
  CesiumViewerOptions, 
  GeoJsonLoadOptions,
  MeasureResult,
  ViewMode
} from '@/types'

/**
 * Cesium 地图工具类
 * 提供地图初始化、数据加载、测量等功能
 */
export class CesiumUtils {
  public viewer: Cesium.Viewer | null = null
  private measureHandler: Cesium.ScreenSpaceEventHandler | null = null
  private activePoints: Cesium.Cartesian3[] = []

  /**
   * 初始化 Cesium Viewer
   * @param containerId - 容器ID
   * @param options - 配置选项
   * @returns Cesium.Viewer实例
   */
  public initViewer(containerId: string, options: CesiumViewerOptions = {}): Cesium.Viewer {
    const defaultOptions: CesiumViewerOptions = {
      timeline: false,
      animation: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      ...options
    }

    this.viewer = new Cesium.Viewer(containerId, defaultOptions)
    
    // 移除默认底图
    this.viewer.imageryLayers.removeAll()
    
    // 添加天地图底图
    this.addTiandituLayers()
    
    // 设置初始相机位置（信阳县）
    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(114.0, 32.1, 100000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      }
    })
    
    // 禁用双击事件
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    
    return this.viewer
  }

  /**
   * 添加天地图图层
   */
  private addTiandituLayers(): void {
    if (!this.viewer) return
    
    const tiandituKey = import.meta.env.VITE_TIANDITU_KEY as string
    
    // 天地图影像底图
    const imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=${tiandituKey}`,
      layer: 'img',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'w',
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      maximumLevel: 18
    })
    
    // 天地图标注图层
    const labelProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=${tiandituKey}`,
      layer: 'cia',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'w',
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      maximumLevel: 18
    })
    
    this.viewer.imageryLayers.addImageryProvider(imageryProvider)
    this.viewer.imageryLayers.addImageryProvider(labelProvider)
  }

  /**
   * 加载 GeoJSON 数据
   * @param url - GeoJSON文件路径
   * @param options - 样式选项
   * @returns Promise<Cesium.GeoJsonDataSource>
   */
  public async loadGeoJson(url: string, options: GeoJsonLoadOptions = {}): Promise<Cesium.GeoJsonDataSource> {
    if (!this.viewer) {
      throw new Error('Viewer not initialized')
    }

    try {
      const dataSource = await Cesium.GeoJsonDataSource.load(url, {
        stroke: Cesium.Color.fromCssColorString(options.stroke || '#ffff00'),
        strokeWidth: options.strokeWidth || 2,
        fill: Cesium.Color.fromCssColorString(options.fill || '#ffff00').withAlpha(0.5),
        clampToGround: options.clampToGround !== false
      })
      
      this.viewer.dataSources.add(dataSource)
      return dataSource
    } catch (error) {
      console.error('加载GeoJSON失败:', error)
      throw error
    }
  }

  /**
   * 添加POI标记
   * @param pois - POI数据数组
   */
  public addPOIMarkers(pois: POIMarker[]): void {
    if (!this.viewer) return

    pois.forEach(poi => {
      if (typeof poi.longitude !== 'number' || typeof poi.latitude !== 'number') {
        console.warn('Invalid POI coordinates:', poi)
        return
      }

      this.viewer!.entities.add({
        id: poi.id,
        position: Cesium.Cartesian3.fromDegrees(poi.longitude, poi.latitude),
        billboard: {
          image: poi.icon || '/icons/poi-marker.svg',
          width: 32,
          height: 32,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: poi.name,
          font: '14pt sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -50),
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE
        },
        properties: poi.properties
      })
    })
  }

  /**
   * 切换视图模式
   * @param mode - 视图模式
   */
  public switchViewMode(mode: ViewMode): void {
    if (!this.viewer) return

    if (mode === '2D') {
      this.viewer.scene.morphTo2D(1.0)
    } else {
      this.viewer.scene.morphTo3D(1.0)
    }
  }

  /**
   * 飞行到指定位置
   * @param longitude - 经度
   * @param latitude - 纬度
   * @param height - 高度
   * @param duration - 飞行时间（秒）
   */
  public flyTo(longitude: number, latitude: number, height: number = 10000, duration: number = 2): void {
    if (!this.viewer) return

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      duration
    })
  }

  /**
   * 开始距离测量
   * @param callback - 测量结果回调
   */
  public startDistanceMeasure(callback?: (result: MeasureResult) => void): void {
    if (!this.viewer) return

    this.clearMeasureHandler()
    this.activePoints = []
    
    this.measureHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    
    this.measureHandler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedPosition = this.viewer!.camera.pickEllipsoid(event.position, this.viewer!.scene.globe.ellipsoid)
      
      if (pickedPosition) {
        this.activePoints.push(pickedPosition)
        
        if (this.activePoints.length === 1) {
          // 第一个点，添加起点标记
          this.viewer!.entities.add({
            position: pickedPosition,
            point: {
              pixelSize: 10,
              color: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2
            }
          })
        } else if (this.activePoints.length === 2) {
          // 第二个点，计算距离并添加线段
          const distance = Cesium.Cartesian3.distance(this.activePoints[0], this.activePoints[1])
          
          this.viewer!.entities.add({
            position: pickedPosition,
            point: {
              pixelSize: 10,
              color: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2
            }
          })
          
          this.viewer!.entities.add({
            polyline: {
              positions: this.activePoints,
              width: 3,
              material: Cesium.Color.YELLOW
            }
          })
          
          const result: MeasureResult = {
            id: Date.now(),
            type: 'distance',
            value: distance,
            unit: 'm',
            timestamp: new Date()
          }
          
          if (callback) {
            callback(result)
          }
          
          this.clearMeasureHandler()
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /**
   * 开始面积测量
   * @param callback - 测量结果回调
   */
  public startAreaMeasure(callback?: (result: MeasureResult) => void): void {
    if (!this.viewer) return

    this.clearMeasureHandler()
    this.activePoints = []
    
    this.measureHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    
    this.measureHandler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedPosition = this.viewer!.camera.pickEllipsoid(event.position, this.viewer!.scene.globe.ellipsoid)
      
      if (pickedPosition) {
        this.activePoints.push(pickedPosition)
        
        this.viewer!.entities.add({
          position: pickedPosition,
          point: {
            pixelSize: 8,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
          }
        })
        
        if (this.activePoints.length > 2) {
          this.updateAreaPolygon()
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    
    this.measureHandler.setInputAction(() => {
      if (this.activePoints.length > 2) {
        const area = this.calculatePolygonArea(this.activePoints)
        
        const result: MeasureResult = {
          id: Date.now(),
          type: 'area',
          value: area,
          unit: 'm²',
          timestamp: new Date()
        }
        
        if (callback) {
          callback(result)
        }
      }
      
      this.clearMeasureHandler()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  /**
   * 更新面积测量多边形
   */
  private updateAreaPolygon(): void {
    if (!this.viewer || this.activePoints.length < 3) return

    // 移除之前的多边形
    const entities = this.viewer.entities.values
    for (let i = entities.length - 1; i >= 0; i--) {
      if (entities[i].polygon) {
        this.viewer.entities.remove(entities[i])
      }
    }
    
    // 添加新的多边形
    this.viewer.entities.add({
      polygon: {
        hierarchy: this.activePoints,
        material: Cesium.Color.RED.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.RED
      }
    })
  }

  /**
   * 计算多边形面积
   * @param positions - 多边形顶点位置数组
   * @returns 面积（平方米）
   */
  private calculatePolygonArea(positions: Cesium.Cartesian3[]): number {
    if (positions.length < 3) return 0

    // 将笛卡尔坐标转换为地理坐标
    const coordinates = positions.map(position => {
      const cartographic = Cesium.Cartographic.fromCartesian(position)
      return {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude)
      }
    })

    // 使用球面几何计算面积
    let area = 0
    const earthRadius = 6371000 // 地球半径（米）

    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length
      const xi = coordinates[i].longitude * Math.PI / 180
      const yi = coordinates[i].latitude * Math.PI / 180
      const xj = coordinates[j].longitude * Math.PI / 180
      const yj = coordinates[j].latitude * Math.PI / 180

      area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj))
    }

    area = Math.abs(area) * earthRadius * earthRadius / 2
    return area
  }

  /**
   * 清除测量结果
   */
  public clearMeasure(): void {
    if (!this.viewer) return

    // 清除所有测量相关的实体
    const entities = this.viewer.entities.values
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i]
      if (entity.point || entity.polyline || entity.polygon) {
        this.viewer.entities.remove(entity)
      }
    }
    
    this.activePoints = []
    this.clearMeasureHandler()
  }

  /**
   * 清除测量事件处理器
   */
  private clearMeasureHandler(): void {
    if (this.measureHandler) {
      this.measureHandler.destroy()
      this.measureHandler = null
    }
  }

  /**
   * 加载自定义图层数据
   * @param layerId - 图层ID
   * @param url - 数据源URL
   * @param options - 样式选项
   * @returns Promise<Cesium.GeoJsonDataSource>
   */
  public async loadCustomLayer(layerId: string, url: string, options: GeoJsonLoadOptions = {}): Promise<Cesium.GeoJsonDataSource> {
    if (!this.viewer) {
      throw new Error('Viewer not initialized')
    }

    try {
      const dataSource = await Cesium.GeoJsonDataSource.load(url, {
        stroke: Cesium.Color.fromCssColorString(options.stroke || '#1677ff'),
        strokeWidth: options.strokeWidth || 2,
        fill: Cesium.Color.fromCssColorString(options.fill || '#1677ff').withAlpha(0.3),
        clampToGround: options.clampToGround !== false
      })
      
      // 设置图层ID用于后续管理
      dataSource.name = layerId
      
      this.viewer.dataSources.add(dataSource)
      return dataSource
    } catch (error) {
      console.error(`加载图层 ${layerId} 失败:`, error)
      throw error
    }
  }

  /**
   * 移除自定义图层
   * @param layerId - 图层ID
   */
  public removeCustomLayer(layerId: string): void {
    if (!this.viewer) return

    const dataSource = this.viewer.dataSources.getByName(layerId)[0]
    if (dataSource) {
      this.viewer.dataSources.remove(dataSource)
    }
  }

  /**
   * 设置图层可见性
   * @param layerId - 图层ID
   * @param visible - 是否可见
   */
  public setLayerVisibility(layerId: string, visible: boolean): void {
    if (!this.viewer) return

    const dataSource = this.viewer.dataSources.getByName(layerId)[0]
    if (dataSource) {
      dataSource.show = visible
    }
  }

  /**
   * 设置图层透明度
   * @param layerId - 图层ID
   * @param opacity - 透明度 (0-1)
   */
  public setLayerOpacity(layerId: string, opacity: number): void {
    if (!this.viewer) return

    const dataSource = this.viewer.dataSources.getByName(layerId)[0]
    if (dataSource && dataSource.entities) {
      dataSource.entities.values.forEach(entity => {
        // 设置点样式透明度
        if (entity.point) {
          const color = entity.point.color?.getValue(Cesium.JulianDate.now())
          if (color) {
            entity.point.color = color.withAlpha(opacity)
          }
        }
        
        // 设置线样式透明度
        if (entity.polyline) {
          const material = entity.polyline.material
          if (material && Cesium.defined(material.color)) {
            const color = material.color.getValue(Cesium.JulianDate.now())
            if (color) {
              entity.polyline.material = color.withAlpha(opacity)
            }
          }
        }
        
        // 设置面样式透明度
        if (entity.polygon) {
          const material = entity.polygon.material
          if (material && Cesium.defined(material.color)) {
            const color = material.color.getValue(Cesium.JulianDate.now())
            if (color) {
              entity.polygon.material = color.withAlpha(opacity)
            }
          }
        }
      })
    }
  }

  /**
   * 获取图层数据源
   * @param layerId - 图层ID
   * @returns Cesium.GeoJsonDataSource | undefined
   */
  public getLayerDataSource(layerId: string): Cesium.GeoJsonDataSource | undefined {
    if (!this.viewer) return undefined

    return this.viewer.dataSources.getByName(layerId)[0] as Cesium.GeoJsonDataSource
  }

  /**
   * 飞行到图层范围
   * @param layerId - 图层ID
   */
  public flyToLayer(layerId: string): void {
    if (!this.viewer) return

    const dataSource = this.viewer.dataSources.getByName(layerId)[0]
    if (dataSource) {
      this.viewer.flyTo(dataSource)
    }
  }

  /**
   * 清除所有自定义图层
   */
  public clearCustomLayers(): void {
    if (!this.viewer) return

    // 保留基础图层，只清除自定义图层
    const dataSourcesToRemove = this.viewer.dataSources.values.filter(ds => 
      ds.name && ds.name !== 'default'
    )
    
    dataSourcesToRemove.forEach(ds => {
      this.viewer!.dataSources.remove(ds)
    })
  }

  /**
   * 清除所有数据
   */
  public clearAllData(): void {
    if (!this.viewer) return

    this.viewer.entities.removeAll()
    this.viewer.dataSources.removeAll()
    this.clearMeasureHandler()
    this.activePoints = []
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.clearMeasureHandler()
    
    if (this.viewer) {
      this.viewer.destroy()
      this.viewer = null
    }
    
    this.activePoints = []
  }
}

// 导出单例实例
export const cesiumUtils = new CesiumUtils()