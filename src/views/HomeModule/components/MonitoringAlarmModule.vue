<template>
  <div class="data-module monitoring-alarm-module">
    <div class="module-header">
      <div class="module-title">监测报警</div>
    </div>
    <div class="module-content">
      <!-- 上方区域：处置功能区（暂时保留） -->
      <div class="status-section">
        <!-- 左侧报警总数 -->
        <div class="total-alarms">
          <div class="total-value">
            <span class="gradient-text">{{ totalAlarms }}</span>
          </div>
          <div class="total-label">报警总数</div>
        </div>


        <!-- 右侧等级统计 -->
        <div class="level-stats">
          <div class="level-item" v-for="level in levelStats" :key="level.label">
            <div class="level-label">{{ level.label }}</div>
            <div class="level-value" :class="level.key">
              <span class="gradient-text">{{ level.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部图表区域 -->
      <div class="chart-section">
        <div id="monitoring-alarm-chart" class="echart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { getMonitoringAlarmCountList } from "@/services/statusService";
import { getCachedDictionary } from "@/services/dictionaryService";
import { getMonitoringAlarmChartOption, SeriesData, LevelMapping, createCustomVerticalGradient } from "./chartOptions";

// 数据类型定义
interface AlarmDataItem {
  sszx: string;  // 数据中心标识
  bjjb: string;  // 报警级别标识
  number: number; // 报警数量
}

// 专项映射
const sszxMapping: Record<string, { name: string; order: number }> = {
  csaqzx_rq: { name: "燃气", order: 0 },
  csaqzx_ql: { name: "桥梁", order: 1 },
  csaqzx_gs: { name: "供水", order: 2 },
  csaqzx_ps: { name: "排水", order: 3 },
};

// 报警级别颜色映射（根据设计图配置渐变色）
const alarmColorMapping: Record<string, { start: string; end: string; display: string }> = {
  "一级": { 
    start: "#FF2C20", 
    end: "rgba(254,172,4,0)",
    display: "#FF2C20" // 用于右侧数值显示
  },
  "二级": { 
    start: "#FD9F04", 
    end: "rgba(254,172,4,0)",
    display: "#FD9F04"
  },
  "三级": { 
    start: "#1279B9", 
    end: "rgba(21,127,146,0)",
    display: "#1279B9"
  },
};

// 原始数据
const alarmData = ref<AlarmDataItem[]>([]);

// 等级映射
const levelMapping = ref<LevelMapping>({});

// 报警总数
const totalAlarms = computed(() => {
  return alarmData.value.reduce((sum, item) => sum + (item.number || 0), 0);
});

// 等级统计（右侧显示）
const levelStats = computed(() => {
  const stats: Record<string, number> = {};

  alarmData.value.forEach((item) => {
    const levelName = levelMapping.value[item.bjjb]?.name || item.bjjb;
    if (!stats[levelName]) {
      stats[levelName] = 0;
    }
    stats[levelName] += item.number || 0;
  });

  return Object.keys(levelMapping.value)
    .sort((a, b) => levelMapping.value[a].order - levelMapping.value[b].order)
    .map((key) => {
      const level = levelMapping.value[key];
      const colorConfig = alarmColorMapping[level.name];
      return {
        label: level.name,
        key: level.key,
        value: stats[level.name] || 0,
        color: colorConfig ? colorConfig.display : "#3C7CF8",
      };
    });
});

/**
 * 构建图表系列数据
 */
const buildChartSeries = (
  data: AlarmDataItem[],
  levelMapping: LevelMapping
) => {
  // 按 sszx 分组数据
  const groupedData: Record<string, Record<string, number>> = {};

  data.forEach((item) => {
    if (!groupedData[item.sszx]) {
      groupedData[item.sszx] = {};
    }
    if (item.bjjb) {
      groupedData[item.sszx][item.bjjb] = item.number;
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

  const seriesData = Object.keys(sszxMapping)
    .sort((a, b) => sszxMapping[a].order - sszxMapping[b].order)
    .map((sszxKey) => {
      return levelKeys.map((levelKey) => {
        return groupedData[sszxKey]?.[levelKey] || 0;
      });
    });

  // 转换为 ECharts 需要的格式
  const series: SeriesData[] = levelKeys.map((levelKey, index) => {
    const level = levelMapping[levelKey];
    return {
      name: level.name,
      type: "bar" as const,
      data: seriesData.map((item) => item[index]),
    };
  });

  return { xAxisData, series, levelKeys };
};

/**
 * 初始化图表
 */
const initChart = async () => {
  try {
    // 1. 获取字典数据
    const dictData = await getCachedDictionary("bjjb");
    const dictMap: LevelMapping = {};

    if (dictData && dictData.length > 0) {
      dictData.forEach((item, index) => {
        if (item.f_ItemValue !== "bjjb000") {
          dictMap[item.f_ItemValue] = {
            name: item.f_ItemName,
            key: item.f_ItemValue,
            order: index,
          };
        }
      });
    }
    levelMapping.value = dictMap;

    // 2. 获取报警数据
    const data = await getMonitoringAlarmCountList();
    alarmData.value = Array.isArray(data) ? data : [];

    // 3. 渲染图表
    await nextTick();
    const chartDom = document.getElementById("monitoring-alarm-chart");
    if (chartDom) {
      const chart = echarts.init(chartDom);
      const { xAxisData, series, levelKeys } = buildChartSeries(alarmData.value, levelMapping.value);
      
      // 为每个系列添加渐变色
      const seriesWithGradient = series.map((s, index) => {
        const levelKey = levelKeys[index];
        const level = levelMapping.value[levelKey];
        const colorConfig = alarmColorMapping[level.name];
        return {
          ...s,
          itemStyle: {
            color: colorConfig ? createCustomVerticalGradient(colorConfig.start, colorConfig.end) : "#3C7CF8",
          },
        };
      });
      
      const option = getMonitoringAlarmChartOption(xAxisData, levelMapping.value, seriesWithGradient);
      chart.setOption(option);

      // 窗口大小变化时重绘图表
      window.addEventListener("resize", () => chart.resize());
    }
  } catch (error) {
    console.error("初始化监测报警图表失败:", error);
  }
};

onMounted(() => {
  initChart();
});
</script>

<style lang="scss" scoped>
.monitoring-alarm-module {
  flex: 0 0 calc(33.333% - 8px); // 占1/3高度，减去间距的一半
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // 上方状态区域
  .status-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 140px;

    // 左侧报警总数
    .total-alarms {
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
        background-image: url('@/assets/img/homeModule/alarm_count.webp');
        background-size: 100% 100%;

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

    // 右侧等级统计
    .level-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 200px;

      .level-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;

        .level-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 30px;
          color: #D3EAF1;
          line-height: 44px;
          letter-spacing: 2px;
          text-align: center;
          font-style: normal;
        }

        .level-value {
          width: 95.66px;
          height: 40.44px;
          background-size: 100% 100%;
          text-align: center;

          >span {
            font-family: YouSheBiaoTiHei;
            font-size: 30px;
            color: #FFFFFF;
            line-height: 39px;
            text-align: center;
            font-style: normal;
          }

          &.bjjb001 {
            background-image: url('@/assets/img/homeModule/level1.webp');

            >span {
              background: linear-gradient(0deg, #FF1D1D 0%, #FD8837 100%);
            }
          }

          &.bjjb002 {
            background-image: url('@/assets/img/homeModule/level2.webp');

            >span {
              background: linear-gradient(0deg, #F75E04 0%, #FEAC04 100%);
            }
          }

          &.bjjb003 {
            background-image: url('@/assets/img/homeModule/level3.webp');

            >span {
              background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);
            }
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
