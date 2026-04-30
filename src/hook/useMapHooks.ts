/*
 * @Author: Do not edit
 * @Date: 2025-11-29 09:56:36
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-29 10:50:00
 * @Description: 
 */
/**
 * Cesium地图Composable Hooks
 * @description 基于Vue Composition API实现的地图工具函数集合
 * @module useMapHooks
 */

import MVTImageryProvider from "mvt-imagery-provider";
import { Ref, ref } from 'vue';

// 定义图层类型
interface MVTLayer {
  type: 'mvt';
  instance: any; // ImageryLayer对象
}

interface TilesetLayer {
  type: '3dtiles';
  instance: any; // Cesium3DTileset对象
}

type MapLayer = MVTLayer | TilesetLayer;

// 图层存储
const loadedLayers: Ref<Map<string, MapLayer>> = ref(new Map());

export function useMapHooks() {
  /**
   * 加载MVT矢量瓦片图层
   * @param viewer - Cesium Viewer实例
   * @param styleUrl - 样式文件URL (如: '/style.json')
   * @returns Promise<ImageryLayer> - 返回图层对象而非Provider，以便控制显隐
   */
  async function loadMVTLayer(viewer: any, styleUrl: string): Promise<any> {
    try {
      console.log(`开始加载MVT图层，样式URL: ${styleUrl}`);

      // 验证样式文件是否存在
      try {
        const response = await fetch(styleUrl);
        if (!response.ok) {
          throw new Error(
            `样式文件不存在: ${styleUrl} (HTTP ${response.status})`
          );
        }

        const styleJson = await response.json();

        // 验证必需的字段
        if (!styleJson.version) {
          throw new Error('样式文件缺少 "version" 字段');
        }
        if (!styleJson.sources) {
          throw new Error('样式文件缺少 "sources" 字段');
        }
        if (!styleJson.layers) {
          throw new Error('样式文件缺少 "layers" 字段');
        }

        console.log(`✅ 样式文件验证通过:`, {
          version: styleJson.version,
          sources: Object.keys(styleJson.sources),
          layers: styleJson.layers.length,
        });
      } catch (error) {
        console.error("❌ 样式文件验证失败:", error);
        throw error;
      }

      // 创建MVT Imagery Provider
      const provider = await MVTImageryProvider.fromUrl(styleUrl);

      // 将图层添加到viewer的imageryLayers中，返回ImageryLayer对象
      if (viewer && viewer.imageryLayers) {
        const imageryLayer = viewer.imageryLayers.addImageryProvider(provider);
        console.log("✅ MVT图层加载成功");
        
        // 返回ImageryLayer对象，而非Provider
        return imageryLayer;
      } else {
        throw new Error("Viewer或imageryLayers不可用");
      }
    } catch (error) {
      console.error("❌ 加载MVT图层失败:", error);
      throw new Error(`Failed to load MVT layer: ${error}`);
    }
  }

  /**
   * 加载3D Tiles图层
   * @param viewer - Cesium Viewer实例
   * @param url - 3D Tiles tileset.json URL
   * @param options - 加载选项
   * @returns Promise<Cesium3DTileset>
   */
  async function load3DTiles(
    viewer: any,
    url: string,
    options: {
      maximumScreenSpaceError?: number;
      maximumMemoryUsage?: number;
      show?: boolean;
    } = {}
  ): Promise<any> {
    try {
      const Cesium = (window as any).Cesium;
      if (!Cesium) {
        throw new Error("Cesium未加载");
      }

      const {
        maximumScreenSpaceError = 16,
        maximumMemoryUsage = 512,
        show = true,
      } = options;

      console.log(`开始加载3D Tiles: ${url}`);

      // 使用构造函数方式创建3D Tileset（修复fromUrl不是函数的问题）
      const tileset = new Cesium.Cesium3DTileset({
        url,
        maximumScreenSpaceError,
        maximumMemoryUsage,
      });

      // 设置可见性
      tileset.show = show;

      // 添加到场景
      viewer.scene.primitives.add(tileset);

      // 等待tileset准备完成
      await tileset.readyPromise;

      console.log("✅ 3D Tiles加载成功");

      return tileset;
    } catch (error) {
      console.error("❌ 加载3D Tiles失败:", error);
      throw new Error(`Failed to load 3D Tiles: ${error}`);
    }
  }

  /**
   * 设置3D Tiles可见性
   * @param tileset - 3D Tileset实例
   * @param visible - 是否可见
   */
  function set3DTilesVisibility(tileset: any, visible: boolean): void {
    if (tileset) {
      tileset.show = visible;
      console.log(`3D Tiles可见性已设置为: ${visible}`);
    }
  }

  /**
   * 设置3D Tiles样式
   * @param tileset - 3D Tileset实例
   * @param style - Cesium3DTileStyle样式对象
   */
  function set3DTilesStyle(tileset: any, style: any): void {
    const Cesium = (window as any).Cesium;
    if (!Cesium || !tileset) return;

    try {
      tileset.style = new Cesium.Cesium3DTileStyle(style);
      console.log("✅ 3D Tiles样式已更新");
    } catch (error) {
      console.error("❌ 设置3D Tiles样式失败:", error);
    }
  }

  /**
   * 获取已加载的图层
   */
  function getLoadedLayers(): Ref<Map<string, MapLayer>> {
    return loadedLayers;
  }

  /**
   * 存储已加载的图层
   * @param layerId - 图层ID
   * @param layer - 图层对象
   */
  function setLoadedLayer(layerId: string, layer: MapLayer): void {
    loadedLayers.value.set(layerId, layer);
  }

  /**
   * 获取指定ID的图层
   * @param layerId - 图层ID
   */
  function getLoadedLayer(layerId: string): MapLayer | undefined {
    return loadedLayers.value.get(layerId);
  }

  /**
   * 限制相机平移范围（基于矩形边界）
   * @param viewer - Cesium Viewer实例
   * @param bounds - 边界范围 { west, south, east, north } (度数)
   * @param options - 配置选项
   * @returns 清理函数，调用后移除监听器
   * 
   * @example
   * // 限制在阳新县范围内（经度:114.8-115.6, 纬度:29.4-30.2）
   * const cleanup = restrictCameraBounds(viewer, {
   *   west: 114.8,
   *   south: 29.4,
   *   east: 115.6,
   *   north: 30.2
   * }, {
   *   minHeight: 10000,   // 最小高度10km（最大放大）
   *   maxHeight: 200000   // 最大高度200km（最小放大）
   * })
   * 
   * // 组件卸载时清理
   * onBeforeUnmount(() => cleanup())
   */
  function restrictCameraBounds(
    viewer: any,
    bounds: {
      west: number;   // 西边界（最小经度）
      south: number;  // 南边界（最小纬度）
      east: number;   // 东边界（最大经度）
      north: number;  // 北边界（最大纬度）
    },
    options: {
      buffer?: number;      // 边界缓冲距离（度），默认0.05
      smoothCorrection?: boolean;  // 是否平滑修正，默认false（避免死循环）
      minHeight?: number;   // 最小高度（米），默认5000（最大放大级别）
      maxHeight?: number;   // 最大高度（米），默认300000（最小放大级别）
    } = {}
  ): () => void {
    const Cesium = (window as any).Cesium;
    if (!Cesium || !viewer) {
      console.warn('⚠️ Cesium或Viewer未就绪，无法限制相机范围');
      return () => {};
    }

    const { 
      buffer = 0.05, 
      smoothCorrection = false,
      minHeight = 5000,      // 默认最小高度5km
      maxHeight = 300000     // 默认最大高度300km
    } = options;

    // 扩展边界（添加缓冲区）
    const extendedBounds = {
      west: bounds.west - buffer,
      south: bounds.south - buffer,
      east: bounds.east + buffer,
      north: bounds.north + buffer
    };

    console.log('✅ 相机平移范围限制已启用:', {
      bounds,
      buffer,
      smoothCorrection,
      heightRange: `${minHeight}m - ${maxHeight}m`,
      mode: viewer.scene.mode === Cesium.SceneMode.SCENE2D ? '2D' : '3D'
    });

    // 标记是否正在修正位置（避免死循环）
    let isCorrecting = false;

    // 监听相机移动结束事件
    const removeListener = viewer.camera.moveEnd.addEventListener(() => {
      // 如果正在修正，跳过本次检查
      if (isCorrecting) {
        isCorrecting = false;
        return;
      }

      const camera = viewer.camera;
      const scene = viewer.scene;
      const ellipsoid = scene.globe.ellipsoid;

      // 获取当前相机位置
      let lon: number, lat: number, height: number;

      if (scene.mode === Cesium.SceneMode.SCENE2D) {
        // 2D模式：使用相机位置
        const cameraPos = camera.positionCartographic;
        lon = Cesium.Math.toDegrees(cameraPos.longitude);
        lat = Cesium.Math.toDegrees(cameraPos.latitude);
        height = cameraPos.height;
      } else {
        // 3D模式：使用屏幕中心点
        const center = camera.pickEllipsoid(
          new Cesium.Cartesian2(
            viewer.canvas.clientWidth / 2,
            viewer.canvas.clientHeight / 2
          ),
          ellipsoid
        );

        if (!center) return;

        const cartographic = ellipsoid.cartesianToCartographic(center);
        lon = Cesium.Math.toDegrees(cartographic.longitude);
        lat = Cesium.Math.toDegrees(cartographic.latitude);
        height = camera.positionCartographic.height;
      }

      // 检查是否超出边界或高度范围
      let needCorrection = false;
      let targetLon = lon;
      let targetLat = lat;
      let targetHeight = height;

      // 检查经纬度边界
      if (lon < extendedBounds.west) {
        targetLon = extendedBounds.west;
        needCorrection = true;
      } else if (lon > extendedBounds.east) {
        targetLon = extendedBounds.east;
        needCorrection = true;
      }

      if (lat < extendedBounds.south) {
        targetLat = extendedBounds.south;
        needCorrection = true;
      } else if (lat > extendedBounds.north) {
        targetLat = extendedBounds.north;
        needCorrection = true;
      }

      // 检查高度范围
      if (height < minHeight) {
        targetHeight = minHeight;
        needCorrection = true;
      } else if (height > maxHeight) {
        targetHeight = maxHeight;
        needCorrection = true;
      }

      // 如果超出边界或高度范围，修正相机位置
      if (needCorrection) {
        isCorrecting = true;

        const heading = camera.heading;
        const pitch = camera.pitch;
        const roll = camera.roll;

        // 构建日志信息
        const logParts = [];
        if (targetLon !== lon || targetLat !== lat) {
          logParts.push(`位置: (${lon.toFixed(4)}, ${lat.toFixed(4)}) -> (${targetLon.toFixed(4)}, ${targetLat.toFixed(4)})`);
        }
        if (targetHeight !== height) {
          logParts.push(`高度: ${(height/1000).toFixed(1)}km -> ${(targetHeight/1000).toFixed(1)}km`);
        }
        console.log(`📍 相机修正: ${logParts.join(', ')}`);

        if (scene.mode === Cesium.SceneMode.SCENE2D) {
          // 2D模式：使用特定的修正方式
          const targetPosition = Cesium.Cartesian3.fromDegrees(targetLon, targetLat, targetHeight);
          
          if (smoothCorrection) {
            camera.flyTo({
              destination: targetPosition,
              duration: 0.3,
              complete: () => {
                isCorrecting = false;
              },
              cancel: () => {
                isCorrecting = false;
              }
            });
          } else {
            // 立即设置位置（2D模式）
            camera.position = targetPosition;
            isCorrecting = false;
          }
        } else {
          // 3D模式：保持原有方向
          if (smoothCorrection) {
            camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(targetLon, targetLat, targetHeight),
              orientation: {
                heading,
                pitch,
                roll
              },
              duration: 0.3,
              complete: () => {
                isCorrecting = false;
              },
              cancel: () => {
                isCorrecting = false;
              }
            });
          } else {
            // 立即修正位置（3D模式）
            camera.setView({
              destination: Cesium.Cartesian3.fromDegrees(targetLon, targetLat, targetHeight),
              orientation: {
                heading,
                pitch,
                roll
              }
            });
            isCorrecting = false;
          }
        }
      }
    });

    // 返回清理函数
    return () => {
      removeListener();
      console.log('🗑️ 相机范围限制监听器已移除');
    };
  }

  /**
   * 基于GeoJSON边界限制相机范围
   * @param viewer - Cesium Viewer实例
   * @param geoJson - GeoJSON对象（支持Feature、FeatureCollection、Polygon或MultiPolygon）
   * @param options - 配置选项
   * @returns 清理函数
   * 
   * @example
   * // 方式1: 单个Feature对象
   * const geoJson = await fetch('/yangxin.json').then(r => r.json())
   * const cleanup = restrictCameraBoundsByGeoJSON(viewer, geoJson)
   * 
   * // 方式2: FeatureCollection
   * const featureCollection = { type: 'FeatureCollection', features: [...] }
   * const cleanup = restrictCameraBoundsByGeoJSON(viewer, featureCollection)
   */
  function restrictCameraBoundsByGeoJSON(
    viewer: any,
    geoJson: any,
    options: {
      buffer?: number;
      smoothCorrection?: boolean;
    } = {}
  ): () => void {
    if (!geoJson) {
      console.warn('⚠️ GeoJSON数据为空');
      return () => {};
    }

    // 计算GeoJSON的边界框
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;

    // 递归处理坐标数组（支持嵌套结构：MultiPolygon > Polygon > LinearRing > Point）
    const processCoordinates = (coords: any[]) => {
      if (!Array.isArray(coords) || coords.length === 0) {
        return;
      }

      // 判断是否为坐标点 [lon, lat]
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        const [lon, lat] = coords;
        minLon = Math.min(minLon, lon);
        minLat = Math.min(minLat, lat);
        maxLon = Math.max(maxLon, lon);
        maxLat = Math.max(maxLat, lat);
      } else if (Array.isArray(coords[0])) {
        // 递归处理嵌套数组
        coords.forEach((coord: any) => processCoordinates(coord));
      }
    };

    // 处理不同的GeoJSON格式
    let features: any[] = [];

    if (geoJson.type === 'FeatureCollection') {
      // FeatureCollection格式
      features = geoJson.features || [];
    } else if (geoJson.type === 'Feature') {
      // 单个Feature格式
      features = [geoJson];
    } else if (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon') {
      // 直接是Geometry对象
      features = [{ geometry: geoJson }];
    } else {
      console.warn('⚠️ 不支持的GeoJSON格式:', geoJson.type);
      return () => {};
    }

    if (features.length === 0) {
      console.warn('⚠️ GeoJSON中没有有效的Feature');
      return () => {};
    }

    // 遍历所有feature提取坐标
    features.forEach((feature: any) => {
      if (feature.geometry && feature.geometry.coordinates) {
        processCoordinates(feature.geometry.coordinates);
      }
    });

    // 验证是否成功提取到边界
    if (minLon === Infinity || maxLon === -Infinity) {
      console.warn('⚠️ 无法从GeoJSON提取有效坐标');
      return () => {};
    }

    const bounds = {
      west: minLon,
      south: minLat,
      east: maxLon,
      north: maxLat
    };

    console.log(`   范围: 经度 ${minLon.toFixed(4)} ~ ${maxLon.toFixed(4)}, 纬度 ${minLat.toFixed(4)} ~ ${maxLat.toFixed(4)}`);

    // 使用矩形边界限制
    return restrictCameraBounds(viewer, bounds, options);
  }

  return {
    // 图层加载相关
    loadMVTLayer,
    load3DTiles,
    
    // 3D Tiles控制相关
    set3DTilesVisibility,
    set3DTilesStyle,
    
    // 图层管理相关
    getLoadedLayers,
    setLoadedLayer,
    getLoadedLayer,
    
    // 相机控制相关
    restrictCameraBounds,
    restrictCameraBoundsByGeoJSON
  };
}