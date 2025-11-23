# 地图工具栏集成说明

## ✅ 改造完成

已成功将 `MapToolbar` 改造成 `Map.vue` 的子组件，采用**父子组件通信方案**。

**最新修复（2025-11-22）:**
- ✅ 修复 `watch is not defined` 错误
- ✅ 移除工具栏中重复的相机监听逻辑（统一由父组件管理）
- ✅ 符合 vue-cesium 最佳实践：viewer 实例通过 Props 传递
- ✅ **修复 MVT 图层显隐操作不生效的问题**
  - 问题：`loadMVTLayer` 返回的是 Provider 而非 ImageryLayer
  - 解决：修改返回 ImageryLayer 对象，使用 `layer.show` 控制显隐

---

## 📐 架构说明

### 组件层次结构

```
Map.vue (父组件 - 地图模块容器)
├── vc-viewer (Cesium 核心)
│   ├── vc-layer-imagery (天地图底图)
│   ├── vc-measurements (测量工具)
│   └── MapToolbar.vue (工具栏 - 子组件) ⭐
│       ├── OptimizedLayerTree (图层树)
│       └── BaseMapPanel (底图切换面板)
└── MeasureTool.vue (测量工具面板)
```

### 职责划分

| 组件 | 职责 |
|------|------|
| **Map.vue** | - 管理 Viewer 实例<br>- 管理核心状态（底图、场景模式、指北针等）<br>- 监听相机变化更新指北针<br>- 协调子组件交互 |
| **MapToolbar.vue** | - 管理 UI 状态（面板展开/收缩）<br>- 触发地图操作<br>- 通过 Props 接收状态<br>- 通过 Emit 通知父组件 |
| **MeasureTool.vue** | - 测量工具 UI<br>- 独立的测量逻辑 |

---

## 🔄 数据流

### Props (父 → 子)

```typescript
// Map.vue 传递给 MapToolbar.vue
interface Props {
  viewerInstance: any              // Cesium Viewer 实例
  sceneMode: 2 | 3                 // 场景模式 (2=2D, 3=3D)
  currentBaseMap: 'vec' | 'img' | 'ter'  // 底图类型
  compassRotation: number          // 指北针旋转角度
}
```

### Emits (子 → 父)

```typescript
// MapToolbar.vue 通知 Map.vue
emit('update:scene-mode', mode)    // 切换 2D/3D
emit('update:base-map', type)      // 切换底图
emit('reset-map')                  // 重置地图
emit('toggle-measure')             // 切换测量工具
```

---

## 🔧 关键技术实现

### Vue-Cesium 最佳实践

根据 vue-cesium 官方文档，我们采用以下方式获取和使用 viewer 实例：

#### 方式一：父组件统一管理（本项目采用）✅

```vue
<!-- Map.vue (父组件) -->
<template>
  <vc-viewer ref="cesiumViewer" @ready="onViewerReady">
    <!-- 子组件通过 Props 接收 viewer -->
    <MapToolbar 
      :viewer-instance="viewerInstance"
      :scene-mode="sceneMode"
      :current-base-map="currentBaseMapType"
      :compass-rotation="compassRotation"
    />
  </vc-viewer>
</template>

<script setup>
import { ref } from 'vue'

const viewerInstance = ref(null)

// 在 ready 事件中获取 viewer
async function onViewerReady({ Cesium, viewer }) {
  viewerInstance.value = viewer
  
  // 监听相机变化更新指北针 (集中管理)
  viewer.camera.changed.addEventListener(() => {
    compassRotation.value = Cesium.Math.toDegrees(viewer.camera.heading)
  })
}
</script>
```

**优势：**
- ✅ 状态集中管理，避免重复监听
- ✅ 子组件无需关心 viewer 的获取时机
- ✅ 符合单一数据源原则

#### 方式二：子组件独立获取（不推荐）❌

```vue
<!-- MapToolbar.vue (子组件) -->
<script setup>
import { useVueCesium } from 'vue-cesium'

const $vc = useVueCesium()

onMounted(() => {
  // 注意：子组件是 vc-viewer 的子组件时才能直接访问
  if ($vc.viewer) {
    console.log($vc.viewer)
  } else {
    // 否则需要等待 Promise
    $vc.creatingPromise.then((readyObj) => {
      console.log(readyObj.viewer)
    })
  }
})
</script>
```

**缺点：**
- ❌ 每个子组件都需要处理异步获取逻辑
- ❌ 可能导致重复的事件监听
- ❌ 状态管理分散，难以维护

---

## 🐛 常见问题修复

### 问题 1: `watch is not defined`

**原因：** 使用了 `watch` 但未从 Vue 导入

**错误代码：**
```typescript
// ❌ 错误示例
watch(() => viewerInstance.value, (viewer) => {
  // ...
})
```

**解决方案：** 移除子组件中的 watch，统一在父组件管理
```typescript
// ✅ 正确做法：在 Map.vue 中统一监听
async function onViewerReady({ Cesium, viewer }) {
  viewerInstance.value = viewer
  
  viewer.camera.changed.addEventListener(() => {
    compassRotation.value = Cesium.Math.toDegrees(viewer.camera.heading)
  })
}

// MapToolbar.vue 只负责显示
<div :style="{ transform: `rotate(${props.compassRotation}deg)` }">
```

