<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险隐患</div>
    </div>
    <div class="module-content">
      <!-- <div class="risk-content">
        <div id="risk-chart" class="risk-echart"></div>
        <div class="risk-legend">
          <div class="legend-item" v-for="item in riskLegend" :key="item.name">
            <div class="legend-name">
              <span
                class="legend-color"
                :style="{ backgroundColor: item.color }"
              ></span>
              {{ item.name }}
            </div>
            <div class="legend-value gradient-text">
              {{ item.value }}
              <span class="unit">个</span>
            </div>
          </div>
        </div>
      </div> -->
      <!-- 整改状态 -->
      <div class="rectification-section">
        <div
          class="rectification-item"
          v-for="item in rectificationData"
          :key="item.status"
        >
          <div class="left-nums">
            <div class="rectification-item-title">{{ item.title }}</div>
            <div class="rectification-item-value">
              <span
                class="value gradient-text"
                :class="`progress-${item.status}`"
                >{{ item.count }}</span
              >
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

<script setup>
import { nextTick, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { getRiskStatusCount } from "@/services/waterSupplyService";
import { getDataItemDetails } from "@/services/commonService";

const zgztMap = {
  已整改: "rectified",
  未整改: "notRectified",
  整改中: "inRectification",
  持续跟进: "continuousImprovement",
};
const rectificationData = ref([]);

onMounted(async () => {
  // 获取整改状态字典
  const dictionaries = await getDataItemDetails("zgzt");
  const res = await getRiskStatusCount();

  const zgCount = res.reduce((sum, item) => sum + item.count, 0);
  rectificationData.value = res.map((item) => {
    const status = dictionaries.find(
      (statusItem) => statusItem.f_ItemValue === item.riskStatus
    );
    return {
      title: status.f_ItemName,
      count: item.count,
      status: zgztMap[status.f_ItemName],
      progress: item.count / zgCount,
    };
  });

  // 初始化风险隐患多环形图
  const chartDom = document.getElementById("risk-chart");
  if (chartDom) {
    const myChart = echarts.init(chartDom);

    // 反向阴影效果
    const placeHolderStyle = {
      label: {
        show: false,
        position: "center",
      },
      labelLine: {
        show: false,
      },
      itemStyle: {
        color: "rgba(29, 57, 64, 0.5)",
        borderColor: "rgba(29, 57, 64, 0.8)",
        borderWidth: 8,
      },
      emphasis: {
        disabled: true,
      },
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
          lineStyle: {
            color: "rgba(211, 234, 241, 0.3)",
          },
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
      legend: {
        show: false, // 不显示图例
      },
      series: [
        {
          name: "已消除风险",
          type: "pie",
          clockWise: true, // 逆时针旋转
          hoverAnimation: true,
          radius: [90, 91],
          ...labelStyle("#9bb8c7", 40),
          data: [
            {
              value: 18,
              name: "已消除风险",
            },
            {
              value: 50,
              name: "",
              ...placeHolderStyle,
            },
          ],
        },
        {
          name: "已监测风险",
          type: "pie",
          clockWise: true,
          hoverAnimation: true,
          radius: [70, 71],
          ...labelStyle("#61E29D", 50),
          data: [
            {
              value: 25,
              name: "已监测风险",
            },
            {
              value: 43,
              name: "",
              ...placeHolderStyle,
            },
          ],
        },
        {
          name: "巡查管控",
          type: "pie",
          clockWise: true,
          hoverAnimation: true,
          radius: [50, 51],
          ...labelStyle("#F4D982", 60),
          data: [
            {
              value: 15,
              name: "巡查管控",
            },
            {
              value: 53,
              name: "",
              ...placeHolderStyle,
            },
          ],
        },
        {
          name: "未管控",
          type: "pie",
          clockWise: true,
          hoverAnimation: true,
          radius: [30, 31],
          ...labelStyle("#E88D6B", 70),
          data: [
            {
              value: 10,
              name: "未管控",
            },
            {
              value: 58,
              name: "",
              ...placeHolderStyle,
            },
          ],
        },
      ],
    });
  }
  nextTick(() => { 

    rectificationData.value.forEach((item) => {
      const chartDom = document.getElementById(`status-chart-${item.status}`);
      if (chartDom) {
        const chart = echarts.init(chartDom);
        chart.setOption(createProgressOption(item.progress, item.status));
      }
    });
  });
  // 初始化所有整改状态环形图
});

const riskLegend = [
  {
    name: "已消除风险",
    color: "#9bb8c7",
    value: 18,
  },
  {
    name: "已监测风险",
    color: "#61E29D",
    value: 25,
  },
  {
    name: "巡查管控",
    color: "#F4D982",
    value: 15,
  },
  {
    name: "未管控",
    color: "#E88D6B",
    value: 10,
  },
];

// 创建环形进度图配置
const createProgressOption = (progress, status) => {
  // 根据状态设置不同的颜色
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
        labelLine: {
          show: false,
        },
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
              itemStyle: {
                color: "rgba(255, 255, 255, 0.1)",
              },
            },
          },
        ],
        emphasis: {
          scale: false,
        },
      },
    ],
  };
};
</script>

<style lang="scss" scoped>
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
    margin-top: 20px;
    width: 100%;

    .legend-item {
      padding: 6px 20px;
      margin-bottom: 12px;
      display: flex;
      background-color: #1d3940;
    }

    .legend-name {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 20px;
      color: #d3eaf1;
      line-height: 29px;
      letter-spacing: 1px;
      font-style: normal;
      display: flex;
      align-items: center;

      .legend-color {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 11px;
        display: inline-block;
      }
    }

    .legend-value {
      font-family: YouSheBiaoTiHei;
      font-size: 20px;
      color: #ffffff;
      line-height: 26px;
      text-align: center;
      font-style: normal;
      background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);

      .unit {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 14px;
        color: #d3eaf1;
        line-height: 20px;
        letter-spacing: 1px;
        text-align: left;
        font-style: normal;
        margin-left: 5px;
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
