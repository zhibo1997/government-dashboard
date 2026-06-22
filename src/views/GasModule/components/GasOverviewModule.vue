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
import { useGasOverviewPoints } from "@/hook/useGasOverviewPoints";
import { useMapHooks } from "@/hook/useMapHooks";
import { useMapStore } from "@/stores/mapStore";
import GasPointPopup from "./GasPointPopup.vue";

// 响应式数据
const overviewData = ref<any[]>([]);
const selectedId = ref<string | null>(null);

// 弹窗状态
const popupVisible = ref(false);
const popupData = ref<any>(null);
const popupPosition = ref({ x: 0, y: 0 });

// 地图点位管理
const { init: initMapPoints, addPoints, clearPoints } = useGasOverviewPoints();

// MVT 图层管理
const { loadMVTLayer } = useMapHooks();
const mapStore = useMapStore();
let viewer: any = null;
let pipelineMvtLayer: any = null;

/** 从图层树中查找"燃气管线"MVT 图层的 URL */
const findPipelineMvtUrl = (): string | null => {
  const tree = mapStore.layerTreeNodes;
  const search = (nodes: any[]): string | null => {
    for (const node of nodes) {
      if (node.name === "燃气管线" && node.type === "mvt" && node.url) {
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

/** 统一点击处理器：MVT 要素优先，其次散点 */
const setupUnifiedClickHandler = () => {
  if (!viewer) return;
  const Cesium = (window as any).Cesium;

  viewer.screenSpaceEventHandler.setInputAction(async (movement: any) => {
    // 1. 尝试拾取 MVT 要素
    if (pipelineMvtLayer?.show) {
      try {
        const features = await viewer.imageryLayers.pickImageryLayerFeatures(
          pipelineMvtLayer,
          movement.position,
          viewer.scene
        );
        if (features?.length > 0) {
          const props: Record<string, any> = {};
          features[0].getPropertyNames?.().forEach((name: string) => {
            props[name] = features[0].getProperty(name);
          });
          console.log("🖱️ 燃气管线要素:", props);
          popupPosition.value = {
            x: window.innerWidth / 2 + 100,
            y: window.innerHeight / 2 - 100,
          };
          popupData.value = props;
          popupVisible.value = true;
          return;
        }
      } catch {
        // 非 MVT 区域，继续尝试散点
      }
    }

    // 2. 尝试拾取散点
    const pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id;
      if (entity.point && entity.description) {
        try {
          const pointData = JSON.parse(entity.description.getValue());
          handlePointClick(pointData);
        } catch (e) {
          console.warn("解析点位数据失败:", e);
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

/** 显示燃气管线 MVT 图层 */
const showPipelineMvt = async () => {
  if (!viewer) return;
  if (pipelineMvtLayer) {
    pipelineMvtLayer.show = true;
    viewer.scene.requestRender();
    return;
  }
  const url = findPipelineMvtUrl();
  if (!url) {
    console.warn("图层树中未找到燃气管线 MVT 图层");
    return;
  }
  try {
    pipelineMvtLayer = await loadMVTLayer(viewer, url);
  } catch (e) {
    console.error("加载燃气管线 MVT 失败:", e);
  }
};

/** 隐藏燃气管线 MVT 图层 */
const hidePipelineMvt = () => {
  if (pipelineMvtLayer) {
    pipelineMvtLayer.show = false;
    viewer?.scene?.requestRender();
  }
};

// 接口映射：name -> API 函数
const apiMapping: Record<string, () => Promise<any>> = {
  '燃气企业': getGasEnterpriseCoordinateList,
  '液化气企业': getBottleGasEnterpriseCoordinateList,
  '燃气井盖': getManholeCoverCoordinateList,
};

// icon 映射（使用供水模块的图标作为占位）
const iconMapping: Record<string, string> = {
  '燃气企业': 'major_customer',
  '液化气企业': 'major_customer',
  '燃气管线': 'pipeline',
  '燃气井盖': 'fire_hydrant',
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

// 点击地图点位时的回调
const handlePointClick = async (point: any) => {
  console.log('点击了点位:', point);

  // 设置弹窗位置（屏幕中心偏右）
  popupPosition.value = {
    x: window.innerWidth / 2 + 100,
    y: window.innerHeight / 2 - 100,
  };

  // 燃气井盖点击时请求详情
  if (selectedId.value === '燃气井盖') {
    try {
      const detail = await getManholeCoverDetail(point.lsh);
      popupData.value = detail;
      popupVisible.value = true;
    } catch (error) {
      console.error('获取燃气井盖详情失败:', error);
    }
    return;
  }

  // 燃气企业点击时请求详情
  if (selectedId.value === '燃气企业') {
    try {
      const detail = await getGasEnterpriseLedgerDetail(point.lsh);
      popupData.value = detail;
      popupVisible.value = true;
    } catch (error) {
      console.error('获取燃气企业详情失败:', error);
    }
    return;
  }

  // 液化气企业点击时请求详情
  if (selectedId.value === '液化气企业') {
    try {
      const detail = await getBottleGasEnterpriseLedgerDetail(point.lsh);
      popupData.value = detail;
      popupVisible.value = true;
    } catch (error) {
      console.error('获取液化气企业详情失败:', error);
    }
    return;
  }
};

// 点击事件处理
const handleItemClick = async (item: any) => {
  // 选中/取消选中
  if (selectedId.value === item.id) {
    selectedId.value = null;
    clearPoints();
    hidePipelineMvt();
    return;
  }

  selectedId.value = item.id;

  // 隐藏管线 MVT（从管线切到其他项时）
  hidePipelineMvt();

  // 燃气管线：加载 MVT 图层
  if (item.name === '燃气管线') {
    clearPoints();
    await showPipelineMvt();
    return;
  }

  // 其他项目：调用对应接口加载点位
  const apiFn = apiMapping[item.name];
  if (apiFn) {
    try {
      const data = await apiFn();
      if (Array.isArray(data) && data.length > 0) {
        addPoints(data, item.name);
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
  viewer = readyObj.viewer;
  await initMapPoints();
  initData();
  // 确保图层树已加载（用于查找 MVT URL）
  if (!mapStore.layerTreeLoaded) {
    await mapStore.fetchLayerTree();
  }
  // 注册统一点击处理器（MVT + 散点）
  setupUnifiedClickHandler();
});

onBeforeUnmount(() => {
  hidePipelineMvt();
});
</script>

<style lang="scss" scoped>
.gas-overview-module {
  flex: 1;

  .overview-content {
    display: flex;
    flex-direction: column;
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
