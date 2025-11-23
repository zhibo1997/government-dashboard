<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险隐患</div>
    </div>
    <div class="module-content">
      <div class="risk-container">
        <!-- 左侧:多环形图 -->
        <div class="left-chart">
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

        <!-- 右侧:隐患统计和整改状态 -->
        <div class="right-stats">
          <div class="stats-container">
            <!-- 隐患总数 -->
            <div class="total-hazard">
              <div class="total-label">隐患总数</div>
              <div class="total-value gradient-text">{{ totalHazard }}</div>
            </div>

            <!-- 三类隐患统计 -->
            <div class="hazard-types">
              <div class="hazard-type-item" v-for="item in hazardTypes" :key="item.type" :class="`type-${item.type}`">
                <div class="type-value gradient-text">{{ item.count }}</div>
                <div class="type-label">{{ item.label }}</div>
              </div>
            </div>
          </div>

          <!-- 整改状态 -->
          <div class="rectification-section">
            <div class="rectification-item" v-for="item in rectificationData" :key="item.status">
              <div class="right-chart">
                <div class="status-chart" :id="`status-chart-${item.status}`"></div>
              </div>
              <div class="left-nums">
                <div class="rectification-item-title">{{ item.title }}</div>
                <div class="rectification-item-value">
                  <span class="value gradient-text" :class="`progress-${item.status}`">{{ item.count }}</span>
                  <span class="unit">个</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { getRiskStatusCount } from "@/services/waterSupplyService";
import { getDataItems } from "@/services/commonService";

const zgztMap = {
  已整改: "rectified",
  未整改: "notRectified",
  整改中: "inRectification",
  持续跟进: "continuousImprovement",
};

// 风险图例数据
const riskLegend = ref([
  { name: "低风险", color: "#9bb8c7", value: 24 },
  { name: "一般风险", color: "#61E29D", value: 30 },
  { name: "较大风险", color: "#F4D982", value: 1 },
  { name: "重大风险", color: "#E88D6B", value: 27 },
]);

// 隐患总数
const totalHazard = ref(28);

// 三类隐患
const hazardTypes = ref([
  { type: "major", label: "较大隐患", count: 11 },
  { type: "significant", label: "重大隐患", count: 8 },
  { type: "general", label: "一般隐患", count: 9 },
]);

// 整改状态数据
const rectificationData = ref([]);

onMounted(async () => {
  try {
    // 获取整改状态字典
    const dictionaries = await getDataItems("zgzt");
    const res = await getRiskStatusCount({ Sszx: "csaqzx_rq" });

    const zgCount = res.reduce((sum, item) => sum + item.count, 0);
    rectificationData.value = res.map((item) => {
      const status = dictionaries.find(
        (statusItem) => statusItem.f_ItemValue === item.riskStatus
      );
      return {
        title: status ? status.f_ItemName : "未知状态",
        count: item.count,
        status: status ? zgztMap[status.f_ItemName] : "unknown",
        progress: zgCount > 0 ? item.count / zgCount : 0,
      };
    });
  } catch (error) {
    console.error("获取整改状态数据失败:", error);
    // 使用默认数据
    rectificationData.value = [
      {
        title: "持续跟进",
        count: 27,
        status: "continuousImprovement",
        progress: 0.45,
      },
      { title: "已整改", count: 20, status: "rectified", progress: 0.45 },
      { title: "整改中", count: 13, status: "inRectification", progress: 0.45 },
      { title: "未整改", count: 58, status: "notRectified", progress: 0.45 },
    ];
  }

  // 初始化风险隐患多环形图
  const chartDom = document.getElementById("risk-chart");
  if (chartDom) {
    const myChart = echarts.init(chartDom);

    // 反向阴影效果
    const placeHolderStyle = {
      label: { show: false, position: "center" },
      labelLine: { show: false },
      itemStyle: {
        color: "rgba(29, 57, 64, 0.5)",
        borderColor: "rgba(29, 57, 64, 0.8)",
        borderWidth: 8,
      },
      emphasis: { disabled: true },
    };

    const labelStyle = (color, length = 100) => {
      return {
        label: {
          show: true,
          position: "outside",
          formatter: "{a}: {c}个",
          color: "#D3EAF1",
          fontSize: 14,
        },
        labelLine: {
          show: true,
          length,
          smooth: 0.5,
          lineStyle: { color: "rgba(211, 234, 241, 0.3)" },
        },
        itemStyle: {
          borderWidth: 8,
          shadowBlur: 20,
          borderColor: color,
          shadowColor: color,
        },
      };
    };

    myChart.setOption({
      backgroundColor: "transparent",
      color: ["#9bb8c7", "#61E29D", "#F4D982", "#E88D6B"],
      legend: { show: false },
      series: [
        {
          name: "低风险",
          type: "pie",
          clockWise: true,
          hoverAnimation: true,
          radius: [90, 91],
          ...labelStyle("#9bb8c7", 40),
          data: [
            { value: 24, name: "低风险" },
            { value: 58, name: "", ...placeHolderStyle },
          ],
        },
        {
          name: "一般风险",
          type: "pie",
          clockWise: true,
          hoverAnimation: true,
          radius: [70, 71],
          ...labelStyle("#61E29D", 50),
          data: [
            { value: 30, name: "一般风险" },
            { value: 52, name: "", ...placeHolderStyle },
          ],
        },
        {
          name: "较大风险",
          type: "pie",
          clockWise: true,
          hoverAnimation: true,
          radius: [50, 51],
          ...labelStyle("#F4D982", 60),
          data: [
            { value: 1, name: "较大风险" },
            { value: 81, name: "", ...placeHolderStyle },
          ],
        },
        {
          name: "重大风险",
          type: "pie",
          clockWise: true,
          hoverAnimation: true,
          radius: [30, 31],
          ...labelStyle("#E88D6B", 70),
          data: [
            { value: 27, name: "重大风险" },
            { value: 55, name: "", ...placeHolderStyle },
          ],
        },
      ],
    });
  }

  // 初始化整改状态环形图
  nextTick(() => {
    rectificationData.value.forEach((item) => {
      const chartDom = document.getElementById(`status-chart-${item.status}`);
      if (chartDom) {
        const chart = echarts.init(chartDom);
        chart.setOption(createProgressOption(item.progress, item.status));
      }
    });
  });
});

