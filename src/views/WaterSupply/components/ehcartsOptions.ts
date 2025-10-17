
// 官网材质echarts图
export const officialWebsiteOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    show: true,
    orient: 'vertical',
    left: 'left',
    data: ['PE', '球墨铸铁', 'PE', '球墨铸铁'],
    textStyle: {
      color: '#fff'
    }
  },
  // grid: {
  //   top: 5,
  //   right: 5,
  //   bottom: 5,
  //   left: 5
  // },
  series: [
    {
      name: '中心文字',
      type: 'text',
      position: ['50%', '50%'],
      style: {
        text: '管网\n材质',
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#fff',
        textAlign: 'center',
        textBaseline: 'middle'
      }
    },
    {
      name: '管网材质',
      type: 'pie',
      radius: ['50%', '70%'], // 内半径 50%，外半径 70%，形成环形
      center: ['50%', '50%'], // 圆心位置
      startAngle: 90, // 起始角度，可调整方向
      label: {
        show: false // 不显示标签在图上
      },
      labelLine: {
        show: false // 不显示引导线
      },
      itemStyle: {
        borderRadius: 10, // 圆角，让扇形更柔和
        opacity: 0.8 // 可选：透明度控制
      },
      data: [
        { value: 38, name: 'PE', itemStyle: { color: '#00bfff' } },
        { value: 40, name: '球墨铸铁', itemStyle: { color: '#ff4500' } },
        { value: 10, name: 'PE', itemStyle: { color: '#ffff00' } },
        { value: 12, name: '球墨铸铁', itemStyle: { color: '#66cc66' } }
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