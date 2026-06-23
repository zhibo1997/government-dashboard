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
import { ref, onMounted, onBeforeUnmount } from "vue";
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
import { useGasOverviewPoints } from "@/hook/useGasOverviewPoints";
import { useMapHooks } from "@/hook/useMapHooks";
import { useMvtPickHandler } from "@/hook/useMvtPickHandler";
import { useMapStore } from "@/stores/mapStore";
import GasPointPopup from "@/views/GasModule/components/GasPointPopup.vue";

// 响应式数据
const overviewData = ref<any[]>([]);
const selectedId = ref<string | null>(null);

// 地图点位管理
const { init: initMapPoints, addPoints, clearPoints } = useGasOverviewPoints();

// MVT 图层管理
const { loadMVTLayer } = useMapHooks();
const mapStore = useMapStore();
let viewer: any = null;

// MVT 图层实例缓存
const mvtLayerCache: Record<string, any> = {};

// 弹窗状态
const popupVisible = ref(false);
const popupData = ref<any>(null);

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

// MVT 图层 ID 映射
const mvtLayerIdMap: Record<string, string> = {
  '河道': '8957f558-a82f-4243-8d45-5ae0d04f7b81',
  '污水箅子': '28b7c8b1-5edf-4ac3-b686-a11f8a4b9471',
  '雨污合流箅子': 'cd3d3010-2f92-4e8a-8c90-cd7683f7128f',
  '污水管线': '2071343c-a75a-49e4-9e9b-529efe525581',
  '雨水管线': 'f879d172-9a05-4d47-a70f-0688eca35533',
  '雨污合流管线': 'a7d508cb-65e6-49d5-a42a-cd8865a8fb92',
  '污水井': '0017de5f-0fb8-41ee-81cb-ef5f05ea790d',
  '雨水方形箅': '187f97a4-444e-47f9-bb95-092fd3139aac',
  '雨水圆形井': 'eb124a2c-b167-4482-a076-d331fed0a5a2',
};

// 点位接口映射
const coordinateApiMap: Record<string, () => Promise<any>> = {
  '易积水点': getDrainFloodCoordinateList,
  '河道': getDrainRiverCoordinateList,
  '污水厂': getSewageTreatmentPlantCoordinateList,
};

// 详情接口映射
const detailApiMap: Record<string, (lsh: string) => Promise<any>> = {
  '易积水点': getDrainFloodDetailByLsh,
  '河道': getDrainRiverDetail,
  '污水厂': getSewageTreatmentPlantDetail,
};

// 当前活跃的 MVT 图层（用于 pickHandler）
let activeMvtLayer: any = null;

// MVT 点击查询
const { setup: setupMvtPick } = useMvtPickHandler({
  get viewer() { return viewer },
  getMvtLayer: () => activeMvtLayer,
  onFeaturePick: (props) => {
    popupData.value = props;
    selectedId.value = Object.keys(mvtLayerIdMap).find(k => mvtLayerCache[k] === activeMvtLayer) || "MVT要素";
    popupVisible.value = true;
  },
  onScatterPick: (entity) => {
    if (entity.point && entity.description) {
      try {
        const pointData = JSON.parse(entity.description.getValue());
        handlePointClick(pointData);
      } catch (e) {
        console.warn("解析点位数据失败:", e);
      }
    }
  },
});

/** 从图层树中查找 MVT 图层 URL */
const findMvtUrl = (layerId: string): string | null => {
  const tree = mapStore.layerTreeNodes;
  const search = (nodes: any[]): string | null => {
    for (const node of nodes) {
      if (node.id === layerId && node.type === 'mvt' && node.url) {
        return node.url;
      }
      if (node.child?.length) {
        const found = search(node.child);
        if (found) return found;
      }
    }
    return null;
  };
  return search(tree);
};

/** 显示 MVT 图层 */
const showMvtLayer = async (layerName: string) => {
  if (!viewer) return;

  const layerId = mvtLayerIdMap[layerName];
  if (!layerId) return;

  // 已加载过的图层直接显示
  if (mvtLayerCache[layerName]) {
    mvtLayerCache[layerName].show = true;
    activeMvtLayer = mvtLayerCache[layerName];
    viewer.scene.requestRender();
    return;
  }

  const url = findMvtUrl(layerId);
  if (!url) {
    console.warn(`图层树中未找到 ${layerName} MVT 图层`);
    return;
  }

  try {
    const layer = await loadMVTLayer(viewer, url);
    mvtLayerCache[layerName] = layer;
    activeMvtLayer = layer;
  } catch (e) {
    console.error(`加载 ${layerName} MVT 失败:`, e);
  }
};

/** 隐藏所有 MVT 图层 */
const hideAllMvtLayers = () => {
  if (!viewer) return;
  Object.values(mvtLayerCache).forEach(layer => {
    if (layer) layer.show = false;
  });
  activeMvtLayer = null;
  viewer.scene.requestRender();
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
    hideAllMvtLayers();
    closePopup();
    return;
  }

  selectedId.value = item.id;
  closePopup();
  clearPoints();
  hideAllMvtLayers();

  // 有 MVT 图层的展示 MVT
  if (mvtLayerIdMap[item.name]) {
    await showMvtLayer(item.name);
    return;
  }

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
  viewer = readyObj.viewer;
  await initMapPoints(viewer);
  initData();
  setupMvtPick();

  // 确保图层树已加载
  if (!mapStore.layerTreeLoaded) {
    await mapStore.fetchLayerTree();
  }
});

onBeforeUnmount(() => {
  hideAllMvtLayers();
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
