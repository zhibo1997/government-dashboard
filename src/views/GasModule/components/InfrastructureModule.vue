<template>
  <div class="data-module infrastructure-module">
    <div class="module-header">
      <div class="module-title">基础设施</div>
    </div>
    <div class="module-content">
      <div class="base-info">
        <!-- 气体类型切换 -->
        <div class="gas-type-tabs">
          <div class="tab-item" :class="{ active: activeGasType === 'natural' }" @click="activeGasType = 'natural'">
            <span class="gradient-text">天然气</span>
          </div>
          <div class="tab-item" :class="{ active: activeGasType === 'liquefied' }" @click="activeGasType = 'liquefied'">
            <span class="gradient-text">液化气</span>
          </div>
        </div>

        <!-- 统计数据卡片 -->
        <div class="statistics-cards">
          <div class="stat-card" v-for="stat in currentStatistics" :key="stat.key">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">
              <span class="number gradient-text">{{ stat.value }}</span>
              <span class="unit">{{ stat.unit }}</span>
            </div>
          </div>
        </div>
      </div>
      <CommonTable
        :columns="tableColumns"
        :data="currentTable.data"
        row-key="id"
        empty-text="暂无数据"
      >
        <!-- 自定义企业名称列，添加title提示 -->
        <template #qymc="{ value }">
          <span class="enterprise-name" :title="value">{{ value }}</span>
        </template>
        
        <!-- 自定义数值列格式化 -->
        <template #yyyjsl="{ value }">
          {{ formatNumber(value) }}
        </template>
        
        <template #yyczsl="{ value }">
          {{ formatNumber(value) }}
        </template>
        
        <template #yygxcd="{ value }">
          {{ formatDistance(value) }}
        </template>
        
        <template #yhqpsl="{ value }">
          {{ formatNumber(value) }}
        </template>
        
        <template #khzs="{ value }">
          {{ formatNumber(value) }}
        </template>
        
        <template #ysclsl="{ value }">
          {{ formatNumber(value) }}
        </template>
      </CommonTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  getNaturalGasCountList,
  getLiquefiedGasCountList,
  getGasEnterpriseLedgerList,
  getBottleGasEnterpriseLedgerList,
} from "@/services/gasService";
import CommonTable from '@/components/CommonTable.vue';

// 当前选中的气体类型
const activeGasType = ref('natural'); // 默认天然气

// 天然气统计数据
const naturalGasStats = ref([]);

// 液化气统计数据
const liquefiedGasStats = ref([]);

// 天然气列表配置
const naturalGasTableConfig = ref({
  columns: [
    { key: 'qymc', label: '企业名称' },
    { key: 'yyyjsl', label: '窨井数量' },
    { key: 'yyczsl', label: '厂站数量' },
    { key: 'yygxcd', label: '管线长度(公里)' },
  ],
  data: []
});
// 液化气列表配置
const liquefiedGasTableConfig = ref({
  columns: [
    { key: 'qymc', label: '企业名称' },
    { key: 'yhqpsl', label: '液化气瓶' },
    { key: 'khzs', label: '客户' },
    { key: 'ysclsl', label: '运输车辆' },
  ],
  data: []
});

// 数据加载状态，避免重复请求
const loadedData = ref({
  naturalGasStats: false,
  liquefiedGasStats: false,
  naturalGasEnterprises: false,
  liquefiedGasEnterprises: false
});

// 当前显示的统计数据
const currentStatistics = computed(() => {
  return activeGasType.value === 'natural' ? naturalGasStats.value : liquefiedGasStats.value;
});
// 表格列配置
const tableColumns = computed(() => {
  const baseColumns = [
    { key: 'qymc', title: '企业名称', width: '2fr' }
  ];
  
  if (activeGasType.value === 'natural') {
    return [
      ...baseColumns,
      { key: 'yyyjsl', title: '窨井数量', width: '1fr' },
      { key: 'yyczsl', title: '厂站数量', width: '1fr' },
      { key: 'yygxcd', title: '管线长度(km)', width: '1fr' }
    ];
  } else {
    return [
      ...baseColumns,
      { key: 'yhqpsl', title: '液化气瓶', width: '1fr' },
      { key: 'khzs', title: '客户', width: '1fr' },
      { key: 'ysclsl', title: '运输车辆', width: '1fr' }
    ];
  }
});

// 当前显示的企业列表
const currentTable = computed(() => {
  return activeGasType.value === 'natural' ? naturalGasTableConfig.value : liquefiedGasTableConfig.value;
});

