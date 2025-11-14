# 地图模块使用指南

## 架构说明

### 数据显示与查询分离

本地图模块采用了**数据显示与查询分离**的设计：

- **MVT矢量瓦片** 👉 负责数据可视化（显示点位图标）
- **WFS服务** 👉 负责属性查询（获取详细信息）

### 为什么这样设计？

1. **性能优化**: MVT是瓦片化的矢量数据，加载快，渲染高效
2. **按需查询**: 只在点击时才查询详细属性，减少数据传输
3. **职责分离**: 显示和查询解耦，便于维护和扩展

## 核心功能

### 1. MVT图层加载（数据显示）

MVT图层会自动显示所有点位的可视化效果：

```typescript
// 在Map.vue的onViewerReady中自动调用
await cesiumUtils.loadMVTLayer(viewer, '/clmap/style.json')
```

**效果**: 
- ✅ 地图上显示桥梁点位图标
- ✅ 支持缩放级别控制
- ✅ 样式由style.json配置

### 2. 点击查询（获取详细信息）

点击地图上的点位时，自动触发WFS查询：

```typescript
// 点击事件处理流程
点击地图 → 获取点击坐标 → WFS查询附近要素 → 返回详细属性
```

**查询逻辑**:
```typescript
async function queryFeatureInfo(longitude: number, latitude: number) {
  // 构建缓冲区（约100米）
  const buffer = 0.001
  const bbox = [
    longitude - buffer,
    latitude - buffer,
    longitude + buffer,
    latitude + buffer
  ]
  
  // 查询该范围内的要素
  const data = await geoServerWFS.getFeaturesByBBox(
    'gspsp_dtrans_bridgebscinfo',
    bbox,
    'EPSG:4326'
  )
  
  // 返回详细属性
  return data.features[0].properties
}
```

## 使用示例

### 基础使用

```vue
<template>
  <Map ref="mapRef" />
</template>

<script setup>
import Map from '@/mapComponents/Map.vue'
import { ref } from 'vue'

const mapRef = ref()

// 地图会自动：
// 1. 加载MVT图层（显示点位）
// 2. 设置点击事件（查询详情）
</script>
```

### 手动查询

```typescript
// 查询指定位置的要素信息
const longitude = 115.133954
const latitude = 29.823198

await mapRef.value?.queryFeatureInfo(longitude, latitude)
// 控制台会输出查询结果
```

### 自定义点击处理

如果需要自定义点击后的行为，可以修改`Map.vue`中的`emitFeatureClick`函数：

```typescript
function emitFeatureClick(feature: any) {
  // 方式1: 触发Vue事件
  emit('feature-click', feature)
  
  // 方式2: 显示弹窗
  showInfoWindow(feature.properties)
  
  // 方式3: 更新Pinia状态
  mapStore.setSelectedFeature(feature)
}
```

## 数据流程图

```
┌─────────────────────────────────────────────────────┐
│                   地图初始化                          │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼─────┐
    │ 加载MVT   │    │ 设置点击   │
    │ 显示点位  │    │ 事件监听   │
    └──────────┘    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │   用户点击  │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │ 获取坐标   │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │ WFS查询   │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │ 返回详情   │
                    └───────────┘
```

## 配置说明

### MVT样式配置

`public/clmap/style.json`:

```json
{
  "sources": {
    "gspsp_dtrans_bridgebscinfo": {
      "tiles": ["https://map4.cityfun.com.cn/..."],
      "type": "vector"
    }
  },
  "layers": [
    {
      "id": "gspsp_dtrans_bridgebscinfo",
      "type": "symbol",
      "source": "gspsp_dtrans_bridgebscinfo",
      "layout": {
        "icon-image": "ql",
        "icon-size": 0.8
      }
    }
  ]
}
```

### WFS服务配置

`src/services/wfsService.ts`:

```typescript
export const geoServerWFS = createWFSService({
  baseUrl: 'http://map4.cityfun.com.cn/geoserver/wfs',
  workspace: 'CSSMX_ZT'
})
```

## 图层树集成

图层树中的"桥梁基础信息"图层对应MVT图层：

