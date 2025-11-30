# 相机范围限制功能说明

## 📋 功能概述

实现类似 OpenLayers `extent` 的相机范围限制功能，限制 Cesium 地图的**平移范围**和**缩放级别（高度）**，确保用户始终在指定的地理边界和高度范围内浏览。

## ✨ 核心特性

- ✅ **平移限制**：限制相机在指定经纬度边界内移动
- ✅ **缩放限制**：限制相机高度范围（最小/最大放大级别）
- ✅ **2D/3D兼容**：自动适配 2D 和 3D 场景模式
- ✅ **防死循环**：智能标志位避免修正触发无限循环
- ✅ **平滑/立即修正**：可选平滑飞行或立即修正
- ✅ **GeoJSON支持**：自动从 GeoJSON 计算边界范围

## 🔧 实现位置

### 核心函数
- **文件**：`src/hook/useMapHooks.ts`
- **函数**：
  - `restrictCameraBounds()` - 基于矩形边界限制
  - `restrictCameraBoundsByGeoJSON()` - 基于 GeoJSON 边界限制

### 配置文件
- **文件**：`src/config/mapConfig.ts`
- **配置项**：`mapConfig.cameraBounds`

### 使用位置
- **文件**：`src/mapComponents/Map.vue`
- **时机**：`onViewerReady()` 中启用

## 📖 使用方式

### 方式1：使用矩形边界（配置文件）

```typescript
// src/config/mapConfig.ts
cameraBounds: {
  west: 114.8,         // 西边界（最小经度）
  south: 29.4,         // 南边界（最小纬度）
  east: 115.6,         // 东边界（最大经度）
  north: 30.2,         // 北边界（最大纬度）
  buffer: 0.1,         // 边界缓冲（度）
  smoothCorrection: false,  // 立即修正
  minHeight: 10000,    // 最小高度10km（最大放大）
  maxHeight: 150000    // 最大高度150km（最小放大）
}

// src/mapComponents/Map.vue
const { west, south, east, north, buffer, smoothCorrection, minHeight, maxHeight } = mapConfig.cameraBounds
cameraBoundsCleanup = restrictCameraBounds(viewer, {
  west, south, east, north
}, {
  buffer,
  smoothCorrection,
  minHeight,
  maxHeight
})
```

### 方式2：使用 GeoJSON 边界

```typescript
// src/mapComponents/Map.vue
if (yangxinGeoJSON.value) {
  const { buffer, smoothCorrection, minHeight, maxHeight } = mapConfig.cameraBounds
  cameraBoundsCleanup = restrictCameraBoundsByGeoJSON(viewer, yangxinGeoJSON.value, {
    buffer,
    smoothCorrection,
    minHeight,
    maxHeight
  })
}
```

**支持的 GeoJSON 格式**：
- `Feature` 对象（单个要素）
- `FeatureCollection` 对象（要素集合）
- `Polygon` / `MultiPolygon` 对象（直接几何对象）

## ⚙️ 参数说明

### bounds（边界对象）
| 参数 | 类型 | 说明 |
|------|------|------|
| `west` | number | 西边界（最小经度，度数） |
| `south` | number | 南边界（最小纬度，度数） |
| `east` | number | 东边界（最大经度，度数） |
| `north` | number | 北边界（最大纬度，度数） |

### options（配置选项）
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `buffer` | number | 0.05 | 边界缓冲距离（度），防止过于严格 |
| `smoothCorrection` | boolean | false | 是否平滑修正（true=flyTo，false=setView） |
| `minHeight` | number | 5000 | 最小高度（米），即最大放大级别 |
| `maxHeight` | number | 300000 | 最大高度（米），即最小放大级别 |

## 🎯 参数调优建议

### 阳新县（约0.8度×0.8度区域）
```typescript
cameraBounds: {
  west: 114.8,
  south: 29.4,
  east: 115.6,
  north: 30.2,
  buffer: 0.1,           // 10%缓冲区
  smoothCorrection: false,  // 推荐立即修正
  minHeight: 10000,      // 10km，看清街道
  maxHeight: 150000      // 150km，看到整个县域
}
```

### 更大区域（省级）
```typescript
cameraBounds: {
  // ... 边界
  buffer: 0.2,           // 更大缓冲区
  minHeight: 50000,      // 50km
  maxHeight: 500000      // 500km
}
```

### 更小区域（园区/社区）
```typescript
cameraBounds: {
  // ... 边界
  buffer: 0.01,          // 1%缓冲区
  minHeight: 500,        // 500m，看清建筑
  maxHeight: 20000       // 20km
}
```

## 🔍 工作原理

### 1. 监听机制
```typescript
viewer.camera.moveEnd.addEventListener(() => {
  // 相机移动结束后触发检查
})
```

