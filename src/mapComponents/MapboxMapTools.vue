<template>
  <div class="mapbox-tools-container">
    <div class="tools-section">
      <div class="tool-group">
        <!-- 专题地图 -->
        <n-popover
          v-model:show="layerTreeVisible"
          title="图层管理"
          placement="left-start"
          style="padding: 0; background-color: rgba(8, 21, 38, 0.7)"
          trigger="click"
          :to="false"
        >
          <div class="layer-tree-container">
            <div class="layer-tree-header">
              <img
                class="head-icon"
                src="../assets/map-img/tree-head.webp"
                alt=""
              />
              <span class="head-text">图层管理</span>
            </div>
            <LayerTree
              ref="layerTreeRef"
              @layer-toggle="handleLayerToggle"
              @layer-opacity-change="handleLayerOpacityChange"
            />
          </div>
          <template #trigger>
            <n-button
              class="tool-button"
              :type="thematicMapMode ? 'primary' : 'default'"
              size="small"
              title="专题地图"
              style="margin: 0"
            >
              <img
                class="tool-button-img"
                src="@/assets/map-img/layer.webp"
                alt=""
              />
            </n-button>
          </template>
        </n-popover>

        <!-- 地图复位 -->
        <n-button
          class="tool-button"
          type="default"
          size="small"
          @click="handleReset"
          title="地图复位"
        >
          <img
            class="tool-button-img"
            src="@/assets/map-img/reset.webp"
            alt=""
          />
        </n-button>

        <!-- 指北针 -->
        <n-button
          class="tool-button"
          :type="compassMode ? 'primary' : 'default'"
          size="small"
          @click="handleCompassToggle"
          title="指北针"
        >
          <img
            class="tool-button-img"
            src="@/assets/map-img/compass.webp"
            alt=""
          />
        </n-button>

        <!-- 测距工具 -->
        <n-button
          class="tool-button"
          :type="distanceMode ? 'primary' : 'default'"
          size="small"
          @click="handleDistanceToggle"
          title="测距工具"
        >
          <img
            class="tool-button-img"
            src="@/assets/map-img/ranging.webp"
            alt=""
          />
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, computed } from "vue";
// 移除 ant-design 图标导入，使用图片替代
import { mapboxUtils } from "../mapUtils/mapboxUtils";
import { useMapStore } from "../stores/mapStore";
import LayerTree from "../components/LayerTree.vue";
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';

// 注入地图实例
const mapInstance = inject("mapInstance");
const mapStore = useMapStore();

// 功能状态管理
const thematicMapMode = ref(false);
const compassMode = ref(false);
const distanceMode = ref(false);

// 图层树状态
const layerTreeVisible = ref(false);
const layerTreeRef = ref(null);

// 获取地图实例的computed属性
const map = computed(() => {
  return mapInstance?.value || mapStore.map;
});

// 图层显隐切换
function handleLayerToggle(layerKey, visible, layerUrl) {
  const mapInstance = map.value;
  if (!mapInstance) return;

  try {
    if (visible) {
      // 加载矢量瓦片图层
      loadVectorTileLayer(mapInstance, layerKey, layerUrl);
    } else {
      // 移除图层和相关数据源
      removeLayerAndSources(mapInstance, layerKey, layerUrl);
    }

    // 更新专题地图模式状态
    const thematicLayers = ["bridge_layer", "manhole_layer"];
    const hasVisibleThematicLayer = thematicLayers.some((layer) => {
      const layerObj = mapInstance.getLayer(layer);
      return layerObj && mapInstance.getLayoutProperty(layer, "visibility") === "visible";
    });
    thematicMapMode.value = hasVisibleThematicLayer;
  } catch (error) {
    console.error("图层切换失败:", error);
    // 如果操作失败，回滚LayerTree状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerKey, { visible: !visible });
    }
  }
}

// 图层透明度变化
function handleLayerOpacityChange(layerKey, opacity) {
  const mapInstance = map.value;
  if (!mapInstance) return;

  try {
    // 从LayerTree获取图层URL
    const layerTreeComponent = layerTreeRef.value;
    if (layerTreeComponent) {
      const layerStates = layerTreeComponent.layerStates || {};
      const layerState = layerStates[layerKey];
      if (layerState && layerState.url) {
        setLayerOpacity(mapInstance, layerKey, opacity, layerState.url);
      }
    }
  } catch (error) {
    console.error("图层透明度设置失败:", error);
  }
}

