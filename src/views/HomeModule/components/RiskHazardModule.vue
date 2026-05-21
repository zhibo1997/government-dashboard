<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险点</div>
    </div>
    <div class="module-content">
      <!-- 风险等级统计 -->
      <div class="chart-section">
        <div class="section-header">
          <div class="header-title-wrapper">
            <img src="@/assets/img/homeModule/risk_icon.webp" class="header-icon" alt="风险图标" />
            <span class="header-title gradient-text">风险</span>
          </div>
        </div>
        <div class="chart-container">
          <div id="risk-chart" class="echart"></div>
        </div>
      </div>

      <!-- 隐患等级统计 -->
      <div class="chart-section">
        <div class="section-header">
          <div class="header-title-wrapper">
            <img src="@/assets/img/homeModule/hazard_icon.webp" class="header-icon" alt="隐患图标" />
            <span class="header-title gradient-text">隐患</span>
          </div>
        </div>
        <div class="chart-container">
          <div id="hazard-chart" class="echart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { getRiskLevelCountList, getHazardLevelCountList } from "@/services/statusService";
import { getCachedDictionary } from "@/services/dictionaryService";
import { getRiskChartOption, getHazardChartOption, SeriesData, LevelMapping } from "./chartOptions";

// 数据类型定义
interface ChartDataItem {
  sszx: string;
  fxdj?: string;
  yhdj?: string;
  number: number;
}

interface StatsData {
  gas: number;
  bridge: number;
  water: number;
  drainage: number;
}

// 图表类型配置
interface ChartConfig {
  id: string;
  dictKey: string;
  dataField: 'fxdj' | 'yhdj';
  colorMapping: Record<string, string>;
  fetchDataFn: () => Promise<any>;
  getOptionFn: (xAxisData: string[], levelMapping: LevelMapping, series: SeriesData[]) => any;
}

// 专项映射
const sszxMapping: Record<string, { name: string; order: number }> = {
  csaqzx_rq: { name: "燃气", order: 0 },
  csaqzx_ql: { name: "桥梁", order: 1 },
  csaqzx_gs: { name: "供水", order: 2 },
  csaqzx_ps: { name: "排水", order: 3 },
};

// 风险等级颜色映射
const riskColorMapping: Record<string, string> = {
  低风险: "#3C7CF8",
  一般风险: "#FBDB4D",
  较大风险: "#FE9637",
  重大风险: "#FF4D4F",
};

// 隐患等级颜色映射
const hazardColorMapping: Record<string, string> = {
  一般隐患: "#3C7CF8",
  较大隐患: "#FBDB4D",
  重大隐患: "#FF4D4F",
};

// 统计数据（已移除，不再需要）
// const riskStats = ref<StatsData>({
//   gas: 0,
//   bridge: 0,
//   water: 0,
//   drainage: 0,
// });
// 
// const hazardStats = ref<StatsData>({
//   gas: 0,
//   bridge: 0,
//   water: 0,
//   drainage: 0,
// });

// ECharts 实例
let riskChart: echarts.ECharts | null = null;
let hazardChart: echarts.ECharts | null = null;

/**
 * 初始化 ECharts 图表
 */
const initChart = (domId: string): echarts.ECharts | null => {
  const chartDom = document.getElementById(domId);
  if (!chartDom) {
    console.warn(`找不到图表容器: ${domId}`);
    return null;
  }
  return echarts.init(chartDom);
};

/**
 * 通用字典获取函数
 * @param dictKey 字典键值
 * @param colorMapping 颜色映射表
 * @returns 等级映射对象
 */
const fetchLevelDict = async (
  dictKey: string,
  colorMapping: Record<string, string>
): Promise<LevelMapping> => {
  try {
    const dictData = await getCachedDictionary(dictKey);
    const mapping: LevelMapping = {};

    if (dictData && dictData.length > 0) {
      dictData.forEach((item: any, index: number) => {
        const name = item.f_ItemName;
        mapping[item.f_ItemValue] = {
          name: name,
          key: item.f_ItemValue,
          color: colorMapping[name] || "#999",
          order: index,
        };
      });
    }

    return mapping;
  } catch (error) {
    console.error(`获取字典 ${dictKey} 失败:`, error);
    return {};
  }
};

/**
 * 计算统计数据
 * @param data 原始数据
 * @returns 统计结果
 */
const calculateStats = (data: ChartDataItem[]): StatsData => {
  const statsMap: Record<string, number> = {
    csaqzx_rq: 0,
    csaqzx_ql: 0,
    csaqzx_gs: 0,
    csaqzx_ps: 0,
  };

  data.forEach((item) => {
    if (statsMap[item.sszx] !== undefined) {
      statsMap[item.sszx] += item.number || 0;
    }
  });

  return {
    gas: statsMap.csaqzx_rq,
    bridge: statsMap.csaqzx_ql,
    water: statsMap.csaqzx_gs,
    drainage: statsMap.csaqzx_ps,
  };
};

