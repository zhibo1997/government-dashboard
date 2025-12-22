/**
 * 桥梁模块圆环图表配置
 * 集中管理 ECharts 图表的配置项、颜色、渐变等
 */
import * as echarts from "echarts";

// ==================== 颜色配置 ====================
/**
 * 三个图表的颜色配置（按设计图）
 * 包含渐变色支持
 */
const colorPalettes = [
  // 桥梁结构（6种类型）
  [
    "#00D4D4", // 梁式桥 - 青色
    "#00A8D8", // 拱式桥 - 青蓝
    "#1E90FF", // 悬索桥 - 蓝色
    "#32CD32", // 斜拉桥 - 绿色
    "#FFB347", // 刚构桥 - 橙色
    "#FF6B6B", // 组合体系桥 - 红色
  ],
  // 公路桥梁养护等级（3种）
  [
    "#1E90FF", // I 级 - 蓝色
    "#32CD32", // II 级 - 绿色
    "#FF9F1C", // III 级 - 橙色
  ],
  // 城市桥梁养护等级（5种）
  [
    "#00CED1", // I 等养护 - 青色
    "#00FA9A", // II 等养护 - 绿色
    "#FFB347", // III 等养护 - 橙色
    "#FF6B6B", // IV 等养护 - 红色
    "#9370DB", // V 等养护 - 紫色
  ],
];

/**
 * 渐变色配置
 * 为每个数据项生成渐变色效果
 */
const gradientConfigs = [
  // 桥梁结构的渐变色
  [
    { start: "rgba(0, 212, 212, 0)", end: "rgba(0, 136, 170, 1)" },
    { start: "rgba(0, 168, 216, 0)", end: "rgba(0, 112, 187, 1)" },
    { start: "rgba(30, 144, 255, 0)", end: "rgba(0, 85, 255, 1)" },
    { start: "rgba(50, 205, 50, 0)", end: "rgba(0, 170, 0, 1)" },
    { start: "rgba(255, 179, 71, 0)", end: "rgba(255, 136, 0, 1)" },
    { start: "rgba(255, 107, 107, 0)", end: "rgba(221, 0, 0, 1)" },
  ],
  // 公路桥梁养护等级的渐变色
  [
    { start: "rgba(30, 144, 255, 0)", end: "rgba(0, 85, 255, 1)" },
    { start: "rgba(50, 205, 50, 0)", end: "rgba(0, 170, 0, 1)" },
    { start: "rgba(255, 159, 28, 0)", end: "rgba(255, 119, 0, 1)" },
  ],
  // 城市桥梁养护等级的渐变色
  [
    { start: "rgba(0, 206, 209, 0)", end: "rgba(0, 136, 170, 1)" },
    { start: "rgba(0, 250, 154, 0)", end: "rgba(0, 187, 119, 1)" },
    { start: "rgba(255, 179, 71, 0)", end: "rgba(255, 136, 0, 1)" },
    { start: "rgba(255, 107, 107, 0)", end: "rgba(221, 0, 0, 1)" },
    { start: "rgba(147, 112, 219, 0)", end: "rgba(102, 68, 187, 1)" },
  ],
];

// ==================== 颜色获取函数 ====================
/**
 * 根据图表索引和数据索引获取颜色配置
 */
export const getColorConfig = (chartIndex: number, dataIndex: number): string => {
  const palette = colorPalettes[chartIndex] || colorPalettes[0];
  return palette[dataIndex % palette.length] || "#10ADC0";
};

/**
 * 根据图表索引和数据索引获取渐变色配置
 */
export const getGradientColor = (chartIndex: number, dataIndex: number): echarts.graphic.LinearGradient => {
  const gradient = gradientConfigs[chartIndex] || gradientConfigs[0];
  const config = gradient[dataIndex % gradient.length];
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: config.start },
    { offset: 1, color: config.end },
  ]);
};

// ==================== 图表配置生成函数 ====================
/**
 * 生成圆环图 ECharts 配置项
 * @param chart 图表配置数据
 * @param chartIndex 图表索引
 */
export const createChartOption = (chart: any, chartIndex: number): echarts.EChartsOption => {
  // 准备数据，使用渐变色
  const seriesData = chart.data.map((item: any, dataIndex: number) => ({
    value: item.number,
    name: item.type,
    itemStyle: {
      color: getGradientColor(chartIndex, dataIndex),
    },
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}",
      borderColor: "transparent",
      borderWidth: 1,
      textStyle: {
        color: "#ffffff",
        fontSize: 14,
      },
    },
    legend: {
      show: true,
      orient: "horizontal",
      bottom: 0,
      left: "center",
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      formatter: (name: string) => {
        const item = seriesData.find((d: any) => d.name === name);
        return item ? `{name|${name}}` : name;
      },
      textStyle: {
        color: "#f5fcff",
        fontSize: 20,
        fontFamily: "SourceHanSansCNVF, SourceHanSansCNVF",
        rich: {
          name: {
            color: "#f5fcff",
            fontSize: 20,
          },
        },
      },
    },
    series: [
      {
        name: chart.title.slice(0, 4) + '\n\n' + chart.title.slice(4),

        type: "pie",
        radius: ["58%", "75%"],
        center: ["50%", "35%"],
        startAngle: 90,
        label: {
          show: true,
          position: "center",
          formatter: "{a}",
          fontSize: 24,
          fontWeight: "bold",
          color: "#effaff",
        },
        labelLine: {
          show: false,
        },
        padAngle: 5,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        data: seriesData,
      },
    ],
  };
};

// ==================== 工具函数 ====================
/**
 * 初始化图表实例
 */
export const initChart = (domId: string): echarts.ECharts | null => {
  const chartDom = document.getElementById(domId);
  if (!chartDom) return null;
  return echarts.init(chartDom);
};

/**
 * 销毁图表实例
 */
export const disposeChart = (chart: echarts.ECharts | null): void => {
  if (chart) {
    chart.dispose();
  }
};
