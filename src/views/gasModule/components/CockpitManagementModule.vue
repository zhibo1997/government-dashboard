<template>
  <div class="data-module cockpit-management">
    <div class="module-header">
      <div class="module-title">座舱管理</div>
    </div>
    <div class="module-content">
      <!-- 座舱概览 -->
      <div class="cockpit-overview">
        <div 
          v-for="item in cockpitStats" 
          :key="item.label"
          class="overview-item"
          :class="item.class"
        >
          <div class="overview-icon">
            <component :is="item.icon" />
          </div>
          <div class="overview-info">
            <div class="overview-value">{{ item.value }}</div>
            <div class="overview-label">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <!-- 座舱状态表格 -->
      <div class="cockpit-table">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          size="small"
          :scroll="{ y: 360 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <span class="name-cell">{{ record.name }}</span>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.statusColor">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'online'">
              <span class="online-cell">{{ record.online }}</span>
            </template>
            <template v-else-if="column.key === 'offline'">
              <span class="offline-cell">{{ record.offline }}</span>
            </template>
            <template v-else-if="column.key === 'warning'">
              <span class="warning-cell">{{ record.warning }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleView(record)">
                  查看
                </a-button>
                <a-button type="link" size="small" @click="handleManage(record)">
                  管理
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {createDiscreteApi} from "naive-ui"
const { message } = createDiscreteApi(['message'])
import { 
  DashboardOutlined, 
  CheckCircleOutlined, 
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue';

// 座舱统计
const cockpitStats = ref([
  { 
    label: '总座舱', 
    value: '23', 
    class: 'total',
    icon: DashboardOutlined
  },
  { 
    label: '运行中', 
    value: '18', 
    class: 'running',
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
    value: '2', 
    class: 'offline',
    icon: CloseCircleOutlined
  },
]);

// 表格列定义
const columns = [
  { title: '座舱名称', key: 'name', dataIndex: 'name', width: 180 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 100 },
  { title: '在线', key: 'online', dataIndex: 'online', width: 80 },
  { title: '离线', key: 'offline', dataIndex: 'offline', width: 80 },
  { title: '预警', key: 'warning', dataIndex: 'warning', width: 80 },
  { title: '操作', key: 'action', width: 120 },
];

// 表格数据
const tableData = ref([
  { 
    key: 1, 
    name: '供水监测座舱', 
    status: '运行中', 
    statusColor: 'success',
    online: 45, 
    offline: 3, 
    warning: 2 
  },
  { 
    key: 2, 
    name: '燃气监测座舱', 
    status: '运行中', 
    statusColor: 'success',
    online: 38, 
    offline: 2, 
    warning: 1 
  },
  { 
    key: 3, 
    name: '桥梁监测座舱', 
    status: '预警', 
    statusColor: 'warning',
    online: 52, 
    offline: 5, 
    warning: 3 
  },
  { 
    key: 4, 
    name: '排水监测座舱', 
    status: '运行中', 
    statusColor: 'success',
    online: 42, 
    offline: 4, 
    warning: 0 
  },
  { 
    key: 5, 
    name: '井盖监测座舱', 
    status: '离线', 
    statusColor: 'error',
    online: 0, 
    offline: 35, 
    warning: 0 
  },
  { 
    key: 6, 
    name: '气象监测座舱', 
    status: '运行中', 
    statusColor: 'success',
    online: 12, 
    offline: 1, 
    warning: 0 
  },
  { 
    key: 7, 
    name: '环境监测座舱', 
    status: '运行中', 
    statusColor: 'success',
    online: 28, 
    offline: 2, 
    warning: 1 
  },
]);

// 查看座舱
const handleView = (record) => {
  message.info(`查看座舱: ${record.name}`);
};

// 管理座舱
const handleManage = (record) => {
  message.info(`管理座舱: ${record.name}`);
};
</script>

<style lang="scss" scoped>
.cockpit-management {
  flex: 0.8;

  .module-content {
    padding: 20px 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .cockpit-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }

  .overview-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
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

      .overview-icon {
        color: #1677ff;
      }
    }

    &.running {
      background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), rgba(82, 196, 26, 0.1));
      border-color: #52c41a;

      .overview-icon {
        color: #52c41a;
      }
    }

    &.warning {
      background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
      border-color: #faad14;

      .overview-icon {
        color: #faad14;
      }
    }

    &.offline {
      background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.1));
      border-color: #ff4d4f;

      .overview-icon {
        color: #ff4d4f;
      }
    }

    .overview-icon {
      font-size: 32px;
    }

    .overview-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .overview-value {
        font-size: 28px;
        font-weight: bold;
        color: #ffffff;
        font-family: 'DIN', Arial, sans-serif;
      }

      .overview-label {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .cockpit-table {
    flex: 1;

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

      .ant-btn-link {
        color: #1677ff;
        padding: 0;
        height: auto;
      }
    }

    .name-cell {
      color: #ffffff;
      font-weight: 500;
    }

    .online-cell {
      color: #52c41a;
      font-weight: 600;
    }

    .offline-cell {
      color: #ff4d4f;
      font-weight: 600;
    }

    .warning-cell {
      color: #faad14;
      font-weight: 600;
    }
  }
}
</style>
