# 地图工具栏快速参考

## 🎯 核心功能

```
┌─────────────────────────────┐
│  地图工具栏                   │
├─────────────────────────────┤
│  ◀  收缩/展开                │
│  📋  图层树 (待开发)          │
│  🗺️  底图切换                │
│  🔄  地图重置                │
│  2D  2D/3D切换               │
│  🧭  指北针                  │
│  📏  测量工具                │
└─────────────────────────────┘
```

## 📦 组件导入

```typescript
import MapToolbar from '@/mapComponents/MapToolbar.vue'
```

## 🔧 快速集成

```vue
<template>
  <MapToolbar 
    :viewer-instance="viewer"
    @base-map-change="onBaseMapChange"
    @reset-map="onResetMap"
    @view-mode-change="onViewModeChange"
  />
</template>

<script setup lang="ts">
const onBaseMapChange = (type: 'vec' | 'img' | 'ter') => {
  console.log('底图类型:', type)
}

const onResetMap = () => {
  console.log('重置地图')
}

const onViewModeChange = (is3D: boolean) => {
  console.log('视图模式:', is3D ? '3D' : '2D')
}
</script>
```

## 🎨 样式配置

### 位置
```scss
.map-toolbar {
  right: 40px;   // 右边距
  top: 50%;      // 垂直居中
}
```

### 尺寸
```scss
.toolbar-item {
  width: 80px;   // 按钮宽度
  height: 80px;  // 按钮高度
}
```

### 颜色
```scss
border-color: rgba(22, 119, 255, 0.3);  // 边框色
background: rgba(0, 15, 35, 0.85);       // 背景色
```

## 📝 事件列表

| 事件 | 参数 | 说明 |
|------|------|------|
| `base-map-change` | `'vec' \| 'img' \| 'ter'` | 底图切换 |
| `reset-map` | - | 重置地图 |
| `view-mode-change` | `boolean` | 视图切换 |
| `measure-start` | `'distance' \| 'area'` | 开始测量 |
| `measure-clear` | - | 清除测量 |

## 🔍 底图类型

| 类型 | 值 | 说明 |
|------|---|------|
| 矢量 | `vec` | 道路、标注清晰 |
| 影像 | `img` | 卫星影像 |
| 地形 | `ter` | 地形渲染 |

## 🎯 关键方法

### 切换底图
```typescript
currentBaseMapType.value = 'img'  // 切换为影像地图
```

### 重置地图
```typescript
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(115.186322, 29.864861, 50000),
  duration: 2
})
```

### 切换视图
```typescript
sceneMode.value = 3  // 3D视图
sceneMode.value = 2  // 2D视图
```

## 📐 测量功能

```typescript
// 距离测量
measureMode.value = 'distance'

// 面积测量
measureMode.value = 'area'

// 清除测量
measureMode.value = null
```

## 🎨 图标替换

### 使用图片
```vue
<img :src="icon" class="icon-img" />
```

### 使用IconFont
```vue
<i class="iconfont icon-map"></i>
```

### 使用Ant Design Icons
```vue
<EnvironmentOutlined :style="{ fontSize: '32px' }" />
```

## 🐛 常见问题

### 工具栏不显示?
```scss
// 检查z-index
z-index: 1000;
```

### 底图切换无效?
```typescript
// 确保传入viewer实例
:viewer-instance="viewerInstance"
```

### 样式不生效?
```scss
// 使用:deep()穿透
:deep(.toolbar-item) {
  // 样式
}
```

## 📱 响应式断点

| 屏幕宽度 | 按钮尺寸 | 面板宽度 |
|---------|---------|---------|
| > 1920px | 80x80px | 240px |
| ≤ 1920px | 60x60px | 200px |

## 🚀 性能优化

```vue
<!-- 使用v-if而非v-show -->
<div v-if="!isCollapsed">
  <!-- 工具按钮 -->
</div>

<!-- 懒加载面板 -->
<transition name="slide-left">
  <div v-if="showPanel">
    <!-- 面板内容 -->
  </div>
</transition>
```

## 📚 相关文档

- [完整使用说明](./MAP_TOOLBAR_README.md)
- [图标替换指南](./MAP_TOOLBAR_ICONS_GUIDE.md)
- [vue-cesium文档](https://github.com/zouyaoji/vue-cesium)
- [Ant Design色彩](https://ant.design/docs/spec/colors-cn)

## 🔗 快速链接

```
├── 组件文件: src/mapComponents/MapToolbar.vue
├── 地图组件: src/mapComponents/Map.vue
├── 配置文件: src/config/mapConfig.ts
└── 演示页面: src/views/MapToolbarDemo.vue
```
