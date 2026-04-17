<template>
  <div class="optimized-layer-tree">
    <!-- 标题栏 -->
    <div class="tree-header">
      <n-checkbox
        :checked="isAllChecked"
        :indeterminate="isIndeterminate"
        @update:checked="handleSelectAllToggle"
        class="select-all-checkbox"
      />
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
          :cascade="true"
          key-field="key"
          label-field="title"
          children-field="children"
          @update:expanded-keys="handleExpandedKeysChange"
          @update:checked-keys="handleCheckedKeysChange"
        >
          <template v-slot="{ option }">
            <div class="layer-item">
              <div class="layer-info">
                <span class="layer-name">{{ option.title }}</span>
              </div>
            </div>
          </template>
        </n-tree>
      </n-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { NTree, NSpin, NIcon, NInput, NCheckbox } from "naive-ui";
import { SearchOutline } from "@vicons/ionicons5";
import { getLayerTree } from "@/services/commonService";

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
  "toggle-device-type": [sblx: string, visible: boolean]; // specialLayer 切换，传递设备类型、显隐状态
}>();

/**
 * 根据环境转换URL协议
 * 在生产环境中将HTTP转换为HTTPS
 * @param url 原始URL
 * @returns 转换后的URL
 */
function convertUrlProtocol(url: string): string {
  // 检查是否为生产环境
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  
  // 只有在生产环境中才进行协议转换
  if (isProduction && url && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
}

// State
const loading = ref(false);
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const rawLayerData = ref<any[]>([]);
const searchKeyword = ref("");
const route = useRoute();

/**
 * 获取专项模块代码（已不再限制，所有模块均显示全部图层）
 */
function getModuleCodeByRoute(): string {
  return '';
}

// 图层数据缓存（按模块代码缓存，避免重复请求）
const layerTreeCache = new Map<string, any[]>();

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
    const moduleCode = getModuleCodeByRoute();

    // 优先读取缓存
    if (layerTreeCache.has(moduleCode)) {
      rawLayerData.value = layerTreeCache.get(moduleCode)!;
      console.log("✅ 图层树数据命中缓存:", moduleCode);
    } else {
      const response = await getLayerTree({ SszxCode: moduleCode });
      if (response) {
        rawLayerData.value = response;
        layerTreeCache.set(moduleCode, response);
        console.log("✅ 图层树数据加载并缓存:", moduleCode);
      } else {
        console.warn("⚠️ 图层树数据为空");
        rawLayerData.value = [];
      }
    }

    // 初始化图层状态
    initializeLayerStates(rawLayerData.value);

    // 初始化展开的节点
    initExpandedKeys();
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
        visible: false,
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
 * 所有叶子节点key（实际图层，非分组）
 */
const allLeafKeys = computed<string[]>(() => {
  const keys: string[] = [];
  const collectLeaves = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.isLayer) {
        keys.push(node.key);
      }
      if (node.children && node.children.length > 0) {
        collectLeaves(node.children);
      }
    });
  };
  collectLeaves(treeData.value);
  return keys;
});

/**
 * 是否全选
 */
const isAllChecked = computed(() => {
  const leaves = allLeafKeys.value;
  if (leaves.length === 0) return false;
  return leaves.every((key) => checkedKeys.value.includes(key));
});

/**
 * 是否半选（indeterminate）
 */
const isIndeterminate = computed(() => {
  const leaves = allLeafKeys.value;
  if (leaves.length === 0) return false;
  const checkedCount = leaves.filter((key) =>
    checkedKeys.value.includes(key)
  ).length;
  return checkedCount > 0 && checkedCount < leaves.length;
});

/**
 * 收集所有子节点已全部勾选的分组节点key
 */
function collectFullyCheckedGroupKeys(
  nodes: any[],
  checkedSet: Set<string>
): string[] {
  const groupKeys: string[] = [];

  const processNode = (node: any): boolean => {
    if (node.isLayer) {
      return checkedSet.has(node.key);
    }

    if (node.children && node.children.length > 0) {
      const allChildrenChecked = node.children.every((child: any) =>
        processNode(child)
      );
      if (allChildrenChecked) {
        groupKeys.push(node.key);
        return true;
      }
      return false;
    }

    return false;
  };

  nodes.forEach(processNode);
  return groupKeys;
}

