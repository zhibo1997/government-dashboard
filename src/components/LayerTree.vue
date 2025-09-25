<template>
  <div class="layer-tree">
    <n-tree
      :data="treeData"
      :show-line="false"
      :default-expand-all="true"
      :expanded-keys="expandedKeys"
      :checked-keys="checkedKeys"
      :checkable="true"
      :selectable="false"
      :block-line="true"
      :cascade="true"layer-tree
      key-field="key"
      label-field="title"
      children-field="children"
      @update:expanded-keys="handleExpandedKeysChange"
      @update:checked-keys="handleCheckedKeysChange"
    >
      <template #default="{ option }">
        <div class="layer-item">
          <div class="layer-info">
            <span class="layer-name">{{ option.title }}</span>
          </div>
          <div
            class="layer-controls"
            @click.stop
            v-if="option.layer?.type === 'layer' && option.layer.visible"
          >
            <n-slider
              :value="option.layer.opacity * 100"
              :min="0"
              :max="100"
              :step="10"
              :tooltip="true"
              :format-tooltip="(value) => `${value}%`"
              @update:value="
                (value) => handleOpacityChange(option.key, value / 100)
              "
              style="width: 80px"
            />
          </div>
        </div>
      </template>
    </n-tree>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { LayersOutline, MapOutline, BusinessOutline } from "@vicons/ionicons5";
import { useMapStore } from "@/stores/mapStore";
import { mapConfig } from "@/config/mapConfig";
import { getLayerTree } from "@/api";
import { 
  validateLayerTreeData,
  extractLayerNodes,
  getDefaultExpandedKeys,
  getDefaultVisibleLayerKeys,
  createLayerStateMap
} from "@/mapUtils/layerTreeUtils";

// 使用现有的mapStore
const mapStore = useMapStore();

// Emits
const emit = defineEmits(["layer-toggle", "layer-opacity-change"]);

// 本地状态管理
const expandedKeys = ref([]);
const checkedKeys = ref([]);

// 初始化展开键
const initExpandedKeys = () => {
  const keys = getDefaultExpandedKeys(mapStore.layerTreeNodes);
  expandedKeys.value = keys;
};

// 图层状态 - 使用store管理
const layerStates = computed(() => {
  const states = {};
  const layerNodes = extractLayerNodes(mapStore.layerTreeNodes);
  
  layerNodes.forEach(node => {
    const layerId = node.id;
    const storeState = mapStore.layerTreeState.layerStates.get(layerId);
    
    states[layerId] = {
      visible: storeState?.visible ?? (node.visible === 'true'),
      opacity: storeState?.opacity ?? (node.opacity || 1.0),
      loading: storeState?.loading ?? false,
      error: storeState?.error ?? null,
      url: node.url,
      name: node.name,
    };
  });
  
  return states;
});

// 初始化勾选状态
const initCheckedKeys = () => {
  const keys = getDefaultVisibleLayerKeys(mapStore.layerTreeNodes);
  checkedKeys.value = keys;
};

// 获取所有图层节点的ID
const getAllLayerIds = (nodes) => {
  return extractLayerNodes(nodes).map(node => node.id);
};

// 组件挂载时初始化
onMounted(() => {
  // 监听图层树数据变化，当数据加载完成后初始化状态
  const unwatch = mapStore.$subscribe((mutation, state) => {
    if (mutation.storeId === 'map' && state.layerTreeState.tree.length > 0) {
      initExpandedKeys();
      initCheckedKeys();
      unwatch(); // 取消监听
    }
  });
  
  // 如果数据已经存在，直接初始化
  if (mapStore.layerTreeNodes.length > 0) {
    initExpandedKeys();
    initCheckedKeys();
    unwatch();
  }
});

