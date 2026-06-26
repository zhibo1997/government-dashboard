<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">总览</div>
    </div>
    <div class="module-content">
      <div class="overview-content">
        <div
          class="overview-item"
          :class="{ active: selectedId === item.id }"
          v-for="item in overviewData"
          :key="item.id"
          @click="handleItemClick(item)"
        >
          <div class="item-icon">
            <img v-if="item.icon" :src="getIconUrl(item.icon)" :alt="item.name" />
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.name }}</div>
            <div class="item-value">
              <span class="value gradient-text">{{ item.value !== null && item.value !== undefined ? item.value : '-' }}</span>
              <span class="unit" v-if="item.unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 点位详情弹窗 -->
  <GasPointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :position="{ x: 0, y: 0 }"
    :point-type="selectedId || ''"
    @close="closePopup"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useVueCesium } from "vue-cesium";
import { getWaterSupplyStats, getWaterSourceCoordinateList, getWaterPlantCoordinateList, getWaterPumpStationCoordinateList, getWaterSourceDetail, getWaterPlantDetail, getWaterPumpStationDetail } from "@/services/waterSupplyService";
import { useInfrastructureModule } from "@/hook/useInfrastructureModule";
import GasPointPopup from "@/views/GasModule/components/GasPointPopup.vue";

// 响应式数据
const overviewData = ref<any[]>([]);

// 散点图标
const pointIcon = (name: string) => new URL(`../../../assets/img/points/4个专项点位/${name}.png`, import.meta.url).href

// 统一 hook
const {
  selectedId, popupVisible, popupData,
  init, handleItemClick, closePopup,
} = useInfrastructureModule({
  coordinateApiMap: {
    '水源地': getWaterSourceCoordinateList,
    '水厂': getWaterPlantCoordinateList,
    '供水泵站': getWaterPumpStationCoordinateList,
  },
  detailApiMap: {
    '水源地': getWaterSourceDetail,
    '水厂': getWaterPlantDetail,
    '供水泵站': getWaterPumpStationDetail,
  },
  iconUrlMap: {
    '水源地': pointIcon('水源地'),
    '水厂': pointIcon('水厂'),
    '供水泵站': pointIcon('供水泵站'),
  },
});

// icon 映射
const iconMapping: Record<string, string> = {
  '水源地': 'water_source',
  '水厂': 'water_treatment',
  '供水管网': 'pipeline',
  '供水泵站': 'pump_station',
  '市政消火栓': 'fire_hydrant',
};

// 动态获取图标路径
const getIconUrl = (iconName: string) => {
  return new URL(
    `../../../assets/img/waterSupply/${iconName}.png`,
    import.meta.url
  ).href;
};

// 初始化数据
const initData = async () => {
  try {
    const data = await getWaterSupplyStats();
    if (Array.isArray(data) && data.length > 0) {
      overviewData.value = data
        .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
        .map((item: any) => ({
          id: item.name,
          name: item.name,
          value: item.count ?? null,
          unit: item.unit || '',
          icon: iconMapping[item.name] || 'pipeline',
        }));
    }
  } catch (error) {
    console.error("获取供水专项统计指标失败:", error);
  }
};

onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  await init(readyObj.viewer);
  initData();
});
</script>

<style lang="scss" scoped>
.overview-module {
  .overview-content {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    padding: 0 10px;
    overflow-y: auto;
  }

  .overview-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    box-shadow: inset 0 0 0 2px transparent;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(13, 165, 190, 0.1);
      box-shadow: inset 0 0 0 2px rgba(13, 165, 190, 0.3);
    }

    &.active {
      background: rgba(13, 165, 190, 0.2);
      box-shadow: inset 0 0 0 2px #0da5be, 0 0 12px rgba(13, 165, 190, 0.3);
    }

    .item-icon {
      width: 80px;
      height: 80px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .item-info {
      flex: 1;
      padding-left: 12px;
    }

    .item-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: var(--font-size-heading);
      color: #e4f3ff;
      margin-bottom: 6px;
    }

    .item-value {
      width: 240px;
      height: 81.5px;
      background-image: url("@/assets/img/waterSupply/overflow_item_bg.png");
      background-size: 100% 100%;
      padding: 0 20px;
      display: flex;
      justify-content: space-around;
      align-items: baseline;

      .value {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-title);
        color: #ffffff;
        line-height: 52px;
        text-align: left;
        font-style: normal;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
      }

      .unit {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: var(--font-size-caption);
        color: #e4f3ff;
        line-height: 29px;
        text-align: left;
        font-style: normal;
      }
    }
  }
}
</style>
