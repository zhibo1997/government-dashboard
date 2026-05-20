<template>
  <div class="data-module warning-alarm-module" @click="showMonitorPopup = true">
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
              <div class="status-item" v-for="item in warningStatus" :key="item.label">
                <div class="status-ring">
                  <span class="ring-num gradient-text">{{ item.count }}</span>
                </div>
                <div class="status-label">{{ item.label }}</div>
              </div>
            </div>
            <!-- 等级统计 -->
            <div class="level-stats">
              <div class="level-item" v-for="item in warningLevels" :key="item.label">
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
              <div class="status-item" v-for="item in alarmStatus" :key="item.label">
                <div class="status-ring">
                  <span class="ring-num gradient-text">{{ item.count }}</span>
                </div>
                <div class="status-label">{{ item.label }}</div>
              </div>
            </div>
            <!-- 等级统计 -->
            <div class="level-stats">
              <div class="level-item" v-for="item in alarmLevels" :key="item.label">
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
          <div class="tab-btn" :class="{ active: activeTab === 'warning' }" @click="activeTab = 'warning'">
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
        <CommonTable
          :columns="tableColumns"
          :data="currentTableData"
          row-key="key"
          empty-text="暂无数据"
          :max-height="260"
          grid-template="1.8fr 1fr 1fr 1fr 1fr 1fr 1fr"
        />
      </div>
    </div>

    <!-- 监测弹窗 -->
    <Teleport to="body">
      <div v-if="showMonitorPopup" class="monitor-popup-overlay" @click.self="showMonitorPopup = false">
        <div
          class="monitor-popup"
          :style="{ transform: `scale(${scaleRatio})`, transformOrigin: 'top right',
          right: 960 * scaleRatio + 'px', top: 180 * scaleRatio + 'px' }"
          @click.stop
        >
          <div class="monitor-popup-close" @click="showMonitorPopup = false"></div>
          <img :src="gasMonitorPopupImg" class="monitor-popup-img" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { RANQI_SSZX } from "@/types";
import { ref, computed, onMounted, inject } from "vue";
import { getWarnStatistics } from "@/services/waterSupplyService";
import { getGasWarningTypeList } from "@/services/gasService";
import CommonTable from '@/components/CommonTable.vue';
import gasMonitorPopupImg from '@/assets/img/gas_monitor_popup.png';

// ==================== 数据状态 ====================
const scaleRatio = inject('responsiveScale', ref(1));

// 监测弹窗显示状态
const showMonitorPopup = ref(false);

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
  { label: "一级", count: 0 },
  { label: "二级", count: 0 },
  { label: "三级", count: 0 },
]);

// 报警数据
const alarmTotal = ref(0);
const alarmStatus = ref([
  { label: "已处置", count: 0 },
  { label: "处置中", count: 0 },
  { label: "未处置", count: 0 },
]);
const alarmLevels = ref([
  { label: "一级", count: 0 },
  { label: "二级", count: 0 },
  { label: "三级", count: 0 },
]);

// 预警表格数据
const warningTableData = ref([]);

// 报警表格数据
const alarmTableData = ref([]);

