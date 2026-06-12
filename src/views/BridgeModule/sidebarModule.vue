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
    @show-camera="handleShowCamera"
  />

  <!-- 监测设备弹窗 -->
  <EquipmentDialog
    v-model:visible="showEquipmentDialog"
    :bridge-data="selectedBridge"
    @equipment-view="handleEquipmentView"
  />

  <!-- 设备详情弹窗 -->
  <EquipmentDetailPopup
    v-model:visible="showEquipmentDetail"
    :equipment-data="selectedEquipment"
  />

  <!-- 监控视频列表弹窗 -->
  <CameraListDialog
    v-model:visible="showCameraDialog"
    :bridge-name="selectedBridge?.llmc || ''"
    @camera-view="handleCameraView"
    @cameras-loaded="handleCamerasLoaded"
  />

  <!-- 监控详情弹窗 -->
  <CameraDetailPopup
    v-model:visible="showCameraDetail"
    :camera-data="selectedCamera"
    @watch-video="handleWatchVideo"
  />

  <!-- 视频播放弹窗 -->
  <VideoPopup
    v-model:visible="showVideoPopup"
    :video-url="currentVideoUrl"
    :camera-name="currentCameraName"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import BridgeListPanel from "./components/map/BridgeListPanel.vue";
import BridgeDetailDialog from "./components/map/BridgeDetailDialog.vue";
import EquipmentDialog from "./components/map/EquipmentDialog.vue";
import EquipmentDetailPopup from "./components/map/EquipmentDetailPopup.vue";
import CameraListDialog from "./components/map/CameraListDialog.vue";
import CameraDetailPopup from "./components/map/CameraDetailPopup.vue";
import VideoPopup from "./components/map/VideoPopup.vue";

defineOptions({
  name: "BridgeSidebarModule"
});

// 控制显示状态
const showBridgeList = ref(true);
const showBridgeDetail = ref(false);
const showEquipmentDialog = ref(false);
const showEquipmentDetail = ref(false);
const showCameraDialog = ref(false);
const showCameraDetail = ref(false);
const showVideoPopup = ref(false);
const selectedBridge = ref<any>(null);
const selectedEquipment = ref<any>({});
const selectedCamera = ref<any>({});
const currentVideoUrl = ref('');
const currentCameraName = ref('');

// 处理桥梁点击
const handleBridgeClick = (bridge: any) => {
  selectedBridge.value = bridge;
  showBridgeDetail.value = true;
  showEquipmentDialog.value = false;
  showEquipmentDetail.value = false;
  showCameraDialog.value = false;
  showCameraDetail.value = false;
};

// 显示监测设备（关闭监控相关）
const handleShowEquipment = () => {
  showEquipmentDialog.value = true;
  showCameraDialog.value = false;
  showCameraDetail.value = false;
};

// 处理设备查看
const handleEquipmentView = (equipment: any) => {
  selectedEquipment.value = equipment;
  showEquipmentDetail.value = true;
  showBridgeDetail.value = false;
};

// 显示监控列表（关闭监测设备相关）
const handleShowCamera = () => {
  showCameraDialog.value = true;
  showEquipmentDialog.value = false;
  showEquipmentDetail.value = false;
};

// 监控列表加载完成
const handleCamerasLoaded = (cameras: any[]) => {
  console.log('📹 监控列表加载完成:', cameras.length, '个');
};

// 处理监控查看（列表保持打开）
const handleCameraView = (camera: any) => {
  selectedCamera.value = camera;
  showCameraDetail.value = true;
  showBridgeDetail.value = false;
};

// 观看视频
const handleWatchVideo = (videoUrl: string, cameraName: string) => {
  currentVideoUrl.value = videoUrl;
  currentCameraName.value = cameraName;
  showVideoPopup.value = true;
  showCameraDetail.value = false;
};
</script>

<style lang="scss" scoped>
</style>
