<template>
  <div class="data-module gas-pipeline-module">
    <div class="module-header">
      <div class="module-title">燃气管网</div>
    </div>
    <div class="module-content">
      <!-- 顶部统计卡片 -->
      <div class="top-stats">
        <div class="stat-card">
          <div class="stat-label">管线总长</div>
          <span class="stat-value gradient-text"> {{ totalLength }}km </span>
        </div>
        <div class="stat-card">
          <div class="stat-label">管点</div>
          <span class="stat-value gradient-text"> {{ totalPoints }}个 </span>
        </div>
      </div>

      <!-- 3D饼图区域 -->
      <div class="charts-container">
        <!-- 压力等级分布 -->
        <div class="chart-wrapper">
          <div class="chart-3d" ref="pressureChartRef"></div>
        </div>

        <!-- 气源类型分布 -->
        <div class="chart-wrapper">
          <div class="chart-3d" ref="gasTypeChartRef"></div>
        </div>
      </div>

      <!-- 管井统计 -->
      <div class="well-statistics">
        <div class="well-total">
          <span class="total-label">管井总数</span>
          <span class="total-value gradient-text">{{ totalWells }}个</span>
        </div>

        <div class="well-list">
          <div class="well-item" v-for="item in wellData" :key="item.type">
            <div class="well-label">{{ item.label }}</div>
            <div class="well-bar">
              <div class="bar-bg">
                <div
                  class="bar-fill normal"
                  :style="{ width: (item.normal / item.total) * 100 + '%' }"
                ></div>
                <div
                  class="bar-fill abnormal"
                  :style="{ width: (item.abnormal / item.total) * 100 + '%' }"
                ></div>
              </div>
              <div class="well-value">
                <span class="normal-text">{{ item.normal }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount, computed } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
import {
  getGasCdRatio,
  getGasPubunderpointRatio,
  getGasMaterialRatio,
} from "@/services/gasService";
import { getCachedDictionary } from "@/services/dictionaryService";

const pressureChartRef = ref(null);
const gasTypeChartRef = ref(null);
let pressureChart = null;
let gasTypeChart = null;

// 管线总长
const totalLength = ref(0);

// 管点总数
const totalPoints = ref(0);

// 压力等级分布饼图数据
const pressureChartData = ref([]);

// 气源类型分布饼图数据
const gasTypeChartData = ref([]);

// 管井总数
const totalWells = computed(() => {
  return wellData.value.reduce((sum, item) => sum + item.total, 0);
});

// 管井数据
const wellData = ref([]);

