<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险点</div>
    </div>
    <div class="module-content">
      <div class="risk-total-row">
        <span class="risk-total-label">风险总数</span>
        <span class="risk-total-value gradient-text">{{ totalRisk }}</span>
      </div>
      <div class="risk-container">
        <!-- 左侧:多环形图 -->
        <div class="left-chart">
          <RiskLevelChart
            ref="riskChartRef"
            :chart-id="riskChartId"
            :sszx="'csaqzx_rq'"
            @dataLoaded="onDataLoaded"
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
import { ref } from "vue";
import RiskLevelChart from "@/components/RiskLevelChart.vue";

// ==================== 数据状态 ====================

// 风险图表唯一ID
const riskChartId = 'risk-chart-gas';
const riskChartRef = ref<InstanceType<typeof RiskLevelChart> | null>(null);
const totalRisk = ref(0);

const onDataLoaded = (data: { name: string; color: string; value: number }[]) => {
  totalRisk.value = data.reduce((sum, item) => sum + (item.value || 0), 0);
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
//     const rqzxglmblxDictionaries = await getCachedDictionary("glmblx_rq");
//     if (!rqzxglmblxDictionaries || rqzxglmblxDictionaries.length === 0) {
//       console.warn("rqzx_glmblx 字典为空");
//       return false;
//     }
//     glmblxs = rqzxglmblxDictionaries
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
// const fetchHazardLevelDictionary = async (): Promise<{ [key: string]: string } | null> => {
//   try {
//     const dictionaries = await getCachedDictionary("yhdj");
//     if (!dictionaries || dictionaries.length === 0) {
//       console.warn("隐患等级字典 (yhdj) 为空");
//       return null;
//     }
//
//     const map: { [key: string]: string } = {};
//     dictionaries.forEach((item: any) => {
//       map[item.f_ItemValue] = item.f_ItemName;
//     });
//     return map;
//   } catch (error) {
//     hazardLevelError.value = `获取隐患等级字典失败: ${error}`;
//     console.error(hazardLevelError.value);
//     return null;
//   }
// };

// const fetchHazardLevelData = async (): Promise<void> => {
//   if (!glmblxs) {
//     console.warn("Glmblx 参数未初始化，跳过隐患等级数据获取");
//     hazardLevelData.value = [];
//     return;
//   }
//
//   isHazardLevelLoading.value = true;
//   hazardLevelError.value = null;
//
//   try {
//     const hazardLevelMap = await fetchHazardLevelDictionary();
//     if (!hazardLevelMap) {
//       hazardLevelData.value = [];
//       return;
//     }
//
//     const data = (await getHazardLevelCountList({
//       Sszx: glmblxs,
//     })) as any[];
//
//     if (!data || data.length === 0) {
//       console.info("隐患等级数据为空");
//       hazardLevelData.value = [];
//       updateHazardStatistics([]);
//       return;
//     }
//
//     hazardLevelData.value = data.map((item) => ({
//       value: item.riskType,
//       name: hazardLevelMap[item.riskType] || item.riskType,
//       count: item.count || 0,
//     }));
//
//     updateHazardStatistics(hazardLevelData.value);
//   } catch (error) {
//     hazardLevelError.value = `获取隐患等级数据失败: ${error}`;
//     console.error(hazardLevelError.value);
//     hazardLevelData.value = [];
//     updateHazardStatistics([]);
//   } finally {
//     isHazardLevelLoading.value = false;
//   }
// };

// const updateHazardStatistics = (data: any[]): void => {
//   const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
//   totalHazard.value = total;
//
//   const hazardCount = Math.floor(total / 3);
//   const remainder = total % 3;
//   hazardTypes.value = [
//     {
//       type: "major",
//       label: "较大隐患",
//       count: hazardCount + (remainder > 0 ? 1 : 0),
//     },
//     {
//       type: "significant",
//       label: "重大隐患",
//       count: hazardCount + (remainder > 1 ? 1 : 0),
//     },
//     { type: "general", label: "一般隐患", count: hazardCount },
//   ];
// };
// ==================== 整改状态数据获取（模块3） ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const fetchRectificationDictionary = async (): Promise<{ [key: string]: string } | null> => {
//   try {
//     const dictionaries = await getCachedDictionary("zgzt");
//     if (!dictionaries || dictionaries.length === 0) {
//       console.warn("整改状态字典 (zgzt) 为空");
//       return null;
//     }
//     const map: { [key: string]: string } = {};
//     dictionaries.forEach((item: any) => {
//       map[item.f_ItemValue] = item.f_ItemName;
//     });
//     return map;
//   } catch (error) {
//     rectificationError.value = `获取整改状态字典失败: ${error}`;
//     console.error(rectificationError.value);
//     return null;
//   }
// };

// const zgztStatusMap: { [key: string]: string } = {
//   "已整改": "rectified",
//   "未整改": "notRectified",
//   "整改中": "inRectification",
//   "持续跟进": "continuousImprovement",
// };

// const fetchRectificationData = async (): Promise<void> => {
//   if (!glmblxs) {
//     console.warn("Glmblx 参数未初始化，跳过整改状态数据获取");
//     rectificationData.value = getDefaultRectificationStates();
//     return;
//   }
//   isRectificationLoading.value = true;
//   rectificationError.value = null;
//   try {
//     const rectificationMap = await fetchRectificationDictionary();
//     if (!rectificationMap) {
//       rectificationData.value = getDefaultRectificationStates();
//       return;
//     }
//     const data = (await getRiskStatusCount({ Glmblx: glmblxs })) as any[];
//     if (!data || data.length === 0) {
//       console.info("整改状态数据为空");
//       rectificationData.value = getDefaultRectificationStates();
//       return;
//     }
//     const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
//     const transformedData = data.map((item) => {
//       const statusName = rectificationMap[item.riskStatus] || item.riskStatus;
//       const statusKey = zgztStatusMap[statusName] || "unknown";
//       return {
//         title: statusName,
//         count: item.count || 0,
//         status: statusKey,
//         progress: totalCount > 0 ? (item.count || 0) / totalCount : 0,
//       };
//     });
//     const defaultStates = getDefaultRectificationStates();
//     transformedData.forEach((item) => {
//       const defaultIndex = defaultStates.findIndex(
//         (r) => r.status === item.status
//       );
//       if (defaultIndex >= 0) {
//         defaultStates[defaultIndex] = item;
//       }
//     });
//     rectificationData.value = defaultStates;
//   } catch (error) {
//     rectificationError.value = `获取整改状态数据失败: ${error}`;
//     console.error(rectificationError.value);
//     rectificationData.value = getDefaultRectificationStates();
//   } finally {
//     isRectificationLoading.value = false;
//   }
// };

// const getDefaultRectificationStates = () => [
//   { title: "已整改", count: 0, status: "rectified", progress: 0 },
//   { title: "未整改", count: 0, status: "notRectified", progress: 0 },
//   { title: "整改中", count: 0, status: "inRectification", progress: 0 },
//   { title: "持续跟进", count: 0, status: "continuousImprovement", progress: 0 },
// ];

// ==================== 图表渲染 ====================
// （暂时隐藏右侧面板，后期可能恢复）
// const renderRectificationCharts = () => {
//   rectificationData.value.forEach((item) => {
//     const chart = initChart(`status-chart-${item.status}`);
//     if (!chart) return;
//     try {
//       const option = createProgressOption(item.progress, item.status);
//       chart.setOption(option);
//     } catch (error) {
//       console.warn(`渲染整改状态图表失败 - ${item.status}:`, error);
//     }
//   });
// };

// ==================== 生命周期 ====================
// （暂时隐藏右侧面板，onMounted 不再需要）
// onMounted(() => {
//   // 右侧面板暂时隐藏，不再获取隐患等级和整改状态数据
//   // 风险等级由 RiskLevelChart 子组件自行获取
// });
</script>

<style lang="scss" scoped>
.risk-hazard-module {

  .risk-total-row {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8px;

    .risk-total-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-title);
      color: #d3eaf1;
    }

    .risk-total-value {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-title);
      background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
    }
  }

  .risk-container {
    display: flex;
    flex-direction: row;
    gap: 10px;
    height: 100%;
  }

  // 左侧多环形图区域
  .left-chart {
    width: 100%;
    height: 100%;
  }

  // 右侧统计区域
  .right-stats {
    width: 62%;
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
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-heading);
        color: #d3eaf1;
        line-height: calc(var(--font-size-caption) * var(--line-height-normal));
        letter-spacing: 1px;
        text-align: center;
        font-style: normal;
      }

      .total-value {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-subtitle);
        line-height: calc(var(--font-size-subtitle) * 1.3);
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
          font-size: var(--font-size-subtitle);
          font-weight: var(--font-weight-bold);
          font-family: YouSheBiaoTiHei;
          line-height: 1;
          margin-bottom: 8px;
        }

        .type-label {
          font-size: var(--font-size-heading);
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
        align-items: center;
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
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-body);
          color: #d3eaf1;
        }

        .rectification-item-value {
          .value {
            font-family: YouSheBiaoTiHei;
            font-size: var(--font-size-title);
            color: #ffffff;
            line-height: 1;

            &.progress-continuousImprovement {
              background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
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
            font-weight: var(--font-weight-normal);
            font-size: var(--font-size-mini);
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