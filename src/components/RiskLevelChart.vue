<template>
  <div class="risk-chart-container">
    <div :id="chartId" class="risk-echart"></div>
    <div class="risk-legend">
      <div class="legend-item" v-for="item in riskLegend" :key="item.name">
        <div class="legend-name">
          <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
          {{ item.name }}
        </div>
        <div class="legend-value gradient-text">
          {{ item.value }}
          <span class="unit">个</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, onBeforeUnmount } from "vue";
import { getRiskLevelCount } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
import * as echarts from "echarts";

// ==================== Props 定义 ====================
interface Props {
  /** 图表容器唯一ID */
  chartId?: string;
  /** 城市安全中心标识（Sszx 参数） */
  sszx?: string;
  /** 管理目标类型（Glmblx 参数，与 sszx 二选一） */
  glmblx?: string;
}

const props = withDefaults(defineProps<Props>(), {
  chartId: "risk-chart",
  sszx: "",
  glmblx: "",
});

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  (e: "dataLoaded", data: any[]): void;
}>();

// ==================== 颜色配置 ====================
const riskColorMap: Record<string, string> = {
  重大风险: "#E88D6B",
  较大风险: "#F4D982",
  一般风险: "#61E29D",
  低风险: "#9bb8c7",
};

// ==================== 数据状态 ====================
const riskLegend = ref<any[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
let chartInstance: echarts.ECharts | null = null;

/**
 * 获取默认的风险等级数据
 * 当没有实际数据时，展示空状态
 */
const getDefaultRiskLevels = () => [
  { name: "重大风险", color: riskColorMap["重大风险"], value: 0 },
  { name: "较大风险", color: riskColorMap["较大风险"], value: 0 },
  { name: "一般风险", color: riskColorMap["一般风险"], value: 0 },
  { name: "低风险", color: riskColorMap["低风险"], value: 0 },
];

// ==================== 风险等级数据获取 ====================
/**
 * 获取风险等级字典映射
 * 字典类型: fxdj
 */
const fetchRiskLevelDictionary = async (): Promise<{ [key: string]: { name: string; color: string } } | null> => {
  try {
    const dictionaries = await getCachedDictionary("fxdj");
    if (!dictionaries || dictionaries.length === 0) {
      console.warn("风险等级字典 (fxdj) 为空");
      return null;
    }
    
    const map: { [key: string]: { name: string; color: string } } = {};
    dictionaries.forEach((item: any) => {
      map[item.f_ItemValue] = {
        name: item.f_ItemName,
        color: riskColorMap[item.f_ItemName] || "#9bb8c7",
      };
    });
    return map;
  } catch (err) {
    error.value = `获取风险等级字典失败: ${err}`;
    console.error(error.value);
    return null;
  }
};

/**
 * 获取风险等级数据
 * 根据 props 参数决定使用 Sszx 或 Glmblx 参数
 */
const fetchRiskLevelData = async (): Promise<void> => {
  // 检查必要参数
  if (!props.sszx && !props.glmblx) {
    console.warn("Sszx 或 Glmblx 参数未提供，使用默认数据");
    riskLegend.value = getDefaultRiskLevels();
    emit("dataLoaded", riskLegend.value);
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const riskLevelMap = await fetchRiskLevelDictionary();
    console.info("🚀 ~ fetchRiskLevelData ~ riskLevelMap:", riskLevelMap)
    if (!riskLevelMap) {
      riskLegend.value = getDefaultRiskLevels();
      emit("dataLoaded", riskLegend.value);
      return;
    }

    // 构建请求参数：优先使用 Sszx，否则使用 Glmblx
    const params: Record<string, string> = {};
    if (props.sszx) {
      params.Sszx = props.sszx;
    } else if (props.glmblx) {
      params.Glmblx = props.glmblx;
    }
    console.info("🚀 RiskLevelChart ~ props:", { sszx: props.sszx, glmblx: props.glmblx }, "params:", params);

    const data = (await getRiskLevelCount(params)) as any[];
    console.info("🚀 RiskLevelChart ~ getRiskLevelCount response:", JSON.stringify(data))
    if (!data || data.length === 0) {
      console.info("风险等级数据为空");
      riskLegend.value = getDefaultRiskLevels();
      emit("dataLoaded", riskLegend.value);
      return;
    }

    // 转换数据格式
    riskLegend.value = data.map((item) => ({
      name: riskLevelMap[item.riskType]?.name || item.riskType,
      color: riskLevelMap[item.riskType]?.color || "#FFFFFF",
      value: item.count || 0,
    }));
    console.info("🚀 RiskLevelChart ~ riskLegend:", JSON.stringify(riskLegend.value));

    emit("dataLoaded", riskLegend.value);
  } catch (err) {
    error.value = `获取风险等级数据失败: ${err}`;
    console.error(error.value);
    riskLegend.value = getDefaultRiskLevels();
    emit("dataLoaded", riskLegend.value);
  } finally {
    isLoading.value = false;
  }
};

// ==================== 图表配置 ====================
/**
 * 环形图占位样式（背景环）
 */
const getPlaceHolderStyle = () => ({
  label: { show: false },
  labelLine: { show: false },
  itemStyle: {
    color: "rgba(29, 57, 64, 0.5)",
    borderColor: "rgba(29, 57, 64, 0.8)",
    borderWidth: 8,
  },
  emphasis: { disabled: true },
});

/**
 * 生成风险等级多环形图的标签样式
 */
const createLabelStyle = (color: string, lineLength = 100) => ({
  label: { show: false },
  labelLine: {
    show: true,
    length: lineLength,
    smooth: 0.5,
    lineStyle: { color: "rgba(211, 234, 241, 0.3)" },
  },
  itemStyle: {
    borderWidth: 8,
    shadowBlur: 20,
    borderColor: color,
    shadowColor: color,
  },
});

/**
 * 根据是否有数据生成标签样式
 */
const createDataLabelStyle = (hasData: boolean, color: string, lineLength = 100) => {
  if (!hasData) {
    return getPlaceHolderStyle();
  }
  return createLabelStyle(color, lineLength);
};

/**
 * 生成风险等级多环形图的 ECharts 配置
 */
const createRiskLevelChartOption = (riskLegendData: any[]): echarts.EChartsOption => {
  const placeHolderStyle = getPlaceHolderStyle();

  const radiusMap = [
    [118, 120],
    [98, 100],
    [78, 80],
    [58, 60],
  ];
  const lineLengthMap = [40, 50, 60, 70];

  // 动态计算最大值，确保环形图能正确显示比例
  const maxValue = Math.max(...riskLegendData.map((item) => item.value), 1) * 1.5;

  const dataSeries = riskLegendData.map((risk, index) => {
    const hasData = risk.value > 0;

    return {
      name: risk.name,
      type: "pie" as const,
      clockWise: false,
      hoverAnimation: hasData,
      radius: radiusMap[index],
      ...createDataLabelStyle(hasData, risk.color, lineLengthMap[index]),
      data: [
        { value: risk.value, name: risk.name },
        { value: maxValue - risk.value, name: "", ...placeHolderStyle },
      ],
    };
  });

  return {
    backgroundColor: "transparent",
    color: ["#9bb8c7", "#61E29D", "#F4D982", "#E88D6B"],
    legend: { show: false },
    series: dataSeries as any,
  };
};

// ==================== 图表渲染 ====================
/**
 * 初始化图表实例
 */
const initChart = (): echarts.ECharts | null => {
  const chartDom = document.getElementById(props.chartId);
  if (!chartDom) {
    console.warn("🚀 RiskLevelChart ~ chartDom not found:", props.chartId);
    return null;
  }
  console.info("🚀 RiskLevelChart ~ chartDom size:", chartDom.offsetWidth, "x", chartDom.offsetHeight);
  
  // 如果已存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartDom);
  return chartInstance;
};

/**
 * 渲染风险等级多环形图
 */
const renderChart = () => {
  const chart = initChart();
  if (!chart) return;

  const option = createRiskLevelChartOption(riskLegend.value);
  chart.setOption(option);
};

// ==================== 暴露方法供父组件调用 ====================
/**
 * 刷新数据和图表
 */
const refresh = async () => {
  await fetchRiskLevelData();
  await nextTick();
  renderChart();
};

defineExpose({
  refresh,
  riskLegend,
});

// ==================== 生命周期 ====================
onMounted(async () => {
  await fetchRiskLevelData();
  await nextTick();
  renderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// 监听参数变化，重新获取数据
watch(
  () => [props.sszx, props.glmblx],
  async () => {
    await refresh();
  }
);
</script>

<style lang="scss" scoped>
.risk-chart-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;

  .risk-echart {
    width: 50%;
    min-width: 200px;
    height: 250px;
  }

  .risk-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 24px;
    padding: 0 10px;

    .legend-item {
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(29, 57, 64, 0.6);
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgba(29, 57, 64, 0.8);
      }

      .legend-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 40px;
        color: #d3eaf1;
        display: flex;
        align-items: center;

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 12px;
          display: inline-block;
        }
      }

      .legend-value {
        font-family: YouSheBiaoTiHei;
        font-size: 40px;
        color: #ffffff;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);

        .unit {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 14px;
          color: #d3eaf1;
          margin-left: 5px;
          background: transparent !important;
        }
      }
    }
  }
}
</style>
