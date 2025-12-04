---
trigger: manual
---
<!--
 * @Author: Do not edit
 * @Date: 2025-10-16 20:57:08
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-04 21:03:17
 * @Description: 
-->
---
description: 项目开发规范 - Vue3 + Ant Design + Cesium地图
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

## Cesium 地图开发规范

### 强制要求
- 使用 vue-cesium 框架，基于 CesiumJS
- 导入：`import { VcViewer, VcLayerImagery } from 'vue-cesium'`
- 优先使用现有的 `cesiumUtils` 工具类（如果存在），不要重复实现
- 地图中心坐标：`[115.133954, 29.823198]`（阳新县）
- 默认缩放级别：10

### 天地图配置
- 支持三种底图：`vec`(矢量)、`img`(影像)、`ter`(地形)
- 使用 `cesiumUtils.createSimpleTiandituStyle(type)` 创建样式（如果存在相应工具）
- 网络异常时自动回退到 OSM 底图

### 地图框架要求
- **必须阅读官方文档**：https://github.com/zouyaoji/vue-cesium/
- **禁止臆造**：不要自己猜测API用法，必须参考官方文档
- 使用 vue-cesium 的 API，不要使用原生 CesiumJS 的复杂特性
- 地图样式、图层配置、事件处理等必须按官方文档实现

## 禁止事项
- 不要直接创建天地图样式，使用工具类方法
- 不要设置 Cesium.Ion.defaultAccessToken
- 不要重复实现已有的工具类功能
- 不要臆造地图API用法，必须查官方文档
- 不要随意使用非Ant Design色彩