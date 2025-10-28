<template>
  <div class="data-module early-warning-module">
    <div class="module-header">
      <div class="module-title">预警处置</div>
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
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { handledOption } from "./ehcartsOptions";
import {
  getMonthlyWarnStatistics,
  getWarnStatistics,
} from "@/services/waterSupplyService";

const handledSummaryData = ref(null);
// 获取处置率数据
onMounted(async () => {
  const summary = await getWarnStatistics("2025");
  summary["disposalRate"] =
    Math.round((summary["handledCount"] / summary["totalCount"]) * 100) + "%";

  handledSummaryData.value = summary;
});
const monthlyData = ref([]);
// 获取处置统计数据
onMounted(async () => {
   monthlyData.value = await getMonthlyWarnStatistics("2025");

});

const handledData = {
  summary: {
    handled: 155,
    unhandled: 100,
  },
  monthlyData: [
    {
      month: "1",
      handled: 15,
      unhandled: 10,
      completionRate: 40,
    },
    {
      month: "2",
      handled: 20,
      unhandled: 15,
      completionRate: 50,
    },
    {
      month: "3",
      handled: 25,
      unhandled: 20,
      completionRate: 60,
    },
    {
      month: "4",
      handled: 30,
      unhandled: 25,
      completionRate: 70,
    },
  ],
};

const warningData = [
  {
    name: "管网爆管预警",
    count: 2,
  },
  {
    name: "消火栓失效预警",
    count: 23,
  },
  {
    name: "管网泄露预警",
    count: 5,
  },
  {
    name: "水质污染预警",
    count: 0,
  },
  {
    name: "大面积停水预警",
    count: 13,
  },
  {
    name: "管网异常工况预警",
    count: 1,
  },
];

onMounted(() => {
  const monthlyData = handledData.monthlyData;
  const handledEchart = echarts.init(document.getElementById("handled-chart"));
  handledOption.xAxis.data = handledData.monthlyData.map((item) => item.month);
  handledOption.series[0].data = monthlyData.map((d) => d.unhandled);
  handledOption.series[1].data = monthlyData.map((d) => d.handled);
  handledOption.series[2].data = monthlyData.map((d) => d.completionRate);
  handledEchart.setOption(handledOption);
});
</script>

<style lang="scss" scoped>
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
