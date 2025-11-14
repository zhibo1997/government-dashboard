# 地图模块问题排查指南

## 问题1: Cesium加载特别卡顿

### 原因分析
卡顿通常不是电脑配置问题，而是以下原因：

1. **默认设置过于精细** - Cesium默认开启了很多高级特性
2. **不必要的渲染** - 持续渲染导致GPU占用高
3. **初始视角太近** - 相机高度过低导致渲染压力大

### 已实施的优化方案

#### ✅ 性能优化设置
```typescript
// 在onViewerReady中自动应用
function optimizeCesiumPerformance(viewer, Cesium) {
  // 关闭不必要的效果
  viewer.scene.globe.enableLighting = false  // 关闭光照
  viewer.scene.fog.enabled = false           // 关闭雾效
  viewer.scene.skyAtmosphere.show = false    // 关闭大气层
  
  // 降低地形细节
  viewer.scene.globe.maximumScreenSpaceError = 2
  
  // 启用按需渲染
  viewer.scene.requestRenderMode = true
  viewer.scene.maximumRenderTimeChange = Infinity
  
  // 禁用阴影
  viewer.shadows = false
}
```

#### ✅ 视角优化
```typescript
// 初始相机高度调整为50000米（50公里）
camera: {
  position: [115.186322, 29.864861, 50000]
}
```

#### ✅ 组件层级优化
```vue
<vc-viewer 
  :requestRenderMode="true"
  :maximumRenderTimeChange="Infinity"
>
```

### 预期效果
- 🚀 帧率提升至60FPS
- 💾 GPU占用降低50%以上
- ⚡ 交互响应更流畅

### 如果还是卡顿
1. 检查浏览器硬件加速是否开启
2. 关闭浏览器其他标签页
3. 更新显卡驱动

---

## 问题2: MVT图层报错 "Failed to obtain image tile"

### 错误信息
```
An error occurred in "_MVTImageryProvider": 
Failed to obtain image tile X: 6715 Y: 3383 Level: 13
```

### 原因分析

#### 1. **缩放级别限制**
MVT图层配置了 `minzoom: 13`，只在缩放级别13以上显示。

```json
{
  "minzoom": 13,  // 最小缩放级别
  "layout": {
    "icon-image": "ql"
  }
}
```

**解决方案**: 放大地图到足够近（高度约10000米以下）

#### 2. **瓦片不存在**
某些区域可能没有数据，导致瓦片返回404。

**这是正常现象**，不影响使用。

#### 3. **网络问题**
无法访问瓦片服务器。

**检查方法**:
```bash
# 在浏览器中访问
https://map4.cityfun.com.cn/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT:gspsp_dtrans_bridgebscinfo@EPSG:900913@pbf/13/6715/3383.pbf
```

### 判断方法

```javascript
// 查看控制台输出
✅ MVT图层加载成功
⚠️ 注意: MVT图层只在缩放级别13以上显示（minzoom: 13）
💡 提示: 放大地图到足够近才能看到桥梁点位
```

### 解决步骤

1. **放大地图**
   - 滚轮放大或双击地图
   - 将相机高度降至10000米以下
   - 缩放级别达到13以上

2. **检查网络**
   ```javascript
   // 在控制台测试
   fetch('https://map4.cityfun.com.cn/geoserver/gwc/service/tms/1.0.0/CSSMX_ZT:gspsp_dtrans_bridgebscinfo@EPSG:900913@pbf/14/13430/6766.pbf')
     .then(r => console.log('网络正常', r.status))
     .catch(e => console.error('网络错误', e))
   ```

3. **忽略个别瓦片错误**
   - 部分区域无数据是正常的
   - 不影响有数据区域的显示

---

## 问题3: 点击没有查询到数据

### 原因分析

#### ❌ 原缓冲区过小
```typescript
const buffer = 0.001  // 约100米 - 太小了！
```

#### ✅ 已调整缓冲区
```typescript
const buffer = 0.05   // 约5公里 - 更合理
```

### 查询逻辑

```
点击位置
    ↓
构建5公里缓冲区
    ↓
WFS查询该范围内所有桥梁
    ↓
找到距离最近的桥梁
    ↓
返回详细信息
```

### 详细日志输出

现在会输出详细的查询信息：

