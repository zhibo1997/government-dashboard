<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">总览</div>
    </div>
    <div class="module-content">
      <!-- 上方：统计卡片区域 -->
      <div class="stats-cards-container">
        <div class="stats-card" v-for="item in statsCards" :key="item.id"
          :class="{ active: selectedCardType === item.id }" @click="handleCardClick(item)">
          <div class="card-info" :class="item.type">
            <div class="card-value gradient-text">{{ item.value }}<span class="unit">座</span></div>
            <span class="card-label" :class="{ 'gradient-text': item.type == 'total' }">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 下方：圆环图表区域 -->
      <div class="charts-container">
        <div class="chart-item" v-for="chart in chartConfigs" :key="chart.id">
          <div class="chart-wrapper">
            <div :id="`chart-${chart.id}`" class="chart-echart"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 散点弹窗 -->
  <GasPointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :position="{ x: 0, y: 0 }"
    point-type="桥梁"
    :has-model="bridge3d.hasModel.value"
    @close="closePopup"
    @show-model="bridge3d.handleShowModel"
  />

  <!-- 三维：视频播放 -->
  <VideoPopup v-model:visible="bridge3d.showVideoPopup.value" :video-url="bridge3d.currentVideoUrl.value" :camera-name="bridge3d.currentCameraName.value" />

  <!-- 三维：监测设备详情 -->
  <EquipmentPointPopup :visible="bridge3d.equipPopupVisible.value" :equipment-data="bridge3d.equipPopupData.value" :sblx-dict-keys="['jcsblx_ql']" @close="bridge3d.equipPopupVisible.value = false" />

  <!-- 三维：桥梁模型列表 -->
  <Bridge3DList v-if="bridge3d.is3DMode.value" :active-bridge="bridge3d.activeBridgeQlbh.value" @select="bridge3d.handleBridgeSelect" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import { useVueCesium } from "vue-cesium";
import * as echarts from "echarts";
import { getBridgeCategoryStats, getBridgePageList, getBridgeDetail } from "@/services/bridgeService";
import { createChartOption, getGradientColor } from "./chartOption";
import { getWaterOverview } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
import { useGasOverviewPoints } from "@/hook/useGasOverviewPoints";
import { useBridge3DModel } from "@/hook/useBridge3DModel";
import GasPointPopup from "@/views/GasModule/components/GasPointPopup.vue";
import VideoPopup from "@/views/BridgeModule/components/map/VideoPopup.vue";
import EquipmentPointPopup from "@/components/EquipmentPointPopup.vue";
import Bridge3DList from "@/views/BridgeModule/components/Bridge3DList.vue";

defineOptions({ name: "OverviewModule" });

// ==================== 散点管理 ====================
const { init: initMapPoints, addPoints, clearPoints, setupClickHandler, dataSource, viewer } = useGasOverviewPoints();

// ==================== 弹窗状态 ====================
const popupVisible = ref(false);
const popupData = ref<any>(null);
const closePopup = () => { popupVisible.value = false; popupData.value = null; };

// ==================== 卡片/图表状态 ====================
const statsCards = ref<any[]>([]);
const chartConfigs = ref<any[]>([]);
const qlTypeMap = ref<any>({});
const selectedCardType = ref<string | null>(null);
const selectedChartType = ref<string | null>(null);

// ==================== 散点加载 ====================
const lastLoadedPoints = ref<any[]>([]);

const loadBridgePoints = async (filter?: Record<string, string>) => {
  try {
    const params: any = { page: '1', rows: '50', ...filter };
    const res = await getBridgePageList(params);
    const data = res?.rows || res || [];
    if (Array.isArray(data) && data.length > 0) {
      const points = data
        .filter((p: any) => p.qjdxx && p.qwdxx)
        .map((p: any) => ({ lsh: p.lsh, jd: p.qjdxx, wd: p.qwdxx, name: p.llmc || p.qlbh || '' }));
      lastLoadedPoints.value = points;
      if (points.length > 0) {
        addPoints(points, '桥梁', new URL('@/assets/img/points/4个专项点位/桥梁.png', import.meta.url).href);
        setupClickHandler(handlePointClick);
      }
    }
  } catch (error) {
    console.error("获取桥梁列表失败:", error);
  }
};

// ==================== 三维模型管理 ====================
const bridge3d = useBridge3DModel({
  viewer, popupData, clearPoints, closePopup, loadBridgePoints,
  onClear: () => { selectedCardType.value = null; selectedChartType.value = null; },
});

// ==================== 点击处理 ====================
const handlePointClick = async (point: any) => {
  try {
    const detail = await getBridgeDetail(point.lsh);
    popupData.value = { ...detail, _name: detail._name || point.name };
    popupVisible.value = true;
  } catch (error) {
    console.error('获取桥梁详情失败:', error);
  }
};

const handleCardClick = async (card: any) => {
  if (selectedCardType.value === card.id) {
    selectedCardType.value = null;
    clearPoints();
    closePopup();
    return;
  }
  selectedCardType.value = card.id;
  selectedChartType.value = null;
  closePopup();
  clearPoints();
  const filter = card.type === 'total' ? undefined : { Jcsslx: card.jcsslx };
  await loadBridgePoints(filter);
};

// ==================== 数据获取 ====================
const fetchBridgeData = async () => {
  try {
    const data = await getBridgeCategoryStats() as any[];
    processChartData(data);
  } catch (error) {
    console.error("获取桥梁分类统计数据失败:", error);
  }
};