// 计算属性：转换为树形数据
const treeData = computed(() => {
  const convertToTreeData = (nodes) => {
    return nodes.map(node => {
      const treeNode = {
        title: node.name || '未命名',
        key: node.id,
        icon: node.type === 'group' ? BusinessOutline : (node.type === 'tile' ? MapOutline : LayersOutline),
        checked: false,
      };

      // 如果是图层节点（tile类型），添加图层信息
      if (node.type === 'tile' && node.url) {
        const layerState = layerStates.value[node.id];
        treeNode.checked = layerState?.visible || false;
        treeNode.layer = {
          type: "layer",
          url: node.url,
          visible: layerState?.visible || false,
          opacity: layerState?.opacity || 1.0,
          description: node.name || '图层信息',
        };
      }

      // 如果有子节点，递归处理
      if (node.child && Array.isArray(node.child) && node.child.length > 0) {
        treeNode.children = convertToTreeData(node.child);
      }

      return treeNode;
    });
  };

  // 从 store 获取图层树数据
  const layerTreeData = mapStore.layerTreeNodes;
  
  if (!layerTreeData || layerTreeData.length === 0) {
    // 如果没有数据，返回空数组或默认数据
    return [];
  }

  return convertToTreeData(layerTreeData);
});

// 展开/收起节点
function handleExpandedKeysChange(keys) {
  expandedKeys.value = keys;
}

// 勾选节点
function handleCheckedKeysChange(keys) {
  checkedKeys.value = keys;

  // 获取所有图层ID
  const allLayerIds = getAllLayerIds(mapStore.layerTreeNodes);
  
  // 处理图层显隐 - 更新到store
  allLayerIds.forEach((layerId) => {
    const isChecked = keys.includes(layerId);
    const currentState = layerStates.value[layerId];

    if (currentState) {
      // 更新store中的图层状态
      mapStore.updateLayerTreeState({
        layerId: layerId,
        visible: isChecked,
      });

      if (currentState.visible !== isChecked) {
        emit("layer-toggle", layerId, isChecked, currentState.url);
      }
    }
  });
}

// 处理图层显隐切换
function handleLayerToggle(layerKey, visible, url = null) {
  console.log("🚀 ~ handleLayerToggle ~ layerKey:", layerKey)
  // 更新store状态
  mapStore.updateLayerTreeState({
    layerId: layerKey,
    visible: visible,
  });
  const layerUrl = url || layerStates.value[layerKey]?.url;
  emit("layer-toggle", layerKey, visible, layerUrl);
}

// 处理透明度变化
function handleOpacityChange(layerKey, opacity) {
  // 更新store状态
  mapStore.updateLayerTreeState({
    layerId: layerKey,
    opacity: opacity,
  });

  emit("layer-opacity-change", layerKey, opacity);
}

// 暴露方法给父组件调用
defineExpose({
  updateLayerState(layerKey, state) {
    mapStore.updateLayerTreeState({
      layerId: layerKey,
      ...state,
    });
  },
});
</script>

<style scoped>
.layer-tree {
  --font-size-large: 32px;
  height: 400px;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  padding-left: 20px;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  min-height: 60px;
}

.layer-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.layer-name {
  font-weight: 500;
  font-size: var(--font-size-large);
  color: #ffffff;
}

.layer-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 自定义 n-tree 样式 */
:deep(.n-tree-node) {
  align-items: center;
  .n-tree-node-content {
    color: #ffffff;
    font-size: var(--font-size-large);
    padding: 8px 12px;
    margin-left: 12px;
  }
}
:deep(.n-tree-node-switcher__icon){
  width: 36px !important;
  height: 36px !important;
 font-size: 36px !important;
}

:deep(.n-tree-node:hover) {
  background-color: transparent !important;
  cursor: pointer;
}

:deep(.n-tree-node-switcher) {
  width: 32px;
  height: 32px;
}

:deep(.n-tree-node-switcher .n-base-icon) {
  color: #ffffff;
}

:deep(.n-checkbox) {
  --n-size: 24px;
}

:deep(.n-checkbox .n-checkbox-box) {
  width: var(--font-size-large);
  height: var(--font-size-large);
  border: 2px solid #ffffff;
  background-color: transparent;
}

:deep(.n-checkbox--checked .n-checkbox-box) {
  background-color: #1677ff;
  border-color: #1677ff;
}

:deep(.n-checkbox .n-checkbox-box .n-checkbox-icon) {
  color: #ffffff;
  font-size: 16px;
}

:deep(.n-tree-node-indent) {
  width: 32px;
}
</style>
