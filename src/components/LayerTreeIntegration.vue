<template>
  <div class="layer-tree-integration">
    <LayerTree
      :tree="layerTree"
      :loading="isLoading"
      :error="error"
      @toggle-visibility="handleToggleVisibility"
      @update-opacity="handleUpdateOpacity"
      @toggle-node="handleToggleNode"
      @refresh="handleRefresh"
      @expand-all="handleExpandAll"
      @collapse-all="handleCollapseAll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import LayerTree from './LayerTree.vue'
import { useMapStore } from '@/stores/mapStore'
import { LayerService } from '@/services/layerService'
import { cesiumUtils } from '@/mapUtils/cesiumUtils'
import type { LayerTreeNode } from '@/types'

// Store
const mapStore = useMapStore()
const { 
  viewer, 
  layerTreeState, 
  layerState 
} = storeToRefs(mapStore)

// 响应式数据
const layerService = new LayerService()
const isLoading = ref(false)
const error = ref<string | null>(null)
const layerTree = ref<LayerTreeNode[]>([])

// 初始化图层树
const initializeLayerTree = async (): Promise<void> => {
  try {
    isLoading.value = true
    error.value = null
    
    // 生成图层树结构
    const tree = layerService.generateLayerTree()
    layerTree.value = tree
    
    // 更新store中的图层树
    mapStore.setLayerTree(tree)
    
    // 预加载图层数据
    await layerService.preloadLayers()
    
  } catch (err) {
    console.error('初始化图层树失败:', err)
    error.value = err instanceof Error ? err.message : '初始化失败'
  } finally {
    isLoading.value = false
  }
}

// 处理图层可见性切换
const handleToggleVisibility = async (layerId: string, visible: boolean): Promise<void> => {
  try {
    // 更新图层树状态
    mapStore.updateLayerTreeState({ 
      layerId, 
      visible, 
      loading: true 
    })
    
    if (visible) {
      // 加载并显示图层
      await loadAndShowLayer(layerId)
    } else {
      // 隐藏图层
      hideLayer(layerId)
    }
    
    // 更新自定义图层状态
    mapStore.updateCustomLayerVisibility(layerId, visible)
    
    // 更新图层树状态
    mapStore.updateLayerTreeState({ 
      layerId, 
      loading: false 
    })
    
  } catch (err) {
    console.error(`切换图层 ${layerId} 可见性失败:`, err)
    mapStore.updateLayerTreeState({ 
      layerId, 
      loading: false,
      error: err instanceof Error ? err.message : '操作失败'
    })
  }
}

// 加载并显示图层
const loadAndShowLayer = async (layerId: string): Promise<void> => {
  if (!viewer.value) {
    throw new Error('地图未初始化')
  }
  
  try {
    // 检查图层是否已加载
    const existingDataSource = cesiumUtils.getLayerDataSource(layerId)
    if (existingDataSource) {
      // 图层已存在，直接显示
      cesiumUtils.setLayerVisibility(layerId, true)
      return
    }
    
    // 获取图层数据
    const layerData = await layerService.getLayerData(layerId)
    if (!layerData) {
      throw new Error(`图层 ${layerId} 数据不存在`)
    }
    
    // 加载图层到Cesium
    const dataSource = await cesiumUtils.loadCustomLayer(
      layerId, 
      layerData.url,
      {
        stroke: layerData.style?.stroke || '#1677ff',
        strokeWidth: layerData.style?.strokeWidth || 2,
        fill: layerData.style?.fill || '#1677ff'
      }
    )
    
    // 添加到自定义图层管理
    mapStore.addCustomLayer(layerId, {
      id: layerId,
      name: layerData.name,
      url: layerData.url,
      dataSource,
      style: layerData.style
    })
    
  } catch (err) {
    console.error(`加载图层 ${layerId} 失败:`, err)
    throw err
  }
}

// 隐藏图层
const hideLayer = (layerId: string): void => {
  cesiumUtils.setLayerVisibility(layerId, false)
}

// 处理透明度更新
const handleUpdateOpacity = (layerId: string, opacity: number): void => {
  try {
    // 更新Cesium图层透明度
    cesiumUtils.setLayerOpacity(layerId, opacity)
    
    // 更新store状态
    mapStore.updateCustomLayerOpacity(layerId, opacity)
    
  } catch (err) {
    console.error(`更新图层 ${layerId} 透明度失败:`, err)
  }
}

// 处理节点展开/收起
const handleToggleNode = (nodeId: string): void => {
  mapStore.toggleLayerTreeNode(nodeId)
}

// 处理刷新
const handleRefresh = async (): Promise<void> => {
  await initializeLayerTree()
}

// 处理展开所有节点
const handleExpandAll = (): void => {
  const expandAllNodes = (nodes: LayerTreeNode[]): void => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        mapStore.toggleLayerTreeNode(node.id)
        expandAllNodes(node.children)
      }
    })
  }
  
  expandAllNodes(layerTree.value)
}

// 处理收起所有节点
const handleCollapseAll = (): void => {
  // 清空展开的节点集合
  layerTreeState.value.expandedNodes.clear()
}

// 监听viewer变化，初始化图层树
watch(viewer, (newViewer) => {
  if (newViewer) {
    initializeLayerTree()
  }
}, { immediate: true })

// 组件挂载
onMounted(() => {
  if (viewer.value) {
    initializeLayerTree()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 清理自定义图层
  mapStore.clearCustomLayers()
  cesiumUtils.clearCustomLayers()
})
</script>

<style lang="scss" scoped>
.layer-tree-integration {
  width: 100%;
  height: 100%;
}
</style>