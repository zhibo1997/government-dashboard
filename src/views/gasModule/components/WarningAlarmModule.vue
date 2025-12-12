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
        <div class="warning-total-card alarm-card">
          <div class="total-ring alarm">
            <div class="ring-value gradient-text">{{ alarmTotal }}</div>
            <span class="total-label">报警<br />总数</span>
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
                  <span class="ring-num gradient-text">{{ item.count }}</span>
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
          <!-- <div
            class="tab-btn"
            :class="{ active: activeTab === 'alarm' }"
            @click="activeTab = 'alarm'"
          >
            <span class="gradient-text">报警</span>
          </div> -->
        </div>

        <!-- 数据表格 -->
        <div class="custom-table">
          <!-- 表头 -->
          <div class="table-header">
            <div class="th th-type">类型</div>
            <div class="th">一级</div>
            <div class="th">二级</div>
            <div class="th">三级</div>
            <div class="th">已处置</div>
            <div class="th">处置中</div>
            <div class="th">未处置</div>
          </div>

          <!-- 表体 -->
          <div class="table-body">
            <div
              class="table-row"
              v-for="item in currentTableData"
              :key="item.key"
            >
              <div class="td td-type">{{ item.type }}</div>
              <div class="td">{{ item.level1 }}</div>
              <div class="td">{{ item.level2 }}</div>
              <div class="td">{{ item.level3 }}</div>
              <div class="td">{{ item.handled }}</div>
              <div class="td">{{ item.handling }}</div>
              <div class="td">{{ item.unhandled }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RANQI_SSZX } from "@/types";
import { ref, computed, onMounted } from "vue";
import { getWarnStatistics } from "@/services/waterSupplyService";
import { getGasWarningTypeList } from "@/services/gasService";

// ==================== 数据状态 ====================
// 当前激活的Tab
const activeTab = ref("warning");

// 预警数据
const warningTotal = ref(0);
const warningStatus = ref([
  { label: "已处置", count: 0 },
  { label: "处置中", count: 0 },
  { label: "未处置", count: 0 },
]);
const warningLevels = ref([
  { label: "一级预警", count: 0 },
  { label: "二级预警", count: 0 },
  { label: "三级预警", count: 0 },
]);

// 报警数据
const alarmTotal = ref(0);
const alarmStatus = ref([
  { label: "已处置", count: 0 },
  { label: "处置中", count: 0 },
  { label: "未处置", count: 0 },
]);
const alarmLevels = ref([
  { label: "一级报警", count: 0 },
  { label: "二级报警", count: 0 },
  { label: "三级报警", count: 0 },
]);

// 预警表格数据
const warningTableData = ref([]);

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

// ==================== 计算属性 ====================
// 当前表格数据
const currentTableData = computed(() => {
  return activeTab.value === "warning"
    ? warningTableData.value
    : alarmTableData.value;
});

// ==================== 数据获取 ====================
/**
 * 获取预警和报警统计数据
 * 数据结构:
 * {
 *   totalCount: 预警总数,
 *   handlingCount: 处置中,
 *   handledCount: 已处置,
 *   unhandledCount: 未处置,
 *   yjyjCount: 一级预警,
 *   ejyjCount: 二级预警,
 *   sjyjCount: 三级预警,
 *   alarmCount: {
 *     totalCount: 报警总数,
 *     yjc: 已解除,
 *     wjc: 未解除,
 *     yjyjCount: 一级报警,
 *     ejyjCount: 二级报警,
 *     sjyjCount: 三级报警
 *   }
 * }
 */
const fetchWarningAndAlarmData = async () => {
  try {
    const data: any = await getWarnStatistics(RANQI_SSZX);
    console.log("🚀 ~ fetchWarningAndAlarmData ~ data:", data)
    
    // 更新预警数据
    warningTotal.value = data.totalCount || 0;
    warningStatus.value = [
      { label: "已处置", count: data.handledCount || 0 },
      { label: "处置中", count: data.handlingCount || 0 },
      { label: "未处置", count: data.unhandledCount || 0 },
    ];
    warningLevels.value = [
      { label: "一级预警", count: data.yjyjCount || 0 },
      { label: "二级预警", count: data.ejyjCount || 0 },
      { label: "三级预警", count: data.sjyjCount || 0 },
    ];
    
    // 更新报警数据
    if (data.alarmCount) {
      alarmTotal.value = data.alarmCount.totalCount || 0;
      alarmStatus.value = [
        { label: "已解除", count: data.alarmCount.yjc || 0 },
        { label: "未解除", count: data.alarmCount.wjc || 0 },
      ];
      alarmLevels.value = [
        { label: "一级报警", count: data.alarmCount.yjyjCount || 0 },
        { label: "二级报警", count: data.alarmCount.ejyjCount || 0 },
        { label: "三级报警", count: data.alarmCount.sjyjCount || 0 },
      ];
    }
    
    // 获取预警列表数据
    await fetchWarningListData();
  } catch (error) {
    console.error("获取预警报警数据失败:", error);
  }
};

