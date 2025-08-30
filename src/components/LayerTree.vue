<template>
  <div class="layer-tree">
    <div class="layer-tree-header">
      <h3 class="tree-title">图层管理</h3>
      <div class="tree-actions">
        <button 
          class="action-btn"
          @click="refreshLayers"
          :disabled="isLoading"
          title="刷新图层"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
        <button 
          class="action-btn"
          @click="expandAll"
          title="展开所有"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
        <button 
          class="action-btn"
          @click="collapseAll"
          title="收起所有"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="layer-tree-content" v-if="!isLoading">
      <div 
        v-for="node in layerTree" 
        :key="node.id"
        class="tree-node"
        :class="{ 'is-group': node.type === 'group' }"
      >
        <LayerTreeNode 
          :node="node"
          :level="0"
          @toggle-visibility="handleToggleVisibility"
          @toggle-expand="handleToggleExpand"
          @opacity-change="handleOpacityChange"
          @layer-select="handleLayerSelect"
        />
      </div>
    </div>

    <div class="layer-tree-loading" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p>正在加载图层数据...</p>
    </div>

    <div class="layer-tree-empty" v-if="!isLoading && layerTree.length === 0">
      <p>暂无图层数据</p>
      <button class="refresh-btn" @click="refreshLayers">
        重新加载
      </button>
    </div>

    <div class="layer-tree-error" v-if="error">
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="refreshLayers">
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { layerService } from '@/services/layerService'
import LayerTreeNode from './LayerTreeNode.vue'
import type { LayerTreeNode as LayerTreeNodeType } from '@/types'

// Props
interface Props {
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '300px',
  height: '100%'
})

// Emits
interface Emits {
  layerToggle: [layerId: string, visible: boolean]
  layerSelect: [layerId: string]
  opacityChange: [layerId: string, opacity: number]
}

const emit = defineEmits<Emits>()

// Store
const mapStore = useMapStore()

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const layerTree = ref<LayerTreeNodeType[]>([])
const expandedNodes = reactive(new Set<string>())
const selectedLayer = ref<string | null>(null)

// Computed
const hasLayers = computed(() => layerTree.value.length > 0)

// Methods
/**
 * 初始化图层树
 */
const initializeLayerTree = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // 生成图层树结构
    const treeData = layerService.generateLayerTree()
    layerTree.value = treeData
    
    // 默认展开所有分组节点
    treeData.forEach(node => {
      if (node.type === 'group') {
        expandedNodes.add(node.id)
      }
    })
    
    // 预加载图层数据
    await layerService.preloadAllLayers()
    
  } catch (err: any) {
    error.value = layerService.handleLayerError(err, 'layer-tree')
    console.error('Failed to initialize layer tree:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 刷新图层
 */
const refreshLayers = async () => {
  layerService.clearCache()
  await initializeLayerTree()
}

/**
 * 展开所有节点
 */
const expandAll = () => {
  const expandAllNodes = (nodes: LayerTreeNodeType[]) => {
    nodes.forEach(node => {
      if (node.type === 'group') {
        expandedNodes.add(node.id)
        if (node.children) {
          expandAllNodes(node.children)
        }
      }
    })
  }
  expandAllNodes(layerTree.value)
}

/**
 * 收起所有节点
 */
const collapseAll = () => {
  expandedNodes.clear()
}

/**
 * 处理图层可见性切换
 */
const handleToggleVisibility = async (nodeId: string, visible: boolean) => {
  try {
    // 更新节点状态
    updateNodeVisibility(layerTree.value, nodeId, visible)
    
    // 触发事件
    emit('layerToggle', nodeId, visible)
    
    // 更新store状态
    mapStore.updateLayerTreeState({
      layerId: nodeId,
      visible,
      loading: false,
      error: null
    })
    
  } catch (err: any) {
    const errorMsg = layerService.handleLayerError(err, nodeId)
    error.value = errorMsg
    
    // 更新store错误状态
    mapStore.updateLayerTreeState({
      layerId: nodeId,
      visible: false,
      loading: false,
      error: errorMsg
    })
  }
}

/**
 * 处理节点展开/收起
 */
const handleToggleExpand = (nodeId: string, expanded: boolean) => {
  if (expanded) {
    expandedNodes.add(nodeId)
  } else {
    expandedNodes.delete(nodeId)
  }
}

/**
 * 处理透明度变化
 */
const handleOpacityChange = (nodeId: string, opacity: number) => {
  // 更新节点透明度
  updateNodeOpacity(layerTree.value, nodeId, opacity)
  
  // 触发事件
  emit('opacityChange', nodeId, opacity)
  
  // 更新store状态
  mapStore.updateLayerTreeState({
    layerId: nodeId,
    opacity
  })
}

/**
 * 处理图层选择
 */
const handleLayerSelect = (nodeId: string) => {
  selectedLayer.value = nodeId
  emit('layerSelect', nodeId)
}

/**
 * 更新节点可见性
 */
const updateNodeVisibility = (nodes: LayerTreeNodeType[], nodeId: string, visible: boolean): boolean => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      node.visible = visible
      return true
    }
    if (node.children && updateNodeVisibility(node.children, nodeId, visible)) {
      return true
    }
  }
  return false
}

/**
 * 更新节点透明度
 */
const updateNodeOpacity = (nodes: LayerTreeNodeType[], nodeId: string, opacity: number): boolean => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      node.opacity = opacity
      return true
    }
    if (node.children && updateNodeOpacity(node.children, nodeId, opacity)) {
      return true
    }
  }
  return false
}

/**
 * 获取节点是否展开
 */
const isNodeExpanded = (nodeId: string): boolean => {
  return expandedNodes.has(nodeId)
}

// 暴露方法给父组件
defineExpose({
  refreshLayers,
  expandAll,
  collapseAll,
  isNodeExpanded
})

// 生命周期
onMounted(() => {
  initializeLayerTree()
})
</script>

<style lang="scss" scoped>
.layer-tree {
  width: v-bind('props.width');
  height: v-bind('props.height');
  background: var(--bg-layout);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .layer-tree-header {
    padding: 12px 16px;
    background: #ffffff;
    border-bottom: 1px solid var(--border-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .tree-title {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .tree-actions {
      display: flex;
      gap: 4px;

      .action-btn {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
          background: var(--bg-layout);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .icon {
          width: 16px;
          height: 16px;
          fill: var(--text-secondary);
        }
      }
    }
  }

  .layer-tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    .tree-node {
      &.is-group {
        margin-bottom: 4px;
      }
    }
  }

  .layer-tree-loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--text-secondary);

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-primary);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .layer-tree-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--text-secondary);

    p {
      margin: 0 0 16px 0;
      font-size: 14px;
    }

    .refresh-btn {
      padding: 6px 12px;
      border: 1px solid var(--border-primary);
      background: #ffffff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: var(--text-primary);
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }

  .layer-tree-error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;

    .error-message {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: var(--error-color);
      text-align: center;
    }

    .retry-btn {
      padding: 6px 12px;
      border: 1px solid var(--error-color);
      background: #ffffff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: var(--error-color);
      transition: all 0.2s;

      &:hover {
        background: var(--error-color);
        color: #ffffff;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 滚动条样式
.layer-tree-content::-webkit-scrollbar {
  width: 6px;
}

.layer-tree-content::-webkit-scrollbar-track {
  background: transparent;
}

.layer-tree-content::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 3px;

  &:hover {
    background: var(--text-secondary);
  }
}
</style>