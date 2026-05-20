import { EChartsOption } from "echarts";
import { FONT_SIZE } from "@/assets/styles/font-sizes";

export interface LevelMapping {
  [key: string]: {
    name: string;
    key: string;
    order: number;
    color?: string;
  };
}

export interface SeriesData {
  name: string;
  type: "bar" | "pictorialBar";
  data: number[];
  itemStyle?: {
    color: string | string[];
  };
  symbolRepeat?: boolean | "fixed";
  symbolMargin?: string | number;
  symbolSize?: (string | number)[];
}

// ========== 象形柱图配置参数 ==========
/**
 * 象形柱图符号尺寸 [宽度, 高度]
 */
const PICTORIAL_SYMBOL_SIZE: [number, number] = [30, 14];

/**
 * 象形柱图符号间距（每个矩形符号之间的垂直间距）
 */
const PICTORIAL_SYMBOL_MARGIN = 4;

/**
 * 不同等级之间的横向间距
 */
const PICTORIAL_SERIES_SPACING = 4;

// ========== 公共图表配置 ==========
/**
 * 图表网格配置
 */
const CHART_GRID_CONFIG = {
  left: "2%",
  right: "2%",
  top: "15%",
  bottom: "20%",
};

/**
 * 坐标轴标签样式配置
 */
const AXIS_LABEL_STYLE = {
  fontFamily: "SourceHanSansSC, SourceHanSansSC",
  fontWeight: 400,
  fontSize: FONT_SIZE.body,
  color: "#FFFFFF",
  lineHeight: 35,
};

/**
 * X轴配置
 */
const X_AXIS_CONFIG = {
  type: "category" as const,
  axisLine: {
    lineStyle: {
      color: "#3A5F6F",
    },
  },
  axisLabel: {
    ...AXIS_LABEL_STYLE,
    align: "center" as const,
  },
};

/**
 * Y轴配置
 */
const Y_AXIS_CONFIG = {
  type: "value" as const,
  name: "单位：个",
  nameTextStyle: {
    ...AXIS_LABEL_STYLE,
  },
  axisLine: {
    show: false,
  },
  axisTick: {
    show: false,
  },
  splitLine: {
    lineStyle: {
      color: "#1D3940",
      type: "dashed" as const,
    },
  },
  axisLabel: {
    ...AXIS_LABEL_STYLE,
  },
};

/**
 * 图例配置
 */
const LEGEND_CONFIG = {
  orient: "horizontal" as const,
  top: 16,
  right: 16,
  itemGap: 24, // 增加图例项之间的间隔
  textStyle: {
    fontFamily: "SourceHanSansSC",
    fontSize: FONT_SIZE.body,
    color: "#D3EAF1",
  },
};

/**
 * Tooltip 提示框配置
 */
const TOOLTIP_CONFIG = {
  trigger: "axis" as const,
  axisPointer: {
    type: "shadow" as const,
  },
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  borderColor: "#D3EAF1",
  borderWidth: 1,
  textStyle: {
    fontFamily: "SourceHanSansSC",
    fontSize: FONT_SIZE.mini,
    color: "#FFFFFF",
  },
  padding: [8, 12],
  formatter: (params: any) => {
    if (!Array.isArray(params) || params.length === 0) {
      return "";
    }
    
    let html = `<div style="padding: 4px 0;">`;
    html += `<div style="margin-bottom: 8px; color: #D3EAF1; font-weight: bold;">${params[0].axisValue}</div>`;
    
    params.forEach((param: any) => {
      html += `<div style="margin: 4px 0;">`;
      html += `<span style="display: inline-block; width: 8px; height: 8px; background-color: ${param.color}; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>`;
      html += `<span>${param.seriesName}: </span>`;
      html += `<span style="font-weight: bold; color: #FFE08C;">${param.value}</span>`;
      html += `</div>`;
    });
    
    html += `</div>`;
    return html;
  },
};

/**
 * 十六进制颜色转RGB
 */
const hexToRgb = (hex: string): number[] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

/**
 * 创建垂直渐变色对象（从下到上：透明到深色）
 */
const createVerticalGradient = (baseColor: string): any => {
  return {
    type: "linear" as const,
    x: 0,
    y: 1,
    x2: 0,
    y2: 0,
    colorStops: [
      { offset: 0, color: `rgba(${hexToRgb(baseColor).join(",")}, 0)` },
      { offset: 1, color: baseColor },
    ],
  };
};

/**
 * 创建自定义垂直渐变色对象（从上到下：深色到透明）
 * @param startColor 起始颜色（顶部）
 * @param endColor 结束颜色（底部，通常为透明）
 */
export const createCustomVerticalGradient = (startColor: string, endColor: string): any => {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: startColor },
      { offset: 1, color: endColor },
    ],
  };
};

/**
 * 获取风险等级图表配置
 */
export const getRiskChartOption = (
  xAxisData: string[],
  levelMapping: LevelMapping,
  series: SeriesData[]
): EChartsOption => {
  // 添加渐变色效果
  const seriesWithGradient = series.map((item) => ({
    ...item,
    
    itemStyle: {
      color: createVerticalGradient(item.itemStyle?.color as string),
    },
  } as any));

  return {
    tooltip: TOOLTIP_CONFIG,
    grid: CHART_GRID_CONFIG,
    xAxis: {
      ...X_AXIS_CONFIG,
      data: xAxisData,
    },
    yAxis: Y_AXIS_CONFIG,
    series: seriesWithGradient,
    legend: LEGEND_CONFIG,
  };
};

/**
 * 获取隐患等级图表配置
 */
