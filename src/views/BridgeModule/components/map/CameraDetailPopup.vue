<template>
  <div class="camera-detail-popup" v-show="visible && isEntityVisible" :style="dialogStyle">
    <div class="dialog-header">
      <div class="dialog-title">{{ cameraData?.spmc || "监控详情" }}</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" />
      </n-button>
    </div>

    <div class="dialog-content">
      <div class="info-section">
        <!-- 状态标签 -->
        <div class="status-badge-row">
          <button class="badge-btn badge-type">监控设备</button>
          <button class="badge-btn badge-normal" v-if="cameraData?.sfzx === 1">在线</button>
          <button class="badge-btn badge-error" v-else>离线</button>
        </div>

        <!-- 基本信息 -->
        <div class="info-grid">
          <div class="info-row">
            <label>设备编号：</label>
            <span class="info-value">{{ cameraData?.spbh || '—' }}</span>
          </div>
          <div class="info-row">
            <label>监控名称：</label>
            <span class="info-value">{{ cameraData?.spmc || '—' }}</span>
          </div>
          <div class="info-row">
            <label>所在位置：</label>
            <span class="info-value">{{ cameraData?.spszwz || '—' }}</span>
          </div>
          <div class="info-row">
            <label>所属专项：</label>
            <span class="info-value">{{ sszxName }}</span>
          </div>
        </div>

        <!-- 观看视频按钮 -->
        <div class="action-row">
          <button class="watch-btn" @click="handleWatchVideo" :disabled="videoLoading">
            {{ videoLoading ? '加载中...' : '观看视频' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount, ref, inject } from "vue";
import { useVueCesium } from "vue-cesium";
import { NButton, NIcon } from "naive-ui";
import { Close } from "@vicons/ionicons5";
import { getCameraPreviewUrl } from "@/services/hikvisionService";

const viewer = ref<Cesium.Viewer | null>(null);

// 位置跟踪
const dialogX = ref(0);
const dialogY = ref(0);
const isEntityVisible = ref(true);
let removePostRender: (() => void) | null = null;
const scaleRatio = inject<any>('responsiveScale', ref(1));

const dialogStyle = computed(() => ({
  left: `${dialogX.value}px`,
  top: `${dialogY.value}px`,
}));

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  cameraData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible", "watch-video"]);

const videoLoading = ref(false);

const sszxMap: Record<string, string> = {
  'csaqzx_ql': '桥梁',
  'csaqzx_gs': '供水',
  'csaqzx_rq': '燃气',
  'csaqzx_ps': '排水',
};

const sszxName = computed(() => {
  return sszxMap[props.cameraData?.sszx] || props.cameraData?.sszx || '—';
});

onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  viewer.value = readyObj.viewer;
});

// 监听数据变化，添加标记并定位
watch(
  () => props.cameraData,
  (newData) => {
    if (!newData) return;
    if (newData.spdwjd && newData.spdwwd) {
      addMarkerToMap(newData.spdwjd, newData.spdwwd);
    }
  },
  { deep: true }
);

// 在地图上添加标记点并飞行（参照 EquipmentDetailPopup）
const addMarkerToMap = (longitude: number, latitude: number) => {
  try {
    if (!viewer.value) return;
    removeExistingMarkers();

    const entity = viewer.value.entities.add({
      id: "camera-detail-marker",
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString("#ff9900"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0.4),
      }
    });

    viewer.value.flyTo(entity, {
      duration: 2,
      offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 2000),
    });

    startPositionTracking();
  } catch (error) {
    console.error("添加标记点失败:", error);
  }
};

const removeExistingMarkers = () => {
  try {
    if (!viewer.value) return;
    const existing = viewer.value.entities.getById("camera-detail-marker");
    if (existing) viewer.value.entities.remove(existing);
  } catch (error) {
    console.warn("移除标记点失败:", error);
  }
};

// 位置跟踪（参照 EquipmentDetailPopup）
const startPositionTracking = () => {
  if (!viewer.value) return;
  stopPositionTracking();

  removePostRender = viewer.value.scene.postRender.addEventListener(() => {
    const entity = viewer.value!.entities.getById("camera-detail-marker");
    if (!entity?.position) return;

    const position = entity.position.getValue(viewer.value!.clock.currentTime);
    if (!position) return;

    // @ts-ignore
    const screenPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.value!.scene,
      position
    );

    if (!screenPos) {
      isEntityVisible.value = false;
      return;
    }

    isEntityVisible.value = true;
    dialogX.value = (screenPos.x - 620 * scaleRatio.value / 2) / scaleRatio.value;
    dialogY.value = (screenPos.y) / scaleRatio.value - 480;
  });
};

