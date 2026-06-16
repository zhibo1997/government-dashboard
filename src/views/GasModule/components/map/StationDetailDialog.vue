<template>
  <div class="station-detail-dialog" :class="{
    'natural-gas-info': isNaturalGas,
    'liquefied-gas-info': isLiquefiedGas,
  }" v-show="visible && isEntityVisible" :style="dialogStyle">
    <div class="dialog-header">
      <div class="dialog-title">{{ stationData?.qymc || "企业详情" }}</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" class="action-icon favorite-icon" />
      </n-button>
    </div>

    <div class="dialog-content">
      <!-- 天然气企业信息 -->
      <div class="info-section" v-if="isNaturalGas">
        <div class="status-badge-row">
          <button class="badge-btn badge-type">天然气企业</button>
          <button class="badge-btn badge-normal" v-if="stationData?.sjtbzt === 'I'">
            在线
          </button>
          <button class="badge-btn badge-error" v-else>离线</button>
        </div>

        <div class="info-grid">
          <div class="info-row" v-for="field in naturalGasFields" :key="field.key">
            <label>{{ field.label }}：</label>
            <span class="info-value">{{ stationData[field.key] || "—" }}</span>
          </div>
        </div>
      </div>

      <!-- 液化气企业信息 -->
      <div class="info-section" v-else-if="isLiquefiedGas">
        <div class="status-badge-row">
          <button class="badge-btn badge-type">液化气企业</button>
          <button class="badge-btn badge-normal" v-if="stationData?.sjtbzt === 'I'">
            在线
          </button>
          <button class="badge-btn badge-error" v-else>离线</button>
        </div>

        <div class="info-grid">
          <div class="info-row" v-for="field in liquefiedGasFields" :key="field.key">
            <label>{{ field.label }}：</label>
            <span class="info-value">{{ stationData[field.key] || "—" }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn btn-monitoring" @click="handleShowMonitoring" v-if="isNaturalGas">
          查看场站
        </button>
        <!-- 液化气企业暂无接口数据，暂时隐藏 -->
        <!-- <button class="action-btn btn-monitoring" @click="handleShowMonitoring" v-if="isLiquefiedGas">
          查看用户
        </button> -->
        <!-- <button class="action-btn btn-warning">查看监控</button> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, onMounted, onBeforeUnmount, ref, inject } from "vue";
import { useVueCesium } from "vue-cesium";
import { NButton, NIcon } from "naive-ui";
import { Close } from "@vicons/ionicons5";
import GasMarkerIcon from "@/assets/img/gasModule/gas_marker.webp";

const viewer = ref<Cesium.Viewer | null>(null);

// 位置跟踪相关
const dialogX = ref(0);
const dialogY = ref(0);
const isEntityVisible = ref(true);
let removePostRender: (() => void) | null = null;
const scaleRatio = inject('responsiveScale', ref(1));

const dialogStyle = computed(() => ({
  left: `${dialogX.value}px`,
  top: `${dialogY.value}px`,
}));

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  stationData: {
    type: Object,
    default: () => ({}),
  },
});
onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  viewer.value = readyObj.viewer;
});
const emit = defineEmits(["update:visible", "show-monitoring"]);

// 天然气企业字段定义
const naturalGasFields = [
  { key: "qybm", label: "企业编码" },
  { key: "qymc", label: "企业名称" },
  { key: "xxdz", label: "详细地址" },
  { key: "jyqy", label: "经营区域" },
  { key: "zgrs", label: "职工人数" },
  { key: "yyyjsl", label: "拥有窨井数量" },
  { key: "yyczsl", label: "拥有厂站数量" },
  { key: "yygxcd", label: "拥有管线长度" },
];

// 液化气企业字段定义
const liquefiedGasFields = [
  { key: "qybm", label: "企业编码" },
  { key: "qymc", label: "企业名称" },
  { key: "xxdz", label: "详细地址" },
  { key: "jyqy", label: "经营区域" },
  { key: "yhqpsl", label: "液化气瓶数量" },
  { key: "zgrs", label: "职工人数" },
  { key: "czgsl", label: "充装工数量" },
  { key: "sqgsl", label: "送气工数量" },
  { key: "khzs", label: "客户总数" },
  { key: "jmkhsl", label: "居民客户数量" },
  { key: "fjmkhsl", label: "非居民客户数量" },
  { key: "ysclsl", label: "运输车辆数量" },
  { key: "azdwsbclsl", label: "安装定位设备车辆数量" },
  { key: "qyfzrxm", label: "企业负责人姓名" },
  { key: "qyjyyxq", label: "企业经营有效期" },
];

// 判断是否为天然气
const isNaturalGas = computed(() => {
  return (
    props.stationData?.gasType === "rqlx001" ||
    props.stationData?.rqlx === "rqlx001"
  );
});

