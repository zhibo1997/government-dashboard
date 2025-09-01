// 基础类型定义

// 坐标类型
export interface Coordinates {
  longitude: number
  latitude: number
  height?: number
}

// POI 标记类型
export interface POIMarker {
  id: string
  name: string
  longitude: number
  latitude: number
  type: string
  description?: string
  icon?: string
  properties?: Record<string, any>
}

// 测量结果类型
export interface MeasureResult {
  id: number
  type: 'distance' | 'area' | 'height'
  value: number
  unit: string
  timestamp: Date
}

// 地图状态类型
export interface MapState {
  isInitialized: boolean
  isLoading: boolean
  viewMode: '2D' | '3D' | 'Columbus'
  isFullscreen: boolean
}

// 图层状态类型
export interface LayerState {
  satellite: boolean
  terrain: boolean
  labels: boolean
  baseMap: string
  customLayers: Record<string, boolean>
}

// 测量工具状态类型
export interface MeasureState {
  isActive: boolean
  currentTool: 'distance' | 'area' | 'height' | null
  results: MeasureResult[]
}

// POI 状态类型
export interface POIState {
  markers: POIMarker[]
  selectedMarker: POIMarker | null
  showInfoWindow: boolean
}

// GeoJSON 状态类型
export interface GeoJsonState {
  dataSources: any[]
  isLoading: boolean
  error: string | null
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  data: T
  info?: string
  message?: string
}

// 登录请求类型
export interface LoginRequest {
  username: string
  password: string
  code?: string
  uuid?: string
}

// 用户信息类型
export interface UserInfo {
  id: string
  username: string
  name?: string
  email?: string
  roles?: string[]
}

// 认证状态类型
export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: UserInfo | null
}

// API 相关类型定义

// 公钥响应类型
export interface PublicKeyResponse {
  publicKey: string
  keyId?: string
  algorithm?: string
}

// 登录响应类型
export interface LoginResponse {
  token: string
  refreshToken?: string
  user: UserInfo
  expiresIn?: number
}

// 登录请求参数类型
export interface LoginParams {
  account: string
  password: string
  code?: string
  uuid?: string
}

// GeoJSON 加载选项
export interface GeoJsonLoadOptions {
  stroke?: string
  strokeWidth?: number
  fill?: string
  clampToGround?: boolean
}

// 缓存统计类型
export interface CacheStats {
  size: number
  keys: string[]
  totalMemory: number
}

// 边界框类型
export interface BoundingBox {
  west: number
  south: number
  east: number
  north: number
}

// 工具类型
// 图层树相关类型
export interface LayerTreeNode {
  id: string
  name: string
  type: 'group' | 'layer'
  visible: boolean
  children?: LayerTreeNode[]
  url?: string
  layerType?: 'geojson' | 'imagery' | 'terrain' | 'tileset'
  opacity?: number
  properties?: Record<string, any>
}

export interface LayerTreeState {
  nodes: LayerTreeNode[]
  expandedNodes: Set<string>
  selectedNode: string | null
}

export interface LayerService {
  id: string
  name: string
  url: string
  type: 'geojson' | 'imagery' | 'terrain' | 'tileset'
  description?: string
  properties?: Record<string, any>
}

export type MapTool = 'pan' | 'identify' | 'draw' | 'measure' | 'clear'
export type ViewMode = '2D' | '3D'
export type MeasureType = 'distance' | 'area' | 'height'