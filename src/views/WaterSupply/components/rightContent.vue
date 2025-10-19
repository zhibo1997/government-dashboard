<template>
  <div class="right-content">
    <!-- 监测设备模块 -->
    <div class="data-module monitoring-equipment-module">
      <div class="module-header">
        <div class="module-title">监测设备</div>
      </div>
      <div class="module-content">
        <div class="monitoring-content">
          <!-- 在线率概览 -->
          <div class="overview-section">
            <div class="overview-item" v-for="item in monitoringData.monitoring.overview" :key="item.type">
              <div class="rate-badge" :class="`rate-${item.type}`">
                <div class="rate-value gradient-text">{{ item.value }}</div>
                <div class="rate-name">{{ item.name }}</div>
              </div>
            </div>
          </div>

          <!-- 设备列表 -->
          <div class="devices-section">
            <div class="device-item" v-for="device in monitoringData.monitoring.devices" :key="device.name">
              <div class="device-count">
                <span class="count-online gradient-text">{{ device.online }}</span>
                <span class="count-separator">/</span>
                <span class="count-offline gradient-text">{{ device.offline }}</span>
                <span class="count-separator">/</span>
                <span class="count-fault gradient-text">{{ device.fault }}</span>
              </div>
              <div class="device-name">{{ device.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 风险隐患模块 -->
    <div class="data-module risk-hazard-module">
      <div class="module-header">
        <div class="module-title">风险隐患</div>
      </div>
      <div class="module-content">
        <div class="risk-content">
          <div id="risk-chart" class="risk-echart"></div>
          <div class="risk-legend">
            <div class="legend-item" v-for="item in riskLegend" :key="item.name">
              <div class="legend-name">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                {{ item.name }}
              </div>
              <div class="legend-value gradient-text">{{ item.value }}
                <span class="unit">个</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 整改状态 -->
        <div class="rectification-section">
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
        </div>
      </div>
    </div>

    <!-- 预警处置模块 -->
    <div class="data-module early-warning-module">
      <div class="module-header">
        <div class="module-title">预警处置</div>
      </div>
      <div class="module-content warning-content">
        <div class="warning-list">
          <div class="warning-data">
            <img class="pyramid" src="@/assets/img/waterSupply/pyramid.png" alt="" />
            <div class="warning-data-content">
              <div class="warning-item" v-for="(item, idx) in warningData.slice(0, 3)" :key="idx">
                <div class="warning-item-value">
                  <span class="value">{{ item.count }}处</span>
                </div>
                <div class="warning-item-title">{{ item.name }}</div>
              </div>
            </div>
          </div>
          <div class="warning-data">
            <img class="pyramid" src="@/assets/img/waterSupply/pyramid.png" alt="" />
            <div class="warning-data-content">
              <div class="warning-item" v-for="(item, idx) in warningData.slice(3)" :key="idx">
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
              <span class="value gradient-text">{{ handledData.summary.handled }}</span>
            </div>
            <div class="handled-item item-unhandled">
              <span class="title">未处置</span>
              <span class="value gradient-text">{{ handledData.summary.handled }}</span>
            </div>
            <div class="handled-item item-completionRate">
              <span class="title">处置率</span>
              <span class="value gradient-text">85%</span>
            </div>
          </div>
          <div id="handled-chart" class="handled-chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as echarts from 'echarts';
import { handledOption, risksOption } from './ehcartsOptions';
const handledData = {
  "summary": {
    "handled": 155,
    "unhandled": 100,
  },
  "monthlyData": [
    {
      "month": "1",
      "handled": 15,
      "unhandled": 10,
      "completionRate": 40
    },
    {
      "month": "2",
      "handled": 20,
      "unhandled": 15,
      "completionRate": 50
    },
    {
      "month": "3",
      "handled": 25,
      "unhandled": 20,
      "completionRate": 60
    },
    {
      "month": "4",
      "handled": 30,
      "unhandled": 25,
      "completionRate": 70
    }
  ]
}
const warningData = [
  {
    "name": "管网爆管预警",
    "count": 2
  },
  {
    "name": "消火栓失效预警",
    "count": 23
  },
  {
    "name": "管网泄露预警",
    "count": 5
  },
  {
    "name": "水质污染预警",
    "count": 0
  },
  {
    "name": "大面积停水预警",
    "count": 13
  },
  {
    "name": "管网异常工况预警",
    "count": 1
  }
]

// 创建环形进度图配置
const createProgressOption = (progress, status) => {
  // 根据状态设置不同的颜色
  const colorMap = {
    continuousImprovement: ['#10ADC0', '#FFFFFF'],
    rectified: ['#FFF407', '#3FFEFD'],
    inRectification: ['#CDAB06', '#FFFEED'],
    notRectified: ['#FEAC04', '#F75E04']
  };

  const colors = colorMap[status] || ['#10ADC0', '#FFFFFF'];
  const percentage = Math.round(progress * 100);

  return {
    series: [
      {
        type: 'pie',
        radius: ['70%', '90%'],
        center: ['50%', '50%'],
        startAngle: 90,
        silent: true,
        label: {
          show: true,
          position: 'center',
          formatter: `{a|${percentage}%}`,
          rich: {
            a: {
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'YouSheBiaoTiHei',
              color: '#FFFFFF',
              lineHeight: 26
            }
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: progress,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: colors[0] },
                { offset: 1, color: colors[1] }
              ]),
              borderRadius: 10
            }
          },
          {
            value: 1 - progress,
            itemStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1
            },
            emphasis: {
              itemStyle: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        ],
        emphasis: {
          scale: false
        }
      }
    ]
  };
};

