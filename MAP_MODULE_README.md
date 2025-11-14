# 地图功能模块使用指南

## 概述

本模块基于 `vue-cesium` 实现了一个完整的地图功能系统，包括：
- MVT矢量瓦片图层加载
- WFS服务数据查询
- 二维/三维图层树管理
- 图层可见性和透明度控制

## 模块结构

```
src/
├── mapComponents/          # 地图组件
│   ├── Map.vue            # 主地图组件
│   ├── LayerTree2D.vue    # 二维图层树
│   ├── LayerTree3D.vue    # 三维图层树
│   └── LayerManager.vue   # 图层管理容器
├── mapUtils/              # 地图工具类
│   ├── mapUtils.ts        # Cesium工具函数
│   ├── dataUtils.ts       # 数据处理工具
│   └── layerTreeUtils.ts  # 图层树工具
├── services/              # 服务层
│   └── wfsService.ts      # WFS服务
└── views/
    └── MapView.vue        # 地图页面示例
```

## 核心功能

### 1. MVT图层加载

```typescript
import cesiumUtils from '@/mapUtils/mapUtils'

// 在viewer准备就绪后加载MVT图层
await cesiumUtils.loadMVTLayer(viewer, '/clmap/style.json')
```

### 2. WFS数据查询

```typescript
import { geoServerWFS } from '@/services/wfsService'

// 查询桥梁数据
const geoJsonData = await geoServerWFS.getFeatures('gspsp_dtrans_bridgebscinfo', {
  maxFeatures: 500,
  srsName: 'EPSG:4326'
})

// 添加到地图
const dataSource = await cesiumUtils.addWFSPointsToMap(viewer, geoJsonData, {
  markerColor: '#ff4d4f',
  markerSize: 12,
  clampToGround: true
})
```

### 3. 图层树管理

#### 使用LayerManager组件

```vue
<template>
  <LayerManager
    @layer-visibility-change="handleLayerVisibilityChange"
    @layer-opacity-change="handleLayerOpacityChange"
    @locate-layer="handleLocateLayer"
  />
</template>

<script setup lang="ts">
import LayerManager from '@/mapComponents/LayerManager.vue'

function handleLayerVisibilityChange(event) {
  const { layerKey, visible } = event
  // 处理图层可见性变化
}

function handleLayerOpacityChange(event) {
  const { layerKey, opacity } = event
  // 处理图层透明度变化
}

function handleLocateLayer(event) {
  const { layerKey } = event
  // 定位到指定图层
}
</script>
```

## 组件说明

### Map.vue

主地图组件，负责：
- 初始化Cesium Viewer
- 加载MVT图层
- 查询和显示WFS数据
- 管理数据源

**Props:** 无

**Events:** 
- `layer-visibility-change`: 图层可见性变化

**Methods:**
- `toggleBridgeLayer(visible)`: 切换桥梁图层显示
- `loadBridgeData(viewer)`: 加载桥梁数据

### LayerTree2D.vue

二维图层树组件，包含：
- 基础图层（天地图矢量）
- 业务图层（MVT、WFS点数据）
- 边界图层

**Events:**
- `layer-visibility-change`: 图层可见性变化
- `layer-opacity-change`: 图层透明度变化

### LayerTree3D.vue

三维图层树组件，包含：
- 三维模型（3D Tileset）
- 地形图层
- 三维要素

**Events:**
- `layer-visibility-change`: 图层可见性变化
- `layer-opacity-change`: 图层透明度变化
- `locate-layer`: 定位到图层

### LayerManager.vue

图层管理容器，整合二维和三维图层树，提供标签页切换。

## WFS服务配置

### 默认配置

```typescript
// src/services/wfsService.ts
export const geoServerWFS = createWFSService({
  baseUrl: 'http://map4.cityfun.com.cn/geoserver/wfs',
  workspace: 'CSSMX_ZT'
})
```

### 自定义配置

```typescript
import { createWFSService } from '@/services/wfsService'

const customWFS = createWFSService({
  baseUrl: 'http://your-geoserver.com/geoserver/wfs',
  workspace: 'your_workspace',
  version: '2.0.0'
})

// 查询数据
const data = await customWFS.getFeatures('layer_name', {
  maxFeatures: 100,
  cqlFilter: "property='value'"
})
```

