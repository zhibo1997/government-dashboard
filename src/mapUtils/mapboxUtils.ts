import mapboxgl from "@cgcs2000/mapbox-gl";
import baseStyle from "./cssmx_base.json";

// 扩展Mapbox Map类型以支持自定义属性
declare module "mapbox-gl" {
  interface Map {
    _poiMarkers?: mapboxgl.Marker[];
    _distanceEventHandlers?: Array<{
      type: string;
      handler: (e: any) => void;
    }>;
  }
}

// Mapbox地图工具类
export const mapboxUtils = {
  // 创建天地图样式（简化版）
  createTiandituStyle(type: "vec" | "img" | "ter" = "vec"): any {
    // 从环境变量获取key，如果没有则返回OSM样式
    const key = (import.meta as any).env?.VITE_TIANDITU_KEY;

    // 天地图图层映射
    const layerMap = {
      vec: { base: "vec", label: "cva" },
      img: { base: "img", label: "cia" },
      ter: { base: "ter", label: "cta" },
    };

    const layers = layerMap[type];

    return {
      version: 8,
      sources: {
        // 底图
        "tianditu-base": {
          type: "raster",
          tiles: [
            `https://t0.tianditu.gov.cn/DataServer?T=${layers.base}_w&x={x}&y={y}&l={z}&tk=${key}`,
          ],
          tileSize: 256,
          minzoom: 3,
          maxzoom: 15, // 降低最大缩放级别，提升性能
        },
      },
      layers: [
        // 底图
        {
          id: "tianditu-base",
          type: "raster",
          source: "tianditu-base",
        },
        // 标注层
        {
          id: "tianditu-label",
          type: "raster",
          source: "tianditu-label",
        },
      ],
    };
  },

  // 创建备用样式（OSM）
  createFallbackStyle(): any {
    return {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
        },
      },
      layers: [{ id: "osm", type: "raster", source: "osm" }],
    };
  },

  // 创建简化天地图样式（默认使用）
  createSimpleTiandituStyle(type: "vec" | "img" | "ter" = "vec"): any {
    return this.createTiandituStyle(type);
  },

  // 初始化Mapbox地图
  initMap(containerId: string): mapboxgl.Map {
    const map = new mapboxgl.Map({
      container: containerId,
      // style: this.createTiandituStyle("vec"), // 会自动判断key是否可用
      style: baseStyle,
      center: [115.186322, 29.864861],
      zoom: 12,
      pitch: 30,
      minZoom: 3, // 限制最小缩放级别
      maxZoom: 15, // 限制最大缩放级别，提升性能
      attributionControl: false,
      // 性能优化选项
      renderWorldCopies: false, // 不渲染世界副本
      maxTileCacheSize: 50, // 限制瓦片缓存大小
    });

    // 添加基础控件
    map.addControl(new mapboxgl.NavigationControl(), "top-left");
    map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    return map;
  },

  // 简化的天地图初始化方法（基于你的建议）
  initSimpleTiandituMap(
    containerId: string,
    type: "vec" | "img" | "ter" = "vec"
  ): mapboxgl.Map {
    const key = (import.meta as any).env?.VITE_TIANDITU_KEY;

    // 天地图图层映射
    const layerMap = {
      vec: { base: "vec", label: "cva" },
      img: { base: "img", label: "cia" },
      ter: { base: "ter", label: "cta" },
    };
    const layers = layerMap[type];
    const style = {
      version: 8,
      sources: {
        "tianditu-base": {
          type: "raster",
          tiles: [
            `https://t0.tianditu.gov.cn/DataServer?T=${layers.base}_c&x={x}&y={y}&l={z}&tk=${key}`,
          ],
          minzoom: 3,
          maxzoom: 15,
        },
        "tianditu-img": {
          type: "raster",
          tiles: [
            `https://t0.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=${key}`,
          ],
          minzoom: 3,
          maxzoom: 15,
        },

        "tianditu-ter": {
          type: "raster",
          tiles: [
            `https://t0.tianditu.gov.cn/DataServer?T=ter_c&x={x}&y={y}&l={z}&tk=${key}`,
          ],
          minzoom: 3,
          maxzoom: 15,
        },
      },
      center: [120.727, 31.852],
      glyphs:
        "http://192.168.2.89/CSSMX/CSSMX_ZT/fonts/{fontstack}/{range}.pbf",
      sprite: "http://192.168.2.89/CSSMX/CSSMX_ZT/sprites/sprite",
      layers: [
        {
          id: "tianditu-base",
          type: "raster",
          source: "tianditu-base",
          layout: { visibility: 'none' }
        },
        {
          id: "tianditu-img",
          type: "raster",
          source: "tianditu-img"
        }, {
          id: "tianditu-ter",
          type: "raster",
          source: "tianditu-ter",
          layout: { visibility: 'none' }
        }
      ],
    };
    console.log("🚀 ~ initSimpleTiandituMap ~ baseStyle:", baseStyle);
    const map = new mapboxgl.Map({
      container: containerId,
      // style: baseStyle,
      style: style,
      center: [115.186322, 29.864861],
      zoom: 14,
    });
    addImages(map, baseStyle.sprite);

    // 添加基础控件
    map.addControl(new mapboxgl.NavigationControl(), "top-left");
    map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    return map;
  },

  // 飞行到指定位置
  flyTo(lng: number, lat: number, zoom: number = 10): void {
    // 这个方法需要在有地图实例的情况下调用
    console.log(`飞行到位置: ${lng}, ${lat}, 缩放级别: ${zoom}`);
  },

  // 加载GeoJSON数据
  async loadGeoJSON(
    map: mapboxgl.Map,
    sourceId: string,
    data: any,
    options: {
      strokeColor?: string;
      strokeWidth?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeOpacity?: number;
    } = {}
  ): Promise<void> {
    const {
      strokeColor = "#1677ff", // 使用Ant Design主色
      strokeWidth = 4,
      fillColor = "rgba(22, 119, 255, 1)", // 使用Ant Design主色透明度
      fillOpacity = 0.1,
      strokeOpacity = 1.0,
    } = options;

    // 检查数据源是否已存在
    if (map.getSource(sourceId)) {
      console.log(`数据源 ${sourceId} 已存在，跳过加载`);
      return;
    }

    // 添加数据源
    map.addSource(sourceId, {
      type: "geojson",
      data: data,
    });

    // 添加填充图层（带边框颜色）
    map.addLayer({
      id: `${sourceId}-fill`,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": fillColor,
        "fill-opacity": fillOpacity,
        "fill-outline-color": strokeColor, // 填充图层的边框颜色
      },
    });

    // 添加边框图层（更明显的边框）
    map.addLayer({
      id: `${sourceId}-stroke`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": strokeColor,
        "line-width": strokeWidth,
        "line-opacity": strokeOpacity,
      },
    });

    console.log(`GeoJSON数据源 ${sourceId} 加载完成，边框颜色: ${strokeColor}, 填充色: ${fillColor}`);
  },

  // 加载矢量切片图层
  async loadVectorTileLayer(
    map: mapboxgl.Map,
    layerId: string,
    url: string,
    options: {
      visible?: boolean;
      opacity?: number;
    } = {}
  ): Promise<void> {
    const { visible = true, opacity = 1.0 } = options;

    try {
      // 检查source是否已存在
      if (!map.getSource(layerId)) {
        // TODO: 实现矢量切片图层加载逻辑
        console.log(`准备加载矢量切片图层 ${layerId}, 可见性: ${visible}, 透明度: ${opacity}`);
      }

      console.log(`矢量切片图层 ${layerId} 加载完成`);
    } catch (error) {
      console.error(`加载矢量切片图层 ${layerId} 失败:`, error);
    }
  },

  // 添加POI标注
  addPOIMarkers(map: mapboxgl.Map, poiData: any[]): void {
    poiData.forEach((poi) => {
      // 创建自定义标记元素
      const el = document.createElement("div");
      el.className = "poi-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.backgroundImage = `url(${poi.icon})`;
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.cursor = "pointer";

      // 创建弹出窗口内容
      const popupContent = document.createElement("div");
      popupContent.innerHTML = `
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">${poi.name}</h4>
          <div style="color: var(--text-secondary); font-size: 12px;">${poi.description}</div>
        </div>
      `;

      // 创建弹出窗口
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: "300px",
      }).setDOMContent(popupContent);

      // 创建标记
      const marker = new mapboxgl.Marker(el)
        .setLngLat(poi.position)
        .setPopup(popup)
        .addTo(map);

      // 存储标记引用以便后续管理
      if (!map._poiMarkers) {
        map._poiMarkers = [];
      }
      map._poiMarkers.push(marker);
    });

    console.log(`添加了 ${poiData.length} 个POI标注`);
  },

  // 清除POI标注
  clearPOIMarkers(map: mapboxgl.Map): void {
    if (map._poiMarkers) {
      map._poiMarkers.forEach((marker) => marker.remove());
      map._poiMarkers = [];
    }
    console.log("POI标注已清除");
  },

  // 切换图层可见性
  toggleLayerVisibility(
    map: mapboxgl.Map,
    layerName: string,
    visible: boolean
  ): void {
    const layer = map.getLayer(layerName);
    if (layer) {
      map.setLayoutProperty(
        layerName,
        "visibility",
        visible ? "visible" : "none"
      );
      console.log(`图层 ${layerName} 可见性设置为: ${visible}`);
    }
  },

  // 测量工具相关
  currentMeasureType: "distance" as "distance" | "area",
  measureMode: false,
  measurePoints: [] as [number, number][],
  measureLayerId: "measure-layer",

  // 设置测量类型
  setMeasureType(type: "distance" | "area"): void {
    this.currentMeasureType = type;
    this.measureMode = true;
    console.log(`测量模式设置为: ${type}`);
  },

  // 清除测量
  clearMeasurements(): void {
    this.measureMode = false;
    this.measurePoints = [];
    console.log("测量已清除");
  },

  // 绘制工具相关
  currentDrawType: "point" as "point" | "line" | "polygon",
  drawMode: false,
  drawPoints: [] as [number, number][],
  drawLayerId: "draw-layer",

  // 设置绘制类型
  setDrawType(type: "point" | "line" | "polygon"): void {
    this.currentDrawType = type;
    this.drawMode = true;
    console.log(`绘制模式设置为: ${type}`);
  },

  // 清除绘制
  clearDrawings(): void {
    this.drawMode = false;
    this.drawPoints = [];
    console.log("绘制已清除");
  },

  // 计算两点间距离（米）
  calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const R = 6371000; // 地球半径（米）
    const lat1 = (point1[1] * Math.PI) / 180;
    const lat2 = (point2[1] * Math.PI) / 180;
    const deltaLat = ((point2[1] - point1[1]) * Math.PI) / 180;
    const deltaLng = ((point2[0] - point1[0]) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  // 计算多边形面积（平方米）
  calculateArea(coordinates: [number, number][]): number {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const R = 6371000; // 地球半径（米）

    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      const xi = (coordinates[i][0] * Math.PI) / 180;
      const yi = (coordinates[i][1] * Math.PI) / 180;
      const xj = (coordinates[j][0] * Math.PI) / 180;
      const yj = (coordinates[j][1] * Math.PI) / 180;

      area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
    }

    area = Math.abs((area * R * R) / 2);
    return area;
  },

  // 地图复位工具
  resetMap(map: mapboxgl.Map): void {
    if (map) {
      map.flyTo({
        center: [115.186322, 29.864861],
        zoom: 14,
        duration: 2000,
      });
      console.log("地图已复位到初始状态");
    }
  },

  // 添加指北针控件
  addCompassControl(
    map: mapboxgl.Map,
    position:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right" = "top-right"
  ): void {
    if (map) {
      // 创建自定义指北针控件
      const compassControl = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: false,
        visualizePitch: false,
      });

      map.addControl(compassControl, position);
      console.log("指北针控件已添加");
    }
  },

  // 测距工具相关
  distanceMode: false,
  distancePoints: [] as [number, number][],
  distanceLayerId: "distance-layer",
  distanceSourceId: "distance-source",

  // 启用测距模式
  enableDistanceMode(map: mapboxgl.Map): void {
    this.distanceMode = true;
    this.distancePoints = [];

    // 添加测距图层
    if (!map.getSource(this.distanceSourceId)) {
      map.addSource(this.distanceSourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // 添加线条图层
      map.addLayer({
        id: `${this.distanceLayerId}-line`,
        type: "line",
        source: this.distanceSourceId,
        paint: {
          "line-color": "#1677ff",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });

      // 添加点图层
      map.addLayer({
        id: `${this.distanceLayerId}-points`,
        type: "circle",
        source: this.distanceSourceId,
        paint: {
          "circle-radius": 6,
          "circle-color": "#1677ff",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // 添加标签图层
      map.addLayer({
        id: `${this.distanceLayerId}-labels`,
        type: "symbol",
        source: this.distanceSourceId,
        layout: {
          "text-field": ["get", "label"],
          "text-font": ["Open Sans Regular"],
          "text-size": 12,
          "text-offset": [0, -1.5],
        },
        paint: {
          "text-color": "#1677ff",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      });
    }

    // 绑定点击事件
    this.bindDistanceEvents(map);
    console.log("测距模式已启用");
  },

  // 绑定测距事件
  bindDistanceEvents(map: mapboxgl.Map): void {
    const handleClick = (e: any) => {
      if (!this.distanceMode) return;

      const lngLat = e.lngLat;
      this.distancePoints.push([lngLat.lng, lngLat.lat]);

      this.updateDistanceDisplay(map);

      // 双击结束测距
      if (this.distancePoints.length >= 2) {
        setTimeout(() => {
          this.finishDistanceMeasurement(map);
        }, 300);
      }
    };

    const handleDblClick = (e: any) => {
      if (this.distanceMode) {
        e.preventDefault();
        this.finishDistanceMeasurement(map);
      }
    };

    map.on("click", handleClick);
    map.on("dblclick", handleDblClick);

    // 存储事件处理器引用以便后续移除
    if (!map._distanceEventHandlers) {
      map._distanceEventHandlers = [];
    }
    map._distanceEventHandlers.push(
      { type: "click", handler: handleClick },
      { type: "dblclick", handler: handleDblClick }
    );
  },

  // 更新测距显示
  updateDistanceDisplay(map: mapboxgl.Map): void {
    if (this.distancePoints.length < 2) return;

    const features: any[] = [];

    // 添加线条
    if (this.distancePoints.length >= 2) {
      features.push({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: this.distancePoints,
        },
        properties: {},
      });
    }

    // 添加点
    this.distancePoints.forEach((point, index) => {
      features.push({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: point,
        },
        properties: {
          label: `P${index + 1}`,
        },
      });
    });

    // 添加距离标签
    if (this.distancePoints.length >= 2) {
      const midPoint = this.getMidPoint(
        this.distancePoints[0],
        this.distancePoints[1]
      );
      const distance = this.calculateDistance(
        this.distancePoints[0],
        this.distancePoints[1]
      );

      features.push({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: midPoint,
        },
        properties: {
          label: `${(distance / 1000).toFixed(2)}km`,
        },
      });
    }

    const source = map.getSource(
      this.distanceSourceId
    ) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: features,
      });
    }
  },

  // 完成测距
  finishDistanceMeasurement(map: mapboxgl.Map): void {
    if (this.distancePoints.length >= 2) {
      const totalDistance = this.calculateTotalDistance(this.distancePoints);
      console.log(`测距完成，总距离: ${(totalDistance / 1000).toFixed(2)}km`);
    }

    this.disableDistanceMode(map);
  },

  // 禁用测距模式
  disableDistanceMode(map: mapboxgl.Map): void {
    this.distanceMode = false;

    // 移除事件处理器
    if (map._distanceEventHandlers) {
      map._distanceEventHandlers.forEach(({ type, handler }) => {
        map.off(type, handler);
      });
      map._distanceEventHandlers = [];
    }

    // 清除测距数据
    this.clearDistanceMeasurement(map);
    console.log("测距模式已禁用");
  },

  // 清除测距数据
  clearDistanceMeasurement(map: mapboxgl.Map): void {
    this.distancePoints = [];

    const source = map.getSource(
      this.distanceSourceId
    ) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
    }

    console.log("测距数据已清除");
  },

  // 计算总距离
  calculateTotalDistance(points: [number, number][]): number {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += this.calculateDistance(points[i], points[i + 1]);
    }
    return totalDistance;
  },

  // 获取两点中点
  getMidPoint(
    point1: [number, number],
    point2: [number, number]
  ): [number, number] {
    return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
  },
};

// 导出默认实例
export default mapboxUtils;
function addImages(map: mapboxgl.Map, spriteurl: string) {
  fetch(spriteurl + ".json")
    .then((response) => response.json())
    .then((spriteJson) => {
      var img = new Image();
      img.onload = function () {
        for (let key in spriteJson) {
          let item = spriteJson[key];
          let { x, y, width, height } = item;
          let canvas = createCavans(width, height);
          let context = canvas.getContext("2d");
          if (context) {
            context.drawImage(img, x, y, width, height, 0, 0, width, height);
            let base64Url = canvas.toDataURL("image/png");

            map.loadImage(base64Url, (error: any, simg: any) => {
              if (!map.hasImage(key)) {
                map.addImage(key, simg);
              }
            });
          }
        };
        img.crossOrigin = "anonymous";
        img.src = spriteurl + ".png";
      }
    })
  function createCavans(width: number, height: number) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}
