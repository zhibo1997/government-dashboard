# 3D Tiles 集成说明

## 概述

本项目已成功集成 deck.gl + Mapbox 方案，用于在地图上展示 3D Tiles 模型数据。该实现不影响现有的 Mapbox 地图组件功能。

## 技术架构

### 核心技术栈
- **Mapbox GL JS**: v1.13.3 (作为底图)
- **deck.gl**: v9.2.2 (3D 渲染引擎)
- **@deck.gl/mapbox**: Mapbox 集成层
- **@deck.gl/geo-layers**: 3D Tiles 图层支持

### 文件结构

```
src/
├── mapUtils/
│   └── tiles3DUtils.ts           # 3D Tiles 工具类
├── mapComponents/
│   ├── Tiles3DComponent.vue      # 3D Tiles 组件
│   └── tilese.json               # 3D Tiles 数据源(源文件)
└── views/
    └── Tiles3DView.vue           # 3D Tiles 展示页面

public/
└── tilese.json                   # 3D Tiles 数据源(HTTP访问)
```

## 使用方法

### 1. 访问 3D Tiles 页面

启动开发服务器后，访问以下路由：

```
http://localhost:5173/#/tiles3d
```

### 2. 在自定义组件中使用

```vue
<template>
  <Tiles3DComponent 
    :tileset-url="'/tilese.json'"
    :auto-load="true"
  />
</template>

<script setup>
import Tiles3DComponent from '@/mapComponents/Tiles3DComponent.vue';
</script>
```

### 3. 使用工具类 API

```typescript
import { tiles3DUtils } from '@/mapUtils/tiles3DUtils';
import mapboxgl from '@cgcs2000/mapbox-gl';

// 假设已有 Mapbox 地图实例
const map = new mapboxgl.Map({ ... });

// 添加 3D Tiles 图层
tiles3DUtils.add3DTilesLayer(map, {
  id: 'my-3d-tiles',
  tilesetUrl: '/tilese.json',
  onLoad: () => console.log('加载成功'),
  onError: (err) => console.error('加载失败', err),
});

// 切换可见性
tiles3DUtils.toggle3DTilesLayer(map, 'my-3d-tiles');

// 移除图层
tiles3DUtils.remove3DTilesLayer(map, 'my-3d-tiles');
```

## 工具类 API 说明

### `tiles3DUtils.add3DTilesLayer(map, options)`

添加 3D Tiles 图层到地图。

**参数：**
- `map: mapboxgl.Map` - Mapbox 地图实例
- `options: Object` - 配置选项
  - `id: string` - 图层 ID（必填）
  - `tilesetUrl: string` - 3D Tiles 数据源 URL（必填）
  - `onLoad?: () => void` - 加载成功回调
  - `onError?: (error: Error) => void` - 加载失败回调
  - `_lighting?: string` - 光照模式，默认 'pbr'
  - `opacity?: number` - 透明度，范围 0-1

**返回：** `MapboxLayer` 实例

### `tiles3DUtils.remove3DTilesLayer(map, layerId)`

移除 3D Tiles 图层。

**参数：**
- `map: mapboxgl.Map` - Mapbox 地图实例
- `layerId: string` - 图层 ID

### `tiles3DUtils.update3DTilesLayer(map, layerId, props)`

更新 3D Tiles 图层属性。

**参数：**
- `map: mapboxgl.Map` - Mapbox 地图实例
- `layerId: string` - 图层 ID
- `props: Object` - 要更新的属性
  - `opacity?: number` - 透明度
  - `visible?: boolean` - 可见性

### `tiles3DUtils.toggle3DTilesLayer(map, layerId)`

切换 3D Tiles 图层可见性。

**参数：**
- `map: mapboxgl.Map` - Mapbox 地图实例
- `layerId: string` - 图层 ID

### `tiles3DUtils.has3DTilesLayer(map, layerId)`

检查 3D Tiles 图层是否存在。

**参数：**
- `map: mapboxgl.Map` - Mapbox 地图实例
- `layerId: string` - 图层 ID

**返回：** `boolean`

## 组件 Props