### 2. 死循环防护
```typescript
let isCorrecting = false;

if (isCorrecting) {
  isCorrecting = false;
  return;  // 跳过修正期间的检查
}

// 需要修正时
isCorrecting = true;
camera.flyTo({
  // ...
  complete: () => { isCorrecting = false; },
  cancel: () => { isCorrecting = false; }
});
```

### 3. 2D/3D 模式适配
```typescript
if (scene.mode === Cesium.SceneMode.SCENE2D) {
  // 2D模式：相机位置即视野中心
  const cameraPos = camera.positionCartographic;
  lon = Cesium.Math.toDegrees(cameraPos.longitude);
  lat = Cesium.Math.toDegrees(cameraPos.latitude);
  height = cameraPos.height;
  
  // 修正时不设置orientation（避免黑屏）
  camera.position = Cesium.Cartesian3.fromDegrees(targetLon, targetLat, targetHeight);
} else {
  // 3D模式：使用屏幕中心点
  const center = camera.pickEllipsoid(...);
  // ... 修正时保持orientation
  camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(targetLon, targetLat, targetHeight),
    orientation: { heading, pitch, roll }
  });
}
```

### 4. 边界检查
```typescript
// 经纬度边界检查
if (lon < extendedBounds.west) targetLon = extendedBounds.west;
if (lon > extendedBounds.east) targetLon = extendedBounds.east;
if (lat < extendedBounds.south) targetLat = extendedBounds.south;
if (lat > extendedBounds.north) targetLat = extendedBounds.north;

// 高度范围检查
if (height < minHeight) targetHeight = minHeight;
if (height > maxHeight) targetHeight = maxHeight;
```

## ⚠️ 注意事项

### 1. smoothCorrection 建议关闭
- **推荐设置**：`smoothCorrection: false`
- **原因**：
  - 平滑飞行虽然视觉效果好，但可能因 `flyTo` 的异步特性导致多次触发
  - 立即修正响应更快，体验更好
  - 如需平滑效果，确保边界缓冲足够大（≥0.1度）

### 2. 高度范围设置
- **minHeight**：不宜过小（<1000m），否则可能看到地形细节问题
- **maxHeight**：应确保能看到完整边界区域
- **经验公式**：`maxHeight ≈ (边界长度/2) × 111000` 米
  - 例如：0.8度边界 → `maxHeight ≈ 44km`，预留余量设为 150km

### 3. 边界缓冲区
- **buffer** 值越大，用户体验越流畅（不会频繁触发修正）
- 推荐值：区域大小的 5-15%
- 例如：0.8度边界，buffer = 0.05-0.15 度

### 4. 组件卸载时清理
```typescript
onBeforeUnmount(() => {
  if (cameraBoundsCleanup) {
    cameraBoundsCleanup();  // 移除监听器
    cameraBoundsCleanup = null;
  }
})
```

## 🐛 已解决的问题

### 问题1：死循环
- **现象**：修正后再次触发修正，无限循环
- **原因**：`flyTo/setView` 触发 `moveEnd` 事件
- **解决**：`isCorrecting` 标志位跳过修正期间的检查

### 问题2：黑屏（2D模式）
- **现象**：2D模式修正后地图变黑
- **原因**：2D模式下使用3D的 `orientation` 参数
- **解决**：2D模式只设置 `position`，不设置 `orientation`

### 问题3：高度失控
- **现象**：放大过度或缩小过度
- **原因**：未限制 `height` 参数
- **解决**：添加 `minHeight`/`maxHeight` 检查和修正

### 问题4：位置偏移
- **现象**：修正后位置有偏差
- **原因**：2D/3D模式下位置获取方式不同
- **解决**：
  - 2D: 直接用 `camera.positionCartographic`
  - 3D: 用 `camera.pickEllipsoid()` 获取屏幕中心

## 📊 效果对比

### 启用前
- ❌ 可以无限平移，脱离关注区域
- ❌ 可以无限放大/缩小，高度失控
- ❌ 容易迷失方向

### 启用后
- ✅ 自动限制在阳新县范围内
- ✅ 高度保持在 10-150km 合理范围
- ✅ 类似 OpenLayers extent 的体验
- ✅ 2D/3D 模式切换无问题

## 🔗 相关文件

- `src/hook/useMapHooks.ts` - 核心实现
- `src/config/mapConfig.ts` - 配置项
- `src/mapComponents/Map.vue` - 使用示例
- `CODEBUDDY.md` - 项目总体说明

## 📝 示例日志

```bash
✅ 相机平移范围限制已启用: {
  bounds: { west: 114.8, south: 29.4, east: 115.6, north: 30.2 },
  buffer: 0.1,
  smoothCorrection: false,
  heightRange: '10000m - 150000m',
  mode: '2D'
}

📍 相机修正: 位置: (114.7500, 29.8500) -> (114.8000, 29.8500), 高度: 200.0km -> 150.0km
```

---

**功能完成日期**: 2025-11-29  
**最后更新**: 2025-11-29
**技术栈**: Vue 3 + TypeScript + Cesium + vue-cesium
