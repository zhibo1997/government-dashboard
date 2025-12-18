<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险隐患</div>
    </div>
    <div class="module-content">
      <div class="risk-content">
        <div id="risk-chart" class="risk-echart"></div>
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
      <!-- 整改状态 -->
      <div class="rectification-section">
        <div class="rectification-item" v-for="item in rectificationData" :key="item.status">
          <div class="left-nums">
            <div class="rectification-item-title">{{ item.title }}</div>
            <div class="rectification-item-value">
              <span class="value gradient-text" :class="`progress-${item.status}`">{{ item.count }}</span>
              <span class="unit">个</span>
            </div>
          </div>
          <div class="right-chart">
            <div class="status-chart" :id="`status-chart-${item.status}`"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { getRiskStatusCount, getRiskLevelCount } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";

const zgztMap = {
  已整改: "rectified",
  未整改: "notRectified",
  整改中: "inRectification",
  持续跟进: "continuousImprovement",
};

// ==================== 数据状态 ====================
// 风险等级映射
const riskLevelMap = {
  fxdj01: { name: "重大风险", color: "#E88D6B" },
  fxdj02: { name: "较大风险", color: "#F4D982" },
  fxdj03: { name: "一般风险", color: "#61E29D" },
  fxdj04: { name: "低风险", color: "#9bb8c7" },
};

// 风险等级数据
const riskLegend = ref([]);

// 整改状态数据
const rectificationData = ref([]);

// ==================== 数据获取 ====================
/**
 * 获取风险等级数据
 */
const fetchRiskLevelData = async () => {
  try {
    const riskLevelData = await getRiskLevelCount() as any[];
    if (riskLevelData && riskLevelData.length > 0) {
      const transformedData = riskLevelData.map(item => {
        const riskInfo = riskLevelMap[item.riskType];
        return {
          name: riskInfo?.name || item.riskType,
          color: riskInfo?.color || "#FFFFFF",
          value: item.count || 0
        };
      });
      
      riskLegend.value = transformedData;
    }
  } catch (error) {
    console.error("获取风险等级数据失败:", error);
  }
};

/**
 * 获取整改状态数据
 */
const fetchRectificationData = async () => {
  try {
    const dictionaries = await getCachedDictionary("zgzt");
    const res = await getRiskStatusCount({ Glmblx: "glmblx_gs" });
    
    const zgCount = res.reduce((sum, item) => sum + item.count, 0);
    rectificationData.value = res.map((item) => {
      const status = dictionaries.find(
        (statusItem) => statusItem.f_ItemValue === item.riskStatus
      );
      return {
        title: status?.f_ItemName || "未知状态",
        count: item.count,
        status: status ? zgztMap[status.f_ItemName] : "unknown",
        progress: zgCount > 0 ? item.count / zgCount : 0,
      };
    });
    
    await nextTick();
    renderRectificationCharts();
  } catch (error) {
    console.error("获取整改状态数据失败:", error);
  }
};

// ==================== 图表渲染 ====================
/**
 * 渲染风险等级多环形图
 */