// ==================== 计算属性 ====================
// 当前表格数据
// 表格列配置
const tableColumns = computed(() => [
  { key: 'type', title: '类型', width: '1.8fr' },
  { key: 'level1', title: '一级', width: '1fr' },
  { key: 'level2', title: '二级', width: '1fr' },
  { key: 'level3', title: '三级', width: '1fr' },
  { key: 'handled', title: '已处置', width: '1fr' },
  { key: 'processing', title: '处置中', width: '1fr' },
  { key: 'pending', title: '未处置', width: '1fr' }
]);

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

    // 更新预警数据
    warningTotal.value = data.totalCount || 0;
    warningStatus.value = [
      { label: "已处置", count: data.handledCount || 0 },
      { label: "处置中", count: data.handlingCount || 0 },
      { label: "未处置", count: data.unhandledCount || 0 },
    ];
    warningLevels.value = [
      { label: "一级", count: data.yjyjCount || 0 },
      { label: "二级", count: data.ejyjCount || 0 },
      { label: "三级", count: data.sjyjCount || 0 },
    ];

    // 更新报警数据
    if (data.alarmCount) {
      alarmTotal.value = data.alarmCount.totalCount || 0;
      alarmStatus.value = [
        { label: "已解除", count: data.alarmCount.yjc || 0 },
        { label: "未解除", count: data.alarmCount.wjc || 0 },
      ];
      alarmLevels.value = [
        { label: "一级", count: data.alarmCount.yjyjCount || 0 },
        { label: "二级", count: data.alarmCount.ejyjCount || 0 },
        { label: "三级", count: data.alarmCount.sjyjCount || 0 },
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
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-around;
    gap: 16px;
    padding: 20px 0;
  }

  // 预警/报警总数卡片（统一样式）
  .warning-total-card {
    display: flex;
    gap: 15px;

    // 报警卡片特殊样式
    &.alarm-card {
      .total-ring.alarm {
        background-image: url("@/assets/img/gasModule/alarm_total.webp");

        .ring-value {
          background: linear-gradient(0deg, #ff4d4f 0%, #ff7875 100%);
        }
      }
      .status-stats {
        justify-content: space-around !important;
      }
    }

    // 总数环形
    .total-ring {
      width: 158px;
      height: 291px;
      background-image: url("@/assets/img/gasModule/warning_total.webp");
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      position: relative;
      flex-direction: column;

      .ring-value {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-title);
        color: #ffffff;
        line-height: calc(var(--font-size-subtitle) * 1.294);
        text-align: center;
        font-style: normal;
        background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
        margin-top: 70px;
        margin-bottom: 70px;
      }
    }

    // 总数标签
    .total-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-title);
      color: #d3eaf1;
      line-height: calc(var(--font-size-body) * 1.458);
      text-align: center;
      font-style: normal;
    }

    .right-content {
      flex: 1;
      margin-left: 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 24px;
    }

    // 状态统计
    .status-stats {
      display: flex;
      gap: 15px;
      justify-content: space-between;
      align-items: center;

      .status-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .status-ring {
          width: 88px;
          height: 88px;
          background-image: url("@/assets/img/gasModule/status_ring.webp");
          background-size: 100% 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 17px;

          .ring-num {
            font-family: YouSheBiaoTiHei;
            font-size: var(--font-size-title);
            color: #ffffff;
            line-height: calc(var(--font-size-heading) * 1.292);
            text-align: center;
            font-style: normal;
            background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
          }
        }

        .status-label {
          font-size: var(--font-size-title);
          color: rgba(255, 255, 255, 0.75);
        }
      }
    }

    // 等级统计
    .level-stats {
      display: flex;
      gap: 15px;
      align-items: center;
      justify-content: space-between;

      .level-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        &:nth-child(1) {
          .level-value {
            >span {
              background: linear-gradient(0deg, #ff1d1d 0%, #fd8837 100%);
            }
            background-image: url("@/assets/img/gasModule/level1.webp");
          }
        }

        &:nth-child(2) {
          .level-value {
            >span {
              background: linear-gradient(0deg, #f75e04 0%, #feac04 100%);
            }
            background-image: url("@/assets/img/gasModule/level2.webp");
          }
        }

        &:nth-child(3) {
          .level-value {
            >span {
              background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
            }
            background-image: url("@/assets/img/gasModule/level3.webp");
          }
        }

        .level-value {
          width: 97px;
          height: 41px;
          background-size: 100% 100%;
          text-align: center;
          line-height: 41px;
          margin-bottom: 17px;

          >span {
            font-family: YouSheBiaoTiHei;
            font-size: var(--font-size-title);
            color: #ffffff;
            line-height: calc(var(--font-size-body) * 1.292);
            text-align: center;
            font-style: normal;
          }
        }

        .level-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-title);
          color: #d3eaf1;
          line-height: calc(var(--font-size-mini) * 1.5);
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
    width: 100%;
    border-top: 2px solid rgba(31, 199, 255, 0.24);
    padding-top: 16px;
    margin-top: 16px;
    gap: 24px;
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
        font-size: var(--font-size-title);
        color: #e74040;
        line-height: calc(var(--font-size-heading) * 1.306);
        text-align: left;
        font-style: normal;
        background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);;
      }

      &.active {
        background-image: url("@/assets/img/gasModule/tab_active.webp");

        span {
          background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
        }
      }
    }
  }
}
</style>

<style lang="scss">
// 监测弹窗（Teleport to body）
.monitor-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  pointer-events: auto;
}

.monitor-popup {
  position: absolute;

  .monitor-popup-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 60px;
    height: 60px;
    cursor: pointer;
    z-index: 1;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 36px;
      height: 4px;
      background: rgba(255, 255, 255, 0.7);
    }

    &::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    &::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  }

  .monitor-popup-img {
    width: 500px;
    height: auto;
    display: block;
  }
}
</style>
