<template>
  <div class="data-module pipeline-module">
    <div class="module-header">
      <div class="module-title">{{ moduleConfig.moduleName }}管网</div>
    </div>
    <div class="module-content pipeline-module-content">
      <div class="material-content">
        <div id="pipeline-chart" class="pipeline-chart"></div>
      </div>
      <div class="hidden-danger">
        <div class="danger-header">
          <span class="danger-count">{{ dangerCount }}</span>
          <span class="danger-text">{{ moduleConfig.moduleName }}管网隐患</span>
        </div>
        <div id="danger-chart" class="danger-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, inject } from "vue";
import { officialWebsiteOption, dangerBarOption } from "./ehcartsOptions";
import * as echarts from "echarts";
import {
  getDrainageMaterialRatio,
  getDrainageRiskCount,
  getWaterSupplyMaterialRatio,
  getWaterSupplyRiskCount,
} from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
// 从根组件接收模块配置
const moduleConfig = inject('MODULE_CONFIG', {
  sszx: 'csaqzx_gs',
  imagePath: 'waterSupply',
  moduleName: '供水',

  dictKey: {
    yhlx: 'yhlx_gs'
  }
});

const dangerCount = ref(0);
const pipelineLegend = ref();

// 材质类型到颜色的映射（新色系）
const materialColorMap = {
  // PE系列
  'PE': '#5D87AC',
  'PE100': '#5D87AC',
  'PE80': '#4D74FF',
  // 球墨铸铁系列
  '球墨铸铁': '#93DBFF',
  '铸铁': '#C3540C',
  // 其他材质
  '钢管': '#4D74FF',
  'PVC': '#93DBFF',
  '默认': '#93DBFF'
};

// 备用颜色数组（用于未知材质）
const fallbackColors = ["#5D87AC", "#C3540C", "#4D74FF", "#93DBFF"];

/**
 * 生成渐变色配置
 */
const getGradientColor = (baseColor: string): echarts.graphic.LinearGradient => {
  // 将十六进制颜色转换为rgba格式
  const hexToRgba = (hex: string, startAlpha: number, endAlpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return {
      start: `rgba(${r}, ${g}, ${b}, ${startAlpha})`,
      end: `rgba(${r}, ${g}, ${b}, ${endAlpha})`,
    };
  };

  const rgba = hexToRgba(baseColor, 0, 1);
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: rgba.start },
    { offset: 1, color: rgba.end },
  ]);
};

const gwczMap = ref({});
const initMaterialList = async () => {
  const dictionaries = await getCachedDictionary("gwcz");
  gwczMap.value = dictionaries.reduce((acc, cur) => {
    acc[cur.f_ItemValue] = cur.f_ItemName;
    return acc;
  }, {});
  let res;
  if (moduleConfig.sszx == "csaqzx_gs") {
    res = await getWaterSupplyMaterialRatio({ Sszx: moduleConfig.sszx });
  } else if (moduleConfig.sszx == "csaqzx_ps") {
    res = await getDrainageMaterialRatio({ Sszx: moduleConfig.sszx });
  }
  const data = Array.isArray(res) ? res : (res?.data || []);
  nextTick(() => {
    // 先合并相同材质的数据
    const mergedData = {};
    (data as any[]).forEach(item => {
      const materialName = gwczMap.value[item.materialType] || item.materialType;
      if (mergedData[materialName]) {
        mergedData[materialName].value += item.count;
        mergedData[materialName].ratio += item.ratio;
      } else {
        mergedData[materialName] = {
          name: materialName,
          id: item.materialType,
          value: item.count,
          ratio: item.ratio,
        };
      }
    });

    // 转换为数组并分配颜色
    const gwczData = Object.values(mergedData).map((item: any, idx) => {
      // 优先使用材质映射的颜色，否则使用备用颜色
      const color = materialColorMap[item.name] || materialColorMap[item.id] || fallbackColors[idx % fallbackColors.length];
      return {
        ...item,
        name: `${item.name} ${item.ratio.toFixed(1)}%`,
        color: color,
      };
    });

    pipelineLegend.value = gwczData;
    officialWebsiteOption.series[0].data = gwczData.map((gwcz: any) => ({
      ...gwcz,
      itemStyle: {
        color: gwcz.color,
      },
    }));
    const chartDom = document.getElementById("pipeline-chart");

    if (chartDom) {
      const pipelineChart = echarts.init(chartDom);
      pipelineChart.setOption(officialWebsiteOption);
    }
  });
};