// 加载矢量瓦片图层
async function loadVectorTileLayer(map, layerKey, url) {
  try {
    // 先移除已存在的图层
    removeLayer(map, layerKey);
    
    // 获取样式配置
    const response = await fetch(url);
    const styleConfig = await response.json();
    
    // 确保地图样式包含glyphs配置
    if (styleConfig.glyphs) {
      const currentStyle = map.getStyle();
      if (!currentStyle.glyphs) {
        // 创建新的样式对象，包含glyphs配置
        const newStyle = {
          ...currentStyle,
          glyphs: styleConfig.glyphs
        };
        
        // 保存当前的数据源和图层
        const existingSources = { ...currentStyle.sources };
        const existingLayers = [...currentStyle.layers];
        
        // 设置新样式
        map.setStyle(newStyle);
        
        // 等待样式加载完成
        await new Promise(resolve => {
          map.once('styledata', () => {
            // 恢复之前的数据源和图层
            Object.entries(existingSources).forEach(([id, source]) => {
              if (!map.getSource(id)) {
                map.addSource(id, source);
              }
            });
            
            existingLayers.forEach(layer => {
              if (!map.getLayer(layer.id)) {
                map.addLayer(layer);
              }
            });
            
            resolve();
          });
        });
      }
    }
    
    // 添加数据源
    const sources = styleConfig.sources;
    for (const [sourceId, sourceConfig] of Object.entries(sources)) {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, sourceConfig);
      }
    }
    
    // 加载精灵图（如果存在）
    if (styleConfig.sprite) {
      await loadSprites(map, styleConfig.sprite);
    }
    
    // 添加图层
    const layers = styleConfig.layers;
    for (const layer of layers) {
      if (!map.getLayer(layer.id)) {
        // 创建图层副本，移除可能有问题的文本配置
        const layerCopy = { ...layer };
        
        // 如果是symbol类型且没有glyphs，则只显示图标
        if (layerCopy.type === 'symbol' && layerCopy.layout && layerCopy.layout['text-field']) {
          if (!map.getStyle().glyphs) {
            // 移除文本相关配置，只保留图标
            delete layerCopy.layout['text-field'];
            delete layerCopy.layout['text-font'];
            delete layerCopy.layout['text-size'];
            delete layerCopy.layout['text-anchor'];
            delete layerCopy.layout['text-offset'];
            delete layerCopy.layout['text-padding'];
            delete layerCopy.layout['text-max-width'];
            delete layerCopy.layout['text-optional'];
            
            if (layerCopy.paint) {
              delete layerCopy.paint['text-color'];
              delete layerCopy.paint['text-halo-color'];
              delete layerCopy.paint['text-halo-width'];
            }
          }
        }
        
        map.addLayer(layerCopy);
      }
    }
    
    console.log(`${layerKey} 矢量瓦片图层加载完成`);
  } catch (error) {
    console.error(`加载 ${layerKey} 矢量瓦片图层失败:`, error);
  }
}

// 加载精灵图
async function loadSprites(map, spriteUrl) {
  try {
    // 获取精灵图配置
    const spriteJsonResponse = await fetch(spriteUrl + '.json');
    const spriteJson = await spriteJsonResponse.json();
    
    // 创建图片元素
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    return new Promise((resolve, reject) => {
      img.onload = function() {
        // 为每个图标创建canvas并添加到地图
        for (const [key, item] of Object.entries(spriteJson)) {
          const { x, y, width, height } = item;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(img, x, y, width, height, 0, 0, width, height);
          
          const base64Url = canvas.toDataURL('image/png');
          
          // 将base64转换为ImageData
          const tempImg = new Image();
          tempImg.onload = function() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempContext = tempCanvas.getContext('2d');
            tempContext.drawImage(tempImg, 0, 0);
            const imageData = tempContext.getImageData(0, 0, width, height);
            
            if (!map.hasImage(key)) {
              map.addImage(key, imageData);
            }
          };
          tempImg.src = base64Url;
        }
        resolve();
      };
      
      img.onerror = reject;
      img.src = spriteUrl + '.png';
    });
  } catch (error) {
    console.error('加载精灵图失败:', error);
  }
}