// 获取3D扇形的参数方程
function getParametricEquation(
  startRatio,
  endRatio,
  isSelected,
  isHovered,
  k,
  height
) {
  // 计算
  const midRatio = (startRatio + endRatio) / 2;
  const startRadian = startRatio * Math.PI * 2;
  const endRadian = endRatio * Math.PI * 2;
  const midRadian = midRatio * Math.PI * 2;

  // 如果只有一个扇形,则不实现选中效果
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false;
  }

  // 通过扇形内径/外径的值,换算出辅助参数 k(默认值 1/3)
  k = typeof k !== "undefined" ? k : 1 / 3;

  // 计算选中效果分别在 x 轴、y 轴方向上的位移(未选中,则位移均为 0)
  const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0;
  const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0;

  // 计算高亮效果的放大比例(未高亮,则比例为 1)
  const hoverRate = isHovered ? 1.05 : 1;

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },
    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20,
    },
    x: function (u, v) {
      if (u < startRadian) {
        return (
          offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      if (u > endRadian) {
        return (
          offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
    },
    y: function (u, v) {
      if (u < startRadian) {
        return (
          offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      if (u > endRadian) {
        return (
          offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
    },
    z: function (u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u);
      }
      return Math.sin(v) > 0 ? 1 * height : -1;
    },
  };
}

// 生成模拟 3D 饼图的配置项
function getPie3D(pieData, internalDiameterRatio) {
  const series = [];
  let sumValue = 0;
  let startValue = 0;
  let endValue = 0;
  const legendData = [];
  const k =
    typeof internalDiameterRatio !== "undefined"
      ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
      : 1 / 3;

  // 为每一个饼图数据,生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value;

    const seriesItem = {
      name:
        typeof pieData[i].name === "undefined" ? `series${i}` : pieData[i].name,
      type: "surface",
      parametric: true,
      wireframe: {
        show: false,
      },
      pieData: pieData[i],
      pieStatus: {
        selected: false,
        hovered: false,
        k: k,
      },
    };

    if (typeof pieData[i].itemStyle !== "undefined") {
      const itemStyle = {};
      typeof pieData[i].itemStyle.color !== "undefined"
        ? (itemStyle.color = pieData[i].itemStyle.color)
        : null;
      typeof pieData[i].itemStyle.opacity !== "undefined"
        ? (itemStyle.opacity = pieData[i].itemStyle.opacity)
        : null;
      seriesItem.itemStyle = itemStyle;
    }
    series.push(seriesItem);
  }

  // 使用上一次遍历时,计算出的数据和 sumValue,调用 getParametricEquation 函数
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value;
    series[i].pieData.startRatio = startValue / sumValue;
    series[i].pieData.endRatio = endValue / sumValue;
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      false,
      false,
      k,
      0.1
    );
    startValue = endValue;
    legendData.push(series[i].name);
  }

  return series;
}

// 生成3D饼图option
function get3DPieOption(pieData) {
  const series = getPie3D(pieData, 0.6);

  // 添加2D饼图用于显示label
  series.push({
    name: "pie2d",
    type: "pie",
    label: {
      opacity: 1,
      position: "outside",
      fontSize: 18,
      lineHeight: 22,
      formatter: "{b}\n{d}%",
      color: "#E4F3FF",
    },
    labelLine: {
      length: 15,
      length2: 20,
      lineStyle: {
        color: "rgba(228, 243, 255, 0.5)",
        width: 1,
      },
    },
    startAngle: -20,
    clockwise: false,
    radius: ["20%", "60%"],
    center: ["50%", "50%"],
    data: pieData.map((item) => {
      return {
        ...item,
        itemStyle: {
          ...item.itemStyle,
          opacity: 0,
        },
      };
    }),
  });

  const option = {
    animation: true,
    animationDuration: 2000,
    animationEasing: "cubicOut",
    tooltip: {
      formatter: (params) => {
        if (params.seriesName !== "pie2d") {
          return `${params.seriesName}<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>${params.seriesIndex < series.length - 1 ? series[params.seriesIndex].pieData.value : ""}%`;
        }
      },
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#1677ff",
      borderWidth: 1,
      textStyle: {
        color: "#ffffff",
        fontSize: 18,
      },
    },
    xAxis3D: {
      min: -1,
      max: 1,
    },
    yAxis3D: {
      min: -1,
      max: 1,
    },
    zAxis3D: {
      min: -1,
      max: 1,
    },
    grid3D: {
      show: false,
      boxHeight: 10,
      viewControl: {
        alpha: 30,
        beta: 40,
        distance: 150,
        autoRotate: false,
        rotateSensitivity: 0,
        zoomSensitivity: 0,
        panSensitivity: 0,
      },
    },
    series: series,
  };

  return option;
}

// 初始化压力等级分布图表
const initPressureChart = () => {
  if (!pressureChartRef.value) return;

  pressureChart = echarts.init(pressureChartRef.value);

  const pressureData = pressureChartData.value;
  const option = get3DPieOption(pressureData);
  pressureChart.setOption(option);
};

// 初始化气源类型分布图表
const initGasTypeChart = () => {
  if (!gasTypeChartRef.value) return;

  gasTypeChart = echarts.init(gasTypeChartRef.value);

  const gasTypeData = gasTypeChartData.value;

  const option = get3DPieOption(gasTypeData);
  gasTypeChart.setOption(option);
};

// 获取管线长度数据
const fetchGasCdRatio = async () => {
  try {
    const data = await getGasCdRatio();
    // 计算总长度（假设ratio是百分比，count是公里数）
    totalLength.value = data.reduce((sum, item) => sum + item.count, 0);

    // 转换为压力等级分布饼图数据
    pressureChartData.value = data.map((item) => ({
      name: gxdlbMap.value[item.materialType] || item.materialType,
      value: parseFloat(item.ratio) || 0,
      itemStyle: {
        opacity: 0.9,
      },
    }));

    console.log("获取管线长度数据:", data);
  } catch (error) {
    console.error("获取管线长度数据失败:", error);
  }
};

// 获取管点数据
const fetchGasPubunderpointRatio = async () => {
  try {
    const data = await getGasPubunderpointRatio();
    // 计算管点总数
    totalPoints.value = data.reduce((sum, item) => sum + item.count, 0);

    // 转换为气源类型分布饼图数据
    gasTypeChartData.value = data.map((item) => ({
      name: gxdlbMap.value[item.materialType] || item.materialType,
      value: parseFloat(item.ratio) || 0,
      itemStyle: {
        opacity: 0.9,
      },
    }));

    console.log("获取管点数据:", data);
  } catch (error) {
    console.error("获取管点数据失败:", error);
  }
};

// 获取管井材料类型数据
const fetchGasMaterialRatio = async () => {
  try {
    const data = await getGasMaterialRatio();

    // 更新管井数据
    wellData.value = data.map((item) => ({
      type: item.materialType,
      label: gwczMap.value[item.materialType] || item.materialType, // 可根据需要映射为中文名称
      normal: item.count,
      abnormal: 0, // 如果没有异常数据，可以设为0或者从其他地方获取
      total: item.count,
    }));

    console.log("获取管井材料类型数据:", data);
  } catch (error) {
    console.error("获取管井材料类型数据失败:", error);
  }
};

// 窗口调整
const handleResize = () => {
  pressureChart?.resize();
  gasTypeChart?.resize();
};
const gxdlbMap = ref({});
const gwczMap = ref({});

onMounted(async () => {
  // 管线点类别
  const dictionaries = await getCachedDictionary("gxdlb_rq");
  gxdlbMap.value = dictionaries.reduce((acc, cur) => {
    acc[cur.f_ItemValue] = cur.f_ItemName;
    return acc;
  }, {});
  // 官网材质
  const dictionaries2 = await getCachedDictionary("gwcz");
  gwczMap.value = dictionaries2.reduce((acc, cur) => {
    acc[cur.f_ItemValue] = cur.f_ItemName;
    return acc;
  }, {});

  // 获取真实数据
  await fetchGasCdRatio();
  await fetchGasPubunderpointRatio();
  await fetchGasMaterialRatio(); // 获取管井材料类型数据

  await nextTick();
  initPressureChart();
  initGasTypeChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  pressureChart?.dispose();
  gasTypeChart?.dispose();
});
</script>

<style lang="scss" scoped>
.gas-pipeline-module {
  .module-content {
    gap: 25px;
  }

  // 顶部统计卡片
  .top-stats {
    display: flex;
    gap: 30px;

    .stat-card {
      flex: 1;
      background-image: url("@/assets/img/gasModule/pipeline_title.webp");
      display: flex;
      width: 318.3px;
      height: 51.17px;
      padding: 0 47px 0 26px;
      justify-content: space-around;
      align-items: center;
      background-size: 100% 100%;

      .stat-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: bold;
        font-size: 26px;
        color: #effaff;
        line-height: 37px;
        text-align: center;
        font-style: normal;
      }

      .stat-value {
        font-family: YouSheBiaoTiHei;
        font-size: 26px;
        color: #ffffff;
        line-height: 34px;
        text-align: center;
        font-style: normal;
        background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
      }
    }
  }

  // 3D饼图容器
  .charts-container {
    display: flex;
    gap: 30px;

    .chart-wrapper {
      flex: 1;
      background: linear-gradient(
        135deg,
        rgba(0, 150, 255, 0.05) 0%,
        rgba(0, 100, 200, 0.02) 100%
      );
      border: 1px solid rgba(22, 119, 255, 0.2);
      border-radius: 8px;
      position: relative;

      .chart-3d {
        width: 320px;
        height: 160px;
      }
    }
  }

  // 管井统计
  .well-statistics {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 16px;

    .well-total {
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-image: url("@/assets/img/gasModule/well_total.webp");
      width: 176px;
      height: 126px;

      .total-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: bold;
        font-size: 26px;
        color: #effaff;
        line-height: 37px;
        text-align: center;
        font-style: normal;
        margin-bottom: 12px;
      }

      .total-value {
        font-family: YouSheBiaoTiHei;
        font-size: 30px;
        color: #ffffff;
        line-height: 39px;
        text-align: center;
        font-style: normal;
        background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
      }
    }

    .well-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      // gap: 18px;

      .well-item {
        display: flex;
        align-items: center;
        // gap: 20px;

        .well-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 20px;
          color: #e4f3ff;
          line-height: 29px;
          text-align: right;
          font-style: normal;
          width: 120px;
          margin-right: 16px;
        }

        .well-bar {
          flex: 1;
          display: flex;
          align-items: center;

          .bar-bg {
            flex: 1;
            height: 12px;
            background: rgba(0, 0, 0, 0.3);
            overflow: hidden;
            display: flex;
            position: relative;
            margin-right: 16px;

            .bar-fill {
              height: 100%;
              transition: width 0.8s ease;

              &.normal {
                background: linear-gradient(90deg, #00d9ff 0%, #00a3cc 100%);
              }

              &.abnormal {
                background: linear-gradient(90deg, #ff6b35 0%, #ff4500 100%);
              }
            }
          }

          .well-value {
            width: 120px;
            font-family: YouSheBiaoTiHei;
            font-size: 32px;
            text-align: right;

            .normal-text {
              color: #00d9ff;
            }

            .separator {
              color: #9ec3e8;
              margin: 0 4px;
            }

            .abnormal-text {
              color: #ff6b35;
            }
          }
        }
      }
    }

    .legend {
      display: flex;
      gap: 12px;
      padding-left: 20px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;

        .legend-color {
          width: 20px;
          height: 10px;
          border-radius: 2px;

          &.normal {
            background: linear-gradient(90deg, #00d9ff 0%, #00a3cc 100%);
          }

          &.abnormal {
            background: linear-gradient(90deg, #ff6b35 0%, #ff4500 100%);
          }
        }

        .legend-text {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 24px;
          color: #e4f3ff;
        }
      }
    }
  }
}
</style>
