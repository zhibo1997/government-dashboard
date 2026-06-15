<template>
  <!-- 易涝点列表 -->
  <DrainFloodListPanel
    @item-click="handleItemClick"
  />

  <!-- 易涝点详情弹窗 -->
  <DrainFloodDetailDialog
    v-model:visible="showDetail"
    :flood-data="selectedItem"
    @show-camera="handleShowCamera"
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
import DrainFloodListPanel from "./components/map/DrainFloodListPanel.vue";
import DrainFloodDetailDialog from "./components/map/DrainFloodDetailDialog.vue";
import { getCameraPreviewUrl } from "@/services/hikvisionService";
import { getDrainFloodDetail } from "@/services/waterSupplyService";
import VideoPopup from "@/views/BridgeModule/components/map/VideoPopup.vue";

defineOptions({
  name: "DrainageSidebarModule"
});

const showDetail = ref(false);
const selectedItem = ref<any>({});
const showVideoPopup = ref(false);
const currentVideoUrl = ref('');
const currentCameraName = ref('');

const handleItemClick = async (item: any) => {
  // 调用详情接口获取完整数据
  try {
    const detail = await getDrainFloodDetail(item.lsh);
    selectedItem.value = detail || item;
  } catch (error) {
    console.error('获取易涝点详情失败:', error);
    selectedItem.value = item;
  }
  showDetail.value = true;
};

// 查看监控（根据 jsdbh 调用海康预览接口）
const handleShowCamera = async () => {
  if (!selectedItem.value?.jsdbh) return;
  try {
    const res: any = await getCameraPreviewUrl({
      cameraIndexCode: selectedItem.value.jsdbh,
      streamType: 0,
      protocol: 'hls',
      transmode: 1,
    });
    const videoUrl = res?.url || res?.data?.url;
    if (videoUrl) {
      currentVideoUrl.value = videoUrl;
      currentCameraName.value = selectedItem.value.jsdmc || '';
      showVideoPopup.value = true;
      showDetail.value = false;
    } else {
      console.warn('未获取到视频流地址');
    }
  } catch (error) {
    console.error('获取监控视频失败:', error);
  }
};
</script>

<style lang="scss" scoped>
</style>
