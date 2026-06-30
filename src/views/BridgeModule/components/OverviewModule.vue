<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">总览</div>
    </div>
    <div class="module-content">
      <!-- 上方：统计卡片区域 -->
      <div class="stats-cards-container">
        <div class="stats-card" v-for="item in statsCards" :key="item.id"
          :class="{ active: selectedCardType === item.id }" @click="handleCardClick(item)">
          <div class="card-info" :class="item.type">
            <div class="card-value gradient-text">{{ item.value }}<span class="unit">座</span></div>
            <span class="card-label" :class="{ 'gradient-text': item.type == 'total' }">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 下方：圆环图表区域 -->
      <div class="charts-container">
        <div class="chart-item" v-for="chart in chartConfigs" :key="chart.id">
          <div class="chart-wrapper">
            <div :id="`chart-${chart.id}`" class="chart-echart"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 散点弹窗 -->
  <PointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :position="{ x: 0, y: 0 }"
    :title="popupTitle"
    :display-fields="popupDisplayFields"
    @close="closePopup"
  >
    <template #actions>
      <button class="action-btn btn-monitoring" @click="handleShowEquipment">监测设备</button>
      <button class="action-btn btn-camera" @click="handleShowCamera">监控设备</button>
      <button v-if="bridge3d.hasModel.value" class="action-btn btn-model" @click="bridge3d.handleShowModel">查看模型</button>
    </template>
  </PointPopup>

  <!-- 三维：视频播放 -->
  <VideoPopup v-model:visible="bridge3d.videoPlayer.visible.value" :video-url="bridge3d.videoPlayer.videoUrl.value" :camera-name="bridge3d.videoPlayer.cameraName.value" />

  <!-- 三维：监测设备详情 -->
  <EquipmentPointPopup :visible="bridge3d.equipPopupVisible.value" :equipment-data="bridge3d.equipPopupData.value" :sblx-dict-keys="['jcsblx_ql']" @close="bridge3d.equipPopupVisible.value = false" />

  <!-- 2D散点：监测设备详情 -->
  <EquipmentPointPopup :visible="equipPopupVisible" :equipment-data="equipPopupData" :sblx-dict-keys="['jcsblx_ql']" @close="equipPopupVisible = false" />

  <!-- 2D散点：监控视频播放 -->
  <VideoPopup v-model:visible="videoPlayer.visible.value" :video-url="videoPlayer.videoUrl.value" :camera-name="videoPlayer.cameraName.value" />

  <!-- 三维：桥梁模型列表 -->
  <Bridge3DList v-if="bridge3d.is3DMode.value" :active-bridge="bridge3d.activeBridgeQlbh.value" @select="bridge3d.handleBridgeSelect" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, nextTick, watchEffect } from "vue";
import { useVueCesium } from "vue-cesium";
import * as echarts from "echarts";
import { getBridgeCategoryStats, getBridgeDetail, getBridgeTypeCount, getBridgeCoordinateList } from "@/services/bridgeService";
import { getMonitoringPointLatestData } from "@/services/commonService";
import { getSurveillanceVideoPage, getSurveillanceVideoDetail } from "@/services/surveillanceVideoService";
import { useVideoPlayer } from "@/hook/useVideoPlayer";
import { createChartOption, getGradientColor } from "./chartOption";
import { useGasOverviewPoints } from "@/hook/useGasOverviewPoints";
import { useBridge3DModel } from "@/hook/useBridge3DModel";
import { mapToLabelValue } from '@/config/fieldLabelConfig';
import { getCachedDictionary } from '@/services/dictionaryService';
import PointPopup from "@/components/PointPopup.vue";
import VideoPopup from "@/views/BridgeModule/components/map/VideoPopup.vue";
import EquipmentPointPopup from "@/components/EquipmentPointPopup.vue";
import Bridge3DList from "@/views/BridgeModule/components/Bridge3DList.vue";

defineOptions({ name: "OverviewModule" });

// ==================== 散点管理 ====================
const { init: initMapPoints, addPoints, clearPoints, setupClickHandler, dataSource, viewer } = useGasOverviewPoints();
// 叠加层散点（监测设备/监控设备，与桥梁散点互不影响）
const overlay = useGasOverviewPoints();

