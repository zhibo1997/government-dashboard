<template>
  <div class="data-module warning-alarm-module">
    <div class="module-header">
      <div class="module-title">预警报警</div>
    </div>
    <div class="module-content">
      <!-- 上方统计卡片区域 -->
      <div class="stats-section">
        <!-- 预警总数 -->
        <div class="warning-total-card">
          <div class="total-ring">
            <div class="ring-value gradient-text">{{ warningTotal }}</div>
            <span class="total-label">预警<br />总数</span>
          </div>
          <div class="right-content">
            <!-- 状态统计 -->
            <div class="status-stats">
              <div
                class="status-item"
                v-for="item in warningStatus"
                :key="item.label"
              >
                <div class="status-ring">
                  <span class="ring-num gradient-text">{{ item.count }}</span>
                </div>
                <div class="status-label">{{ item.label }}</div>
              </div>
            </div>
            <!-- 等级统计 -->
            <div class="level-stats">
              <div
                class="level-item"
                v-for="item in warningLevels"
                :key="item.label"
              >
                <div class="level-value">
                  <span class="gradient-text">{{ item.count }}</span>
                </div>
                <div class="level-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 报警总数 -->
        <div class="alarm-total-card">
          <div class="total-ring alarm">
            <div class="ring-value gradient-text alarm">{{ alarmTotal }}</div>
            <div class="total-label">报警<br />总数</div>
          </div>
          <div class="right-content">
            <!-- 状态统计 -->
            <div class="status-stats">
              <div
                class="status-item"
                v-for="item in alarmStatus"
                :key="item.label"
              >
                <div class="status-ring">
                  <div class="ring-num">{{ item.count }}</div>
                </div>
                <div class="status-label">{{ item.label }}</div>
              </div>
            </div>
            <!-- 等级统计 -->
            <div class="level-stats">
              <div
                class="level-item"
                v-for="item in alarmLevels"
                :key="item.label"
              >
                <div class="level-value">
                  <span class="gradient-text">{{ item.count }}</span>
                </div>
                <div class="level-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下方切换Tab和表格 -->
      <div class="table-section">
        <!-- Tab切换 -->
        <div class="tab-buttons">
          <div
            class="tab-btn"
            :class="{ active: activeTab === 'warning' }"
            @click="activeTab = 'warning'"
          >
            <span class="gradient-text">预警</span>
          </div>
          <div
            class="tab-btn"
            :class="{ active: activeTab === 'alarm' }"
            @click="activeTab = 'alarm'"
          >
            <span class="gradient-text">报警</span>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="data-table">
          <div class="table">
            <!-- 企业列表表头 -->
            <div class="enterprise-header">
              <div
                class="header-col col-name"
                v-for="column in columns"
                :key="column.key"
              >
                {{ column.title }}
              </div>
            </div>

            <!-- 企业列表 -->
            <div class="enterprise-list">
              <div
                class="enterprise-row"
                v-for="enterprise in warningTableData"
                :key="enterprise.id"
              >
                <div class="row-col col-name">{{ enterprise.name }}</div>
                <div class="row-col col-station">{{ enterprise.stations }}</div>
                <div class="row-col col-cylinder">
                  {{ enterprise.cylinders }}
                </div>
                <div class="row-col col-vehicle">{{ enterprise.vehicles }}</div>
                <div class="row-col col-user">{{ enterprise.users }}</div>
                <div class="row-col col-monitor">{{ enterprise.monitors }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 当前激活的Tab
const activeTab = ref("warning");

// 预警总数
const warningTotal = ref(31);

// 预警状态统计
const warningStatus = ref([
  { label: "已处置", count: 9 },
  { label: "处置中", count: 18 },
  { label: "未处置", count: 17 },
]);

// 预警等级统计
const warningLevels = ref([
  { label: "一级预警", count: 143 },
  { label: "二级预警", count: 109 },
  { label: "三级预警", count: 210 },
]);

// 报警总数
const alarmTotal = ref(40);

// 报警状态统计
const alarmStatus = ref([
  { label: "已处置", count: 9 },
  { label: "处置中", count: 18 },
  { label: "未处置", count: 17 },
]);

// 报警等级统计
const alarmLevels = ref([
  { label: "一级报警", count: 143 },
  { label: "二级报警", count: 109 },
  { label: "三级报警", count: 210 },
]);

// 表格列定义
const columns = [
  { title: "类型", key: "type", dataIndex: "type", width: 180 },
  {
    title: "一级",
    key: "level1",
    dataIndex: "level1",
    width: 100,
    align: "center",
  },
  {
    title: "二级",
    key: "level2",
    dataIndex: "level2",
    width: 100,
    align: "center",
  },
  {
    title: "三级",
    key: "level3",
    dataIndex: "level3",
    width: 100,
    align: "center",
  },
  {
    title: "已处置",
    key: "handled",
    dataIndex: "handled",
    width: 100,
    align: "center",
  },
  {
    title: "处置中",
    key: "handling",
    dataIndex: "handling",
    width: 100,
    align: "center",
  },
  {
    title: "未处置",
    key: "unhandled",
    dataIndex: "unhandled",
    width: 100,
    align: "center",
  },
];

// 预警表格数据
const warningTableData = ref([
  {
    key: 1,
    type: "阳管网燃气泄漏预警",
    level1: 4,
    level2: 67,
    level3: 34,
    handled: 56,
    handling: 23,
    unhandled: 12,
  },
  {
    key: 2,
    type: "沼气聚集爆炸预警",
    level1: 6,
    level2: 443,
    level3: 56,
    handled: 78,
    handling: 57,
    unhandled: 34,
  },
  {
    key: 3,
    type: "场站泄漏预警",
    level1: 8,
    level2: 788,
    level3: 7,
    handled: 56,
    handling: 90,
    unhandled: 56,
  },
  {
    key: 4,
    type: "管网腐蚀预警",
    level1: 9,
    level2: 34,
    level3: 88,
    handled: 99,
    handling: 34,
    unhandled: 70,
  },
]);

// 报警表格数据
const alarmTableData = ref([
  {
    key: 1,
    type: "阳管网燃气泄漏报警",
    level1: 5,
    level2: 78,
    level3: 45,
    handled: 67,
    handling: 34,
    unhandled: 23,
  },
  {
    key: 2,
    type: "沼气聚集爆炸报警",
    level1: 7,
    level2: 523,
    level3: 67,
    handled: 89,
    handling: 68,
    unhandled: 45,
  },
  {
    key: 3,
    type: "场站泄漏报警",
    level1: 10,
    level2: 898,
    level3: 9,
    handled: 67,
    handling: 100,
    unhandled: 67,
  },
  {
    key: 4,
    type: "管网腐蚀报警",
    level1: 11,
    level2: 45,
    level3: 98,
    handled: 110,
    handling: 45,
    unhandled: 80,
  },
]);
</script>

<style lang="scss" scoped>
.warning-alarm-module {
  flex: 1.3;
  background-image: url("@/assets/img/gasModule/warning_alarm_bg.webp");
  .module-content {
    padding: 20px 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  // 上方统计卡片区域
  .stats-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  // 预警/报警总数卡片
  .warning-total-card,
  .alarm-total-card {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-rows: auto auto;
    gap: 15px 20px;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(22, 119, 255, 0.4);
      box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2);
    }

    // 总数环形
    .total-ring {
      width: 105px;
      height: 194px;
      background-image: url("@/assets/img/gasModule/warning_total.webp");
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      position: relative;
      flex-direction: column;

      .ring-value {
        font-family: YouSheBiaoTiHei;
        font-size: 34px;
        color: #ffffff;
        line-height: 44px;
        text-align: center;
        font-style: normal;
        background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
        margin-top: 40px;
        margin-bottom: 30px;
      }

      &.alarm {
        background-image: url("@/assets/img/gasModule/alarm_total.webp");

        &::before {
          border-color: rgba(255, 77, 79, 0.2);
        }

        .ring-value {
          background: linear-gradient(0deg, #ff4d4f 0%, #ff7875 100%);
        }
      }
    }

    // 总数标签
    .total-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 24px;
      color: #d3eaf1;
      line-height: 35px;
      letter-spacing: 1px;
      text-align: center;
      font-style: normal;
    }

    // 状态统计
    .status-stats {
      display: flex;
      gap: 15px;

      .status-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;

        .status-ring {
          width: 58.55px;
          height: 58.55px;
          background-image: url("@/assets/img/gasModule/status_ring.webp");
          display: flex;
          align-items: center;
          justify-content: center;

          .ring-num {
            font-family: YouSheBiaoTiHei;
            font-size: 24px;
            color: #ffffff;
            line-height: 31px;
            text-align: center;
            font-style: normal;
            background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
          }
        }

        .status-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.75);
        }
      }
    }

    // 等级统计
    .level-stats {
      display: flex;
      gap: 20px;

      .level-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        &:nth-child(1) {
          .level-value {
            > span {
              background: linear-gradient(0deg, #ff1d1d 0%, #fd8837 100%);
            }
            background-image: url("@/assets/img/gasModule/level1.webp");
          }
        }
        &:nth-child(2) {
          .level-value {
            > span {
              background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
            }
            background-image: url("@/assets/img/gasModule/level2.webp");
          }
        }
        &:nth-child(3) {
          .level-value {
            > span {
              background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
            }
            background-image: url("@/assets/img/gasModule/level3.webp");
          }
        }

        .level-value {
          width: 64.56px;
          height: 27.29px;
          > span {
            font-family: YouSheBiaoTiHei;
            font-size: 24px;
            color: #ffffff;
            line-height: 31px;
            text-align: center;
            font-style: normal;
          }
        }

        .level-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 16px;
          color: #d3eaf1;
          line-height: 24px;
          letter-spacing: 1px;
          text-align: center;
          font-style: normal;
        }
      }
    }
  }

  // 下方表格区域
  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  // Tab按钮
  .tab-buttons {
    display: flex;
    gap: 20px;

    .tab-btn {
      width: 160.24px;
      height: 60px;
      padding: 10px 40px;
      background-image: url("@/assets/img/gasModule/tab.webp");
      span {
        font-family: YouSheBiaoTiHei;
        font-size: 36px;
        color: #e74040;
        line-height: 47px;
        text-align: left;
        font-style: normal;
        background: linear-gradient(90deg, #ffffff 18%, #10adc0 100%);
      }

      &.active {
        background-image: url("@/assets/img/gasModule/tab_active.webp");
        span {
          background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
        }
      }
    }
  }

  // 数据表格
  .data-table {
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
    }

    .type-cell {
      color: #ffffff;
      font-weight: 500;
    }

    .number-cell {
      color: rgba(255, 255, 255, 0.85);
      font-family: "DIN", Arial, sans-serif;
    }
  }
}
</style>