const renderRiskLevelChart = () => {
  const chartDom = document.getElementById("risk-chart");
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  // 占位样式(背景环)
  const placeHolderStyle = {
    label: { show: false },
    labelLine: { show: false },
    itemStyle: {
      color: "rgba(29, 57, 64, 0.5)",
      borderColor: "rgba(29, 57, 64, 0.8)",
      borderWidth: 8,
    },
    emphasis: { disabled: true },
  };

  // 数据环样式
  const createLabelStyle = (color: string, lineLength = 100) => ({
    label: {
      show: false,
    },
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

  // 图表配置
  myChart.setOption({
    backgroundColor: "transparent",
    color: ["#9bb8c7", "#61E29D", "#F4D982", "#E88D6B"],
    legend: { show: false },
    series: riskLegend.value.map((risk, index) => {
      const radiusMap = [
        [90, 91],
        [70, 71],
        [50, 51],
        [30, 31],
      ];
      const lineLengthMap = [40, 50, 60, 70];
      // 动态计算最大值，确保环形图能正确显示比例
      const maxValue = Math.max(...riskLegend.value.map(item => item.value), 1) * 1.5;

      return {
        name: risk.name,
        type: "pie",
        clockWise: true,
        hoverAnimation: true,
        radius: radiusMap[index],
        ...createLabelStyle(risk.color, lineLengthMap[index]),
        data: [
          { value: risk.value, name: risk.name },
          { value: maxValue - risk.value, name: "", ...placeHolderStyle },
        ],
      };
    }),
  });
};

/**
 * 渲染整改状态环形进度图
 */
const renderRectificationCharts = () => {
  rectificationData.value.forEach((item) => {
    const chartDom = document.getElementById(`status-chart-${item.status}`);
    if (!chartDom) return;

    const chart = echarts.init(chartDom);
    chart.setOption(createProgressOption(item.progress, item.status));
  });
};

/**
 * 创建环形进度图配置
 */
const createProgressOption = (progress: number, status: string) => {
  const colorMap = {
    continuousImprovement: ["#10ADC0", "#FFFFFF"],
    rectified: ["#FFF407", "#3FFEFD"],
    inRectification: ["#CDAB06", "#FFFEED"],
    notRectified: ["#FEAC04", "#F75E04"],
  };

  const colors = colorMap[status] || ["#10ADC0", "#FFFFFF"];
  const percentage = Math.round(progress * 100);

  return {
    series: [
      {
        type: "pie",
        radius: ["70%", "90%"],
        center: ["50%", "50%"],
        startAngle: 90,
        silent: true,
        label: {
          show: true,
          position: "center",
          formatter: `{a|${percentage}%}`,
          rich: {
            a: {
              fontSize: 20,
              fontWeight: "bold",
              fontFamily: "YouSheBiaoTiHei",
              color: "#FFFFFF",
              lineHeight: 26,
            },
          },
        },
        labelLine: { show: false },
        data: [
          {
            value: progress,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: colors[0] },
                { offset: 1, color: colors[1] },
              ]),
              borderRadius: 10,
            },
          },
          {
            value: 1 - progress,
            itemStyle: {
              color: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
            },
            emphasis: {
              itemStyle: { color: "rgba(255, 255, 255, 0.1)" },
            },
          },
        ],
        emphasis: { scale: false },
      },
    ],
  };
};

// ==================== 生命周期 ====================
onMounted(async () => {
  // 获取风险等级数据
  await fetchRiskLevelData();
  
  // 获取整改状态数据
  await fetchRectificationData();
  
  // 渲染风险等级图表
  renderRiskLevelChart();
});

</script>

<style lang="scss" scoped>
.module-content{
  flex-direction: row;
}
.risk-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 50%;

  .risk-echart {
    width: 239px;
    height: 250px;
  }

    .risk-legend {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .legend-item {
        padding: 2px 10px;
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
          font-size: 18px;
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
          font-size: 22px;
          color: #ffffff;
          background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);

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

.rectification-section {
  width: 50%;

  .right-chart {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 20px;

    .status-chart {
      width: 80px;
      height: 80px;
    }
  }

  .rectification-item {
    width: 388px;
    height: 92px;
    background-size: 100% 100%;
    background-image: url("@/assets/img/waterSupply/rectification_bg.png");
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .left-nums {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 222px;
    padding: 0 32px 0 20px;
  }

  .rectification-item-title {
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: 20px;
    color: #d3eaf1;
    line-height: 29px;
    letter-spacing: 1px;
    text-align: left;
    font-style: normal;
  }

  .rectification-item-value {
    .value {
      font-family: YouSheBiaoTiHei;
      font-size: 40px;
      color: #ffffff;
      line-height: 52px;
      text-align: right;
      font-style: normal;

      &.progress-continuousImprovement {
        background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
      }

      &.progress-rectified {
        background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
      }

      &.progress-inRectification {
        background: linear-gradient(90deg, #fffeed 0%, #cdab06 100%);
      }

      &.progress-notRectified {
        background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
      }
    }

    .unit {
      margin-left: 5px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 14px;
      color: #d3eaf1;
      line-height: 20px;
      letter-spacing: 1px;
      text-align: left;
      font-style: normal;
      background: transparent !important;
    }
  }
}
</style>
