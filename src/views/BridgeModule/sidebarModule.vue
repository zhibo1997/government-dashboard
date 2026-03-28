<template>
  <!-- 左侧桥梁列表 -->
  <BridgeListPanel
    v-model:visible="showBridgeList"
    @bridge-click="handleBridgeClick"
  />

  <!-- 桥梁详情弹窗 -->
  <BridgeDetailDialog
    :visible="showBridgeDetail"
    :bridge-data="selectedBridge"
    @update:visible="showBridgeDetail = $event"
    @show-equipment="handleShowEquipment"
  />

  <!-- 监测设备弹窗 -->
  <EquipmentDialog
    :visible="showEquipmentDialog"
    :bridge-data="selectedBridge"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import BridgeListPanel from "./components/map/BridgeListPanel.vue";
import BridgeDetailDialog from "./components/map/BridgeDetailDialog.vue";
import EquipmentDialog from "./components/map/EquipmentDialog.vue";

// 桥梁模块侧边栏组件
defineOptions({
  name: "BridgeSidebarModule"
});

// 控制显示状态
const showBridgeList = ref(true);
const showBridgeDetail = ref(false);
const showEquipmentDialog = ref(false);
const selectedBridge = ref(null);

// 处理桥梁点击
const handleBridgeClick = (bridge) => {
  selectedBridge.value = bridge;
  showBridgeDetail.value = true;
  // 切换桥梁时关闭设备列表
  showEquipmentDialog.value = false;
};

// 显示监测设备
const handleShowEquipment = () => {
  showEquipmentDialog.value = true;
};
</script>

<style lang="scss" scoped>
// 侧边栏样式由各子组件独立管理
</style>