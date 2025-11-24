<template>
  <div class="optimized-layer-tree">
    <!-- 标题栏 -->
    <div class="tree-header">
      <span class="header-title">图层</span>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <n-input
        v-model:value="searchKeyword"
        placeholder="请输入关键字"
        clearable
        :input-props="{ style: 'background: transparent; color: #ffffff;' }"
      >
        <template #prefix>
          <n-icon
            :component="SearchOutline"
            style="color: rgba(255, 255, 255, 0.45)"
          />
        </template>
      </n-input>
    </div>

    <!-- 图层数统计 -->
    <div class="layer-count">
      <span>图层数：</span>
      <span class="count-number">{{ totalLayerCount }}</span>
    </div>

    <!-- 图层树 -->
    <div class="tree-content">
      <n-spin :show="loading" description="加载图层树...">
        <n-tree
          :data="filteredTreeData"
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
                <span class="layer-name">{{ option.title }}</span>
              </div>
              <div class="layer-actions" v-if="option.isLayer" @click.stop>
                <n-icon
                  :component="StarOutline"
                  class="action-icon favorite-icon"
                  title="收藏"
                />
              </div>
            </div>
          </template>
        </n-tree>
      </n-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { NTree, NSpin, NIcon, NInput } from "naive-ui";
import { SearchOutline, StarOutline } from "@vicons/ionicons5";
import { getLayerTree } from "@/services/commonService";
import { useMapStore } from "@/stores/mapStore";

// Props
interface Props {
  viewerInstance?: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "layer-toggle": [layerId: string, visible: boolean, layerData: any];
  "layer-opacity-change": [layerId: string, opacity: number];
  "load-mvt": [url: string, layerId: string];
  "load-3dtiles": [url: string, layerId: string];
}>();

// State
const loading = ref(false);
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const rawLayerData = ref<any[]>([]);
const searchKeyword = ref("");
const mapStore = useMapStore();

// 图层状态映射
const layerStates = ref<
  Map<
    string,
    {
      visible: boolean;
      opacity: number;
      loading: boolean;
      error: string | null;
    }
  >
>(new Map());

/**
 * 从API获取图层树数据
 */
async function fetchLayerTree() {
  loading.value = true;
  try {
    const response = await getLayerTree();

    console.log("🚀 ~ fetchLayerTree ~ response:", response)
    if (response) {
      rawLayerData.value = response;
      console.log("✅ 图层树数据加载成功:", rawLayerData.value);

      // 初始化图层状态
      initializeLayerStates(rawLayerData.value);

      // 初始化展开的节点
      initExpandedKeys();
    } else {
      console.warn("⚠️ 图层树数据为空");
      rawLayerData.value = [];
    }
  } catch (error) {
    console.error("❌ 获取图层树失败:", error);
  } finally {
    loading.value = false;
  }
}

/**
 * 初始化图层状态
 */
function initializeLayerStates(nodes: any[]) {
  const processNode = (node: any) => {
    if (node.type !== "group" && node.url) {
      layerStates.value.set(node.id, {
        visible: node.visible === "true" || node.visible === true,
        opacity: node.opacity || 1.0,
        loading: false,
        error: null,
      });
    }

    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode);
    }
  };

  nodes.forEach(processNode);
}

/**
 * 初始化展开的节点
 */
function initExpandedKeys() {
  const keys: string[] = [];

  const processNode = (node: any) => {
    if (
      node.type === "group" &&
      (node.expanded === "true" || node.expanded === true)
    ) {
      keys.push(node.id);
    }

    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode);
    }
  };

  rawLayerData.value.forEach(processNode);
  expandedKeys.value = keys;
}

/**
 * 转换为树形数据
 */
const treeData = computed(() => {
  const convertToTreeNode = (node: any): any => {
    const isGroup = node.type === "group";
    const layerType = node.type;
    const state = layerStates.value.get(node.id);

    const treeNode: any = {
      title: node.name || "未命名",
      key: node.id,
      isLayer: !isGroup,
      layerType: isGroup ? null : layerType,
      visible: state?.visible || false,
      opacity: state?.opacity || 1.0,
      url: node.url,
      layerData: node,
    };

    // 递归处理子节点
    if (node.child && Array.isArray(node.child) && node.child.length > 0) {
      treeNode.children = node.child.map(convertToTreeNode);
    }

    return treeNode;
  };

  return rawLayerData.value.map(convertToTreeNode);
});

