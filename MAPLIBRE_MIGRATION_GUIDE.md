<!--
 * @Author: Do not edit
 * @Date: 2025-10-20 22:43:23
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 22:43:27
 * @Description: 
-->
# MapLibre GL 迁移指南

## 📦 迁移概述

本项目已从 `@cgcs2000/mapbox-gl` 成功迁移至 `maplibre-gl`。MapLibre GL 是 Mapbox GL 的开源分支,API 99% 兼容,主要优势包括:

- ✅ **开源免费**:无需 token,完全开源
- ✅ **API 兼容**:大部分 API 与 Mapbox GL v1.x 保持一致
- ✅ **性能优化**:持续优化性能,社区活跃
- ✅ **独立发展**:不受商业限制,功能更新更快

---

## 🔄 核心变更

### 1. 依赖包替换

**之前**:
```json
{
  "dependencies": {
    "@cgcs2000/mapbox-gl": "^1.13.3"
  },
  "devDependencies": {
    "@types/mapbox-gl": "1.13.10"
  }
}
```

**之后**:
```json
{
  "dependencies": {
    "maplibre-gl": "^5.9.0"
  },
  "devDependencies": {
    "@types/maplibre-gl": "^5.9.0"
  }
}
```

### 2. CSS 样式导入

**重要**: 需要在项目入口文件中导入 MapLibre 的 CSS 样式。

在 `src/main.js` 中添加:

```javascript
import 'maplibre-gl/dist/maplibre-gl.css'
```

### 3. 导入语句更新

**之前**:
```typescript
import mapboxgl from '@cgcs2000/mapbox-gl'
import type { Map } from 'mapbox-gl'
```

**之后**:
```typescript
import mapboxgl from 'maplibre-gl'
import type { Map } from 'maplibre-gl'
```

---

## 📝 已迁移文件清单

### 工具类 (mapUtils)
- ✅ [`mapboxUtils.ts`](./src/mapUtils/mapboxUtils.ts) - 核心地图工具类
- ✅ [`tiles3DUtils.ts`](./src/mapUtils/tiles3DUtils.ts) - 3D Tiles 工具类
- ✅ [`measureUtils.ts`](./src/mapUtils/measureUtils.ts) - 测量工具类
- ⚪ [`dataUtils.ts`](./src/mapUtils/dataUtils.ts) - 数据工具类 (无需修改)
- ⚪ [`layerTreeUtils.ts`](./src/mapUtils/layerTreeUtils.ts) - 图层树工具类 (无需修改)

### 组件 (mapComponents)
- ✅ [`MapboxMapComponent.vue`](./src/mapComponents/MapboxMapComponent.vue) - 主地图组件
- ✅ [`MapboxMapTools.vue`](./src/mapComponents/MapboxMapTools.vue) - 地图工具组件
- ✅ [`Tiles3DComponent.vue`](./src/mapComponents/Tiles3DComponent.vue) - 3D Tiles 组件

### 类型定义
- ✅ [`mapbox-gl.d.ts`](./src/types/mapbox-gl.d.ts) - 类型声明文件

---

## 🔧 API 差异处理

### 1. 样式对象类型

MapLibre GL v5.x 对样式对象的类型检查更严格。

**解决方案**: 使用类型断言 `as any`

```typescript
const map = new mapboxgl.Map({
  container: 'map',
  style: baseStyle as any,  // 添加 as any
  center: [115.186322, 29.864861],
  zoom: 12,
})
```

### 2. loadImage API

MapLibre GL 的 `loadImage` 返回 Promise,而不是回调函数。

**之前** (Mapbox GL):
```typescript
map.loadImage(url, (error, image) => {
  if (!error) {
    map.addImage('icon', image)
  }
})
```

**之后** (MapLibre GL):
```typescript
map.loadImage(url)
  .then(image => {
    if (image) {
      map.addImage('icon', image.data)
    }
  })
  .catch(error => {
    console.error('Failed to load image:', error)
  })
```

### 3. deck.gl 集成

deck.gl 的 `@deck.gl/mapbox` 与 MapLibre 存在类型不兼容,需要类型断言。

```typescript
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox'

// 使用 as any 来解决类型兼容性问题
tiles3DUtils.load3DTiles(
  deckOverlay.value,
  mapInstance.value as any,  // 添加 as any
  options
)
```

---

## 🚀 安装和运行

### 1. 安装依赖

```bash
# 删除旧的依赖
npm uninstall @cgcs2000/mapbox-gl @types/mapbox-gl

# 安装 MapLibre GL
npm install maplibre-gl
npm install --save-dev @types/maplibre-gl
```

### 2. 导入样式

在 `src/main.js` 中添加:

```javascript
import 'maplibre-gl/dist/maplibre-gl.css'
```

### 3. 运行项目

```bash
npm run dev
```

---

## ✅ 功能验证清单

迁移完成后,请验证以下功能:

- [ ] 地图初始化和显示
- [ ] 天地图底图切换 (矢量/影像/地形)
- [ ] GeoJSON 数据加载和渲染
- [ ] 矢量切片图层加载
- [ ] 地图工具 (复位、指北针、全屏)
- [ ] 测距和测面积工具
- [ ] POI 标注和弹窗
- [ ] 图层树管理和切换
- [ ] 3D Tiles 模型加载和显示
- [ ] deck.gl 集成功能

---

## 📚 参考文档

- [MapLibre GL 官方文档](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre GL API 参考](https://maplibre.org/maplibre-gl-js/docs/API/)
- [从 Mapbox GL 迁移指南](https://maplibre.org/maplibre-gl-js/docs/guides/migration-guide/)
- [deck.gl 与 MapLibre 集成](https://deck.gl/docs/api-reference/mapbox/overview)

---

## ⚠️ 注意事项

1. **版本选择**: 本项目使用 MapLibre GL v5.9.0,确保与现有依赖兼容
2. **样式文件**: 必须导入 CSS 文件,否则地图控件样式会丢失
3. **类型断言**: 某些地方需要使用 `as any` 来解决类型兼容性问题
4. **测试覆盖**: 迁移后务必进行全面的功能测试
5. **性能监控**: 观察地图性能是否有变化,MapLibre 通常性能更好

---

## 🐛 常见问题

### Q: 地图控件样式丢失?
**A**: 检查是否导入了 CSS 文件:
```javascript
import 'maplibre-gl/dist/maplibre-gl.css'
```

### Q: TypeScript 类型错误?
**A**: 确保安装了 `@types/maplibre-gl`,版本与 `maplibre-gl` 匹配。

### Q: deck.gl 类型不兼容?
**A**: 在传递 map 实例时使用 `as any` 类型断言。

### Q: 天地图瓦片无法加载?
**A**: MapLibre GL 与 Mapbox GL 的瓦片加载机制一致,无需修改。

---

## 📊 迁移总结

| 项目 | 数量 | 状态 |
|------|------|------|
| 工具类文件 | 5 | ✅ 3个已迁移, 2个无需修改 |
| 组件文件 | 3 | ✅ 全部已迁移 |
| 类型定义 | 1 | ✅ 已更新 |
| API 差异 | 2处 | ✅ 已处理 |
| 预计工作量 | - | 约 1-2 小时 |
| 兼容性 | - | 99% API 兼容 |

---

**迁移完成日期**: 2025-10-20  
**维护人员**: 开发团队  
**版本**: v1.0.0