// 获取天然气基础设施数量统计
const fetchNaturalGasStats = async () => {
  if (loadedData.value.naturalGasStats) return; // 已加载则跳过
  try {
    const data = await getNaturalGasCountList();
    naturalGasStats.value = data.map(item => ({
      key: item.name,
      label: item.name,
      value: item.count,
      unit: getUnitByName(item.name)
    }));
    loadedData.value.naturalGasStats = true;
  } catch (error) {
    console.error('获取天然气统计数据失败:', error);
  }
};

// 获取天然气企业列表
const fetchNaturalGasEnterprises = async () => {
  if (loadedData.value.naturalGasEnterprises) return; // 已加载则跳过
  try {
    const data = await getGasEnterpriseLedgerList();
    naturalGasTableConfig.value.data = data;
    loadedData.value.naturalGasEnterprises = true;
  } catch (error) {
    console.error('获取天然气企业列表失败:', error);
  }
};

// 获取液化气企业列表
const fetchLiquefiedGasEnterprises = async () => {
  if (loadedData.value.liquefiedGasEnterprises) return; // 已加载则跳过
  try {
    const data = await getBottleGasEnterpriseLedgerList();
    liquefiedGasTableConfig.value.data = data;
    loadedData.value.liquefiedGasEnterprises = true;
  } catch (error) {
    console.error('获取液化气企业列表失败:', error);
  }
};

// 获取液化气基础设施数量统计
const fetchLiquefiedGasStats = async () => {
  if (loadedData.value.liquefiedGasStats) return; // 已加载则跳过
  try {
    const data = await getLiquefiedGasCountList();
    liquefiedGasStats.value = data.map(item => ({
      key: item.name,
      label: item.name,
      value: item.count,
      unit: getUnitByName(item.name)
    }));
    loadedData.value.liquefiedGasStats = true;
  } catch (error) {
    console.error('获取液化气统计数据失败:', error);
  }
};

// 根据名称获取单位
const getUnitByName = (name) => {
  const unitMap = {
    '企业': '家',
    '供应站': '座',
    '管网': '公里',
    '井盖': '个',
    '用户': '户',
    '监测点': '个'
  };
  return unitMap[name] || '个';
};

// 数值格式化
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  return isNaN(num) ? String(value) : num.toString();
};

// 距离格式化
const formatDistance = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(2);
};

// 监听气体类型切换，按需加载数据
watch(activeGasType, async (newType) => {
  if (newType === 'natural') {
    // 切换到天然气，确保数据已加载
    await fetchNaturalGasStats();
    await fetchNaturalGasEnterprises();
  } else {
    // 切换到液化气，确保数据已加载
    await fetchLiquefiedGasStats();
    await fetchLiquefiedGasEnterprises();
  }
});

// 初始化数据 - 只加载天然气数据
onMounted(async () => {
  await fetchNaturalGasStats();
  await fetchNaturalGasEnterprises();
});
</script>

<style lang="scss" scoped>
.infrastructure-module {


  .base-info {
    display: flex;
  }

  // 气体类型切换标签
  .gas-type-tabs {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .tab-item {
      width: 160px;
      height: 60px;
      background-image: url('@/assets/img/gasModule/tab.webp');
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-medium);
      color: #9ec3e8;
      cursor: pointer;
      transition: all 0.3s ease;

      .gradient-text {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-4xl);
        line-height: calc(var(--font-size-4xl) * 1.306);
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);;
      }

      &.active {
        background-image: url('@/assets/img/gasModule/tab_active.webp');

        .gradient-text {
          background: linear-gradient(0deg, #3FFEFD 0%, #FFF407 100%);
        }
      }
    }
  }

  // 统计数据卡片
  .statistics-cards {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
    flex-direction: row;

    .stat-card {
      flex: 1;
      background: linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 100, 200, 0.05) 100%);
      border: 1px solid rgba(22, 119, 255, 0.25);
      border-radius: 6px;
      // padding: 15px 12px;
      text-align: center;
      width: 95px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-label {
        text-align: center;
        line-height: calc(var(--font-size-xl) * 3);
        width: 100%;
        height: 60px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-2xl);
        color: #E4F3FF;
        font-style: normal;
        background: linear-gradient(90deg, rgba(30, 94, 88, 0.5) 0%, rgba(10, 14, 15, 0.5) 100%);
      }

      .stat-value {
        display: flex;
        align-items: baseline;
        justify-content: center;
        flex-direction: column;
        gap: 4px;

        .number {
          font-family: YouSheBiaoTiHei;
          font-size: var(--font-size-3xl);
          color: #FFFFFF;
          line-height: calc(var(--font-size-xl) * 1.292);
          text-align: center;
          font-style: normal;
          background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
        }

        .unit {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-size: var(--font-size-lg);
          color: #9ec3e8;
        }
      }
    }
  }

  // 自定义表格样式
  .enterprise-name {
    color: #10ADC0;
    font-weight: 500;
  }
}
</style>
