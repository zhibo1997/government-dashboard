<template>
  <div class="equipment-detail-dialog" v-show="visible && isEntityVisible" :style="dialogStyle">
    <div class="dialog-header">
      <div class="dialog-title">{{ equipmentData?.sbmc || "设备详情" }}</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" />
      </n-button>
    </div>

    <div class="dialog-content">
      <div class="info-section">
        <!-- 基本信息 -->
        <div class="status-badge-row">
          <button class="badge-btn badge-type">{{ sblxName }}</button>
          <button class="badge-btn badge-normal" v-if="equipmentData?.sbyxzt === 'sbyxzt001'">
            正常
          </button>
          <button class="badge-btn badge-error" v-else>异常</button>
        </div>

        <div class="info-grid">
          <div class="info-row">
            <label>设备编号：</label>
            <span class="info-value">{{ equipmentData?.sbbh || '—' }}</span>
          </div>
          <div class="info-row" v-if="latestRecord">
            <label>监测时间：</label>
            <span class="info-value">{{ formatTime(latestRecord.jcsj) }}</span>
          </div>
        </div>

        <!-- 最新监测数据 -->
        <div class="monitor-data-section" v-if="monitorValues.length > 0">
          <div class="monitor-title">最新监测数据</div>
          <div class="monitor-grid">
            <div class="monitor-item" v-for="(item, index) in monitorValues" :key="index">
              <div class="monitor-value">{{ item.value }}<span class="monitor-unit">{{ item.unit }}</span></div>
              <div class="monitor-label">{{ item.name }}</div>
            </div>
          </div>
        </div>

        <!-- 实时数据折线图 -->
        <div class="chart-section" v-if="monitorRecords.length > 1">
          <div class="monitor-title">实时数据趋势</div>
          <div ref="lineChartRef" class="line-chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount, ref, inject, nextTick } from "vue";
import { useVueCesium } from "vue-cesium";
import { NButton, NIcon } from "naive-ui";
import { Close } from "@vicons/ionicons5";
import { getEquipmentData } from "@/services/gasService";
import { getCachedDictionary } from "@/services/dictionaryService";
import dayjs from "dayjs";
import * as echarts from "echarts";

const viewer = ref<Cesium.Viewer | null>(null);

// 位置跟踪
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
  equipmentData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible"]);

// 图表引用
const lineChartRef = ref<HTMLDivElement | null>(null);
let lineChartInstance: echarts.ECharts | null = null;

// 设备类型字典
const sblxDictMap = ref<Record<string, string>>({});
const sblxName = computed(() => {
  return sblxDictMap.value[props.equipmentData?.sblx] || props.equipmentData?.sblx || '未知设备';
});

// 监测指标字典
const jczbDictMap = ref<Record<string, { name: string; unit: string }>>({});

// 监测数据记录
const monitorRecords = ref<any[]>([]);
const latestRecord = computed(() => monitorRecords.value[0] || null);

// 解析监测值
const monitorValues = computed(() => {
  if (!latestRecord.value?.jcz) return [];
  try {
    const jcz = JSON.parse(latestRecord.value.jcz);
    return Object.entries(jcz).map(([key, val]: [string, any]) => ({
      key,
      name: jczbDictMap.value[key]?.name || key,
      value: val.jcz || '—',
      unit: val.jcdw || '',
    }));
  } catch {
    return [];
  }
});

const formatTime = (ts: number) => {
  if (!ts) return '—';
  return dayjs(ts).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  viewer.value = readyObj.viewer;

  // 加载字典
  try {
    const [rqDict, rqzdyhDict, jczbDict] = await Promise.all([
      getCachedDictionary("jcsblx_rq"),
      getCachedDictionary("jcsblx_rqzdyh"),
      getCachedDictionary("jczbzd"),
    ]);
    const allSblx = [...(rqDict || []), ...(rqzdyhDict || [])];
    sblxDictMap.value = allSblx.reduce((acc: Record<string, string>, cur: any) => {
      acc[cur.f_ItemValue] = cur.f_ItemName;
      return acc;
    }, {});
    if (jczbDict && jczbDict.length > 0) {
      jczbDictMap.value = jczbDict.reduce((acc: Record<string, any>, cur: any) => {
        acc[cur.f_ItemValue] = { name: cur.f_ItemName, unit: cur.f_Description || '' };
        return acc;
      }, {} as any);
    }
  } catch (error) {
    console.error("加载字典失败:", error);
  }
});

