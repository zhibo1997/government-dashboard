# 地图工具栏组件使用说明

## 组件概述

`MapToolbar.vue` 是一个功能完整的Cesium地图工具栏组件,提供了常用的地图操作功能。

## 功能列表

### 1. ✅ 收缩/展开功能
- 点击顶部按钮可收缩/展开工具栏
- 收缩后只显示展开按钮
- 收缩时自动关闭所有弹出面板

### 2. ⏸️ 图层树 (暂未开发)
- 功能按钮已预留,显示为禁用状态
- 待后续实现图层管理功能

### 3. ✅ 底图切换
- 支持三种天地图底图切换:
  - **矢量地图** (vec): 道路、标注清晰
  - **影像地图** (img): 卫星影像
  - **地形地图** (ter): 地形渲染
- 点击按钮弹出底图选择面板
- 当前激活的底图高亮显示

### 4. ✅ 地图重置
- 一键恢复地图到初始视角
- 重置到阳新县中心点 `[115.186322, 29.864861]`
- 使用平滑过渡动画 (2秒)

### 5. ✅ 2D/3D视图切换
- 切换2D平面视图和3D立体视图
- 按钮文字动态显示当前模式

### 6. ✅ 指北针
- 显示当前地图朝向
- 点击可重置地图方向为正北
- 指北针图标随相机旋转而旋转(待完善)

### 7. ✅ 测量工具
- **距离测量**: 测量两点间距离
- **面积测量**: 测量多边形面积
- **清除测量**: 清除所有测量标注
- 点击按钮弹出测量工具面板

## 使用方法

### 基础用法

```vue
<template>
  <div class="map-container">
    <vc-viewer ref="cesiumViewer" @ready="onViewerReady">
      <!-- 地图图层 -->
    </vc-viewer>
    
    <!-- 地图工具栏 -->
    <MapToolbar 
      :viewer-instance="viewerInstance"
      @base-map-change="handleBaseMapChange"
      @reset-map="handleResetMap"
      @view-mode-change="handleViewModeChange"
      @measure-start="handleMeasureStart"
      @measure-clear="handleMeasureClear"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MapToolbar from '@/mapComponents/MapToolbar.vue'

const viewerInstance = ref(null)

function onViewerReady({ viewer }) {
  viewerInstance.value = viewer
}

// 底图切换事件处理
function handleBaseMapChange(type: 'vec' | 'img' | 'ter') {
  console.log('切换底图:', type)
  // 实现底图切换逻辑
}

// 重置地图事件处理
function handleResetMap() {
  console.log('重置地图')
  // 实现地图重置逻辑
}

// 视图模式切换事件处理
function handleViewModeChange(is3D: boolean) {
  console.log('切换视图模式:', is3D ? '3D' : '2D')
  // 实现视图模式切换逻辑
}

// 开始测量事件处理
function handleMeasureStart(mode: 'distance' | 'area') {
  console.log('开始测量:', mode)
  // 实现测量功能
}

// 清除测量事件处理
function handleMeasureClear() {
  console.log('清除测量')
  // 实现清除测量逻辑
}
</script>
```

### Props

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| viewerInstance | any | 否 | Cesium Viewer实例,用于调用地图API |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| base-map-change | type: 'vec' \| 'img' \| 'ter' | 底图切换时触发 |
| reset-map | - | 点击重置地图时触发 |
| view-mode-change | is3D: boolean | 视图模式切换时触发 |
| measure-start | mode: 'distance' \| 'area' | 开始测量时触发 |
| measure-clear | - | 清除测量时触发 |

### Expose Methods

| 方法名 | 返回值 | 说明 |
|--------|--------|------|
| isCollapsed | Ref\<boolean\> | 工具栏是否收缩 |
| currentBaseMap | Ref\<string\> | 当前底图类型 |
| measureMode | Ref\<string \| null\> | 当前测量模式 |

## 样式定制

### 位置调整

默认工具栏位置在屏幕右侧居中,可通过修改CSS调整:

```scss
.map-toolbar {
  right: 40px;  // 距离右边距离
  top: 50%;     // 垂直居中
}
```

### 按钮尺寸

默认按钮尺寸为 `80x80px`,可根据大屏尺寸调整:

```scss
.toolbar-item {
  width: 80px;
  height: 80px;
}
```

### 颜色主题

工具栏遵循Ant Design色彩规范,主色为 `#1677ff`:

```scss
.toolbar-item {
  border-color: rgba(22, 119, 255, 0.3);
  
  &:hover {
    border-color: rgba(22, 119, 255, 0.6);
    background: rgba(22, 119, 255, 0.15);
  }
}
```

## 图标替换

当前使用Emoji占位图标,替换为真实图标的方法:

### 方式1: 使用图片

```vue
<div class="tool-icon">
  <img src="@/assets/icons/basemap.png" alt="底图切换" />
</div>
```

### 方式2: 使用Icon组件

```vue
<div class="tool-icon">
  <MapIcon />
</div>
```

### 方式3: 使用IconFont

```vue
<div class="tool-icon">
  <i class="iconfont icon-map"></i>
</div>
```

## 待完善功能

### 1. 指北针动态旋转

```javascript
watch(() => props.viewerInstance, (viewer) => {
  if (viewer) {
    viewer.camera.changed.addEventListener(() => {
      const Cesium = window.Cesium
      const heading = viewer.camera.heading
      compassRotation.value = Cesium.Math.toDegrees(heading)
    })
  }
})
```

### 2. 测量工具实现

需要引入Cesium测量插件或自行实现:

```javascript
function handleMeasureStart(mode: 'distance' | 'area') {
  const viewer = props.viewerInstance
  if (!viewer) return
  
  const Cesium = window.Cesium
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  
  // 实现点击绘制逻辑
  // ...
}
```

### 3. 图层树功能

可以集成现有的 `LayerTree2D.vue` 组件。

## 响应式适配

组件已内置响应式样式,在不同分辨率下自动调整:

- **4096x1920**: 默认尺寸 (80x80px按钮)
- **1920x1080**: 缩小至 60x60px
- **小屏幕**: 自动缩放

## 性能优化建议

1. **懒加载**: 工具栏使用`v-if`而非`v-show`控制面板显示
2. **防抖**: 按钮点击事件已做防抖处理
3. **过渡动画**: 使用CSS transition而非JS动画

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ⚠️ Safari 14+ (部分CSS特性可能需要前缀)

## 常见问题

### Q: 工具栏被地图覆盖?
A: 检查z-index设置,工具栏默认z-index为1000。

### Q: 底图切换无效?
A: 确保已正确传入`viewerInstance`并监听`base-map-change`事件。

### Q: 样式不生效?
A: 检查是否有scoped样式冲突,或全局样式优先级更高。

## 更新日志

### v1.0.0 (2025-11-17)
- ✅ 完成基础框架和样式
- ✅ 实现收缩/展开功能
- ✅ 实现底图切换(三种天地图类型)
- ✅ 实现地图重置功能
- ✅ 实现2D/3D视图切换
- ✅ 实现指北针基础功能
- ✅ 实现测量工具面板

### TODO
- [ ] 完善指北针动态旋转
- [ ] 实现距离测量功能
- [ ] 实现面积测量功能
- [ ] 集成图层树功能
- [ ] 替换Emoji为真实图标
- [ ] 添加工具提示动画
