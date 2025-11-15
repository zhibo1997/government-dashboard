<template>
  <div class="data-module warning-alarm-module">
    <div class="module-header">
      <div class="module-title">预警报警</div>
    </div>
    <div class="module-content">
      <div class="warning-content">
        <!-- 预警统计 -->
        <div class="warning-stats">
          <div 
            class="warning-stat-card" 
            v-for="item in warningStats" 
            :key="item.type"
            :class="`warning-${item.type}`"
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

        <!-- 预警列表 -->
        <div class="warning-list">
          <div class="list-header">
            <span class="header-title">最新预警</span>
            <a-radio-group v-model:value="timeRange" button-style="solid" size="small">
              <a-radio-button value="today">今日</a-radio-button>
              <a-radio-button value="week">本周</a-radio-button>
              <a-radio-button value="month">本月</a-radio-button>
            </a-radio-group>
          </div>
          <div class="list-content">
            <div 
              v-for="item in warningList" 
              :key="item.id"
              class="warning-item"
              :class="`level-${item.levelClass}`"
            >
              <div class="item-header">
                <a-tag :color="item.tagColor">{{ item.level }}</a-tag>
                <span class="item-time">{{ item.time }}</span>
              </div>
              <div class="item-content">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-location">
                  <EnvironmentOutlined />
                  <span>{{ item.location }}</span>
                </div>
              </div>
              <div class="item-footer">
                <span class="item-type">{{ item.type }}</span>
                <a-button type="link" size="small">处理</a-button>
              </div>
            </div>
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
  BellOutlined,
  EnvironmentOutlined 
} from '@ant-design/icons-vue';

const timeRange = ref('today');

// 预警统计
const warningStats = ref([
  { type: 'critical', label: '严重', count: 12, icon: ExclamationCircleOutlined },
  { type: 'warning', label: '一般', count: 25, icon: WarningOutlined },
  { type: 'info', label: '提示', count: 48, icon: BellOutlined },
]);

// 预警列表
const warningList = ref([
  {
    id: 1,
    level: '严重',
    levelClass: 'critical',
    tagColor: 'error',
    title: '燃气管道压力异常',
    location: '兴国镇建设路段',
    type: '压力监测',
    time: '10分钟前',
  },
  {
    id: 2,
    level: '严重',
    levelClass: 'critical',
    tagColor: 'error',
    title: '燃气泄漏检测报警',
    location: '富池镇民主街',
    type: '泄漏检测',
    time: '25分钟前',
  },
  {
    id: 3,
    level: '一般',
    levelClass: 'warning',
    tagColor: 'warning',
    title: '流量数据异常',
    location: '龙港镇工业园',
    type: '流量监测',
    time: '1小时前',
  },
  {
    id: 4,
    level: '一般',
    levelClass: 'warning',
    tagColor: 'warning',
    title: '阀门状态异常',
    location: '三溪镇中心路',
    type: '阀门监控',
    time: '2小时前',
  },
  {
    id: 5,
    level: '提示',
    levelClass: 'info',
    tagColor: 'processing',
    title: '设备离线提醒',
    location: '浮屠镇商业街',
    type: '设备监控',
    time: '3小时前',
  },
]);
</script>

<style lang="scss" scoped>
.warning-alarm-module {
  .warning-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
  }

  .warning-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;

    .warning-stat-card {
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

      &.warning-critical {
        background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.1));
        border-color: #ff4d4f;

        .stat-icon {
          color: #ff4d4f;
        }
      }

      &.warning-warning {
        background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
        border-color: #faad14;

        .stat-icon {
          color: #faad14;
        }
      }

      &.warning-info {
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

  .warning-list {
    flex: 1;
    display: flex;
    flex-direction: column;

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
      }

      :deep(.ant-radio-group) {
        .ant-radio-button-wrapper {
          background: rgba(22, 119, 255, 0.1);
          border-color: rgba(22, 119, 255, 0.3);
          color: rgba(255, 255, 255, 0.85);

          &:hover {
            color: #ffffff;
            border-color: #1677ff;
          }

          &.ant-radio-button-wrapper-checked {
            background: #1677ff;
            border-color: #1677ff;
            color: #ffffff;
          }
        }
      }
    }

    .list-content {
      flex: 1;
      overflow-y: auto;
      padding: 15px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(22, 119, 255, 0.4);
        border-radius: 3px;

        &:hover {
          background: rgba(22, 119, 255, 0.6);
        }
      }
    }

    .warning-item {
      padding: 15px;
      border-radius: 8px;
      background: rgba(22, 119, 255, 0.05);
      border-left: 3px solid #1677ff;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(22, 119, 255, 0.1);
        transform: translateX(5px);
      }

      &.level-critical {
        border-left-color: #ff4d4f;
      }

      &.level-warning {
        border-left-color: #faad14;
      }

      &.level-info {
        border-left-color: #1677ff;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .item-time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
        }
      }

      .item-content {
        margin-bottom: 10px;

        .item-title {
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .item-location {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.75);

          .anticon {
            font-size: 14px;
          }
        }
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-type {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.65);
        }

        :deep(.ant-btn-link) {
          color: #1677ff;
          padding: 0;
        }
      }
    }
  }
}
</style>
