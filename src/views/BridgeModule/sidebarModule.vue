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
    v-model:visible="showEquipmentDialog"
    :bridge-data="selectedBridge"
    @equipment-view="handleEquipmentView"
  />

  <!-- 设备详情弹窗（顶层渲染，避免父容器偏移影响定位） -->
  <EquipmentDetailPopup
    v-model:visible="showEquipmentDetail"
    :equipment-data="selectedEquipment"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import BridgeListPanel from "./components/map/BridgeListPanel.vue";
import BridgeDetailDialog from "./components/map/BridgeDetailDialog.vue";
import EquipmentDialog from "./components/map/EquipmentDialog.vue";
import EquipmentDetailPopup from "./components/map/EquipmentDetailPopup.vue";

// 桥梁模块侧边栏组件
defineOptions({
  name: "BridgeSidebarModule"
});

// 控制显示状态
const showBridgeList = ref(true);
const showBridgeDetail = ref(false);
const showEquipmentDialog = ref(false);
const showEquipmentDetail = ref(false);
const selectedBridge = ref(null);
const selectedEquipment = ref<any>({});

// 处理桥梁点击
const handleBridgeClick = (bridge) => {
  selectedBridge.value = bridge;
  showBridgeDetail.value = true;
  // 切换桥梁时关闭设备列表和设备详情
  showEquipmentDialog.value = false;
  showEquipmentDetail.value = false;
};

// 显示监测设备
const handleShowEquipment = () => {
  showEquipmentDialog.value = true;
};

// 处理设备查看
const handleEquipmentView = (equipment: any) => {
  selectedEquipment.value = equipment;
  showEquipmentDetail.value = true;
  showBridgeDetail.value = false;
};
</script>

<style lang="scss" scoped>
// 侧边栏样式由各子组件独立管理
</style>