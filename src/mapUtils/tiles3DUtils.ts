/**
 * 3D Tiles 工具模块
 * @description 基于 MapLibre GL + deck.gl 实现 3D Tiles 数据加载与管理
 * @module tiles3DUtils
 */
import type { Map as MapLibreMap } from "maplibre-gl";
import { MapboxOverlay as DeckOverlay } from "@deck.gl/mapbox";
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";

/**
 * 3D Tiles 图层配置选项
 */
export interface Tiles3DLayerOptions {
  /** 图层唯一标识 */
  id: string;
  /** 图层显示名称 */
  name?: string;
  /** tileset.json 文件的 URL 地址 */
  url: string;
  /** 透明度 (0-1) */
  opacity?: number;
  /** 点云大小 */
  pointSize?: number;
  /** 最大内存占用 (MB) */
  maximumMemoryUsage?: number;
  /** 是否可拾取 */
  pickable?: boolean;
  /** 加载成功回调 */
  onTilesetLoad?: (tileset: any) => void;
  /** 加载失败回调 */
  onTilesetError?: (error: any) => void;
  /** 点击回调 */
  onClick?: (info: any) => void;
}

/**
 * 图层更新属性
 */
export interface LayerUpdateProps {
  /** 透明度 (0-1) */
  opacity?: number;
  /** 是否可见 */
  visible?: boolean;
  /** 点云大小 */
  pointSize?: number;
}

/**
 * 相机飞行选项
 */
export interface FlyToOptions {
  /** 中心点经纬度 */
  center: [number, number];
  /** 缩放级别 */
  zoom?: number;
  /** 俯仰角 (0-85) */
  pitch?: number;
  /** 方位角 (0-360) */
  bearing?: number;
  /** 动画持续时间 (毫秒) */
  duration?: number;
}

/**
 * WGS84 椭球体参数
 */
const WGS84 = {
  /** 长半轴 (米) */
  a: 6378137.0,
  /** 短半轴 (米) */
  b: 6356752.314245,
  /** 扁率 */
  f: 1 / 298.257223563,
} as const;

/**
 * 将 ECEF (地心地固) 坐标转换为 WGS84 经纬度坐标
 * @description 使用迭代算法将笛卡尔坐标系转换为大地坐标系
 * @param x - ECEF X 坐标 (米)
 * @param y - ECEF Y 坐标 (米)
 * @param z - ECEF Z 坐标 (米)
 * @returns [经度 (度), 纬度 (度), 高度 (米)]
 */
function ecefToLngLat(x: number, y: number, z: number): [number, number, number] {
  const { a, b } = WGS84;
  const e2 = 1 - (b * b) / (a * a); // 第一偏心率平方
  
  // 计算经度
  const lon = Math.atan2(y, x);
  
  // 计算纬度 (迭代算法)
  const p = Math.sqrt(x * x + y * y);
  let lat = Math.atan2(z, p * (1 - e2));
  let prevLat = 0;
  
  // 迭代5次通常足够精确
  for (let i = 0; i < 5 && Math.abs(lat - prevLat) > 1e-12; i++) {
    prevLat = lat;
    const sinLat = Math.sin(lat);
    const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
    const h = p / Math.cos(lat) - N;
    lat = Math.atan2(z, p * (1 - e2 * N / (N + h)));
  }
  
  // 计算高度
  const sinLat = Math.sin(lat);
  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const alt = p / Math.cos(lat) - N;
  
  return [
    (lon * 180) / Math.PI, // 经度
    (lat * 180) / Math.PI, // 纬度
    alt, // 高度
  ];
}

/**
 * 从 tileset 中智能提取模型中心坐标
 * @param tileset - 3D Tiles tileset 对象
 * @returns 提取成功返回 [经度, 纬度, 高度]，失败返回 null
 */