// 判断是否为液化气
const isLiquefiedGas = computed(() => {
  return (
    props.stationData?.gasType === "rqlx002" ||
    props.stationData?.rqlx === "rqlx002"
  );
});

// 监听 stationData 变化，当有数据且包含经纬度时在地图上标注
watch(
  () => props.stationData,
  (newData) => {
    if (newData && newData.jd && newData.wd) {
      addMarkerToMap(newData.jd, newData.wd);
    }
  },
  { deep: true }
);

// 开始位置跟踪
const startPositionTracking = () => {
  if (!viewer.value) return;
  stopPositionTracking();

  removePostRender = viewer.value.scene.postRender.addEventListener(() => {
    const entity = viewer.value.entities.getById("station-marker");
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
    dialogY.value = (screenPos.y) / scaleRatio.value - 880;
  });
};

// 停止位置跟踪
const stopPositionTracking = () => {
  if (removePostRender) {
    removePostRender();
    removePostRender = null;
  }
};

// 在地图上添加标记点
const addMarkerToMap = (longitude, latitude) => {
  try {
    // 使用在 onMounted 中初始化的 viewer
    if (!viewer.value) {
      console.warn("Cesium viewer 实例未找到");
      return;
    }

    // 移除之前添加的标记点
    removeExistingMarkers(viewer.value);

    // 创建实体标记点
    const entity = viewer.value.entities.add({
      id: "station-marker",
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      billboard: {
        image: GasMarkerIcon,
        scale: 1.0, // 设置基础缩放比例
        scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, 0), // 调整偏移量使图标底部对齐位置点
      }
    });

    // 飞行到标记点位置
    viewer.value.flyTo(entity, {
      duration: 2,
      offset: new Cesium.HeadingPitchRange(
        0,
        Cesium.Math.toRadians(-45),
        2000
      ),
    });

    // 开始位置跟踪
    startPositionTracking();
  } catch (error) {
    console.error("在地图上添加标记点失败:", error);
  }
};

// 移除已存在的标记点
const removeExistingMarkers = (viewer) => {
  try {
    // 移除之前添加的标记点
    const existingEntity = viewer.entities.getById("station-marker");
    if (existingEntity) {
      viewer.entities.remove(existingEntity);
    }
  } catch (error) {
    console.warn("移除已存在的标记点时出错:", error);
  }
};

const handleClose = () => {
  stopPositionTracking();
  emit("update:visible", false);
  // 关闭对话框时移除标记点
  try {
    if (viewer.value) {
      removeExistingMarkers(viewer.value);
    }
  } catch (error) {
    console.warn("关闭对话框时移除标记点失败:", error);
  }
};

const handleShowMonitoring = () => {
  emit("show-monitoring");
};

onBeforeUnmount(() => {
  stopPositionTracking();
  if (viewer.value) {
    removeExistingMarkers(viewer.value);
  }
});
</script>

<style lang="scss" scoped>
.station-detail-dialog {
  position: absolute;
  width: 773px;
  z-index: 200;
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  flex-direction: column;

  &.liquefied-gas-info {
    width: 620px;
  }

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
    height: 400px;
    display: flex;
    flex-direction: column;
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

      &.liquefied-gas-info {}

      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
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

    .action-section {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      gap: 16px;
      padding-top: 12px;
      border-top: 2px solid rgba(13, 165, 190, 0.3);

      .action-btn {
        width: 170px;
        height: 60px;
        background: linear-gradient(180deg, #083957 0%, #091827 100%);
        border: 2px solid;
        border-image: linear-gradient(153deg,
            rgba(25, 163, 203, 1),
            rgba(62, 109, 123, 1),
            rgba(17, 171, 233, 1)) 2 2;

        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-heading);
        color: #ffffff;
        line-height: calc(var(--font-size-heading) * var(--line-height-normal));
        text-align: left;
        font-style: normal;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);;
        cursor: pointer;
        text-align: center;

        &.btn-monitoring {
          background: rgba(0, 60, 80, 0.6);
          border-color: #0da5be;
          color: #ffffff;

          &:hover {
            background: rgba(13, 165, 190, 0.4);
            border-color: #3fffff;
            box-shadow: 0 0 16px rgba(13, 165, 190, 0.5);
          }
        }

        &.btn-warning {
          background: rgba(0, 60, 80, 0.6);
          border-color: #0da5be;
          color: #ffffff;

          &:hover {
            background: rgba(13, 165, 190, 0.4);
            border-color: #3fffff;
            box-shadow: 0 0 16px rgba(13, 165, 190, 0.5);
          }
        }
      }
    }
  }
}
</style>