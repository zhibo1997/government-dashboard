<template>
  <div class="drain-flood-detail-dialog" v-show="visible && isEntityVisible" :style="dialogStyle">
    <div class="dialog-header">
      <div class="dialog-title">{{ floodData?.jsdmc || "易涝点详情" }}</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon
          size="40"
          color="rgb(17,167,226)"
          :component="Close"
          class="action-icon favorite-icon"
        />
      </n-button>
    </div>

    <div class="dialog-content">
      <div class="info-section">
        <div class="info-grid">
          <div class="info-row" v-for="field in floodFields" :key="field.key">
            <label>{{ field.label }}：</label>
            <span class="info-value">{{ formatFieldValue(field.key, floodData?.[field.key]) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn btn-camera" @click="handleShowCamera">
          查看监控
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount, ref, inject } from "vue";
import { useVueCesium } from "vue-cesium";
import { NButton, NIcon } from "naive-ui";
import { Close } from "@vicons/ionicons5";

const viewer = ref<Cesium.Viewer | null>(null);

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
  floodData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible", "show-camera"]);

const handleShowCamera = () => {
  emit("show-camera");
};

const floodFields = [
  { key: "jsdbh", label: "编号" },
  { key: "jsdmc", label: "名称" },
  { key: "jsyy", label: "积水原因" },
  { key: "zdjsmj", label: "最大积水面积(m²)" },
  { key: "jssd", label: "积水深度(m)" },
  { key: "dz", label: "地址" },
  { key: "szdl", label: "所在道路" },
  { key: "fzr", label: "负责人" },
  { key: "fzrlxfs", label: "联系方式" },
  { key: "zgcs", label: "整改措施" },
];

const zgztMap: Record<string, string> = {
  zgzt001: "已整改",
  zgzt002: "未整改",
  zgzt003: "整改中",
  zgzt004: "持续跟进",
};

const formatFieldValue = (key: string, value: any) => {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "zgzt") return zgztMap[value] || value || "—";
  return value || "—";
};

watch(
  () => props.floodData,
  (newData) => {
    if (newData && newData.jd && newData.wd) {
      addMarkerToMap(newData.jd, newData.wd);
    }
  },
  { deep: true }
);

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      stopPositionTracking();
      if (viewer.value) {
        removeExistingMarkers(viewer.value);
      }
    }
  }
);

onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  viewer.value = readyObj.viewer;
});

const addMarkerToMap = (longitude: number, latitude: number) => {
  try {
    if (!viewer.value) {
      console.warn("Cesium viewer 实例未找到");
      return;
    }

    removeExistingMarkers(viewer.value);

    const entity = viewer.value.entities.add({
      id: "drain-flood-marker",
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      billboard: {
        image: undefined,
        pixelSize: 14,
      },
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString("#00bfff"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0.4),
      }
    });

    viewer.value.flyTo(entity, {
      duration: 2,
      offset: new Cesium.HeadingPitchRange(
        0,
        Cesium.Math.toRadians(-45),
        2000
      ),
    });

    startPositionTracking();
  } catch (error) {
    console.error("在地图上添加标记点失败:", error);
  }
};

const removeExistingMarkers = (viewer: any) => {
  try {
    const existingEntity = viewer.entities.getById("drain-flood-marker");
    if (existingEntity) {
      viewer.entities.remove(existingEntity);
    }
  } catch (error) {
    console.warn("移除已存在的标记点时出错:", error);
  }
};

const startPositionTracking = () => {
  if (!viewer.value) return;
  stopPositionTracking();

  removePostRender = viewer.value.scene.postRender.addEventListener(() => {
    const entity = viewer.value.entities.getById("drain-flood-marker");
    if (!entity?.position) return;

    const position = entity.position.getValue(viewer.value.clock.currentTime);
    if (!position) return;

    const screenPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.value.scene,
      position
    );

    if (!screenPos) {
      isEntityVisible.value = false;
      return;
    }

    isEntityVisible.value = true;
    dialogX.value = (screenPos.x - 773 * scaleRatio.value / 2) / scaleRatio.value;
    dialogY.value = (screenPos.y) / scaleRatio.value - 780;
  });
};

const stopPositionTracking = () => {
  if (removePostRender) {
    removePostRender();
    removePostRender = null;
  }
};

const handleClose = () => {
  stopPositionTracking();
  emit("update:visible", false);
  try {
    if (viewer.value) {
      removeExistingMarkers(viewer.value);
    }
  } catch (error) {
    console.warn("关闭对话框时移除标记点失败:", error);
  }
};

onBeforeUnmount(() => {
  stopPositionTracking();
  if (viewer.value) {
    removeExistingMarkers(viewer.value);
  }
});
</script>

<style lang="scss" scoped>
.drain-flood-detail-dialog {
  position: absolute;
  width: 773px;
  z-index: 200;
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);

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
    height: 400px;
    overflow: hidden;
    padding: 30px 20px 24px;
    background: linear-gradient(270deg, #021F37 0%, #02111D 99.92%);
    box-shadow: -34px 0px 17px 0px rgba(4, 17, 38, 0.4), 34px 9px 17px 0px rgba(4, 17, 38, 0.4);
    border: 2px solid;
    border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(12, 93, 117, 0.24), rgba(8, 189, 243, 0.04), rgba(0, 28, 38, 0), rgba(8, 97, 132, 0), rgba(17, 171, 233, 1)) 2 2;
    backdrop-filter: blur(20px);

    .info-section {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 255, 255, 0.3);
        border-radius: 2px;

        &:hover {
          background: rgba(0, 255, 255, 0.5);
        }
      }

      .status-badge-row {
        display: flex;
        gap: 12px;

        .badge-btn {
          padding: 8px 20px;
          border-radius: 8px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-heading);
          line-height: calc(var(--font-size-heading) * 1.4);

          &.badge-type {
            background: #313d56;
            border-radius: 8px;
            border: 2px solid #15779d;
            color: #e4f3ff;
            line-height: 1.4;
          }

          &.badge-normal {
            background: linear-gradient(90deg,
                rgba(4, 247, 103, 0.6) 0%,
                rgba(4, 199, 254, 0.6) 99%);
            border: 2px solid #04c7fe;
            color: #fff;
          }

          &.badge-error {
            color: #fff;
            background: linear-gradient(90deg,
                rgba(247, 94, 4, 0.6) 0%,
                rgba(254, 172, 4, 0.6) 100%);
            border: 2px solid #f76204;
            border-image: linear-gradient(180deg,
                rgba(252, 155, 10, 1),
                rgba(247, 98, 4, 1)) 2 2;
          }
        }
      }

      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

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
          color: #a8d4e0;
          min-width: 160px;
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

    // 操作按钮区域
    .action-section {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      gap: 16px;
      padding-top: 12px;
      border-top: 2px solid rgba(13, 165, 190, 0.3);
      margin-bottom: 12px;

      .action-btn {
        width: 170px;
        height: 60px;
        cursor: pointer;
        text-align: center;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-heading);
        color: #ffffff;

        &.btn-camera {
          background: rgba(60, 40, 0, 0.6);
          border: 2px solid #be8b0d;
          border-radius: 6px;

          &:hover {
            background: rgba(190, 139, 13, 0.4);
            border-color: #ffdc3f;
            box-shadow: 0 0 16px rgba(190, 139, 13, 0.5);
          }
        }
      }
    }
  }
}
</style>
