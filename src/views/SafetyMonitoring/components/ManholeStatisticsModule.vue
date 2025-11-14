<template>
  <div class="data-module manhole-statistics">
    <div class="module-header">
      <div class="module-title">井盖统计</div>
    </div>
    <div class="module-content">
      <!-- 顶部统计卡片 -->
      <div class="stats-cards">
        <div 
          v-for="item in statsCards" 
          :key="item.label"
          class="stat-card"
          :class="item.class"
        >
          <div class="card-icon">
            <component :is="item.icon" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ item.value }}</div>
            <div class="card-label">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <!-- 井盖统计表格 -->
      <div class="manhole-table">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          size="small"
          :scroll="{ y: 180 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <span class="type-cell">{{ record.type }}</span>
            </template>
            <template v-else-if="column.key === 'count'">
              <span class="count-cell">{{ record.count }}</span>
            </template>
            <template v-else-if="column.key === 'normal'">
              <span class="normal-cell">{{ record.normal }}</span>
            </template>
            <template v-else-if="column.key === 'warning'">
              <span class="warning-cell">{{ record.warning }}</span>
            </template>
            <template v-else-if="column.key === 'offline'">
              <span class="offline-cell">{{ record.offline }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons-vue';

// 统计卡片数据
const statsCards = ref([
  { 
    label: '正常', 
    value: '7', 
    class: 'normal',
    icon: CheckCircleOutlined
  },
  { 
    label: '预警', 
    value: '3', 
    class: 'warning',
    icon: WarningOutlined
  },
  { 
    label: '离线', 
    value: '7523', 
    class: 'offline',
    icon: CloseCircleOutlined
  },
]);

// 表格列定义
const columns = [
  { title: '统计类型', key: 'type', dataIndex: 'type', width: 200 },
  { title: '数量', key: 'count', dataIndex: 'count', width: 100 },
  { title: '正常', key: 'normal', dataIndex: 'normal', width: 100 },
  { title: '预警', key: 'warning', dataIndex: 'warning', width: 100 },
  { title: '离线', key: 'offline', dataIndex: 'offline', width: 100 },
];

// 表格数据
const tableData = ref([
  { key: 1, type: '智慧井盖', count: 7533, normal: 7, warning: 3, offline: 7523 },
  { key: 2, type: '智慧阀门', count: 82, normal: 52, warning: 12, offline: 18 },
  { key: 3, type: '流量监测', count: 156, normal: 78, warning: 25, offline: 53 },
  { key: 4, type: '压力监测', count: 89, normal: 45, warning: 15, offline: 29 },
]);
</script>

<style lang="scss" scoped>
.manhole-statistics {
  .module-content {
    padding: 20px 30px;
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    border-radius: 8px;
    background: rgba(22, 119, 255, 0.1);
    border: 1px solid rgba(22, 119, 255, 0.3);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(22, 119, 255, 0.2);
      transform: translateY(-2px);
    }

    &.normal {
      background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), rgba(82, 196, 26, 0.1));
      border-color: #52c41a;

      .card-icon {
        color: #52c41a;
      }
    }

    &.warning {
      background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
      border-color: #faad14;

      .card-icon {
        color: #faad14;
      }
    }

    &.offline {
      background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.1));
      border-color: #ff4d4f;

      .card-icon {
        color: #ff4d4f;
      }
    }

    .card-icon {
      font-size: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-info {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .card-value {
        font-size: 32px;
        font-weight: bold;
        color: #ffffff;
        font-family: 'DIN', Arial, sans-serif;
      }

      .card-label {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .manhole-table {
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

    .type-cell {
      color: #ffffff;
      font-weight: 500;
    }

    .count-cell {
      color: #1677ff;
      font-weight: 600;
    }

    .normal-cell {
      color: #52c41a;
      font-weight: 500;
    }

    .warning-cell {
      color: #faad14;
      font-weight: 500;
    }

    .offline-cell {
      color: #ff4d4f;
      font-weight: 500;
    }
  }
}
</style>
