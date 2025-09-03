# Mapbox 测距工具使用示例

## 快速开始

### 1. 在组件中使用

```vue
<template>
  <div>
    <div id="map" style="width: 100%; height: 500px;"></div>
    <div class="controls">
      <button @click="startDistance">开始测距</button>
      <button @click="startArea">开始测面</button>
      <button @click="stopMeasure">停止测量</button>
      <button @click="clearAll">清除全部</button>
    </div>
    <div v-if="results.length > 0" class="results">
      <h3>测量结果</h3>
      <div v-for="result in results" :key="result.id">
        {{ result.type === 'distance' ? '距离' : '面积' }}: {{ result.label }}
        <button @click="removeResult(result.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import { createMeasureTool } from '@/mapUtils/measureUtils'

const results = ref([])
let map = null
let measureTool = null

onMounted(() => {
  // 初始化地图
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [115.133954, 29.823198],
    zoom: 10
  })

  map.on('load', () => {
    // 创建测量工具
    measureTool = createMeasureTool(map, {
      lineColor: '#ff4d4f',
      lineWidth: 3,
      pointColor: '#ff4d4f',
      pointRadius: 6,
      fillColor: '#ff4d4f',
      fillOpacity: 0.2,
      showTooltip: true,
      precision: 2
    })
  })
})

onUnmounted(() => {
  if (measureTool) {
    measureTool.destroy()
  }
})

function startDistance() {
  measureTool?.startDistanceMeasure()
  updateResults()
}

function startArea() {
  measureTool?.startAreaMeasure()
  updateResults()
}

function stopMeasure() {
  measureTool?.stopMeasure()
  updateResults()
}

function clearAll() {
  measureTool?.clearAllMeasures()
  results.value = []
}

function removeResult(id) {
  measureTool?.removeMeasureById(id)
  updateResults()
}

function updateResults() {
  if (measureTool) {
    results.value = measureTool.getAllResults()
  }
}
</script>
```

### 2. 基本API使用

```typescript
import { createMeasureTool } from '@/mapUtils/measureUtils'

// 创建测量工具
const measureTool = createMeasureTool(map, {
  lineColor: '#1677ff',
  lineWidth: 2,
  pointColor: '#1677ff',
  pointRadius: 5,
  fillColor: '#1677ff',
  fillOpacity: 0.3,
  textColor: '#000000',
  textSize: 12,
  showTooltip: true,
  precision: 2
})

// 开始距离测量
measureTool.startDistanceMeasure()

// 开始面积测量
measureTool.startAreaMeasure()

// 停止当前测量
measureTool.stopMeasure()

// 获取所有结果
const results = measureTool.getAllResults()

// 删除指定结果
measureTool.removeMeasureById('measure_id')

// 清除所有结果
measureTool.clearAllMeasures()

// 更新样式
measureTool.updateOptions({
  lineColor: '#00ff00',
  lineWidth: 4
})

// 销毁工具
measureTool.destroy()
```

## 高级用法

### 1. 自定义样式

```typescript
const measureTool = createMeasureTool(map, {
  // 线条样式
  lineColor: '#ff6b35',
  lineWidth: 4,
  
  // 点样式
  pointColor: '#ff6b35',
  pointRadius: 8,
  
  // 填充样式（面积测量）
  fillColor: '#ff6b35',
  fillOpacity: 0.25,
  
  // 文本样式
  textColor: '#333333',
  textSize: 16,
  
  // 其他选项
  showTooltip: true,
  precision: 3
})
```

### 2. 事件监听

```typescript
// 可以通过轮询方式监听结果变化
let lastResultCount = 0

setInterval(() => {
  const currentResults = measureTool.getAllResults()
  if (currentResults.length !== lastResultCount) {
    console.log('测量结果更新:', currentResults)
    lastResultCount = currentResults.length
  }
}, 1000)
```

### 3. 结果处理

```typescript
const results = measureTool.getAllResults()

results.forEach(result => {
  console.log(`ID: ${result.id}`)
  console.log(`类型: ${result.type}`)
  console.log(`数值: ${result.value} ${result.unit}`)
  console.log(`标签: ${result.label}`)
  console.log(`坐标点:`, result.points)
  console.log(`GeoJSON:`, result.geojson)
})
```

## 操作指南

### 距离测量
1. 调用 `startDistanceMeasure()`
2. 在地图上点击第一个点
3. 点击第二个点
4. 自动完成测量并显示结果

### 面积测量
1. 调用 `startAreaMeasure()`
2. 在地图上依次点击多个点（至少3个）
3. 双击最后一个点或按 Enter 键完成测量
4. 自动闭合多边形并显示结果

### 键盘快捷键
- **ESC**: 取消当前测量
- **Enter**: 完成面积测量（需要至少3个点）

## 注意事项

1. **地图实例**: 确保地图已经完全加载后再创建测量工具
2. **内存管理**: 组件销毁时记得调用 `destroy()` 方法
3. **样式冲突**: 测量工具会创建自己的图层，避免使用相同的图层ID
4. **坐标系统**: 测量基于WGS84坐标系，使用Turf.js进行精确计算
5. **性能考虑**: 大量测量结果可能影响地图性能，建议定期清理

## 故障排除

### 常见问题

**Q: 测量工具无法启动**
A: 检查地图实例是否已加载完成，确保在 `map.on('load')` 回调中创建工具

**Q: 测量结果不准确**
A: 确保使用正确的坐标系统，Turf.js计算基于WGS84

**Q: 样式不显示**
A: 检查样式配置是否正确，确保颜色值格式正确

**Q: 内存泄漏**
A: 确保在组件销毁时调用 `destroy()` 方法清理资源

### 调试技巧

```typescript
// 启用调试模式
console.log('测量工具状态:', {
  isActive: measureTool.isActive,
  currentTool: measureTool.currentTool,
  results: measureTool.getAllResults()
})

// 检查图层是否正确添加
console.log('测量图层:', [
  'measure-points',
  'measure-lines', 
  'measure-polygons-fill',
  'measure-polygons-stroke',
  'measure-labels',
  'measure-temp-line'
].map(id => ({
  id,
  exists: map.getLayer(id) !== undefined
})))