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
      :cascade="true"
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
          <div class="layer-controls" @click.stop v-if="option.layer?.type === 'layer' && option.layer.visible">
            <n-slider
              :value="option.layer.opacity * 100"
              :min="0"
              :max="100"
              :step="10"
              :tooltip="true"
              :format-tooltip="(value) => `${value}%`"
              @update:value="(value) => handleOpacityChange(option.key, value / 100)"
              style="width: 80px;"
            />
          </div>
        </div>
      </template>
    </n-tree>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { LayersOutline, MapOutline, BusinessOutline } from "@vicons/ionicons5";

// Emits
const emit = defineEmits(["layer-toggle", "layer-opacity-change"]);

// 响应式数据
const expandedKeys = ref(['gas_special', 'bridge_special']);
const checkedKeys = ref([]);

// 图层状态
const layerStates = ref({
  bridge_layer: {
    visible: false,
    opacity: 1.0,
    url: "http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_bridgebscinfo.json"
  },
  manhole_layer: {
    visible: false,
    opacity: 1.0,
    url: "http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_manholecoverbasetinfo.json"
  },
});

// 计算属性：转换为树形数据
const treeData = computed(() => {
  return [
    {
      title: "燃气专项",
      key: "gas_special",
      icon: BusinessOutline,
      children: [
        {
          title: "井盖设施",
          key: "manhole_layer",
          icon: LayersOutline,
          layer: {
            type: "layer",
            url:"http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_manholecoverbasetinfo.json",
            description: "井盖基础信息",
          },
        },
      ],
    },
    {
      title: "桥梁专项",
      key: "bridge_special",
      icon: BusinessOutline,
      children: [
        {
          title: "桥梁设施",
          key: "bridge_layer",
          icon: MapOutline,
          layer: {
            type: "layer",
            url:"http://192.168.2.89/CSSMX/CSSMX_ZT/gspsp_dtrans_bridgebscinfo.json",
            description: "桥梁基础信息",
          },
        },
      ],
    },
  ];
});

// 展开/收起节点
function handleExpandedKeysChange(keys) {
  expandedKeys.value = keys;
}

// 勾选节点
function handleCheckedKeysChange(keys) {
  checkedKeys.value = keys;
  console.log("Checked:", keys);
  
  // 处理图层显隐
  const layerKeys = ['bridge_layer', 'manhole_layer'];
  layerKeys.forEach(layerKey => {
    const isChecked = keys.includes(layerKey);
    if (layerStates.value[layerKey].visible !== isChecked) {
      layerStates.value[layerKey].visible = isChecked;
      emit("layer-toggle", layerKey, isChecked, layerStates.value[layerKey].url);
    }
  });
}

// 处理图层显隐切换
function handleLayerToggle(layerKey, visible, url = null) {
  // 更新本地状态
  if (layerStates.value[layerKey]) {
    layerStates.value[layerKey].visible = visible;
  }
  const layerUrl = url || layerStates.value[layerKey]?.url;
  emit("layer-toggle", layerKey, visible, layerUrl);
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
  --font-size-large: 32px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  padding-left: 60px;
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

:deep(.n-tree-node:hover) {
  background-color: transparent;
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
