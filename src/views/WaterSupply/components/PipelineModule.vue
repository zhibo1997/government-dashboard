<template>
  <div class="data-module pipeline-module">
    <div class="module-header">
      <div class="module-title">供水管网</div>
    </div>
    <div class="module-content pipeline-module-content">
      <div class="material-content">
        <div id="pipeline-chart" class="pipeline-chart"></div>
        <div class="material-legend">
          <div
            class="legend-item"
            v-for="item in pipelineLegend"
            :key="item.name"
          >
            <div class="legend-item-content">
              <div
                class="legend-color"
                :style="{ backgroundColor: item.color }"
              ></div>
              <div class="legend-name">{{ item.name }}</div>
            </div>
            <div class="legend-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
      <div class="hidden-danger">
        <!-- 隐患小球展示区 -->
        <div class="danger-scene">
          <!-- 隐患小球 -->
          <div
            v-for="ball in dangerBalls"
            :key="ball.riskType"
            class="danger-ball"
            :class="{ primary: ball.count >= 3, 'small-ball': ball.count < 3 }"
            :style="{
              '--angle': ball.angle + 'deg',
              '--radius': ball.radius + 'px',
              '--size': ball.size + 'px',
              '--font-size': ball.fontSize + 'px',
            }"
          >
            <img
              :src="ball.count < 3 ? baseDangerImage : seriousDangerImage"
              :alt="ball.type"
              class="danger-image"
            />
            <span class="ball-type">{{ ball.type }}</span>
          </div>
        </div>

        <div class="base-img">
          <span class="danger-count gradient-text">{{ dangerCount }}</span>
          <span class="danger-text">供水管网隐患</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { officialWebsiteOption } from "./ehcartsOptions";
import * as echarts from "echarts";
import {
  getWaterSupplyMaterialRatio,
  getWaterSupplyRiskCount,
} from "@/services/waterSupplyService";
import { getDataItems } from "@/services/commonService";

// 引入图片资源
import baseDangerImage from "@/assets/img/waterSupply/base_danger.png";
import seriousDangerImage from "@/assets/img/waterSupply/serious_danger.png";

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

const pipelineLegend = ref([
  {
    color: "#00bfff",
    name: "PE",
    value: "38%",
  },
  {
    color: "#ff4500",
    name: "球墨铸铁",
    value: "40%",
  },
  {
    color: "#ffff00",
    name: "PE",
    value: "10%",
  },
  {
    color: "#66cc66",
    name: "球墨铸铁",
    value: "12%",
  },
]);

const initMaterialList = async () => {
  const res = await getWaterSupplyMaterialRatio();
  console.log("🚀 ~ initMaterialList ~ res:", res);
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
  const res = await getDataItems("yhlx", "gs");
  // 创建隐患类型映射
  const dangerTypeMap = {};
  res.forEach((item) => {
    dangerTypeMap[item.f_ItemValue] = item.f_ItemName;
  });

  // 获取隐患数据
  const riskRes = await getWaterSupplyRiskCount();

  // 计算隐患总数
  dangerCount.value = riskRes.reduce((total, item) => total + item.count, 0);

  // 按count排序，严重隐患优先排列
  const sortedRiskRes = [...riskRes].sort((a, b) => b.count - a.count);

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

const initChart = () => {
  const chartDom = document.getElementById("pipeline-chart");
  if (chartDom) {
    const pipelineChart = echarts.init(chartDom);
    pipelineChart.setOption(officialWebsiteOption);
  }
};
</script>

<style lang="scss" scoped>
.pipeline-module-content {
  display: flex;
}

.material-content {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .pipeline-chart {
    width: 217px;
    height: 217px;
  }

  .material-legend {
    width: 100%;
    display: flex;
    flex-direction: column;

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      justify-content: space-between;
      padding: 0 26px;

      .legend-item-content {
        display: flex;
        align-items: center;
      }

      .legend-color {
        width: 20px;
        height: 20px;
        margin-right: 13px;
      }

      .legend-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 30px;
        color: #e4f3ff;
        line-height: 44px;
        text-align: left;
        font-style: normal;
      }
    }

    .legend-value {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      color: #e4f3ff;
      line-height: 44px;
      text-align: left;
      font-style: normal;
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
    height: 360px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
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
    transform: rotate(var(--angle)) translateX(var(--radius))
      rotate(calc(var(--angle) * -1));

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
    position: relative;
    top: -40px;

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
// }
</style>
