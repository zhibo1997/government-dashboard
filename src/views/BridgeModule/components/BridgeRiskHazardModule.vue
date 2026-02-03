<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险隐患</div>
    </div>
    <div class="module-content">
      <div class="risk-container">
        <!-- 左侧:多环形图 -->
        <div class="left-chart">
          <RiskLevelChart
            :chart-id="riskChartId"
            :sszx="sszxParam"
            @data-loaded="handleRiskDataLoaded"
          />
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

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { getRiskStatusCount } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
import {
  createProgressOption,
  initChart,
} from "../chartOption";
import RiskLevelChart from "@/components/RiskLevelChart.vue";

// ==================== 数据状态 ====================

// 风险图表唯一ID
const riskChartId = 'risk-chart-bridge';

// 城市安全中心标识（桥梁专项）
const sszxParam = 'csaqzx_ql';

// 共同参数：目标类型字符串（所有接口共用）
let glmblxs = "";

// ==================== 隐患统计数据模块 ====================
const totalHazard = ref(0);
const hazardTypes = ref([
  { type: "major", label: "较大隐患", count: 0 },
  { type: "significant", label: "重大隐患", count: 0 },
  { type: "general", label: "一般隐患", count: 0 },
]);
const isHazardLevelLoading = ref(false);
const hazardLevelError = ref<string | null>(null);

// ==================== 整改状态数据模块 ====================
const rectificationData = ref([
  { title: "已整改", count: 0, status: "rectified", progress: 0 },
  { title: "未整改", count: 0, status: "notRectified", progress: 0 },
  { title: "整改中", count: 0, status: "inRectification", progress: 0 },
  { title: "持续跟进", count: 0, status: "continuousImprovement", progress: 0 },
]);
const isRectificationLoading = ref(false);
const rectificationError = ref<string | null>(null);

// ==================== 字典映射 ====================
/**
 * 整改状态映射
 */
const zgztMap = {
  已整改: "rectified",
  未整改: "notRectified",
  整改中: "inRectification",
  持续跟进: "continuousImprovement",
};

// ==================== 初始化共同参数 ====================
/**
 * 初始化 Glmblx 参数（所有数据接口共用）
 * 通过获取 glmb_ql 字典（桥梁专项），将其 f_ItemValue 拼接成逗号分隔字符串
 * 此参数标准化确保三个数据接口参数一致
 */
const initializeGlmblxs = async (): Promise<boolean> => {
  try {
    const glmbqlDictionaries = await getCachedDictionary("glmb_ql");
    if (!glmbqlDictionaries || glmbqlDictionaries.length === 0) {
      console.warn("glmb_ql 字典为空");
      return false;
    }
    glmblxs = glmbqlDictionaries
      .map((item: any) => item.f_ItemValue)
      .join(",");
    return true;
  } catch (error) {
    console.error("初始化 Glmblx 参数失败:", error);
    return false;
  }
};

// ==================== 风险等级数据回调 ====================
/**
 * 处理风险等级数据加载完成事件
 * 用于更新隐患统计数据
 */
const handleRiskDataLoaded = (data: any[]) => {
  updateHazardStatistics(data);
};

/**
 * 更新隐患统计数据（总数和三类分布）
 * 根据风险等级数据计算三类分布
 */
const updateHazardStatistics = (data: any[]): void => {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  totalHazard.value = total;

  // 计算三类隐患分布（均匀分配）
  const hazardCount = Math.floor(total / 3);
  const remainder = total % 3;
  hazardTypes.value = [
    {
      type: "major",
      label: "较大隐患",
      count: hazardCount + (remainder > 0 ? 1 : 0),
    },
    {
      type: "significant",
      label: "重大隐患",
      count: hazardCount + (remainder > 1 ? 1 : 0),
    },
    { type: "general", label: "一般隐患", count: hazardCount },
  ];
};

// ==================== 整改状态数据获取（模块2） ====================
/**
 * 获取整改状态字典映射
 * 字典类型: zgzt
 */
const fetchRectificationDictionary = async (): Promise<{ [key: string]: string } | null> => {
  try {
    const dictionaries = await getCachedDictionary("zgzt");
    if (!dictionaries || dictionaries.length === 0) {
      console.warn("整改状态字典 (zgzt) 为空");
      return null;
    }
    
    const map: { [key: string]: string } = {};
    dictionaries.forEach((item: any) => {
      map[item.f_ItemValue] = item.f_ItemName;
    });
    return map;
  } catch (error) {
    rectificationError.value = `获取整改状态字典失败: ${error}`;
    console.error(rectificationError.value);
    return null;
  }
};

/**
 * 整改状态映射（f_ItemName -> status key）
 */
const zgztStatusMap: { [key: string]: string } = {
  "已整改": "rectified",
  "未整改": "notRectified",
  "整改中": "inRectification",
  "持续跟进": "continuousImprovement",
};

/**
 * 获取整改状态数据
 * 使用标准化的 Glmblx 参数
 */
