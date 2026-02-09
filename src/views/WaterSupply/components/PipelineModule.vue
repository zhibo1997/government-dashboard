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
        <!-- 隐患小球展示区 -->
        <div class="danger-scene">
          <!-- 隐患小球 -->
          <div v-for="ball in dangerBalls" :key="ball.riskType" class="danger-ball"
            :class="{ primary: ball.count >= 3, 'small-ball': ball.count < 3 }" :style="{
              '--angle': ball.angle + 'deg',
              '--radius': ball.radius + 'px',
              '--size': ball.size + 'px',
              '--font-size': ball.fontSize + 'px',
            }">
            <img :src="ball.count < 3 ? baseDangerImage : seriousDangerImage" :alt="ball.type" class="danger-image" />
            <span class="ball-type">{{ ball.type }}</span>
          </div>
        </div>

        <div class="base-img">
          <span class="danger-count gradient-text">{{ dangerCount }}</span>
          <span class="danger-text">{{ moduleConfig.moduleName }}管网隐患</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, inject } from "vue";
import { officialWebsiteOption } from "./ehcartsOptions";
import * as echarts from "echarts";
import {
  getDrainageMaterialRatio,
  getDrainageRiskCount,
  getWaterSupplyMaterialRatio,
  getWaterSupplyRiskCount,
} from "@/services/waterSupplyService";

// 引入图片资源
import baseDangerImage from "@/assets/img/waterSupply/base_danger.png";
import seriousDangerImage from "@/assets/img/waterSupply/serious_danger.png";
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

// 配置项:严重隐患阈值
const SERIOUS_DANGER_THRESHOLD = 3;

// 配置项:隐患小球大小
const DANGER_BALL_CONFIG = {
  serious: { size: 104, fontSize: 20 },
  normal: { size: 70, fontSize: 13 },
  minDistance: 120, // 小球之间的最小间距
  maxRadius: 160, // 最大分布半径
  minRadius: 60, // 最小分布半径
};

const dangerCount = ref(0);

const pipelineLegend = ref();

const colors = ["#5D87AC", "#C3540C", "#4D74FF", "#93DBFF"];

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
    const gwczData = (data as any[]).map((item, idx) => ({
      name: `${gwczMap.value[item.materialType]} ${item.ratio}%`,
      id: item.materialType,
      value: item.count,
      radio: item.ratio,
      color: colors[idx],
    }));
    pipelineLegend.value = gwczData;
    officialWebsiteOption.series[0].data = gwczData.map((gwcz, idx) => ({
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

// 隐患小球数据
const dangerBalls = ref([]);

/**
 * 检查两个小球是否重叠
 */
const isOverlapping = (pos1, pos2, minDistance) => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < minDistance;
};

/**
 * 生成随机位置（极坐标）
 */
const generateRandomPosition = (existingPositions, ballSize) => {
  const { minDistance, maxRadius, minRadius } = DANGER_BALL_CONFIG;
  const effectiveMinDistance = minDistance + ballSize;

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    // 随机生成角度和半径
    const angle = Math.random() * 360;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);

    // 转换为笛卡尔坐标用于碰撞检测
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);

    const newPos = { x, y };

    // 检查是否与已有小球重叠
    const hasOverlap = existingPositions.some((pos) =>
      isOverlapping(newPos, pos, effectiveMinDistance)
    );

    if (!hasOverlap) {
      return { angle, radius, x, y };
    }

    attempts++;
  }

  // 如果无法找到不重叠的位置，返回一个随机位置
  const angle = Math.random() * 360;
  const radius = minRadius + Math.random() * (maxRadius - minRadius);
  const x = radius * Math.cos((angle * Math.PI) / 180);
  const y = radius * Math.sin((angle * Math.PI) / 180);

  return { angle, radius, x, y };
};

const initHiddenDangerTypes = async () => {
  const yhlx = moduleConfig.dictKey?.yhlx || "";
  const res = await getCachedDictionary(yhlx);
  // 创建隐患类型映射
  const dangerTypeMap = {};
  res.forEach((item) => {
    dangerTypeMap[item.f_ItemValue] = item.f_ItemName;
  });
  let riskRes;
  // 获取隐患数据
  if (moduleConfig.sszx == "csaqzx_gs") {
    riskRes = await getWaterSupplyRiskCount({ Sszx: moduleConfig.sszx });
  }
  else if (moduleConfig.sszx == "csaqzx_ps") {
    riskRes = await getDrainageRiskCount({ Sszx: moduleConfig.sszx });
  }
  const riskData = Array.isArray(riskRes) ? riskRes : (riskRes?.data || []);

  // 计算隐患总数
  dangerCount.value = (riskData as any[]).reduce((total, item) => total + item.count, 0);

  // 按count排序，严重隐患优先排列
  const sortedRiskRes = [...(riskData as any[])].sort((a, b) => b.count - a.count);

  // 生成隐患小球数据
  const existingPositions = [];
  const balls = sortedRiskRes.map((item) => {
    // 根据count设置大小和字体
    const isSerious = item.count >= SERIOUS_DANGER_THRESHOLD;
    const config = isSerious
      ? DANGER_BALL_CONFIG.serious
      : DANGER_BALL_CONFIG.normal;
    const size = config.size;
    const fontSize = config.fontSize;

    // 生成随机位置，避免重叠
    const position = generateRandomPosition(existingPositions, size);
    existingPositions.push({ x: position.x, y: position.y });

    return {
      riskType: item.riskType,
      type: dangerTypeMap[item.riskType] || item.riskType,
      count: item.count,
      angle: position.angle,
      radius: position.radius,
      size: size,
      fontSize: fontSize,
    };
  });

  dangerBalls.value = balls;
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
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
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
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .danger-scene {
    width: 100%;
    height: 300px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 30px;
  }

  // 隐患小球（随机位置，不重叠）
  .danger-ball {
    position: absolute;
    width: var(--size);
    height: var(--size);

    // 极坐标定位
    left: 50%;
    top: 50%;
    margin-left: calc(var(--size) / -2);
    margin-top: calc(var(--size) / -2);
    transform: rotate(var(--angle)) translateX(var(--radius)) rotate(calc(var(--angle) * -1));

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .danger-image {
      width: 100%;
      height: 100%;
    }

    .ball-type {
      position: absolute;
      width: 100px;
      text-align: center;
      font-size: var(--font-size);
      color: #fff;
      text-shadow: 0 0 2px #000;

      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      color: #ffffff;
    }
  }

  .base-img {
    width: 442px;
    height: 194px;
    background-image: url("@/assets/img/waterSupply/danger_base.png");
    background-size: 100% 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .danger-count {
      font-family: YouSheBiaoTiHei;
      font-size: 48px;
      color: #e74040;
      line-height: 62px;
      text-align: left;
      font-style: normal;
      background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .danger-text {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      line-height: 44px;
      text-align: left;
      font-style: normal;
    }
  }
}

// 主要隐患样式
// .danger-ball.primary {
//   z-index: 10;
//   filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.7));
// }

// // 一般隐患样式
// .danger-ball.small-ball {
//   filter: drop-shadow(0 0 4px rgba(0, 100, 255, 0.6));
// }</style>
