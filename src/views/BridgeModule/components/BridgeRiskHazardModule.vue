<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险点</div>
    </div>
    <div class="module-content">
      <div class="risk-container">
        <!-- 风险总数 -->
        <div class="risk-total">
          <span class="risk-total-label">风险总数</span>
          <span class="risk-total-value gradient-text">{{ totalRisk }}</span>
          <span class="risk-total-unit">个</span>
        </div>

        <!-- 多环形图 -->
        <div class="left-chart">
          <RiskLevelChart
            :chart-id="riskChartId"
            :sszx="'csaqzx_ql'"
            @data-loaded="onRiskDataLoaded"
          />
        </div>

        <!-- 右侧:隐患统计和整改状态（暂时隐藏，后期可能恢复） -->
        <!-- <div class="right-stats">
          <div class="stats-container">
            <div class="total-hazard">
              <div class="total-label">隐患总数</div>
              <div class="total-value gradient-text">{{ totalHazard }}</div>
            </div>

            <div class="hazard-types">
              <div class="hazard-type-item" v-for="item in hazardTypes" :key="item.type" :class="`type-${item.type}`">
                <div class="type-value gradient-text">{{ item.count }}</div>
                <div class="type-label">{{ item.label }}</div>
              </div>
            </div>
          </div>

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
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// （暂时隐藏右侧面板，后期可能恢复以下导入）
// import { nextTick, onMounted, ref } from "vue";
// import { getRiskStatusCount, getHazardLevelCountList } from "@/services/waterSupplyService";
// import { getCachedDictionary } from "@/services/dictionaryService";
// import {
//   createProgressOption,
//   initChart,
// } from "../chartOption";
import RiskLevelChart from "@/components/RiskLevelChart.vue";
import { ref } from "vue";

// ==================== 数据状态 ====================

// 风险图表唯一ID
const riskChartId = 'risk-chart-bridge';

// 风险总数
const totalRisk = ref(0);

const onRiskDataLoaded = (data: any[]) => {
  totalRisk.value = data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
};

// 共同参数（暂时隐藏右侧面板，后期可能恢复）
// let glmblxs = "";

// ==================== 隐患等级数据模块（独立）====================
// （暂时隐藏右侧面板，后期可能恢复）
// const hazardLevelData = ref<any[]>([]);
// const totalHazard = ref(0);
// const hazardTypes = ref([
//   { type: "major", label: "较大隐患", count: 0 },
//   { type: "significant", label: "重大隐患", count: 0 },
//   { type: "general", label: "一般隐患", count: 0 },
// ]);
// const isHazardLevelLoading = ref(false);
// const hazardLevelError = ref<string | null>(null);

// ==================== 整改状态数据模块 ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const rectificationData = ref([
//   { title: "已整改", count: 0, status: "rectified", progress: 0 },
//   { title: "未整改", count: 0, status: "notRectified", progress: 0 },
//   { title: "整改中", count: 0, status: "inRectification", progress: 0 },
//   { title: "持续跟进", count: 0, status: "continuousImprovement", progress: 0 },
// ]);
// const isRectificationLoading = ref(false);
// const rectificationError = ref<string | null>(null);

// ==================== 字典映射 ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const zgztMap = {
//   已整改: "rectified",
//   未整改: "notRectified",
//   整改中: "inRectification",
//   持续跟进: "continuousImprovement",
// };

// ==================== 初始化共同参数 ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const initializeGlmblxs = async (): Promise<boolean> => {
//   try {
//     const glmbqlDictionaries = await getCachedDictionary("glmb_ql");
//     if (!glmbqlDictionaries || glmbqlDictionaries.length === 0) {
//       console.warn("glmb_ql 字典为空");
//       return false;
//     }
//     glmblxs = glmbqlDictionaries
//       .map((item: any) => item.f_ItemValue)
//       .join(",");
//     return true;
//   } catch (error) {
//     console.error("初始化 Glmblx 参数失败:", error);
//     return false;
//   }
// };

// ==================== 隐患等级数据获取（模块2 - 独立） ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const fetchHazardLevelDictionary = async (): Promise<{ [key: string]: string } | null> => { ... };
// const fetchHazardLevelData = async (): Promise<void> => { ... };
// const updateHazardStatistics = (data: any[]): void => { ... };

// ==================== 整改状态数据获取（模块3） ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const fetchRectificationDictionary = async () => { ... };
// const fetchRectificationData = async () => { ... };
// const getDefaultRectificationStates = () => [ ... ];

// ==================== 图表渲染 ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const renderRectificationCharts = () => { ... };

// ==================== 生命周期 ====================
// （暂时隐藏右侧面板，onMounted 不再需要）
// onMounted(() => {
//   // 右侧面板暂时隐藏，不再获取隐患等级和整改状态数据
//   // 风险等级由 RiskLevelChart 子组件自行获取
// });
</script>

<style lang="scss" scoped>
.risk-hazard-module {

  .risk-total {
    text-align: center;
    margin-bottom: 8px;

    .risk-total-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: var(--font-size-heading);
      color: #d3eaf1;
    }

    .risk-total-value {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-subtitle);
      margin: 0 6px;
      background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
    }

    .risk-total-unit {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: var(--font-size-heading);
      color: #d3eaf1;
    }
  }

  .risk-container {
    display: flex;
    flex-direction: column;
    // gap: 10px;
    height: 100%;
  }

  // 左侧多环形图区域
  .left-chart {
    width: 100%;
    height: 100%;
  }

  // 右侧统计区域（暂时隐藏，后期可能恢复）
  // .right-stats {
  //   width: 62%;
  //   display: flex;
  //   flex-direction: column;
  //   gap: 20px;
  //
  //   .stats-container { ... }
  //   .total-hazard { ... }
  //   .hazard-types { ... }
  //   .rectification-section { ... }
  // }
}
</style>
