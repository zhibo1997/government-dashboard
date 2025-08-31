<template>
  <div class="cesium-map-tools">
    <!-- 工具栏容器 -->
    <div class="tools-container">
      <!-- 视图控制 -->
      <div class="tool-group">
        <div class="tool-title">视图控制</div>
        <div class="tool-buttons">
          <a-tooltip
            v-for="tool in viewTools"
            :key="tool.id"
            :title="tool.name"
            placement="right"
          >
            <a-button
              :class="['tool-btn', { active: tool.active }]"
              @click="handleViewToolClick(tool)"
              size="large"
              type="text"
              shape="circle"
            >
              <template #icon>
                <component :is="tool.icon" />
              </template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 测量工具 -->
      <div class="tool-group">
        <div class="tool-title">测量工具</div>
        <div class="tool-buttons">
          <a-tooltip
            v-for="tool in measureTools"
            :key="tool.id"
            :title="tool.name"
            placement="right"
          >
            <a-button
              :class="['tool-btn', { active: tool.active }]"
              @click="handleMeasureToolClick(tool)"
              size="large"
              type="text"
              shape="circle"
            >
              <template #icon>
                <component :is="tool.icon" />
              </template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 绘制工具 -->
      <div class="tool-group">
        <div class="tool-title">绘制工具</div>
        <div class="tool-buttons">
          <a-tooltip
            v-for="tool in drawTools"
            :key="tool.id"
            :title="tool.name"
            placement="right"
          >
            <a-button
              :class="['tool-btn', { active: tool.active }]"
              @click="handleDrawToolClick(tool)"
              size="large"
              type="text"
              shape="circle"
            >
              <template #icon>
                <component :is="tool.icon" />
              </template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 图层控制 -->
      <div class="tool-group">
        <div class="tool-title">图层控制</div>
        <div class="tool-buttons">
          <a-tooltip
            v-for="tool in layerTools"
            :key="tool.id"
            :title="tool.name"
            placement="right"
          >
            <a-button
              :class="['tool-btn', { active: tool.active }]"
              @click="handleLayerToolClick(tool)"
              size="large"
              type="text"
              shape="circle"
            >
              <template #icon>
                <component :is="tool.icon" />
              </template>
            </a-button>
          </a-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/map/mapStore'
