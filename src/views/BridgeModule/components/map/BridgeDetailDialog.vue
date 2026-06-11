<template>
  <div class="bridge-detail-dialog" v-show="visible && isEntityVisible" :style="dialogStyle">
    <div class="dialog-header">
      <div class="dialog-title">{{ bridgeData?.llmc || "桥梁详情" }}</div>
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
      <!-- 桥梁基本信息 -->
      <div class="info-section">
        <!-- 状态标签移到顶部 -->
        <div class="status-badge-row">
          <button class="badge-btn badge-type">{{ getBridgeType(bridgeData?.qllx) || '未知类型' }}</button>
          <button
            class="badge-btn badge-normal"
            v-if="bridgeData?.sjtbzt === 'I'"
          >
            正常
          </button>
          <button class="badge-btn badge-error" v-else>异常</button>
        </div>

        <!-- 桥梁图片 -->
        <div class="bridge-image" v-if="bridgeData?.qltp">
          <img :src="bridgeData.qltp" alt="桥梁图片" />
        </div>

        <div class="info-grid">
          <div
            class="info-row"
            v-for="field in bridgeFields"
            :key="field.key"
          >
            <label>{{ field.label }}：</label>
            <span class="info-value">{{ formatFieldValue(field.key, bridgeData?.[field.key]) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn btn-monitoring" @click="handleShowEquipment">
          监测设备
        </button>
        <button class="action-btn btn-camera" @click="handleShowCamera">
          监控设备
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, onMounted, onBeforeUnmount, ref, inject } from "vue";
import { useVueCesium } from "vue-cesium";
import { NButton, NIcon } from "naive-ui";
import { Close } from "@vicons/ionicons5";
import BridgeMarkerIcon from "@/assets/img/bridgeModule/bridge_marker.webp";
import { getSurveillanceVideoPage } from "@/services/surveillanceVideoService";

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
  bridgeData: {
    type: Object,
    default: () => ({}),
  },
});

onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  viewer.value = readyObj.viewer;
});

const emit = defineEmits(["update:visible", "show-equipment", "show-camera"]);

// 显示监测设备弹窗
const handleShowEquipment = () => {
  emit("show-equipment");
};

// 监控设备列表
const cameraList = ref<any[]>([]);
const cameraLoading = ref(false);

// 获取监控设备列表
const handleShowCamera = async () => {
  if (!props.bridgeData?.llmc) return;
  cameraLoading.value = true;
  try {
    const result = await getSurveillanceVideoPage({
      page: '1',
      rows: '100',
      spszwz: props.bridgeData.llmc,
      sszx: 'csaqzx_ql',
    });
    cameraList.value = result?.rows || [];
    emit("show-camera", cameraList.value);
  } catch (error) {
    console.error("获取监控视频列表失败:", error);
    cameraList.value = [];
  } finally {
    cameraLoading.value = false;
  }
};

// 桥梁字段定义
const bridgeFields = [
  { key: "qlbh", label: "桥梁编号" },
  { key: "llmc", label: "桥梁名称" },
  { key: "ssdl", label: "所属道路" },
  { key: "qljg", label: "桥梁结构" },
  { key: "qllx", label: "桥梁类型" },
  { key: "qlzcd", label: "桥梁总长度" },
  { key: "qlk", label: "桥梁宽" },
  { key: "kjzh", label: "跨径组合" },
  { key: "zynl", label: "在役年限" },
  { key: "qljsgm", label: "桥梁建设规模" },
  { key: "qlyhdj", label: "桥梁养护等级" },
  { key: "ztdj", label: "状态等级" },
  { key: "sfjc", label: "是否监测" },
  { key: "yhdw", label: "养护单位" },
  { key: "jsdwmc", label: "建设单位名称" },
  { key: "jsnd", label: "建设年代" },
  { key: "sjdwmc", label: "设计单位名称" },
  { key: "jldwmc", label: "监理单位名称" },
  { key: "sgdwmc", label: "施工单位名称" },
  { key: "qswz", label: "起始位置" },
  { key: "zzwz", label: "终止位置" },
  { key: "kfsj", label: "开发时间" },
  { key: "jgrq", label: "竣工日期" },
  { key: "qljbxxms", label: "桥梁基本信息描述" },
];

