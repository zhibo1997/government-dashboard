/**
 * 燃气模块 - 风险隐患模块图表配置
 * 集中管理 ECharts 图表的配置项、颜色、样式等
 */
import * as echarts from "echarts";
import { FONT_SIZE } from "@/assets/styles/font-sizes";

// ==================== 颜色配置 ====================
/**
 * 风险等级颜色映射
 */
export const riskColorMap = {
  重大风险: "#E88D6B",
  较大风险: "#F4D982",
  一般风险: "#61E29D",
  低风险: "#9bb8c7",
};

// ==================== 占位样式配置 ====================
/**
 * 环形图占位样式（背景环）
 */
export const getPlaceHolderStyle = () => ({
  label: { show: false },
  labelLine: { show: false },
  itemStyle: {
    color: "rgba(29, 57, 64, 0.5)",
    borderColor: "rgba(29, 57, 64, 0.8)",
    borderWidth: 8,
  },
  emphasis: { disabled: true },
});

// ==================== 风险等级多环形图配置 ====================
/**
 * 生成风险等级多环形图的标签样式
 * @param color - 颜色值
 * @param lineLength - 引导线长度
 */
export const createLabelStyle = (color: string, lineLength = 100) => ({
  label: {
    show: false,
  },
  labelLine: {
    show: true,
    length: lineLength,
    smooth: 0.5,
    lineStyle: { color: "rgba(211, 234, 241, 0.3)" },
  },
  itemStyle: {
    borderWidth: 8,
    shadowBlur: 20,
    borderColor: color,
    shadowColor: color,
  },
});

/**
 * 根据是否有数据生成标签样式
 * @param hasData - 是否有数据
 * @param color - 颜色值
 * @param lineLength - 引导线长度
 */
export const createDataLabelStyle = (
  hasData: boolean,
  color: string,
  lineLength = 100
) => {
  if (!hasData) {
    return getPlaceHolderStyle();
  }
  return createLabelStyle(color, lineLength);
};

/**
 * 生成风险等级多环形图的 ECharts 配置
 * @param riskLegendData - 风险等级数据
 */
export const createRiskLevelChartOption = (
  riskLegendData: any[]
): echarts.EChartsOption => {
  const placeHolderStyle = getPlaceHolderStyle();

  const radiusMap = [
    [94, 95],
    [74, 75],
    [54, 55],
    [34, 35],
  ];
  const lineLengthMap = [40, 50, 60, 70];

  // 动态计算最大值，确保环形图能正确显示比例
  const maxValue =
    Math.max(...riskLegendData.map((item) => item.value), 1) * 1.5;

  const dataSeries = riskLegendData.map((risk, index) => {
    const hasData = risk.value > 0;

    return {
      name: risk.name,
      type: "pie",
      clockWise: false,
      hoverAnimation: hasData,
      radius: radiusMap[index],
      ...createDataLabelStyle(hasData, risk.color, lineLengthMap[index]),
      data: [
        { value: risk.value, name: risk.name },
        { value: maxValue - risk.value, name: "", ...placeHolderStyle },
      ],
    };
  });

  return {
    backgroundColor: "transparent",
    color: ["#9bb8c7", "#61E29D", "#F4D982", "#E88D6B"],
    legend: { show: false },
    series: dataSeries,
  };
};

// ==================== 整改状态环形进度图配置 ====================
/**
 * 整改状态颜色映射
 */
export const rectificationColorMap = {
  continuousImprovement: ["#10ADC0", "#FFFFFF"],
  rectified: ["#FFF407", "#3FFEFD"],
  inRectification: ["#CDAB06", "#FFFEED"],
  notRectified: ["#FEAC04", "#F75E04"],
};

/**
 * 生成整改状态环形进度图的 ECharts 配置
 * @param progress - 进度值（0-1）
 * @param status - 整改状态
 */
export const createProgressOption = (
  progress: number,
  status: string
): echarts.EChartsOption => {
  const colors =
    rectificationColorMap[status as keyof typeof rectificationColorMap] ||
    ["#10ADC0", "#FFFFFF"];
  const percentage = Math.round(progress * 100);

  return {
    series: [
      {
        type: "pie",
        radius: ["70%", "90%"],
        center: ["50%", "50%"],
        startAngle: 90,
        silent: true,
        label: {
          show: true,
          position: "center",
          formatter: `{a|${percentage}%}`,
          rich: {
            a: {
              fontSize: FONT_SIZE.caption,
              fontWeight: "bold",
              fontFamily: "YouSheBiaoTiHei",
              color: "#FFFFFF",
              lineHeight: 26,
            },
          },
        },
        labelLine: { show: false },
        data: [
          {
            value: progress,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                { offset: 0, color: colors[0] },
                { offset: 1, color: colors[1] },
              ]),
              borderRadius: 10,
            },
          },
          {
            value: 1 - progress,
            itemStyle: {
              color: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
            },
            emphasis: {
              itemStyle: { color: "rgba(255, 255, 255, 0.1)" },
            },
          },
        ],
        emphasis: { scale: false },
      },
    ],
  };
};

// ==================== 图表初始化工具函数 ====================
/**
 * 初始化图表实例
 * @param domId - DOM 元素 ID
 */
export const initChart = (domId: string): echarts.ECharts | null => {
  const chartDom = document.getElementById(domId);
  if (!chartDom) return null;
  return echarts.init(chartDom);
};

/**
 * 销毁图表实例
 * @param chart - 图表实例
 */
export const disposeChart = (chart: echarts.ECharts | null) => {
  if (chart) {
    chart.dispose();
  }
};