// 移除图层
function removeLayer(map, layerId) {
  try {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(layerId)) {
      map.removeSource(layerId);
    }
    console.log(`图层 ${layerId} 移除完成`);
  } catch (error) {
    console.error(`移除图层 ${layerId} 失败:`, error);
  }
}

// 移除图层和相关数据源
async function removeLayerAndSources(map, layerKey, styleUrl) {
  try {
    // 获取样式配置以了解需要移除的图层和数据源
    const response = await fetch(styleUrl);
    const styleConfig = await response.json();
    
    // 移除图层
    const layers = styleConfig.layers;
    for (const layer of layers) {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    }
    
    // 移除数据源
    const sources = styleConfig.sources;
    for (const sourceId of Object.keys(sources)) {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    }
    
    console.log(`${layerKey} 图层和数据源移除完成`);
  } catch (error) {
    console.error(`移除 ${layerKey} 图层和数据源失败:`, error);
    // 如果获取配置失败，尝试基本的移除操作
    removeLayer(map, layerKey);
  }
}

// 切换图层可见性
function toggleLayerVisibility(map, layerId, visible) {
  try {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        "visibility",
        visible ? "visible" : "none"
      );
      console.log(`图层 ${layerId} 可见性设置为: ${visible}`);
    }
  } catch (error) {
    console.error(`设置图层 ${layerId} 可见性失败:`, error);
  }
}

// 设置图层透明度
async function setLayerOpacity(map, layerKey, opacity, styleUrl) {
  try {
    // 获取样式配置以了解所有相关图层
    const response = await fetch(styleUrl);
    const styleConfig = await response.json();
    
    const layers = styleConfig.layers;
    for (const layerConfig of layers) {
      const layerId = layerConfig.id;
      if (map.getLayer(layerId)) {
        const layer = map.getLayer(layerId);
        
        // 根据图层类型设置不同的透明度属性
        if (layer.type === "fill") {
          map.setPaintProperty(layerId, "fill-opacity", opacity);
        } else if (layer.type === "line") {
          map.setPaintProperty(layerId, "line-opacity", opacity);
        } else if (layer.type === "circle") {
          map.setPaintProperty(layerId, "circle-opacity", opacity);
        } else if (layer.type === "symbol") {
          map.setPaintProperty(layerId, "icon-opacity", opacity);
          map.setPaintProperty(layerId, "text-opacity", opacity);
        }
      }
    }
    
    console.log(`${layerKey} 图层透明度设置为: ${opacity}`);
  } catch (error) {
    console.error(`设置 ${layerKey} 图层透明度失败:`, error);
  }
}

// 移除专题图层
function removeThematicLayers(map) {
  try {
    const layers = ["bridge_layer", "manhole_layer"];
    layers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(layerId)) {
        map.removeSource(layerId);
      }
    });
    console.log("专题图层移除完成");
  } catch (error) {
    console.error("移除专题图层失败:", error);
  }
}

// 地图复位
function handleReset() {
  const mapInstance = map.value;
  if (!mapInstance) return;
  try {
    mapInstance.flyTo({
      center: [115.133954, 29.823198], // 阳新县中心坐标
      zoom: 10,
      duration: 2000,
    });
    console.log("地图复位完成");
  } catch (error) {
    console.error("地图复位失败:", error);
  }
}

// 指北针切换
function handleCompassToggle() {
  const mapInstance = map.value;
  if (!mapInstance) return;

  compassMode.value = !compassMode.value;

  try {
    if (compassMode.value) {
      // 添加导航控件（包含指北针）
      const navigationControl = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: false
      });
      mapInstance.addControl(navigationControl, 'top-right');
      mapInstance._compassControl = navigationControl;
    } else {
      // 移除指北针控件
      if (mapInstance._compassControl) {
        mapInstance.removeControl(mapInstance._compassControl);
        delete mapInstance._compassControl;
      }
    }
    console.log(`指北针${compassMode.value ? "开启" : "关闭"}`);
  } catch (error) {
    console.error("指北针操作失败:", error);
    compassMode.value = !compassMode.value; // 回滚状态
  }
}

