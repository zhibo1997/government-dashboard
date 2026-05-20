<template>
  <div class="data-module pipeline-module">
    <div class="module-header">
      <div class="module-title">{{ moduleConfig.moduleName }}管网</div>
    </div>
    <div class="module-content pipeline-module-content">
      <div class="hidden-danger">
        <div class="danger-header">
          <span class="danger-count">{{ dangerCount }}</span>
          <span class="danger-text">{{ moduleConfig.moduleName }}管网隐患</span>
        </div>
        <div id="danger-chart" class="danger-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, inject } from "vue";
import { dangerBarOption } from "./ehcartsOptions";
import * as echarts from "echarts";
import {
  getDrainageRiskCount,
  getWaterSupplyRiskCount,
} from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
// 从根组件接收模块配置
const moduleConfig = inject('MODULE_CONFIG', {
  sszx: 'csaqzx_gs',
  imagePath: 'waterSupply',
  moduleName: '供水',

  dictKey: {
    yhlx: 'yhlx_gs'
  }
});

const dangerCount = ref(0);

// 隐患柱状图颜色
const dangerColors = ["#f76204", "#f5a623", "#e6a235", "#4D74FF", "#5D87AC", "#93DBFF"];

const initHiddenDangerTypes = async () => {
  const yhlx = moduleConfig.dictKey?.yhlx || "";
  const res = await getCachedDictionary(yhlx);
  const dangerTypeMap = {};
  res.forEach((item) => {
    dangerTypeMap[item.f_ItemValue] = item.f_ItemName;
  });
  let riskRes;
  if (moduleConfig.sszx == "csaqzx_gs") {
    riskRes = await getWaterSupplyRiskCount({ Sszx: moduleConfig.sszx });
  } else if (moduleConfig.sszx == "csaqzx_ps") {
    riskRes = await getDrainageRiskCount({ Sszx: moduleConfig.sszx });
  }
  const riskData = Array.isArray(riskRes) ? riskRes : (riskRes?.data || []);

  dangerCount.value = (riskData as any[]).reduce((total, item) => total + item.count, 0);

  const sortedRiskRes = [...(riskData as any[])].sort((a, b) => b.count - a.count);

  nextTick(() => {
    (dangerBarOption as any).xAxis.data = sortedRiskRes.map((item: any) =>
      dangerTypeMap[item.riskType] || item.riskType
    );
    (dangerBarOption as any).series[0].data = sortedRiskRes.map((item: any, idx: number) => ({
      value: item.count,
      itemStyle: {
        color: dangerColors[idx % dangerColors.length],
      },
    }));
    const chartDom = document.getElementById("danger-chart");
    if (chartDom) {
      const dangerChart = echarts.init(chartDom);
      dangerChart.setOption(dangerBarOption);
    }
  });
};

onMounted(async () => {
  initChart();
  initHiddenDangerTypes();
});

const initChart = () => { };
</script>

<style lang="scss" scoped>
.pipeline-module-content {
  display: flex;
  flex-direction: row !important;
}

.hidden-danger {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  .danger-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 0 20px;
    width: 100%;
    box-sizing: border-box;

    .danger-count {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-hero);
      line-height: 62px;
      font-style: normal;
      background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .danger-text {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: var(--font-size-body);
      line-height: 44px;
      font-style: normal;
      color: rgba(228, 243, 255, 0.8);
    }
  }

  .danger-chart {
    width: 100%;
    height: 100%;
  }
}</style>
