<template>
  <div class="data-module monitoring-management">
    <div class="module-header">
      <div class="module-title">监测管理</div>
    </div>
    <div class="module-content">
      <div class="stats-grid">
        <div 
          v-for="item in monitoringStats" 
          :key="item.label"
          class="stat-item"
          :class="item.class"
        >
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>

      <!-- 统计表格 -->
      <div class="stats-table">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          size="small"
          :scroll="{ y: 260 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <span class="name-cell">{{ record.name }}</span>
            </template>
            <template v-else-if="column.key === 'count'">
              <span class="count-cell">{{ record.count }}</span>
            </template>
            <template v-else-if="column.key === 'weather'">
              <span class="weather-cell">{{ record.weather }}</span>
            </template>
            <template v-else-if="column.key === 'water'">
              <span class="water-cell">{{ record.water }}</span>
            </template>
            <template v-else-if="column.key === 'gas'">
              <span class="gas-cell">{{ record.gas }}</span>
            </template>
            <template v-else-if="column.key === 'bridge'">
              <span class="bridge-cell">{{ record.bridge }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 监测统计数据
const monitoringStats = ref([
  { label: '总数', value: '795', class: 'total' },
  { label: '气象', value: '4', class: 'weather' },
  { label: '供水', value: '3737', class: 'water' },
  { label: '燃气', value: '49', class: 'gas' },
  { label: '桥梁', value: '1829', class: 'bridge' },
]);

// 表格列定义
const columns = [
  { title: '乡镇/街道', key: 'name', dataIndex: 'name', width: 200 },
  { title: '数量', key: 'count', dataIndex: 'count', width: 100 },
  { title: '气象', key: 'weather', dataIndex: 'weather', width: 80 },
  { title: '供水', key: 'water', dataIndex: 'water', width: 80 },
  { title: '燃气', key: 'gas', dataIndex: 'gas', width: 80 },
  { title: '桥梁', key: 'bridge', dataIndex: 'bridge', width: 80 },
];

// 表格数据
const tableData = ref([
  { key: 1, name: '富池镇', count: 43, weather: 1, water: 22, gas: 5, bridge: 15 },
  { key: 2, name: '兴国镇', count: 65, weather: 0, water: 35, gas: 12, bridge: 18 },
  { key: 3, name: '龙港镇', count: 52, weather: 1, water: 28, gas: 8, bridge: 15 },
  { key: 4, name: '三溪镇', count: 38, weather: 0, water: 19, gas: 6, bridge: 13 },
  { key: 5, name: '浮屠镇', count: 47, weather: 1, water: 24, gas: 7, bridge: 15 },
  { key: 6, name: '陶港镇', count: 42, weather: 0, water: 21, gas: 8, bridge: 13 },
  { key: 7, name: '排市镇', count: 35, weather: 1, water: 18, gas: 5, bridge: 11 },
]);
</script>

<style lang="scss" scoped>
.monitoring-management {
  .module-content {
    padding: 20px 30px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-radius: 8px;
    background: rgba(22, 119, 255, 0.1);
    border: 1px solid rgba(22, 119, 255, 0.3);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(22, 119, 255, 0.2);
      transform: translateY(-2px);
    }

    &.total {
      background: linear-gradient(135deg, rgba(22, 119, 255, 0.2), rgba(22, 119, 255, 0.1));
      border-color: #1677ff;
    }

    &.weather {
      background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), rgba(82, 196, 26, 0.1));
      border-color: #52c41a;
    }

    &.water {
      background: linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.1));
      border-color: #1890ff;
    }

    &.gas {
      background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
      border-color: #faad14;
    }

    &.bridge {
      background: linear-gradient(135deg, rgba(114, 46, 209, 0.2), rgba(114, 46, 209, 0.1));
      border-color: #722ed1;
    }

    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 8px;
      font-family: 'DIN', Arial, sans-serif;
    }

    .stat-label {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .stats-table {
    :deep(.ant-table) {
      background: transparent;
      color: #ffffff;

      .ant-table-thead > tr > th {
        background: rgba(22, 119, 255, 0.2);
        color: #ffffff;
        font-weight: 600;
        border-bottom: 1px solid rgba(22, 119, 255, 0.3);
        font-size: 16px;
        padding: 12px 8px;
      }

      .ant-table-tbody > tr > td {
        background: transparent;
        border-bottom: 1px solid rgba(22, 119, 255, 0.1);
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
        padding: 10px 8px;
      }

      .ant-table-tbody > tr:hover > td {
        background: rgba(22, 119, 255, 0.1);
      }
    }

    .name-cell {
      color: #ffffff;
      font-weight: 500;
    }

    .count-cell {
      color: #1677ff;
      font-weight: 600;
    }

    .weather-cell,
    .water-cell,
    .gas-cell,
    .bridge-cell {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
</style>
