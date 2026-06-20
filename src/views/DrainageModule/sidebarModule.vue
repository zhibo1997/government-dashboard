<template>
  <!-- 易涝点列表 -->
  <DrainFloodListPanel
    v-model:visible="showListPanel"
    @item-click="handleItemClick"
    @collapsed-change="handleCollapsedChange"
  />

  <!-- 易涝点详情弹窗 -->
  <DrainFloodDetailDialog
    v-model:visible="showDetail"
    :flood-data="selectedItem"
    :has-camera="cameraList.length > 0"
    @show-camera="handleShowCamera"
  />

  <!-- 监控详情弹窗 -->
  <DrainFloodCameraDetailPopup
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
import { ref, watch } from "vue";
import { useBottomPanelStore } from "@/stores/bottomPanelStore";
import DrainFloodListPanel from "./components/map/DrainFloodListPanel.vue";
import DrainFloodDetailDialog from "./components/map/DrainFloodDetailDialog.vue";
import DrainFloodCameraDetailPopup from "./components/map/DrainFloodCameraDetailPopup.vue";
import { getSurveillanceVideoPage } from "@/services/surveillanceVideoService";
import { getDrainFloodDetail } from "@/services/waterSupplyService";
import VideoPopup from "@/views/BridgeModule/components/map/VideoPopup.vue";

defineOptions({
  name: "DrainageSidebarModule"
});

const bottomPanelStore = useBottomPanelStore();
const showListPanel = ref(true);
const showDetail = ref(false);

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
const selectedItem = ref<any>({});
const showCameraDetail = ref(false);
const selectedCamera = ref<any>({});
const showVideoPopup = ref(false);
const currentVideoUrl = ref('');
const currentCameraName = ref('');
const cameraList = ref<any[]>([]);

// 点击易涝点列表项（同时请求详情和监控列表）
const handleItemClick = async (item: any) => {
  cameraList.value = [];
  try {
    const [detail, cameraRes] = await Promise.all([
      getDrainFloodDetail(item.lsh),
      item.jsdbh ? getSurveillanceVideoPage({
        page: '1',
        rows: '100',
        sszx: 'csaqzx_ps',
        glmbbh: item.jsdbh,
      }) : Promise.resolve(null),
    ]);
    selectedItem.value = detail || item;
    cameraList.value = cameraRes?.rows || [];
  } catch (error) {
    console.error('获取数据失败:', error);
    selectedItem.value = item;
  }
  showDetail.value = true;
};

// 查看监控：取第一个显示
const handleShowCamera = () => {
  if (!cameraList.value.length) return;
  selectedCamera.value = cameraList.value[0];
  showCameraDetail.value = true;
  showDetail.value = false;
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
