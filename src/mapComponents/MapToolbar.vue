<template>
  <div class="map-toolbar" :class="{ collapsed: isCollapsed }">
    <!-- 收缩按钮 -->
    <div class="toolbar-item" @click="toggleCollapse" title="收缩/展开">
      <div class="tool-icon">
        <img src="@/assets/map/collapse.webp" alt="" />
      </div>
    </div>

    <!-- 工具按钮组 (收缩时隐藏) -->
    <template v-if="!isCollapsed">
      <!-- 图层树 -->
      <div 
        class="toolbar-item" 
        :class="{ active: showLayerTreePanel }"
        @click="toggleLayerTreePanel" 
        title="图层树"
      >
        <div class="tool-icon">
          <img src="@/assets/map/map_tree.webp" alt="">
        </div>
        <!-- 图层树面板 -->
        <transition name="slide-left">
          <div v-if="showLayerTreePanel" class="layer-tree-panel">
            <div class="panel-title">图层管理</div>
            <OptimizedLayerTree
              ref="layerTreeRef"
              :viewer-instance="viewerInstance"
              @load-mvt="handleLoadMVT"
              @load-3dtiles="handleLoad3DTiles"
              @layer-toggle="handleLayerToggle"
              @layer-opacity-change="handleLayerOpacityChange"
            />
          </div>
        </transition>
      </div>

      <!-- 底图切换 -->
      <div 
        class="toolbar-item" 
        :class="{ active: showBaseMapPanel }"
        @click="toggleBaseMapPanel" 
        title="底图切换"
      >
        <div class="tool-icon">
          <img src="@/assets/map/base_map.webp" alt="">
        </div>
        <!-- 底图切换面板 -->
        <transition name="slide-left">
          <div v-if="showBaseMapPanel" class="base-map-panel">
            <div class="panel-title">底图切换</div>
            <div class="base-map-options">
              <div 
                v-for="item in baseMapTypes" 
                :key="item.value"
                class="base-map-option"
                :class="{ active: currentBaseMap === item.value }"
                @click.stop="switchBaseMap(item.value)"
              >
                <div class="option-icon">{{ item.icon }}</div>
                <div class="option-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 地图重置 -->
      <div class="toolbar-item" @click="resetMap" title="重置地图">
        <div class="tool-icon">
          <img src="@/assets/map/reset_map.webp" alt="">
        </div>
      </div>

      <!-- 2D/3D切换 -->
      <div class="toolbar-item" @click="toggleViewMode" title="2D/3D切换">
        <div class="tool-icon">
          <img src="@/assets/map/view_mode.webp" alt="">
        </div>
      </div>

      <!-- 指北针 -->
      <div class="toolbar-item" @click="resetNorth" title="指北针">
        <div class="tool-icon compass" :style="{ transform: `rotate(${compassRotation}deg)` }">
          <img src="@/assets/map/compass.webp" alt="">
        </div>
      </div>

      <!-- 测量工具 -->
      <div 
        class="toolbar-item" 
        :class="{ active: showMeasurePanel }"
        @click="toggleMeasurePanel" 
        title="测量工具"
      >
        <div class="tool-icon">
          <img src="@/assets/map/measure.webp" alt="">
        </div>
        <!-- 测量工具面板 -->
        <transition name="slide-left">
          <div v-if="showMeasurePanel" class="measure-panel">
            <div class="panel-title">测量工具</div>
            <div class="measure-options">
              <div 
                class="measure-option"
                :class="{ active: measureMode === 'distance' }"
                @click.stop="startMeasure('distance')"
              >
                <span class="option-icon">📐</span>
                <span class="option-label">距离测量</span>
              </div>
              <div 
                class="measure-option"
                :class="{ active: measureMode === 'area' }"
                @click.stop="startMeasure('area')"
              >
                <span class="option-icon">📦</span>
                <span class="option-label">面积测量</span>
              </div>
              <div 
                v-if="measureMode"
                class="measure-option clear"
                @click.stop="clearMeasure"
              >
                <span class="option-icon">🗑️</span>
                <span class="option-label">清除测量</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useVueCesium } from 'vue-cesium'
