# 地图工具栏图标替换指南

## 当前状态

工具栏使用Emoji作为占位图标,方便开发测试。生产环境建议替换为设计图提供的真实图标。

## 图标列表

根据设计图,需要准备以下7个图标:

| 序号 | 功能 | 当前占位符 | 建议图标名称 | 建议尺寸 |
|------|------|------------|--------------|----------|
| 1 | 收缩/展开 | ◀/▶ | `icon-collapse.png` / `icon-expand.png` | 32x32 |
| 2 | 图层树 | 📋 | `icon-layers.png` | 32x32 |
| 3 | 底图切换 | 🗺️ | `icon-basemap.png` | 32x32 |
| 4 | 地图重置 | 🔄 | `icon-reset.png` | 32x32 |
| 5 | 2D/3D切换 | 2D/3D | `icon-2d.png` / `icon-3d.png` | 32x32 |
| 6 | 指北针 | 🧭 | `icon-compass.png` | 32x32 |
| 7 | 测量工具 | 📏 | `icon-measure.png` | 32x32 |

## 图标规格建议

### 文件格式
- **推荐**: PNG (支持透明背景)
- **备选**: SVG (矢量图,可缩放)
- **不推荐**: JPG (不支持透明)

### 尺寸规格
- **源文件**: 64x64px 或 128x128px (高清屏适配)
- **显示尺寸**: 32x32px (在80x80px按钮中居中)
- **格式**: 24位PNG或32位PNG (带Alpha通道)

### 颜色规范
遵循Ant Design色彩体系:

```scss
// 默认状态
color: #1677ff;  // 拂晓蓝

// 悬停状态
color: #4096ff;  // 亮蓝

// 激活状态
color: #0958d9;  // 深蓝

// 禁用状态
color: rgba(255, 255, 255, 0.3);  // 灰色半透明
```

## 替换方法

### 方法1: 使用本地图片 (推荐)

1. **准备图标文件**

将图标文件放入项目目录:
```
src/
  assets/
    icons/
      map-toolbar/
        collapse.png
        expand.png
        layers.png
        basemap.png
        reset.png
        view-2d.png
        view-3d.png
        compass.png
        measure.png
```

2. **修改组件代码**

```vue
<!-- MapToolbar.vue -->
<template>
  <div class="toolbar-item" @click="toggleCollapse">
    <div class="tool-icon">
      <img 
        :src="isCollapsed ? expandIcon : collapseIcon" 
        alt="收缩/展开"
        class="icon-img"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import collapseIcon from '@/assets/icons/map-toolbar/collapse.png'
import expandIcon from '@/assets/icons/map-toolbar/expand.png'
import layersIcon from '@/assets/icons/map-toolbar/layers.png'
import basemapIcon from '@/assets/icons/map-toolbar/basemap.png'
import resetIcon from '@/assets/icons/map-toolbar/reset.png'
import view2dIcon from '@/assets/icons/map-toolbar/view-2d.png'
import view3dIcon from '@/assets/icons/map-toolbar/view-3d.png'
import compassIcon from '@/assets/icons/map-toolbar/compass.png'
import measureIcon from '@/assets/icons/map-toolbar/measure.png'
</script>

<style lang="scss" scoped>
.icon-img {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 8px rgba(22, 119, 255, 0.5));
  transition: transform 0.3s ease;
}

.toolbar-item:hover .icon-img {
  transform: scale(1.1);
}
</style>
```

### 方法2: 使用SVG图标

```vue
<template>
  <div class="toolbar-item">
    <div class="tool-icon">
      <svg class="icon-svg" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icon-svg {
  width: 32px;
  height: 32px;
  fill: #1677ff;
  filter: drop-shadow(0 2px 8px rgba(22, 119, 255, 0.5));
}
</style>
```

### 方法3: 使用IconFont (推荐大项目)

1. **引入IconFont**

```html
<!-- index.html -->
<link rel="stylesheet" href="//at.alicdn.com/t/font_xxx.css">
```

2. **使用Icon**

```vue
<template>
  <div class="toolbar-item">
    <div class="tool-icon">
      <i class="iconfont icon-basemap"></i>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.iconfont {
  font-size: 32px;
  color: #1677ff;
  text-shadow: 0 2px 8px rgba(22, 119, 255, 0.5);
}
</style>
```

### 方法4: 使用@ant-design/icons-vue

```vue
<script setup lang="ts">
import { 
  ExpandOutlined, 
  CompressOutlined,
  EnvironmentOutlined,
  RedoOutlined,
  EyeOutlined,
  CompassOutlined,
  ColumnWidthOutlined
} from '@ant-design/icons-vue'
</script>

<template>
  <div class="toolbar-item" @click="toggleCollapse">
    <div class="tool-icon">
      <component 
        :is="isCollapsed ? ExpandOutlined : CompressOutlined" 
        :style="{ fontSize: '32px', color: '#1677ff' }"
      />
    </div>
  </div>
</template>
```

## 底图选项图标

底图切换面板中的三个选项也需要图标:

```vue
<!-- 矢量地图 -->
<div class="base-map-option">
  <img src="@/assets/icons/basemap/vector.png" class="option-icon" />
  <span>矢量地图</span>
</div>

<!-- 影像地图 -->
<div class="base-map-option">
  <img src="@/assets/icons/basemap/satellite.png" class="option-icon" />
  <span>影像地图</span>
</div>

<!-- 地形地图 -->
<div class="base-map-option">
  <img src="@/assets/icons/basemap/terrain.png" class="option-icon" />
  <span>地形地图</span>
</div>
```

