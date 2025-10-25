<template>
  <div class="data-module pipeline-module">
    <div class="module-header">
      <div class="module-title">供水管网</div>
    </div>
    <div class="module-content pipeline-module-content">
      <div class="material-content">
        <div id="pipeline-chart" class="pipeline-chart"></div>
        <div class="material-legend">
          <div class="legend-item" v-for="item in pipelineLegend" :key="item.name">
            <div class="legend-item-content">
              <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
              <div class="legend-name">{{ item.name }}</div>
            </div>
            <div class="legend-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
      <div class="hidden-danger">
        <div class="danger-item"></div>
        <div class="base-img">
          <span class="danger-count gradient-text">{{ dangerCount }}</span>
          <span class="danger-text">供水管网隐患</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { officialWebsiteOption } from './ehcartsOptions'
import * as echarts from 'echarts'

const dangerCount = ref(29)

const pipelineLegend = ref([
  {
    "color": "#00bfff",
    "name": "PE",
    "value": "38%"
  },
  {
    "color": "#ff4500",
    "name": "球墨铸铁",
    "value": "40%"
  },
  {
    "color": "#ffff00",
    "name": "PE",
    "value": "10%"
  },
  {
    "color": "#66cc66",
    "name": "球墨铸铁",
    "value": "12%"
  }
])

onMounted(() => {
  initChart()
})

const initChart = () => {
  const chartDom = document.getElementById('pipeline-chart')
  if (chartDom) {
    const pipelineChart = echarts.init(chartDom)
    pipelineChart.setOption(officialWebsiteOption)
  }
}
</script>

<style lang="scss" scoped>
.pipeline-module-content {
  display: flex;
}

.material-content {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .pipeline-chart {
    width: 217px;
    height: 217px;
  }

  .material-legend {
    width: 100%;
    display: flex;
    flex-direction: column;

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      justify-content: space-between;
      padding: 0 26px;

      .legend-item-content {
        display: flex;
        align-items: center;
      }

      .legend-color {
        width: 20px;
        height: 20px;
        margin-right: 13px;
      }

      .legend-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 30px;
        color: #E4F3FF;
        line-height: 44px;
        text-align: left;
        font-style: normal;
      }
    }

    .legend-value {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      color: #E4F3FF;
      line-height: 44px;
      text-align: left;
      font-style: normal;
    }
  }
}

.hidden-danger {
  width: 50%;

  .base-img {
    width: 442px;
    height: 194px;
    background-image: url("@/assets/img/waterSupply/danger_base.png");
    background-size: 100% 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .danger-count {
      font-family: YouSheBiaoTiHei;
      font-size: 48px;
      color: #E74040;
      line-height: 62px;
      text-align: left;
      font-style: normal;
      background: linear-gradient(0deg, #3FFEFD 0%, #FFF407 100%);
    }

    .danger-text {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      color: #FFFFFF;
      line-height: 44px;
      text-align: left;
      font-style: normal;
    }
  }
}
</style>
