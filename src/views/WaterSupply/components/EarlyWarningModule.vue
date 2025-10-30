<template>
  <div class="data-module early-warning-module">
    <div class="module-header">
      <div class="module-title">预警处置</div>
      <n-date-picker
        v-model:value="warningDate"
        type="year"
        clearable
        :to="false"
        class="custom-date-picker"
        :format="'yyyy年'"
        :actions="null"
        @update:value="onChangeWarningDate"
      />
    </div>
    <div class="module-content warning-content">
      <div class="warning-list">
        <div class="warning-data">
          <img
            class="pyramid"
            src="@/assets/img/waterSupply/pyramid.png"
            alt=""
          />
          <div class="warning-data-content">
            <div
              class="warning-item"
              v-for="(item, idx) in warningData.slice(0, 3)"
              :key="idx"
            >
              <div class="warning-item-value">
                <span class="value">{{ item.count }}处</span>
              </div>
              <div class="warning-item-title">{{ item.name }}</div>
            </div>
          </div>
        </div>
        <div class="warning-data">
          <img
            class="pyramid"
            src="@/assets/img/waterSupply/pyramid.png"
            alt=""
          />
          <div class="warning-data-content">
            <div
              class="warning-item"
              v-for="(item, idx) in warningData.slice(3)"
              :key="idx"
            >
              <div class="warning-item-value">
                <span class="value">{{ item.count }}处</span>
              </div>
              <div class="warning-item-title">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="handled-content">
        <div class="handled-list">
          <div class="handled-item item-handled">
            <span class="title">已处置</span>
            <span class="value gradient-text">{{
              handledSummaryData?.handledCount
            }}</span>
          </div>
          <div class="handled-item item-unhandled">
            <span class="title">未处置</span>
            <span class="value gradient-text">{{
              handledSummaryData?.totalCount
            }}</span>
          </div>
          <div class="handled-item item-completionRate">
            <span class="title">处置率</span>
            <span class="value gradient-text">{{
              handledSummaryData?.disposalRate
            }}</span>
          </div>
        </div>
        <div id="handled-chart" class="handled-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { handledOption } from "./ehcartsOptions";
import {
  getMonthlyWarnStatistics,
  getWarnStatistics,
  getCheckResultStatistics,
} from "@/services/waterSupplyService";
import { getDataItemDetails } from "@/services/commonService";

// 预警处置时间
const warningDate = ref(new Date().getFullYear());

// 响应式数据
const handledSummaryData = ref(null);
const yjlxMap = ref({});
const warningData = ref([]);
const monthlyData = ref([]);
let handledEchart = null;

// 初始化图表
const initChart = () => {
  const chartDom = document.getElementById("handled-chart");
  if (chartDom) {
    handledEchart = echarts.init(chartDom);
    handledEchart.setOption(handledOption, true);
  }
};

// 更新图表数据
const updateChart = (data) => {
  if (!handledEchart || !data) return;
  
  handledOption.xAxis.data = data.map((item) => item.month);
  handledOption.series[0].data = data.map((d) => d.unhandledCount);
  handledOption.series[1].data = data.map((d) => d.handledCount);
  handledOption.series[2].data = data.map((d) =>
    ((d.handledCount / (d.unhandledCount + d.handledCount)) * 100).toFixed(2)
  );
  
  handledEchart.setOption(handledOption, true);
};

// 获取所有数据
const fetchAllData = async (year) => {
  try {
    // 获取预警统计数据
    const [checkResultData, warnStatisticsData, monthlyWarnData] = await Promise.all([
      getCheckResultStatistics(year),
      getWarnStatistics(year),
      getMonthlyWarnStatistics(year)
    ]);
    
    // 处理预警统计数据
    warningData.value = checkResultData.map((item) => ({
      name: yjlxMap.value[item.checkResult],
      count: item.count,
    }));
    
    // 处理处置率数据
    const summary = { ...warnStatisticsData };
    summary.disposalRate = warnStatisticsData.totalCount > 0 
      ? Math.round((warnStatisticsData.handledCount / warnStatisticsData.totalCount) * 100) + "%" 
      : "0%";
    handledSummaryData.value = summary;
    
    // 处理月度统计数据
    monthlyData.value = monthlyWarnData;
    updateChart(monthlyWarnData);
  } catch (error) {
    console.error("获取预警处置数据失败:", error);
  }
};

