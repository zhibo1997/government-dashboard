<template>
  <div class="risk-point-panel">
    <div class="panel-title">{{ moduleName }}风险点</div>
    <div class="panel-body">
      <div class="risk-total-row">
        <span class="risk-total-label">风险总数</span>
        <span class="risk-total-value gradient-text">{{ totalRisk }}</span>
        <span class="risk-total-unit">个</span>
      </div>
      <div class="chart-area">
        <RiskLevelChart
          :chart-id="chartId"
          :sszx="currentSszx"
          @data-loaded="onDataLoaded"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import RiskLevelChart from "@/components/RiskLevelChart.vue";

const route = useRoute();

const sszxMap: Record<string, string> = {
  bridge: "csaqzx_ql",
  waterProject: "csaqzx_gs",
  gas: "csaqzx_rq",
  drainage: "csaqzx_ps",
};

const moduleNameMap: Record<string, string> = {
  bridge: "桥梁",
  waterProject: "供水",
  gas: "燃气",
  drainage: "排水",
  home: "",
};

const currentSszx = computed(() => sszxMap[route.name as string] || "");
const moduleName = computed(() => moduleNameMap[route.name as string] || "");

const chartId = "risk-chart-popup";
const totalRisk = ref(0);

const onDataLoaded = (data: { name: string; color: string; value: number }[]) => {
  totalRisk.value = data.reduce((sum, item) => sum + (item.value || 0), 0);
};
</script>

<style lang="scss" scoped>
.risk-point-panel {
  padding: 24px;

  .panel-title {
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .panel-body {
    .risk-total-row {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;

      .risk-total-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-3xl);
        color: #d3eaf1;
      }

      .risk-total-value {
        font-family: YouSheBiaoTiHei;
        font-size: 36px;
        background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
      }

      .risk-total-unit {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-3xl);
        color: #d3eaf1;
      }
    }

    .chart-area {
      width: 100%;
      height: 360px;
    }
  }
}
</style>
