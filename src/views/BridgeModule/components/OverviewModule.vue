<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">总览</div>
    </div>
    <div class="module-content">
      <!-- 上方：统计卡片区域 -->
      <div class="stats-cards-container">
        <div class="stats-card" v-for="(item, idx) in statsCards" :key="item.id"
          :class="{ active: selectedCardType === item.id }" @click="handleCardClick(item)">
          <div class="card-info" :class="item.type">
            <div class="card-value gradient-text">{{ item.value }}<span class="unit">座</span>
            </div>
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
          <!-- 暂时注释 DOM 图例，使用 ECharts 内置图例 -->
          <!-- <div class="chart-legend" v-if="chart.legendData && chart.legendData.length > 0">
            <div class="legend-group" v-for="(group, groupIndex) in groupLegends(chart.legendData)" :key="groupIndex">
              <div class="legend-item" v-for="item in group" :key="item.name">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-text">{{ item.name }}</span>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>

  <!-- 点位详情弹窗 -->
  <GasPointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :position="{ x: 0, y: 0 }"
    point-type="桥梁"
    :has-model="hasModel"
    @close="closePopup"
    @show-model="handleShowModel"
  />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick, inject, computed } from "vue";
import { useVueCesium } from "vue-cesium";
import * as echarts from "echarts";
import { getBridgeCategoryStats, getBridgePageList, getBridgeDetail } from "@/services/bridgeService";
import { createChartOption, getGradientColor } from "./chartOption";
import { getWaterOverview } from "@/services/waterSupplyService";
import { getCachedDictionary } from "@/services/dictionaryService";
import { useGasOverviewPoints } from "@/hook/useGasOverviewPoints";
import { useMapHooks } from "@/hook/useMapHooks";
import { useMapStore } from "@/stores/mapStore";
import { BRIDGE_LAYER_CONFIG } from "@/config/layerConfig";
import GasPointPopup from "@/views/GasModule/components/GasPointPopup.vue";

defineOptions({
  name: "OverviewModule",
});

// ==================== 数据状态 ====================
// 统计卡片数据（从接口获取）
const statsCards = ref<any[]>([]);

// 图表配置
const chartConfigs = ref<any[]>([]);

// 字典映射
const qlTypeMap = ref<any>({});

// 地图点位管理
const { init: initMapPoints, addPoints, clearPoints, setupClickHandler, dataSource, viewer } = useGasOverviewPoints();

// 选中状态
const selectedCardType = ref<string | null>(null);
const selectedChartType = ref<string | null>(null);

// 弹窗状态
const popupVisible = ref(false);
const popupData = ref<any>(null);

// 当前桥梁是否有 3D 模型
const hasModel = computed(() => {
  if (!popupData.value?.qlbh) return false;
  return BRIDGE_LAYER_CONFIG.some((c) => c.qlbh === popupData.value.qlbh);
});

// 3D 模型相关
const cesiumUtils = useMapHooks();
const mapStore = useMapStore();
const mapRef = inject<any>('MAP_INSTANCE');

// ==================== 点击处理 ====================

// 卡片类型到筛选参数的映射
const cardTypeFilterMap: Record<string, string> = {
  "jcssdstj0601": "",  // 桥梁总数 - 不筛选
  "jcssdstj0602": "qllx002",  // 大桥及特大桥
  "jcssdstj0603": "qllx004",  // 立交桥
  "jcssdstj0604": "qllx005",  // 涵洞
};

// 关闭弹窗
const closePopup = () => {
  popupVisible.value = false;
  popupData.value = null;
};

