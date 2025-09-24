/**
 * 图层树工具函数
 * 处理图层树数据的转换、验证和操作
 */

export interface LayerTreeNode {
  id: string;
  name: string | null;
  parentId: string;
  type: "group" | "tile";
  expanded: string;
  url: string | null;
  visible: string;
  opacity: number | null;
  sortOrder: number;
  child: LayerTreeNode[] | null;
}

export interface TreeDataNode {
  title: string;
  key: string;
  icon?: any;
  checked: boolean;
  children?: TreeDataNode[];
  layer?: {
    type: string;
    url: string;
    visible: boolean;
    opacity: number;
    description: string;
  };
}

/**
 * 验证图层树数据格式
 * @param data 图层树数据
 * @returns 是否为有效格式
 */
export function validateLayerTreeData(data: any): data is LayerTreeNode[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every((node) => {
    return (
      typeof node === "object" &&
      node !== null &&
      typeof node.id === "string" &&
      (node.name === null || typeof node.name === "string") &&
      typeof node.parentId === "string" &&
      (node.type === "group" || node.type === "tile") &&
      typeof node.expanded === "string" &&
      (node.url === null || typeof node.url === "string") &&
      typeof node.visible === "string" &&
      (node.opacity === null || typeof node.opacity === "number") &&
      typeof node.sortOrder === "number" &&
      (node.child === null || Array.isArray(node.child))
    );
  });
}

/**
 * 从图层树数据中提取所有图层节点
 * @param nodes 图层树节点数组
 * @returns 图层节点数组
 */
export function extractLayerNodes(nodes: LayerTreeNode[]): LayerTreeNode[] {
  const layerNodes: LayerTreeNode[] = [];

  const processNode = (node: LayerTreeNode) => {
    if (node.type === "tile" && node.url) {
      layerNodes.push(node);
    }

    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode);
    }
  };

  nodes.forEach(processNode);
  return layerNodes;
}

/**
 * 从图层树数据中提取所有组节点
 * @param nodes 图层树节点数组
 * @returns 组节点数组
 */
export function extractGroupNodes(nodes: LayerTreeNode[]): LayerTreeNode[] {
  const groupNodes: LayerTreeNode[] = [];

  const processNode = (node: LayerTreeNode) => {
    if (node.type === "group") {
      groupNodes.push(node);
    }

    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode);
    }
  };

  nodes.forEach(processNode);
  return groupNodes;
}

/**
 * 获取默认展开的节点ID
 * @param nodes 图层树节点数组
 * @returns 展开节点ID数组
 */
export function getDefaultExpandedKeys(nodes: LayerTreeNode[]): string[] {
  const expandedKeys: string[] = [];

  const processNode = (node: LayerTreeNode) => {
    if (node.type === "group" && node.expanded === "true") {
      expandedKeys.push(node.id);
    }

    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode);
    }
  };

  nodes.forEach(processNode);
  return expandedKeys;
}

/**
 * 获取默认可见的图层ID
 * @param nodes 图层树节点数组
 * @returns 可见图层ID数组
 */
export function getDefaultVisibleLayerKeys(nodes: LayerTreeNode[]): string[] {
  //   const visibleKeys: string[] = [];

  //   const processNode = (node: LayerTreeNode) => {
  //     if (node.type === 'tile' && node.visible === 'true' && node.url) {
  //       visibleKeys.push(node.id);
  //     }

  //     if (node.child && Array.isArray(node.child)) {
  //       node.child.forEach(processNode);
  //     }
  //   };

  //   nodes.forEach(processNode);
  //   return visibleKeys;

  return ["9e38a8e2-273e-4f9f-a237-8a0b4a0b1d14"];
}

/**
 * 按排序顺序对节点进行排序
 * @param nodes 图层树节点数组
 * @returns 排序后的节点数组
 */
export function sortNodesBySortOrder(nodes: LayerTreeNode[]): LayerTreeNode[] {
  const sortedNodes = [...nodes].sort((a, b) => a.sortOrder - b.sortOrder);

  return sortedNodes.map((node) => ({
    ...node,
    child: node.child ? sortNodesBySortOrder(node.child) : null,
  }));
}

/**
 * 根据ID查找节点
 * @param nodes 图层树节点数组
 * @param id 节点ID
 * @returns 找到的节点或null
 */
export function findNodeById(
  nodes: LayerTreeNode[],
  id: string
): LayerTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.child && Array.isArray(node.child)) {
      const found = findNodeById(node.child, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * 获取节点的所有父节点ID
 * @param nodes 图层树节点数组
 * @param targetId 目标节点ID
 * @returns 父节点ID数组
 */
export function getParentNodeIds(
  nodes: LayerTreeNode[],
  targetId: string
): string[] {
  const parentIds: string[] = [];

  const findParents = (
    currentNodes: LayerTreeNode[],
    path: string[] = []
  ): boolean => {
    for (const node of currentNodes) {
      const currentPath = [...path, node.id];

      if (node.id === targetId) {
        parentIds.push(...path);
        return true;
      }

      if (node.child && Array.isArray(node.child)) {
        if (findParents(node.child, currentPath)) {
          return true;
        }
      }
    }

    return false;
  };

  findParents(nodes);
  return parentIds;
}

/**
 * 创建图层状态映射
 * @param nodes 图层树节点数组
 * @returns 图层状态映射
 */
export function createLayerStateMap(nodes: LayerTreeNode[]): Map<string, any> {
  const stateMap = new Map();

  const processNode = (node: LayerTreeNode) => {
    if (node.type === "tile" && node.url) {
      stateMap.set(node.id, {
        visible: node.visible === "true",
        opacity: node.opacity || 1.0,
        loading: false,
        error: null,
        url: node.url,
        name: node.name,
      });
    }

    if (node.child && Array.isArray(node.child)) {
      node.child.forEach(processNode);
    }
  };

  nodes.forEach(processNode);
  return stateMap;
}