const fetchCardData = async () => {
  try {
    const dictionaries = await getCachedDictionary("jcssdstjlx_ql");
    qlTypeMap.value = dictionaries.reduce((acc, cur) => { acc[cur.f_ItemValue] = cur.f_ItemName; return acc; }, {});
    const data = await getWaterOverview({ Sszx: "csaqzx_ql" }) as any[];
    processCardData(data);
  } catch (error) {
    console.error("获取卡片数据失败:", error);
  }
};

const processCardData = (data: any[]) => {
  data = [...data].sort((a, b) => {
    if (a.jcsslx === 'jcssdstj0601') return -1;
    if (b.jcsslx === 'jcssdstj0601') return 1;
    return 0;
  });
  statsCards.value = data.map((item, index) => ({
    id: index + 1,
    value: item.jcsstjsl || 0,
    label: qlTypeMap.value[item.jcsslx] || item.jcsslx,
    type: getTypeByCode(item.jcsslx),
  }));
};

const getTypeByCode = (code: string) => {
  const typeMap: Record<string, string> = {
    "jcssdstj0601": "total", "jcssdstj0602": "large", "jcssdstj0603": "overpass", "jcssdstj0604": "culvert",
  };
  return typeMap[code] || "default";
};

const processChartData = (data: any[]) => {
  const grouped = data.reduce((acc, item) => {
    const existing = acc.find((g) => g.category === item.category);
    if (existing) { existing.items.push(item); } else { acc.push({ category: item.category, items: [item] }); }
    return acc;
  }, []);
  chartConfigs.value = grouped.slice(0, 3).map((group, index) => ({
    id: index,
    title: group.category,
    data: group.items,
    legendData: group.items.map((item: any, dataIndex: number) => ({
      name: item.type, value: item.number, color: getGradientColor(index, dataIndex),
    })),
  }));
};

// ==================== 图表渲染 ====================
const chartInstances: Record<number, echarts.ECharts> = {};

const legendFilterMap: Record<string, string> = {
  '梁式桥': 'qljglb001', '拱式桥': 'qljglb002', '悬索桥': 'qljglb003', '斜拉桥': 'qljglb004',
  '刚构桥': 'qljglb005', '组合体系桥': 'qljglb006',
  'I 等养护': 'qlyhdj001', 'II 等养护': 'qlyhdj002', 'III 等养护': 'qlyhdj003',
  'IV 等养护': 'qlyhdj004', 'V 等养护': 'qlyhdj005',
  'I 级': 'qlyhdj006', 'II 级': 'qlyhdj007', 'III 级': 'qlyhdj008',
};

const renderCharts = () => {
  chartConfigs.value.forEach((chart, chartIndex) => {
    const chartDom = document.getElementById(`chart-${chart.id}`);
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    chartInstances[chart.id] = myChart;
    myChart.setOption(createChartOption(chart, chartIndex));
    myChart.on('legendselectchanged', async (params: any) => {
      myChart.dispatchAction({ type: 'legendAllSelect' });
      const filter = legendFilterMap[params.name];
      if (filter) {
        clearPoints();
        closePopup();
        selectedCardType.value = null;
        await loadBridgePoints({ Qljg: filter });
      }
    });
  });
};

// ==================== 生命周期 ====================
const $vc = useVueCesium();

onMounted(async () => {
  const readyObj = await $vc.creatingPromise;
  await initMapPoints(readyObj.viewer);

  bridge3d.registerCallbacks();

  await fetchCardData();
  await fetchBridgeData();
  await nextTick();
  renderCharts();
});

onBeforeUnmount(() => {
  bridge3d.unregisterCallbacks();
});
</script>

<style lang="scss" scoped>
.overview-module {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.stats-cards-container {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  flex: 0 0 auto;
}

.stats-card {
  flex: 1;
  display: flex;
  gap: 20px;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 2px transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(13, 165, 190, 0.1);
    box-shadow: inset 0 0 0 2px rgba(13, 165, 190, 0.3);
  }

  &.active {
    background: rgba(13, 165, 190, 0.2);
    box-shadow: inset 0 0 0 2px #0da5be, 0 0 12px rgba(13, 165, 190, 0.3);
  }

  .card-info {
    width: 153.2px;
    height: 96px;
    background-size: 100% 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .card-value {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-subtitle);
      color: #FFFFFF;
      line-height: 42px;
      text-align: center;
    }

    .unit {
      font-size: var(--font-size-body);
      color: #F5FCFF;
      line-height: 21px;
      margin-left: 6px;
    }

    .card-label {
      position: relative;
      text-align: center;
      top: 20px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 500;
      font-size: var(--font-size-subtitle);
      color: #EFFAFF;
      line-height: 35px;
    }

    &.total {
      width: 191.5px;
      height: 120px;
      background-image: url("@/assets/img/bridgeModule/total_bridges.webp");
      .card-value { font-size: var(--font-size-title); line-height: 52px; background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%); }
      .unit { font-size: var(--font-size-heading); line-height: 26px; }
      .card-label { font-size: var(--font-size-title); font-weight: var(--font-weight-bold); line-height: 42px; background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%); }
    }

    &.large { background-image: url("@/assets/img/bridgeModule/large_bridges.webp"); .card-value { background: linear-gradient(90deg, #FFFFFF 0%, #FEC854 100%); } }
    &.overpass { background-image: url("@/assets/img/bridgeModule/interchanges.webp"); .card-value { background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%); } }
    &.culvert { background-image: url("@/assets/img/bridgeModule/culverts.webp"); .card-value { background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%); } }
  }
}

.charts-container {
  flex: 1;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: stretch;
}

.chart-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 33.3%;
  .chart-echart { width: 100%; height: 100%; }
}
</style>