// 查看模型 - 加载桥梁 3D 模型
const handleShowModel = async () => {
  if (!popupData.value) return;
  const qlbh = popupData.value.qlbh;
  if (!qlbh) {
    console.warn('⚠️ 桥梁数据缺少 qlbh 字段');
    return;
  }

  // 匹配桥梁模型配置
  const cfg = BRIDGE_LAYER_CONFIG.find((c) => c.qlbh === qlbh);
  if (!cfg) {
    console.warn(`⚠️ 未找到 qlbh=${qlbh} 的桥梁模型配置`);
    return;
  }

  // 从图层树获取 URL
  const layer = mapStore.findLayerById(cfg.id);
  if (!layer?.url) {
    console.warn(`⚠️ 未找到桥梁图层 URL, id=${cfg.id}`);
    return;
  }

  // 转换协议
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  let url = layer.url;
  if (isProduction && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  // 加载 3D 模型
  try {
    await cesiumUtils.load3DTiles(viewer.value, url, { flyTo: true });
    console.log(`✅ 桥梁模型加载成功: ${layer.name}`);

    // 应用光照设置（抄自 bridge.html）
    const Cesium = (window as any).Cesium;
    if (Cesium && viewer.value) {
      viewer.value.shadows = true;
      viewer.value.scene.sun.show = true;
      viewer.value.scene.sun.glowFactor = 0.0;
      viewer.value.scene.globe.enableLighting = true;
      viewer.value.scene.globe.baseColor = Cesium.Color.fromCssColorString('#8899aa');
      viewer.value.shadowMap.size = 2048;
      viewer.value.shadowMap.softShadows = true;
      viewer.value.shadowMap.darkness = 0.6;
      viewer.value.scene.globe.depthTestAgainstTerrain = true;
    }
  } catch (error) {
    console.error('❌ 桥梁模型加载失败:', error);
  }

  // 清除散点和弹窗
  clearPoints();
  closePopup();

  // 展开地图（隐藏侧边栏）
  mapRef?.value?.toggleMapExpand?.();
};

// 点击地图点位回调
const handlePointClick = async (point: any) => {
  try {
    const detail = await getBridgeDetail(point.lsh);
    // 合并列表的 name 字段到详情数据
    popupData.value = { ...detail, _name: detail._name || point.name };
    popupVisible.value = true;
  } catch (error) {
    console.error('获取桥梁详情失败:', error);
  }
};

// 请求桥梁列表并展示点位
const loadBridgePoints = async (filter?: string) => {
  try {
    const params: any = {
      page: '1',
      rows: '50',
    };
    if (filter) {
      params.Qllx = filter;
    }
    console.log('🔍 请求桥梁列表参数:', params);
    const res = await getBridgePageList(params);
    console.log('📦 桥梁列表返回:', res);
    const data = res?.rows || res || [];
    console.log('📊 数据条数:', data.length);
    if (Array.isArray(data) && data.length > 0) {
      const points = data
        .filter((p: any) => p.qjdxx && p.qwdxx)
        .map((p: any) => ({
          lsh: p.lsh,
          jd: p.qjdxx,
          wd: p.qwdxx,
          name: p.llmc || p.qlbh || '',
        }));
      console.log('📍 有效点位:', points.length, points);
      if (points.length > 0) {
        addPoints(points, '桥梁', new URL('@/assets/img/points/4个专项点位/桥梁.png', import.meta.url).href);
        setupClickHandler(handlePointClick);
        console.log('✅ addPoints 已调用, setupClickHandler 已注册');
      }
    }
  } catch (error) {
    console.error("获取桥梁列表失败:", error);
  }
};

// 点击卡片
const handleCardClick = async (card: any) => {
  if (selectedCardType.value === card.id) {
    selectedCardType.value = null;
    clearPoints();
    closePopup();
    return;
  }
  selectedCardType.value = card.id;
  selectedChartType.value = null;
  closePopup();
  clearPoints();

  // 获取对应类型的桥梁列表
  const jcsslx = `jcssdstj060${card.id}`;
  const filter = cardTypeFilterMap[jcsslx] || '';
  await loadBridgePoints(filter);
};

// ==================== 数据获取与处理 ====================
/**
 * 获取桥梁分类统计数据
 */
const fetchBridgeData = async () => {
  try {
    const data = await getBridgeCategoryStats() as any[];
    processChartData(data);
  } catch (error) {
    console.error("获取桥梁分类统计数据失败:", error);
  }
};

// 获取卡片数据
const fetchCardData = async () => {
  try {
    // 获取字典数据
    const dictionaries = await getCachedDictionary("jcssdstjlx_ql");
    qlTypeMap.value = dictionaries.reduce((acc, cur) => {
      acc[cur.f_ItemValue] = cur.f_ItemName;
      return acc;
    }, {});
    
    // 获取统计数据
    const data = await getWaterOverview({ Sszx: "csaqzx_ql" }) as any[];
    processCardData(data);
  } catch (error) {
    console.error("获取卡片数据失败:", error);
  }
};

/**
 * 处理卡片数据
 */
const processCardData = (data: any[]) => {
  // 将 jcssdstj0601 排到第一个
  data = [...data].sort((a, b) => {
    if (a.jcsslx === 'jcssdstj0601') return -1;
    if (b.jcsslx === 'jcssdstj0601') return 1;
    return 0;
  });
  // 映射数据到卡片
  statsCards.value = data.map((item, index) => ({
    id: index + 1,
    value: item.jcsstjsl || 0, // 使用 jcsstjsl 作为数量
    label: qlTypeMap.value[item.jcsslx] || item.jcsslx, // 使用字典映射
    type: getTypeByCode(item.jcsslx) // 根据代码确定类型
  }));
};

/**
 * 根据代码确定卡片类型
 */
const getTypeByCode = (code: string) => {
  const typeMap: Record<string, string> = {
    "jcssdstj0601": "total",    // 桥梁总数
    "jcssdstj0602": "large",    // 大桥及特大桥
    "jcssdstj0603": "overpass", // 立交桥
    "jcssdstj0604": "culvert"   // 涵洞
  };
  return typeMap[code] || "default";
};

/**
 * 处理图表数据
 */
const processChartData = (data: any[]) => {
  // 按分类分组数据
  const grouped = data.reduce((acc, item) => {
    const existing = acc.find((g) => g.category === item.category);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({
        category: item.category,
        items: [item],
      });
    }
    return acc;
  }, []);

  // 生成图表配置（只取前三个分类）
  chartConfigs.value = grouped.slice(0, 3).map((group, index) => ({
    id: index,
    title: group.category,
    data: group.items,
    legendData: group.items.map((item, dataIndex) => ({
      name: item.type,
      value: item.number,
      color: getGradientColor(index, dataIndex),
    })),
  }));
};