## 使用示例

### 完整页面示例

参考 `src/views/MapView.vue`：

```vue
<template>
  <div class="map-view">
    <Map ref="mapRef" />
    <LayerManager 
      @layer-visibility-change="handleLayerVisibilityChange"
      @layer-opacity-change="handleLayerOpacityChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Map from '@/mapComponents/Map.vue'
import LayerManager from '@/mapComponents/LayerManager.vue'

const mapRef = ref()

function handleLayerVisibilityChange({ layerKey, visible }) {
  if (layerKey === 'bridge-layer') {
    mapRef.value?.toggleBridgeLayer(visible)
  }
}

function handleLayerOpacityChange({ layerKey, opacity }) {
  console.log(`${layerKey} opacity: ${opacity}`)
}
</script>
```

## 路由配置

在 `src/router/index.ts` 中添加路由：

```typescript
{
  path: '/map',
  name: 'MapView',
  component: () => import('@/views/MapView.vue'),
  meta: { title: '地图管理' }
}
```

## 依赖项

确保已安装以下依赖：

```json
{
  "vue-cesium": "^3.2.9",
  "mvt-imagery-provider": "^1.0.3",
  "ant-design-vue": "^4.2.6"
}
```

## 样式文件配置

MVT样式文件位于：`public/clmap/style.json`

确保该文件包含正确的瓦片源配置和图层样式定义。

## 注意事项

1. **Cesium初始化**: 确保在使用地图工具函数前，Cesium Viewer已经初始化完成
2. **跨域问题**: WFS服务可能存在跨域限制，需要配置CORS或使用代理
3. **性能优化**: 大量要素时建议使用分页或范围查询
4. **图层顺序**: 图层加载顺序会影响显示效果，注意调整
5. **内存管理**: 及时清理不需要的数据源，避免内存泄漏

## API文档

### mapUtils

#### loadMVTLayer(viewer, styleUrl)
- **参数**: 
  - `viewer`: Cesium Viewer实例
  - `styleUrl`: 样式文件URL
- **返回**: Promise<MVTImageryProvider>

#### queryWFSData(baseUrl, layerName, options)
- **参数**:
  - `baseUrl`: WFS服务地址
  - `layerName`: 图层名称
  - `options`: 查询选项
- **返回**: Promise<GeoJSON>

#### addWFSPointsToMap(viewer, geoJsonData, options)
- **参数**:
  - `viewer`: Cesium Viewer实例
  - `geoJsonData`: GeoJSON数据
  - `options`: 显示选项
- **返回**: Promise<DataSource>

### WFSService

#### getFeatures(layerName, options)
查询要素数据

#### getFeaturesByBBox(layerName, bbox, srsName)
按边界框查询

#### getFeaturesByCQL(layerName, cqlFilter, options)
按CQL过滤器查询

#### describeFeatureType(typeName)
获取要素类型信息

#### getCapabilities()
获取WFS能力文档

## 扩展指南

### 添加新的图层类型

1. 在 `LayerTree2D.vue` 或 `LayerTree3D.vue` 的 `treeData` 中添加图层配置
2. 在 `mapUtils.ts` 中实现对应的加载函数
3. 在父组件中处理图层可见性事件

### 添加新的WFS服务

```typescript
import { createWFSService } from '@/services/wfsService'

export const customWFS = createWFSService({
  baseUrl: 'http://your-server.com/geoserver/wfs',
  workspace: 'workspace_name'
})
```

## 常见问题

### Q: MVT图层加载失败？
A: 检查样式文件路径和网络连接，确保样式文件格式正确

### Q: WFS查询无数据返回？
A: 检查图层名称、工作空间配置和网络连接，查看控制台错误信息

### Q: 图层不显示？
A: 检查图层可见性设置、透明度配置和数据加载状态

## 更新日志

### v1.0.0 (2025-11-14)
- ✅ 实现MVT图层加载功能
- ✅ 实现WFS数据查询服务
- ✅ 实现二维图层树管理
- ✅ 实现三维图层管理
- ✅ 实现图层可见性和透明度控制
- ✅ 提供完整的示例页面

## 联系方式

如有问题，请联系开发团队或提交Issue。
