<template>
  <div class="layer-tree-2d">
    <div class="layer-tree-header">
      <h3>二维图层</h3>
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
            <n-slider
              v-if="option.layer"
              :min="0"
              :max="100"
              :value="getLayerOpacity(option.key)"
              :style="{ width: '80px', marginLeft: '10px' }"
              @update:value="(value) => onOpacityChange(option.key, value)"
              @click.stop
            />
          </div>
        </template>
      </n-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NTree, NButton, NSlider } from 'naive-ui'
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
  }
}

const mapStore = useMapStore()

// 图层树数据
const treeData = ref<TreeNode[]>([
  {
    title: '基础图层',
    key: 'base-layers',
    children: [
      {
        title: '天地图矢量',
        key: 'tianditu-vec',
        layer: {
          type: 'tianditu',
          visible: true,
          opacity: 100
        }
      }
    ]
  },
  {
    title: '业务图层',
    key: 'business-layers',
    children: [
      {
        title: 'MVT矢量图层',
        key: 'mvt-layer',
        layer: {
          type: 'mvt',
          url: '/clmap/style.json',
          visible: true,
          opacity: 100
        }
      },
      {
        title: '桥梁基础信息',
        key: 'bridge-layer',
        layer: {
          type: 'wfs-point',
          url: 'gspsp_dtrans_bridgebscinfo',
          visible: true,
          opacity: 100
        }
      }
    ]
  },
  {
    title: '边界图层',
    key: 'boundary-layers',
    children: [
      {
        title: '阳新县边界',
        key: 'yangxin-boundary',
        layer: {
          type: 'geojson',
          visible: true,
          opacity: 100
        }
      }
    ]
  }
])

// 选中的图层keys
const checkedKeys = ref<string[]>(['tianditu-vec', 'mvt-layer', 'bridge-layer', 'yangxin-boundary'])

// 展开的节点keys
const expandedKeys = ref<string[]>(['base-layers', 'business-layers', 'boundary-layers'])

// 图层透明度状态
const layerOpacities = ref<Record<string, number>>({
  'tianditu-vec': 100,
  'mvt-layer': 100,
  'bridge-layer': 100,
  'yangxin-boundary': 100
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
  console.log('图层勾选变化:', checkedKeysValue)
  
  // 处理图层可见性变化
  const checked = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked
  
  // 遍历所有图层节点
  const processNode = (node: TreeNode) => {
    if (node.layer) {
      const isChecked = checked.includes(node.key)
      node.layer.visible = isChecked
      
      // 更新到store
      mapStore.updateLayerTreeState({
        layerId: node.key,
        visible: isChecked
      })
      
      // 触发图层可见性变化事件
      emitLayerVisibilityChange(node.key, isChecked)
    }
    
    if (node.children) {
      node.children.forEach(processNode)
    }
  }
  
  treeData.value.forEach(processNode)
}

/**
 * 透明度变化事件
 */
function onOpacityChange(key: string, value: number) {
  layerOpacities.value[key] = value
  
  // 更新到store
  mapStore.updateLayerTreeState({
    layerId: key,
    opacity: value / 100
  })
  
  // 触发透明度变化事件
  emitLayerOpacityChange(key, value / 100)
}

/**
 * 刷新图层列表
 */
function refreshLayers() {
  console.log('刷新图层列表')
  // 这里可以从服务端重新获取图层配置
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
  console.log('二维图层树组件已挂载')
  
  // 初始化图层树状态到store
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
.layer-tree-2d {
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
}

.tree-node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

/* 自定义滚动条 */
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
