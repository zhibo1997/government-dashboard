<template>
  <!-- 左侧桥梁列表 -->
  <BridgeListPanel
    v-model:visible="showBridgeList"
    @bridge-click="handleBridgeClick"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import BridgeListPanel from "./components/map/BridgeListPanel.vue";

// 桥梁模块侧边栏组件
defineOptions({
  name: "BridgeSidebarModule"
});

// 控制显示状态
const showBridgeList = ref(true);
const selectedBridge = ref(null);

// 处理桥梁点击
const handleBridgeClick = (bridge) => {
  selectedBridge.value = bridge;
  // 可在此处触发其他操作，如显示详情弹窗、地图交互等
  console.log("选中桥梁:", bridge);
};
</script>

<style lang="scss" scoped>
// 侧边栏样式由各子组件独立管理
</style>