/**
 * 构建图表系列数据
 * @param data 原始数据
 * @param levelMapping 等级映射
 * @param dataField 数据字段名
 * @returns 系列数据和X轴数据
 */
const buildChartSeries = (
  data: ChartDataItem[],
  levelMapping: LevelMapping,
  dataField: 'fxdj' | 'yhdj'
) => {
  // 按 sszx 分组数据
  const groupedData: Record<string, Record<string, number>> = {};

  data.forEach((item) => {
    if (!groupedData[item.sszx]) {
      groupedData[item.sszx] = {};
    }
    const levelKey = item[dataField];
    if (levelKey) {
      groupedData[item.sszx][levelKey] = item.number;
    }
  });

  // 构建 x 轴数据（按顺序排列）
  const xAxisData = Object.keys(sszxMapping)
    .sort((a, b) => sszxMapping[a].order - sszxMapping[b].order)
    .map((key) => sszxMapping[key].name);

  // 构建系列数据
  const levelKeys = Object.keys(levelMapping).sort(
    (a, b) => levelMapping[a].order - levelMapping[b].order
  );
  
  const series: SeriesData[] = levelKeys.map((levelKey) => {
    const levelInfo = levelMapping[levelKey];
    const seriesData = Object.keys(sszxMapping)
      .sort((a, b) => sszxMapping[a].order - sszxMapping[b].order)
      .map((sszxKey) => groupedData[sszxKey]?.[levelKey] || 0);
  
    return {
      name: levelInfo.name,
      type: "bar",
      data: seriesData,
      itemStyle: {
        color: levelInfo.color,
      },
    };
  });

  return { xAxisData, series };
};

/**
 * 通用图表渲染函数
 * @param config 图表配置
 * @param chart ECharts 实例
 */
const renderChart = async (config: ChartConfig, chart: echarts.ECharts | null) => {
  if (!chart) return;

  try {
    const data: any = await config.fetchDataFn();
    const levelMapping = await fetchLevelDict(config.dictKey, config.colorMapping);

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`${config.dictKey} 数据为空`);
      return;
    }

    // 移除统计数据计算（不再需要显示统计信息）
    // config.statsRef.value = calculateStats(data);

    // 构建图表数据
    const { xAxisData, series } = buildChartSeries(data, levelMapping, config.dataField);

    // 渲染图表
    const option = config.getOptionFn(xAxisData, levelMapping, series);
    chart.setOption(option);
  } catch (error) {
    console.error(`渲染 ${config.dictKey} 图表失败:`, error);
  }
};

/**
 * 组件挂载
 */
onMounted(async () => {
  await nextTick();

  // 初始化图表
  riskChart = initChart("risk-chart");
  hazardChart = initChart("hazard-chart");

  // 风险等级图表配置
  const riskConfig: ChartConfig = {
    id: 'risk-chart',
    dictKey: 'fxdj',
    dataField: 'fxdj',
    colorMapping: riskColorMapping,
    fetchDataFn: getRiskLevelCountList,
    getOptionFn: getRiskChartOption,
  };
  
  // 隐患等级图表配置
  const hazardConfig: ChartConfig = {
    id: 'hazard-chart',
    dictKey: 'yhdj',
    dataField: 'yhdj',
    colorMapping: hazardColorMapping,
    fetchDataFn: getHazardLevelCountList,
    getOptionFn: getHazardChartOption,
  };

  // 并行渲染两个图表
  await Promise.allSettled([
    renderChart(riskConfig, riskChart),
    renderChart(hazardConfig, hazardChart),
  ]);
});
</script>

<style lang="scss" scoped>
.risk-hazard-module {
  flex: 0 0 calc(66.667% - 8px);
  overflow: hidden;
  background-image: url('@/assets/img/homeModule/module_double_bg.webp');

  .module-content {
    display: flex;
    flex-direction: column;
  }

  .chart-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(13, 35, 42, 0.6);
    border-radius: 4px;

    .header-title-wrapper {
      display: flex;
      align-items: center;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      width: 100%;
      height: 70px;
      background-size: 100% 100%;
      padding: 0 20px;
      background-image: url('@/assets/img/homeModule/risk_hazard_head_bg.webp');

      .header-icon {
        width: 40px;
        height: 40px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        flex-shrink: 0;
      }

      .header-title {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-title);
        color: #FFFFFF;
        line-height: 59px;
        text-align: left;
        font-style: normal;
        background: linear-gradient(0deg, #F75E04 0%, #FEAC04 100%);
      }

      /* header-stats 样式已移除 */
    }

    .chart-container {
      flex: 1;
      min-height: 0;

      .echart {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
