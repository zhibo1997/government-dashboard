/*
 * @Author: Do not edit
 * @Date: 2025-10-20 00:15:30
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 00:34:52
 * @Description: 
 */
import mapboxgl from "@cgcs2000/mapbox-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { Tile3DLayer } from "@deck.gl/geo-layers";

/**
 * 3D Tiles 工具类
 * 用于在 Mapbox 地图上加载和管理 3D Tiles 数据
 */
export const tiles3DUtils = {
  /**
   * 添加 3D Tiles 图层到 Mapbox 地图
   * @param map - Mapbox 地图实例
   * @param options - 配置选项
   * @returns MapboxLayer 实例
   */
  add3DTilesLayer(
    map: mapboxgl.Map,
    options: {
      id: string;
      tilesetUrl: string;
      onLoad?: () => void;
      onError?: (error: Error) => void;
      loadOptions?: any;
      _lighting?: string;
      opacity?: number;
    }
  ): MapboxOverlay<any> {
    const {
      id = "tiles-3d-layer",
      tilesetUrl,
      onLoad,
      onError,
      loadOptions = {},
      _lighting = "pbr",
      opacity = 1.0,
    } = options;

    try {
      // 创建 3D Tiles 图层
      const tiles3DLayer = new MapboxOverlay({
        id,
        type: Tile3DLayer,
        data: tilesetUrl,
        // 解析变换矩阵
        _parseMatrix: true,
        // 光照模式
        _lighting,
        // 透明度
        opacity,
        // 加载选项
        loadOptions: {
          fetch: {
            headers: {
              "Accept": "application/json",
            },
          },
          ...loadOptions,
        },
        // 瓦片集加载完成回调
        onTilesetLoad: (tileset: any) => {
          console.log("3D Tiles 加载成功:", tileset);
          
          // 自动调整视角到 3D Tiles 边界
          if (tileset && tileset.boundingVolume) {
            this.fitBounds(map, tileset);
          }
          
          if (onLoad) {
            onLoad();
          }
        },
        // 错误处理
        onTileError: (error: any) => {
          console.error("3D Tiles 加载错误:", error);
          if (onError) {
            onError(error);
          }
        },
      });

      // 将图层添加到地图
      map.addLayer(tiles3DLayer as any);

      console.log(`3D Tiles 图层 ${id} 已添加到地图`);
      return tiles3DLayer;
    } catch (error) {
      console.error("添加 3D Tiles 图层失败:", error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  },

  /**
   * 移除 3D Tiles 图层
   * @param map - Mapbox 地图实例
   * @param layerId - 图层 ID
   */
  remove3DTilesLayer(map: mapboxgl.Map, layerId: string): void {
    try {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
        console.log(`3D Tiles 图层 ${layerId} 已移除`);
      }
    } catch (error) {
      console.error(`移除 3D Tiles 图层 ${layerId} 失败:`, error);
    }
  },

  /**
   * 调整地图视角以适应 3D Tiles 边界
   * @param map - Mapbox 地图实例
   * @param tileset - 3D Tiles 数据集
   */
  fitBounds(map: mapboxgl.Map, tileset: any): void {
    try {
      // 从 boundingVolume 中提取边界信息
      const boundingVolume = tileset.boundingVolume;
      
      if (boundingVolume && boundingVolume.center) {
        const center = boundingVolume.center;
        
        // 将笛卡尔坐标转换为经纬度
        const lngLat = this.cartesianToLngLat(center);
        
        // 飞行到 3D Tiles 中心
        map.flyTo({
          center: lngLat,
          zoom: 16,
          pitch: 60,
          bearing: 0,
          duration: 2000,
        });

        console.log("视角已调整到 3D Tiles 中心:", lngLat);
      }
    } catch (error) {
      console.error("调整视角失败:", error);
    }
  },

  /**
   * 将笛卡尔坐标转换为经纬度
   * 简化版本，实际项目中建议使用 Cesium 或其他专业库
   * @param cartesian - 笛卡尔坐标 [x, y, z]
   * @returns 经纬度 [lng, lat]
   */
  cartesianToLngLat(cartesian: number[]): [number, number] {
    // 这里只是一个占位实现
    // 实际项目中应该使用正确的坐标转换算法
    // 对于本项目，我们直接使用配置的中心坐标
    return [115.186322, 29.864861];
  },

  /**
   * 更新 3D Tiles 图层属性
   * @param map - Mapbox 地图实例
   * @param layerId - 图层 ID
   * @param props - 要更新的属性
   */
  update3DTilesLayer(
    map: mapboxgl.Map,
    layerId: string,
    props: {
      opacity?: number;
      visible?: boolean;
    }
  ): void {
    try {
      const layer = map.getLayer(layerId);
      if (!layer) {
        console.warn(`图层 ${layerId} 不存在`);
        return;
      }

      // 更新可见性
      if (props.visible !== undefined) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          props.visible ? "visible" : "none"
        );
      }

      console.log(`3D Tiles 图层 ${layerId} 属性已更新`);
    } catch (error) {
      console.error(`更新 3D Tiles 图层 ${layerId} 失败:`, error);
    }
  },

  /**
   * 检查 3D Tiles 图层是否存在
   * @param map - Mapbox 地图实例
   * @param layerId - 图层 ID
   * @returns 是否存在
   */
  has3DTilesLayer(map: mapboxgl.Map, layerId: string): boolean {
    return !!map.getLayer(layerId);
  },

  /**
   * 切换 3D Tiles 图层可见性
   * @param map - Mapbox 地图实例
   * @param layerId - 图层 ID
   */
  toggle3DTilesLayer(map: mapboxgl.Map, layerId: string): void {
    try {
      const layer = map.getLayer(layerId);
      if (!layer) {
        console.warn(`图层 ${layerId} 不存在`);
        return;
      }

      const visibility = map.getLayoutProperty(layerId, "visibility");
      const newVisibility = visibility === "visible" ? "none" : "visible";

      map.setLayoutProperty(layerId, "visibility", newVisibility);
      console.log(`3D Tiles 图层 ${layerId} 可见性已切换为: ${newVisibility}`);
    } catch (error) {
      console.error(`切换 3D Tiles 图层 ${layerId} 可见性失败:`, error);
    }
  },
};

export default tiles3DUtils;