/**
 * 过滤后的树形数据（根据搜索关键词）
 */
const filteredTreeData = computed(() => {
  if (!searchKeyword.value.trim()) {
    return treeData.value;
  }

  const keyword = searchKeyword.value.toLowerCase().trim();
  const expandedNodeKeys: string[] = [];

  const filterNode = (node: any): any | null => {
    // 检查当前节点是否匹配
    const titleMatch = node.title.toLowerCase().includes(keyword);

    // 处理子节点
    let filteredChildren: any[] = [];
    if (node.children && node.children.length > 0) {
      filteredChildren = node.children
        .map((child: any) => filterNode(child))
        .filter((child: any) => child !== null);
    }

    // 如果当前节点匹配或有子节点匹配，则保留该节点
    if (titleMatch || filteredChildren.length > 0) {
      // 如果有子节点匹配，自动展开此节点
      if (filteredChildren.length > 0 && !node.isLayer) {
        expandedNodeKeys.push(node.key);
      }

      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  };

  const filtered = treeData.value
    .map((node) => filterNode(node))
    .filter((node) => node !== null);

  // 自动展开匹配节点的父节点
  if (expandedNodeKeys.length > 0) {
    expandedKeys.value = [
      ...new Set([...expandedKeys.value, ...expandedNodeKeys]),
    ];
  }

  return filtered;
});

/**
 * 计算总图层数
 */
const totalLayerCount = computed(() => {
  let count = 0;

  const countLayers = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.isLayer) {
        count++;
      }
      if (node.children && node.children.length > 0) {
        countLayers(node.children);
      }
    });
  };

  countLayers(treeData.value);
  return count;
});

/**
 * 处理展开/折叠
 */
function handleExpandedKeysChange(keys: string[]) {
  expandedKeys.value = keys;
}

/**
 * 处理图层勾选
 */
function handleCheckedKeysChange(keys: string[]) {
  checkedKeys.value = keys;

  // 遍历所有图层,处理显隐状态变化
  const allLayerIds = Array.from(layerStates.value.keys());

  allLayerIds.forEach((layerId) => {
    const isChecked = keys.includes(layerId);
    const currentState = layerStates.value.get(layerId);

    if (currentState && currentState.visible !== isChecked) {
      // 更新状态
      layerStates.value.set(layerId, {
        ...currentState,
        visible: isChecked,
      });

      // 触发图层加载/卸载
      handleLayerVisibilityChange(layerId, isChecked);
    }
  });
}

/**
 * 智能判断图层类型（容错机制）
 * 当后端返回的type不正确时，根据URL自动判断
 */
function detectLayerType(layerData: any): string {
  const url = layerData.url || '';
  const type = layerData.type || '';
  
  // 如果URL包含tileset.json，一定是3D Tiles
  if (url.includes('tileset.json')) {
    if (type !== '3dTile') {
      console.warn(`⚠️ 图层类型不匹配: ${layerData.name}, 配置类型=${type}, 实际应为=3dTile`);
    }
    return '3dTile';
  }
  
  // 如果URL包含style.json或.pbf，可能是MVT
  if (url.includes('style.json') || url.includes('.pbf')) {
    if (type !== 'mvt' && type !== 'tile') {
      console.warn(`⚠️ 图层类型不匹配: ${layerData.name}, 配置类型=${type}, 实际应为=mvt`);
    }
    return url.includes('style.json') ? 'mvt' : 'tile';
  }
  
  // 使用配置的类型
  return type;
}

/**
 * 处理图层显隐变化
 */
