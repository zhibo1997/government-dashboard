<template>
  <div class="data-module monitoring-early-warning-module">
    <div class="module-header">
      <div class="module-title">监测预警</div>
    </div>
    <div class="module-content">
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

        <!-- 右侧处置状态统计 -->
        <div class="status-stats">
          <div class="status-item" v-for="status in statusStats" :key="status.label">
            <div class="status-label">{{ status.label }}</div>
            <div class="status-value" :style="{ color: status.color }">
              <span class="gradient-text">{{ status.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部图表区域 -->
      <div class="chart-section">
        <div id="monitoring-early-warning-chart" class="echart"></div>
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

// 预警总数
const totalWarnings = computed(() => {
  return earlyWarningData.value.reduce((sum, item) => sum + (item.number || 0), 0);
});

// 处置状态统计（右侧显示）
const statusStats = computed(() => {
  const stats: Record<string, number> = {};

  earlyWarningData.value.forEach((item) => {
    const statusName = statusMapping.value[item.czzt]?.name || item.czzt;
    if (!stats[statusName]) {
      stats[statusName] = 0;
    }
    stats[statusName] += item.number || 0;
  });

  return Object.keys(statusMapping.value)
    .sort((a, b) => statusMapping.value[a].order - statusMapping.value[b].order)
    .map((key) => {
      const status = statusMapping.value[key];
      const colorConfig = statusColorMapping[status.name];
      return {
        label: status.name,
        key: status.key,
        value: stats[status.name] || 0,
        color: colorConfig ? colorConfig.display : "#3C7CF8",
      };
    });
});

/**
 * 构建图表系列数据
 */
const buildChartSeries = (
  data: EarlyWarningDataItem[],
  statusMapping: LevelMapping
) => {
  // 按 sszx 分组数据
  const groupedData: Record<string, Record<string, number>> = {};

  data.forEach((item) => {
    if (!groupedData[item.sszx]) {
      groupedData[item.sszx] = {};
    }
    if (item.czzt) {
      groupedData[item.sszx][item.czzt] = item.number;
    }
  });

  // 构建 x 轴数据（按顺序排列）
  const xAxisData = Object.keys(sszxMapping)
    .sort((a, b) => sszxMapping[a].order - sszxMapping[b].order)
    .map((key) => sszxMapping[key].name);

  // 构建系列数据
  const statusKeys = Object.keys(statusMapping).sort(
    (a, b) => statusMapping[a].order - statusMapping[b].order
  );

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
    const dictData = await getCachedDictionary("yjzt");
    const dictMap: LevelMapping = {};

    if (dictData && dictData.length > 0) {
      dictData.forEach((item, index) => {
        if (item.f_ItemValue !== "yjzt000") {
          dictMap[item.f_ItemValue] = {
            name: item.f_ItemName,
            key: item.f_ItemValue,
            order: index,
          };
        }
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

    .echart {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
