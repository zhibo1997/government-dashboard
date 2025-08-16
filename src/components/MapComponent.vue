<template>
  <div class="map-container">
    <div id="tianditu-map" class="map-instance"></div>
    <MapLegend />
    
    <!-- 区域信息弹窗 -->
    <div v-if="selectedArea" class="area-info-popup" :style="popupStyle">
      <div class="popup-header">
        <h3>{{ selectedArea.name }}</h3>
        <button @click="closePopup" class="close-btn">×</button>
      </div>
      <div class="popup-content">
        <div class="info-item">
          <span class="label">行政代码:</span>
          <span class="value">{{ selectedArea.adcode }}</span>
        </div>
        <div class="info-item">
          <span class="label">中心坐标:</span>
          <span class="value">{{ formatCoordinate(selectedArea.center) }}</span>
        </div>
        <div class="info-item">
          <span class="label">质心坐标:</span>
          <span class="value">{{ formatCoordinate(selectedArea.centroid) }}</span>
        </div>
        <div class="info-item">
          <span class="label">行政级别:</span>
          <span class="value">{{ selectedArea.level === 'district' ? '区' : '县' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick, ref, reactive } from 'vue'
import MapLegend from './MapLegend.vue'
import yangxinGeoJson from '../assets/阳新县.geoJson'

// 地图实例
let map = null
let polygonLayers = []
let labelLayers = []

// 响应式数据
const selectedArea = ref(null)
const popupStyle = reactive({
  left: '0px',
  top: '0px',
  display: 'none'
})

// 区域颜色配置
const areaColors = {
  '黄石港区': '#1677ff',
  '西塞山区': '#52c41a', 
  '下陆区': '#faad14',
  '铁山区': '#ff4d4f',
  '阳新县': '#722ed1'
}

// 加载并渲染GeoJSON数据
function loadGeoJsonData() {
  try {
    if (!yangxinGeoJson || !yangxinGeoJson.features) {
      console.error('GeoJSON数据格式错误')
      return
    }

    // 清除之前的图层
    polygonLayers.forEach(layer => {
      if (map && layer) {
        map.removeOverLay(layer)
      }
    })
    polygonLayers = []
    
    // 清除之前的标签
    labelLayers.forEach(layer => {
      if (map && layer) {
        map.removeOverLay(layer)
      }
    })
    labelLayers = []

    // 遍历每个行政区域
    yangxinGeoJson.features.forEach((feature, index) => {
      const { properties, geometry } = feature
      const areaName = properties.name
      const color = areaColors[areaName] || '#1677ff'
      
      if (geometry.type === 'MultiPolygon') {
        // 处理MultiPolygon类型
        geometry.coordinates.forEach(polygonCoords => {
          const polygon = createPolygonFromCoords(polygonCoords[0], areaName, color)
          if (polygon) {
            map.addOverLay(polygon)
            polygonLayers.push(polygon)
          }
        })
      } else if (geometry.type === 'Polygon') {
        // 处理Polygon类型
        const polygon = createPolygonFromCoords(geometry.coordinates[0], areaName, color)
        if (polygon) {
          map.addOverLay(polygon)
          polygonLayers.push(polygon)
        }
      }
    })

    console.log('GeoJSON数据加载完成，共渲染', polygonLayers.length, '个区域')
     
     // 自动调整地图视图以显示所有区域
     fitMapToGeoJson()
   } catch (error) {
     console.error('加载GeoJSON数据失败:', error)
   }
 }

// 创建多边形
function createPolygonFromCoords(coordinates, areaName, color) {
  try {
    const points = coordinates.map(coord => new T.LngLat(coord[0], coord[1]))
    
    const polygon = new T.Polygon(points, {
      color: color,
      weight: 2,
      opacity: 0.8,
      fillColor: color,
      fillOpacity: 0.3
    })

    // 添加点击事件
    polygon.addEventListener('click', (e) => {
      showAreaInfo(areaName, e)
    })

    // 添加鼠标悬停事件
    polygon.addEventListener('mouseover', () => {
      polygon.setStyle({
        fillOpacity: 0.6,
        weight: 3
      })
    })

    polygon.addEventListener('mouseout', () => {
      polygon.setStyle({
        fillOpacity: 0.3,
        weight: 2
      })
    })

    // 创建区域标签
    createAreaLabel(points, areaName)

    return polygon
   } catch (error) {
     console.error('创建多边形失败:', error)
     return null
   }
 }
 
 // 显示区域信息
 function showAreaInfo(areaName, event) {
   try {
     // 查找对应的区域数据
     const feature = yangxinGeoJson.features.find(f => f.properties.name === areaName)
     if (!feature) return
 
     selectedArea.value = {
       name: feature.properties.name,
       adcode: feature.properties.adcode,
       center: feature.properties.center,
       centroid: feature.properties.centroid,
       level: feature.properties.level
     }
 
     // 设置弹窗位置
     const mapContainer = document.getElementById('tianditu-map')
     const rect = mapContainer.getBoundingClientRect()
     
     popupStyle.left = (event.containerPoint.x + 10) + 'px'
     popupStyle.top = (event.containerPoint.y - 10) + 'px'
     popupStyle.display = 'block'
     
     console.log('显示区域信息:', areaName)
   } catch (error) {
     console.error('显示区域信息失败:', error)
   }
 }
 
 // 关闭弹窗
 function closePopup() {
   selectedArea.value = null
   popupStyle.display = 'none'
 }
 
 // 格式化坐标
 function formatCoordinate(coord) {
   if (!coord || coord.length !== 2) return '未知'
   return `${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}`
 }

// 创建区域标签
function createAreaLabel(points, areaName) {
  try {
    // 计算多边形中心点
    const center = calculatePolygonCenter(points)
    
    // 创建标签
    const label = new T.Label({
      text: areaName,
      position: center,
      offset: new T.Point(0, 0)
    })
    
    // 设置标签样式
    label.setStyle({
      color: '#333',
      fontSize: '14px',
      fontWeight: 'bold',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '4px 8px',
      textAlign: 'center'
    })
    
    map.addOverLay(label)
    labelLayers.push(label)
  } catch (error) {
    console.error('创建标签失败:', error)
  }
}

// 计算多边形中心点
function calculatePolygonCenter(points) {
  let totalLng = 0
  let totalLat = 0
  
  points.forEach(point => {
    totalLng += point.lng
    totalLat += point.lat
  })
  
  return new T.LngLat(totalLng / points.length, totalLat / points.length)
 }
 
 // 自动调整地图视图以适应GeoJSON数据
 function fitMapToGeoJson() {
   try {
     if (!yangxinGeoJson || !yangxinGeoJson.features || yangxinGeoJson.features.length === 0) {
       return
     }
 
     let minLng = Infinity, maxLng = -Infinity
     let minLat = Infinity, maxLat = -Infinity
 
     // 遍历所有要素，计算边界
     yangxinGeoJson.features.forEach(feature => {
       const { geometry } = feature
       
       if (geometry.type === 'MultiPolygon') {
         geometry.coordinates.forEach(polygonCoords => {
           polygonCoords[0].forEach(coord => {
             const [lng, lat] = coord
             minLng = Math.min(minLng, lng)
             maxLng = Math.max(maxLng, lng)
             minLat = Math.min(minLat, lat)
             maxLat = Math.max(maxLat, lat)
           })
         })
       } else if (geometry.type === 'Polygon') {
         geometry.coordinates[0].forEach(coord => {
           const [lng, lat] = coord
           minLng = Math.min(minLng, lng)
           maxLng = Math.max(maxLng, lng)
           minLat = Math.min(minLat, lat)
           maxLat = Math.max(maxLat, lat)
         })
       }
     })
 
     // 计算中心点
     const centerLng = (minLng + maxLng) / 2
     const centerLat = (minLat + maxLat) / 2
     const center = new T.LngLat(centerLng, centerLat)
 
     // 计算合适的缩放级别
     const lngSpan = maxLng - minLng
     const latSpan = maxLat - minLat
     const maxSpan = Math.max(lngSpan, latSpan)
     
     let zoom = 10
     if (maxSpan > 1) zoom = 8
     else if (maxSpan > 0.5) zoom = 9
     else if (maxSpan > 0.2) zoom = 10
     else if (maxSpan > 0.1) zoom = 11
     else zoom = 12
 
     // 设置地图中心和缩放级别
     map.centerAndZoom(center, zoom)
     
     console.log('地图视图已自动调整:', {
       center: { lng: centerLng, lat: centerLat },
       zoom: zoom,
       bounds: { minLng, maxLng, minLat, maxLat }
     })
   } catch (error) {
     console.error('自动调整地图视图失败:', error)
   }
 }

// 初始化天地图
function initTiandituMap() {
  try {
    // 检查天地图API是否加载
    if (typeof T === 'undefined') {
      console.error('天地图API未加载，请检查网络连接或API密钥')
      return
    }
    
    // 创建地图实例
    map = new T.Map('tianditu-map', {
      minZoom: 1,
      maxZoom: 18
    })
    
    // 设置地图中心点和缩放级别（以湖北阳新县为中心）
    const center = new T.LngLat(115.2, 29.8)
    map.centerAndZoom(center, 10)
    
    // 添加地图类型控件
    const ctrl = new T.Control.MapType()
    map.addControl(ctrl)
    
    console.log('天地图初始化成功')
    
    // 地图加载完成后加载GeoJSON数据
    setTimeout(() => {
      loadGeoJsonData()
    }, 1000)
  } catch (error) {
    console.error('天地图初始化失败:', error)
  }
}

onMounted(async () => {
  // 等待DOM渲染完成后初始化地图
  await nextTick()
  initTiandituMap()
})

onUnmounted(() => {
  // 清除图层
  polygonLayers.forEach(layer => {
    if (map && layer) {
      map.removeOverLay(layer)
    }
  })
  polygonLayers = []
  
  // 清除标签
  labelLayers.forEach(layer => {
    if (map && layer) {
      map.removeOverLay(layer)
    }
  })
  labelLayers = []
  
  // 销毁地图实例
  if (map) {
    map = null
  }
})
</script>

<style scoped>
.map-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.1);
  z-index: 10;
  height: 100%;
  width: 1600px;
}

.map-instance {
  width: 100%;
  height: 100%;
}

/* 区域信息弹窗样式 */
.area-info-popup {
  position: absolute;
  background: #ffffff;
  border: 1px solid var(--border-primary, #d9d9d9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-layout, #f5f5f5);
  border-bottom: 1px solid var(--border-primary, #d9d9d9);
  border-radius: 8px 8px 0 0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, rgba(0, 0, 0, 0.88));
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-secondary, rgba(0, 0, 0, 0.65));
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-primary, rgba(0, 0, 0, 0.88));
}

.popup-content {
  padding: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(5, 5, 5, 0.06);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-item .label {
  font-weight: 500;
  color: var(--text-secondary, rgba(0, 0, 0, 0.65));
  font-size: 14px;
}

.info-item .value {
  font-weight: 400;
  color: var(--text-primary, rgba(0, 0, 0, 0.88));
  font-size: 14px;
  text-align: right;
  max-width: 180px;
  word-break: break-all;
}

/* 弹窗动画 */
.area-info-popup {
  animation: popupFadeIn 0.2s ease-out;
}

@keyframes popupFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>