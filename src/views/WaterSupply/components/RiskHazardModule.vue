<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险点</div>
    </div>
    <div class="module-content">
      <div class="risk-content">
        <RiskLevelChart
          :chart-id="riskChartId"
          :sszx="moduleConfig.sszx"
        />
      </div>
      <!-- 整改状态 -->
      <!-- <div class="rectification-section">
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
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, inject } from "vue";
import { getRiskStatusCount } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
import {
  createProgressOption,
  initChart,
} from "../chartOption";
import RiskLevelChart from "@/components/RiskLevelChart.vue";

// 从根组件接收模块配置
const moduleConfig = inject('MODULE_CONFIG', {
  sszx: 'csaqzx_gs',
  dictKey: {
    glmblx: 'glmblx_gs'
  }
});

// ==================== 数据状态 ====================

// 风险图表唯一ID
const riskChartId = 'risk-chart-watersupply';

// 共同参数：目标类型字符串（所有接口共用）
let glmblxs = "";

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
 * 通过获取 rqzx_glmblx 字典，将其 f_ItemValue 拼接成逗号分隔字符串
 * 此参数标准化确保两个数据接口参数一致
 */
const initializeGlmblxs = async (): Promise<boolean> => {
  try {
    const glmblx = moduleConfig.dictKey?.glmblx || "glmblx_gs";
    const rqzxglmblxDictionaries = await getCachedDictionary(glmblx);
    if (!rqzxglmblxDictionaries || rqzxglmblxDictionaries.length === 0) {
      console.warn("rqzx_glmblx 字典为空");
      return false;
    }
    glmblxs = rqzxglmblxDictionaries
      .map((item: any) => item.f_ItemValue)
      .join(",");
    return true;
  } catch (error) {
    console.error("初始化 Glmblx 参数失败:", error);
    return false;
  }
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
 * 2. 获取整改状态数据
 * 3. 渲染图表（风险等级图表由子组件处理）
 */
onMounted(async () => {
  try {
    // 步骤1: 初始化共同参数（整改状态接口使用）
    const initSuccess = await initializeGlmblxs();
    if (!initSuccess) {
      console.error("初始化 Glmblx 参数失败，跳过整改状态数据获取");
      rectificationData.value = getDefaultRectificationStates();
      await nextTick();
      renderRectificationCharts();
      return;
    }

    // 步骤2: 获取整改状态数据
    await fetchRectificationData();

    // 步骤3: 等待 DOM 更新后渲染整改状态图表
    await nextTick();
    renderRectificationCharts();
  } catch (error) {
    console.error("组件初始化失败:", error);
  }
});

</script>

<style lang="scss" scoped>
.module-content{
  flex-direction: row;
  padding: 10px 30px;
}
.risk-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 38%;
  justify-content: space-between;

  .risk-echart {
    width: 239px;
    height: 250px;
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
          font-weight: 400;
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
  width: 62%;
  margin-left: 60px;

  .right-chart {
    width: 146px;
    display: flex;
    align-items: center;
    justify-content: center;

    .status-chart {
      width: 80px;
      height: 80px;
    }
  }

  .rectification-item {
    width: 100%;
    height: 92px;
    background-size: 100% 100%;
    background-image: url("@/assets/img/waterSupply/rectification_bg.png");
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .left-nums {
    flex: 1;
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
    font-size: var(--font-size-3xl);
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
