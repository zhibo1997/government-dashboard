<template>
  <div class="data-module gas-overview-module">
    <div class="module-header">
      <div class="module-title">基础设施</div>
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
  <PointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :position="popupPosition"
    :title="popupTitle"
    :display-fields="popupDisplayFields"
    @close="closePopup"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useVueCesium } from "vue-cesium";
import {
  getGasStats,
  getGasEnterpriseCoordinateList,
  getBottleGasEnterpriseCoordinateList,
  getManholeCoverDetail,
  getGasEnterpriseLedgerDetail,
  getBottleGasEnterpriseLedgerDetail,
} from "@/services/gasService";
import { useInfrastructureModule } from "@/hook/useInfrastructureModule";
import { useMapStore } from "@/stores/mapStore";
import { mapToLabelValue } from '@/config/fieldLabelConfig'
import PointPopup from "@/components/PointPopup.vue";

// 响应式数据
const overviewData = ref<any[]>([]);
const popupPosition = ref({ x: 0, y: 0 });

// 弹窗标题 & 字段
const popupTitle = computed(() => {
  if (!popupData.value) return '详情'
  const data = popupData.value
  if (selectedId.value === '燃气井盖') return data.jgbh || '井盖详情'
  if (selectedId.value === '燃气企业') return data.qymc || '企业详情'
  if (selectedId.value === '液化气企业') return data.qymc || '企业详情'
  return '详情'
})

const popupDisplayFields = computed(() => {
  if (!popupData.value) return []
  return mapToLabelValue(popupData.value) as { label: string; value: string | number | null }[]
})

const mapStore = useMapStore();

// 散点图标
const pointIcon = (name: string) => new URL(`../../../assets/img/points/4个专项点位/${name}.png`, import.meta.url).href

// 统一 hook（散点 + 详情 + 弹窗 + MVT 全部由 hook 管理）
const {
  selectedId, popupVisible, popupData,
  init, handleItemClick, closePopup,
} = useInfrastructureModule({
  coordinateApiMap: {
    '燃气企业': getGasEnterpriseCoordinateList,
    '液化气企业': getBottleGasEnterpriseCoordinateList,
  },
  detailApiMap: {
    '燃气企业': getGasEnterpriseLedgerDetail,
    '液化气企业': getBottleGasEnterpriseLedgerDetail,
  },
  mvtLayerMap: {
    '燃气管线': { id: 'c01a6292-e654-409f-a127-95a1f2011f30' },
    '燃气井盖': { id: '5e76d4d2-1c48-4b6d-bbd2-a488938dd695' },
  },
  iconUrlMap: {
    '燃气企业': pointIcon('燃气企业'),
    '液化气企业': pointIcon('液化气企业'),
  },
  onMvtFeaturePick: () => {
    popupPosition.value = { x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 - 100 };
  },
});

// icon 映射
const iconMapping: Record<string, string> = {
  '燃气企业': 'major_customer',
  '液化气企业': 'major_customer',
  '燃气管线': 'pipeline',
  '燃气井盖': 'fire_hydrant',
};

const getIconUrl = (iconName: string) => {
  return new URL(`../../../assets/img/waterSupply/${iconName}.png`, import.meta.url).href;
};

// 初始化数据
const initData = async () => {
  try {
    const data = await getGasStats();
    if (Array.isArray(data) && data.length > 0) {
      overviewData.value = data
        .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
        .map((item: any) => ({
          id: item.name,
          name: item.name,
          value: item.count ?? null,
          unit: item.unit || '',
          icon: iconMapping[item.name] || 'device_count',
        }));
    }
  } catch (error) {
    console.error("获取燃气专项统计指标失败:", error);
  }
};

onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  if (!mapStore.layerTreeLoaded) {
    await mapStore.fetchLayerTree();
  }
  await init(readyObj.viewer, mapStore);
  initData();
});
</script>

<style lang="scss" scoped>
.gas-overview-module {
  flex: 1;

  .overview-content {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    padding: 0 10px;
    overflow-y: auto;
  }

  .overview-item {
    width: calc(50% - 8px);
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