import type { VcViewerProvider, VcReadyObject } from 'vue-cesium/es/utils/types'
import mapConfig from '@/config/mapConfig'
import OptimizedLayerTree from './OptimizedLayerTree.vue'
import cesiumUtils from '@/mapUtils/mapUtils'

const $vc: VcViewerProvider = useVueCesium()

// 状态管理
const isCollapsed = ref(false)
const showLayerTreePanel = ref(false)
const showBaseMapPanel = ref(false)
const showMeasurePanel = ref(false)
const currentBaseMap = ref<'vec' | 'img' | 'ter'>('vec')
const is3D = ref(false)
const measureMode = ref<'distance' | 'area' | null>(null)
const compassRotation = ref(0)
const viewerInstance = ref<any>(null)
const layerTreeRef = ref<any>(null)

// 存储已加载的图层实例
const loadedLayers = ref<Map<string, any>>(new Map())

// 底图类型配置
const baseMapTypes = [
  { value: 'vec', label: '矢量地图', icon: '🗺️' },
  { value: 'img', label: '影像地图', icon: '🛰️' },
  { value: 'ter', label: '地形地图', icon: '🏔️' }
] as const

// 获取 viewer 实例
onMounted(() => {
  // 如果 MapToolbar 作为 vc-viewer 的子组件，直接访问
  if ($vc.viewer) {
    viewerInstance.value = $vc.viewer
    console.log('✅ MapToolbar: 获取到 viewer 实例')
  } else {
    // 如果不是子组件，等待 viewer 创建完成
    $vc.creatingPromise.then((readyObj: VcReadyObject) => {
      viewerInstance.value = readyObj.viewer
      console.log('✅ MapToolbar: 通过 Promise 获取到 viewer 实例')
    })
  }
})

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // 收缩时关闭所有面板
  if (isCollapsed.value) {
    showLayerTreePanel.value = false
    showBaseMapPanel.value = false
    showMeasurePanel.value = false
  }
}

// 切换图层树面板
const toggleLayerTreePanel = () => {
  showLayerTreePanel.value = !showLayerTreePanel.value
  showBaseMapPanel.value = false
  showMeasurePanel.value = false
}

// 切换底图面板
const toggleBaseMapPanel = () => {
  showBaseMapPanel.value = !showBaseMapPanel.value
  showLayerTreePanel.value = false
  showMeasurePanel.value = false
}

// 切换测量面板
const toggleMeasurePanel = () => {
  showMeasurePanel.value = !showMeasurePanel.value
  showLayerTreePanel.value = false
  showBaseMapPanel.value = false
}

// 处理加载MVT图层
const handleLoadMVT = async (url: string, layerId: string) => {
  if (!viewerInstance.value) {
    console.warn('⚠️ Viewer 实例未就绪')
    return
  }

  try {
    console.log(`🔄 加载MVT图层: ${url}`)
    
    const provider = await cesiumUtils.loadMVTLayer(viewerInstance.value, url)
    loadedLayers.value.set(layerId, { type: 'mvt', instance: provider })
    
    console.log(`✅ MVT图层加载成功: ${layerId}`)
  } catch (error) {
    console.error(`❌ MVT图层加载失败: ${layerId}`, error)
    
    // 更新图层树状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: '加载失败'
      })
    }
  }
}

