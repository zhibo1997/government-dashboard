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
  <GasPointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :position="popupPosition"
    :point-type="selectedId || ''"
    @close="closePopup"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useVueCesium } from "vue-cesium";
import {
  getGasStats,
  getGasEnterpriseCoordinateList,
  getBottleGasEnterpriseCoordinateList,
  getManholeCoverCoordinateList,
  getManholeCoverDetail,
  getGasEnterpriseLedgerDetail,
  getBottleGasEnterpriseLedgerDetail,
} from "@/services/gasService";
import { useInfrastructureModule } from "@/hook/useInfrastructureModule";
import { useMapHooks } from "@/hook/useMapHooks";
import { useMapStore } from "@/stores/mapStore";
import GasPointPopup from "./GasPointPopup.vue";

// 响应式数据
const overviewData = ref<any[]>([]);
const popupPosition = ref({ x: 0, y: 0 });

const mapStore = useMapStore();
const { loadMVTLayer, load3DTiles } = useMapHooks();

// 散点图标
const pointIcon = (name: string) => new URL(`../../../assets/img/points/4个专项点位/${name}.png`, import.meta.url).href

// 统一 hook（散点 + 详情 + 弹窗 + MVT）
const {
  selectedId, popupVisible, popupData, viewer,
  init, handlePointClick, closePopup, clearPoints, clearAll,
  addPoints, setupClickHandler, setActiveMvtLayer, showMvtLayer,
} = useInfrastructureModule({
  coordinateApiMap: {
    '燃气企业': getGasEnterpriseCoordinateList,
    '液化气企业': getBottleGasEnterpriseCoordinateList,
  },
  detailApiMap: {
    '燃气企业': getGasEnterpriseLedgerDetail,
    '液化气企业': getBottleGasEnterpriseLedgerDetail,
  },
  mvtLayerIdMap: {
  },
  iconUrlMap: {
    '燃气企业': pointIcon('燃气企业'),
    '液化气企业': pointIcon('液化气企业'),
  },
  onMvtFeaturePick: (_props, moduleName) => {
    popupPosition.value = { x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 - 100 };
  },
});

// 燃气管线 MVT（按 name 查找，特殊逻辑）
let pipelineMvtLayer: any = null;

const findPipelineMvtUrl = (): string | null => {
  const tree = mapStore.layerTreeNodes;
  const search = (nodes: any[]): string | null => {
    for (const node of nodes) {
      if (node.name === "燃气管线" && node.type === "mvt" && node.url) return node.url;
      if (node.child?.length) {
        const found = search(node.child);
        if (found) return found;
      }
    }
    return null;
  };
  return search(tree);
};

const showPipelineMvt = async () => {
  if (!viewer.value) return;
  if (pipelineMvtLayer) {
    pipelineMvtLayer.show = true;
    setActiveMvtLayer(pipelineMvtLayer);
    viewer.value.scene.requestRender();
    return;
  }
  const url = findPipelineMvtUrl();
  if (!url) return;
  try {
    pipelineMvtLayer = await loadMVTLayer(viewer.value, url);
    setActiveMvtLayer(pipelineMvtLayer);
  } catch (e) {
    console.error("加载燃气管线 MVT 失败:", e);
  }
};

const hidePipelineMvt = () => {
  if (pipelineMvtLayer) {
    pipelineMvtLayer.show = false;
    viewer.value?.scene?.requestRender();
  }
};

// 燃气井 3DTile
let gasWellTileset: any = null;

const showGasWell3DTile = async () => {
  if (!viewer.value) return;
  if (gasWellTileset) {
    gasWellTileset.show = true;
    viewer.value.scene.requestRender();
    return;
  }
  const url = 'https://webres.cityfun.com.cn/CSSMX/model/RQ_TR_RQJ/tileset.json';
  try {
    gasWellTileset = await load3DTiles(viewer.value, url, { flyTo: false });
  } catch (e) {
    console.error("加载燃气井 3DTile 失败:", e);
  }
};

const hideGasWell3DTile = () => {
  if (gasWellTileset) {
    gasWellTileset.show = false;
    viewer.value?.scene?.requestRender();
  }
};

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

// 点击事件处理
const handleItemClick = async (item: any) => {
  if (selectedId.value === item.id) {
    clearAll();
    hidePipelineMvt();
    hideGasWell3DTile();
    return;
  }

  selectedId.value = item.id;
  closePopup();
  clearPoints();
  hidePipelineMvt();
  hideGasWell3DTile();

  // 燃气管线：特殊 MVT（按 name 查找）
  if (item.name === '燃气管线') {
    await showPipelineMvt();
    return;
  }

  // 燃气井盖：加载燃气井 3DTile 模型
  if (item.name === '燃气井盖') {
    await showGasWell3DTile();
    return;
  }

  // 其他：加载散点
  const apiMapping: Record<string, () => Promise<any>> = {
    '燃气企业': getGasEnterpriseCoordinateList,
    '液化气企业': getBottleGasEnterpriseCoordinateList,
  };
  const iconMap: Record<string, string> = {
    '燃气企业': pointIcon('燃气企业'),
    '液化气企业': pointIcon('液化气企业'),
  };
  const apiFn = apiMapping[item.name];
  if (apiFn) {
    try {
      const data = await apiFn();
      if (Array.isArray(data) && data.length > 0) {
        addPoints(data, item.name, iconMap[item.name], handlePointClick);
        setupClickHandler(handlePointClick);
      }
    } catch (error) {
      console.error(`获取${item.name}数据失败:`, error);
    }
  }
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

onBeforeUnmount(() => {
  hidePipelineMvt();
  hideGasWell3DTile();
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