/**
 * 按组分解图例（每行显示2个）
 */
const groupLegends = (legends: any[]) => {
  const groups = [];
  for (let i = 0; i < legends.length; i += 2) {
    groups.push(legends.slice(i, i + 2));
  }
  return groups;
};

// ==================== 图表配置 ====================
/**
 * 生成圆环图 ECharts 配置项
 * 已移至 chartOption.ts 中的 createChartOption 函数
 */

// ==================== 图表渲染 ====================

// 图表实例缓存
const chartInstances: Record<number, echarts.ECharts> = {};

// 图例名称到筛选参数的映射
const legendFilterMap: Record<string, string> = {
  // 桥梁结构
  '梁式桥': 'qljglb001',
  '拱式桥': 'qljglb002',
  '悬索桥': 'qljglb003',
  '斜拉桥': 'qljglb004',
  '刚构桥': 'qljglb005',
  '组合体系桥': 'qljglb006',
  // 养护等级
  'I 等养护': 'qlyhdj001',
  'II 等养护': 'qlyhdj002',
  'III 等养护': 'qlyhdj003',
  'IV 等养护': 'qlyhdj004',
  'V 等养护': 'qlyhdj005',
  'I 级': 'qlyhdj006',
  'II 级': 'qlyhdj007',
  'III 级': 'qlyhdj008',
};

/**
 * 渲染圆环图表
 */
const renderCharts = () => {
  chartConfigs.value.forEach((chart, chartIndex) => {
    const chartDom = document.getElementById(`chart-${chart.id}`);
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    chartInstances[chart.id] = myChart;
    const option = createChartOption(chart, chartIndex);
    myChart.setOption(option);

    // 监听图例点击事件
    myChart.on('legendselectchanged', async (params: any) => {
      console.log('🖱️ 图例点击:', params.name);
      // 禁用图例的默认切换行为，保持所有项显示
      myChart.dispatchAction({ type: 'legendAllSelect' });
      const filter = legendFilterMap[params.name];
      if (filter) {
        clearPoints();
        closePopup();
        selectedCardType.value = null;
        await loadBridgePoints(filter);
      }
    });
  });
};

// ==================== 生命周期 ====================
const $vc = useVueCesium();

onMounted(async () => {
  const readyObj = await $vc.creatingPromise;
  await initMapPoints(readyObj.viewer);
  console.log('📍 initMapPoints 完成, dataSource:', !!dataSource.value, 'viewer:', !!viewer.value);

  // 获取卡片数据
  await fetchCardData();
  // 获取桥梁分类统计数据
  await fetchBridgeData();
  // 渲染图表
  await nextTick();
  renderCharts();
});
</script>

<style lang="scss" scoped>
.overview-module {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// ==================== 统计卡片 ====================
.stats-cards-container {
  display: flex;
  gap: 30px;
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
      font-style: normal;

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
      text-align: center;
      font-style: normal;
    }

    &.total {
      width: 191.5px;
      height: 120px;
      background-image: url("@/assets/img/bridgeModule/total_bridges.webp");

      .card-value {
        font-size: var(--font-size-title);
        line-height: 52px;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
      }

      .unit {
        font-size: var(--font-size-heading);
        line-height: 26px;
      }
      .card-label {
        font-size: var(--font-size-title);
        font-weight: var(--font-weight-bold);
        line-height: 42px;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
      }
    }


    &.large {
      background-image: url("@/assets/img/bridgeModule/large_bridges.webp");

      .card-value {
        background: linear-gradient(90deg, #FFFFFF 0%, #FEC854 100%);
      }
    }

    &.overpass {
      background-image: url("@/assets/img/bridgeModule/interchanges.webp");

      .card-value {
        background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%);
      }
    }

    &.culvert {
      background-image: url("@/assets/img/bridgeModule/culverts.webp");

      .card-value {
        background: linear-gradient(90deg, #FFFFFF 0%, #1475D1 100%);
      }
    }
  }
}

// ==================== 圆环图表 ====================
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
  .chart-echart {
    width: 100%;
    height: 100%;
  }
}

// 暂时注释的 DOM 图例样式
// .chart-legend {
//   display: flex;
//   flex-direction: column;
//   gap: 8px;
//   padding: 10px 0;
// }

// .legend-group {
//   display: flex;
//   gap: 20px;
//   justify-content: flex-start;
// }

// .legend-item {
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   font-size: var(--font-size-mini);
//   color: #a0bfc9;

//   .legend-color {
//     width: 8px;
//     height: 8px;
//     border-radius: 2px;
//     flex-shrink: 0;
//   }

//   .legend-text {
//     white-space: nowrap;
//   }
// }
</style>
