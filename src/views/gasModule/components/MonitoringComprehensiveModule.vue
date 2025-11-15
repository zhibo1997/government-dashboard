<template>
  <div class="data-module monitoring-comprehensive">
    <div class="module-header">
      <div class="module-title">监测综合</div>
    </div>
    <div class="module-content">
      <!-- 环形图统计 -->
      <div class="charts-container">
        <div class="chart-item" v-for="item in chartData" :key="item.title">
          <div class="chart-wrapper">
            <div class="chart" ref="chartRefs"></div>
            <div class="chart-center">
              <div class="center-value">{{ item.percentage }}</div>
              <div class="center-label">{{ item.title }}</div>
            </div>
          </div>
          <div class="chart-legend">
            <div 
              v-for="legend in item.legends" 
              :key="legend.name"
              class="legend-item"
            >
              <span class="legend-dot" :style="{ background: legend.color }"></span>
              <span class="legend-name">{{ legend.name }}</span>
              <span class="legend-value">{{ legend.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';

const chartRefs = ref([]);

// 图表数据
const chartData = ref([
  {
    title: '在线率',
    percentage: '79.5%',
    legends: [
      { name: '在线', value: '795 台', color: '#52c41a' },
      { name: '离线', value: '10248 台', color: '#ff4d4f' }
    ],
    data: [
      { value: 795, name: '在线', itemStyle: { color: '#52c41a' } },
      { value: 10248, name: '离线', itemStyle: { color: '#ff4d4f' } }
    ]
  },
  {
    title: '健康度',
    percentage: '10746',
    legends: [
      { name: '健康', value: '10248 台', color: '#52c41a' },
      { name: '亚健康', value: '425 台', color: '#faad14' },
      { name: '故障', value: '73 台', color: '#ff4d4f' }
    ],
    data: [
      { value: 10248, name: '健康', itemStyle: { color: '#52c41a' } },
      { value: 425, name: '亚健康', itemStyle: { color: '#faad14' } },
      { value: 73, name: '故障', itemStyle: { color: '#ff4d4f' } }
    ]
  }
]);

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    chartRefs.value.forEach((chartDom, index) => {
      if (!chartDom) return;
      
      const chart = echarts.init(chartDom);
      const data = chartData.value[index];
      
      const option = {
        series: [
          {
            type: 'pie',
            radius: ['60%', '80%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: { show: false },
            labelLine: { show: false },
            data: data.data,
            emphasis: {
              scale: true,
              scaleSize: 5
            }
          }
        ]
      };
      
      chart.setOption(option);
      
      // 响应式
      window.addEventListener('resize', () => chart.resize());
    });
  });
};

onMounted(() => {
  initCharts();
});
</script>

<style lang="scss" scoped>
.monitoring-comprehensive {
  .module-content {
    padding: 30px;
  }

  .charts-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }

  .chart-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chart-wrapper {
    position: relative;
    width: 280px;
    height: 280px;
    margin-bottom: 20px;

    .chart {
      width: 100%;
      height: 100%;
    }

    .chart-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;

      .center-value {
        font-size: 40px;
        font-weight: bold;
        color: #ffffff;
        font-family: 'DIN', Arial, sans-serif;
        margin-bottom: 5px;
      }

      .center-label {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .chart-legend {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;

      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .legend-name {
        color: rgba(255, 255, 255, 0.85);
        flex: 1;
      }

      .legend-value {
        color: #ffffff;
        font-weight: 600;
        font-family: 'DIN', Arial, sans-serif;
      }
    }
  }
}
</style>
