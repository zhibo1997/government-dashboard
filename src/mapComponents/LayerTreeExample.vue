<template>
  <div class="layer-tree-example">
    <div class="map-wrapper">
      <!-- Cesium地图 -->
      <vc-viewer 
        ref="cesiumViewerRef" 
        :camera="camera"
        @ready="onViewerReady"
      >
        <!-- 天地图底图 -->
        <vc-layer-imagery>
          <vc-imagery-provider-tianditu 
            map-style="vec_c" 
            :token="tiandituToken"
          />
        </vc-layer-imagery>
      </vc-viewer>

      <!-- 地图工具栏(已集成图层树) -->
      <div class="toolbar-container">
        <MapToolbar ref="toolbarRef" />
      </div>
    </div>

    <!-- 独立图层树面板示例 -->
    <div class="side-panel" v-if="showSidePanel">
      <div class="panel-header">
        <h3>图层管理</h3>
        <button @click="showSidePanel = false">关闭</button>
      </div>
      <OptimizedLayerTree
        ref="layerTreeRef"
        :viewer-instance="viewerInstance"
        @load-mvt="handleLoadMVT"
        @load-3dtiles="handleLoad3DTiles"
        @layer-toggle="handleLayerToggle"
        @layer-opacity-change="handleLayerOpacityChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MapToolbar from './MapToolbar.vue'
import OptimizedLayerTree from './OptimizedLayerTree.vue'
import cesiumUtils from '@/mapUtils/mapUtils'

// 组件引用
const cesiumViewerRef = ref<any>(null)
const toolbarRef = ref<any>(null)
const layerTreeRef = ref<any>(null)

// 状态
const viewerInstance = ref<any>(null)
const showSidePanel = ref(false)
const tiandituToken = import.meta.env.VITE_TIANDITU_KEY || ''

// 相机初始位置
const camera = ref({
  position: [115.186322, 29.864861, 50000]
})

// 已加载图层管理
const loadedLayers = ref<Map<string, {
  type: string
  instance: any
}>>(new Map())

/**
 * Viewer就绪回调
 */
function onViewerReady({ viewer }: any) {
  viewerInstance.value = viewer
  console.log('✅ Viewer已就绪')
}

/**
 * 处理MVT图层加载
 */
async function handleLoadMVT(url: string, layerId: string) {
  if (!viewerInstance.value) {
    console.warn('⚠️ Viewer未就绪')
    return
  }

  try {
    console.log(`🔄 开始加载MVT图层: ${layerId}`)
    
    // 使用cesiumUtils加载MVT
    const provider = await cesiumUtils.loadMVTLayer(viewerInstance.value, url)
    
    // 保存图层实例
    loadedLayers.value.set(layerId, {
      type: 'mvt',
      instance: provider
    })
    
    console.log(`✅ MVT图层加载成功: ${layerId}`)
    
    // 更新图层树状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: null
      })
    }
  } catch (error) {
    console.error(`❌ MVT图层加载失败: ${layerId}`, error)
    
    // 更新错误状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: '加载失败'
      })
    }
  }
}

/**
 * 处理3D Tiles图层加载
 */
async function handleLoad3DTiles(url: string, layerId: string) {
  if (!viewerInstance.value) {
    console.warn('⚠️ Viewer未就绪')
    return
  }

  try {
    console.log(`🔄 开始加载3D Tiles: ${layerId}`)
    
    // 使用cesiumUtils加载3D Tiles
    const tileset = await cesiumUtils.load3DTiles(viewerInstance.value, url, {
      maximumScreenSpaceError: 16,
      maximumMemoryUsage: 512
    })
    
    // 保存图层实例
    loadedLayers.value.set(layerId, {
      type: '3dtiles',
      instance: tileset
    })
    
    console.log(`✅ 3D Tiles加载成功: ${layerId}`)
    
    // 更新图层树状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: null
      })
    }
  } catch (error) {
    console.error(`❌ 3D Tiles加载失败: ${layerId}`, error)
    
    // 更新错误状态
    if (layerTreeRef.value) {
      layerTreeRef.value.updateLayerState(layerId, {
        loading: false,
        error: '加载失败'
      })
    }
  }
}

/**
 * 处理图层显隐切换
 */
function handleLayerToggle(layerId: string, visible: boolean, layerData: any) {
  console.log(`${visible ? '显示' : '隐藏'}图层: ${layerId}`)
  
  const layer = loadedLayers.value.get(layerId)
  
  if (!visible && layer) {
    // 隐藏图层
    if (layer.type === '3dtiles') {
      cesiumUtils.set3DTilesVisibility(layer.instance, false)
    } else if (layer.type === 'mvt' && layer.instance.show !== undefined) {
      layer.instance.show = false
    }
  } else if (visible && layer) {
    // 显示图层
    if (layer.type === '3dtiles') {
      cesiumUtils.set3DTilesVisibility(layer.instance, true)
    } else if (layer.type === 'mvt' && layer.instance.show !== undefined) {
      layer.instance.show = true
    }
  } else if (visible && !layer) {
    // 图层未加载,触发加载
    if (layerData.type === 'mvt') {
      handleLoadMVT(layerData.url, layerId)
    } else if (layerData.type === '3dTile') {
      handleLoad3DTiles(layerData.url, layerId)
    }
  }
}

/**
 * 处理图层透明度变化
 */
function handleLayerOpacityChange(layerId: string, opacity: number) {
  console.log(`调整图层透明度: ${layerId} -> ${opacity}`)
  
  const layer = loadedLayers.value.get(layerId)
  
  if (layer) {
    if (layer.type === '3dtiles') {
      // 3D Tiles透明度
      cesiumUtils.set3DTilesStyle(layer.instance, {
        color: `color('white', ${opacity})`
      })
    } else if (layer.type === 'mvt' && layer.instance.alpha !== undefined) {
      // MVT透明度
      layer.instance.alpha = opacity
    }
  }
}

/**
 * 切换侧边面板
 */
function toggleSidePanel() {
  showSidePanel.value = !showSidePanel.value
}

// 暴露方法
defineExpose({
  viewerInstance,
  loadedLayers,
  toggleSidePanel
})
</script>

<style lang="scss" scoped>
.layer-tree-example {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.toolbar-container {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
}

.side-panel {
  width: 400px;
  height: 100%;
  background: rgba(0, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border-left: 2px solid rgba(22, 119, 255, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header {
    padding: 20px;
    border-bottom: 1px solid rgba(22, 119, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
    }

    button {
      padding: 8px 16px;
      background: rgba(22, 119, 255, 0.2);
      border: 1px solid rgba(22, 119, 255, 0.5);
      border-radius: 4px;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(22, 119, 255, 0.3);
        border-color: #1677ff;
      }
    }
  }
}

:deep(.cesium-viewer) {
  width: 100%;
  height: 100%;
}
</style>
