<template>
  <div class="data-module emergency-resource-module">
    <div class="module-header">
      <div class="module-title">应急资源</div>
    </div>
    <div class="module-content">
      <div class="emergency-content">
        <!-- 资源统计 -->
        <div class="resource-stats">
          <div 
            class="resource-stat-card" 
            v-for="item in resourceStats" 
            :key="item.type"
            :class="`resource-${item.type}`"
          >
            <div class="stat-icon">
              <component :is="item.icon" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.count }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <!-- 资源列表 -->
        <div class="resource-list">
          <div class="list-header">
            <span class="header-title">应急资源清单</span>
          </div>
          <div class="list-content">
            <a-table
              :columns="columns"
              :data-source="resourceData"
              :pagination="false"
              size="small"
              :scroll="{ y: 280 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.statusColor">{{ record.status }}</a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" size="small">调度</a-button>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  TeamOutlined, 
  CarOutlined, 
  ToolOutlined,
  MedicineBoxOutlined 
} from '@ant-design/icons-vue';

// 资源统计
const resourceStats = ref([
  { type: 'personnel', label: '应急人员', count: 156, icon: TeamOutlined },
  { type: 'vehicle', label: '应急车辆', count: 28, icon: CarOutlined },
  { type: 'equipment', label: '应急装备', count: 342, icon: ToolOutlined },
  { type: 'material', label: '应急物资', count: 1250, icon: MedicineBoxOutlined },
]);

// 表格列定义
const columns = [
  { title: '资源名称', key: 'name', dataIndex: 'name', width: 150 },
  { title: '类型', key: 'type', dataIndex: 'type', width: 100 },
  { title: '数量', key: 'quantity', dataIndex: 'quantity', width: 80 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 80 },
  { title: '操作', key: 'action', width: 80 },
];

// 资源数据
const resourceData = ref([
  { key: 1, name: '抢险队伍', type: '人员', quantity: '45人', status: '待命', statusColor: 'success' },
  { key: 2, name: '抢险车辆', type: '车辆', quantity: '8辆', status: '待命', statusColor: 'success' },
  { key: 3, name: '检测仪器', type: '装备', quantity: '32套', status: '可用', statusColor: 'processing' },
  { key: 4, name: '维修工具', type: '装备', quantity: '156件', status: '可用', statusColor: 'processing' },
  { key: 5, name: '防护用品', type: '物资', quantity: '520套', status: '充足', statusColor: 'success' },
  { key: 6, name: '应急照明', type: '装备', quantity: '68套', status: '可用', statusColor: 'processing' },
  { key: 7, name: '通讯设备', type: '装备', quantity: '45套', status: '待命', statusColor: 'success' },
  { key: 8, name: '专家团队', type: '人员', quantity: '12人', status: '待命', statusColor: 'success' },
]);
</script>

<style lang="scss" scoped>
.emergency-resource-module {
  .emergency-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
  }

  .resource-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    .resource-stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid rgba(22, 119, 255, 0.3);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(22, 119, 255, 0.2);
        transform: translateY(-2px);
      }

      &.resource-personnel {
        background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), rgba(82, 196, 26, 0.1));
        border-color: #52c41a;

        .stat-icon {
          color: #52c41a;
        }
      }

      &.resource-vehicle {
        background: linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.1));
        border-color: #1890ff;

        .stat-icon {
          color: #1890ff;
        }
      }

      &.resource-equipment {
        background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
        border-color: #faad14;

        .stat-icon {
          color: #faad14;
        }
      }

      &.resource-material {
        background: linear-gradient(135deg, rgba(114, 46, 209, 0.2), rgba(114, 46, 209, 0.1));
        border-color: #722ed1;

        .stat-icon {
          color: #722ed1;
        }
      }

      .stat-icon {
        font-size: 32px;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #ffffff;
          font-family: 'DIN', Arial, sans-serif;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }
  }

  .resource-list {
    flex: 1;
    display: flex;
    flex-direction: column;

    .list-header {
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
      }
    }

    .list-content {
      flex: 1;
      margin-top: 15px;

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
        }
      }
    }
  }
}
</style>