### 问题 2: 指北针不旋转

**原因：** 相机事件监听在子组件中，但状态未同步

**解决方案：** 
1. 父组件监听相机变化
2. 通过 Props 传递旋转角度给子组件
3. 子组件只负责显示

### 问题 3: MVT 图层显隐操作不生效 ⭐

**原因：** `loadMVTLayer` 返回的是 `MVTImageryProvider` 对象，而非 `ImageryLayer` 对象

**错误代码：**
```typescript
// ❌ mapUtils.ts - 错误实现
async loadMVTLayer(viewer: any, styleUrl: string): Promise<any> {
  const provider = await MVTImageryProvider.fromUrl(styleUrl);
  viewer.imageryLayers.addImageryProvider(provider);
  return provider; // ❌ 返回 Provider，无法控制显隐
}

// ❌ MapToolbar.vue - 无效的显隐控制
layer.instance.show = false; // ❌ Provider 没有 show 属性
```

**正确实现：**
```typescript
// ✅ mapUtils.ts - 正确实现
async loadMVTLayer(viewer: any, styleUrl: string): Promise<any> {
  const provider = await MVTImageryProvider.fromUrl(styleUrl);
  // addImageryProvider 返回 ImageryLayer 对象
  const imageryLayer = viewer.imageryLayers.addImageryProvider(provider);
  return imageryLayer; // ✅ 返回 ImageryLayer，可以控制显隐
}

// ✅ MapToolbar.vue - 有效的显隐控制
const handleLayerToggle = (layerId, visible, layerData) => {
  const layer = loadedLayers.value.get(layerId);
  
  if (layer?.type === "mvt") {
    // ImageryLayer 对象有 show 属性
    layer.instance.show = visible;
    console.log(`✅ MVT图层已${visible ? '显示' : '隐藏'}: ${layerId}`);
  }
}

// ✅ 透明度控制也需要使用 ImageryLayer
layer.instance.alpha = opacity; // ImageryLayer 的 alpha 属性
```

**关键知识点：**
- `viewer.imageryLayers.addImageryProvider(provider)` 返回的是 `ImageryLayer` 对象
- `ImageryLayer` 才有 `show` 和 `alpha` 属性用于控制显隐和透明度
- `MVTImageryProvider` 只是数据提供者，不能直接控制显示

---

## 🎯 核心功能实现

### 1️⃣ 底图切换

**MapToolbar.vue (触发)**
```typescript
const switchBaseMap = (type: "vec" | "img" | "ter") => {
  emit('update:base-map', type)
  showBaseMapPanel.value = false
  console.log(`✅ 请求切换底图: ${type}`)
}
```

**Map.vue (处理)**
```typescript
const handleBaseMapChange = (type: 'vec' | 'img' | 'ter') => {
  currentBaseMapType.value = type
  console.log(`✅ 底图切换为: ${type}`)
}

// 计算属性自动更新天地图样式
const currentMapStyle = computed(() => {
  const styleMap = {
    'vec': 'vec_c',
    'img': 'img_c',
    'ter': 'ter_c'
  }
  return styleMap[currentBaseMapType.value]
})
```

### 2️⃣ 2D/3D 切换

**MapToolbar.vue (触发)**
```typescript
const toggleViewMode = () => {
  const newMode = props.sceneMode === 2 ? 3 : 2
  emit('update:scene-mode', newMode)
}
```

**Map.vue (处理)**
```typescript
const handleSceneModeChange = (mode: 2 | 3) => {
  if (!viewerInstance.value) return
  
  sceneMode.value = mode
  const Cesium = (window as any).Cesium
  
  viewerInstance.value.scene.mode = mode === 3 
    ? Cesium.SceneMode.SCENE3D 
    : Cesium.SceneMode.SCENE2D
}
```

### 3️⃣ 指北针联动

**Map.vue (监听相机变化)**
```typescript
async function onViewerReady({ Cesium, viewer }: any) {
  viewerInstance.value = viewer
  
  // 监听相机变化更新指北针
  viewer.camera.changed.addEventListener(() => {
    compassRotation.value = Cesium.Math.toDegrees(viewer.camera.heading)
  })
}
```

**MapToolbar.vue (显示)**
```vue
<div
  class="tool-icon compass"
  :style="{ transform: `rotate(${props.compassRotation}deg)` }"
>
  <img src="@/assets/map/compass.webp" alt="" />
</div>
```

### 4️⃣ 地图重置

**MapToolbar.vue (触发)**
```typescript
const resetMap = () => {
  emit('reset-map')
}
```

**Map.vue (处理)**
```typescript
const handleResetMap = () => {
  if (!viewerInstance.value) return
  
  const Cesium = (window as any).Cesium
  viewerInstance.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      mapConfig.center[0],
      mapConfig.center[1],
      50000
    ),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
    duration: 2,
  })
  
  // 重置到初始状态
  sceneMode.value = 2
  currentBaseMapType.value = 'vec'
}
```