// 处理加载3D Tiles图层
const handleLoad3DTiles = async (url: string, layerId: string) => {
  if (!viewerInstance.value) {
    console.warn('⚠️ Viewer 实例未就绪')
    return
  }

  try {
    console.log(`🔄 加载3D Tiles图层: ${url}`)
    
    const tileset = await cesiumUtils.load3DTiles(viewerInstance.value, url)
    loadedLayers.value.set(layerId, { type: '3dtiles', instance: tileset })
    
    console.log(`✅ 3D Tiles图层加载成功: ${layerId}`)
  } catch (error) {
    console.error(`❌ 3D Tiles图层加载失败: ${layerId}`, error)
    
    // 更新图层树状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: '加载失败'
      })
    }
  }
}

// 处理图层显隐切换
const handleLayerToggle = (layerId: string, visible: boolean, layerData: any) => {
  console.log(`${visible ? '显示' : '隐藏'}图层:`, layerId)
  
  const layer = loadedLayers.value.get(layerId)
  
  if (!visible && layer) {
    // 隐藏或移除图层
    if (layer.type === '3dtiles') {
      cesiumUtils.set3DTilesVisibility(layer.instance, false)
    } else if (layer.type === 'mvt') {
      // MVT图层显隐控制
      if (layer.instance && layer.instance.show !== undefined) {
        layer.instance.show = false
      }
    }
  } else if (visible && !layer) {
    // 图层未加载,需要加载
    if (layerData.type === 'mvt') {
      handleLoadMVT(layerData.url, layerId)
    } else if (layerData.type === '3dTile') {
      handleLoad3DTiles(layerData.url, layerId)
    }
  } else if (visible && layer) {
    // 显示已加载的图层
    if (layer.type === '3dtiles') {
      cesiumUtils.set3DTilesVisibility(layer.instance, true)
    } else if (layer.type === 'mvt') {
      if (layer.instance && layer.instance.show !== undefined) {
        layer.instance.show = true
      }
    }
  }
}

// 处理图层透明度变化
const handleLayerOpacityChange = (layerId: string, opacity: number) => {
  console.log(`调整图层透明度: ${layerId}, ${opacity}`)
  
  const layer = loadedLayers.value.get(layerId)
  
  if (layer) {
    if (layer.type === '3dtiles' && layer.instance) {
      // 3D Tiles透明度控制
      cesiumUtils.set3DTilesStyle(layer.instance, {
        color: `color('white', ${opacity})`
      })
    } else if (layer.type === 'mvt' && layer.instance) {
      // MVT图层透明度控制
      if (layer.instance.alpha !== undefined) {
        layer.instance.alpha = opacity
      }
    }
  }
}

// 切换底图
const switchBaseMap = (type: 'vec' | 'img' | 'ter') => {
  currentBaseMap.value = type
  console.log(`切换底图: ${type}`)
  
  // TODO: 实现底图切换逻辑
  // 需要通过 viewer 实例来切换天地图样式
}

// 重置地图
const resetMap = () => {
  if (!viewerInstance.value) {
    console.warn('⚠️ Viewer 实例未就绪')
    return
  }

  const Cesium = (window as any).Cesium
  if (Cesium) {
    viewerInstance.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        mapConfig.center[0],
        mapConfig.center[1],
        50000
      ),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      },
      duration: 2
    })
    console.log('✅ 地图视角已重置')
  }
}

// 切换2D/3D视图
const toggleViewMode = () => {
  if (!viewerInstance.value) {
    console.warn('⚠️ Viewer 实例未就绪')
    return
  }

  is3D.value = !is3D.value
  const Cesium = (window as any).Cesium
  if (Cesium) {
    viewerInstance.value.scene.mode = is3D.value 
      ? Cesium.SceneMode.SCENE3D 
      : Cesium.SceneMode.SCENE2D
    console.log(`切换视图模式: ${is3D.value ? '3D' : '2D'}`)
  }
}

// 重置指北
const resetNorth = () => {
  if (!viewerInstance.value) {
    console.warn('⚠️ Viewer 实例未就绪')
    return
  }

  const Cesium = (window as any).Cesium
  if (Cesium) {
    viewerInstance.value.camera.setView({
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      }
    })
    compassRotation.value = 0
    console.log('✅ 重置指北方向')
  }
}

