/*
 * @Author: Do not edit
 * @Date: 2025-11-04 21:08:01
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-05 19:55:11
 * @Description: 
 */


import MVTImageryProvider from 'mvt-imagery-provider'
/**
 * Cesium地图工具类
 * @description 基于vue-cesium实现的地图工具函数集合
 * @module cesiumUtils
 */
export const cesiumUtils = {
  /**
   * 初始化Cesium地图
   * @param containerId - 容器ID
   * @returns Cesium Viewer实例
   */
  initViewer(containerId: string): Promise<any> {
    // 这里将实现Cesium Viewer的初始化逻辑
    console.log(`初始化Cesium地图，容器ID: ${containerId}`)
    // 实际实现将在后续步骤中完成
    return Promise.resolve({})
  },

  /**
   * 切换底图
   * @param viewer - Cesium Viewer实例
   * @param type - 底图类型: 'vec'(矢量)、'img'(影像)、'ter'(地形)
   */
  switchBaseMap(viewer: any, type: 'vec' | 'img' | 'ter' = 'vec'): void {
    console.log(`切换底图类型: ${type}`)
    // 实际实现将在后续步骤中完成
  },

  /**
   * 加载GeoJSON数据
   * @param viewer - Cesium Viewer实例
   * @param sourceId - 数据源ID
   * @param data - GeoJSON数据
   * @param options - 加载选项
   */
  async loadGeoJSON(
    viewer: any,
    sourceId: string,
    data: any,
    options: {
      strokeColor?: string
      strokeWidth?: number
      fillColor?: string
      fillOpacity?: number
    } = {}
  ): Promise<void> {
    console.log(`加载GeoJSON数据源: ${sourceId}`)
    // 实际实现将在后续步骤中完成
  },

  /**
   * 添加POI标注
   * @param viewer - Cesium Viewer实例
   * @param poiData - POI数据数组
   */
  addPOIMarkers(viewer: any, poiData: any[]): void {
    console.log(`添加 ${poiData.length} 个POI标注`)
    // 实际实现将在后续步骤中完成
  },

  /**
   * 切换图层可见性
   * @param viewer - Cesium Viewer实例
   * @param layerName - 图层名称
   * @param visible - 是否可见
   */
  toggleLayerVisibility(viewer: any, layerName: string, visible: boolean): void {
    console.log(`设置图层 ${layerName} 可见性: ${visible}`)
    // 实际实现将在后续步骤中完成
  },

  /**
   * 创建简化的天地图样式
   * @param type - 底图类型: 'vec'(矢量)、'img'(影像)、'ter'(地形)
   * @returns 天地图样式配置
   */
  createSimpleTiandituStyle(type: 'vec' | 'img' | 'ter' = 'vec') {
    console.log(`创建天地图样式，类型: ${type}`)
    // 实际实现将在后续步骤中完成
    return {}
  },

  /**
   * 加载MVT矢量瓦片图层
   * @param viewer - Cesium Viewer实例
   * @param styleUrl - 样式文件URL (如: '/style.json')
   * @returns Promise<MVTImageryProvider>
   */
  async loadMVTLayer(
    viewer: any,
    styleUrl: string,
  ): Promise<any> {
    try {
      console.log(`开始加载MVT图层，样式URL: ${styleUrl}`)

      // 创建MVT Imagery Provider
      const provider = await MVTImageryProvider.fromUrl(styleUrl)

      // 将图层添加到viewer的imageryLayers中
      if (viewer && viewer.imageryLayers) {
        viewer.imageryLayers.addImageryProvider(provider)
        console.log('MVT图层加载成功')
      } else {
        throw new Error('Viewer或imageryLayers不可用')
      }

      return provider
    } catch (error) {
      console.error('加载MVT图层失败:', error)
      throw new Error(`Failed to load MVT layer: ${error}`)
    }
  },

  /**
   * 查询WFS服务数据
   * @param baseUrl - GeoServer WFS服务基础URL
   * @param layerName - 图层名称
   * @param options - 查询选项
   * @returns Promise<GeoJSON>
   */
  async queryWFSData(
    baseUrl: string,
    layerName: string,
    options: {
      outputFormat?: string
      maxFeatures?: number
      srsName?: string
      bbox?: string
      cqlFilter?: string
    } = {}
  ): Promise<any> {
    try {
      const {
        outputFormat = 'application/json',
        maxFeatures = 1000,
        srsName = 'EPSG:4326',
        bbox,
        cqlFilter
      } = options

      // 构建WFS请求参数
      const params = new URLSearchParams({
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: layerName,
        outputFormat,
        maxFeatures: maxFeatures.toString(),
        srsName
      })

      // 添加可选参数
      if (bbox) {
        params.append('bbox', bbox)
      }
      if (cqlFilter) {
        params.append('cql_filter', cqlFilter)
      }

      const url = `${baseUrl}?${params.toString()}`
      console.log(`查询WFS数据: ${url}`)

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`WFS数据查询成功，共 ${data.features?.length || 0} 条数据`)
      
      return data
    } catch (error) {
      console.error('WFS数据查询失败:', error)
      throw error
    }
  },

  /**
   * 将WFS点数据添加到地图
   * @param viewer - Cesium Viewer实例
   * @param geoJsonData - GeoJSON数据
   * @param options - 显示选项
   * @returns 数据源对象
   */
  async addWFSPointsToMap(
    viewer: any,
    geoJsonData: any,
    options: {
      markerColor?: string
      markerSymbol?: string
      markerSize?: number
      clampToGround?: boolean
    } = {}
  ): Promise<any> {
    try {
      const Cesium = (window as any).Cesium
      if (!Cesium) {
        throw new Error('Cesium未加载')
      }

      const {
        markerColor = '#1677ff',
        markerSymbol = 'circle',
        markerSize = 10,
        clampToGround = true
      } = options

      // 创建GeoJSON数据源
      const dataSource = await Cesium.GeoJsonDataSource.load(geoJsonData, {
        clampToGround,
        markerColor: Cesium.Color.fromCssColorString(markerColor),
        markerSize
      })

      // 添加到viewer
      viewer.dataSources.add(dataSource)

      console.log(`成功添加 ${geoJsonData.features?.length || 0} 个点要素到地图`)
      
      return dataSource
    } catch (error) {
      console.error('添加WFS点数据到地图失败:', error)
      throw error
    }
  }
}

export default cesiumUtils