export const getHazardChartOption = (
  xAxisData: string[],
  levelMapping: LevelMapping,
  series: SeriesData[]
): EChartsOption => {
  // 添加渐变色效果
  const seriesWithGradient = series.map((item) => ({
    ...item,
    
    itemStyle: {
      color: createVerticalGradient(item.itemStyle?.color as string),
    },
  } as any));

  return {
    tooltip: TOOLTIP_CONFIG,
    grid: CHART_GRID_CONFIG,
    xAxis: {
      ...X_AXIS_CONFIG,
      data: xAxisData,
    },
    yAxis: Y_AXIS_CONFIG,
    series: seriesWithGradient,
    legend: LEGEND_CONFIG,
  };
};

/**
 * 创建象形柱图系列配置（通用函数）
 * @param series 系列数据
 * @returns 象形柱图系列配置
 */
const createPictorialBarSeries = (series: SeriesData[]) => {
  // 为每个等级分配偏移位置，实现非堆叠横向排列
  const seriesCount = series.length;
  const symbolWidth = PICTORIAL_SYMBOL_SIZE[0];
  const totalWidth = seriesCount * symbolWidth + (seriesCount - 1) * PICTORIAL_SERIES_SPACING;
  const startOffset = -(totalWidth / 2);

  // 转换为象形柱图的 series 配置
  return series.map((item, index) => {
    const xOffset = startOffset + index * (symbolWidth + PICTORIAL_SERIES_SPACING);
    return {
      name: item.name,
      type: "pictorialBar" as const,
      data: item.data,
      symbol: "rect",
      symbolRepeat: true, // 改为true，让符号数量根据数据值自动重复
      symbolMargin: PICTORIAL_SYMBOL_MARGIN,
      symbolSize: PICTORIAL_SYMBOL_SIZE,
      symbolOffset: [xOffset, 0],
      itemStyle: {
        color: createVerticalGradient(item.itemStyle?.color as string),
      },
    } as any;
  });
};

/**
 * 获取风险等级象形柱图配置（非堆叠，多系列并行显示）
 */
export const getRiskPictorialBarOption = (
  xAxisData: string[],
  levelMapping: LevelMapping,
  series: SeriesData[]
): EChartsOption => {
  return {
    tooltip: TOOLTIP_CONFIG,
    grid: CHART_GRID_CONFIG,
    xAxis: {
      ...X_AXIS_CONFIG,
      data: xAxisData,
    },
    yAxis: Y_AXIS_CONFIG,
    series: createPictorialBarSeries(series),
    legend: LEGEND_CONFIG,
  };
};

/**
 * 获取隐患等级象形柱图配置（非堆叠，多系列并行显示）
 */
export const getHazardPictorialBarOption = (
  xAxisData: string[],
  levelMapping: LevelMapping,
  series: SeriesData[]
): EChartsOption => {
  return {
    tooltip: TOOLTIP_CONFIG,
    grid: CHART_GRID_CONFIG,
    xAxis: {
      ...X_AXIS_CONFIG,
      data: xAxisData,
    },
    yAxis: Y_AXIS_CONFIG,
    series: createPictorialBarSeries(series),
    legend: LEGEND_CONFIG,
  };
};

/**
 * 获取监测报警柱状图配置
 */
export const getMonitoringAlarmChartOption = (
  xAxisData: string[],
  levelMapping: LevelMapping,
  series: SeriesData[]
): EChartsOption => {
  return {
    tooltip: TOOLTIP_CONFIG,
    grid: {
      left: "2%",
      right: "2%",
      top: "15%",
      bottom: "2%",
    },
    legend: {
      orient: "horizontal" as const,
      top: 16,
      right: 16,
      itemGap: 24,
      textStyle: {
        fontFamily: "SourceHanSansSC",
        fontSize: 24,
        color: "#D3EAF1",
      },
    },
    xAxis: {
      ...X_AXIS_CONFIG,
      data: xAxisData,
    },
    yAxis: Y_AXIS_CONFIG,
    series: series.map((item) => ({
      ...item,
      type: "bar" as const,
      barWidth: 30,
      barMinHeight: 5, // 确保 0 值也有微小高度可见
    } as any)),
  };
};

/**
 * 获取预警统计环形图配置
 * @param data 环形图数据 [{ name: '处置中', value: 18, color: '#...' }, ...]
 */
export const getMonitoringDonutChartOption = (
  data: { name: string; value: number; color: string }[]
): EChartsOption => {
  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderColor: "#D3EAF1",
      borderWidth: 1,
      textStyle: {
        color: "#FFFFFF",
      },
    },
    series: [
      {
        name: "预警统计",
        type: "pie",
        radius: ["50%", "80%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c}",
          color: "#D3EAF1",
          fontSize: 24,
          fontFamily: "SourceHanSansSC",
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 15,
          lineStyle: {
            color: "#D3EAF1",
          },
        },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color,
          },
        })),
      },
    ],
  };
};


/**
 * 获取预警处置柱状图配置
 */
export const getMonitoringEarlyWarningChartOption = (
  xAxisData: string[],
  statusMapping: LevelMapping,
  series: SeriesData[]
): EChartsOption => {
  return {
    tooltip: TOOLTIP_CONFIG,
    grid: {
      left: "2%",
      right: "2%",
      top: "15%",
      bottom: "2%",
    },
    legend: {
      orient: "horizontal" as const,
      top: 16,
      right: 16,
      itemGap: 24,
      textStyle: {
        fontFamily: "SourceHanSansSC",
        fontSize: 24,
        color: "#D3EAF1",
      },
    },
    xAxis: {
      ...X_AXIS_CONFIG,
      data: xAxisData,
    },
    yAxis: Y_AXIS_CONFIG,
    series: series.map((item) => ({
      ...item,
      type: "bar" as const,
      barWidth: 30,
      barMinHeight: 5, // 确保 0 值也有微小高度可见
    } as any)),
  };
};
