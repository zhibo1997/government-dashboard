# 图层树组件使用说明

## 概述

`OptimizedLayerTree.vue` 是一个优化的图层树组件,用于渲染和管理地图图层。它支持多种图层类型,包括MVT矢量瓦片和3D Tiles三维模型。

## 功能特性

### 1. 图层类型支持
- **MVT** - 矢量瓦片图层
- **3dTile** - 3D Tiles三维模型
- **tile** - 普通瓦片图层
- **wms** - WMS服务图层
- **group** - 图层分组

### 2. 核心功能
- ✅ 图层树结构渲染(支持父子层级关系)
- ✅ 图层可见性控制(勾选/取消勾选)
- ✅ 图层透明度调整(0-100%)
- ✅ 分组节点展开/折叠
- ✅ 异步加载图层数据
- ✅ 图层状态管理
- ✅ 错误处理和加载状态显示

### 3. 集成特性
- 与MapToolbar完全集成
- 与Map.vue的loadMVTLayer方法解耦
- 通过事件通信机制传递数据
- 支持动态加载/卸载图层

## 数据结构

### API返回数据格式

```typescript
interface LayerTreeNode {
  id: string              // 图层唯一ID
  name: string            // 图层名称
  parentId: string        // 父节点ID
  type: 'group' | 'mvt' | 'tile' | 'wms' | '3dTile'  // 图层类型
  expanded: string        // 是否展开 ('true' | 'false')
  url: string | null      // 图层URL
  visible: string         // 是否可见 ('true' | 'false')
  opacity: number | null  // 透明度 (0-1)
  sortOrder: number       // 排序序号
  child: LayerTreeNode[] | null  // 子节点
}
```

### 示例数据

```json
[
  {
    "id": "group-1",
    "name": "业务图层",
    "type": "group",
    "expanded": "true",
    "child": [
      {
        "id": "layer-mvt-1",
        "name": "桥梁数据",
        "type": "mvt",
        "url": "/api/tiles/bridges/style.json",
        "visible": "true",
        "opacity": 1.0
      },
      {
        "id": "layer-3d-1",
        "name": "建筑模型",
        "type": "3dTile",
        "url": "/api/3dtiles/buildings/tileset.json",
        "visible": "false",
        "opacity": 0.8
      }
    ]
  }
]
```

## 组件使用

### 基础用法

```vue
<template>
  <OptimizedLayerTree
    :viewer-instance="viewerInstance"
    @load-mvt="handleLoadMVT"
    @load-3dtiles="handleLoad3DTiles"
    @layer-toggle="handleLayerToggle"
    @layer-opacity-change="handleLayerOpacityChange"
  />
</template>

<script setup>
import OptimizedLayerTree from './OptimizedLayerTree.vue'

// Cesium viewer实例
const viewerInstance = ref(null)

// MVT图层加载处理
const handleLoadMVT = async (url, layerId) => {
  console.log('加载MVT图层:', url, layerId)
  // 调用Map.vue中的loadMVTLayer方法
}

// 3D Tiles图层加载处理
const handleLoad3DTiles = async (url, layerId) => {
  console.log('加载3D Tiles:', url, layerId)
  // 调用cesiumUtils.load3DTiles方法
}

// 图层显隐切换处理
const handleLayerToggle = (layerId, visible, layerData) => {
  console.log('图层切换:', layerId, visible)
}

// 透明度变化处理
const handleLayerOpacityChange = (layerId, opacity) => {
  console.log('透明度调整:', layerId, opacity)
}
</script>
```

### 在MapToolbar中的集成

MapToolbar已经完整集成了OptimizedLayerTree,你可以直接使用:

```vue
<MapToolbar ref="toolbarRef" />
```

点击工具栏中的"图层树"按钮即可打开图层树面板。

## 事件说明

### @load-mvt
当需要加载MVT图层时触发

**参数:**
- `url: string` - MVT样式文件URL
- `layerId: string` - 图层ID

**用法:**
```typescript
const handleLoadMVT = async (url: string, layerId: string) => {
  const provider = await cesiumUtils.loadMVTLayer(viewer, url)
  // 保存provider实例供后续使用
}
```

### @load-3dtiles
当需要加载3D Tiles图层时触发

**参数:**
- `url: string` - 3D Tileset URL
- `layerId: string` - 图层ID

**用法:**
```typescript
const handleLoad3DTiles = async (url: string, layerId: string) => {
  const tileset = await cesiumUtils.load3DTiles(viewer, url)
  // 保存tileset实例供后续使用
}
```

### @layer-toggle
当图层显隐状态改变时触发

**参数:**
- `layerId: string` - 图层ID
- `visible: boolean` - 是否可见
- `layerData: any` - 图层完整数据

### @layer-opacity-change
当图层透明度改变时触发

**参数:**
- `layerId: string` - 图层ID
- `opacity: number` - 透明度值(0-1)

## API方法

### updateLayerState
更新图层状态(外部调用)

```typescript
layerTreeRef.value.updateLayerState(layerId, {
  visible: true,
  opacity: 0.8,
  loading: false,
  error: null
})
```

### fetchLayerTree
重新获取图层树数据

```typescript
layerTreeRef.value.fetchLayerTree()
```

## 样式定制

组件使用Ant Design色彩体系,主要颜色:
- 主色: #1677ff (拂晓蓝)
- 背景: rgba(0, 15, 35, 0.85)
- 边框: rgba(22, 119, 255, 0.3)

可以通过修改`OptimizedLayerTree.vue`中的SCSS变量来自定义样式。

## 性能优化

1. **按需加载** - 图层只在勾选时加载
2. **状态缓存** - 使用Map存储图层状态,避免重复计算
3. **事件防抖** - 透明度调整使用防抖处理
4. **虚拟滚动** - 大数据量时使用n-tree的虚拟滚动特性

## 注意事项

1. 确保在组件挂载后再传入`viewerInstance`
2. MVT图层URL应指向style.json文件
3. 3D Tiles URL应指向tileset.json文件
4. 图层ID必须全局唯一
5. 图层加载失败时会自动更新错误状态

## 故障排查

### 图层树不显示
- 检查getLayerTree接口是否正常返回数据
- 查看浏览器控制台是否有错误信息
- 确认数据格式是否符合LayerTreeNode接口

### MVT图层加载失败
- 检查URL是否可访问
- 确认style.json格式是否正确
- 查看Cesium控制台错误信息

### 3D Tiles加载失败
- 检查tileset.json是否存在
- 确认Cesium版本支持3D Tiles
- 检查网络请求是否成功

## 相关文件

- `OptimizedLayerTree.vue` - 图层树组件
- `MapToolbar.vue` - 地图工具栏(已集成图层树)
- `mapUtils.ts` - 地图工具函数(包含load3DTiles等方法)
- `commonService.ts` - API服务(包含getLayerTree接口)
- `mapStore.ts` - 地图状态管理
