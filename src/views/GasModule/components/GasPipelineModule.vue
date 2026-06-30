<template>
  <div class="data-module gas-pipeline-module">
    <div class="module-header">
      <div class="module-title">燃气管网</div>
    </div>
    <div class="module-content">
      <!-- 管线材质分布 3D 饼图 -->
      <div class="charts-container">
        <div class="chart-wrapper">
          <div class="chart-3d" ref="chartRef"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import { FONT_SIZE } from "@/assets/styles/font-sizes";

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

const pieColors = ["#3B8BF5", "#00D9FF", "#7B61FF", "#FFD15C", "#26C2E2"];

function getPieOption(pieData: { name: string; value: number }[]) {
  return {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#1677ff",
      borderWidth: 1,
      textStyle: { color: "#ffffff", fontSize: FONT_SIZE.heading },
      formatter: "{b}: {c}  ({d}%)",
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "40%",
        style: {
          text: pieData[0]?.name || "",
          fill: "#E4F3FF",
          fontSize: FONT_SIZE.title,
          fontWeight: "bold",
          textAlign: "center",
        },
      },
      {
        type: "text",
        left: "center",
        top: "52%",
        style: {
          text: `${pieData[0]?.value || 0} `,
          fill: "#00D9FF",
          fontSize: FONT_SIZE.hero,
          fontWeight: "bold",
          textAlign: "center",
        },
      },
    ],
    series: [
      {
        type: "pie",
        radius: ["45%", "75%"],
        center: ["50%", "50%"],
        silent: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: "rgba(0, 0, 0, 0.3)",
          borderWidth: 2,
        },
        label: { show: false },
        labelLine: { show: false },
        data: pieData.map((item, i) => ({
          ...item,
          itemStyle: { color: pieColors[i % pieColors.length] },
        })),
      },
    ],
  };
}

const handleResize = () => chart?.resize();

onMounted(async () => {
  await nextTick();
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    chart.setOption(getPieOption([{ name: "PE", value: 153 }]));
  }
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
});
</script>

<style lang="scss" scoped>
.gas-pipeline-module {
  flex: 1;

  .module-content {
    gap: 16px;
  }

  .charts-container {
    width: 100%;
    height: 100%;

    .chart-wrapper {
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(0, 150, 255, 0.05) 0%,
        rgba(0, 100, 200, 0.02) 100%
      );
      border: 1px solid rgba(22, 119, 255, 0.2);
      border-radius: 8px;

      .chart-3d {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
