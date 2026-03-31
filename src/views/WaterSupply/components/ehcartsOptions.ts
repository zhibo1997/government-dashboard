import * as echarts from "echarts";
// 官网材质echarts图

export const officialWebsiteOption: echarts.EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: {
    show: false,
  },

  title: {
    text: "管网\n\n材质",
    left: "30%",
    top: "20%",
    textStyle: {
      color: "#e4f3ff",
      fontSize: 36,
      fontWeight: 600,
      fontFamily: "YouSheBiaoTiHei",
      lineHeight: 32,
    },
    subtextStyle: {
      color: "rgba(228, 243, 255, 0.7)",
      fontSize: 14,
      fontFamily: "SourceHanSansSC",
    },
    itemGap: 8,
  },
  legend: {
    show: true,
    orient: "vertical",
    bottom: "10%",
    left: "10%",
    textStyle: {
      color: "#e4f3ff",
      fontSize: 28,
      fontFamily: "SourceHanSansSC",
      fontWeight: 500,
    },
    itemWidth: 20,
    itemHeight: 20,
    itemGap: 20,
    formatter: function(name) {
      return name;
    }
  },
  series: [
    {
      name: "管网材质",
      type: "pie",
      radius: ["40%", "55%"],
      center: ["40%", "30%"],
      startAngle: 90,
      padAngle: 1.5,
      clockwise: true,  
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      itemStyle: {
        borderRadius: 2,
        borderColor: "rgba(13, 35, 42, 0.8)",
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: "rgba(93, 135, 172, 0.2)",
      },
      data: [
        { value: 38, name: "PE", itemStyle: { color: "#5D87AC" } },
        { value: 40, name: "球墨铸铁", itemStyle: { color: "#C3540C" } },
        { value: 10, name: "PE", itemStyle: { color: "#4D74FF" } },
        { value: 12, name: "球墨铸铁", itemStyle: { color: "#93DBFF" } }
      ],
      emphasis: {
        scale: true,
        scaleSize: 8,
        itemStyle: {
          shadowBlur: 20,
          shadowColor: "rgba(93, 135, 172, 0.4)",
          borderWidth: 3,
          borderColor: "#5D87AC",
        },
        label: {
          fontSize: 18,
          fontWeight: 600,
        }
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return Math.random() * 200;
      }
    },
  ],
};
// 隐患柱状图
export const dangerBarOption: echarts.EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(2, 17, 29, 0.9)',
    borderColor: 'rgba(13, 165, 190, 0.5)',
    textStyle: { color: '#e4f3ff', fontSize: 24 },
  },
  grid: {
    left: 10,
    right: 10,
    top: 20,
    bottom: 10,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: {
      color: '#e4f3ff',
      fontSize: 24,
      fontFamily: 'SourceHanSansSC',
      rotate: 30,
      interval: 'auto',
    },
    axisLine: {
      lineStyle: { color: 'rgba(13, 165, 190, 0.5)' },
    },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: 'rgba(228, 243, 255, 0.7)',
      fontSize: 20,
      fontFamily: 'SourceHanSansSC',
    },
    axisLine: { show: false },
    splitLine: {
      lineStyle: { color: 'rgba(13, 165, 190, 0.15)' },
    },
  },
  series: [
    {
      name: "隐患数量",
      type: "bar",
      barMaxWidth: 40,
      data: [],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      label: {
        show: true,
        position: 'top',
        color: '#e4f3ff',
        fontSize: 22,
        fontFamily: 'SourceHanSansSC',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 12,
          shadowColor: 'rgba(93, 135, 172, 0.4)',
        },
      },
      animationDelay: function (idx) {
        return idx * 100;
      },
    },
  ],
};
export const risksOption = {
  radar: {
    // 雷达图配置
    indicator: [{ name: "", max: 20 }],
    radius: "70%",
    center: ["50%", "50%"],
    splitNumber: 5,
    axisLine: {
      lineStyle: {
        color: "#fff",
        opacity: 0.2,
      },
    },
    splitArea: {
      show: false,
    },
    axisLabel: {
      show: true,
      color: "#fff",
      formatter: function (value) {
        return value;
      },
    },
  },
  series: [
    // 外层蓝色环
    {
      type: "line",
      coordinateSystem: "radar",
      data: [18],
      lineStyle: {
        color: "#409eff",
        width: 10,
      },
      areaStyle: {
        opacity: 0,
      },
      symbol: "none",
    },
    // 中层绿色环
    {
      type: "line",
      coordinateSystem: "radar",
      data: [10],
      lineStyle: {
        color: "#67c23a",
        width: 10,
      },
      areaStyle: {
        opacity: 0,
      },
      symbol: "none",
    },
    // 内层黄色环
    {
      type: "line",
      coordinateSystem: "radar",
      data: [7],
      lineStyle: {
        color: "#e6a235",
        width: 10,
      },
      areaStyle: {
        opacity: 0,
      },
      symbol: "none",
    },
    // 最内层红色环
    {
      type: "line",
      coordinateSystem: "radar",
      data: [17],
      lineStyle: {
        color: "#f56c6c",
        width: 10,
      },
      areaStyle: {
        opacity: 0,
      },
      symbol: "none",
    },
  ],
};
export const riskRingsOption = {
  series: [
    {
      type: "gauge",
      radius: "70%",
      center: ["50%", "50%"],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [
            [0.1, "#00bfff"],
            [0.5, "#ffcc00"],
            [1, "#ff4500"],
          ],
          width: 10,
        },
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: "{value}" },
      detail: { show: false },
      data: [{ value: 15, name: "" }],
    },
    {
      type: "gauge",
      radius: "60%",
      center: ["50%", "50%"],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [
            [0.1, "#00ff00"],
            [0.5, "#ffff00"],
            [1, "#ff0000"],
          ],
          width: 8,
        },
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: "{value}" },
      detail: { show: false },
      data: [{ value: 10, name: "" }],
    },
    {
      type: "gauge",
      radius: "50%",
      center: ["50%", "50%"],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [
            [0.1, "#00bfff"],
            [0.5, "#ffcc00"],
            [1, "#ff4500"],
          ],
          width: 6,
        },
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: "{value}" },
      detail: { show: false },
      data: [{ value: 7, name: "" }],
    },
    {
      type: "gauge",
      radius: "40%",
      center: ["50%", "50%"],
      startAngle: 90,
      endAngle: -270,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          color: [
            [0.1, "#00bfff"],
            [0.5, "#ffcc00"],
            [1, "#ff4500"],
          ],
          width: 4,
        },
      },
      axisTick: { show: false },
      axisLabel: { show: true, formatter: "{value}" },
      detail: { show: false },
      data: [{ value: 17, name: "" }],
    },
  ],
};