function extractModelCenter(tileset: any): [number, number, number] | null {
  // 方法1: 从 cartographicCenter 获取 (优先)
  if (tileset?.cartographicCenter && Array.isArray(tileset.cartographicCenter)) {
    const [lng, lat, alt = 0] = tileset.cartographicCenter;
    console.log("📍 从 cartographicCenter 获取坐标:", [lng, lat, alt]);
    return [lng, lat, alt];
  }
  
  // 方法2: 从 boundingVolume.center 获取 (ECEF 坐标)
  if (tileset?.root?.boundingVolume?.center) {
    const center = tileset.root.boundingVolume.center;
    if (Array.isArray(center) && center.length >= 3) {
      const [lng, lat, alt] = ecefToLngLat(center[0], center[1], center[2]);
      console.log("📍 从 boundingVolume.center (ECEF) 转换坐标:", [lng, lat, alt]);
      return [lng, lat, alt];
    }
  }
  
  // 方法3: 从 transform 矩阵提取 (4x4 变换矩阵的平移分量)
  if (tileset?.root?.transform && Array.isArray(tileset.root.transform)) {
    const transform = tileset.root.transform;
    if (transform.length >= 15) {
      // 变换矩阵的第13、14、15个元素是位移向量 (ECEF 坐标)
      const [lng, lat, alt] = ecefToLngLat(transform[12], transform[13], transform[14]);
      console.log("📍 从 transform 矩阵 (ECEF) 转换坐标:", [lng, lat, alt]);
      return [lng, lat, alt];
    }
  }
  
  console.warn("⚠️ 无法从 tileset 中提取模型中心坐标");
  return null;
}

/**
 * 根据模型高度智能计算合适的缩放级别
 * @param altitude - 模型高度 (米)
 * @returns 缩放级别 (1-22)
 */
function calculateOptimalZoom(altitude: number): number {
  if (altitude > 1000) return 14;
  if (altitude > 500) return 15;
  if (altitude > 200) return 16;
  if (altitude > 100) return 17;
  if (altitude > 50) return 18;
  return 19;
}

/**
 * 3D Tiles 工具类
 * @description 提供 3D Tiles 模型的加载、管理、更新等功能
 */
