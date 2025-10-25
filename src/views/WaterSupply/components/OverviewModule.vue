<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">纵览</div>
    </div>
    <div class="module-content">
      <div class="overview-content">
        <div class="overview-item" v-for="item in overviewData" :key="item.id">
          <div class="item-icon">
            <img :src="getIconUrl(item.icon)" :alt="item.name" />
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.name }}</div>
            <div class="item-value">
              <span class="value gradient-text">{{ item.value }}</span>
              <span class="unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/openApi'

// 响应式数据
const overviewData = ref([
  {
    "id": "source",
    "name": "水源地",
    "value": 0,
    "unit": "个",
    "icon": "water_source",
    "description": "供水系统的源头设施"
  },
  {
    "id": "water_treatment",
    "name": "水厂",
    "value": 0,
    "unit": "个",
    "icon": "water_treatment",
    "description": "自来水处理与供应中心"
  },
  {
    "id": "pump_station",
    "name": "供水泵站",
    "value": 0,
    "unit": "个",
    "icon": "pump_station",
    "description": "加压输送供水的泵站"
  },
  {
    "id": "fire_hydrant",
    "name": "市政消火栓",
    "value": 0,
    "unit": "个",
    "icon": "fire_hydrant",
    "description": "城市公共消防用水设施"
  },
  {
    "id": "pipeline",
    "name": "供水管网",
    "value": 0,
    "unit": "公里",
    "icon": "pipeline",
    "description": "城市供水管道总长度"
  },
  {
    "id": "major_customer",
    "name": "供水大户",
    "value": 0,
    "unit": "户",
    "icon": "major_customer",
    "description": "大型用水单位或企业用户"
  }
])

// 动态获取图标路径
const getIconUrl = (iconName) => {
  return new URL(`../../../assets/img/waterSupply/${iconName}.png`, import.meta.url).href
}

// 初始化数据
const initOverviewData = async () => {
  try {
    const res = await api.overviewData.List()
    console.log("🚀 ~ initOverviewData ~ res:", res)
    
    if (res && res.data) {
      // 创建一个映射关系，将jcsslx映射到overviewData的对应项
      const typeMapping = {
        'jcssdstj0502': 'fire_hydrant',     // 市政消火栓
        'jcssdstj0503': 'source',           // 水源地
        'jcssdstj0504': 'water_treatment',  // 水厂
        'jcssdstj0505': 'pump_station',     // 供水泵站
        'jcssdstj0506': 'major_customer',   // 供水大用户
        'jcssdstj0501': 'pipeline'          // 供水管网
      }

      // 更新overviewData中的值
      res.data.forEach(item => {
        const targetId = typeMapping[item.jcsslx]
        if (targetId) {
          const targetItem = overviewData.value.find(data => data.id === targetId)
          if (targetItem) {
            targetItem.value = item.jcsstjsl
          }
        }
      })
    }
  } catch (error) {
    console.error('获取纵览数据失败:', error)
  }
}

onMounted(() => {
  initOverviewData()
})
</script>

<style lang="scss" scoped>
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

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .item-info {
      flex: 1;
      padding-left: 8px;
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
        background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);
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