export const handledOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    backgroundColor: 'rgba(2, 17, 29, 0.9)',
    borderColor: 'rgba(13, 165, 190, 0.5)',
    textStyle: { color: '#e4f3ff', fontSize: 28 },
  },
  legend: {
    data: ["未处置", "已处置", "处置率"],
    textStyle: {
      color: "#fff",
      fontSize: 24,
    },
    top: "0%",
    right: "15%",
  },
  grid: {
    left: 2,
    right: 2,
    top: 40,
    bottom: "20%",
  },
  xAxis: {
    type: "category",
    data: [],
    axisLabel: {
      color: "#fff",
      fontSize: 24,
    },
    axisLine: {
      lineStyle: {
        color: "#00bfff",
      },
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: [
    {
      type: "value",
      name: "单位：个",
      min: 0,
      max: 50,
      interval: 10,
      axisLabel: {
        color: "#fff",
        fontSize: 24,
      },
      axisLine: {
        lineStyle: {
          color: "#00bfff",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#00bfff",
          opacity: 0.3,
        },
      },
    },
    {
      type: "value",
      name: "单位：% ",
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        color: "#fff",
        fontSize: 24,
      },
      axisLine: {
        lineStyle: {
          color: "#00bfff",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#00bfff",
          opacity: 0.3,
        },
      },
      position: "right",
    },
  ],
  series: [
    {
      name: "未处置",
      type: "bar",
      barWidth: "20%",
      itemStyle: {
        color: "#f5a623",
      },
      data: [],
    },
    {
      name: "已处置",
      type: "bar",
      barWidth: "20%",
      itemStyle: {
        color: "#007aff",
      },
      data: [],
    },
    {
      name: "处置率",
      type: "line",
      smooth: true,
      lineStyle: {
        color: "#ff4d4d",
        width: 3,
      },
      areaStyle: {
        color: "rgba(255, 77, 77, 0.3)",
      },
      yAxisIndex: 1,
      data: [],
    },
  ],
};
