<template>
  <div class="data-module monitoring-early-warning-module">
    <div class="module-header">
      <div class="module-title">监测预警</div>
    </div>
    <div class="module-content">
      <div class="status-counts">
        <!-- 上方区域：预警处置统计信息 -->
        <div class="status-section">
          <!-- 左侧预警总数 -->
          <div class="total-warnings">
            <div class="total-value">
              <span class="gradient-text">{{ totalWarnings }}</span>
            </div>
            <div class="total-label">预警总数</div>
          </div>

          <!-- 中间环形图占位 -->
          <div class="donut-chart-placeholder"></div>

        </div>
        <!-- 底部图表区域 -->
        <div class="chart-section">
          <div id="monitoring-early-warning-chart" class="echart"></div>
        </div>
      </div>
      <!-- 预警处置表格 -->
      <div class="table">
        <div class="content-header">
          <span class="table-title gradient-text">预警处置</span>
        </div>
        <!-- 企业列表表头 -->
        <div class="disposal-header">
          <div class="header-col" v-for="column in currentTable.columns" :key="column.key">
            {{ column.label }}</div>
        </div>

        <!-- 企业列表 -->
        <div class="disposal-list">
          <div class="disposal-row" v-for="enterprise in currentTable.data" :key="enterprise.id">
            <div class="row-col" v-for="column in currentTable.columns" :key="column.key">
              {{ enterprise[column.key as keyof EnterpriseData] }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { getEarlyWarningDisposalCountList } from "@/services/statusService";
import { getCachedDictionary } from "@/services/dictionaryService";
import { getMonitoringEarlyWarningChartOption, SeriesData, LevelMapping, createCustomVerticalGradient } from "./chartOptions";

// 数据类型定义
interface EarlyWarningDataItem {
  sszx: string;  // 数据中心标识
  czzt: string;  // 处置状态标识
  number: number; // 预警数量
}

// 专项映射
const sszxMapping: Record<string, { name: string; order: number }> = {
  csaqzx_rq: { name: "燃气", order: 0 },
  csaqzx_ql: { name: "桥梁", order: 1 },
  csaqzx_gs: { name: "供水", order: 2 },
  csaqzx_ps: { name: "排水", order: 3 },
};

// 处置状态颜色映射（根据设计图配置渐变色）
const statusColorMapping: Record<string, { start: string; end: string; display: string }> = {
  "未处置": {
    start: "#FF2C20",
    end: "rgba(254,172,4,0)",
    display: "#FF2C20"
  },
  "处置中": {
    start: "#FD9F04",
    end: "rgba(254,172,4,0)",
    display: "#FD9F04"
  },
  "已处置": {
    start: "#1279B9",
    end: "rgba(21,127,146,0)",
    display: "#1279B9"
  },
};

// 原始数据
const earlyWarningData = ref<EarlyWarningDataItem[]>([]);

// 状态映射
const statusMapping = ref<LevelMapping>({});

// 企业列表表格数据
interface EnterpriseData {
  id: string;
  序号: number;
  反馈时间: string;
  预警等级: string;
  关联目标: string;
  处置状态: string;
}

const currentTable = ref<{ columns: Array<{ key: string; label: string }>; data: EnterpriseData[] }>({
  columns: [
    { key: '序号', label: '序号' },
    { key: '反馈时间', label: '反馈时间' },
    { key: '预警等级', label: '预警等级' },
    { key: '关联目标', label: '关联目标' },
    { key: '处置状态', label: '处置状态' },
  ],
  data: []
});

// 预警总数
const totalWarnings = computed(() => {
  return earlyWarningData.value.reduce((sum, item) => sum + (item.number || 0), 0);
});

// 处置状态统计（右侧显示）- 按实际数据顺序展示，不按字典顺序
const statusStats = computed(() => {
  // 用于记录状态及其首次出现的顺序和总数
  const statusMap: Record<string, { name: string; key: string; value: number; order: number }> = {};
  let order = 0;

  // 遍历实际数据，按照首次出现的顺序累计数值
  earlyWarningData.value.forEach((item) => {
    const status = statusMapping.value[item.czzt];
    if (status) {
      const statusName = status.name;
      if (!statusMap[statusName]) {
        statusMap[statusName] = {
          name: statusName,
          key: status.key,
          value: 0,
          order: order++,
        };
      }
      statusMap[statusName].value += item.number || 0;
    }
  });

  // 按首次出现的顺序返回结果
  return Object.values(statusMap)
    .sort((a, b) => a.order - b.order)
    .map((status) => {
      const colorConfig = statusColorMapping[status.name];
      return {
        label: status.name,
        key: status.key,
        value: status.value,
        color: colorConfig ? colorConfig.display : "#3C7CF8",
      };
    });
});

/**
 * 构建图表系列数据 - 按实际数据顺序
 */
const buildChartSeries = (
  data: EarlyWarningDataItem[],
  statusMapping: LevelMapping
) => {
  // 按 sszx 分组数据
  const groupedData: Record<string, Record<string, number>> = {};
  // 记录处置状态的首次出现顺序
  const statusOrder: Map<string, number> = new Map();
  let statusIndex = 0;

  data.forEach((item) => {
    if (!groupedData[item.sszx]) {
      groupedData[item.sszx] = {};
    }
    if (item.czzt) {
      groupedData[item.sszx][item.czzt] = item.number;
      // 记录状态首次出现的顺序
      if (!statusOrder.has(item.czzt)) {
        statusOrder.set(item.czzt, statusIndex++);
      }
    }
  });

  // 构建 x 轴数据（按顺序排列）
  const xAxisData = Object.keys(sszxMapping)
    .sort((a, b) => sszxMapping[a].order - sszxMapping[b].order)
    .map((key) => sszxMapping[key].name);

  // 构建系列数据 - 按实际数据中出现的顺序
  const statusKeys = Array.from(statusOrder.keys())
    .sort((a, b) => (statusOrder.get(a) ?? 0) - (statusOrder.get(b) ?? 0));

  const seriesData = Object.keys(sszxMapping)
    .sort((a, b) => sszxMapping[a].order - sszxMapping[b].order)
    .map((sszxKey) => {
      return statusKeys.map((statusKey) => {
        return groupedData[sszxKey]?.[statusKey] || 0;
      });
    });

  // 转换为 ECharts 需要的格式
  const series: SeriesData[] = statusKeys.map((statusKey, index) => {
    const status = statusMapping[statusKey];
    return {
      name: status.name,
      type: "bar" as const,
      data: seriesData.map((item) => item[index]),
    };
  });

  return { xAxisData, series, statusKeys };
};

/**
 * 初始化图表
 */
const initChart = async () => {
  try {
    // 1. 获取字典数据
    const dictData = await getCachedDictionary("yjczzt");
    const dictMap: LevelMapping = {};

    if (dictData && dictData.length > 0) {
      dictData.forEach((item, index) => {
        dictMap[item.f_ItemValue] = {
          name: item.f_ItemName,
          key: item.f_ItemValue,
          order: index,
        };
      });
    }
    statusMapping.value = dictMap;

    // 2. 获取预警处置数据
    const data = await getEarlyWarningDisposalCountList();
    earlyWarningData.value = Array.isArray(data) ? data : [];

    // 3. 渲染图表
    await nextTick();
    const chartDom = document.getElementById("monitoring-early-warning-chart");
    if (chartDom) {
      const chart = echarts.init(chartDom);
      const { xAxisData, series, statusKeys } = buildChartSeries(earlyWarningData.value, statusMapping.value);

      // 为每个系列添加渐变色
      const seriesWithGradient = series.map((s, index) => {
        const statusKey = statusKeys[index];
        const status = statusMapping.value[statusKey];
        const colorConfig = statusColorMapping[status.name];
        return {
          ...s,
          itemStyle: {
            color: colorConfig ? createCustomVerticalGradient(colorConfig.start, colorConfig.end) : "#3C7CF8",
          },
        };
      });

      const option = getMonitoringEarlyWarningChartOption(xAxisData, statusMapping.value, seriesWithGradient);
      chart.setOption(option);

      // 窗口大小变化时重绘图表
      window.addEventListener("resize", () => chart.resize());
    }
  } catch (error) {
    console.error("初始化预警处置图表失败:", error);
  }
};

onMounted(() => {
  initChart();
});
</script>

<style lang="scss" scoped>
.monitoring-early-warning-module {
  flex: 0 0 calc(66.667% - 8px); // 占2/3高度，减去间距的一半
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-image: url('@/assets/img/homeModule/module_double_bg.webp');

  .status-counts {
    height: 50%;
  }

  // 上方处置状态区域
  .status-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 140px;

    // 左侧预警总数
    .total-warnings {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 185px;
      height: 163px;
      background-image: url('@/assets/img/homeModule/count_bg.webp');
      background-size: 100% 100%;

      .total-value {
        width: 143.49px;
        height: 60.66px;
        background-image: url('@/assets/img/homeModule/earlyWarning_count.webp');
        background-size: 100% 100%;
        text-align: center;

        >span {
          font-family: YouSheBiaoTiHei;
          font-size: 45px;
          color: #FFFFFF;
          line-height: 59px;
          text-align: center;
          font-style: normal;
          background: linear-gradient(0deg, #FF1D1D 0%, #FD8837 100%);
        }
      }

      .total-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 500;
        font-size: 36px;
        color: #D3EAF1;
        line-height: 52px;
        letter-spacing: 2px;
        text-align: center;
        font-style: normal;
      }
    }

    // 中间环形图占位
    .donut-chart-placeholder {
      flex: 1;
      min-height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      // 占位区域，后续用图片替换
    }

    // 右侧处置状态统计
    .status-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 200px;

      .status-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;

        .status-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 30px;
          color: #D3EAF1;
          line-height: 44px;
          letter-spacing: 2px;
          text-align: center;
          font-style: normal;
        }

        .status-value {
          width: 95.66px;
          height: 40.44px;
          background-size: 100% 100%;
          text-align: center;
          background-image: url('@/assets/img/homeModule/level1.webp');

          >span {
            font-family: YouSheBiaoTiHei;
            font-size: 30px;
            color: #FFFFFF;
            line-height: 39px;
            text-align: center;
            font-style: normal;
            background: linear-gradient(0deg, #FF1D1D 0%, #FD8837 100%);
          }
        }
      }
    }
  }

  // 底部图表区域
  .chart-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .echart {
      width: 100%;
      height: 100%;
    }
  }

  // 表格区域
  .table {
    height: 50%;
    padding: 20px;
    border-top: 1px solid rgba(22, 119, 255, 0.2);
    flex-direction: column;
    display: flex;

    // 表头
    .disposal-header {
      display: flex;
      align-items: center;
      height: 60px;

      background: #2A5768;
      border: 2px solid #09739C;
      border-radius: 6px;
      margin-bottom: 12px;

      .header-col {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-3xl);
        color: #E4F3FF;
        line-height: calc(var(--font-size-lg) * 1.45);
        text-align: left;
        font-style: normal;
        flex: 1;

        &.col-name {
          grid-column: span 1;
        }
      }
    }

    // 企业列表
    .disposal-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 232px;
      overflow-y: auto;
      border: 2px solid #09739C;
      border-top: none;
      flex: 1;

      .disposal-row {
        display: flex;
        align-items: center;
        height: 58px;
        background: linear-gradient(90deg, rgba(0, 150, 255, 0.06) 0%, rgba(0, 100, 200, 0.03) 100%);
        border: 1px solid rgba(22, 119, 255, 0.15);
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(90deg, rgba(0, 150, 255, 0.12) 0%, rgba(0, 100, 200, 0.08) 100%);
          border-color: rgba(22, 119, 255, 0.3);
        }

        .row-col {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-normal);
          color: #e4f3ff;
          text-align: center;
          width: 200px;
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-3xl);
          line-height: calc(var(--font-size-lg) * 2.9);
          text-align: left;
          font-style: normal;
          padding-left: 20px;
          flex: 1;

        }
      }
    }
  }

  .content-header {
    width: 100%;
    height: 70px;
    background-image: url("@/assets/img/homeModule/risk_hazard_head_bg.webp");
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 16px;

    .table-title {
      font-family: YouSheBiaoTiHei;
      font-size: 36px;
      color: #FFFFFF;
      line-height: 47px;
      text-align: left;
      font-style: normal;
      background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);
    }
  }
}
</style>