// 隐患柱状图颜色
const dangerColors = ["#f76204", "#f5a623", "#e6a235", "#4D74FF", "#5D87AC", "#93DBFF"];

const initHiddenDangerTypes = async () => {
  const yhlx = moduleConfig.dictKey?.yhlx || "";
  const res = await getCachedDictionary(yhlx);
  const dangerTypeMap = {};
  res.forEach((item) => {
    dangerTypeMap[item.f_ItemValue] = item.f_ItemName;
  });
  let riskRes;
  if (moduleConfig.sszx == "csaqzx_gs") {
    riskRes = await getWaterSupplyRiskCount({ Sszx: moduleConfig.sszx });
  } else if (moduleConfig.sszx == "csaqzx_ps") {
    riskRes = await getDrainageRiskCount({ Sszx: moduleConfig.sszx });
  }
  const riskData = Array.isArray(riskRes) ? riskRes : (riskRes?.data || []);

  dangerCount.value = (riskData as any[]).reduce((total, item) => total + item.count, 0);

  const sortedRiskRes = [...(riskData as any[])].sort((a, b) => b.count - a.count);

  nextTick(() => {
    (dangerBarOption as any).xAxis.data = sortedRiskRes.map((item: any) =>
      dangerTypeMap[item.riskType] || item.riskType
    );
    (dangerBarOption as any).series[0].data = sortedRiskRes.map((item: any, idx: number) => ({
      value: item.count,
      itemStyle: {
        color: dangerColors[idx % dangerColors.length],
      },
    }));
    const chartDom = document.getElementById("danger-chart");
    if (chartDom) {
      const dangerChart = echarts.init(chartDom);
      dangerChart.setOption(dangerBarOption);
    }
  });
};

onMounted(async () => {
  initChart();
  initHiddenDangerTypes();
  initMaterialList();
});

const initChart = () => { };
</script>

<style lang="scss" scoped>
.pipeline-module-content {
  display: flex;
  flex-direction: row !important;
}

.material-content {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;

  .pipeline-chart {
    width: 100%;
    height: 100%;
  }

  .material-legend {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .legend-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(5px);

        .legend-name,
        .legend-value {
          color: #5D87AC;
        }
      }

      .legend-item-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .legend-color {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        box-shadow: 0 0 8px rgba(93, 135, 172, 0.3);
        transition: all 0.3s ease;
      }

      &:hover .legend-color {
        box-shadow: 0 0 12px rgba(93, 135, 172, 0.6);
      }

      .legend-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 28px;
        color: #e4f3ff;
        line-height: 42px;
        text-align: left;
        font-style: normal;
        transition: color 0.3s ease;
      }
    }

    .legend-value {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 500;
      font-size: 28px;
      line-height: 42px;
      text-align: right;
      font-style: normal;
      transition: color 0.3s ease;
      display: flex;
      align-items: baseline;
      gap: 4px;

      .value-percent {
        font-size: 30px;
        color: #E4F3FF;
        line-height: 44px;
        text-align: left;
        font-style: normal;
      }
    }
  }
}

.hidden-danger {
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  .danger-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 0 20px;
    width: 100%;
    box-sizing: border-box;

    .danger-count {
      font-family: YouSheBiaoTiHei;
      font-size: 48px;
      line-height: 62px;
      font-style: normal;
      background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .danger-text {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 26px;
      line-height: 44px;
      font-style: normal;
      color: rgba(228, 243, 255, 0.8);
    }
  }

  .danger-chart {
    width: 100%;
    height: 100%;
  }
}</style>
