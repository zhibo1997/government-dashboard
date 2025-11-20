<template>
  <div class="optimized-layer-tree">
    <n-spin :show="loading" description="加载图层树...">
      <n-tree
        :data="treeData"
        :show-line="false"
        :default-expand-all="false"
        :expanded-keys="expandedKeys"
        :checked-keys="checkedKeys"
        :checkable="true"
        :selectable="false"
        :block-line="true"
        :cascade="false"
        key-field="key"
        label-field="title"
        children-field="children"
        @update:expanded-keys="handleExpandedKeysChange"
        @update:checked-keys="handleCheckedKeysChange"
      >
        <template #default="{ option }">
          <div class="layer-item">
            <div class="layer-info">
              <n-icon v-if="option.icon" :component="option.icon" class="layer-icon" />
              <span class="layer-name">{{ option.title }}</span>
              <n-tag
                v-if="option.layerType"
                :type="getLayerTypeTag(option.layerType)"
                size="small"
                class="layer-type-tag"
              >
                {{ getLayerTypeLabel(option.layerType) }}
              </n-tag>
            </div>
            <div
              v-if="option.isLayer && option.visible"
              class="layer-controls"
              @click.stop
            >
              <n-tooltip placement="top">
                <template #trigger>
                  <n-slider
                    :value="option.opacity * 100"
                    :min="0"
                    :max="100"
                    :step="10"
                    :format-tooltip="(value) => `${value}%`"
                    @update:value="(value) => handleOpacityChange(option.key, value / 100)"
                    style="width: 100px"
                  />
                </template>
                透明度
              </n-tooltip>
            </div>
          </div>
        </template>
      </n-tree>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { NTree, NSlider, NSpin, NIcon, NTag, NTooltip } from 'naive-ui'
import { LayersOutline, MapOutline, CubeOutline, FolderOutline } from '@vicons/ionicons5'
import { getLayerTree } from '@/services/commonService'
import { useMapStore } from '@/stores/mapStore'

// Props
interface Props {
  viewerInstance?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'layer-toggle': [layerId: string, visible: boolean, layerData: any]
  'layer-opacity-change': [layerId: string, opacity: number]
  'load-mvt': [url: string, layerId: string]
  'load-3dtiles': [url: string, layerId: string]
}>()

// State
const loading = ref(false)
const expandedKeys = ref<string[]>([])
const checkedKeys = ref<string[]>([])
const rawLayerData = ref<any[]>([])
const mapStore = useMapStore()

// 图层状态映射
const layerStates = ref<Map<string, {
  visible: boolean
  opacity: number
  loading: boolean
  error: string | null
}>>(new Map())

/**
 * 从API获取图层树数据
 */
async function fetchLayerTree() {
  loading.value = true
  try {
    const response = await getLayerTree()
    
    if (response && response.data) {
      rawLayerData.value = response.data
      console.log('✅ 图层树数据加载成功:', rawLayerData.value)
      
      // 初始化图层状态
      initializeLayerStates(rawLayerData.value)
      
      // 初始化展开的节点
      initExpandedKeys()
    } else {
      console.warn('⚠️ 图层树数据为空')
      rawLayerData.value = []
    }
  } catch (error) {
    console.error('❌ 获取图层树失败:', error)
    
    // 开发模式下使用mock数据
    if (import.meta.env.DEV) {
      console.log('🔧 开发模式: 尝试加载mock数据')
      try {
        const mockData = await import('@/assets/mockLayerTree.json')
        if (mockData.default && mockData.default.data) {
          rawLayerData.value = mockData.default.data
          console.log('✅ Mock数据加载成功')
          initializeLayerStates(rawLayerData.value)
          initExpandedKeys()
        }
      } catch (mockError) {
        console.error('❌ Mock数据加载失败:', mockError)
        rawLayerData.value = []
      }
    } else {
      rawLayerData.value = []
    }
  } finally {
    loading.value = false
  }
}

/**
 * 初始化图层状态
 */
function initializeLayerStates(nodes: any[]) {
  const processNode = (node: any) => {
    if (node.type !== 'group' && node.url) {
      layerStates.value.set(node.id, {
        visible: node.visible === 'true' || node.visible === true,
        opacity: node.opacity || 1.0,
        loading: false,
        error: null
      })
    }
    
    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode)
    }
  }
  
  nodes.forEach(processNode)
}

/**
 * 初始化展开的节点
 */
function initExpandedKeys() {
  const keys: string[] = []
  
  const processNode = (node: any) => {
    if (node.type === 'group' && (node.expanded === 'true' || node.expanded === true)) {
      keys.push(node.id)
    }
    
    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode)
    }
  }
  
  rawLayerData.value.forEach(processNode)
  expandedKeys.value = keys
}

/**
 * 转换为树形数据
 */
const treeData = computed(() => {
  const convertToTreeNode = (node: any): any => {
    const isGroup = node.type === 'group'
    const layerType = node.type
    const state = layerStates.value.get(node.id)
    
    const treeNode: any = {
      title: node.name || '未命名',
      key: node.id,
      icon: getNodeIcon(layerType),
      isLayer: !isGroup,
      layerType: isGroup ? null : layerType,
      visible: state?.visible || false,
      opacity: state?.opacity || 1.0,
      url: node.url,
      layerData: node
    }
    
    // 递归处理子节点
    if (node.child && Array.isArray(node.child) && node.child.length > 0) {
      treeNode.children = node.child.map(convertToTreeNode)
    }
    
    return treeNode
  }
  
  return rawLayerData.value.map(convertToTreeNode)
})