// ==================== 弹窗状态 ====================
const popupVisible = ref(false);
const popupData = ref<any>(null);
const closePopup = () => { popupVisible.value = false; popupData.value = null; };

// 弹窗标题 & 字段
const popupTitle = computed(() => {
  if (!popupData.value) return '详情'
  const data = popupData.value
  return data.llmc || data.qlmc || data.qlbh || '桥梁详情'
})

// 桥梁字典映射
const bridgeDictCodes = ['qljglb', 'qlyhdj', 'qlhysx', 'qllx', 'ztdj'] as const
const bridgeDictMap = ref<Record<string, { value: string; label: string }[]>>({})

watchEffect(async () => {
  if (!popupVisible.value) return
  const results = await Promise.all(bridgeDictCodes.map((code) => getCachedDictionary(code)))
  const map: Record<string, { value: string; label: string }[]> = {}
  const fieldKeys = ['qljg', 'qlyhdj', 'hysx', 'qllx', 'ztdj']
  bridgeDictCodes.forEach((_, i) => {
    map[fieldKeys[i]] = results[i].map((item: any) => ({ value: item.f_ItemValue, label: item.f_ItemName }))
  })
  bridgeDictMap.value = map
})

const popupDisplayFields = computed(() => {
  if (!popupData.value) return []
  return mapToLabelValue(popupData.value, [], bridgeDictMap.value) as { label: string; value: string | number | null }[]
})

// ==================== 散点模式管理 ====================
type ScatterMode = 'equipment' | 'camera' | null
const scatterMode = ref<ScatterMode>(null)

// 监测设备弹窗
const equipPopupVisible = ref(false)
const equipPopupData = ref<any>(null)

// 视频播放
const videoPlayer = useVideoPlayer()

// 监控图标
const cameraIconUrl = new URL('@/assets/img/points/jk_icon.png', import.meta.url).href

// 监测设备图标（构建时全量导入）
const deviceIconModules = import.meta.glob('@/assets/img/points/监测设备图标/*.png', { eager: true, import: 'default' }) as Record<string, string>
const deviceIconMap: Record<string, string> = {}
for (const [path, url] of Object.entries(deviceIconModules)) {
  const name = path.split('/').pop()?.replace('.png', '') || ''
  deviceIconMap[name] = url
}
const getDeviceIconUrl = (sblx: string): string => deviceIconMap[sblx] || Object.values(deviceIconMap)[0] || ''

// 预加载图标尺寸
const deviceIconSizes: Record<string, { w: number; h: number }> = {}
const loadDeviceIconSizes = async () => {
  const entries = Object.entries(deviceIconMap)
  await Promise.all(entries.map(([name, url]) => new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => { deviceIconSizes[name] = { w: img.width, h: img.height }; resolve() }
    img.onerror = () => { deviceIconSizes[name] = { w: 1, h: 1 }; resolve() }
    img.src = url
  })))
}

// 清理叠加层散点
const clearOverlay = () => {
  overlay.clearPoints()
  equipPopupVisible.value = false
  videoPlayer.close()
  scatterMode.value = null
}

// 监测设备：加载监测设备散点（叠加在桥梁散点上）
const handleShowEquipment = async () => {
  const bridgeName = popupData.value?.llmc
  if (!bridgeName) return
  closePopup()
  clearOverlay()
  scatterMode.value = 'equipment'

  try {
    const rows = await getMonitoringPointLatestData('csaqzx_ql')
    const points = rows
      .filter((r: any) => r.jdxx && r.wdxx)
      .map((r: any) => ({
        lsh: r.lsh || r.sbbh || '',
        jd: r.jdxx,
        wd: r.wdxx,
        name: (r.gldwbh || r.sbmc || '').replace(/^420200420222/, ''),
        raw: r,
      }))
    if (points.length > 0) {
      const Cesium = (window as any).Cesium
      const ds = overlay.dataSource.value
      if (ds) {
        const entities = ds.entities
        entities.suspendEvents()
        for (const p of points) {
          const sblx = p.raw?.sblx || 'jcsblx0101'
          const iconUrl = getDeviceIconUrl(sblx)
          const size = deviceIconSizes[sblx]
          const w = 24
          const h = size ? Math.round(w * (size.h / size.w)) : 24
          entities.add({
            position: Cesium.Cartesian3.fromDegrees(p.jd, p.wd),
            billboard: {
              image: iconUrl,
              width: w, height: h,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
            },
            description: JSON.stringify(p),
          })
        }
        entities.resumeEvents()
      }
      overlay.setupClickHandler((point: any) => {
        const matched = points.find(p => p.lsh === point.lsh)
        equipPopupData.value = matched?.raw || point
        equipPopupVisible.value = true
      }, true)
    }
  } catch (e) {
    console.error('获取监测设备数据失败:', e)
  }
}

