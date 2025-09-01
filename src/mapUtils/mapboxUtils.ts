import mapboxgl from 'mapbox-gl';

// 扩展Mapbox Map类型以支持自定义属性
declare module 'mapbox-gl' {
  interface Map {
    _poiMarkers?: mapboxgl.Marker[];
  }
}

// Mapbox地图工具类
export const mapboxUtils = {
  // 创建天地图样式
  createTiandituStyle(type: 'vec' | 'img' | 'ter' = 'vec'): any {
    const tiandituKey = (import.meta as any).env?.VITE_TIANDITU_KEY || 'YOUR_TIANDITU_KEY'
    
    let baseLayer: string
    let labelLayer: string
    
    switch (type) {
      case 'vec': // 矢量底图
        baseLayer = 'vec'
        labelLayer = 'cva'
        break
      case 'img': // 影像底图
        baseLayer = 'img'
        labelLayer = 'cia'
        break
      case 'ter': // 地形底图
        baseLayer = 'ter'
        labelLayer = 'cta'
        break
      default:
        baseLayer = 'vec'
        labelLayer = 'cva'
    }
    
    // 使用v1.13.3的简化配置
    return {
      version: 8,
      name: `Tianditu ${type.toUpperCase()} Style`,
      sources: {
        [`tianditu-${baseLayer}`]: {
          type: 'raster',
          tiles: [
            `https://t0.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t1.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t2.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t3.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t4.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t5.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t6.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t7.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`
          ],
          tileSize: 256,
          attribution: '© 天地图'
        },
        [`tianditu-${labelLayer}`]: {
          type: 'raster',
          tiles: [
            `https://t0.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t1.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t2.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t3.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t4.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t5.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t6.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t7.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`
          ],
          tileSize: 256,
          attribution: '© 天地图'
        }
      },
      layers: [
        {
          id: `tianditu-${baseLayer}-layer`,
          type: 'raster',
          source: `tianditu-${baseLayer}`,
          minzoom: 0,
          maxzoom: 18
        },
        {
          id: `tianditu-${labelLayer}-layer`,
          type: 'raster',
          source: `tianditu-${labelLayer}`,
          minzoom: 0,
          maxzoom: 18
        }
      ]
    }
  },

  // 创建备用样式（当天地图不可用时）
  createFallbackStyle(): any {
    return {
      version: 8,
      name: 'Fallback Style',
      sources: {
        'osm': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },

  // 创建简化的天地图样式（v1.13.3优化）
  createSimpleTiandituStyle(type: 'vec' | 'img' | 'ter' = 'vec'): any {
    const tiandituKey = (import.meta as any).env?.VITE_TIANDITU_KEY || 'YOUR_TIANDITU_KEY'
    
    let baseLayer: string
    let labelLayer: string
    
    switch (type) {
      case 'vec': // 矢量底图
        baseLayer = 'vec'
        labelLayer = 'cva'
        break
      case 'img': // 影像底图
        baseLayer = 'img'
        labelLayer = 'cia'
        break
      case 'ter': // 地形底图
        baseLayer = 'ter'
        labelLayer = 'cta'
        break
      default:
        baseLayer = 'vec'
        labelLayer = 'cva'
    }
    
    // 简化的配置，减少子域名数量
    return {
      version: 8,
      name: `Tianditu ${type.toUpperCase()} Style`,
      sources: {
        [`tianditu-${baseLayer}`]: {
          type: 'raster',
          tiles: [
            `https://t0.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t1.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t2.tianditu.gov.cn/${baseLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`
          ],
          tileSize: 256,
          attribution: '© 天地图'
        },
        [`tianditu-${labelLayer}`]: {
          type: 'raster',
          tiles: [
            `https://t0.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t1.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
            `https://t2.tianditu.gov.cn/${labelLayer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${labelLayer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`
          ],
          tileSize: 256,
          attribution: '© 天地图'
        }
      },
      layers: [
        {
          id: `tianditu-${baseLayer}-layer`,
          type: 'raster',
          source: `tianditu-${baseLayer}`,
          minzoom: 0,
          maxzoom: 18
        },
        {
          id: `tianditu-${labelLayer}-layer`,
          type: 'raster',
          source: `tianditu-${labelLayer}`,
          minzoom: 0,
          maxzoom: 18
        }
      ]
    }
  },

  // 初始化Mapbox地图
  initMap(containerId: string): mapboxgl.Map {
    // 使用v1.13.3版本，不需要token
    console.log('使用Mapbox GL JS v1.13.3，无需token')
    
    // 尝试使用简化的天地图样式，失败时使用备用样式
    let mapStyle: any
    try {
      mapStyle = this.createSimpleTiandituStyle('vec')
      console.log('成功创建简化天地图样式')
    } catch (error) {
      console.warn('简化天地图样式创建失败，尝试完整样式:', error)
      try {
        mapStyle = this.createTiandituStyle('vec')
        console.log('成功创建完整天地图样式')
      } catch (fullError) {
        console.warn('完整天地图样式也失败，使用备用样式:', fullError)
        mapStyle = this.createFallbackStyle()
      }
    }
    
    // 创建地图实例
    const map = new mapboxgl.Map({
      container: containerId,
      style: mapStyle,
      center: [115.133954, 29.823198], // 阳新县中心坐标
      zoom: 10,
      attributionControl: true,
      customAttribution: '© 2024 阳新县应急管理局',
    });

    // 添加导航控件
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    
    // 添加全屏控件
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    
    // 添加比例尺
    map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left');

    // 添加调试信息
    console.log('地图配置:', {
      container: containerId,
      center: [115.133954, 29.823198],
      zoom: 10,
      style: 'Tianditu Vector Style'
    });

    return map;
  },

  // 切换底图类型
  switchBaseMap(map: mapboxgl.Map, type: 'vec' | 'img' | 'ter'): void {
    try {
      // 优先使用简化样式
      const newStyle = this.createSimpleTiandituStyle(type)
      map.setStyle(newStyle)
      console.log(`已切换到${type}底图（简化样式）`)
    } catch (error) {
      console.error('简化样式切换失败，尝试完整样式:', error)
      try {
        const newStyle = this.createTiandituStyle(type)
        map.setStyle(newStyle)
        console.log(`已切换到${type}底图（完整样式）`)
      } catch (fullError) {
        console.error('完整样式也失败，切换到备用样式:', fullError)
        // 如果天地图不可用，切换到备用样式
        try {
          const fallbackStyle = this.createFallbackStyle()
          map.setStyle(fallbackStyle)
          console.log('已切换到备用底图')
        } catch (fallbackError) {
          console.error('备用底图也失败:', fallbackError)
        }
      }
    }
  },

  // 检查天地图是否可用
  async checkTiandituAvailability(): Promise<boolean> {
    try {
      const testUrl = 'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=10&TILEROW=500&TILECOL=500&tk=test'
      const response = await fetch(testUrl)
      return response.ok
    } catch (error) {
      console.warn('天地图可用性检查失败:', error)
      return false
    }
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
    } = {}
  ): Promise<void> {
    const {
      strokeColor = '#fa541c',
      strokeWidth = 2,
      fillColor = 'rgba(250, 84, 28, 0.1)'
    } = options;

    // 添加数据源
    map.addSource(sourceId, {
      type: 'geojson',
      data: data
    });

    // 添加填充图层
    map.addLayer({
      id: `${sourceId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': fillColor,
        'fill-opacity': 0.8
      }
    });

    // 添加边框图层
    map.addLayer({
      id: `${sourceId}-stroke`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': strokeColor,
        'line-width': strokeWidth
      }
    });

    console.log(`GeoJSON数据源 ${sourceId} 加载完成`);
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
      // 添加数据源
      map.addSource(layerId, {
        type: 'vector',
        tiles: [url],
        minzoom: 0,
        maxzoom: 22
      });

      // 添加图层
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: layerId,
        paint: {
          'circle-radius': 4,
          'circle-color': '#1677ff',
          'circle-opacity': opacity
        },
        layout: {
          visibility: visible ? 'visible' : 'none'
        }
      });

      console.log(`矢量切片图层 ${layerId} 加载完成`);
    } catch (error) {
      console.error(`加载矢量切片图层 ${layerId} 失败:`, error);
    }
  },

  // 添加POI标注
  addPOIMarkers(map: mapboxgl.Map, poiData: any[]): void {
    poiData.forEach(poi => {
      // 创建自定义标记元素
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = `url(${poi.icon})`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.cursor = 'pointer';

      // 创建弹出窗口内容
      const popupContent = document.createElement('div');
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
        maxWidth: '300px'
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
      map._poiMarkers.forEach(marker => marker.remove());
      map._poiMarkers = [];
    }
    console.log('POI标注已清除');
  },

  // 切换图层可见性
  toggleLayerVisibility(map: mapboxgl.Map, layerName: string, visible: boolean): void {
    const layer = map.getLayer(layerName);
    if (layer) {
      map.setLayoutProperty(layerName, 'visibility', visible ? 'visible' : 'none');
      console.log(`图层 ${layerName} 可见性设置为: ${visible}`);
    }
  },

  // 测量工具相关
  currentMeasureType: 'distance' as 'distance' | 'area',
  measureMode: false,
  measurePoints: [] as [number, number][],
  measureLayerId: 'measure-layer',

  // 设置测量类型
  setMeasureType(type: 'distance' | 'area'): void {
    this.currentMeasureType = type;
    this.measureMode = true;
    console.log(`测量模式设置为: ${type}`);
  },

  // 清除测量
  clearMeasurements(): void {
    this.measureMode = false;
    this.measurePoints = [];
    console.log('测量已清除');
  },

  // 绘制工具相关
  currentDrawType: 'point' as 'point' | 'line' | 'polygon',
  drawMode: false,
  drawPoints: [] as [number, number][],
  drawLayerId: 'draw-layer',

  // 设置绘制类型
  setDrawType(type: 'point' | 'line' | 'polygon'): void {
    this.currentDrawType = type;
    this.drawMode = true;
    console.log(`绘制模式设置为: ${type}`);
  },

  // 清除绘制
  clearDrawings(): void {
    this.drawMode = false;
    this.drawPoints = [];
    console.log('绘制已清除');
  },

  // 计算两点间距离（米）
  calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371000; // 地球半径（米）
    const lat1 = point1[1] * Math.PI / 180;
    const lat2 = point2[1] * Math.PI / 180;
    const deltaLat = (point2[1] - point1[1]) * Math.PI / 180;
    const deltaLng = (point2[0] - point1[0]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
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
      const xi = coordinates[i][0] * Math.PI / 180;
      const yi = coordinates[i][1] * Math.PI / 180;
      const xj = coordinates[j][0] * Math.PI / 180;
      const yj = coordinates[j][1] * Math.PI / 180;

      area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
    }

    area = Math.abs(area * R * R / 2);
    return area;
  }
};

// 导出默认实例
export default mapboxUtils;