/**
 * 全选/取消全选处理
 */
function handleSelectAllToggle(checked: boolean) {
  const previousKeys = new Set(checkedKeys.value);

  if (checked) {
    const allKeys = [...allLeafKeys.value];
    const groupKeys = collectFullyCheckedGroupKeys(
      treeData.value,
      new Set(allKeys)
    );
    checkedKeys.value = [...new Set([...allKeys, ...groupKeys])];
  } else {
    checkedKeys.value = [];
  }

  const newSet = new Set(checkedKeys.value);

  // 处理新增勾选
  for (const key of newSet) {
    if (!previousKeys.has(key)) {
      const node = findNodeByKey(treeData.value, key);
      if (node?.isLayer) {
        updateLayerVisibleState(key, true);
        handleLayerVisibilityChange(key, true);
      }
    }
  }

  // 处理取消勾选
  for (const key of previousKeys) {
    if (!newSet.has(key)) {
      const node = findNodeByKey(treeData.value, key);
      if (node?.isLayer) {
        updateLayerVisibleState(key, false);
        handleLayerVisibilityChange(key, false);
      }
    }
  }
}

/**
 * 处理展开/折叠
 */
function handleExpandedKeysChange(keys: string[]) {
  expandedKeys.value = keys;
}

/**
 * 处理图层勾选（支持父子节点联动）
 */
function handleCheckedKeysChange(keys: string[]) {
  // 问题2解决：手动实现父子节点联动
  const previousKeys = new Set(checkedKeys.value);
  const newKeys = new Set(keys);
  
  // 找出新增的key和移除的key
  const addedKeys = keys.filter(key => !previousKeys.has(key));
  const removedKeys = checkedKeys.value.filter(key => !newKeys.has(key));
  
  let finalKeys = [...keys];
  
  // 处理新增的节点（勾选操作）
  for (const addedKey of addedKeys) {
    const node = findNodeByKey(treeData.value, addedKey);
    if (node && node.children && node.children.length > 0) {
      // 如果是父节点，联动勾选所有子节点
      const childKeys = getAllChildKeys(node);
      finalKeys = [...new Set([...finalKeys, ...childKeys])];
      console.log(`✅ 勾选父节点 "${node.title}"，联动勾选 ${childKeys.length} 个子节点`);
    }
  }
  
  // 处理移除的节点（取消勾选操作）
  for (const removedKey of removedKeys) {
    const node = findNodeByKey(treeData.value, removedKey);
    if (node && node.children && node.children.length > 0) {
      // 如果是父节点，联动取消勾选所有子节点
      const childKeys = getAllChildKeys(node);
      finalKeys = finalKeys.filter(key => !childKeys.includes(key));
      console.log(`✅ 取消勾选父节点 "${node.title}"，联动取消 ${childKeys.length} 个子节点`);
    }
  }
  
  checkedKeys.value = finalKeys;

  const newSet = new Set(finalKeys);

  // 处理新增勾选的叶子节点
  for (const key of finalKeys) {
    if (!previousKeys.has(key)) {
      const node = findNodeByKey(treeData.value, key);
      if (node?.isLayer) {
        updateLayerVisibleState(key, true);
        handleLayerVisibilityChange(key, true);
      }
    }
  }

  // 处理取消勾选的叶子节点
  for (const key of previousKeys) {
    if (!newSet.has(key)) {
      const node = findNodeByKey(treeData.value, key);
      if (node?.isLayer) {
        updateLayerVisibleState(key, false);
        handleLayerVisibilityChange(key, false);
      }
    }
  }
}

/**
 * 在树形数据中根据key查找节点
 */
function findNodeByKey(nodes: any[], key: string): any | null {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    
    if (node.children && node.children.length > 0) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * 递归获取节点的所有子节点key
 */
function getAllChildKeys(node: any): string[] {
  const keys: string[] = [];
  
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      // 只收集非分组节点（实际图层）的key
      if (child.isLayer) {
        keys.push(child.key);
      }
      // 递归处理子节点
      if (child.children && child.children.length > 0) {
        keys.push(...getAllChildKeys(child));
      }
    });
  }
  
  return keys;
}

