# 地图模块快速开始

## 快速使用

### 1. 在路由中添加地图页面

编辑 `src/router/index.ts`：

```typescript
{
  path: '/map',
  name: 'MapView',
  component: () => import('@/views/MapView.vue'),
  meta: { 
    title: '地图管理',
    requiresAuth: true 
  }
}
```

### 2. 访问地图页面

启动项目后访问：`http://localhost:5173/map`

### 3. 基本使用

地图页面已包含以下功能：
- ✅ 天地图矢量底图
- ✅ MVT矢量瓦片图层（桥梁等基础设施）
- ✅ WFS点数据（桥梁基础信息）
- ✅ 阳新县边界
- ✅ 二维/三维图层树管理
- ✅ 图层可见性控制
- ✅ 图层透明度调节

## 核心组件使用

### Map组件（地图主体）

```vue
<template>
  <Map ref="mapRef" />
</template>

<script setup>
import Map from '@/mapComponents/Map.vue'
import { ref } from 'vue'

const mapRef = ref()

// 切换桥梁图层
function toggleBridge(visible) {
  mapRef.value?.toggleBridgeLayer(visible)
}

// 重新加载桥梁数据
async function refreshBridge() {
  await mapRef.value?.loadBridgeData(mapRef.value.viewerInstance)
}
</script>
```

### LayerManager组件（图层管理）

```vue
<template>
  <LayerManager
    @layer-visibility-change="onVisibilityChange"
    @layer-opacity-change="onOpacityChange"
  />
</template>

<script setup>
import LayerManager from '@/mapComponents/LayerManager.vue'

function onVisibilityChange({ layerKey, visible }) {
  console.log(`${layerKey}: ${visible}`)
}

function onOpacityChange({ layerKey, opacity }) {
  console.log(`${layerKey} opacity: ${opacity}`)
}
</script>
```

## 查询其他WFS数据

### 方法1：使用geoServerWFS

```typescript
import { geoServerWFS } from '@/services/wfsService'

// 查询数据
const data = await geoServerWFS.getFeatures('your_layer_name', {
  maxFeatures: 100,
  srsName: 'EPSG:4326'
})
```

### 方法2：创建自定义WFS服务

```typescript
import { createWFSService } from '@/services/wfsService'

const myWFS = createWFSService({
  baseUrl: 'http://your-server.com/geoserver/wfs',
  workspace: 'your_workspace'
})

const data = await myWFS.getFeatures('layer_name')
```

### 方法3：使用mapUtils工具

```typescript
import cesiumUtils from '@/mapUtils/mapUtils'

// 查询WFS数据
const data = await cesiumUtils.queryWFSData(
  'http://map4.cityfun.com.cn/geoserver/wfs',
  'CSSMX_ZT:gspsp_dtrans_bridgebscinfo',
  {
    maxFeatures: 500,
    srsName: 'EPSG:4326'
  }
)

// 添加到地图
const dataSource = await cesiumUtils.addWFSPointsToMap(
  viewer,
  data,
  {
    markerColor: '#1677ff',
    markerSize: 10
  }
)
```

## 添加自定义图层

### 在LayerTree2D中添加

编辑 `src/mapComponents/LayerTree2D.vue`：

```typescript
const treeData = ref([
  {
    title: '业务图层',
    key: 'business-layers',
    children: [
      // 添加你的图层
      {
        title: '我的自定义图层',
        key: 'my-custom-layer',
        layer: {
          type: 'wfs-point',
          url: 'my_layer_name',
          visible: true,
          opacity: 100
        }
      }
    ]
  }
])
```

### 在父组件中处理

```typescript
function handleLayerVisibilityChange({ layerKey, visible }) {
  if (layerKey === 'my-custom-layer') {
    // 处理你的图层显示逻辑
    loadMyCustomLayer(visible)
  }
}
```

## 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
# 天地图Token
VITE_TIANDITU_KEY=your_tianditu_token
```

### MVT样式文件

确保 `public/clmap/style.json` 存在并配置正确。

当前配置的样式文件已包含桥梁图层配置。

## 常用操作

### 1. 控制图层显示/隐藏

通过图层管理面板勾选/取消勾选对应图层。

### 2. 调整图层透明度

在图层管理面板中拖动透明度滑块。

### 3. 切换二维/三维图层

点击图层管理面板顶部的"二维图层"或"三维图层"标签。

### 4. 刷新数据

点击左侧控制按钮中的"刷新桥梁数据"按钮。

## 目录结构

```
src/
├── mapComponents/        # 地图组件
│   ├── Map.vue          # ✅ 主地图（已完成）
│   ├── LayerTree2D.vue  # ✅ 二维图层树（已完成）
│   ├── LayerTree3D.vue  # ✅ 三维图层树（已完成）
│   └── LayerManager.vue # ✅ 图层管理器（已完成）
│
├── mapUtils/            # 工具函数
│   └── mapUtils.ts      # ✅ 地图工具（已完成）
│
├── services/            # 服务层
│   └── wfsService.ts    # ✅ WFS服务（已完成）
│
└── views/
    └── MapView.vue      # ✅ 示例页面（已完成）
```

## 下一步

1. 根据需要调整图层配置
2. 添加更多业务图层
3. 实现三维模型加载（可选）
4. 添加测量工具（可选）
5. 添加查询工具（可选）

## 技术栈

- Vue 3 + TypeScript
- vue-cesium 3.2.9
- Ant Design Vue 4.2.6
- mvt-imagery-provider 1.0.3
- Pinia（状态管理）

## 注意事项

⚠️ **重要提示**：

1. 确保网络能访问 `map4.cityfun.com.cn`
2. 天地图Token需要配置在环境变量中
3. 首次加载可能较慢，需等待资源加载完成
4. 如遇到跨域问题，需配置代理或CORS

## 帮助

详细文档请查看：[MAP_MODULE_README.md](./MAP_MODULE_README.md)