// 创建环形进度图配置
const createProgressOption = (progress, status) => {
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
</script>

<style lang="scss" scoped>
.risk-hazard-module {
  .module-content {
    padding: 20px 30px;
  }

  .risk-container {
    display: flex;
    flex-direction: row;
    gap: 40px;
    height: 100%;
  }

  // 左侧多环形图区域
  .left-chart {
    width: 50%;
    display: flex;
    flex-direction: column;

    .risk-echart {
      width: 100%;
      height: 300px;
      margin-bottom: 20px;
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

  // 右侧统计区域
  .right-stats {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .stats-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 276px;
      background-size: 100% 100%;
      background-image: url("@/assets/img/gasMoDule/risk_bg.webp");
    }

    // 隐患总数
    .total-hazard {
      width: 100%;
      height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .total-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 20px;
        color: #d3eaf1;
        line-height: 29px;
        letter-spacing: 1px;
        text-align: center;
        font-style: normal;
      }

      .total-value {
        font-family: YouSheBiaoTiHei;
        font-size: 40px;
        line-height: 52px;
        text-align: right;
        font-style: normal;
        background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
      }
    }

    // 三类隐患
    .hazard-types {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;

      .hazard-type-item {
        height: 100px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .type-value {
          font-size: 40px;
          font-weight: bold;
          font-family: YouSheBiaoTiHei;
          line-height: 1;
          margin-bottom: 8px;
        }

        .type-label {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          font-family: SourceHanSansSC, SourceHanSansSC;
        }

        // 较大隐患 - 橙色
        &.type-major {
          .type-value {
            background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
          }
        }

        // 重大隐患 - 红色
        &.type-significant {
          .type-value {
            background: linear-gradient(0deg, #ff4d4f 0%, #ff7875 100%);
          }
        }

        // 一般隐患 - 蓝色
        &.type-general {
          .type-value {
            background: linear-gradient(0deg, #1677ff 0%, #40a9ff 100%);
          }
        }
      }
    }

    // 整改状态
    .rectification-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;

      .rectification-item {
        height: 92px;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.02);
        }

        .left-nums {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          flex: 1;
        }

        .rectification-item-title {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 18px;
          color: #d3eaf1;
        }

        .rectification-item-value {
          .value {
            font-family: YouSheBiaoTiHei;
            font-size: 36px;
            color: #ffffff;
            line-height: 1;

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
            background: transparent !important;
          }
        }

        .right-chart {
          width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-right: 10px;

          .status-chart {
            width: 70px;
            height: 70px;
          }
        }
      }
    }
  }
}
</style>