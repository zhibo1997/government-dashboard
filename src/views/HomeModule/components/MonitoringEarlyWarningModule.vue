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
              <span class="gradient-text">{{ displayTotalWarnings }}</span>
            </div>
            <div class="total-label">预警总数</div>
          </div>

          <!-- 中间环形图占位 -->
          <div id="monitoring-donut-chart" class="donut-chart"></div>

        </div>

        <!-- 底部图表区域 -->
        <div class="chart-section">
          <div id="monitoring-early-warning-chart" class="echart"></div>
        </div>
      </div>
      <!-- 预警处置表格 -->
      <WarningDisposalTable
        title="预警处置"
        :columns="tableColumns"
        :data="currentTable.data"
        row-key="id"
        empty-text="-"
        :auto-scroll="true"
        :scroll-speed="1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { getEarlyWarningDisposalCountList, getEarlyWarningDisposalPage } from "@/services/statusService";
import { getWarnStatistics } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
import { getMonitoringEarlyWarningChartOption, getMonitoringDonutChartOption, SeriesData, LevelMapping, createCustomVerticalGradient } from "./chartOptions";
import WarningDisposalTable from "./WarningDisposalTable.vue";

// 数据类型定义
interface EarlyWarningDataItem {
  sszx: string;  // 数据中心标识
  czzt: string;  // 处置状态标识
  number: number; // 预警数量
}

interface WarnStatistics {
  totalCount: number;
  handlingCount: number;
  handledCount: number;
  unhandledCount: number;
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

// 预警统计数据（环形图）
const warnStats = ref<WarnStatistics>({
  totalCount: 0,
  handlingCount: 0,
  handledCount: 0,
  unhandledCount: 0,
});

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
    { key: '描述', label: '描述' },
    { key: 'fkms', label: '处置状态' },
  ],
  data: []
});

// 表格列配置
const tableColumns = computed(() => [
  { key: '序号', title: '序号', width: '1fr' },
  { key: '反馈时间', title: '反馈时间', width: '2.5fr' },
  { key: '处置状态', title: '处置状态', width: '1.5fr' }
]);

// 显示用总数：优先使用环形图接口的总数，没有则显示 "-"
const displayTotalWarnings = computed(() => {
  if (warnStats.value.totalCount > 0) {
    return String(warnStats.value.totalCount);
  }
  if (!earlyWarningData.value || earlyWarningData.value.length === 0) {
    return "-";
  }
  const sum = earlyWarningData.value.reduce((acc, cur) => acc + (cur.number || 0), 0);
  return sum > 0 ? String(sum) : "-";
});


// 值格式化：空值统一显示为 "-"
const formatDisplay = (value: unknown): string => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string" && value.trim() === "") return "-";
  return String(value);
};

// 获取预警等级样式类
const getLevelClass = (level: string): string => {
  const levelMap: Record<string, string> = {
    '一级': 'level-high',
    '二级': 'level-medium',
    '三级': 'level-low'
  };
  return levelMap[level] || 'level-default';
};

// 获取处置状态样式类
const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    '未处置': 'status-pending',
    '处置中': 'status-processing',
    '已处置': 'status-completed'
  };
  return statusMap[status] || 'status-default';
};

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

  // 构建系列数据 - 仅展示“处置中”、“已处置”、“未处置”这三个状态
  const allowedStatusNames = Object.keys(statusColorMapping);
  const statusKeys = Object.keys(statusMapping)
    .filter(key => allowedStatusNames.includes(statusMapping[key].name))
    .sort((a, b) => {
      // 按照 statusColorMapping 的顺序排序或保持字典顺序
      return statusMapping[a].order - statusMapping[b].order;
    });

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

    // 2. 获取预警统计数据（环形图）
    const statsData = await getWarnStatistics("");
    if (statsData) {
      warnStats.value = {
        totalCount: statsData.totalCount || 0,
        handlingCount: statsData.handlingCount || 0,
        handledCount: statsData.handledCount || 0,
        unhandledCount: statsData.unhandledCount || 0,
      };
    }

    // 3. 获取预警处置数据（柱状图）
    const data = await getEarlyWarningDisposalCountList();
    earlyWarningData.value = Array.isArray(data) ? data : [];

    // 4. 渲染图表
    await nextTick();
    
    // 渲染环形图
    const donutDom = document.getElementById("monitoring-donut-chart");
    if (donutDom) {
      const donutChart = echarts.init(donutDom);
      const donutOption = getMonitoringDonutChartOption([
        { name: "处置中", value: warnStats.value.handlingCount, color: statusColorMapping["处置中"].display },
        { name: "已处置", value: warnStats.value.handledCount, color: statusColorMapping["已处置"].display },
        { name: "未处置", value: warnStats.value.unhandledCount, color: statusColorMapping["未处置"].display },
      ]);
      donutChart.setOption(donutOption);
      window.addEventListener("resize", () => donutChart.resize());
    }

    // 渲染柱状图
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
  fetchTableData();
});

/**
 * 获取预警处置表格数据
 */
async function fetchTableData() {
  try {
    const res = await getEarlyWarningDisposalPage({ rows: 20, page: 1 });
    const list = res.rows || res.records || res.list || [];
    currentTable.value.data = list.map((item: any, index: number) => ({
      id: item.id || index,
      序号: index + 1,
      反馈时间: item.fksj || '-',
      描述: item.yjdj || '-',
      处置状态: item.fkms || '-',
    }));
  } catch (error) {
    console.error('获取预警处置列表失败:', error);
  }
}
</script>

<style lang="scss" scoped>
.monitoring-early-warning-module {
  flex: 0 0 calc(66.667% - 8px); // 占2/3高度，减去间距的一半
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-image: url('@/assets/img/homeModule/module_double_bg.webp');

  .status-counts {
    height: 70%;
    display: flex;
    flex-direction: column;
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

    // 环形图区域
    .donut-chart {
      flex: 1;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
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

  // 自定义表格样式
  .level-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 20px;
    font-weight: 500;
    
    &.level-high {
      background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
      color: white;
    }
    
    &.level-medium {
      background: linear-gradient(135deg, #FFA502 0%, #FFB347 100%);
      color: white;
    }
    
    &.level-low {
      background: linear-gradient(135deg, #2ED573 0%, #7BED9F 100%);
      color: white;
    }
    
    &.level-default {
      background: rgba(255, 255, 255, 0.1);
      color: #E4F3FF;
    }
  }
  
  .status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 20px;
    font-weight: 500;
    
    &.status-pending {
      background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
      color: white;
    }
    
    &.status-processing {
      background: linear-gradient(135deg, #FFA502 0%, #FFB347 100%);
      color: white;
    }
    
    &.status-completed {
      background: linear-gradient(135deg, #2ED573 0%, #7BED9F 100%);
      color: white;
    }
    
    &.status-default {
      background: rgba(255, 255, 255, 0.1);
      color: #E4F3FF;
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
      background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
    }
  }
}
</style>