import { 
  CompressOutlined, 
  HomeOutlined, 
  MinusOutlined, 
  BorderOutlined, 
  AimOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'

// 使用地图store
const mapStore = useMapStore()

// 注入地图实例
const mapInstance = inject('mapInstance')

// 视图控制工具
const viewTools = ref([
  { 
    id: '2d3d', 
    name: '2D/3D', 
    icon: CompressOutlined, 
    active: false,
    description: '切换2D/3D视图模式'
  },
  { 
    id: 'home', 
    name: '重置视角', 
    icon: HomeOutlined, 
    active: false,
    description: '重置到默认视角'
  }
])

// 测量工具
const measureTools = ref([
  { 
    id: 'distance', 
    name: '距离测量', 
    icon: MinusOutlined, 
    active: false,
    description: '测量两点间距离'
  },
  { 
    id: 'area', 
    name: '面积测量', 
    icon: BorderOutlined, 
    active: false,
    description: '测量多边形面积'
  }
])

// 绘制工具
const drawTools = ref([
  { 
    id: 'point', 
    name: '绘制点', 
    icon: AimOutlined, 
    active: false,
    description: '在地图上绘制点'
  },
  { 
    id: 'line', 
    name: '绘制线', 
    icon: MinusOutlined, 
    active: false,
    description: '在地图上绘制线'
  },
  { 
    id: 'polygon', 
    name: '绘制面', 
    icon: BorderOutlined, 
    active: false,
    description: '在地图上绘制多边形'
  }
])

// 图层控制工具
const layerTools = ref([
  { 
    id: 'toggleLabels', 
    name: '标注开关', 
    icon: EyeOutlined, 
    active: true,
    description: '显示/隐藏地图标注'
  },
  { 
    id: 'toggleBridge', 
    name: '桥梁图层', 
    icon: EyeOutlined, 
    active: true,
    description: '显示/隐藏桥梁图层'
  },
  { 
    id: 'toggleManhole', 
    name: '井盖图层', 
    icon: EyeOutlined, 
    active: true,
    description: '显示/隐藏井盖图层'
  },
  { 
    id: 'switchMap', 
    name: '切换底图', 
    icon: EyeOutlined, 
    active: false,
    description: '切换地图底图类型'
  },
  { 
    id: 'clear', 
    name: '清除绘制', 
    icon: ClearOutlined, 
    active: false,
    description: '清除所有绘制内容'
  }
])

// 重置所有工具状态
const resetAllTools = () => {
  viewTools.value.forEach(tool => tool.active = false)
  measureTools.value.forEach(tool => tool.active = false)
  drawTools.value.forEach(tool => tool.active = false)
  layerTools.value.forEach(tool => {
    if (tool.id !== 'toggleLabels') tool.active = false
  })
}

// 视图控制工具点击处理
const handleViewToolClick = (tool) => {
  resetAllTools()
  tool.active = true
  
  switch (tool.id) {
    case '2d3d':
      handle2D3DToggle()
      break
    case 'home':
      handleResetView()
      break
  }
}

// 测量工具点击处理
const handleMeasureToolClick = (tool) => {
  resetAllTools()
  tool.active = true
  
  // 设置测量工具状态
  console.log("🚀 ~ handleMeasureToolClick ~ mapStore:", mapStore)
  mapStore.setMeasureTool(tool.id)
  
  switch (tool.id) {
    case 'distance':
      startDistanceMeasure()
      break
    case 'area':
      startAreaMeasure()
      break
  }
}

// 绘制工具点击处理
const handleDrawToolClick = (tool) => {
  resetAllTools()
  tool.active = true
  
  switch (tool.id) {
    case 'point':
      startPointDraw()
      break
    case 'line':
      startLineDraw()
      break
    case 'polygon':
      startPolygonDraw()
      break
  }
}

// 图层控制工具点击处理
const handleLayerToolClick = (tool) => {
  switch (tool.id) {
    case 'toggleLabels':
      handleToggleLabels()
      break
    case 'toggleBridge':
      handleToggleBridge()
      break
    case 'toggleManhole':
      handleToggleManhole()
      break
    case 'switchMap':
      handleSwitchMap()
      break
    case 'clear':
      handleClearDrawings()
      break
  }
}

// 2D/3D切换
const handle2D3DToggle = () => {
  if (!mapInstance?.value) return
  
  const currentView = mapStore.mapState.currentView
  const newView = currentView === '2D' ? '3D' : '2D'
  
  if (newView === '2D') {
    mapInstance.value.scene.morphTo2D(1.0)
  } else {
    mapInstance.value.scene.morphTo3D(1.0)
  }
  
  mapStore.toggleView()
  console.log(`切换到${newView}视图`)
}

// 重置视角
const handleResetView = () => {
  if (!mapInstance?.value) return
  
  mapInstance.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(115.133954, 29.823198, 50000),
    duration: 2
  })
  
  console.log('视角已重置')
}

// 开始距离测量
const startDistanceMeasure = async () => {
  if (!mapInstance?.value) return
  
  // 使用cesiumUtils的测量功能
  const { cesiumUtils } = await import('@/mapUtils/cesiumUtils')
  cesiumUtils.startDistanceMeasure((result) => {
    mapStore.addMeasureResult(result)
    console.log('距离测量结果:', result)
  })
}

// 开始面积测量
const startAreaMeasure = async () => {
  if (!mapInstance?.value) return
  
  // 使用cesiumUtils的测量功能
  const { cesiumUtils } = await import('@/mapUtils/cesiumUtils')
  cesiumUtils.startAreaMeasure((result) => {
    mapStore.addMeasureResult(result)
    console.log('面积测量结果:', result)
  })
}

// 开始绘制点
const startPointDraw = () => {
  if (!mapInstance?.value) return
  
  console.log('开始绘制点')
  // TODO: 实现点绘制逻辑
}