// 获取桥梁类型文本
const getBridgeType = (qllx) => {
  if (!qllx) return '未知类型';

  const typeMap = {
    'qllx001': '钢构桥',
    'qllx002': '钢筋混凝土桥',
    'qllx003': '圬工桥',
    'qllx004': '其他',
  };
  return typeMap[qllx] || qllx || '未知类型';
};

// 格式化字段值
const formatFieldValue = (key: string, value: any) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  // 特殊字段格式化
  if (key === 'sfjc') {
    return value === 1 ? '是' : '否';
  }

  if (key === 'qljg') {
    const structureMap = {
      'qljglb001': '梁桥',
      'qljglb002': '拱桥',
      'qljglb003': '刚架桥',
      'qljglb004': '悬索桥',
      'qljglb005': '斜拉桥',
      'qljglb006': '组合体系桥',
    };
    return structureMap[value] || value || '—';
  }

  if (key === 'qllx') {
    return getBridgeType(value) || '—';
  }

  if (key === 'ztdj') {
    const statusMap = {
      'ztdj001': '一类',
      'ztdj002': '二类',
      'ztdj003': '三类',
      'ztdj004': '四类',
      'ztdj005': '五类',
    };
    return statusMap[value] || value || '—';
  }

  if (key === 'qlyhdj') {
    const gradeMap = {
      'yhdj001': '一级',
      'yhdj002': '二级',
      'yhdj003': '三级',
    };
    return gradeMap[value] || value || '—';
  }

  if (key === 'hysx') {
    const industryMap = {
      'qlhysx001': '公路',
      'qlhysx002': '铁路',
      'qlhysx003': '城市道路',
    };
    return industryMap[value] || value || '—';
  }

  return value || '—';
};

// 监听 bridgeData 变化，当有数据且包含经纬度时在地图上标注
watch(
  () => props.bridgeData,
  (newData) => {
    if (newData && newData.qjdxx && newData.qwdxx) {
      addMarkerToMap(newData.qjdxx, newData.qwdxx);
    }
  },
  { deep: true }
);

// 监听 visible 变化，关闭时清除标记
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
      id: "bridge-marker",
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      billboard: {
        image: BridgeMarkerIcon,
        scale: 1.0,
        scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, 0),
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
    const existingEntity = viewer.entities.getById("bridge-marker");
    if (existingEntity) {
      viewer.entities.remove(existingEntity);
    }
  } catch (error) {
    console.warn("移除已存在的标记点时出错:", error);
  }
};

// 开始位置跟踪
const startPositionTracking = () => {
  if (!viewer.value) return;
  stopPositionTracking();

  removePostRender = viewer.value.scene.postRender.addEventListener(() => {
    const entity = viewer.value.entities.getById("bridge-marker");
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
    dialogY.value = (screenPos.y ) / scaleRatio.value - 780;
  });
};

// 停止位置跟踪
const stopPositionTracking = () => {
  if (removePostRender) {
    removePostRender();
    removePostRender = null;
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

onBeforeUnmount(() => {
  stopPositionTracking();
  if (viewer.value) {
    removeExistingMarkers(viewer.value);
  }
});
</script>

<style lang="scss" scoped>
.bridge-detail-dialog {
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

      .bridge-image {
        width: 100%;
        height: 200px;
        margin-bottom: 15px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid #15779d;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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

        &.btn-monitoring {
          background: rgba(0, 60, 80, 0.6);
          border: 2px solid #0da5be;
          border-radius: 6px;

          &:hover {
            background: rgba(13, 165, 190, 0.4);
            border-color: #3fffff;
            box-shadow: 0 0 16px rgba(13, 165, 190, 0.5);
          }
        }

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
