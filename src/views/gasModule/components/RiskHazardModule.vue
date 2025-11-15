<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险隐患</div>
    </div>
    <div class="module-content">
      <div class="risk-content">
        <!-- 风险等级统计 -->
        <div class="risk-stats">
          <div 
            class="risk-stat-item" 
            v-for="item in riskStats" 
            :key="item.level"
            :class="`risk-${item.level}`"
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

        <!-- 风险列表 -->
        <div class="risk-list">
          <div class="list-header">
            <span class="header-title">风险清单</span>
          </div>
          <div class="list-content">
            <a-table
              :columns="columns"
              :data-source="riskData"
              :pagination="false"
              size="small"
              :scroll="{ y: 300 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <a-tag :color="record.levelColor">{{ record.level }}</a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" size="small">处理</a-button>
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
  ExclamationCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons-vue';

// 风险等级统计
const riskStats = ref([
  { level: 'high', label: '高风险', count: 8, icon: ExclamationCircleOutlined },
  { level: 'medium', label: '中风险', count: 15, icon: WarningOutlined },
  { level: 'low', label: '低风险', count: 23, icon: InfoCircleOutlined },
]);

// 表格列定义
const columns = [
  { title: '风险点', key: 'location', dataIndex: 'location', width: 180 },
  { title: '风险类型', key: 'type', dataIndex: 'type', width: 120 },
  { title: '等级', key: 'level', dataIndex: 'level', width: 80 },
  { title: '操作', key: 'action', width: 80 },
];

// 风险数据
const riskData = ref([
  { key: 1, location: '兴国镇建设路段', type: '管道老化', level: '高风险', levelColor: 'error' },
  { key: 2, location: '富池镇民主街', type: '压力异常', level: '中风险', levelColor: 'warning' },
  { key: 3, location: '龙港镇工业园', type: '泄漏风险', level: '高风险', levelColor: 'error' },
  { key: 4, location: '三溪镇中心路', type: '阀门老化', level: '中风险', levelColor: 'warning' },
  { key: 5, location: '浮屠镇商业街', type: '设备故障', level: '低风险', levelColor: 'processing' },
  { key: 6, location: '陶港镇居民区', type: '管网腐蚀', level: '中风险', levelColor: 'warning' },
  { key: 7, location: '排市镇学校路', type: '安全隐患', level: '低风险', levelColor: 'processing' },
]);
</script>

<style lang="scss" scoped>
.risk-hazard-module {
  .risk-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
  }

  .risk-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;

    .risk-stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid rgba(22, 119, 255, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.risk-high {
        background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.1));
        border-color: #ff4d4f;

        .stat-icon {
          color: #ff4d4f;
        }
      }

      &.risk-medium {
        background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
        border-color: #faad14;

        .stat-icon {
          color: #faad14;
        }
      }

      &.risk-low {
        background: linear-gradient(135deg, rgba(22, 119, 255, 0.2), rgba(22, 119, 255, 0.1));
        border-color: #1677ff;

        .stat-icon {
          color: #1677ff;
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

  .risk-list {
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