const fetchRectificationData = async (): Promise<void> => {
  if (!glmblxs) {
    console.warn("Glmblx 参数未初始化，跳过整改状态数据获取");
    rectificationData.value = getDefaultRectificationStates();
    return;
  }

  isRectificationLoading.value = true;
  rectificationError.value = null;

  try {
    const rectificationMap = await fetchRectificationDictionary();
    if (!rectificationMap) {
      rectificationData.value = getDefaultRectificationStates();
      return;
    }

    const data = (await getRiskStatusCount({ Glmblx: glmblxs })) as any[];
    if (!data || data.length === 0) {
      console.info("整改状态数据为空");
      rectificationData.value = getDefaultRectificationStates();
      return;
    }

    // 计算总数
    const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);

    // 转换数据格式
    const transformedData = data.map((item) => {
      const statusName = rectificationMap[item.riskStatus] || item.riskStatus;
      const statusKey = zgztStatusMap[statusName] || "unknown";
      return {
        title: statusName,
        count: item.count || 0,
        status: statusKey,
        progress: totalCount > 0 ? (item.count || 0) / totalCount : 0,
      };
    });

    // 合并 API 数据与默认数据，确保始终有 4 项显示
    const defaultStates = getDefaultRectificationStates();
    transformedData.forEach((item) => {
      const defaultIndex = defaultStates.findIndex(
        (r) => r.status === item.status
      );
      if (defaultIndex >= 0) {
        defaultStates[defaultIndex] = item;
      }
    });
    rectificationData.value = defaultStates;
  } catch (error) {
    rectificationError.value = `获取整改状态数据失败: ${error}`;
    console.error(rectificationError.value);
    rectificationData.value = getDefaultRectificationStates();
  } finally {
    isRectificationLoading.value = false;
  }
};

/**
 * 获取默认的整改状态数据
 */
const getDefaultRectificationStates = () => [
  { title: "已整改", count: 0, status: "rectified", progress: 0 },
  { title: "未整改", count: 0, status: "notRectified", progress: 0 },
  { title: "整改中", count: 0, status: "inRectification", progress: 0 },
  { title: "持续跟进", count: 0, status: "continuousImprovement", progress: 0 },
];

// ==================== 图表渲染 ====================
/**
 * 渲染整改状态环形进度图
 */
const renderRectificationCharts = () => {
  rectificationData.value.forEach((item) => {
    const chart = initChart(`status-chart-${item.status}`);
    if (!chart) return;

    try {
      const option = createProgressOption(item.progress, item.status);
      chart.setOption(option);
    } catch (error) {
      console.warn(`渲染整改状态图表失败 - ${item.status}:`, error);
    }
  });
};

// ==================== 生命周期 ====================
/**
 * 组件挂载时执行的初始化逻辑
 * 1. 初始化 Glmblx 参数（整改状态接口使用）
 * 2. 获取整改状态数据（风险等级由子组件处理）
 * 3. 渲染图表
 */
onMounted(async () => {
  try {
    // 步骤1: 初始化共同参数（整改状态接口使用）
    const initSuccess = await initializeGlmblxs();
    if (!initSuccess) {
      console.error("初始化 Glmblx 参数失败，仍展示默认状态");
      rectificationData.value = getDefaultRectificationStates();
      updateHazardStatistics([]);
      await nextTick();
      renderRectificationCharts();
      return;
    }

    // 步骤2: 获取整改状态数据（风险等级由子组件处理）
    await fetchRectificationData();

    // 步骤3: 等待 DOM 更新后渲染图表
    await nextTick();
    renderRectificationCharts();
  } catch (error) {
    console.error("组件初始化失败:", error);
  }
});
</script>

<style lang="scss" scoped>
.risk-hazard-module {


  .risk-container {
    display: flex;
    flex-direction: row;
    gap: 28px;
    height: 100%;
  }

  // 左侧多环形图区域
  .left-chart {
    width: 38%;
    display: flex;
    flex-direction: column;

    .risk-echart {
      width: 100%;
      height: 50%;
    }

    .risk-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;

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
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-2xl);
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
          font-size: var(--font-size-3xl);
          color: #ffffff;
          background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);

          .unit {
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: var(--font-weight-normal);
            font-size: var(--font-size-sm);
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
    flex: 1;
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
        font-size: var(--font-size-3xl);
        color: #d3eaf1;
        line-height: calc(var(--font-size-base) * var(--line-height-normal));
        letter-spacing: 1px;
        text-align: center;
        font-style: normal;
      }

      .total-value {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-4xl);
        line-height: calc(var(--font-size-4xl) * 1.3);
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
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          font-family: YouSheBiaoTiHei;
          line-height: 1;
          margin-bottom: 8px;
        }

        .type-label {
          font-size: var(--font-size-3xl);
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
          font-size: var(--font-size-xl);
          color: #d3eaf1;
        }

        .rectification-item-value {
          .value {
            font-family: YouSheBiaoTiHei;
            font-size: var(--font-size-40);
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
            font-size: var(--font-size-sm);
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