---

## 📦 使用示例

### 在其他页面中使用 Map 组件

```vue
<template>
  <div class="page-container">
    <Map ref="mapRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Map from '@/mapComponents/Map.vue'

const mapRef = ref<any>(null)

// 访问地图实例
const getViewer = () => {
  return mapRef.value?.viewerInstance
}

// 切换测量工具
const toggleMeasure = () => {
  mapRef.value?.toggleMeasureTool()
}
</script>
```

---

## ✨ 优势总结

### ✅ 优点

1. **简单直接** - 符合 Vue 组件化思想
2. **状态流向清晰** - Props 向下，Events 向上
3. **紧密耦合** - 地图和工具栏是一体的业务单元
4. **无额外依赖** - 不需要全局状态管理
5. **代码更少** - 相比 Pinia 方案更简洁
6. **性能更好** - 减少了 Store 层的开销
7. **易于理解** - 新人可以快速上手

### 🎯 适用场景

- ✅ 地图和工具栏是紧密耦合的业务单元
- ✅ 不需要在多个路由间共享地图状态
- ✅ 不需要在非组件代码中操作地图
- ✅ 团队规模较小，代码维护简单

---

## 🚀 后续优化建议

1. **图层管理优化**
   - 实现图层缓存机制
   - 优化图层加载性能
   
2. **测量工具增强**
   - 添加更多测量类型（角度、高度等）
   - 支持测量结果导出

3. **工具栏扩展**
   - 添加更多地图工具（截图、标注等）
   - 支持工具栏自定义布局

4. **性能优化**
   - 按需加载图层数据
   - 实现虚拟滚动优化图层树

---

## 📝 注意事项

1. **Props 命名规范**
   - 使用 kebab-case: `:scene-mode`
   - TypeScript 中使用 camelCase: `sceneMode`

2. **Emit 命名规范**
   - 使用 update: 前缀表示更新: `update:scene-mode`
   - 使用动词开头表示操作: `reset-map`

3. **类型安全**
   - 所有 Props 都有明确的类型定义
   - 场景模式使用字面量类型 `2 | 3`

4. **响应式注意**
   - 指北针旋转角度由相机事件驱动
   - 底图样式通过 computed 自动计算

5. **vue-cesium 规范** ⭐
   - ✅ viewer 实例统一在 `vc-viewer` 的 `@ready` 事件中获取
   - ✅ 子组件作为 `vc-viewer` 的子组件挂载（推荐）
   - ✅ 通过 Props 传递 viewer 实例，避免重复获取
   - ❌ 避免在多个组件中重复监听同一事件

---

## 🔍 调试技巧

1. **查看 Props 传递**
   ```typescript
   // MapToolbar.vue
   import { watch } from 'vue' // 需要导入 watch
   
   watch(() => props, (value) => {
     console.log('Props 变化:', value)
   }, { deep: true })
   ```

2. **跟踪 Emit 事件**
   ```typescript
   // Map.vue
   const handleSceneModeChange = (mode: 2 | 3) => {
     console.log('收到场景模式切换事件:', mode)
     // ...
   }
   ```

3. **检查 Viewer 实例**
   ```typescript
   // Map.vue - onViewerReady
   console.log('Viewer 实例:', viewer)
   console.log('Cesium 命名空间:', Cesium)
   ```

4. **全局访问 Cesium**
   ```javascript
   // 开发环境控制台
   console.log(window.Cesium) // Cesium 是全局变量
   ```

---

## ⚠️ 避免的坑

### 1. 重复监听相机事件

**❌ 错误做法：**
```typescript
// Map.vue 中监听
viewer.camera.changed.addEventListener(() => { ... })

// MapToolbar.vue 中又监听一次
viewer.camera.changed.addEventListener(() => { ... })
```

**✅ 正确做法：**
```typescript
// 只在 Map.vue 中监听一次
viewer.camera.changed.addEventListener(() => {
  compassRotation.value = Cesium.Math.toDegrees(viewer.camera.heading)
})

// MapToolbar.vue 通过 Props 接收
:compass-rotation="compassRotation"
```

### 2. 未等待 viewer 就绪

**❌ 错误做法：**
```typescript
const viewerInstance = ref(null)

// 立即使用，此时可能为 null
viewerInstance.value.camera.flyTo(...)
```

**✅ 正确做法：**
```typescript
const handleResetMap = () => {
  if (!viewerInstance.value) return // 检查是否就绪
  
  viewerInstance.value.camera.flyTo(...)
}
```

### 3. Props 未添加类型断言

**❌ 错误做法：**
```vue
<MapToolbar :scene-mode="sceneMode" />
<!-- TypeScript 报错：number 不能分配给 2 | 3 -->
```

**✅ 正确做法：**
```vue
<MapToolbar :scene-mode="sceneMode as 2 | 3" />
```

---

**改造完成日期**: 2025-11-22  
**最后更新**: 2025-11-22 (修复 watch 错误)  
**技术栈**: Vue 3 + TypeScript + Cesium + vue-cesium
