<template>
  <div class="layer-tree-3d">
    <div class="layer-tree-header">
      <h3>三维图层</h3>
      <n-button size="small" @click="refreshLayers">刷新</n-button>
    </div>
    
    <div class="layer-tree-content">
      <n-tree
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        :data="treeData"
        :selectable="false"
        @update:checked-keys="onCheck"
      >
        <template #title="{ option }">
          <div class="tree-node-title">
            <span>{{ option.title }}</span>
            <div v-if="option.layer" class="node-controls">
              <n-slider
                :min="0"
                :max="100"
                :value="getLayerOpacity(option.key)"
                :style="{ width: '80px' }"
                @update:value="(value) => onOpacityChange(option.key, value)"
                @click.stop
              />
              <n-tooltip v-if="option.layer && option.layer.type === 'tileset'" trigger="hover" placement="top">
                <template #trigger>
                  <n-button 
                    text 
                    size="small"
                    @click.stop="locateLayer(option.key)"
                  >
                    📍
                  </n-button>
                </template>
                定位
              </n-tooltip>
            </div>
          </div>
        </template>
      </n-tree>

      <div v-if="loading" class="loading-mask">
        <n-spin size="medium" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NTree, NButton, NSlider, NSpin, NTooltip } from 'naive-ui'
import { useMapStore } from '@/stores/mapStore'

interface TreeNode {
  title: string
  key: string
  children?: TreeNode[]
  layer?: {
    type: string
    url?: string
    visible: boolean
    opacity: number
    height?: number
  }
}

const mapStore = useMapStore()

const loading = ref(false)

// 三维图层树数据
const treeData = ref<TreeNode[]>([
  {
    title: '三维模型',
    key: '3d-models',
    children: [
      {
        title: '建筑模型',
        key: 'building-tileset',
        layer: {
          type: 'tileset',
          url: '',
          visible: false,
          opacity: 100,
          height: 0
        }
      }
    ]
  },
  {
    title: '地形图层',
    key: 'terrain-layers',
    children: [
      {
        title: '全球地形',
        key: 'global-terrain',
        layer: {
          type: 'terrain',
          visible: false,
          opacity: 100
        }
      }
    ]
  },
  {
    title: '三维要素',
    key: '3d-features',
    children: [
      {
        title: '桥梁三维模型',
        key: 'bridge-3d',
        layer: {
          type: 'model',
          visible: false,
          opacity: 100
        }
      }
    ]
  }
])

// 选中的图层keys
const checkedKeys = ref<string[]>([])

// 展开的节点keys
const expandedKeys = ref<string[]>(['3d-models', 'terrain-layers', '3d-features'])

// 图层透明度状态
const layerOpacities = ref<Record<string, number>>({
  'building-tileset': 100,
  'global-terrain': 100,
  'bridge-3d': 100
})

/**
 * 获取图层透明度
 */
function getLayerOpacity(key: string): number {
  return layerOpacities.value[key] || 100
}

/**
 * 图层勾选事件
 */
function onCheck(checkedKeysValue: any) {
  console.log('三维图层勾选变化:', checkedKeysValue)
  
  const checked = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked
  
  // 处理图层可见性
  const processNode = (node: TreeNode) => {
    if (node.layer) {
      const isChecked = checked.includes(node.key)
      node.layer.visible = isChecked
      
      // 更新store
      mapStore.updateLayerTreeState({
        layerId: node.key,
        visible: isChecked
      })
      
      // 触发事件
      emitLayerVisibilityChange(node.key, isChecked)
    }
    
    if (node.children) {
      node.children.forEach(processNode)
    }
  }
  
  treeData.value.forEach(processNode)
}

/**
 * 透明度变化
 */
function onOpacityChange(key: string, value: number) {
  layerOpacities.value[key] = value
  
  mapStore.updateLayerTreeState({
    layerId: key,
    opacity: value / 100
  })
  
  emitLayerOpacityChange(key, value / 100)
}

/**
 * 定位到图层
 */
function locateLayer(key: string) {
  console.log('定位到图层:', key)
  emit('locate-layer', { layerKey: key })
}

/**
 * 刷新图层
 */
function refreshLayers() {
  console.log('刷新三维图层列表')
  loading.value = true
  
  // 模拟刷新
  setTimeout(() => {
    loading.value = false
  }, 500)
}

/**
 * 触发图层可见性变化事件
 */
function emitLayerVisibilityChange(layerKey: string, visible: boolean) {
  emit('layer-visibility-change', { layerKey, visible })
}

/**
 * 触发图层透明度变化事件
 */
function emitLayerOpacityChange(layerKey: string, opacity: number) {
  emit('layer-opacity-change', { layerKey, opacity })
}

/**
 * 组件挂载
 */
onMounted(() => {
  console.log('三维图层树组件已挂载')
  
  // 初始化状态
  treeData.value.forEach(group => {
    if (group.children) {
      group.children.forEach(node => {
        if (node.layer) {
          mapStore.updateLayerTreeState({
            layerId: node.key,
            visible: node.layer.visible,
            opacity: node.layer.opacity / 100
          })
        }
      })
    }
  })
})

// 事件定义
const emit = defineEmits<{
  'layer-visibility-change': [{ layerKey: string; visible: boolean }]
  'layer-opacity-change': [{ layerKey: string; opacity: number }]
  'locate-layer': [{ layerKey: string }]
}>()

// 导出方法
defineExpose({
  checkedKeys,
  expandedKeys,
  treeData,
  refreshLayers
})
</script>

<style scoped>
.layer-tree-3d {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
}

.layer-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.layer-tree-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.layer-tree-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  position: relative;
}

.tree-node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

.node-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 滚动条样式 */
.layer-tree-content::-webkit-scrollbar {
  width: 6px;
}

.layer-tree-content::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.layer-tree-content::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

:deep(.n-tree) {
  background: transparent;
}

:deep(.n-tree-node-content) {
  width: 100%;
}

:deep(.n-tree-node-title) {
  width: 100%;
}
</style>
