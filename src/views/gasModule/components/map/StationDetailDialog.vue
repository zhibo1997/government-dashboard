<template>
  <div
    class="station-detail-dialog"
    :class="{
      'natural-gas-info': isNaturalGas,
      'liquefied-gas-info': isLiquefiedGas,
    }"
    v-show="visible"
  >
    <div class="dialog-header">
      <div class="dialog-title">{{ stationData?.qymc || "企业详情" }}</div>
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
      <!-- 天然气企业信息 -->
      <div class="info-section" v-if="isNaturalGas">
        <div class="info-grid">
          <div
            class="info-row"
            v-for="field in naturalGasFields"
            :key="field.key"
          >
            <label>{{ field.label }}：</label>
            <span class="info-value">{{ stationData[field.key] || "—" }}</span>
          </div>
        </div>

        <div class="status-badge-row">
          <button class="badge-btn badge-type">天然气企业</button>
          <button
            class="badge-btn badge-normal"
            v-if="stationData?.sjtbzt === 'I'"
          >
            正常
          </button>
          <button class="badge-btn badge-error" v-else>异常</button>
        </div>
      </div>

      <!-- 液化气企业信息 -->
      <div class="info-section" v-else-if="isLiquefiedGas">
        <div class="info-grid">
          <div
            class="info-row"
            v-for="field in liquefiedGasFields"
            :key="field.key"
          >
            <label>{{ field.label }}：</label>
            <span class="info-value">{{ stationData[field.key] || "—" }}</span>
          </div>
        </div>

        <div class="status-badge-row">
          <button class="badge-btn badge-type">液化气企业</button>
          <button
            class="badge-btn badge-normal"
            v-if="stationData?.sjtbzt === 'I'"
          >
            正常
          </button>
          <button class="badge-btn badge-error" v-else>异常</button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn btn-monitoring" @click="handleShowMonitoring">
          监测设备
        </button>
        <button class="action-btn btn-warning">查看监控</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, onMounted, ref } from "vue";
import { useVueCesium } from "vue-cesium";
import { NButton, NIcon } from "naive-ui";
import { Close } from "@vicons/ionicons5";
import GasMarkerIcon from "@/assets/img/gasModule/gas_marker.webp";

const viewer = ref<Cesium.Viewer | null>(null);
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

    // 计算标记点在屏幕上的位置并调整对话框位置
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
</script>

<style lang="scss" scoped>
.station-detail-dialog {
  position: absolute;
    top: 80px;
    left: 1320px;
  width: 516px;
  background: linear-gradient(
    270deg,
    rgba(8, 46, 77, 0.4) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );

  border: 3px solid #226d76;
  z-index: 200;
  overflow: hidden;
  pointer-events: auto;
  &.liquefied-gas-info {
    width: 620px;
  }

  .dialog-header {
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
      font-size: var(--font-size-2xl);
      color: #e4f3ff;
      line-height: calc(var(--font-size-2xl) * 1.464);
    }
  }

  .dialog-content {
    padding: 30px 20px 24px;
    backdrop-filter: blur(30px);

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
      &.liquefied-gas-info {
      }

      .info-grid {
        display: grid;
        gap: 15px 20px;
      }

      .status-badge-row {
        display: flex;
        gap: 12px;
        justify-content: center;

        .badge-btn {
          padding: 6px 16px;
          border-radius: 8px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-lg);
          line-height: calc(var(--font-size-lg) * 1.45);

          &.badge-type {
            background: #313d56;
            border-radius: 8px;
            border: 2px solid #15779d;

            color: #e4f3ff;
            line-height: 29px;
          }

          &.badge-normal {
            background: linear-gradient(
              90deg,
              rgba(4, 247, 103, 0.6) 0%,
              rgba(4, 199, 254, 0.6) 99%
            );
            border: 2px solid #04c7fe;
            color: #fff;
          }

          &.badge-error {
            color: #fff;
            background: linear-gradient(
              90deg,
              rgba(247, 94, 4, 0.6) 0%,
              rgba(254, 172, 4, 0.6) 100%
            );
            border: 2px solid #f76204;
            border-image: linear-gradient(
                180deg,
                rgba(252, 155, 10, 1),
                rgba(247, 98, 4, 1)
              )
              2 2;
          }
        }
      }

      .info-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: var(--font-size-md);
        line-height: calc(var(--font-size-md) * 1.444);

        label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-normal);
          color: #a8d4e0;
          min-width: 140px;
          flex-shrink: 0;
        }

        .info-value {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-normal);
          color: #e4f3ff;
          flex: 1;
          min-width: 0;
        }
      }
    }

    .action-section {
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
        border-image: linear-gradient(
            153deg,
            rgba(25, 163, 203, 1),
            rgba(62, 109, 123, 1),
            rgba(17, 171, 233, 1)
          )
          2 2;

        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-3xl);
        color: #ffffff;
        line-height: calc(var(--font-size-3xl) * 1.467);
        text-align: left;
        font-style: normal;
        background: linear-gradient(90deg, #ffffff 18%, #10adc0 100%);
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