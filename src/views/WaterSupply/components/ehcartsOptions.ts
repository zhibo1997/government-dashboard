import * as echarts from 'echarts';
// 官网材质echarts图
export const officialWebsiteOption: echarts.EChartsOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    show: false,
  },
  // grid: {
  //   top: 5,
  //   right: 5,
  //   bottom: 5,
  //   left: 5
  // },
  series: [
    {
      name: '管网材质',
      type: 'pie',
      radius: ['75%', '95%'], // 内半径 50%，外半径 70%，形成环形
      center: ['50%', '50%'], // 圆心位置
      startAngle: 90, // 起始角度，可调整方向
      label: {
        show: false // 不显示标签在图上
      },
      labelLine: {
        show: false // 不显示引导线
      },
      itemStyle: {
        borderRadius: 0, // 圆角，让扇形更柔和

      },
      data: [
        {
          value: 38, name: 'PE', itemStyle: {
            color:
              new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: 'rgba(247,255,111,0)' },
                { offset: 1, color: '#F2FF6F' },
              ])
          }
        },
        {
          value: 40, name: '球墨铸铁', itemStyle: {
            color:
              new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 1, color: 'rgba(199,94,25,0)' },
                { offset: 0, color: '#D0590C' },
              ])
          }
        },
        {
          value: 10, name: 'PE', itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(8,255,255,0)' },
              { offset: 1, color: '#08ffff' },
            ])
          }
        },
        {
          value: 12, name: '球墨铸铁', itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(176,255,255,0)' },
              { offset: 1, color: '#B1FFE9' },
            ])
          }
        }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
};
export const risksOption = {
  radar: {
    // 雷达图配置
    indicator: [
      { name: '', max: 20 }
    ],
    radius: '70%',
    center: ['50%', '50%'],
    splitNumber: 5,
    axisLine: {
      lineStyle: {
        color: '#fff',
        opacity: 0.2
      }
    },
    splitArea: {
      show: false
    },
    axisLabel: {
      show: true,
      color: '#fff',
      formatter: function (value) {
        return value;
      }
    }
  },
  series: [
    // 外层蓝色环
    {
      type: 'line',
      coordinateSystem: 'radar',
      data: [18],
      lineStyle: {
        color: '#409eff',
        width: 10
      },
      areaStyle: {
        opacity: 0
      },
      symbol: 'none'
    },
    // 中层绿色环
    {
      type: 'line',
      coordinateSystem: 'radar',
      data: [10],
      lineStyle: {
        color: '#67c23a',
        width: 10
      },
      areaStyle: {
        opacity: 0
      },
      symbol: 'none'
    },
    // 内层黄色环
    {
      type: 'line',
      coordinateSystem: 'radar',
      data: [7],
      lineStyle: {
        color: '#e6a235',
        width: 10
      },
      areaStyle: {
        opacity: 0
      },
      symbol: 'none'
    },
    // 最内层红色环
    {
      type: 'line',
      coordinateSystem: 'radar',
      data: [17],
      lineStyle: {
        color: '#f56c6c',
        width: 10
      },
      areaStyle: {
        opacity: 0
      },
      symbol: 'none'
    }
  ]
};
export const riskRingsOption = {
  series: [
    {
      type: 'gauge',
      radius: '70%',
      center: ['50%', '50%'],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [[0.1, '#00bfff'], [0.5, '#ffcc00'], [1, '#ff4500']],
          width: 10
        }
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: '{value}' },
      detail: { show: false },
      data: [{ value: 15, name: '' }]
    },
    {
      type: 'gauge',
      radius: '60%',
      center: ['50%', '50%'],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [[0.1, '#00ff00'], [0.5, '#ffff00'], [1, '#ff0000']],
          width: 8
        }
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: '{value}' },
      detail: { show: false },
      data: [{ value: 10, name: '' }]
    },
    {
      type: 'gauge',
      radius: '50%',
      center: ['50%', '50%'],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [[0.1, '#00bfff'], [0.5, '#ffcc00'], [1, '#ff4500']],
          width: 6
        }
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: '{value}' },
      detail: { show: false },
      data: [{ value: 7, name: '' }]
    },
    {
      type: 'gauge',
      radius: '40%',
      center: ['50%', '50%'],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [[0.1, '#00bfff'], [0.5, '#ffcc00'], [1, '#ff4500']],
          width: 4
        }
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: '{value}' },
      detail: { show: false },
      data: [{ value: 17, name: '' }]
    }
  ]
};

export const handledOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['未处置', '已处置', '处置率'],
    textStyle: {
      color: '#fff',
      fontSize: 14
    },
    right: '10%'
  },
  grid: {
    left: 2,
    right: 2,
    top: 2,
    bottom: 2
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: {
      color: '#fff',
      fontSize: 12
    },
    axisLine: {
      lineStyle: {
        color: '#00bfff'
      }
    },
    splitLine: {
      show: false
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '单位：个',
      min: 0,
      max: 50,
      interval: 10,
      axisLabel: {
        color: '#fff',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#00bfff'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#00bfff',
          opacity: 0.3
        }
      }
    },
    {
      type: 'value',
      name: '单位：% ',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        color: '#fff',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#00bfff'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#00bfff',
          opacity: 0.3
        }
      },
      position: 'right'
    }
  ],
  series: [
    {
      name: '未处置',
      type: 'bar',
      barWidth: '20%',
      itemStyle: {
        color: '#f5a623'
      },
      data: []
    },
    {
      name: '已处置',
      type: 'bar',
      barWidth: '20%',
      itemStyle: {
        color: '#007aff'
      },
      data: []
    },
    {
      name: '处置率',
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#ff4d4d',
        width: 3
      },
      areaStyle: {
        color: 'rgba(255, 77, 77, 0.3)'
      },
      yAxisIndex: 1,
      data: []
    }
  ],
};