// 监听设备数据变化
watch(
  () => props.equipmentData,
  async (newData) => {
    if (!newData) return;

    // 定位到地图
    const pointInfo = newData.pointInfo;
    if (pointInfo?.jd && pointInfo?.wd) {
      addMarkerToMap(pointInfo.jd, pointInfo.wd);
    }

    // 获取监测数据 - 兼容 dwbm 和 gldwbh 两种字段名
    const dwbh = newData.dwbm || newData.gldwbh || '';
    const sbbh = newData.sbbh || '';
    const sblx = newData.sblx || '';
    if (dwbh && sbbh && sblx) {
      try {
        const data = await getEquipmentData({
          gldwbh: dwbh,
          sbbh: sbbh,
          sblx: sblx,
          number: 20,
        });
        monitorRecords.value = data || [];
        // 渲染折线图
        if (data && data.length > 1) {
          nextTick(() => {
            initLineChart(data);
          });
        }
      } catch (error) {
        console.error("获取设备监测数据失败:", error);
        monitorRecords.value = [];
      }
    }
  },
  { deep: true }
);

// 初始化折线图
const initLineChart = (rawData: any[]) => {
  if (!lineChartRef.value || !Array.isArray(rawData) || rawData.length === 0) return;

  // 清理旧图表
  if (lineChartInstance) {
    lineChartInstance.dispose();
    lineChartInstance = null;
  }

  const chartInstance = echarts.init(lineChartRef.value);
  lineChartInstance = chartInstance;

  // 处理数据
  const processedData = rawData.map((item) => {
    let jczData = {};
    try {
      jczData = JSON.parse(item.jcz);
    } catch (e) {
      // ignore
    }
    return {
      jcsj: item.jcsj,
      jcz: jczData,
    };
  });

  // 提取指标名称和数据
  const indicators: string[] = [];
  const seriesData: Record<string, { timestamp: number; value: number }[]> = {};

  if (processedData.length > 0 && Object.keys(processedData[0].jcz).length > 0) {
    Object.keys(processedData[0].jcz).forEach((key) => {
      const indicatorName = jczbDictMap.value[key]?.name || key;
      indicators.push(indicatorName);
      seriesData[key] = [];
    });
  }

  // 处理数据
  processedData.forEach((item) => {
    Object.keys(item.jcz).forEach((key) => {
      if (seriesData[key]) {
        seriesData[key].push({
          timestamp: item.jcsj,
          value: parseFloat((item.jcz as any)[key]?.jcz) || 0,
        });
      }
    });
  });

  // x轴时间
  const xData = processedData.map((item) => dayjs(item.jcsj).format('HH:mm'));

  // 系列数据
  const series = Object.keys(seriesData).map((key, index) => {
    const indicatorName = indicators[index] || key;
    return {
      name: indicatorName,
      type: "line" as const,
      data: seriesData[key].map((item) => item.value),
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
    };
  });

  // 单位
  let unit = "";
  const firstJcz = Object.values(processedData[0]?.jcz || {})[0];
  if (firstJcz && typeof firstJcz === "object" && firstJcz !== null) {
    unit = (firstJcz as any).jcdw || "";
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0, 20, 40, 0.9)",
      borderColor: "rgba(13, 165, 190, 0.5)",
      textStyle: { color: "#e4f3ff", fontSize: 14 },
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let html = `<div style="margin-bottom:4px;color:#9ec3e8">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          html += `<div style="display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            ${p.seriesName}: <b>${p.value}</b> ${unit}
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: indicators,
      top: 0,
      textStyle: { color: "#9ec3e8", fontSize: 13 },
      itemWidth: 16,
      itemHeight: 8,
    },
    grid: {
      left: 44,
      right: 16,
      top: 30,
      bottom: 28,
    },
    xAxis: {
      type: "category",
      data: xData,
      axisLabel: {
        color: "#9ec3e8",
        fontSize: 12,
        interval: Math.floor(xData.length / 6),
      },
      axisLine: { lineStyle: { color: "rgba(13, 165, 190, 0.3)" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#9ec3e8",
        fontSize: 12,
      },
      splitLine: {
        lineStyle: { color: "rgba(13, 165, 190, 0.15)" },
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series,
  };

  chartInstance.setOption(option);
};

// 开始位置跟踪 - 仿造 StationDetailDialog
const startPositionTracking = () => {
  if (!viewer.value) return;
  stopPositionTracking();

  removePostRender = viewer.value.scene.postRender.addEventListener(() => {
    const entity = viewer.value!.entities.getById("equipment-marker");
    if (!entity?.position) return;

    const position = entity.position.getValue(viewer.value!.clock.currentTime);
    if (!position) return;

    // @ts-ignore - Cesium API exists at runtime
    const screenPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.value!.scene,
      position
    );

    if (!screenPos) {
      isEntityVisible.value = false;
      return;
    }

    isEntityVisible.value = true;
    // 完全仿造 StationDetailDialog 的定位方式
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

// 在地图上添加标记点 - 仿造 StationDetailDialog
const addMarkerToMap = (longitude: number, latitude: number) => {
  try {
    if (!viewer.value) return;
    removeExistingMarkers();

    const entity = viewer.value.entities.add({
      id: "equipment-marker",
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString("#00ffff"),
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
    const existing = viewer.value.entities.getById("equipment-marker");
    if (existing) viewer.value.entities.remove(existing);
  } catch (error) {
    console.warn("移除标记点失败:", error);
  }
};

const handleClose = () => {
  stopPositionTracking();
  removeExistingMarkers();
  monitorRecords.value = [];
  // 清理图表
  if (lineChartInstance) {
    lineChartInstance.dispose();
    lineChartInstance = null;
  }
  emit("update:visible", false);
};

onBeforeUnmount(() => {
  stopPositionTracking();
  removeExistingMarkers();
  if (lineChartInstance) {
    lineChartInstance.dispose();
    lineChartInstance = null;
  }
});
</script>

<style lang="scss" scoped>
.equipment-detail-dialog {
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
      font-size: var(--font-size-2xl);
      color: #e4f3ff;
      line-height: calc(var(--font-size-2xl) * 1.464);
    }
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 24px 20px;
    max-height: 800px;
    background: linear-gradient(270deg, #021F37 0%, #02111D 99.92%);
    box-shadow: -34px 0px 17px 0px rgba(4, 17, 38, 0.4), 34px 9px 17px 0px rgba(4, 17, 38, 0.4);
    border: 2px solid;
    border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(12, 93, 117, 0.24), rgba(8, 189, 243, 0.04), rgba(0, 28, 38, 0), rgba(8, 97, 132, 0), rgba(17, 171, 233, 1)) 2 2;
    backdrop-filter: blur(20px);

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
    }

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
          font-size: var(--font-size-lg);
          line-height: calc(var(--font-size-lg) * 1.4);

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
          font-size: var(--font-size-3xl);
          line-height: calc(var(--font-size-3xl) * 1.4);
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

      .monitor-data-section {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid rgba(13, 165, 190, 0.3);

        .monitor-title {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-xl);
          color: #10adc0;
          margin-bottom: 12px;
        }

        .monitor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;

          .monitor-item {
            background: rgba(0, 30, 45, 0.6);
            border: 1px solid rgba(13, 165, 190, 0.2);
            border-radius: 8px;
            padding: 12px;
            text-align: center;

            .monitor-value {
              font-family: YouSheBiaoTiHei;
              font-size: var(--font-size-3xl);
              color: #10adc0;
              background: transparent;
              line-height: 1.2;

              .monitor-unit {
                font-family: SourceHanSansSC, SourceHanSansSC;
                font-size: var(--font-size-sm);
                color: #6ba8c4;
                margin-left: 4px;
                background: transparent;
              }
            }

            .monitor-label {
              font-family: SourceHanSansSC, SourceHanSansSC;
              font-size: var(--font-size-lg);
              color: #6ba8c4;
              margin-top: 6px;
            }
          }
        }
      }

      .chart-section {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid rgba(13, 165, 190, 0.3);

        .monitor-title {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-xl);
          color: #10adc0;
          margin-bottom: 12px;
        }

        .line-chart {
          width: 100%;
          height: 300px;
        }
      }
    }
  }
}
</style>
