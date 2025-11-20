# 图层树功能快速上手指南

## 🚀 快速开始

### 1. 使用MapToolbar(最简单)

在你的地图页面中,MapToolbar已经集成了图层树功能:

```vue
<template>
  <div class="map-page">
    <vc-viewer @ready="onViewerReady">
      <!-- 你的地图配置 -->
    </vc-viewer>
    
    <!-- 工具栏(已包含图层树) -->
    <div class="toolbar-wrapper">
      <MapToolbar />
    </div>
  </div>
</template>

<script setup>
import MapToolbar from '@/mapComponents/MapToolbar.vue'
</script>
```

**就这么简单!** 点击工具栏上的图层树按钮即可使用。

### 2. 数据准备

确保你的后端API `getLayerTree()` 返回以下格式的数据:

```json
{
  "code": 200,
  "data": [
    {
      "id": "group-1",
      "name": "业务图层",
      "type": "group",
      "expanded": "true",
      "visible": "true",
      "child": [
        {
          "id": "layer-1",
          "name": "桥梁设施",
          "type": "mvt",
          "url": "/api/tiles/bridges/style.json",
          "visible": "true",
          "opacity": 1.0
        }
      ]
    }
  ]
}
```

### 3. 测试数据(可选)

如果API还未就绪,组件会自动使用Mock数据(开发模式):

- Mock数据路径: `src/assets/mockLayerTree.json`
- 可以修改Mock数据来测试不同的图层配置

## 📋 支持的图层类型

| 类型 | 说明 | URL示例 |
|------|------|---------|
| **group** | 分组节点 | 无需URL |
| **mvt** | MVT矢量瓦片 | `/api/tiles/style.json` |
| **3dTile** | 3D Tiles模型 | `/api/3dtiles/tileset.json` |
| **tile** | 普通瓦片 | `/api/tiles/{z}/{x}/{y}.pbf` |
| **wms** | WMS服务 | `http://geoserver/wms` |

## 🎯 核心功能

### ✅ 图层显示/隐藏
- 勾选复选框显示图层
- 取消勾选隐藏图层
- 自动加载/卸载图层

### ✅ 透明度调整
- 拖动滑块调整透明度(0-100%)
- 实时生效

### ✅ 分组管理
- 点击箭头展开/折叠分组
- 支持多级嵌套

### ✅ 图层类型识别
- 不同类型显示不同图标
- 标签显示类型名称(MVT/3D/WMS等)

## 🔧 配置说明

### commonService.ts

确保`getLayerTree()`方法已配置:

```typescript
export async function getLayerTree() {
  const res = await commonApi.layer.treeList()
  return res.data
}
```

### mapUtils.ts

已新增3D Tiles相关方法:
- `load3DTiles()` - 加载3D Tiles
- `remove3DTiles()` - 移除3D Tiles
- `set3DTilesVisibility()` - 设置可见性
- `set3DTilesStyle()` - 设置样式

## 📁 相关文件

```
src/
├── mapComponents/
│   ├── OptimizedLayerTree.vue    # 图层树组件
│   ├── MapToolbar.vue             # 工具栏(已集成)
│   └── Map.vue                    # 地图组件
├── mapUtils/
│   └── mapUtils.ts                # 新增3D Tiles方法
├── services/
│   └── commonService.ts           # getLayerTree接口
└── assets/
    └── mockLayerTree.json         # Mock数据
```

## ⚠️ 常见问题

### Q1: 图层树不显示?
**A:** 检查以下几点:
1. `getLayerTree()` 接口是否正常返回数据
2. 浏览器控制台是否有错误
3. 开发模式下会自动加载Mock数据

### Q2: MVT图层加载失败?
**A:** 
1. 检查URL是否正确(应指向style.json)
2. 确认网络请求成功
3. 查看Cesium控制台错误信息

### Q3: 3D Tiles不显示?
**A:**
1. 确认URL指向tileset.json
2. 检查Cesium版本是否支持3D Tiles
3. 相机位置是否正确

### Q4: 如何自定义图层样式?
**A:** 修改`OptimizedLayerTree.vue`中的SCSS样式即可。

## 🎨 样式定制

主要颜色变量:
```scss
$primary-color: #1677ff;       // 主色
$bg-color: rgba(0, 15, 35, 0.85);  // 背景色
$border-color: rgba(22, 119, 255, 0.3);  // 边框色
```

## 📚 进阶使用

### 独立使用OptimizedLayerTree

如果你想在其他地方使用图层树:

```vue
<template>
  <OptimizedLayerTree
    :viewer-instance="viewerInstance"
    @load-mvt="handleLoadMVT"
    @load-3dtiles="handleLoad3DTiles"
    @layer-toggle="handleLayerToggle"
    @layer-opacity-change="handleOpacityChange"
  />
</template>

<script setup>
import OptimizedLayerTree from '@/mapComponents/OptimizedLayerTree.vue'

// 处理MVT加载
const handleLoadMVT = async (url, layerId) => {
  // 你的加载逻辑
}

// 处理3D Tiles加载
const handleLoad3DTiles = async (url, layerId) => {
  // 你的加载逻辑
}
</script>
```

### 更新图层状态

```typescript
// 获取图层树ref
const layerTreeRef = ref()

// 更新图层状态
layerTreeRef.value.updateLayerState('layer-id', {
  loading: false,
  error: null,
  visible: true,
  opacity: 0.8
})
```

## 🔗 更多资源

- [详细文档](./src/mapComponents/README_LAYER_TREE.md)
- [完整示例](./src/mapComponents/LayerTreeExample.vue)
- [功能总结](./OPTIMIZED_LAYER_TREE_SUMMARY.md)

## 💡 提示

1. ✅ 图层按需加载,节省资源
2. ✅ 开发模式自动使用Mock数据
3. ✅ 完整的错误处理和状态反馈
4. ✅ 与现有代码完全解耦

---

**开始使用吧!** 🎉