// 开始测量
const startMeasure = (mode: 'distance' | 'area') => {
  measureMode.value = mode
  console.log(`开始${mode === 'distance' ? '距离' : '面积'}测量`)
  
  // TODO: 实现测量功能
  // 需要使用Cesium的绘制工具
}

// 清除测量
const clearMeasure = () => {
  measureMode.value = null
  console.log('清除测量结果')
  
  // TODO: 清除地图上的测量标注
}

// 监听相机朝向变化更新指北针
watch(() => viewerInstance.value, (viewer) => {
  if (viewer) {
    const Cesium = (window as any).Cesium
    if (Cesium) {
      // 监听相机变化更新指北针旋转角度
      viewer.camera.changed.addEventListener(() => {
        const heading = viewer.camera.heading
        compassRotation.value = Cesium.Math.toDegrees(heading)
      })
    }
  }
}, { immediate: true })

// 暴露方法
defineExpose({
  isCollapsed,
  currentBaseMap,
  measureMode,
  viewerInstance,
  loadedLayers,
  layerTreeRef
})
</script>

<style lang="scss" scoped>
.map-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1000;
  transition: all 0.3s ease;

  &.collapsed {
    gap: 0;
    
    .toolbar-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .toolbar-item {
    position: relative;
    width: 80px;
    height: 80px;
    background: rgba(0, 15, 35, 0.85);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

    &:hover:not(.disabled) {
      transform: scale(1.05);
    }

    &.active {
      border-color: #1677ff;
      background: rgba(22, 119, 255, 0.25);
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        border-color: rgba(22, 119, 255, 0.3);
        background: rgba(0, 15, 35, 0.85);
      }
    }

    .tool-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
      background-image: url('@/assets/map/tool_bg.webp');

      &.compass {
        transition: transform 0.6s ease;
      }

      .icon-placeholder {
        font-size: 32px;
        color: #1677ff;
        text-shadow: 0 2px 8px rgba(22, 119, 255, 0.5);
      }
    }

  }

  // 图层树面板
  .layer-tree-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 400px;
    max-height: 600px;
    background: rgba(0, 15, 35, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);
      flex-shrink: 0;
    }
  }

  // 底图切换面板
  .base-map-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 240px;
    background: rgba(0, 15, 35, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);
    }

    .base-map-options {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .base-map-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(22, 119, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(22, 119, 255, 0.15);
          border-color: rgba(22, 119, 255, 0.5);
          transform: translateX(-4px);
        }

        &.active {
          background: rgba(22, 119, 255, 0.25);
          border-color: #1677ff;
          
          .option-label {
            color: #1677ff;
            font-weight: bold;
          }
        }

        .option-icon {
          font-size: 24px;
        }

        .option-label {
          font-size: 16px;
          color: #ffffff;
          flex: 1;
        }
      }
    }
  }

  // 测量工具面板
  .measure-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 240px;
    background: rgba(0, 15, 35, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);
    }

    .measure-options {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .measure-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(22, 119, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(22, 119, 255, 0.15);
          border-color: rgba(22, 119, 255, 0.5);
          transform: translateX(-4px);
        }

        &.active {
          background: rgba(22, 119, 255, 0.25);
          border-color: #1677ff;
          
          .option-label {
            color: #1677ff;
            font-weight: bold;
          }
        }

        &.clear {
          border-color: rgba(255, 77, 79, 0.3);
          
          &:hover {
            background: rgba(255, 77, 79, 0.15);
            border-color: rgba(255, 77, 79, 0.6);
          }
          
          .option-label {
            color: #ff4d4f;
          }
        }

        .option-icon {
          font-size: 20px;
        }

        .option-label {
          font-size: 16px;
          color: #ffffff;
          flex: 1;
        }
      }
    }
  }

  // 面板滑入动画
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: all 0.3s ease;
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
}

</style>