const stopPositionTracking = () => {
  if (removePostRender) {
    removePostRender();
    removePostRender = null;
  }
};

const handleWatchVideo = async () => {
  if (!props.cameraData?.spbh) return;
  videoLoading.value = true;
  try {
    const res: any = await getCameraPreviewUrl({
      cameraIndexCode: props.cameraData.spbh,
      streamType: 0,
      protocol: 'hls',
      transmode: 1,
    });
    const videoUrl = res?.url || res?.data?.url;
    console.log('📹 视频流地址:', videoUrl);
    if (videoUrl) {
      emit("watch-video", videoUrl, props.cameraData?.spmc || '');
    } else {
      console.warn('未获取到视频流地址');
    }
  } catch (error) {
    console.error('获取视频流失败:', error);
  } finally {
    videoLoading.value = false;
  }
};

const handleClose = () => {
  stopPositionTracking();
  removeExistingMarkers();
  emit("update:visible", false);
};

onBeforeUnmount(() => {
  stopPositionTracking();
  removeExistingMarkers();
});
</script>

<style lang="scss" scoped>
.camera-detail-popup {
  position: absolute;
  width: 620px;
  z-index: 200;
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  flex-direction: column;

  .dialog-header {
    flex-shrink: 0;
    height: 70px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-image: url("@/assets/img/gasModule/detail_head_bg.webp");
    border-bottom: 2px solid rgba(13, 165, 190, 0.5);

    .dialog-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-heading);
      color: #e4f3ff;
      line-height: calc(var(--font-size-heading) * 1.464);
    }
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 24px 20px;
    max-height: 600px;
    background: linear-gradient(270deg, #021F37 0%, #02111D 99.92%);
    box-shadow: -34px 0px 17px 0px rgba(4, 17, 38, 0.4), 34px 9px 17px 0px rgba(4, 17, 38, 0.4);
    border: 2px solid;
    border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(12, 93, 117, 0.24), rgba(8, 189, 243, 0.04), rgba(0, 28, 38, 0), rgba(8, 97, 132, 0), rgba(17, 171, 233, 1)) 2 2;
    backdrop-filter: blur(20px);

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .status-badge-row {
        display: flex;
        gap: 12px;

        .badge-btn {
          padding: 4px 12px;
          border-radius: 6px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-caption);
          line-height: calc(var(--font-size-caption) * 1.4);

          &.badge-type {
            background: #313d56;
            border-radius: 8px;
            border: 2px solid #15779d;
            color: #e4f3ff;
          }

          &.badge-normal {
            background: linear-gradient(90deg, rgba(4, 247, 103, 0.6) 0%, rgba(4, 199, 254, 0.6) 99%);
            border: 2px solid #04c7fe;
            color: #fff;
          }

          &.badge-error {
            color: #fff;
            background: linear-gradient(90deg, rgba(247, 94, 4, 0.6) 0%, rgba(254, 172, 4, 0.6) 100%);
            border: 2px solid #f76204;
          }
        }
      }

      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: var(--font-size-heading);
          line-height: calc(var(--font-size-heading) * 1.4);
          color: #e4f3ff;

          label {
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: var(--font-weight-normal);
            min-width: 140px;
            flex-shrink: 0;
            text-align: right;
          }

          .info-value {
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: var(--font-weight-normal);
            flex: 1;
            min-width: 0;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .action-row {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(13, 165, 190, 0.3);
        display: flex;
        justify-content: center;

        .watch-btn {
          width: 240px;
          height: 56px;
          background: linear-gradient(90deg, rgba(22, 119, 255, 0.8) 0%, rgba(13, 165, 190, 0.8) 100%);
          border: 2px solid rgba(22, 119, 255, 0.6);
          border-radius: 8px;
          color: #ffffff;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-heading);
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover:not(:disabled) {
            background: linear-gradient(90deg, rgba(22, 119, 255, 1) 0%, rgba(13, 165, 190, 1) 100%);
            border-color: #3fffff;
            box-shadow: 0 0 16px rgba(22, 119, 255, 0.5);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>