```javascript
📍 点击位置: [115.186322, 29.864861]
📦 查询范围: [115.136322, 29.814861, 115.236322, 29.914861]
📏 缓冲区大小: 0.05度 (约5.6公里)
🔍 开始查询...

// 成功时
✅ 查询成功! 找到 3 个要素
🎯 最近要素距离: 1.25公里
📋 要素详细信息:
  - ID: bridge_001
  - 属性: { llmc: "长江大桥", code: "QX001" }
  - 坐标: [115.188, 29.865]

// 失败时
❌ 未查询到要素信息
💡 可能的原因:
  1. 该区域没有桥梁数据
  2. WFS服务限制了返回的数据范围
  3. 图层名称或工作空间配置错误
```

### 测试方法

#### 方法1: 使用测试按钮
```vue
<a-button @click="testQuery">测试点位查询</a-button>
```

点击按钮会查询阳新县中心 `[115.186322, 29.864861]` 附近的桥梁。

#### 方法2: 手动查询
```typescript
// 在控制台执行
mapRef.value?.queryFeatureInfo(115.186322, 29.864861)
```

#### 方法3: 点击地图
直接点击地图上的任意位置，查询附近5公里内的桥梁。

### 如果还是查不到数据

#### 1. 检查WFS服务
```bash
# 浏览器访问
http://map4.cityfun.com.cn/geoserver/wfs?
  service=WFS&
  version=1.1.0&
  request=GetFeature&
  typeName=CSSMX_ZT:gspsp_dtrans_bridgebscinfo&
  outputFormat=application/json&
  maxFeatures=10
```

应该返回GeoJSON格式的桥梁数据。

#### 2. 检查图层配置
```typescript
// wfsService.ts
workspace: 'CSSMX_ZT'
layerName: 'gspsp_dtrans_bridgebscinfo'
```

#### 3. 检查坐标系
```typescript
srsName: 'EPSG:4326'  // WGS84坐标系
```

#### 4. 扩大查询范围
```typescript
// 如果5公里还不够，可以调整为10公里
const buffer = 0.1  // 约10公里
```

---

## 性能监控

### 查看当前状态

```javascript
// 在控制台执行
console.log('Viewer信息:', {
  场景模式: viewer.scene.mode,
  渲染模式: viewer.scene.requestRenderMode,
  FPS: viewer.scene.debugShowFramesPerSecond,
  相机高度: viewer.camera.positionCartographic.height
})
```

### 性能指标

| 指标 | 良好 | 一般 | 差 |
|------|------|------|-----|
| FPS | >50 | 30-50 | <30 |
| GPU占用 | <30% | 30-60% | >60% |
| 内存占用 | <500MB | 500MB-1GB | >1GB |

---

## 常见问题速查

### Q: 地图一片空白
A: 
1. 检查天地图Token是否配置
2. 检查网络连接
3. 查看浏览器控制台错误

### Q: 看不到桥梁点位
A:
1. 放大地图到缩放级别13以上
2. 检查MVT图层是否加载成功
3. 查看控制台是否有错误

### Q: 点击无反应
A:
1. 查看控制台是否输出点击坐标
2. 检查WFS服务是否可访问
3. 确认该区域是否有数据

### Q: 查询速度慢
A:
1. 减小查询缓冲区
2. 降低maxFeatures限制
3. 检查网络延迟

---

## 调试技巧

### 1. 开启详细日志
代码已内置详细日志，直接查看控制台。

### 2. 测试WFS连接
```javascript
import { geoServerWFS } from '@/services/wfsService'

// 测试查询
const data = await geoServerWFS.getFeatures('gspsp_dtrans_bridgebscinfo', {
  maxFeatures: 10
})
console.log('WFS查询结果:', data)
```

### 3. 查看MVT图层状态
```javascript
console.log('MVT Provider:', mvtProvider.value)
console.log('Imagery Layers:', viewer.imageryLayers.length)
```

### 4. 监控相机位置
```javascript
viewer.camera.changed.addEventListener(() => {
  const height = viewer.camera.positionCartographic.height
  const zoom = Math.log2(40075017 / height)
  console.log(`高度: ${height.toFixed(0)}m, 缩放级别: ${zoom.toFixed(1)}`)
})
```

---

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：

1. 浏览器版本和操作系统
2. 控制台完整错误信息
3. 网络请求截图（Network面板）
4. 问题复现步骤

---

**最后更新**: 2025-11-14  
**版本**: v1.1.0