```typescript
// LayerTree2D.vue
{
  title: '桥梁基础信息',
  key: 'bridge-layer',
  layer: {
    type: 'wfs-point',  // 标识类型
    url: 'gspsp_dtrans_bridgebscinfo',
    visible: true,
    opacity: 100
  }
}
```

**注意**: 
- ✅ 勾选/取消勾选控制MVT图层可见性
- ✅ 点击查询功能始终可用（即使图层隐藏）
- ✅ 透明度控制MVT图层的透明度

## 性能优化建议

### 1. 查询缓冲区调整

```typescript
// 较小缓冲区 = 更精确，但可能查不到
const buffer = 0.0005  // 约50米

// 较大缓冲区 = 更容易查到，但可能返回多个
const buffer = 0.002   // 约200米
```

### 2. 查询结果缓存

```typescript
const queryCache = new Map()

async function queryFeatureInfo(lon: number, lat: number) {
  const key = `${lon.toFixed(4)}_${lat.toFixed(4)}`
  
  if (queryCache.has(key)) {
    return queryCache.get(key)
  }
  
  const result = await geoServerWFS.getFeaturesByBBox(...)
  queryCache.set(key, result)
  
  return result
}
```

### 3. 防抖处理

```typescript
import { debounce } from 'lodash-es'

const debouncedQuery = debounce(queryFeatureInfo, 300)
```

## 扩展功能

### 1. 显示信息弹窗

```typescript
import { Modal } from 'ant-design-vue'

function emitFeatureClick(feature: any) {
  Modal.info({
    title: '桥梁信息',
    content: h('div', [
      h('p', `名称: ${feature.properties.llmc}`),
      h('p', `编号: ${feature.properties.code}`),
      // 更多属性...
    ])
  })
}
```

### 2. 高亮选中要素

```typescript
const highlightLayer = ref(null)

function highlightFeature(feature: any) {
  // 在地图上高亮显示选中的要素
  const [lon, lat] = feature.geometry.coordinates
  
  // 添加高亮标记
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    billboard: {
      image: '/highlight-icon.png',
      scale: 1.5
    }
  })
  
  highlightLayer.value = entity
}
```

### 3. 属性面板展示

```vue
<template>
  <div class="feature-panel" v-if="selectedFeature">
    <h3>{{ selectedFeature.properties.llmc }}</h3>
    <a-descriptions bordered size="small">
      <a-descriptions-item label="桥梁编号">
        {{ selectedFeature.properties.code }}
      </a-descriptions-item>
      <a-descriptions-item label="桥梁类型">
        {{ selectedFeature.properties.type }}
      </a-descriptions-item>
      <!-- 更多属性 -->
    </a-descriptions>
  </div>
</template>
```

## 常见问题

### Q: 为什么不直接用WFS加载所有点位？
A: 
- WFS需要下载所有要素的完整属性数据，数据量大
- MVT是瓦片化的，按需加载，性能更好
- MVT只传输可视化需要的数据，WFS传输全部属性

### Q: 点击查询失败怎么办？
A: 检查以下几点：
1. WFS服务是否可访问
2. 缓冲区是否合适
3. 图层名称是否正确
4. 控制台查看详细错误

### Q: 如何调整点位图标样式？
A: 修改`style.json`中的图层配置：
```json
{
  "layout": {
    "icon-image": "your-icon",  // 图标名称
    "icon-size": 1.0            // 图标大小
  }
}
```

### Q: 可以查询其他图层吗？
A: 可以，只需修改查询的图层名称：
```typescript
await geoServerWFS.getFeaturesByBBox('other_layer_name', bbox)
```

## 总结

本模块的核心设计理念：

📊 **MVT负责显示** - 高性能矢量瓦片可视化  
🔍 **WFS负责查询** - 按需获取详细属性  
⚡ **性能优化** - 减少数据传输，提升用户体验  
🔧 **易于扩展** - 职责清晰，便于添加新功能

---

更多详细信息请参考：
- [MAP_MODULE_README.md](./MAP_MODULE_README.md) - 完整技术文档
- [MAP_QUICK_START.md](./MAP_QUICK_START.md) - 快速开始