// 测距工具切换
function handleDistanceToggle() {
  const mapInstance = map.value;
  if (!mapInstance) return;

  distanceMode.value = !distanceMode.value;

  try {
    if (distanceMode.value) {
      enableDistanceMeasurement(mapInstance);
    } else {
      disableDistanceMeasurement(mapInstance);
    }
    console.log(`测距工具${distanceMode.value ? "开启" : "关闭"}`);
  } catch (error) {
    console.error("测距工具操作失败:", error);
    distanceMode.value = !distanceMode.value; // 回滚状态
  }
}

// 启用测距功能
function enableDistanceMeasurement(map) {
  // 清除之前的测距数据
  disableDistanceMeasurement(map);
  
  // 添加测距数据源
  map.addSource('distance-source', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });
  
  // 添加线图层
  map.addLayer({
    id: 'distance-line',
    type: 'line',
    source: 'distance-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#ff0000',
      'line-width': 3
    }
  });
  
  // 添加点图层
  map.addLayer({
    id: 'distance-points',
    type: 'circle',
    source: 'distance-source',
    paint: {
      'circle-radius': 5,
      'circle-color': '#ff0000'
    },
    filter: ['==', '$type', 'Point']
  });
  
  // 初始化测距状态
  map._distancePoints = [];
  map._distanceClickHandler = (e) => handleDistanceClick(map, e);
  
  // 绑定点击事件
  map.on('click', map._distanceClickHandler);
  map.getCanvas().style.cursor = 'crosshair';
}

// 禁用测距功能
function disableDistanceMeasurement(map) {
  // 移除事件监听
  if (map._distanceClickHandler) {
    map.off('click', map._distanceClickHandler);
    delete map._distanceClickHandler;
  }
  
  // 移除图层和数据源
  if (map.getLayer('distance-line')) {
    map.removeLayer('distance-line');
  }
  if (map.getLayer('distance-points')) {
    map.removeLayer('distance-points');
  }
  if (map.getSource('distance-source')) {
    map.removeSource('distance-source');
  }
  
  // 清理状态
  delete map._distancePoints;
  map.getCanvas().style.cursor = '';
}

// 处理测距点击
function handleDistanceClick(map, e) {
  const point = [e.lngLat.lng, e.lngLat.lat];
  
  if (!map._distancePoints) {
    map._distancePoints = [];
  }
  
  map._distancePoints.push(point);
  
  const features = [];
  
  // 添加点要素
  map._distancePoints.forEach(p => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: p
      }
    });
  });
  
  // 如果有多个点，添加线要素
  if (map._distancePoints.length > 1) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: map._distancePoints
      }
    });
    
    // 计算总距离
    let totalDistance = 0;
    for (let i = 1; i < map._distancePoints.length; i++) {
      const distance = turf.distance(
        turf.point(map._distancePoints[i - 1]),
        turf.point(map._distancePoints[i]),
        { units: 'kilometers' }
      );
      totalDistance += distance;
    }
    
    console.log(`总距离: ${(totalDistance * 1000).toFixed(2)} 米`);
  }
  
  // 更新数据源
  map.getSource('distance-source').setData({
    type: 'FeatureCollection',
    features: features
  });
}
</script>

<style scoped lang="scss">
.mapbox-tools-container {
  position: absolute;
  top: 100px;
  right: 600px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tools-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 16px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.tool-button {
  width: 72px !important;
  height: 72px;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);

  .tool-button-img {
    width: 100%;
  }
}

.tool-button:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.4);
}

.tool-button:active {
  transform: translateY(0);
}
.layer-tree-header {
  display: flex;
  height: 103px;
  align-items: center;
  padding-left: 32px;
  border-bottom: 2px solid #ffffff;
  .head-icon {
    width: 28px;
    height: 30px;
  }
  .head-text {
    font-family: Source Han Sans;
    font-size: 32px;
    font-weight: 500;
    line-height: normal;
    color: #ffffff;
    margin-left: 17px;
  }
}
.layer-tree-container {
  width: 387px;
  height: 453px;
  border-radius: 10px;
  opacity: 1;
  background: linear-gradient(
    180deg,
    rgba(84, 169, 255, 0.5) 0%,
    rgba(84, 169, 255, 0) 103px,
    transparent 100%
  );

  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
}
/* 响应式设计 */
@media (max-width: 768px) {
  .tool-button {
    width: 80px;
    height: 80px;
  }

  .tool-group {
    padding: 12px;
  }
}
</style>
