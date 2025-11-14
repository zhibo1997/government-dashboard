/**
 * WFS服务模块
 * 处理GeoServer WFS数据查询
 */

export interface WFSQueryOptions {
  outputFormat?: string
  maxFeatures?: number
  srsName?: string
  bbox?: string
  cqlFilter?: string
  propertyName?: string
}

export interface WFSServiceConfig {
  baseUrl: string
  workspace?: string
  version?: string
}

/**
 * WFS服务类
 */
export class WFSService {
  private baseUrl: string
  private workspace: string
  private version: string

  constructor(config: WFSServiceConfig) {
    this.baseUrl = config.baseUrl
    this.workspace = config.workspace || ''
    this.version = config.version || '1.1.0'
  }

  /**
   * 查询要素数据
   * @param layerName - 图层名称
   * @param options - 查询选项
   * @returns Promise<GeoJSON>
   */
  async getFeatures(layerName: string, options: WFSQueryOptions = {}): Promise<any> {
    try {
      const {
        outputFormat = 'application/json',
        maxFeatures = 1000,
        srsName = 'EPSG:4326',
        bbox,
        cqlFilter,
        propertyName
      } = options

      // 添加工作空间前缀（如果有）
      const typeName = this.workspace ? `${this.workspace}:${layerName}` : layerName

      // 构建请求参数
      const params = new URLSearchParams({
        service: 'WFS',
        version: this.version,
        request: 'GetFeature',
        typeName,
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
      if (propertyName) {
        params.append('propertyName', propertyName)
      }

      const url = `${this.baseUrl}?${params.toString()}`
      console.log(`WFS查询: ${url}`)

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`WFS请求失败 (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      
      console.log(`WFS查询成功: ${data.features?.length || 0} 条数据`)
      
      return data
    } catch (error) {
      console.error('WFS查询失败:', error)
      throw error
    }
  }

  /**
   * 获取要素类型信息
   * @param typeName - 要素类型名称
   * @returns Promise<any>
   */
  async describeFeatureType(typeName: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        service: 'WFS',
        version: this.version,
        request: 'DescribeFeatureType',
        typeName: this.workspace ? `${this.workspace}:${typeName}` : typeName,
        outputFormat: 'application/json'
      })

      const url = `${this.baseUrl}?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`DescribeFeatureType请求失败: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('获取要素类型信息失败:', error)
      throw error
    }
  }

  /**
   * 获取WFS能力文档
   * @returns Promise<any>
   */
  async getCapabilities(): Promise<any> {
    try {
      const params = new URLSearchParams({
        service: 'WFS',
        version: this.version,
        request: 'GetCapabilities'
      })

      const url = `${this.baseUrl}?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`GetCapabilities请求失败: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error('获取WFS能力文档失败:', error)
      throw error
    }
  }

  /**
   * 按边界框查询
   * @param layerName - 图层名称
   * @param bbox - 边界框 [minX, minY, maxX, maxY]
   * @param srsName - 坐标系
   * @returns Promise<GeoJSON>
   */
  async getFeaturesByBBox(
    layerName: string,
    bbox: [number, number, number, number],
    srsName: string = 'EPSG:4326'
  ): Promise<any> {
    const bboxStr = `${bbox.join(',')},${srsName}`
    return this.getFeatures(layerName, { bbox: bboxStr, srsName })
  }

  /**
   * 按CQL过滤器查询
   * @param layerName - 图层名称
   * @param cqlFilter - CQL过滤表达式
   * @param options - 其他查询选项
   * @returns Promise<GeoJSON>
   */
  async getFeaturesByCQL(
    layerName: string,
    cqlFilter: string,
    options: WFSQueryOptions = {}
  ): Promise<any> {
    return this.getFeatures(layerName, { ...options, cqlFilter })
  }
}

/**
 * 创建WFS服务实例
 * @param config - 服务配置
 * @returns WFSService实例
 */
export function createWFSService(config: WFSServiceConfig): WFSService {
  return new WFSService(config)
}

// 导出默认的GeoServer WFS服务实例
export const geoServerWFS = createWFSService({
  baseUrl: 'http://map4.cityfun.com.cn/geoserver/wfs',
  workspace: 'CSSMX_ZT'
})