## 测量工具图标

测量面板中的选项图标:

```vue
<!-- 距离测量 -->
<div class="measure-option">
  <img src="@/assets/icons/measure/distance.png" class="option-icon" />
  <span>距离测量</span>
</div>

<!-- 面积测量 -->
<div class="measure-option">
  <img src="@/assets/icons/measure/area.png" class="option-icon" />
  <span>面积测量</span>
</div>

<!-- 清除测量 -->
<div class="measure-option clear">
  <img src="@/assets/icons/measure/clear.png" class="option-icon" />
  <span>清除测量</span>
</div>
```

## 图标设计建议

### 1. 统一风格
- 使用相同的线条粗细
- 使用相同的圆角半径
- 保持一致的设计语言

### 2. 色彩规范
```scss
// 主色调 - 拂晓蓝
$primary-color: #1677ff;

// 辅助色
$success-color: #52c41a;  // 成功 (如激活状态)
$warning-color: #faad14;  // 警告
$error-color: #ff4d4f;    // 错误 (如清除按钮)

// 中性色
$text-color: #ffffff;
$border-color: rgba(22, 119, 255, 0.3);
```

### 3. 交互反馈
```scss
// 默认状态
.icon {
  opacity: 0.8;
  filter: grayscale(0%);
}

// 悬停状态
.icon:hover {
  opacity: 1;
  filter: brightness(1.2);
}

// 激活状态
.icon.active {
  opacity: 1;
  filter: drop-shadow(0 0 12px rgba(22, 119, 255, 0.8));
}

// 禁用状态
.icon.disabled {
  opacity: 0.3;
  filter: grayscale(100%);
}
```

## 图标导出配置

### Figma导出
```
File > Export
- Format: PNG
- Size: 2x (128x128)
- Background: Transparent
```

### Sketch导出
```
Make Exportable
- Format: PNG
- Size: @2x
- Background: Remove
```

### Adobe XD导出
```
File > Export > Selected
- Format: PNG
- Scale: 2x
- Include: Transparent Background
```

## 批量处理脚本

如果图标数量多,可以使用脚本批量处理:

```javascript
// compress-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './raw-icons';
const outputDir = './src/assets/icons/map-toolbar';

fs.readdirSync(inputDir).forEach(file => {
  if (file.endsWith('.png')) {
    sharp(path.join(inputDir, file))
      .resize(64, 64)
      .png({ quality: 90 })
      .toFile(path.join(outputDir, file));
  }
});
```

## 在线图标资源

如果设计图暂未提供图标,可以使用以下资源:

1. **IconFont**: https://www.iconfont.cn/
2. **Icons8**: https://icons8.com/
3. **Flaticon**: https://www.flaticon.com/
4. **Material Icons**: https://fonts.google.com/icons
5. **Ant Design Icons**: https://ant.design/components/icon-cn/

## 示例代码 - 完整替换

```vue
<template>
  <div class="map-toolbar" :class="{ collapsed: isCollapsed }">
    <!-- 收缩按钮 -->
    <div class="toolbar-item" @click="toggleCollapse">
      <div class="tool-icon">
        <img 
          :src="isCollapsed ? icons.expand : icons.collapse" 
          alt="收缩/展开"
          class="icon-img"
        />
      </div>
    </div>

    <template v-if="!isCollapsed">
      <!-- 图层树 -->
      <div class="toolbar-item disabled">
        <div class="tool-icon">
          <img :src="icons.layers" alt="图层树" class="icon-img" />
        </div>
      </div>

      <!-- 底图切换 -->
      <div class="toolbar-item" @click="toggleBaseMapPanel">
        <div class="tool-icon">
          <img :src="icons.basemap" alt="底图切换" class="icon-img" />
        </div>
      </div>

      <!-- 其他按钮... -->
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 导入所有图标
import collapseIcon from '@/assets/icons/map-toolbar/collapse.png'
import expandIcon from '@/assets/icons/map-toolbar/expand.png'
import layersIcon from '@/assets/icons/map-toolbar/layers.png'
import basemapIcon from '@/assets/icons/map-toolbar/basemap.png'
import resetIcon from '@/assets/icons/map-toolbar/reset.png'
import view2dIcon from '@/assets/icons/map-toolbar/view-2d.png'
import view3dIcon from '@/assets/icons/map-toolbar/view-3d.png'
import compassIcon from '@/assets/icons/map-toolbar/compass.png'
import measureIcon from '@/assets/icons/map-toolbar/measure.png'

const icons = {
  collapse: collapseIcon,
  expand: expandIcon,
  layers: layersIcon,
  basemap: basemapIcon,
  reset: resetIcon,
  view2d: view2dIcon,
  view3d: view3dIcon,
  compass: compassIcon,
  measure: measureIcon
}
</script>
```

## 注意事项

1. ✅ 确保所有图标背景透明
2. ✅ 统一图标尺寸 (推荐64x64或128x128)
3. ✅ 压缩图标文件大小 (每个不超过10KB)
4. ✅ 使用语义化的文件名
5. ✅ 遵循Ant Design色彩规范
6. ⚠️ 避免使用过于复杂的图标
7. ⚠️ 注意图标的版权问题
