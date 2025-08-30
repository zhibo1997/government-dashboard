<template>
  <div 
    class="layer-tree-node"
    :class="{
      'is-group': node.type === 'group',
      'is-layer': node.type === 'layer',
      'is-selected': isSelected,
      'is-loading': isLoading
    }"
    :style="{ paddingLeft: `${level * 16 + 12}px` }"
  >
    <!-- 节点内容 -->
    <div class="node-content" @click="handleNodeClick">
      <!-- 展开/收起图标 -->
      <div 
        v-if="hasChildren"
        class="expand-icon"
        @click.stop="toggleExpand"
      >
        <svg 
          class="icon"
          :class="{ 'is-expanded': isExpanded }"
          viewBox="0 0 24 24"
        >
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </div>
      
      <!-- 占位符 -->
      <div v-else class="expand-placeholder"></div>

      <!-- 可见性切换 -->
      <div class="visibility-toggle" @click.stop="toggleVisibility">
        <svg 
          class="icon"
          :class="{ 'is-visible': node.visible }"
          viewBox="0 0 24 24"
        >
          <path v-if="node.visible" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          <path v-else d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
        </svg>
      </div>

      <!-- 图层图标 -->
      <div class="layer-icon" v-if="node.type === 'layer'">
        <svg class="icon" viewBox="0 0 24 24">
          <path v-if="node.properties?.icon === 'icon-manhole'" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          <path v-else-if="node.properties?.icon === 'icon-bridge'" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      <!-- 分组图标 -->
      <div class="group-icon" v-if="node.type === 'group'">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
        </svg>
      </div>

      <!-- 节点标题 -->
      <div class="node-title">
        <span class="title-text">{{ node.name }}</span>
        <span v-if="node.description" class="title-desc">{{ node.description }}</span>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="loading-spinner"></div>
      </div>

      <!-- 错误状态 -->
      <div v-if="hasError" class="error-indicator" :title="errorMessage">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    </div>

    <!-- 透明度控制 -->
    <div 
      v-if="node.type === 'layer' && node.visible && showOpacityControl"
      class="opacity-control"
      @click.stop
    >
      <label class="opacity-label">透明度</label>
      <input 
        type="range"
        class="opacity-slider"
        :value="node.opacity || 1"
        min="0"
        max="1"
        step="0.1"
        @input="handleOpacityChange"
      />
      <span class="opacity-value">{{ Math.round((node.opacity || 1) * 100) }}%</span>
    </div>

    <!-- 子节点 -->
    <div v-if="hasChildren && isExpanded" class="children-container">
      <LayerTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-layer="selectedLayer"
        @toggle-visibility="$emit('toggle-visibility', $event.nodeId, $event.visible)"
        @toggle-expand="$emit('toggle-expand', $event.nodeId, $event.expanded)"
        @opacity-change="$emit('opacity-change', $event.nodeId, $event.opacity)"
        @layer-select="$emit('layer-select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LayerTreeNode } from '@/types'

// Props
interface Props {
  node: LayerTreeNode
  level: number
  selectedLayer?: string | null
  showOpacityControl?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedLayer: null,
  showOpacityControl: true
})

// Emits
interface Emits {
  'toggle-visibility': [{ nodeId: string; visible: boolean }]
  'toggle-expand': [{ nodeId: string; expanded: boolean }]
  'opacity-change': [{ nodeId: string; opacity: number }]
  'layer-select': [nodeId: string]
}

const emit = defineEmits<Emits>()

// State
const isExpanded = ref(props.node.type === 'group')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Computed
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const isSelected = computed(() => {
  return props.selectedLayer === props.node.id
})

const hasError = computed(() => {
  return !!errorMessage.value
})

// Methods
/**
 * 切换节点展开状态
 */
const toggleExpand = () => {
  if (!hasChildren.value) return
  
  isExpanded.value = !isExpanded.value
  emit('toggle-expand', {
    nodeId: props.node.id,
    expanded: isExpanded.value
  })
}

/**
 * 切换可见性
 */
const toggleVisibility = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null
    
    const newVisible = !props.node.visible
    
    emit('toggle-visibility', {
      nodeId: props.node.id,
      visible: newVisible
    })
    
  } catch (error: any) {
    errorMessage.value = error.message || '切换可见性失败'
    console.error('Toggle visibility error:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 处理透明度变化
 */
const handleOpacityChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const opacity = parseFloat(target.value)
  
  emit('opacity-change', {
    nodeId: props.node.id,
    opacity
  })
}

/**
 * 处理节点点击
 */
const handleNodeClick = () => {
  if (props.node.type === 'layer') {
    emit('layer-select', props.node.id)
  } else if (props.node.type === 'group') {
    toggleExpand()
  }
}

// 监听节点变化
watch(
  () => props.node,
  (newNode) => {
    if (newNode.type === 'group') {
      isExpanded.value = true
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.layer-tree-node {
  .node-content {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    min-height: 32px;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .expand-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.08);
      }

      .icon {
        width: 16px;
        height: 16px;
        fill: var(--text-secondary);
        transition: transform 0.2s;

        &.is-expanded {
          transform: rotate(90deg);
        }
      }
    }

    .expand-placeholder {
      width: 20px;
      margin-right: 4px;
    }

    .visibility-toggle {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.08);
      }

      .icon {
        width: 16px;
        height: 16px;
        fill: var(--text-secondary);
        transition: all 0.2s;

        &.is-visible {
          fill: var(--primary-color);
        }
      }
    }

    .layer-icon,
    .group-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;

      .icon {
        width: 16px;
        height: 16px;
        fill: var(--text-secondary);
      }
    }

    .layer-icon .icon {
      fill: var(--primary-color);
    }

    .group-icon .icon {
      fill: var(--warning-color);
    }

    .node-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;

      .title-text {
        font-size: 13px;
        color: var(--text-primary);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .title-desc {
        font-size: 11px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }
    }

    .loading-indicator {
      width: 16px;
      height: 16px;
      margin-left: 8px;

      .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--border-primary);
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    .error-indicator {
      width: 16px;
      height: 16px;
      margin-left: 8px;
      cursor: help;

      .icon {
        width: 16px;
        height: 16px;
        fill: var(--error-color);
      }
    }
  }

  .opacity-control {
    display: flex;
    align-items: center;
    padding: 4px 8px 8px 44px;
    gap: 8px;

    .opacity-label {
      font-size: 11px;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .opacity-slider {
      flex: 1;
      height: 4px;
      background: var(--border-primary);
      border-radius: 2px;
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
      }

      &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: var(--primary-color);
        border-radius: 50%;
        border: none;
        cursor: pointer;
      }
    }

    .opacity-value {
      font-size: 11px;
      color: var(--text-secondary);
      min-width: 32px;
      text-align: right;
    }
  }

  .children-container {
    margin-left: 0;
  }

  // 状态样式
  &.is-selected .node-content {
    background: rgba(22, 119, 255, 0.1);
    border-left: 3px solid var(--primary-color);
  }

  &.is-group {
    .node-content .node-title .title-text {
      font-weight: 600;
    }
  }

  &.is-layer {
    .node-content {
      margin-left: 0;
    }
  }

  &.is-loading {
    .node-content {
      opacity: 0.7;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>