// 监控设备：加载监控散点（叠加在桥梁散点上）
const handleShowCamera = async () => {
  const bridgeName = popupData.value?.llmc
  if (!bridgeName) return
  closePopup()
  clearOverlay()
  scatterMode.value = 'camera'

  try {
    const res = await getSurveillanceVideoPage({
      page: '1',
      rows: '1000',
      spszwz: bridgeName,
      sszx: 'csaqzx_ql',
    })
    const cameras = res?.rows || []
    const points = cameras
      .filter((c: any) => c.spdwjd && c.spdwwd)
      .map((c: any) => ({
        lsh: c.lsh,
        jd: c.spdwjd,
        wd: c.spdwwd,
        name: c.spmc || c.spbh || '',
        _sourceType: 'bridge_camera',
      }))
    if (points.length > 0) {
      overlay.addPoints(points, '监控设备', cameraIconUrl, 32)
      overlay.setupClickHandler(handleCameraPointClick)
    }
  } catch (e) {
    console.error('获取监控列表失败:', e)
  }
}

// 点击监控散点 → 获取详情 → 播放视频
const handleCameraPointClick = async (point: any) => {
  try {
    const detail = await getSurveillanceVideoDetail(point.lsh)
    if (detail?.spbh) {
      await videoPlayer.play(detail.spbh, detail.spmc || point.name)
    }
  } catch (e) {
    console.error('获取监控视频失败:', e)
  }
}

// ==================== 卡片/图表状态 ====================
const statsCards = ref<any[]>([]);
const chartConfigs = ref<any[]>([]);
const selectedCardType = ref<string | null>(null);
const selectedChartType = ref<string | null>(null);

// ==================== 散点加载 ====================
const lastLoadedPoints = ref<any[]>([]);

const loadBridgePoints = async (qllx?: string) => {
  try {
    const data = await getBridgeCoordinateList(qllx);
    if (Array.isArray(data) && data.length > 0) {
      const points = data
        .filter((p: any) => p.jd && p.wd)
        .map((p: any) => ({ lsh: p.lsh, jd: p.jd, wd: p.wd, name: p.name || '', _sourceType: 'bridge_overview' }));
      lastLoadedPoints.value = points;
      if (points.length > 0) {
        addPoints(points, '桥梁', new URL('@/assets/img/points/4个专项点位/桥梁.png', import.meta.url).href);
        setupClickHandler(handlePointClick);
      }
    }
  } catch (error) {
    console.error("获取桥梁点位失败:", error);
  }
};

// ==================== 三维模型管理 ====================
const bridge3d = useBridge3DModel({
  viewer, popupData, clearPoints, closePopup, loadBridgePoints,
  onClear: () => { selectedCardType.value = null; selectedChartType.value = null; },
});

// ==================== 点击处理 ====================
const handlePointClick = async (point: any) => {
  try {
    const detail = await getBridgeDetail(point.lsh);
    popupData.value = { ...detail, _name: detail._name || point.name };
    popupVisible.value = true;
  } catch (error) {
    console.error('获取桥梁详情失败:', error);
  }
};

const handleCardClick = async (card: any) => {
  if (selectedCardType.value === card.id) {
    selectedCardType.value = null;
    clearPoints();
    clearOverlay();
    closePopup();
    return;
  }
  selectedCardType.value = card.id;
  selectedChartType.value = null;
  clearOverlay();
  closePopup();
  clearPoints();
  const qllx = card.type === 'total' ? undefined : card.qllx;
  await loadBridgePoints(qllx);
};

// ==================== 数据获取 ====================
const fetchBridgeData = async () => {
  try {
    const data = await getBridgeCategoryStats() as any[];
    processChartData(data);
  } catch (error) {
    console.error("获取桥梁分类统计数据失败:", error);
  }
};

