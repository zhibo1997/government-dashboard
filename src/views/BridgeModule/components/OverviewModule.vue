<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">总览</div>
    </div>
    <div class="module-content">
      <!-- 上方：统计卡片区域 -->
      <div class="stats-cards-container">
        <div class="stats-card" v-for="(item, idx) in statsCards" :key="item.id">
          <div class="card-info" :class="item.type">
            <div class="card-value gradient-text">{{ item.value }}<span class="unit">座</span>
            </div>
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
          <!-- 暂时注释 DOM 图例，使用 ECharts 内置图例 -->
          <!-- <div class="chart-legend" v-if="chart.legendData && chart.legendData.length > 0">
            <div class="legend-group" v-for="(group, groupIndex) in groupLegends(chart.legendData)" :key="groupIndex">
              <div class="legend-item" v-for="item in group" :key="item.name">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-text">{{ item.name }}</span>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue";
import * as echarts from "echarts";
import { getBridgeCategoryStats } from "@/services/bridgeService";
import { createChartOption, getGradientColor } from "./chartOption";
import { getWaterOverview } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";

defineOptions({
  name: "OverviewModule",
});

// ==================== 数据状态 ====================
// 统计卡片数据（从接口获取）
const statsCards = ref<any[]>([]);

// 图表配置
const chartConfigs = ref<any[]>([]);

// 字典映射
const qlTypeMap = ref<any>({});

// ==================== 数据获取与处理 ====================
/**
 * 获取桥梁分类统计数据
 */
const fetchBridgeData = async () => {
  try {
    const data = await getBridgeCategoryStats() as any[];
    processChartData(data);
  } catch (error) {
    console.error("获取桥梁分类统计数据失败:", error);
  }
};

// 获取卡片数据
const fetchCardData = async () => {
  try {
    // 获取字典数据
    const dictionaries = await getCachedDictionary("jcssdstjlx_ql");
    qlTypeMap.value = dictionaries.reduce((acc, cur) => {
      acc[cur.f_ItemValue] = cur.f_ItemName;
      return acc;
    }, {});
    
    // 获取统计数据
    const data = await getWaterOverview({ Sszx: "csaqzx_ql" }) as any[];
    processCardData(data);
  } catch (error) {
    console.error("获取卡片数据失败:", error);
  }
};

/**
 * 处理卡片数据
 */
const processCardData = (data: any[]) => {
  // 将 jcssdstj0601 排到第一个
  data = [...data].sort((a, b) => {
    if (a.jcsslx === 'jcssdstj0601') return -1;
    if (b.jcsslx === 'jcssdstj0601') return 1;
    return 0;
  });
  // 映射数据到卡片
  statsCards.value = data.map((item, index) => ({
    id: index + 1,
    value: item.jcsstjsl || 0, // 使用 jcsstjsl 作为数量
    label: qlTypeMap.value[item.jcsslx] || item.jcsslx, // 使用字典映射
    type: getTypeByCode(item.jcsslx) // 根据代码确定类型
  }));
};

/**
 * 根据代码确定卡片类型
 */
const getTypeByCode = (code: string) => {
  const typeMap: Record<string, string> = {
    "jcssdstj0601": "total",    // 桥梁总数
    "jcssdstj0602": "large",    // 大桥及特大桥
    "jcssdstj0603": "overpass", // 立交桥
    "jcssdstj0604": "culvert"   // 涵洞
  };
  return typeMap[code] || "default";
};

/**
 * 处理图表数据
 */
const processChartData = (data: any[]) => {
  // 按分类分组数据
  const grouped = data.reduce((acc, item) => {
    const existing = acc.find((g) => g.category === item.category);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({
        category: item.category,
        items: [item],
      });
    }
    return acc;
  }, []);

  // 生成图表配置（只取前三个分类）
  chartConfigs.value = grouped.slice(0, 3).map((group, index) => ({
    id: index,
    title: group.category,
    data: group.items,
    legendData: group.items.map((item, dataIndex) => ({
      name: item.type,
      value: item.number,
      color: getGradientColor(index, dataIndex),
    })),
  }));
};

/**
 * 按组分解图例（每行显示2个）
 */
const groupLegends = (legends: any[]) => {
  const groups = [];
  for (let i = 0; i < legends.length; i += 2) {
    groups.push(legends.slice(i, i + 2));
  }
  return groups;
};

// ==================== 图表配置 ====================
/**
 * 生成圆环图 ECharts 配置项
 * 已移至 chartOption.ts 中的 createChartOption 函数
 */

// ==================== 图表渲染 ====================
/**
 * 渲染圆环图表
 */
const renderCharts = () => {
  chartConfigs.value.forEach((chart, chartIndex) => {
    const chartDom = document.getElementById(`chart-${chart.id}`);
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const option = createChartOption(chart, chartIndex);
    myChart.setOption(option);
  });
};

// ==================== 生命周期 ====================
onMounted(async () => {
  // 获取卡片数据
  await fetchCardData();
  // 获取桥梁分类统计数据
  await fetchBridgeData();
  // 渲染图表
  await nextTick();
  renderCharts();
});
</script>

<style lang="scss" scoped>
.overview-module {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.module-header {
  height: 90px;
  display: flex;
  align-items: center;

  .module-title {
    font-family: YouSheBiaoTiHei;
    font-size: var(--font-size-hero);
    color: #ffffff;
    text-align: left;
    font-style: normal;
    padding-left: 140px;
    margin-top: 10px;
  }
}

// ==================== 统计卡片 ====================
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
      font-style: normal;

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
      text-align: center;
      font-style: normal;
    }

    &.total {
      width: 191.5px;
      height: 120px;
      background-image: url("@/assets/img/bridgeModule/total_bridges.webp");

      .card-value {
        font-size: var(--font-size-title);
        line-height: 52px;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
      }

      .unit {
        font-size: var(--font-size-heading);
        line-height: 26px;
      }
      .card-label {
        font-size: var(--font-size-title);
        font-weight: var(--font-weight-bold);
        line-height: 42px;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
      }
    }


    &.large {
      background-image: url("@/assets/img/bridgeModule/large_bridges.webp");

      .card-value {
        background: linear-gradient(90deg, #FFFFFF 0%, #FEC854 100%);
      }
    }

    &.overpass {
      background-image: url("@/assets/img/bridgeModule/interchanges.webp");

      .card-value {
        background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%);
      }
    }

    &.culvert {
      background-image: url("@/assets/img/bridgeModule/culverts.webp");

      .card-value {
        background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%);
      }
    }
  }
}

// ==================== 圆环图表 ====================
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
  .chart-echart {
    width: 100%;
    height: 100%;
  }
}

// 暂时注释的 DOM 图例样式
// .chart-legend {
//   display: flex;
//   flex-direction: column;
//   gap: 8px;
//   padding: 10px 0;
// }

// .legend-group {
//   display: flex;
//   gap: 20px;
//   justify-content: flex-start;
// }

// .legend-item {
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   font-size: var(--font-size-mini);
//   color: #a0bfc9;

//   .legend-color {
//     width: 8px;
//     height: 8px;
//     border-radius: 2px;
//     flex-shrink: 0;
//   }

//   .legend-text {
//     white-space: nowrap;
//   }
// }
</style>
