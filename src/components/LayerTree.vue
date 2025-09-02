<template>
  <div class="layer-tree">
    <a-tree
      :tree-data="treeData"
      :show-line="true"
      :default-expand-all="true"
      @expand="onExpand"
      @select="onSelect"
    >
      <template #title="{ key, title, layer }">
        <div class="layer-item">
          <div class="layer-info">
            <span class="layer-name">{{ title }}</span>
            <span v-if="layer?.description" class="layer-desc">{{
              layer.description
            }}</span>
          </div>
          <div class="layer-controls">
            <a-switch
              v-if="layer?.type === 'layer'"
              :checked="layer.visible"
              size="small"
              @change="(checked) => handleLayerToggle(key, checked)"
            />
            <a-slider
              v-if="layer?.type === 'layer' && layer.visible"
              :value="layer.opacity * 100"
              :min="0"
              :max="100"
              :step="10"
              :tooltip-formatter="(value) => `${value}%`"
              @change="(value) => handleOpacityChange(key, value / 100)"
              style="width: 60px; margin-left: 8px"
            />
          </div>
        </div>
      </template>
    </a-tree>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Emits
const emit = defineEmits(["layer-toggle", "layer-opacity-change"]);

// 响应式数据
const expandedKeys = ref([]);

// 图层状态
const layerStates = ref({
  bridge_layer: {
    visible: false,
    opacity: 1.0,
  },
  manhole_layer: {
    visible: false,
    opacity: 1.0,
  },
});

// 计算属性：转换为树形数据
const treeData = computed(() => {
  return [
    {
      title: "燃气专项",
      key: "gas_special",
      children: [
        {
          title: "井盖设施",
          key: "manhole_layer",
          layer: {
            type: "layer",
            visible: layerStates.value.manhole_layer.visible,
            opacity: layerStates.value.manhole_layer.opacity,
            description: "井盖基础信息",
          },
        },
      ],
    },
    {
      title: "桥梁专项",
      key: "bridge_special",
      children: [
        {
          title: "桥梁设施",
          key: "bridge_layer",
          layer: {
            type: "layer",
            visible: layerStates.value.bridge_layer.visible,
            opacity: layerStates.value.bridge_layer.opacity,
            description: "桥梁基础信息",
          },
        },
      ],
    },
  ];
  // return [
  //   {
  //     key: 'bridge_layer',
  //     title: '桥梁设施',
  //     layer: {
  //       type: 'layer',
  //       visible: layerStates.value.bridge_layer.visible,
  //       opacity: layerStates.value.bridge_layer.opacity,
  //       description: '桥梁基础信息'
  //     }
  //   },
  //   {
  //     key: 'manhole_layer',
  //     title: '井盖设施',
  //     layer: {
  //       type: 'layer',
  //       visible: layerStates.value.manhole_layer.visible,
  //       opacity: layerStates.value.manhole_layer.opacity,
  //       description: '井盖基础信息'
  //     }
  //   }
  // ]
});

// 展开/收起节点
function onExpand(expandedKeysValue) {
  expandedKeys.value = expandedKeysValue;
}

// 选择节点
function onSelect(selectedKeys, info) {
  console.log("Selected:", selectedKeys, info);
}

// 处理图层显隐切换
function handleLayerToggle(layerKey, visible) {
  // 更新本地状态
  if (layerStates.value[layerKey]) {
    layerStates.value[layerKey].visible = visible;
  }
  emit("layer-toggle", layerKey, visible);
}

// 处理透明度变化
function handleOpacityChange(layerKey, opacity) {
  // 更新本地状态
  if (layerStates.value[layerKey]) {
    layerStates.value[layerKey].opacity = opacity;
  }
  emit("layer-opacity-change", layerKey, opacity);
}

// 暴露方法给父组件调用
defineExpose({
  updateLayerState(layerKey, state) {
    if (layerStates.value[layerKey]) {
      layerStates.value[layerKey] = {
        ...layerStates.value[layerKey],
        ...state,
      };
    }
  },
});
</script>

<style scoped>
.layer-tree {
  max-height: 400px;
  overflow-y: auto;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.layer-info {
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-weight: 500;
  display: block;
}

.layer-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  display: block;
  margin-top: 2px;
}

.layer-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
