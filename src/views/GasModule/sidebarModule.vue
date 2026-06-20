<template>
  <!-- <div class="sidebar-module"> -->
    <!-- 左侧燃气厂站列表 -->
    <StationListPanel
      v-model:visible="showStationList"
      @station-click="handleStationClick"
      @equipment-click="handleEquipmentClick"
      @collapsed-change="handleCollapsedChange"
    />

    <!-- 场站详情弹窗 -->
    <StationDetailDialog
      v-model:visible="showStationDetail"
      :station-data="selectedStation"
      @show-monitoring="handleShowMonitoring"
    />

    <!-- 监测设备弹窗 -->
    <MonitoringDialog />

    <!-- 设备详情弹窗 -->
    <EquipmentDetailDialog
      v-model:visible="showEquipmentDetail"
      :equipment-data="selectedEquipment"
    />
  <!-- </div> -->
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useBottomPanelStore } from "@/stores/bottomPanelStore";
import StationListPanel from "./components/map/StationListPanel.vue";
import StationDetailDialog from "./components/map/StationDetailDialog.vue";
import MonitoringDialog from "./components/map/MonitoringDialog.vue";
import EquipmentDetailDialog from "./components/map/EquipmentDetailDialog.vue";

// 控制显示状态
const bottomPanelStore = useBottomPanelStore();
const showStationList = ref(false);
const showStationDetail = ref(false);
const showEquipmentDetail = ref(false);
const selectedStation = ref(null);
const selectedEquipment = ref<any>({});

// 侧边栏折叠状态同步
const handleCollapsedChange = (collapsed: boolean) => {
  bottomPanelStore.setSidebarCollapsed(collapsed);
};

// 根据侧边栏状态设置底部面板 CSS 变量
watch(() => bottomPanelStore.sidebarCollapsed, (collapsed) => {
  const left = collapsed ? '860px' : '1320px';
  const width = collapsed ? '2380px' : '1920px';
  document.documentElement.style.setProperty('--bottom-panel-left', left);
  document.documentElement.style.setProperty('--bottom-panel-width', width);
}, { immediate: true });

// 处理场站点击
const handleStationClick = (station) => {
  selectedStation.value = station;
  showStationDetail.value = true;
  // 切换场站/企业时关闭底部面板
  bottomPanelStore.hidePanel();
};

// 显示监测设备
const handleShowMonitoring = () => {
  bottomPanelStore.showPanel('monitoring', { stationData: selectedStation.value });
};

// 处理设备点击
const handleEquipmentClick = (equipment: any) => {
  selectedEquipment.value = equipment;
  showEquipmentDetail.value = true;
};
</script>

<style lang="scss" scoped>
.sidebar-module {
  position: absolute;
  left: 840px;
  top: 20px;
  height: 100%;
  width: calc(100% - 1680px);
  z-index: 10;
  pointer-events: auto;
}
</style>