function handleLayerVisibilityChange(layerId: string, visible: boolean) {
  const layerData = findLayerById(rawLayerData.value, layerId);

  if (!layerData) {
    console.warn("⚠️ 未找到图层数据:", layerId);
    return;
  }

  // 智能判断图层类型
  const actualType = detectLayerType(layerData);
  
  console.log(
    `${visible ? "✅ 加载" : "❌ 卸载"}图层:`,
    layerData.name,
    `配置类型=${layerData.type}, 实际类型=${actualType}`
  );

  // 根据图层类型触发不同的加载方法
  if (visible) {
    switch (actualType) {
      case "mvt":
        emit("load-mvt", layerData.url, layerId);
        break;
      case "3dTile":
        emit("load-3dtiles", layerData.url, layerId);
        break;
      case "tile":
      case "wms":
        // 通用图层加载
        emit("layer-toggle", layerId, visible, layerData);
        break;
      default:
        console.warn("⚠️ 未知图层类型:", actualType);
    }
  } else {
    // 卸载图层
    emit("layer-toggle", layerId, false, layerData);
  }
}

/**
 * 根据ID查找图层数据
 */
function findLayerById(nodes: any[], id: string): any | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.child && Array.isArray(node.child)) {
      const found = findLayerById(node.child, id);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 更新图层状态（供外部调用）
 */
function updateLayerState(
  layerId: string,
  state: Partial<{
    visible: boolean;
    opacity: number;
    loading: boolean;
    error: string | null;
  }>
) {
  const currentState = layerStates.value.get(layerId);

  if (currentState) {
    layerStates.value.set(layerId, {
      ...currentState,
      ...state,
    });
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchLayerTree();
});

// 暴露方法
defineExpose({
  updateLayerState,
  fetchLayerTree,
  layerStates,
});
</script>

<style lang="scss" scoped>
.optimized-layer-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
}

// 标题栏
.tree-header {
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;

  .header-title {
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
  }
}

// 搜索框
.search-box {
  flex-shrink: 0;
  padding: 16px 20px 12px;

  :deep(.n-input) {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }

    &.n-input--focus {
      background: rgba(255, 255, 255, 0.08) !important;
      border-color: rgba(22, 119, 255, 0.5);
    }

    .n-input__input-el {
      color: #ffffff !important;

      &::placeholder {
        color: rgba(255, 255, 255, 0.45);
      }
    }

    .n-input__border,
    .n-input__state-border {
      border: none;
    }
  }
}

// 图层数统计
.layer-count {
  flex-shrink: 0;
  padding: 12px 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);

  .count-number {
    color: #1890ff;
    font-weight: 500;
    margin-left: 4px;
  }
}

// 树形内容区域
.tree-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 12px 16px;
  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
  :deep() {
    .n-tree-node-wrapper {
      --n-node-color-hover: transparent !important;
      padding: 0;
    }
  }
}

// 图层项
.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 2px 0;
  min-height: 32px;
}

.layer-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.layer-name {
  font-size: 14px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 8px;

  .action-icon {
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 4px;
    border-radius: 4px;

    &.favorite-icon {
      color: rgba(255, 255, 255, 0.45);

      &:hover {
        color: #fadb14;
        background: rgba(250, 219, 20, 0.1);
      }

      &.favorited {
        color: #fadb14;
      }
    }
  }
}

// 自定义 n-tree 样式
:deep(.n-tree) {
  background: transparent;
  color: #ffffff;
  font-size: 14px;

  .n-tree-node {
    margin: 4px 0;
  }

  .n-tree-node-content {
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .n-tree-node-content__text {
    width: 100%;
  }

  // 展开/收起图标
  .n-tree-node-switcher {
    width: 20px;
    height: 20px;

    .n-base-icon {
      color: rgba(255, 255, 255, 0.65);
      font-size: 16px;
    }
  }

  // 复选框样式
  .n-checkbox {
    .n-checkbox-box {
      border: 2px solid rgba(255, 255, 255, 0.3);
      background-color: transparent;
      border-radius: 2px;
    }

    &.n-checkbox--checked .n-checkbox-box {
      background-color: #1890ff;
      border-color: #1890ff;
    }

    .n-checkbox-box .n-checkbox-box__border {
      border: none;
    }

    .n-checkbox-box .n-checkbox-icon {
      color: #ffffff;
    }
  }

  .n-tree-node-indent {
    width: 20px;
  }

  // 空状态
  .n-empty {
    .n-empty__description {
      color: rgba(255, 255, 255, 0.45);
    }
  }
}

// 加载状态
:deep(.n-spin-container) {
  min-height: 200px;

  .n-spin-description {
    color: rgba(255, 255, 255, 0.65);
  }
}
</style>
