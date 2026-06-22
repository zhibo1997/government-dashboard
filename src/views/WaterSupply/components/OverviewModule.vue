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
import { getWaterSupplyStats, getWaterSourceCoordinateList, getWaterPlantCoordinateList, getWaterPumpStationCoordinateList, getWaterSourceDetail, getWaterPlantDetail, getWaterPumpStationDetail } from "@/services/waterSupplyService";
import { useGasOverviewPoints } from "@/hook/useGasOverviewPoints";
import GasPointPopup from "@/views/GasModule/components/GasPointPopup.vue";

// 响应式数据
const overviewData = ref<any[]>([]);
const selectedId = ref<string | null>(null);

// 地图点位管理
const { init: initMapPoints, addPoints, clearPoints } = useGasOverviewPoints();

// 弹窗状态
const popupVisible = ref(false);
const popupData = ref<any>(null);

// icon 映射
const iconMapping: Record<string, string> = {
  '水源地': 'water_source',
  '水厂': 'water_treatment',
  '供水管网': 'pipeline',
  '供水泵站': 'pump_station',
  '市政消火栓': 'fire_hydrant',
};

// 点位接口映射
const coordinateApiMap: Record<string, () => Promise<any>> = {
  '水源地': getWaterSourceCoordinateList,
  '水厂': getWaterPlantCoordinateList,
  '供水泵站': getWaterPumpStationCoordinateList,
};

// 详情接口映射
const detailApiMap: Record<string, (lsh: string) => Promise<any>> = {
  '水源地': getWaterSourceDetail,
  '水厂': getWaterPlantDetail,
  '供水泵站': getWaterPumpStationDetail,
};

// 动态获取图标路径
const getIconUrl = (iconName: string) => {
  return new URL(
    `../../../assets/img/waterSupply/${iconName}.png`,
    import.meta.url
  ).href;
};

// 关闭弹窗
const closePopup = () => {
  popupVisible.value = false;
  popupData.value = null;
};

// 点击地图点位回调
const handlePointClick = async (point: any) => {
  const detailApi = detailApiMap[selectedId.value || ''];
  if (detailApi) {
    try {
      const detail = await detailApi(point.lsh);
      popupData.value = detail;
      popupVisible.value = true;
    } catch (error) {
      console.error('获取详情失败:', error);
    }
  }
};

// 点击事件处理
const handleItemClick = async (item: any) => {
  if (selectedId.value === item.id) {
    selectedId.value = null;
    clearPoints();
    closePopup();
    return;
  }

  selectedId.value = item.id;
  closePopup();
  clearPoints();

  // 有坐标接口的展示点位
  const coordinateApi = coordinateApiMap[item.name];
  if (coordinateApi) {
    try {
      const data = await coordinateApi();
      if (Array.isArray(data) && data.length > 0) {
        const points = data.map((p: any) => ({
          lsh: p.lsh,
          jd: p.jd,
          wd: p.wd,
          name: p.name || p.lsh,
        }));
        addPoints(points, item.name, handlePointClick);
      }
    } catch (error) {
      console.error(`获取${item.name}点位失败:`, error);
    }
  }
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
  await initMapPoints();
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