/**
 * 获取节点图标
 */
function getNodeIcon(type: string) {
  const iconMap: Record<string, any> = {
    'group': FolderOutline,
    'mvt': LayersOutline,
    'tile': MapOutline,
    'wms': MapOutline,
    '3dTile': CubeOutline
  }
  return iconMap[type] || LayersOutline
}

/**
 * 获取图层类型标签样式
 */
function getLayerTypeTag(type: string): 'info' | 'success' | 'warning' | 'error' {
  const tagMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
    'mvt': 'info',
    'tile': 'success',
    'wms': 'warning',
    '3dTile': 'error'
  }
  return tagMap[type] || 'info'
}

/**
 * 获取图层类型标签文字
 */
function getLayerTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    'mvt': 'MVT',
    'tile': 'Tile',
    'wms': 'WMS',
    '3dTile': '3D'
  }
  return labelMap[type] || type
}

/**
 * 处理展开/折叠
 */
function handleExpandedKeysChange(keys: string[]) {
  expandedKeys.value = keys
}

/**
 * 处理图层勾选
 */
function handleCheckedKeysChange(keys: string[]) {
  checkedKeys.value = keys
  
  // 遍历所有图层,处理显隐状态变化
  const allLayerIds = Array.from(layerStates.value.keys())
  
  allLayerIds.forEach(layerId => {
    const isChecked = keys.includes(layerId)
    const currentState = layerStates.value.get(layerId)
    
    if (currentState && currentState.visible !== isChecked) {
      // 更新状态
      layerStates.value.set(layerId, {
        ...currentState,
        visible: isChecked
      })
      
      // 触发图层加载/卸载
      handleLayerVisibilityChange(layerId, isChecked)
    }
  })
}

/**
 * 处理图层显隐变化
 */
function handleLayerVisibilityChange(layerId: string, visible: boolean) {
  const layerData = findLayerById(rawLayerData.value, layerId)
  
  if (!layerData) {
    console.warn('⚠️ 未找到图层数据:', layerId)
    return
  }
  
  console.log(`${visible ? '✅ 加载' : '❌ 卸载'}图层:`, layerData.name, layerData.type)
  
  // 根据图层类型触发不同的加载方法
  if (visible) {
    switch (layerData.type) {
      case 'mvt':
        emit('load-mvt', layerData.url, layerId)
        break
      case '3dTile':
        emit('load-3dtiles', layerData.url, layerId)
        break
      case 'tile':
      case 'wms':
        // 通用图层加载
        emit('layer-toggle', layerId, visible, layerData)
        break
      default:
        console.warn('⚠️ 未知图层类型:', layerData.type)
    }
  } else {
    // 卸载图层
    emit('layer-toggle', layerId, false, layerData)
  }
}

/**
 * 处理透明度变化
 */
function handleOpacityChange(layerId: string, opacity: number) {
  const currentState = layerStates.value.get(layerId)
  
  if (currentState) {
    layerStates.value.set(layerId, {
      ...currentState,
      opacity
    })
    
    emit('layer-opacity-change', layerId, opacity)
  }
}

/**
 * 根据ID查找图层数据
 */
function findLayerById(nodes: any[], id: string): any | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    
    if (node.child && Array.isArray(node.child)) {
      const found = findLayerById(node.child, id)
      if (found) return found
    }
  }
  
  return null
}

/**
 * 更新图层状态（供外部调用）
 */
function updateLayerState(layerId: string, state: Partial<{
  visible: boolean
  opacity: number
  loading: boolean
  error: string | null
}>) {
  const currentState = layerStates.value.get(layerId)
  
  if (currentState) {
    layerStates.value.set(layerId, {
      ...currentState,
      ...state
    })
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchLayerTree()
})

// 暴露方法
defineExpose({
  updateLayerState,
  fetchLayerTree,
  layerStates
})
</script>

<style lang="scss" scoped>
.optimized-layer-tree {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  background: rgba(0, 15, 35, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
  min-height: 48px;
}

.layer-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.layer-icon {
  font-size: 18px;
  color: #1677ff;
  flex-shrink: 0;
}

.layer-name {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-type-tag {
  flex-shrink: 0;
  font-size: 12px;
}

.layer-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

// 自定义 n-tree 样式
:deep(.n-tree-node) {
  .n-tree-node-content {
    color: #ffffff;
    padding: 4px 8px;
    
    &:hover {
      background: rgba(22, 119, 255, 0.1);
    }
  }
}

:deep(.n-tree-node-switcher) {
  width: 24px;
  height: 24px;
  
  .n-base-icon {
    color: #ffffff;
  }
}

:deep(.n-checkbox) {
  .n-checkbox-box {
    border: 2px solid rgba(22, 119, 255, 0.5);
    background-color: transparent;
  }
  
  &.n-checkbox--checked .n-checkbox-box {
    background-color: #1677ff;
    border-color: #1677ff;
  }
  
  .n-checkbox-box .n-checkbox-icon {
    color: #ffffff;
  }
}

:deep(.n-tree-node-indent) {
  width: 24px;
}

// 滑块样式
:deep(.n-slider) {
  .n-slider-rail {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .n-slider-rail__fill {
    background-color: #1677ff;
  }
  
  .n-slider-handle {
    border-color: #1677ff;
  }
}
</style>
