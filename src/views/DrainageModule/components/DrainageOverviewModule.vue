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
  <PointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :position="{ x: 0, y: 0 }"
    :title="popupTitle"
    :display-fields="popupDisplayFields"
    @close="closePopup"
  >
    <template #actions>
      <button class="action-btn btn-camera" @click="handleShowCamera">监控设备</button>
    </template>
  </PointPopup>

  <!-- 监控视频播放 -->
  <VideoPopup v-model:visible="videoPlayer.visible.value" :video-url="videoPlayer.videoUrl.value" :camera-name="videoPlayer.cameraName.value" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from "vue";
import { useVueCesium } from "vue-cesium";
import {
  getDrainageStats,
  getDrainFloodCoordinateList,
  getDrainRiverCoordinateList,
  getSewageTreatmentPlantCoordinateList,
  getDrainFloodDetailByLsh,
  getDrainRiverDetail,
  getSewageTreatmentPlantDetail,
} from "@/services/waterSupplyService";
import { getSurveillanceVideoPage, getSurveillanceVideoDetail } from "@/services/surveillanceVideoService";
import { useInfrastructureModule } from "@/hook/useInfrastructureModule";
import { useVideoPlayer } from "@/hook/useVideoPlayer";
import { useMapStore } from "@/stores/mapStore";
import { mapToLabelValue } from '@/config/fieldLabelConfig';
import { getCachedDictionary } from '@/services/dictionaryService';
import PointPopup from "@/components/PointPopup.vue";
import VideoPopup from "@/views/BridgeModule/components/map/VideoPopup.vue";

// 响应式数据
const overviewData = ref<any[]>([]);

// 字典映射（易积水点详情用）
const dictMap = ref<Record<string, { value: string; label: string }[]>>({})

watchEffect(async () => {
  if (!popupVisible.value) return
  const zgztDict = await getCachedDictionary('zgzt')
  dictMap.value = {
    zgzt: zgztDict.map((item: any) => ({ value: item.f_ItemValue, label: item.f_ItemName })),
  }
})

// 弹窗标题 & 字段
const popupTitle = computed(() => {
  if (!popupData.value) return '详情'
  const data = popupData.value
  return data.mc || data.name || data.jsdmc || data.hdlmc || '详情'
})

const popupDisplayFields = computed(() => {
  if (!popupData.value) return []
  return mapToLabelValue(popupData.value, [], dictMap.value) as { label: string; value: string | number | null }[]
})

// 视频播放
const videoPlayer = useVideoPlayer()

// 监控设备：查询排水专项监控视频
const handleShowCamera = async () => {
  const jsdmc = popupData.value?.jsdmc
  if (!jsdmc) return
  closePopup()

  try {
    const res = await getSurveillanceVideoPage({
      page: '1',
      rows: '1000',
      spszwz: jsdmc,
      sszx: 'csaqzx_ps',
    })
    const cameras = res?.rows || []
    if (cameras.length > 0) {
      // 直接播放第一个监控视频
      const detail = await getSurveillanceVideoDetail(cameras[0].lsh)
      if (detail?.spbh) {
        await videoPlayer.play(detail.spbh, detail.spmc || jsdmc)
      }
    }
  } catch (e) {
    console.error('获取监控视频失败:', e)
  }
}

const mapStore = useMapStore();

// 散点图标
const pointIcon = (name: string) => new URL(`../../../assets/img/points/4个专项点位/${name}.png`, import.meta.url).href

// 统一 hook
const {
  selectedId, popupVisible, popupData,
  init, handleItemClick, closePopup,
} = useInfrastructureModule({
  coordinateApiMap: {
    '易积水点': getDrainFloodCoordinateList,
    '河道': getDrainRiverCoordinateList,
    '污水厂': getSewageTreatmentPlantCoordinateList,
  },
  detailApiMap: {
    '易积水点': getDrainFloodDetailByLsh,
    '河道': getDrainRiverDetail,
    '污水厂': getSewageTreatmentPlantDetail,
  },
  mvtLayerMap: {
    '河道': { id: '8957f558-a82f-4243-8d45-5ae0d04f7b81' },
    '污水箅子': { id: '28b7c8b1-5edf-4ac3-b686-a11f8a4b9471' },
    '雨污合流箅子': { id: 'cd3d3010-2f92-4e8a-8c90-cd7683f7128f' },
    '污水管线': { id: '2071343c-a75a-49e4-9e9b-529efe525581' },
    '雨水管线': { id: 'f879d172-9a05-4d47-a70f-0688eca35533' },
    '雨污合流管线': { id: 'a7d508cb-65e6-49d5-a42a-cd8865a8fb92' },
    '污水井': { id: '0017de5f-0fb8-41ee-81cb-ef5f05ea790d' },
    '雨水方形箅': { id: '187f97a4-444e-47f9-bb95-092fd3139aac' },
    '雨水圆形井': { id: 'eb124a2c-b167-4482-a076-d331fed0a5a2' },
  },
  iconUrlMap: {
    '易积水点': pointIcon('易积水点'),
    '污水厂': pointIcon('污水厂'),
  },
});

// icon 映射
const iconMapping: Record<string, string> = {
  '污水厂': 'water_treatment',
  '易积水点': 'fire_hydrant',
  '河道': 'pipeline',
  '污水箅子': 'fire_hydrant',
  '雨污合流箅子': 'fire_hydrant',
  '污水管线': 'pipeline',
  '雨水管线': 'pipeline',
  '雨污合流管线': 'pipeline',
  '污水井': 'pump_station',
  '雨水方形箅': 'fire_hydrant',
  '雨水圆形井': 'pump_station',
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
    const data = await getDrainageStats();
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
    console.error("获取排水专项统计指标失败:", error);
  }
};

onMounted(async () => {
  const $vc = useVueCesium();
  const readyObj = await $vc.creatingPromise;
  // 确保图层树已加载
  if (!mapStore.layerTreeLoaded) {
    await mapStore.fetchLayerTree();
  }
  await init(readyObj.viewer, mapStore);
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
