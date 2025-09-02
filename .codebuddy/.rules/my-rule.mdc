---
description: 项目开发规范 - Vue3 + Ant Design + Mapbox地图
globs: 
  - "src/**/*.vue"
  - "src/**/*.ts"
  - "src/**/*.js"
alwaysApply: true
---

# 项目开发规则

## Vue3 框架规范
- 使用 Composition API 语法
- 组件命名：PascalCase (如 `MapComponent.vue`)
- 文件结构：`<script setup>` + `<template>` + `<style>`
- 响应式数据：`ref()`, `reactive()`, `computed()`
- 生命周期：`onMounted()`, `onUnmounted()`

## Ant Design 设计规范
- 组件库：`ant-design-vue` v4.2.6
- 图标：优先使用 `@ant-design/icons-vue`
- 色彩体系：严格遵循 Ant Design 色阶
  - 主色：#1677ff (拂晓蓝)
  - 成功：#52c41a (极光绿)
  - 警告：#faad14 (金盏花)
  - 错误：#ff4d4f (薄暮红)
- 禁止随意使用其他颜色，必须使用语义化色彩

## 地图开发规则

### 强制要求
- 使用Mapbox GL JS v1.13.3版本，无需token
- 导入：`import mapboxgl from 'mapbox-gl'`
- 优先使用现有的`mapboxUtils`工具类，不要重复实现
- 地图中心坐标：`[115.133954, 29.823198]`（阳新县）
- 默认缩放级别：10

### 天地图配置
- 支持三种底图：`vec`(矢量)、`img`(影像)、`ter`(地形)
- 使用`mapboxUtils.createSimpleTiandituStyle(type)`创建样式
- 网络异常时自动回退到OSM底图

### 工具类方法
必须使用以下现有方法：
- `mapboxUtils.initMap(containerId)` - 地图初始化
- `mapboxUtils.switchBaseMap(map, type)` - 切换底图
- `mapboxUtils.loadGeoJSON(map, sourceId, data, options)` - 加载GeoJSON
- `mapboxUtils.addPOIMarkers(map, poiData)` - 添加POI标注
- `mapboxUtils.toggleLayerVisibility(map, layerName, visible)` - 图层显隐

### 地图框架要求
- **必须阅读官方文档**：https://docs.mapbox.com/mapbox-gl-js/api/
- **禁止臆造**：不要自己猜测API用法，必须参考官方文档
- 使用v1.13.3版本的API，不要使用新版本的特性
- 地图样式、图层配置、事件处理等必须按官方文档实现

## 禁止事项
- 不要直接创建天地图样式，使用工具类方法
- 不要设置mapboxgl.accessToken
- 不要重复实现已有的工具类功能
- 不要臆造地图API用法，必须查官方文档
- 不要随意使用非Ant Design色彩
