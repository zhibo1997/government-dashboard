/*
 * @Author: Do not edit
 * @Date: 2025-11-04 21:08:01
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-05 19:55:11
 * @Description:
 */

import MVTImageryProvider from "mvt-imagery-provider";
import { useVueCesium } from "vue-cesium";
import { VcViewerProvider } from "vue-cesium/es/utils/types";

const $vc: VcViewerProvider = useVueCesium();
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
    console.log(`初始化Cesium地图，容器ID: ${containerId}`);
    // 实际实现将在后续步骤中完成
    return Promise.resolve({});
  },

  /**
   * 切换底图
   * @param viewer - Cesium Viewer实例
   * @param type - 底图类型: 'vec'(矢量)、'img'(影像)、'ter'(地形)
   */
  switchBaseMap(viewer: any, type: "vec" | "img" | "ter" = "vec"): void {
    console.log(`切换底图类型: ${type}`);
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
      strokeColor?: string;
      strokeWidth?: number;
      fillColor?: string;
      fillOpacity?: number;
    } = {}
  ): Promise<void> {
    console.log(`加载GeoJSON数据源: ${sourceId}`);
    // 实际实现将在后续步骤中完成
  },

  /**
   * 添加POI标注
   * @param viewer - Cesium Viewer实例
   * @param poiData - POI数据数组
   */
  addPOIMarkers(viewer: any, poiData: any[]): void {
    console.log(`添加 ${poiData.length} 个POI标注`);
    // 实际实现将在后续步骤中完成
  },

  /**
   * 切换图层可见性
   * @param viewer - Cesium Viewer实例
   * @param layerName - 图层名称
   * @param visible - 是否可见
   */
  toggleLayerVisibility(
    viewer: any,
    layerName: string,
    visible: boolean
  ): void {
    console.log(`设置图层 ${layerName} 可见性: ${visible}`);
    // 实际实现将在后续步骤中完成
  },

  /**
   * 创建简化的天地图样式
   * @param type - 底图类型: 'vec'(矢量)、'img'(影像)、'ter'(地形)
   * @returns 天地图样式配置
   */
  createSimpleTiandituStyle(type: "vec" | "img" | "ter" = "vec") {
    console.log(`创建天地图样式，类型: ${type}`);
    // 实际实现将在后续步骤中完成
    return {};
  },

  /**
   * 加载MVT矢量瓦片图层
   * @param viewer - Cesium Viewer实例
   * @param styleUrl - 样式文件URL (如: '/style.json')
   * @returns Promise<ImageryLayer> - 返回图层对象而非Provider，以便控制显隐
   */
  async loadMVTLayer(viewer: any, styleUrl: string): Promise<any> {
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
      outputFormat?: string;
      maxFeatures?: number;
      srsName?: string;
      bbox?: string;
      cqlFilter?: string;
    } = {}
  ): Promise<any> {
    try {
      const {
        outputFormat = "application/json",
        maxFeatures = 1000,
        srsName = "EPSG:4326",
        bbox,
        cqlFilter,
      } = options;

      // 构建WFS请求参数
      const params = new URLSearchParams({
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: layerName,
        outputFormat,
        maxFeatures: maxFeatures.toString(),
        srsName,
      });

      // 添加可选参数
      if (bbox) {
        params.append("bbox", bbox);
      }
      if (cqlFilter) {
        params.append("cql_filter", cqlFilter);
      }

      const url = `${baseUrl}?${params.toString()}`;
      console.log(`查询WFS数据: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`WFS数据查询成功，共 ${data.features?.length || 0} 条数据`);

      return data;
    } catch (error) {
      console.error("WFS数据查询失败:", error);
      throw error;
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
      markerColor?: string;
      markerSymbol?: string;
      markerSize?: number;
      clampToGround?: boolean;
    } = {}
  ): Promise<any> {
    try {
      const Cesium = (window as any).Cesium;
      if (!Cesium) {
        throw new Error("Cesium未加载");
      }

      const {
        markerColor = "#1677ff",
        markerSymbol = "circle",
        markerSize = 10,
        clampToGround = true,
      } = options;

      // 创建GeoJSON数据源
      const dataSource = await Cesium.GeoJsonDataSource.load(geoJsonData, {
        clampToGround,
        markerColor: Cesium.Color.fromCssColorString(markerColor),
        markerSize,
      });

      // 添加到viewer
      viewer.dataSources.add(dataSource);

      console.log(
        `成功添加 ${geoJsonData.features?.length || 0} 个点要素到地图`
      );

      return dataSource;
    } catch (error) {
      console.error("添加WFS点数据到地图失败:", error);
      throw error;
    }
  },

  /**
   * 加载3D Tiles图层
   * @param viewer - Cesium Viewer实例
   * @param url - 3D Tiles tileset.json URL
   * @param options - 加载选项
   * @returns Promise<Cesium3DTileset>
   */
  async load3DTiles(
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

      // 调整相机视角到tileset
      await viewer.zoomTo(tileset);

      console.log("✅ 3D Tiles加载成功");

      return tileset;
    } catch (error) {
      console.error("❌ 加载3D Tiles失败:", error);
      throw new Error(`Failed to load 3D Tiles: ${error}`);
    }
  },

  /**
   * 移除3D Tiles图层
   * @param viewer - Cesium Viewer实例
   * @param tileset - 3D Tileset实例
   */
  remove3DTiles(viewer: any, tileset: any): void {
    try {
      if (viewer && viewer.scene && tileset) {
        viewer.scene.primitives.remove(tileset);
        console.log("✅ 3D Tiles已移除");
      }
    } catch (error) {
      console.error("❌ 移除3D Tiles失败:", error);
    }
  },

  /**
   * 设置3D Tiles可见性
   * @param tileset - 3D Tileset实例
   * @param visible - 是否可见
   */
  set3DTilesVisibility(tileset: any, visible: boolean): void {
    if (tileset) {
      tileset.show = visible;
      console.log(`3D Tiles可见性已设置为: ${visible}`);
    }
  },

  /**
   * 设置3D Tiles样式
   * @param tileset - 3D Tileset实例
   * @param style - Cesium3DTileStyle样式对象
   */
  set3DTilesStyle(tileset: any, style: any): void {
    const Cesium = (window as any).Cesium;
    if (!Cesium || !tileset) return;

    try {
      tileset.style = new Cesium.Cesium3DTileStyle(style);
      console.log("✅ 3D Tiles样式已更新");
    } catch (error) {
      console.error("❌ 设置3D Tiles样式失败:", error);
    }
  },

  /**
   * 设置MVT图层点击查询
   * @param viewer - Cesium Viewer实例
   * @param wfsService - WFS服务实例
   * @param options - 查询选项
   * @returns 清理函数
   * @description 为MVT图层添加点击事件，点击后查询详细信息
   */
  setupMVTClickQuery(
    viewer: any,
    wfsService: any,
    options: {
      layerName?: string;
      buffer?: number;
      onFeatureClick?: (feature: any) => void;
    } = {}
  ): () => void {
    const Cesium = (window as any).Cesium;
    if (!Cesium) {
      throw new Error("Cesium未加载");
    }

    const {
      layerName = "gspsp_dtrans_bridgebscinfo",
      buffer = 0.001,
      onFeatureClick,
    } = options;

    console.log("✅ 设置MVT点击查询功能");

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction(async (movement: any) => {
      // 获取点击位置的地理坐标
      const cartesian = viewer.camera.pickEllipsoid(
        movement.position,
        viewer.scene.globe.ellipsoid
      );

      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);

        console.log(
          `📍 点击位置: [${longitude.toFixed(6)}, ${latitude.toFixed(6)}]`
        );

        try {
          // 构建查询范围
          const bbox: [number, number, number, number] = [
            longitude - buffer,
            latitude - buffer,
            longitude + buffer,
            latitude + buffer,
          ];

          console.log(
            `🔍 查询范围: [${bbox.map((v) => v.toFixed(6)).join(", ")}]`
          );

          // 查询WFS数据
          const geoJsonData = await wfsService.getFeaturesByBBox(
            layerName,
            bbox,
            "EPSG:4326"
          );

          if (
            geoJsonData &&
            geoJsonData.features &&
            geoJsonData.features.length > 0
          ) {
            console.log(
              `✅ 查询成功! 找到 ${geoJsonData.features.length} 个要素`
            );

            // 找到最近的要素
            const feature = this.findClosestFeature(
              geoJsonData.features,
              longitude,
              latitude
            );

            console.log("📋 要素详细信息:", {
              id: feature.id,
              properties: feature.properties,
              geometry: feature.geometry,
            });

            // 触发回调
            if (onFeatureClick) {
              onFeatureClick(feature);
            }
          } else {
            console.log("❌ 未查询到要素信息");
          }
        } catch (error) {
          console.error("❌ 查询要素信息失败:", error);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 返回清理函数
    return () => {
      handler.destroy();
      console.log("🗑️ MVT点击查询已清理");
    };
  },

  /**
   * 找到距离点击位置最近的要素
   * @param features - GeoJSON要素数组
   * @param longitude - 经度
   * @param latitude - 纬度
   * @returns 最近的要素
   */
  findClosestFeature(
    features: any[],
    longitude: number,
    latitude: number
  ): any {
    let closestFeature = features[0];
    let minDistance = Infinity;

    features.forEach((feature) => {
      if (feature.geometry?.type === "Point") {
        const [lon, lat] = feature.geometry.coordinates;
        const distance = Math.sqrt(
          Math.pow(lon - longitude, 2) + Math.pow(lat - latitude, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestFeature = feature;
        }
      }
    });

    console.log(`🎯 最近要素距离: ${(minDistance * 111).toFixed(2)}公里`);

    return closestFeature;
  },
};

export default cesiumUtils;