export const tiles3DUtils = {
  /**
   * 创建 DeckOverlay 实例
   * @description 创建用于 MapLibre GL 的 deck.gl 叠加层
   * @param options - 配置选项
   * @returns DeckOverlay 实例
   */
  createDeckOverlay(options?: {
    /** 是否启用交错渲染模式 */
    interleaved?: boolean;
    /** 初始图层数组 */
    layers?: any[];
  }): any {
    return new DeckOverlay({
      interleaved: options?.interleaved ?? true,
      layers: options?.layers ?? [],
    });
  },

  /**
   * 加载 3D Tiles 图层
   * @description 加载并显示 3D Tiles 模型，自动定位到模型中心
   * @param deckOverlay - DeckOverlay 实例
   * @param map - MapLibre GL 地图实例
   * @param options - 图层配置选项
   */
  load3DTiles(
    deckOverlay: any,
    map: MapLibreMap,
    options: Tiles3DLayerOptions
  ): void {
    const {
      id,
      name = id,
      url,
      opacity = 1,
      pointSize = 2,
      maximumMemoryUsage = 512,
      pickable = true,
      onTilesetLoad,
      onTilesetError,
      onClick,
    } = options;

    // 检查图层是否已存在
    if (this.has3DTilesLayer(deckOverlay, id)) {
      console.warn(`⚠️ 图层 ${id} 已存在，将先移除旧图层`);
      this.remove3DTilesLayer(deckOverlay, id);
    }

    const layers = deckOverlay._props?.layers || [];
    console.log(`🚀 开始加载 3D Tiles: ${url}`);

    deckOverlay.setProps({
      layers: [
        ...layers,
        new Tile3DLayer({
          id,
          name,
          data: url,
          loader: Tiles3DLoader,
          extruded: true,
          opacity,
          pointSize,
          pickable,
          loadOptions: {
            "3d-tiles": {
              loadGLTF: true,
              decodeQuantizedPositions: false,
              isTileset: "auto",
              assetGltfUpAxis: null,
              maximumMemoryUsage,
            },
          },
          // 点击事件
          onClick: (info: any) => {
            if (onClick && info.object) {
              onClick(info);
            }
          },
          // 加载错误处理
          onTilesetError: (err: any) => {
            console.error(`❌ 3D Tiles 加载错误 (${id}):`, err);
            if (onTilesetError) {
              onTilesetError(err);
            }
          },
          // 加载成功处理
          onTilesetLoad: (tileset: any) => {
            console.log(`✅ 3D Tiles 加载成功 (${id})`);
            
            // 智能提取模型中心坐标
            const center = extractModelCenter(tileset);
            console.log("🚀 ~ center:", center)
            
            if (center) {
              const [lng, lat, alt] = center;
              const zoom = calculateOptimalZoom(alt);
              
              // 平滑飞行到模型位置
              this.flyToModel(map as any, {
                center: [lng, lat],
                zoom,
                pitch: 60,
                bearing: 0,
                duration: 2000,
              });
              
              console.log(
                `🎯 已定位到模型中心: [${lng.toFixed(6)}, ${lat.toFixed(6)}]\n` +
                `   高度: ${alt.toFixed(2)}m | 缩放级别: ${zoom}`
              );
            } else {
              console.warn("⚠️ 无法自动定位，请手动调整视角");
              if (process.env.NODE_ENV === 'development') {
                console.log("Tileset 结构:", JSON.stringify(tileset, null, 2));
              }
            }
            
            // 执行用户回调
            if (onTilesetLoad) {
              onTilesetLoad(tileset);
            }
          },
        }),
      ],
    });
  },

  /**
   * 平滑飞行到指定位置
   * @param map - MapLibre GL 地图实例
   * @param options - 飞行选项
   */
  flyToModel(map: MapLibreMap, options: FlyToOptions): void {
    const {
      center,
      zoom = 18,
      pitch = 60,
      bearing = 0,
      duration = 2000,
    } = options;
    
    map.easeTo({
      center,
      zoom,
      pitch,
      bearing,
      duration,
    });
  },

  /**
   * 移除 3D Tiles 图层
   * @param deckOverlay - DeckOverlay 实例
   * @param layerId - 图层 ID
   * @returns 是否移除成功
   */
  remove3DTilesLayer(deckOverlay: any, layerId: string): boolean {
    try {
      if (!this.has3DTilesLayer(deckOverlay, layerId)) {
        console.warn(`⚠️ 图层 ${layerId} 不存在`);
        return false;
      }
      
      const layers = deckOverlay._props?.layers || [];
      const newLayers = layers.filter((layer: any) => layer.id !== layerId);
      
      deckOverlay.setProps({ layers: newLayers });
      
      console.log(`🗑️ 图层 ${layerId} 已移除`);
      return true;
    } catch (error) {
      console.error(`❌ 移除图层 ${layerId} 失败:`, error);
      return false;
    }
  },

  /**
   * 更新 3D Tiles 图层属性
   * @param deckOverlay - DeckOverlay 实例
   * @param layerId - 图层 ID
   * @param props - 要更新的属性
   * @returns 是否更新成功
   */
  update3DTilesLayer(
    deckOverlay: any,
    layerId: string,
    props: LayerUpdateProps
  ): boolean {
    try {
      const layers = deckOverlay._props?.layers || [];
      const targetLayer = layers.find((layer: any) => layer.id === layerId);
      
      if (!targetLayer) {
        console.warn(`⚠️ 图层 ${layerId} 不存在`);
        return false;
      }
      
      const newLayers = layers.map((layer: any) => {
        if (layer.id === layerId) {
          const updateProps: any = {};
          if (props.opacity !== undefined) updateProps.opacity = props.opacity;
          if (props.visible !== undefined) updateProps.visible = props.visible;
          if (props.pointSize !== undefined) updateProps.pointSize = props.pointSize;
          return layer.clone(updateProps);
        }
        return layer;
      });
      
      deckOverlay.setProps({ layers: newLayers });
      
      console.log(`🔄 图层 ${layerId} 属性已更新:`, props);
      return true;
    } catch (error) {
      console.error(`❌ 更新图层 ${layerId} 失败:`, error);
      return false;
    }
  },

  /**
   * 检查图层是否存在
   * @param deckOverlay - DeckOverlay 实例
   * @param layerId - 图层 ID
   * @returns 是否存在
   */
  has3DTilesLayer(deckOverlay: any, layerId: string): boolean {
    if (!deckOverlay?._props?.layers) return false;
    return deckOverlay._props.layers.some((layer: any) => layer.id === layerId);
  },

  /**
   * 获取指定图层
   * @param deckOverlay - DeckOverlay 实例
   * @param layerId - 图层 ID
   * @returns 图层对象，不存在返回 null
   */
  get3DTilesLayer(deckOverlay: any, layerId: string): any | null {
    const layers = deckOverlay._props?.layers || [];
    return layers.find((layer: any) => layer.id === layerId) || null;
  },

  /**
   * 切换图层可见性
   * @param deckOverlay - DeckOverlay 实例
   * @param layerId - 图层 ID
   * @returns 切换后的可见性状态，失败返回 null
   */
  toggle3DTilesLayer(deckOverlay: any, layerId: string): boolean | null {
    const targetLayer = this.get3DTilesLayer(deckOverlay, layerId);
    if (!targetLayer) {
      console.warn(`⚠️ 图层 ${layerId} 不存在`);
      return null;
    }
    
    const newVisible = !targetLayer.props.visible;
    const success = this.update3DTilesLayer(deckOverlay, layerId, { visible: newVisible });
    
    if (success === true) {
      console.log(`👁️ 图层 ${layerId} 可见性: ${newVisible ? '显示' : '隐藏'}`);
      return newVisible;
    }
    return null;
  },

  /**
   * 获取所有 3D Tiles 图层
   * @param deckOverlay - DeckOverlay 实例
   * @returns 图层数组
   */
  getAll3DTilesLayers(deckOverlay: any): any[] {
    return deckOverlay._props?.layers || [];
  },

  /**
   * 获取图层数量
   * @param deckOverlay - DeckOverlay 实例
   * @returns 图层数量
   */
  getLayerCount(deckOverlay: any): number {
    return this.getAll3DTilesLayers(deckOverlay).length;
  },

  /**
   * 清除所有 3D Tiles 图层
   * @param deckOverlay - DeckOverlay 实例
   * @returns 清除的图层数量
   */
  clearAll3DTilesLayers(deckOverlay: any): number {
    const count = this.getLayerCount(deckOverlay);
    deckOverlay.setProps({ layers: [] });
    console.log(`🧼 已清除 ${count} 个 3D Tiles 图层`);
    return count;
  },

  /**
   * 批量更新图层属性
   * @param deckOverlay - DeckOverlay 实例
   * @param updates - 图层 ID 与属性的映射
   * @returns 成功更新的图层数量
   */
  batchUpdate3DTilesLayers(
    deckOverlay: any,
    updates: Map<string, LayerUpdateProps> | Record<string, LayerUpdateProps>
  ): number {
    const layers = deckOverlay._props?.layers || [];
    const updateMap = updates instanceof Map ? updates : new Map(Object.entries(updates));
    let updateCount = 0;
    
    const newLayers = layers.map((layer: any) => {
      const props = updateMap.get(layer.id);
      if (props) {
        updateCount++;
        const updateProps: any = {};
        if (props.opacity !== undefined) updateProps.opacity = props.opacity;
        if (props.visible !== undefined) updateProps.visible = props.visible;
        if (props.pointSize !== undefined) updateProps.pointSize = props.pointSize;
        return layer.clone(updateProps);
      }
      return layer;
    });
    
    deckOverlay.setProps({ layers: newLayers });
    console.log(`🔄 已批量更新 ${updateCount} 个图层`);
    return updateCount;
  },

  /**
   * 显示所有图层
   * @param deckOverlay - DeckOverlay 实例
   */
  showAllLayers(deckOverlay: any): void {
    const layers = this.getAll3DTilesLayers(deckOverlay);
    const updates: Record<string, LayerUpdateProps> = {};
    layers.forEach((layer: any) => {
      updates[layer.id] = { visible: true };
    });
    this.batchUpdate3DTilesLayers(deckOverlay, updates);
  },

  /**
   * 隐藏所有图层
   * @param deckOverlay - DeckOverlay 实例
   */
  hideAllLayers(deckOverlay: any): void {
    const layers = this.getAll3DTilesLayers(deckOverlay);
    const updates: Record<string, LayerUpdateProps> = {};
    layers.forEach((layer: any) => {
      updates[layer.id] = { visible: false };
    });
    this.batchUpdate3DTilesLayers(deckOverlay, updates);
  },
};

export default tiles3DUtils;