/**
 * 获取预警列表数据
 * 接口返回数据结构:
 * [
 *   {
 *     "yjlx": "管网燃气泄漏预警",
 *     "yj": "0",
 *     "ej": "0",
 *     "sj": "0",
 *     "ycz": "0",
 *     "czz": "0",
 *     "wcz": "0"
 *   }
 * ]
 */
const fetchWarningListData = async () => {
  try {
    const data: any = await getGasWarningTypeList();
    console.log("🚀 ~ fetchWarningListData ~ data:", data);
    
    // 转换数据格式以匹配表格需求
    if (Array.isArray(data)) {
      warningTableData.value = data.map((item, index) => ({
        key: index + 1,
        type: item.yjlx || "未知类型",
        level1: parseInt(item.yj) || 0,
        level2: parseInt(item.ej) || 0,
        level3: parseInt(item.sj) || 0,
        handled: parseInt(item.ycz) || 0,
        handling: parseInt(item.czz) || 0,
        unhandled: parseInt(item.wcz) || 0,
      }));
    }
  } catch (error) {
    console.error("获取预警列表数据失败:", error);
  }
};

// ==================== 生命周期 ====================
onMounted(() => {
  fetchWarningAndAlarmData();
});

</script>

<style lang="scss" scoped>
.warning-alarm-module {
  flex: 1.3;
  background-image: url("@/assets/img/gasModule/warning_alarm_bg.webp");


  // 上方统计卡片区域
  .stats-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  // 预警/报警总数卡片（统一样式）
  .warning-total-card {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-rows: auto auto;
    gap: 15px 20px;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(22, 119, 255, 0.4);
      box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2);
    }

    // 报警卡片特殊样式
    &.alarm-card {
      .total-ring.alarm {
        background-image: url("@/assets/img/gasModule/alarm_total.webp");

        .ring-value {
          background: linear-gradient(0deg, #ff4d4f 0%, #ff7875 100%);
        }
      }
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
    }

    // 总数标签
    .total-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 24px;
      color: #d3eaf1;
      line-height: 35px;
      text-align: center;
      font-style: normal;
    }
    .right-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    // 状态统计
    .status-stats {
      display: flex;
      gap: 15px;
      justify-content: space-between;

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
          margin-bottom: 11px;

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
      gap: 10px;
      align-items: center;
      justify-content: space-between;

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
          text-align: center;
          line-height: 27.29px;
          margin-bottom: 11px;
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
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
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

  // 自定义表格
  .custom-table {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-top: 24px;
  }

  // 表头
  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
    height: 50px;
    background: linear-gradient(
      90deg,
      rgba(22, 119, 255, 0.15) 0%,
      rgba(22, 119, 255, 0.08) 100%
    );
    border: 1px solid rgba(22, 119, 255, 0.25);
    border-radius: 4px 4px 0 0;

    .th {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 20px;
      color: #e4f3ff;
      line-height: 29px;
      text-align: left;
      font-style: normal;
      padding: 0 10px;

      &.th-type {
        justify-content: flex-start;
        padding-left: 20px;
        width: 220px;
      }
    }
  }

  // 表体
  .table-body {
    border: 1px solid rgba(22, 119, 255, 0.15);
    border-top: none;
    border-radius: 0 0 4px 4px;
    height: 232px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(22, 119, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(22, 119, 255, 0.5);
      }
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
      min-height: 52px;
      background: linear-gradient(
        90deg,
        rgba(0, 150, 255, 0.04) 0%,
        rgba(0, 100, 200, 0.02) 100%
      );
      border-bottom: 1px solid rgba(22, 119, 255, 0.1);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(
          90deg,
          rgba(0, 150, 255, 0.1) 0%,
          rgba(0, 100, 200, 0.05) 100%
        );
      }

      &:last-child {
        border-bottom: none;
      }

      .td {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 20px;
        color: #e4f3ff;
        padding: 8px 10px;

        &.td-type {
          justify-content: flex-start;
          padding-left: 20px;
          color: #ffffff;
        width: 220px;
        }

        &.td-level {
          color: #faad14;
          font-weight: 500;
        }

        &.td-status {
          color: #10adc0;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
