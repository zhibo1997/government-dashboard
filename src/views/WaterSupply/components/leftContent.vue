<!--
 * @Author: Do not edit
 * @Date: 2025-10-16 21:05:49
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-17 22:14:34
 * @Description: 
-->

<template>
  <div class="left-content">
    <!-- 纵览模块 -->
    <div class="data-module overview-module">
      <div class="module-header">
        <div class="module-title">纵览</div>
      </div>
      <div class="module-content">
        <div class="overview-content">
          <div class="overview-item" v-for="item in overflowData" :key="item.id">
            <div class="item-icon">
              <img :src="getIconUrl(item.icon)" :alt="item.name" />
            </div>
            <div class="item-info">
              <div class="item-title">{{ item.name }}</div>
              <div class="item-value">
                <span class="value">{{ item.value }}</span>
                <span class="unit">{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 供水水质模块 -->
    <div class="data-module water-quality-module">
      <div class="module-header">
        <div class="module-title">供水水质</div>
        <n-date-picker v-model:value="waterQualityDate" type="month" clearable class="custom-date-picker"
          :format="'yyyy年MM月'" />
      </div>
      <div class="module-content">
        <div class="quality-content">
          <div class="quality-item" v-for="plant in waterPlants" :key="plant.name">
            <div class="quality-item-title">{{ plant.name }}</div>
            <div class="quality-item-content">
              <div class="quality-item-parameter" v-for="parameter in plant.parameters" :key="parameter.id">
                <div class="parameter-value">
                  <span class="value">{{ parameter.value }}</span>
                  <img v-if="parameter.status == 'normal'" src="@/assets/img/waterSupply/quality_normal.png" alt="">
                  <img v-else src="@/assets/img/waterSupply/quality_abnormal.png" alt="">
                </div>
                <div class="parameter-title">{{ parameter.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 供水管网模块 -->
    <div class="data-module pipeline-module">
      <div class="module-header">
        <div class="module-title">供水管网</div>
      </div>
      <div class="module-content pipeline-module-content">
        <div class="material-content">
          <div id="pipeline-chart" class="pipeline-chart"></div>
        </div>
        <div class="hidden-danger">

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { officialWebsiteOption } from './ehcartsOptions'
import * as echarts from 'echarts'

onMounted(() => {
  const pipelineChart = echarts.init(document.getElementById('pipeline-chart'))
  pipelineChart.setOption(officialWebsiteOption)
})

// 动态获取图标路径
const getIconUrl = (iconName) => {
  console.log(import.meta.url)
  return new URL(`@/assets/img/waterSupply/${iconName}.png`, import.meta.url).href
}

const waterPlants = [
  {
    "name": "二水厂",
    "parameters": [
      {
        "id": "pH",
        "name": "pH 值",
        "value": 3.9,
        "unit": "",
        "status": "abnormal"
      },
      {
        "id": "turbidity",
        "name": "浊度",
        "value": 7.5,
        "unit": "NTU",
        "status": "abnormal"
      },
      {
        "id": "COD",
        "name": "COD",
        "value": 8.1,
        "unit": "mg/L",
        "status": "normal"
      },
      {
        "id": "residual_chlorine",
        "name": "余氯",
        "value": 1.2,
        "unit": "mg/L",
        "status": "normal"
      }
    ]
  },
  {
    "name": "沿镇水厂",
    "parameters": [
      {
        "id": "pH",
        "name": "pH 值",
        "value": 2.9,
        "unit": "",
        "status": "abnormal"
      },
      {
        "id": "turbidity",
        "name": "浊度",
        "value": 8.4,
        "unit": "NTU",
        "status": "abnormal"
      },
      {
        "id": "COD",
        "name": "COD",
        "value": 7.5,
        "unit": "mg/L",
        "status": "normal"
      },
      {
        "id": "residual_chlorine",
        "name": "余氯",
        "value": 1.6,
        "unit": "mg/L",
        "status": "normal"
      }
    ]
  }
]

const overflowData = [
  {
    "id": "source",
    "name": "水源地",
    "value": 148,
    "unit": "个",
    "icon": "water_source", // 可替换为实际图标路径或组件名
    "description": "供水系统的源头设施"
  },
  {
    "id": "water_treatment",
    "name": "水厂",
    "value": 358,
    "unit": "个",
    "icon": "water_treatment",
    "description": "自来水处理与供应中心"
  },
  {
    "id": "pump_station",
    "name": "供水泵站",
    "value": 192,
    "unit": "个",
    "icon": "pump_station",
    "description": "加压输送供水的泵站"
  },
  {
    "id": "fire_hydrant",
    "name": "市政消火栓",
    "value": 3987,
    "unit": "个",
    "icon": "fire_hydrant",
    "description": "城市公共消防用水设施"
  },
  {
    "id": "pipeline",
    "name": "供水管网",
    "value": 890,
    "unit": "公里",
    "icon": "pipeline",
    "description": "城市供水管道总长度"
  },
  {
    "id": "major_customer",
    "name": "供水大户",
    "value": 4290,
    "unit": "户",
    "icon": "major_customer",
    "description": "大型用水单位或企业用户"
  }
]
const waterQualityDate = ref(Date.now())

// 格式化日期显示
const formattedDate = computed(() => {
  if (!waterQualityDate.value) return ''
  const date = new Date(waterQualityDate.value)
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`
})

// 左侧数据展示组件
</script>

<style lang="scss" scoped>
.material-content {
  width: 50%;

  .pipeline-chart {
    width: 217px;
    height: 217px;
  }
}

.water-quality-module {
  .module-header {
    display: flex;
    justify-content: space-between;
  }
}

.quality-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
  width: 100%;

  .quality-item-title {
    background-image: url("@/assets/img/waterSupply/quality_title.png");
    width: 220px;
    height: 51px;
    background-size: 100% 100%;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: 36px;
    color: #EFFAFF;
    text-align: center;
    font-style: normal;
    margin-bottom: 40px;

  }

  .quality-item-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    // gap: 30px;
  }

  .quality-item-parameter {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    margin-bottom: 40px;

    .parameter-value {
      display: flex;
      flex-direction: column;
      width: 86px;
      position: relative;

      img {
        width: 100%;
        height: 90px;
      }

      .value {
        width: 100%;
        position: absolute;
        top: -30px;
        font-family: YouSheBiaoTiHei;
        font-size: 40px;
        color: #FFFFFF;
        line-height: 52px;
        text-align: center;
        font-style: normal;
      }
    }

    .parameter-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      color: #E4F3FF;
      line-height: 44px;
      text-align: center;
      font-style: normal;
    }
  }
}

// 日期选择器自定义样式
.water-quality-module {
  :deep(.custom-date-picker) {
    .n-input {
      width: 260px;
      background-color: #094358;
      border: 2px solid #11A7E2;
      border-radius: 8px;
      height: 56px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-size: 28px;
      color: #FFFFFF;
      padding: 6px 20px;

      &:hover {
        border-color: rgba(22, 119, 255, 0.8);
      }

      &:focus-within {
        border-color: #1677ff;
        box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
      }

      .n-input__input-el {
        color: #FFFFFF;
        font-size: 28px;
        caret-color: #1677ff;
      }

      .n-input__placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      .n-input__suffix,
      .n-input__prefix {
        .n-base-icon {
          color: rgba(255, 255, 255, 0.6);
          font-size: 24px;
        }
      }

      .n-input__state-border {
        border: none;
      }
    }

    // 清除按钮样式
    .n-base-clear {
      color: rgba(255, 255, 255, 0.6);

      &:hover {
        color: #ff4d4f;
      }
    }
  }
}

.overview-module {
  .overview-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    gap: 40px;
    padding: 0 10px;
  }

  .overview-item {
    display: flex;
    align-items: center;

    .item-icon {
      width: 90px;
      height: 100px;
      display: flex;
      justify-content: center;
      background-color: black;
    }

    .item-info {
      flex: 1;
      padding-left: 20px;

    }

    .item-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      color: #E4F3FF;
      margin-bottom: 6px;
    }

    .item-value {
      width: 220px;
      height: 81.5px;
      background-image: url('@/assets/img/waterSupply/overflow_item_bg.png');
      background-size: 100% 100%;
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;

      .value {
        font-family: YouSheBiaoTiHei;
        font-size: 40px;
        color: #FFFFFF;
        line-height: 52px;
        text-align: left;
        font-style: normal;
      }

      .unit {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 20px;
        color: #E4F3FF;
        line-height: 29px;
        text-align: left;
        font-style: normal;
      }
    }
  }
}
</style>