// 日期更改处理方法
const onChangeWarningDate = (value) => {
  if (!value) return;
  const year = new Date(value).getFullYear().toString();
  fetchAllData(year);
};

// 初始化字典数据
const initDictionary = async () => {
  try {
    const dictionaries = await getDataItemDetails("yjlx_gs");
    yjlxMap.value = dictionaries.reduce((acc, cur) => {
      acc[cur.f_ItemValue] = cur.f_ItemName;
      return acc;
    }, {});
  } catch (error) {
    console.error("获取预警类型字典失败:", error);
  }
};

// 组件挂载后初始化
onMounted(async () => {
  await initDictionary();
  initChart();
  const currentYear = new Date().getFullYear().toString();
  await fetchAllData(currentYear);
});

// 监听monthlyData变化，更新图表
watch(monthlyData, (newData) => {
  nextTick(() => {
    updateChart(newData);
  });
});
</script>

<style lang="scss" scoped>
.module-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
:deep(.custom-date-picker) {
  margin-right: 30px;
  .n-input {
    width: 220px;
    background-color: #094358;
    border: 2px solid #11a7e2;
    border-radius: 8px;
    height: 56px;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-size: 28px;
    color: #ffffff;
    padding: 6px 20px;

    &:hover {
      border-color: rgba(22, 119, 255, 0.8);
    }

    &:focus-within {
      border-color: #1677ff;
      box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
    }

    .n-input__input-el {
      color: #ffffff;
      font-size: 28px;
      caret-color: #1677ff;
    }

    .n-input__placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .n-input__suffix,
    .n-input__prefix {
      .n-base-icon {
        color: rgba(255, 255, 255, 0.6);
        font-size: 24px;
      }
    }

    .n-input__state-border {
      border: none;
    }
  }

  .n-base-clear {
    color: rgba(255, 255, 255, 0.6);

    &:hover {
      color: #ff4d4f;
    }
  }
}
.warning-list {
  display: flex;
  flex-direction: row;
}

.warning-content {
  display: flex;
  flex-direction: column;
}

.handled-content {
  display: flex;
  flex-direction: row;
  .handled-chart {
    width: 531px;
    height: 194px;
  }
  .handled-item {
    background-size: 100% 100%;
    width: 164px;
    height: 53px;
    background-image: url("@/assets/img/waterSupply/handled-bg.png");
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 17px 0 13px;
    margin-bottom: 20px;

    .title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 18px;
      color: #bcd4d4;
      line-height: 26px;
      text-align: left;
      font-style: normal;
    }

    .value {
      font-family: YouSheBiaoTiHei;
      font-size: 30px;
      color: #ffffff;
      line-height: 39px;
      text-align: left;
      font-style: normal;
    }

    &.item-handled {
      .title {
        color: #bcd4d4;
      }

      .value {
        background: linear-gradient(90deg, #10adc0 0%, #ffffff 100%);
      }
    }

    &.item-unhandled {
      .title {
        color: #f75e04;
      }

      .value {
        background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
      }
    }

    &.item-completionRate {
      .title {
        color: #fff407;
      }

      .value {
        background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
      }
    }
  }
}

.warning-data {
  width: 347px;
  height: 167px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .pyramid {
    width: 183px;
    height: 166px;
    position: relative;
    z-index: 2;
  }

  .warning-data-content {
    display: flex;
    flex-direction: column;
    position: relative;
    left: -68px;
    z-index: 1;
  }

  .warning-item {
    display: flex;
    flex-direction: row;
    margin-bottom: 17px;

    &:nth-child(1) {
      .value {
        color: #c3540c;
      }
    }

    &:nth-child(2) {
      .value {
        color: #e1ed68;
      }
    }

    &:nth-child(3) {
      .value {
        color: #2f9eac;
      }
    }
  }

  .warning-item-value {
    border-bottom: 2px solid rgb(255, 255, 255, 0.5);
    width: 100px;
    text-align: right;
    margin-right: 8px;
    padding-bottom: 2px;

    .value {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      text-align: left;
      font-style: normal;
      margin-right: 8px;
    }
  }

  .warning-item-title {
    position: relative;
    top: 10px;
    width: 140px;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: 16px;
    color: #d3eaf1;
    line-height: 24px;
    text-align: left;
    font-style: normal;

    &::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 8px;
      background-image: url("@/assets/img/waterSupply/warning_before.png");
      background-size: 100% 100%;
      margin-right: 6px;
    }
  }
}
</style>