/**
 * 智能判断图层类型（容错机制）
 * 当后端返回的type不正确时，根据URL自动判断
 */
function detectLayerType(layerData: any): string {
  const type = layerData.type || '';
  
  // specialLayer 类型直接返回，不需要URL判断
  if (type === 'specialLayer') {
    return 'specialLayer';
  }
  
  // 转换URL协议
  const url = convertUrlProtocol(layerData.url || '');
  
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
      case "specialLayer":
        // specialLayer: 触发设备类型切换，url 即为 sblx 参数
        emit("toggle-device-type", layerData.url, true);
        break;
      case "mvt":
        emit("load-mvt", convertUrlProtocol(layerData.url), layerId);
        break;
      case "3dTile":
        emit("load-3dtiles", convertUrlProtocol(layerData.url), layerId);
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
    if (actualType === "specialLayer") {
      // specialLayer 卸载
      emit("toggle-device-type", layerData.url, false);
    } else {
      emit("layer-toggle", layerId, false, layerData);
    }
  }
  
  // 强制地图立即更新渲染
  if (props.viewerInstance && props.viewerInstance.scene) {
    props.viewerInstance.scene.requestRender();
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
 * 更新图层可见状态（内部辅助）
 */
function updateLayerVisibleState(layerId: string, visible: boolean) {
  const state = layerStates.value.get(layerId);
  if (state) {
    layerStates.value.set(layerId, { ...state, visible });
  }
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

/**
 * 将传入的 ID 列表展开为所有叶子图层 ID（支持父分组 ID）
 * 如果传入的是分组节点，递归收集其下所有叶子图层
 */
function expandToLeafIds(ids: string[]): string[] {
  const leafIds: string[] = [];

  for (const id of ids) {
    const node = findNodeByKey(treeData.value, id);
    if (!node) continue;

    if (node.isLayer) {
      leafIds.push(id);
    } else if (node.children && node.children.length > 0) {
      // 分组节点，递归收集所有子叶子节点
      const collectLeaves = (n: any) => {
        if (n.isLayer) {
          leafIds.push(n.key);
        } else if (n.children && n.children.length > 0) {
          n.children.forEach(collectLeaves);
        }
      };
      node.children.forEach(collectLeaves);
    }
  }

  return leafIds;
}

/**
 * 按 ID 批量勾选并加载指定图层（供外部调用）
 * 支持传入父分组 ID，自动展开为所有子图层
 * @param ids 需要加载的图层 ID 或分组 ID 数组
 */
function loadDefaultLayers(ids: string[]) {
  if (!ids || ids.length === 0) return;

  const previousKeys = new Set(checkedKeys.value);

  // 将分组 ID 展开为叶子图层 ID
  const validIds = expandToLeafIds(ids);

  if (validIds.length === 0) return;

  // 合并到现有 checkedKeys，并更新父分组节点
  const newLeafKeys = [...new Set([...checkedKeys.value, ...validIds])];
  const groupKeys = collectFullyCheckedGroupKeys(
    treeData.value,
    new Set(newLeafKeys)
  );
  checkedKeys.value = [...new Set([...newLeafKeys, ...groupKeys])];

  // 仅对新增的图层触发加载
  for (const id of validIds) {
    if (!previousKeys.has(id)) {
      updateLayerVisibleState(id, true);
      handleLayerVisibilityChange(id, true);
    }
  }
}

/**
 * 重置图层树状态并重新加载（供外部调用）
 * 卸载所有可见图层、清空状态、重新请求数据
 * @param defaultLayerIds 重新加载后需要自动勾选的图层 ID（可选）
 */
async function resetAndReload(defaultLayerIds?: string[]) {
  // 1. 卸载当前所有可见图层
  const currentVisibleLayers = Array.from(layerStates.value.entries())
    .filter(([, state]) => state.visible)
    .map(([id]) => id);

  for (const layerId of currentVisibleLayers) {
    updateLayerVisibleState(layerId, false);
    handleLayerVisibilityChange(layerId, false);
  }

  // 2. 清空 UI 状态
  checkedKeys.value = [];
  layerStates.value.clear();
  rawLayerData.value = [];
  expandedKeys.value = [];

  // 3. 重新获取图层数据
  await fetchLayerTree();

  // 4. 加载默认图层
  if (defaultLayerIds && defaultLayerIds.length > 0) {
    await nextTick();
    loadDefaultLayers(defaultLayerIds);
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  const defaultIds = (route.meta?.defaultLayerIds as string[]) || undefined;
  await fetchLayerTree();
  if (defaultIds && defaultIds.length > 0) {
    await nextTick();
    loadDefaultLayers(defaultIds);
  }
});

// 监听路由变化，切换模块时重置并重新加载图层数据
watch(
  () => route.name,
  () => {
    const defaultIds = (route.meta?.defaultLayerIds as string[]) || undefined;
    console.log(`📍 路由已变更，重置并重新加载图层数据，默认图层:`, defaultIds);
    resetAndReload(defaultIds);
  }
);

// 暴露方法
defineExpose({
  updateLayerState,
  fetchLayerTree,
  layerStates,
  loadDefaultLayers,
  resetAndReload,
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
  padding: 12px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;

  .select-all-checkbox {
    :deep(.n-checkbox-box) {
      border: 2px solid rgba(255, 255, 255, 0.3);
      background-color: transparent;
      border-radius: 2px;
      width: 32px;
      height: 32px;
    }

    &.n-checkbox--checked .n-checkbox-box {
      background-color: #1890ff;
      border-color: #1890ff;
    }

    :deep(.n-checkbox-box .n-checkbox-box__border) {
      border: none;
    }
  }

  .header-title {
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
  }
}

// 搜索框
.search-box {
  flex-shrink: 0;
  padding: 20px 24px 16px;

  :deep(.n-input) {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    transition: all 0.3s ease;
    .n-input__placeholder {
      font-size: 32px !important;
    }
    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }

    &.n-input--focus {
      background: rgba(255, 255, 255, 0.08) !important;
      // border-color: rgba(22, 119, 255, 0.5);
    }

    .n-input__input-el {
      color: #ffffff !important;
      font-size: 32px !important;
      height: 56px;
    }

    .n-input__border,
    .n-input__state-border {
      border: none;
    }
    .n-input-wrapper{
      height: 56px;
      --n-icon-size: 32px;
    }
  }
}

// 图层数统计
.layer-count {
  flex-shrink: 0;
  padding: 16px 24px;
  font-size: 32px;
  color: rgba(255, 255, 255, 0.65);

  .count-number {
    color: #1890ff;
    font-weight: 700;
    margin-left: 4px;
    font-size: 36px;
  }
}

// 树形内容区域
.tree-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px 20px;
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
  padding: 4px 0;
  min-height: 40px;
}

.layer-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.layer-name {
  font-size: 28px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 自定义 n-tree 样式
:deep(.n-tree) {
  background: transparent;
  color: #ffffff;
  font-size: 28px;

  .n-tree-node {
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .n-tree-node-content {
    color: #ffffff;
    transition: all 0.2s ease;
    font-size: 32px;
    min-height: 48px;
    display: flex;
    align-items: center;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .n-tree-node-content__text {
    width: 100%;
  }

  // 展开/收起图标
  .n-tree-node-switcher {
    width: 42px !important;
    height: 42px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    .n-tree-node-switcher__icon{
      height: 42px;
    width: 42px;
    }
    .n-base-icon {
      color: rgba(255, 255, 255, 0.65);
      font-size: 42px;
    }
  }
  .n-tree-node-checkbox{
      width: 32px !important;
      height: 32px !important;
  }
  // 复选框样式
  .n-checkbox {
    --n-size: 32px !important;
    
    .n-checkbox-box {
      border: 2px solid rgba(255, 255, 255, 0.3);
      background-color: transparent;
      border-radius: 2px;
      width: 32px;
      height: 32px;
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
      font-size: 2px;
    }
  }

  .n-tree-node-indent {
    width: 28px;
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