import { get } from '@/utils/request'
import type { LayerService, LayerTreeNode, ApiResponse } from '@/types'

/**
 * 图层服务类
 * 提供图层数据加载和管理功能
 */
export class LayerService {
  private static instance: LayerService
  private layerCache: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): LayerService {
    if (!LayerService.instance) {
      LayerService.instance = new LayerService()
    }
    return LayerService.instance
  }

  /**
   * 获取预定义的图层服务配置
   */
  public getLayerServices(): LayerService[] {
    return [
      {
        id: 'manhole-covers',
        name: '井盖',
        url: 'http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_manholecoverbasetinfo.json',
        type: 'geojson',
        description: '城市井盖分布数据',
        properties: {
          icon: 'icon-manhole',
          color: '#1677ff',
          category: 'infrastructure'
        }
      },
      {
        id: 'bridges',
        name: '桥梁',
        url: 'http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_bridgebscinfo.json',
        type: 'geojson',
        description: '城市桥梁分布数据',
        properties: {
          icon: 'icon-bridge',
          color: '#52c41a',
          category: 'infrastructure'
        }
      }
    ]
  }

  /**
   * 生成图层树节点
   */
  public generateLayerTree(): LayerTreeNode[] {
    const services = this.getLayerServices()
    
    return [
      {
        id: 'infrastructure',
        name: '基础设施',
        type: 'group',
        visible: true,
        children: services.map(service => ({
          id: service.id,
          name: service.name,
          type: 'layer' as const,
          visible: false,
          url: service.url,
          layerType: service.type,
          opacity: 1.0,
          properties: service.properties
        }))
      }
    ]
  }

  /**
   * 加载图层数据
   * @param layerId 图层ID
   * @param url 数据URL
   * @returns Promise<any> 图层数据
   */
  public async loadLayerData(layerId: string, url: string): Promise<any> {
    try {
      // 检查缓存
      if (this.layerCache.has(layerId)) {
        return this.layerCache.get(layerId)
      }

      // 加载数据
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 缓存数据
      this.layerCache.set(layerId, data)
      
      return data
    } catch (error) {
      console.error(`Failed to load layer data for ${layerId}:`, error)
      throw error
    }
  }

  /**
   * 获取井盖数据
   */
  public async getManholeCoverData(): Promise<any> {
    const service = this.getLayerServices().find(s => s.id === 'manhole-covers')
    if (!service) {
      throw new Error('Manhole cover service not found')
    }
    return this.loadLayerData(service.id, service.url)
  }

  /**
   * 获取桥梁数据
   */
  public async getBridgeData(): Promise<any> {
    const service = this.getLayerServices().find(s => s.id === 'bridges')
    if (!service) {
      throw new Error('Bridge service not found')
    }
    return this.loadLayerData(service.id, service.url)
  }

  /**
   * 预加载所有图层数据
   */
  public async preloadAllLayers(): Promise<void> {
    const services = this.getLayerServices()
    const promises = services.map(service => 
      this.loadLayerData(service.id, service.url).catch(error => {
        console.warn(`Failed to preload layer ${service.id}:`, error)
        return null
      })
    )
    
    await Promise.all(promises)
  }

  /**
   * 清除图层缓存
   * @param layerId 可选的图层ID，不提供则清除所有缓存
   */
  public clearCache(layerId?: string): void {
    if (layerId) {
      this.layerCache.delete(layerId)
    } else {
      this.layerCache.clear()
    }
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.layerCache.size,
      keys: Array.from(this.layerCache.keys())
    }
  }

  /**
   * 验证图层数据格式
   * @param data 图层数据
   * @returns boolean 是否为有效的GeoJSON格式
   */
  public validateGeoJsonData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 检查基本GeoJSON结构
    if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
      return false
    }

    // 检查FeatureCollection
    if (data.type === 'FeatureCollection') {
      return Array.isArray(data.features)
    }

    // 检查Feature
    if (data.type === 'Feature') {
      return data.geometry && data.properties
    }

    return false
  }

  /**
   * 处理图层数据错误
   * @param error 错误对象
   * @param layerId 图层ID
   */
  public handleLayerError(error: any, layerId: string): string {
    let errorMessage = '图层加载失败'
    
    if (error.message) {
      if (error.message.includes('404')) {
        errorMessage = `图层数据不存在: ${layerId}`
      } else if (error.message.includes('timeout')) {
        errorMessage = `图层加载超时: ${layerId}`
      } else if (error.message.includes('network')) {
        errorMessage = `网络连接错误: ${layerId}`
      } else {
        errorMessage = `图层加载错误: ${error.message}`
      }
    }
    
    console.error(`Layer error for ${layerId}:`, error)
    return errorMessage
  }
}

// 导出单例实例
export const layerService = LayerService.getInstance()