const fetchCardData = async () => {
  try {
    const data = await getBridgeTypeCount() as any[];
    processCardData(data);
  } catch (error) {
    console.error("获取桥梁类型统计失败:", error);
  }
};

const processCardData = (data: any[]) => {
  // 计算总数
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
  // 按指定顺序排列：总数、大桥、小桥、立交桥
  const order = ['qllx002', 'qllx004', 'qllx003'];
  const ordered = order.map(code => data.find(item => item.code === code)).filter(Boolean);
  statsCards.value = [
    { id: 0, value: total, label: '桥梁总数', type: 'total', qllx: '' },
    ...ordered.map((item, index) => ({
      id: index + 1,
      value: item.count || 0,
      label: item.name,
      type: getTypeByCode(item.code),
      qllx: item.code,
    })),
  ];
};

const getTypeByCode = (code: string) => {
  const typeMap: Record<string, string> = {
    "qllx002": "large", "qllx003": "overpass", "qllx004": "default",
  };
  return typeMap[code] || "default";
};

const processChartData = (data: any[]) => {
  const grouped = data.reduce((acc, item) => {
    const existing = acc.find((g) => g.category === item.category);
    if (existing) { existing.items.push(item); } else { acc.push({ category: item.category, items: [item] }); }
    return acc;
  }, []);
  chartConfigs.value = grouped.slice(0, 3).map((group, index) => ({
    id: index,
    title: group.category,
    data: group.items,
    legendData: group.items.map((item: any, dataIndex: number) => ({
      name: item.type, value: item.number, color: getGradientColor(index, dataIndex),
    })),
  }));
};

// ==================== 图表渲染 ====================
const chartInstances: Record<number, echarts.ECharts> = {};

const renderCharts = () => {
  chartConfigs.value.forEach((chart, chartIndex) => {
    const chartDom = document.getElementById(`chart-${chart.id}`);
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    chartInstances[chart.id] = myChart;
    myChart.setOption(createChartOption(chart, chartIndex));
    myChart.on('legendselectchanged', () => {
      myChart.dispatchAction({ type: 'legendAllSelect' });
    });
  });
};

// ==================== 生命周期 ====================
const $vc = useVueCesium();

onMounted(async () => {
  const readyObj = await $vc.creatingPromise;
  await initMapPoints(readyObj.viewer);
  await overlay.init(readyObj.viewer);
  await loadDeviceIconSizes();

  bridge3d.registerCallbacks();

  await fetchCardData();
  await fetchBridgeData();
  await nextTick();
  renderCharts();
});

onBeforeUnmount(() => {
  bridge3d.unregisterCallbacks();
});
</script>

<style lang="scss" scoped>
.overview-module {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.stats-cards-container {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  flex: 0 0 auto;
}

.stats-card {
  flex: 1;
  display: flex;
  gap: 20px;
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

  .card-info {
    width: 153.2px;
    height: 96px;
    background-size: 100% 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .card-value {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-subtitle);
      color: #FFFFFF;
      line-height: 42px;
      text-align: center;
    }

    .unit {
      font-size: var(--font-size-body);
      color: #F5FCFF;
      line-height: 21px;
      margin-left: 6px;
    }

    .card-label {
      position: relative;
      text-align: center;
      top: 20px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 500;
      font-size: var(--font-size-subtitle);
      color: #EFFAFF;
      line-height: 35px;
    }

    &.total {
      width: 191.5px;
      height: 120px;
      background-image: url("@/assets/img/bridgeModule/total_bridges.webp");
      .card-value { font-size: var(--font-size-title); line-height: 52px; background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%); }
      .unit { font-size: var(--font-size-heading); line-height: 26px; }
      .card-label { font-size: var(--font-size-title); font-weight: var(--font-weight-bold); line-height: 42px; background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%); }
    }

    &.large { background-image: url("@/assets/img/bridgeModule/large_bridges.webp"); .card-value { background: linear-gradient(90deg, #FFFFFF 0%, #FEC854 100%); } }
    &.overpass { background-image: url("@/assets/img/bridgeModule/interchanges.webp"); .card-value { background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%); } }
    &.default { background-image: url("@/assets/img/bridgeModule/culverts.webp"); .card-value { background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%); } }
  }
}

.charts-container {
  flex: 1;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: stretch;
}

.chart-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 33.3%;
  .chart-echart { width: 100%; height: 100%; }
}
</style>