onMounted(() => {
  const riskEchart = echarts.init(document.getElementById('risk-chart'));
  // riskEchart.setOption(risksOption);

  // 初始化所有整改状态环形图
  rectificationData.forEach(item => {
    const chartDom = document.getElementById(`status-chart-${item.status}`);
    if (chartDom) {
      const chart = echarts.init(chartDom);
      chart.setOption(createProgressOption(item.progress, item.status));
    }
  });
  const monthlyData = handledData.monthlyData;
  const handledEchart = echarts.init(document.getElementById('handled-chart'));
  handledOption.xAxis.data = handledData.monthlyData.map(item => item.month);
  handledOption.series[0].data = monthlyData.map(d => d.unhandled);
  handledOption.series[1].data = monthlyData.map(d => d.handled);
  handledOption.series[2].data = monthlyData.map(d => d.completionRate);
  handledEchart.setOption(handledOption);
})

const rectificationData = [
  {
    "title": "持续改进",
    "status": "continuousImprovement",
    "count": 27,
    "progress": 0.45
  },
  {
    "title": "已整改",
    "status": "rectified",
    "count": 20,
    "progress": 0.45
  },
  {
    "title": "整改中",
    "status": "inRectification",
    "count": 13,
    "progress": 0.45
  },
  {
    "title": "未整改",
    "status": "notRectified",
    "count": 122,
    "progress": 0.45
  }
]
const riskLegend = [
  {
    name: '已消除风险',
    color: '#9bb8c7',
    value: 18
  },
  {
    name: '已监测风险',
    color: '#61E29D',
    value: 25
  },
  {
    name: '巡查管控',
    color: '#F4D982',
    value: 15
  },
  {
    name: '未管控',
    color: '#E88D6B',
    value: 10
  }
]
const monitoringData = {
  "monitoring": {
    "overview": [
      {
        "name": "在线率",
        "value": "95%",
        "type": "online"
      },
      {
        "name": "离线率",
        "value": "3%",
        "type": "offline"
      },
      {
        "name": "故障率",
        "value": "2%",
        "type": "fault"
      }
    ],
    "devices": [
      {
        "name": "流量计",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "消火栓智能监测仪",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "压力计",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "应力检测仪",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "漏水监测仪",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "水质检测设备",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "河道水位计",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "温度计",
        "online": 25,
        "offline": 1,
        "fault": 0
      },
      {
        "name": "液位计",
        "online": 25,
        "offline": 1,
        "fault": 0
      }
    ]
  }
}
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
  .handled-chart{
    width: 531px;
    height: 194px;
  }
  .handled-item {
    background-size: 100% 100%;
    width: 164px;
    height: 53px;
    background-image: url('@/assets/img/waterSupply/handled-bg.png');
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 17px 0 13px;
    margin-bottom: 20px;

    .title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 18px;
      color: #BCD4D4;
      line-height: 26px;
      text-align: left;
      font-style: normal;

    }

    .value {
      font-family: YouSheBiaoTiHei;
      font-size: 30px;
      color: #FFFFFF;
      line-height: 39px;
      text-align: left;
      font-style: normal;
    }

    &.item-handled {
      .title {
        color: #BCD4D4;
      }

      .value {
        background: linear-gradient(90deg, #10ADC0 0%, #FFFFFF 100%);
      }
    }

    &.item-unhandled {
      .title {
        color: #F75E04;
      }

      .value {
        background: linear-gradient(0deg, #F75E04 0%, #FEAC04 100%);
      }
    }

    &.item-completionRate {
      .title {
        color: #FFF407;
      }

      .value {
        background: linear-gradient(0deg, #3FFEFD 0%, #FFF407 100%);
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
        color: #C3540C;
      }
    }

    &:nth-child(2) {
      .value {
        color: #E1ED68;
      }
    }

    &:nth-child(3) {
      .value {
        color: #2F9EAC;
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
    color: #D3EAF1;
    line-height: 24px;
    text-align: left;
    font-style: normal;

    &::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 8px;
      background-image: url('@/assets/img/waterSupply/warning_before.png');
      background-size: 100% 100%;
      margin-right: 6px;
    }
  }
}

.rectification-section {
  width: 50%;

  .right-chart {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 20px;

    .status-chart {
      width: 80px;
      height: 80px;
    }
  }

  .rectification-item {
    width: 388px;
    height: 92px;
    background-size: 100% 100%;
    background-image: url('@/assets/img/waterSupply/rectification_bg.png');
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .left-nums {
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
    font-size: 20px;
    color: #D3EAF1;
    line-height: 29px;
    letter-spacing: 1px;
    text-align: left;
    font-style: normal;
  }

  .rectification-item-value {
    .value {
      font-family: YouSheBiaoTiHei;
      font-size: 40px;
      color: #FFFFFF;
      line-height: 52px;
      text-align: right;
      font-style: normal;

      &.progress-continuousImprovement {
        background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);
      }

      &.progress-rectified {
        background: linear-gradient(0deg, #3FFEFD 0%, #FFF407 100%);
      }

      &.progress-inRectification {
        background: linear-gradient(90deg, #FFFEED 0%, #CDAB06 100%);
      }

      &.progress-notRectified {
        background: linear-gradient(0deg, #F75E04 0%, #FEAC04 100%);
      }
    }

    .unit {
      margin-left: 5px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 14px;
      color: #D3EAF1;
      line-height: 20px;
      letter-spacing: 1px;
      text-align: left;
      font-style: normal;
      background: transparent !important;
    }
  }
}

.risk-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 50%;

  .risk-echart {
    width: 239px;
    height: 250px;
  }

  .risk-legend {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    width: 100%;

    .legend-item {
      padding: 6px 20px;
      margin-bottom: 12px;
      display: flex;
      background-color: #1d3940;
    }

    .legend-name {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 20px;
      color: #D3EAF1;
      line-height: 29px;
      letter-spacing: 1px;
      font-style: normal;
      display: flex;
      align-items: center;

      .legend-color {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 11px;
        display: inline-block;
      }
    }

    .legend-value {
      font-family: YouSheBiaoTiHei;
      font-size: 20px;
      color: #FFFFFF;
      line-height: 26px;
      text-align: center;
      font-style: normal;
      background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);

      .unit {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 14px;
        color: #D3EAF1;
        line-height: 20px;
        letter-spacing: 1px;
        text-align: left;
        font-style: normal;
        margin-left: 5px;
      }
    }
  }
}

.monitoring-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  // 在线率概览区域
  .overview-section {
    display: flex;
    justify-content: space-around;

    .overview-item {
      display: flex;
      justify-content: center;
    }

    .rate-badge {
      width: 112px;
      height: 139px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;

      &.rate-online {
        background-image: url('@/assets/img/waterSupply/online_rate.png');

        .rate-value {
          background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);
        }
      }

      &.rate-offline {
        background-image: url('@/assets/img/waterSupply/offline_rate.png');

        .rate-value {
          background: linear-gradient(90deg, #FFFEED 0%, #CDAB06 100%);
        }
      }

      &.rate-fault {
        background-image: url('@/assets/img/waterSupply/fault_rate.png');

        .rate-value {
          background: linear-gradient(90deg, #FFFEED 0%, #CDAB06 100%);
        }
      }

      .rate-value {
        font-family: YouSheBiaoTiHei;
        font-size: 40px;
        color: #FFFFFF;
        line-height: 52px;
        text-align: center;
        font-style: normal;
      }

      .rate-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 24px;
        color: #E4F3FF;
        line-height: 35px;
        text-align: center;
        font-style: normal;
        margin-top: 8px;
      }
    }
  }

  // 设备列表区域
  .devices-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0px 50px;
    flex: 1;

    .device-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -20px;

      .device-count {
        width: 233px;
        height: 88px;
        display: flex;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2);
        position: relative;
        overflow: hidden;
        padding-top: 10px;
        background-size: 100% 100%;
        background-image: url("@/assets/img/waterSupply/monitor_device.png");

        .gradient-text {
          font-family: YouSheBiaoTiHei;
          font-size: 32px;
          color: #FFFFFF;
          line-height: 42px;
          text-align: center;
          font-style: normal;
        }

        .count-online {
          background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);
        }

        .count-separator {
          font-family: YouSheBiaoTiHei;
          font-size: 32px;
          color: #FFFFFF;
          line-height: 42px;
          text-align: center;
          font-style: normal;
        }

        .count-offline {
          background: linear-gradient(90deg, #FFFEED 0%, #CDAB06 100%);
        }

        .count-fault {
          background: linear-gradient(90deg, #FFE9DA 0%, #CE5A0D 100%);
        }
      }

      .device-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 24px;
        color: #E4F3FF;
        line-height: 35px;
        text-align: center;
        font-style: normal;
        position: relative;
        top: -20px;
      }
    }
  }
}
</style>