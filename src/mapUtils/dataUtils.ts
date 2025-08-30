import type { POIMarker, BoundingBox, CacheStats } from '@/types'

/**
 * 地图数据处理工具类
 * 提供GeoJSON数据加载、POI数据处理等功能
 */
export class DataUtils {
  private cache: Map<string, any> = new Map()

  /**
   * 加载GeoJSON数据
   * @param url - 数据URL
   * @param useCache - 是否使用缓存
   * @returns Promise<Object>
   */
  public async loadGeoJsonData(url: string, useCache: boolean = true): Promise<any> {
    if (useCache && this.cache.has(url)) {
      return this.cache.get(url)
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (useCache) {
        this.cache.set(url, data)
      }
      
      return data
    } catch (error) {
      console.error('加载GeoJSON数据失败:', error)
      throw error
    }
  }

  /**
   * 处理POI数据
   * @param rawData - 原始POI数据
   * @returns 处理后的POI数据
   */
  public processPOIData(rawData: any[]): POIMarker[] {
    return rawData.map(item => ({
      id: item.id || `poi_${Date.now()}_${Math.random()}`,
      name: item.name || '未命名',
      longitude: parseFloat(item.longitude || item.lng || item.lon),
      latitude: parseFloat(item.latitude || item.lat),
      type: item.type || 'default',
      description: item.description || '',
      icon: this.getPOIIcon(item.type),
      properties: {
        ...item,
        displayName: item.name || '未命名',
        category: item.category || '其他'
      }
    }))
  }

  /**
   * 根据POI类型获取图标
   * @param type - POI类型
   * @returns 图标路径
   */
  public getPOIIcon(type: string): string {
    const iconMap: Record<string, string> = {
      government: '/icons/government.svg',
      school: '/icons/school.svg',
      hospital: '/icons/hospital.svg',
      park: '/icons/park.svg',
      shopping: '/icons/shopping.svg',
      restaurant: '/icons/restaurant.svg',
      hotel: '/icons/hotel.svg',
      transport: '/icons/transport.svg',
      default: '/icons/poi-marker.svg'
    }
    
    return iconMap[type] || iconMap.default
  }

  /**
   * 验证坐标有效性
   * @param longitude - 经度
   * @param latitude - 纬度
   * @returns 是否有效
   */
  public validateCoordinates(longitude: number, latitude: number): boolean {
    return (
      typeof longitude === 'number' &&
      typeof latitude === 'number' &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90 &&
      !isNaN(longitude) &&
      !isNaN(latitude)
    )
  }

  /**
   * 过滤有效的POI数据
   * @param pois - POI数据数组
   * @returns 有效的POI数据
   */
  public filterValidPOIs(pois: POIMarker[]): POIMarker[] {
    return pois.filter(poi => 
      this.validateCoordinates(poi.longitude, poi.latitude)
    )
  }

  /**
   * 按类型分组POI数据
   * @param pois - POI数据数组
   * @returns 按类型分组的POI数据
   */
  public groupPOIsByType(pois: POIMarker[]): Record<string, POIMarker[]> {
    return pois.reduce((groups, poi) => {
      const type = poi.type || 'default'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(poi)
      return groups
    }, {} as Record<string, POIMarker[]>)
  }

  /**
   * 计算POI数据的边界框
   * @param pois - POI数据数组
   * @returns 边界框
   */
  public calculatePOIBounds(pois: POIMarker[]): BoundingBox | null {
    if (pois.length === 0) return null

    const validPOIs = this.filterValidPOIs(pois)
    if (validPOIs.length === 0) return null

    let west = validPOIs[0].longitude
    let east = validPOIs[0].longitude
    let south = validPOIs[0].latitude
    let north = validPOIs[0].latitude

    validPOIs.forEach(poi => {
      west = Math.min(west, poi.longitude)
      east = Math.max(east, poi.longitude)
      south = Math.min(south, poi.latitude)
      north = Math.max(north, poi.latitude)
    })

    return { west, south, east, north }
  }

  /**
   * 格式化GeoJSON数据
   * @param geoJson - 原始GeoJSON数据
   * @returns 格式化后的GeoJSON数据
   */
  public formatGeoJsonData(geoJson: any): any {
    if (!geoJson || typeof geoJson !== 'object') {
      throw new Error('Invalid GeoJSON data')
    }

    // 确保有必要的属性
    const formatted = {
      type: geoJson.type || 'FeatureCollection',
      features: geoJson.features || []
    }

    // 验证和清理features
    formatted.features = formatted.features.filter((feature: any) => {
      return feature && 
             feature.type === 'Feature' && 
             feature.geometry && 
             feature.geometry.coordinates
    })

    return formatted
  }

  /**
   * 提取GeoJSON数据的边界框
   * @param geoJson - GeoJSON数据
   * @returns 边界框
   */
  public extractGeoJsonBounds(geoJson: any): BoundingBox | null {
    if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
      return null
    }

    let west = Infinity
    let east = -Infinity
    let south = Infinity
    let north = -Infinity

    const processCoordinates = (coords: any): void => {
      if (Array.isArray(coords[0])) {
        coords.forEach(processCoordinates)
      } else {
        const [lng, lat] = coords
        if (typeof lng === 'number' && typeof lat === 'number') {
          west = Math.min(west, lng)
          east = Math.max(east, lng)
          south = Math.min(south, lat)
          north = Math.max(north, lat)
        }
      }
    }

    geoJson.features.forEach((feature: any) => {
      if (feature.geometry && feature.geometry.coordinates) {
        processCoordinates(feature.geometry.coordinates)
      }
    })

    if (west === Infinity || east === -Infinity || south === Infinity || north === -Infinity) {
      return null
    }

    return { west, south, east, north }
  }

  /**
   * 清除缓存
   * @param url - 要清除的URL，如果不提供则清除所有缓存
   */
  public clearCache(url?: string): void {
    if (url) {
      this.cache.delete(url)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  public getCacheStats(): CacheStats {
    const keys = Array.from(this.cache.keys())
    const totalMemory = JSON.stringify(Array.from(this.cache.values())).length
    
    return {
      size: this.cache.size,
      keys,
      totalMemory
    }
  }
}

// 导出单例实例
export const dataUtils = new DataUtils()