// 开始绘制线
const startLineDraw = () => {
  if (!mapInstance?.value) return
  
  console.log('开始绘制线')
  // TODO: 实现线绘制逻辑
}

// 开始绘制多边形
const startPolygonDraw = () => {
  if (!mapInstance?.value) return
  
  console.log('开始绘制多边形')
  // TODO: 实现多边形绘制逻辑
}

// 切换标注显示
const handleToggleLabels = () => {
  const tool = layerTools.value.find(t => t.id === 'toggleLabels')
  if (tool) {
    tool.active = !tool.active
    tool.icon = tool.active ? EyeOutlined : EyeInvisibleOutlined
    tool.name = tool.active ? '隐藏标注' : '显示标注'
  }
  
  mapStore.toggleLayer('labels')
  console.log('标注显示状态已切换')
}

// 切换桥梁图层显示
const handleToggleBridge = async () => {
  const tool = layerTools.value.find(t => t.id === 'toggleBridge')
  if (tool) {
    tool.active = !tool.active
    tool.icon = tool.active ? EyeOutlined : EyeInvisibleOutlined
    tool.name = tool.active ? '隐藏桥梁' : '显示桥梁'
  }
  
  // 使用cesiumUtils切换桥梁图层可见性
  const { cesiumUtils } = await import('@/mapUtils/cesiumUtils')
  cesiumUtils.setVectorTileLayerVisibility('bridge_layer', tool.active)
  
  console.log('桥梁图层显示状态已切换')
}

// 切换井盖图层显示
const handleToggleManhole = async () => {
  const tool = layerTools.value.find(t => t.id === 'toggleManhole')
  if (tool) {
    tool.active = !tool.active
    tool.icon = tool.active ? EyeOutlined : EyeInvisibleOutlined
    tool.name = tool.active ? '隐藏井盖' : '显示井盖'
  }
  
  // 使用cesiumUtils切换井盖图层可见性
  const { cesiumUtils } = await import('@/mapUtils/cesiumUtils')
  cesiumUtils.setVectorTileLayerVisibility('manhole_layer', tool.active)
  
  console.log('井盖图层显示状态已切换')
}

// 切换底图
const handleSwitchMap = async () => {
  if (!mapInstance?.value) return
  
  // 使用cesiumUtils切换底图
  const { cesiumUtils } = await import('@/mapUtils/cesiumUtils')
  
  // 循环切换底图类型
  const currentMapType = mapStore.layerState.currentBaseLayer
  let newMapType
  
  switch (currentMapType) {
    case 'img':
      newMapType = 'vec'
      break
    case 'vec':
      newMapType = 'ter'
      break
    case 'ter':
      newMapType = 'img'
      break
    default:
      newMapType = 'img'
  }
  
  cesiumUtils.switchBaseMap(newMapType)
  mapStore.setBaseLayer(newMapType)
  
  console.log(`已切换到${newMapType}底图`)
}

// 清除绘制内容
const handleClearDrawings = async () => {
  if (!mapInstance?.value) return
  
  // 使用cesiumUtils清除绘制内容
  const { cesiumUtils } = await import('@/mapUtils/cesiumUtils')
  cesiumUtils.clearMeasure()
  
  console.log('绘制内容已清除')
}

onMounted(() => {
  console.log('CesiumMapTools 组件已挂载')
})

onUnmounted(() => {
  console.log('CesiumMapTools 组件已卸载')
})
</script>

<style scoped>
.cesium-map-tools {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 5000;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.tools-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  min-width: 80px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tool-group {
  margin-bottom: 20px;
}

.tool-group:last-child {
  margin-bottom: 0;
}

.tool-title {
  color: #333;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.tool-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #1677ff;
  color: #1677ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.2);
}

.tool-btn.active {
  background: #1677ff;
  border-color: #1677ff;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.4);
}

.tool-btn .anticon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* 滚动条样式 */
.tools-container::-webkit-scrollbar {
  width: 4px;
}

.tools-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.tools-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.tools-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>