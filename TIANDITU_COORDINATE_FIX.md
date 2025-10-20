<!--
 * @Author: Do not edit
 * @Date: 2025-10-20 23:08:23
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 23:08:27
 * @Description: 
-->
# 🗺️ 天地图坐标系问题修复说明

## 🐛 问题描述

迁移到 MapLibre GL 后，地图中心点 `[115.186322, 29.864861]` (阳新县) 显示在了南半球,天地图瓦片加载异常。

## 🔍 问题原因

### 核心问题：坐标系不匹配

天地图提供两种投影坐标系的服务:

| 后缀 | 坐标系 | 说明 | 适用场景 |
|------|--------|------|---------|
| `_c` | **CGCS2000/经纬度** | 使用经纬度坐标 (WGS84类似) | 需要地理坐标系的应用 |
| `_w` | **Web Mercator** | 墨卡托投影 (EPSG:3857) | Web地图标准,MapLibre/Mapbox使用 |

### 错误配置

**之前使用的配置** (错误):
```javascript
tiles: [
  `https://t0.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=${key}`
  //                                            ↑↑↑
  //                                         使用了 _c (经纬度坐标系)
]
```

**问题**:
- MapLibre GL 默认使用 **Web Mercator (EPSG:3857)** 投影
- 天地图 `_c` 服务返回的是 **经纬度坐标系** 的瓦片
- 投影不匹配导致瓦片位置错误,坐标显示在错误的位置

## ✅ 解决方案

### 修改后的配置 (正确):

```javascript
tiles: [
  `https://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${key}`,
  `https://t1.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${key}`,
  `https://t2.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${key}`,
  //                                            ↑↑↑
  //                                         改为 _w (Web Mercator)
]
```

### 主要变更点

1. **投影后缀**: `_c` → `_w`
   - 矢量: `vec_c` → `vec_w`
   - 影像: `img_c` → `img_w`
   - 地形: `ter_c` → `ter_w`
   - 标注: `cva_c`/`cia_c`/`cta_c` → `cva_w`/`cia_w`/`cta_w`

2. **添加负载均衡**: 使用多个服务器 (t0, t1, t2, t3)
   ```javascript
   tiles: [
     `https://t0.tianditu.gov.cn/...`,
     `https://t1.tianditu.gov.cn/...`,
     `https://t2.tianditu.gov.cn/...`,
   ]
   ```

3. **添加 tileSize 配置**:
   ```javascript
   tileSize: 256  // 明确指定瓦片大小
   ```

4. **扩展缩放级别**:
   ```javascript
   minzoom: 3,
   maxzoom: 18  // 从 15 提升到 18
   ```

5. **重置地图姿态**:
   ```javascript
   pitch: 0,   // 倾斜角度为0
   bearing: 0  // 方位角为0
   ```

## 📊 修复对比

### 修复前
```
坐标: [115.186322, 29.864861]
投影: 经纬度 (_c)
结果: ❌ 显示在南半球
```

### 修复后
```
坐标: [115.186322, 29.864861]
投影: Web Mercator (_w)
结果: ✅ 正确显示在湖北省阳新县
```

## 🔧 技术原理

### Web Mercator vs 经纬度

**经纬度坐标系 (EPSG:4326)**:
- 直接使用经度和纬度表示位置
- 经度: -180° ~ 180°
- 纬度: -90° ~ 90°
- 地图呈现: 横向拉伸,不适合Web显示

**Web Mercator (EPSG:3857)**:
- 墨卡托投影的变种
- 坐标范围: -20037508.34 ~ 20037508.34 米
- 特点: 适合Web地图,保持方向和形状
- 应用: Google Maps, OpenStreetMap, MapLibre, Mapbox

### 为什么会跑到南半球?

当使用 `_c` (经纬度) 瓦片但系统期望 `_w` (墨卡托) 时:

1. MapLibre 认为瓦片坐标是墨卡托投影
2. 实际返回的是经纬度瓦片
3. 坐标系不匹配导致位置偏移
4. 阳新县 (29.86°N) 可能被误解析到南半球

## 🎯 验证方法

### 在浏览器控制台检查:

```javascript
// 检查地图中心
console.log('Map Center:', map.getCenter())
// 应该输出: { lng: 115.186322, lat: 29.864861 }

// 检查投影
console.log('Map CRS:', map.getCRS())
// 应该是: EPSG:3857

// 检查瓦片URL
map.getStyle().sources['tianditu-img'].tiles[0]
// 应该包含: T=img_w
```

### 目视检查:
- ✅ 地图中心应该在中国湖北省
- ✅ 周边应该看到武汉、黄石等城市
- ✅ 天地图标注应该正确显示中文地名

## 📚 相关资源

- [天地图 API 文档](http://lbs.tianditu.gov.cn/server/MapService.html)
- [MapLibre GL 坐标系](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/LngLatLike/)
- [Web Mercator 解释](https://en.wikipedia.org/wiki/Web_Mercator_projection)
- [EPSG:3857 vs EPSG:4326](https://epsg.io/3857)

## ⚠️ 注意事项

1. **坐标顺序**: MapLibre GL 统一使用 `[经度, 纬度]`
2. **坐标系匹配**: 底图投影必须与库的默认投影一致
3. **标注图层**: 标注层也要使用对应的 `_w` 后缀
4. **性能优化**: 使用多个服务器域名可以提升加载速度

## 🎉 修复后的效果

- ✅ 地图中心正确显示在阳新县
- ✅ 天地图瓦片正常加载
- ✅ 中文标注清晰显示
- ✅ 底图切换功能正常
- ✅ 缩放平移交互流畅

---

**修复日期**: 2025-10-20  
**问题影响**: MapLibre GL 迁移后的关键问题  
**解决状态**: ✅ 已完全解决