### Tiles3DComponent

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tilesetUrl` | `string` | `'/tilese.json'` | 3D Tiles 数据源 URL |
| `autoLoad` | `boolean` | `true` | 是否自动加载 |

## 控制面板功能

3D Tiles 组件内置控制面板，位于右上角，提供以下功能：

1. **显示/隐藏模型** - 切换 3D 模型可见性
2. **透明度调节** - 调整模型透明度（0-100%）
3. **重置视角** - 恢复默认视角和位置

## 交互操作

- **旋转视角**: 鼠标左键拖拽
- **缩放**: 鼠标滚轮
- **调整俯仰角**: 鼠标右键拖拽（或 Ctrl + 鼠标左键）
- **平移**: Shift + 鼠标左键拖拽

## 数据格式说明

3D Tiles 数据源需符合 [3D Tiles 规范](https://github.com/CesiumGS/3d-tiles)。

本项目使用的 `tilese.json` 是一个标准的 3D Tiles tileset.json 文件，包含：
- 资产信息（asset）
- 几何误差（geometricError）
- 根节点（root）
- 边界体（boundingVolume）
- 子节点（children）

## 注意事项

### 1. 数据源路径

3D Tiles 数据源必须通过 HTTP 访问，因此：
- 开发环境：放在 `public/` 目录下
- 生产环境：确保数据文件在服务器上可访问

### 2. CORS 问题

如果 3D Tiles 数据来自外部服务器，需要确保：
- 服务器配置了正确的 CORS 头
- 或使用代理服务器转发请求

### 3. 性能优化

- 限制最大缩放级别，避免加载过多细节
- 使用合适的 `geometricError` 值控制细节层级
- 启用瓦片缓存

### 4. 与现有地图组件的关系

- `Tiles3DComponent` 是独立组件，不影响 `MapboxMapComponent`
- 两者可以同时存在于应用中
- 如需在现有地图上叠加 3D Tiles，使用 `tiles3DUtils` 工具类

## 故障排查

### 问题：3D Tiles 无法加载

**可能原因：**
1. 数据源 URL 不正确
2. 数据格式不符合 3D Tiles 规范
3. CORS 限制

**解决方案：**
1. 检查控制台错误信息
2. 确认数据源可访问：在浏览器中直接访问 URL
3. 验证 JSON 格式是否正确

### 问题：模型显示位置不正确

**可能原因：**
1. 坐标系不匹配
2. 变换矩阵（transform）配置错误

**解决方案：**
1. 检查 tileset.json 中的 `transform` 矩阵
2. 确保使用正确的坐标系（WGS84）
3. 使用 `fitBounds` 方法自动调整视角

### 问题：性能较差

**解决方案：**
1. 降低最大缩放级别
2. 调整 `geometricError` 值
3. 减少同时加载的瓦片数量
4. 检查硬件加速是否启用

## 扩展开发

### 添加自定义样式

可以通过修改 `Tiles3DComponent.vue` 中的样式配置：

```typescript
tiles3DUtils.add3DTilesLayer(map, {
  id: 'my-tiles',
  tilesetUrl: '/tilese.json',
  _lighting: 'pbr',  // 或 'flat'
  opacity: 0.8,
  // 更多 deck.gl Tiles3DLayer 选项
});
```

### 添加交互事件

```typescript
// 在 Tiles3DComponent.vue 中添加
map.on('click', (e) => {
  // 点击 3D 模型时的处理逻辑
  console.log('点击位置:', e.lngLat);
});
```

### 多个 3D Tiles 图层

```typescript
// 可以添加多个独立的 3D Tiles 图层
tiles3DUtils.add3DTilesLayer(map, {
  id: 'tiles-layer-1',
  tilesetUrl: '/tileset1.json',
});

tiles3DUtils.add3DTilesLayer(map, {
  id: 'tiles-layer-2',
  tilesetUrl: '/tileset2.json',
});
```

## 参考文档

- [deck.gl 官方文档](https://deck.gl/)
- [Tiles3DLayer API](https://deck.gl/docs/api-reference/geo-layers/tiles-3d-layer)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- [3D Tiles 规范](https://github.com/CesiumGS/3d-tiles)

## 版本信息

- 创建日期: 2025-10-20
- deck.gl 版本: 9.2.2
- Mapbox GL JS 版本: 1.13.3
