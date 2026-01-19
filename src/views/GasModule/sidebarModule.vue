<template>
  <!-- <div class="sidebar-module"> -->
    <!-- 左侧燃气厂站列表 -->
    <StationListPanel
      v-model:visible="showStationList"
      @station-click="handleStationClick"
    />

    <!-- 场站详情弹窗 -->
    <StationDetailDialog
      v-model:visible="showStationDetail"
      :station-data="selectedStation"
      @show-monitoring="handleShowMonitoring"
    />

    <!-- 监测设备弹窗 -->
    <MonitoringDialog
      v-model:visible="showMonitoringDialog"
      :station-data="selectedStation"
    />
  <!-- </div> -->
</template>

<script setup lang="ts">
import { ref } from "vue";
import StationListPanel from "./components/map/StationListPanel.vue";
import StationDetailDialog from "./components/map/StationDetailDialog.vue";
import MonitoringDialog from "./components/map/MonitoringDialog.vue";

// 控制显示状态
const showStationList = ref(true);
const showStationDetail = ref(false);
const showMonitoringDialog = ref(false);
const selectedStation = ref(null);

// 处理场站点击
const handleStationClick = (station) => {
  selectedStation.value = station;
  showStationDetail.value = true;
  // 切换场站/企业时关闭监测设备列表
  showMonitoringDialog.value = false;
};

// 显示监测设备
const handleShowMonitoring = () => {
  showMonitoringDialog.value = true;
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
