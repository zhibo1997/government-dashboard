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

      <!-- 隐藏表格区域，后期可能需要展示 -->
      <!--
      <div class="table-section">
        <div class="tab-buttons">
          <div
            class="tab-btn"
            :class="{ active: activeTab === 'warning' }"
            @click="activeTab = 'warning'"
          >
            <span class="gradient-text">预警</span>
          </div>
        </div>

        <CommonTable
          :columns="tableColumns"
          :data="currentTableData"
          row-key="key"
          empty-text="暂无数据"
          :max-height="260"
          grid-template="1.8fr 1fr 1fr 1fr 1fr 1fr 1fr"
        />
      </div>
      -->

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
          <img :src="bridgeMonitorPopupImg" class="monitor-popup-img" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from "vue";
import { getWarnStatistics } from "@/services/waterSupplyService";
// import { getBridgeWarningTypeList } from "@/services/bridgeService";
import CommonTable from '@/components/CommonTable.vue';
import bridgeMonitorPopupImg from '@/assets/img/bridge_monitor_popup.jpg';

const scaleRatio = inject('responsiveScale', ref(1));

// ==================== 数据状态 ====================
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

// 预警表格数据（隐藏）
/*
const warningTableData = ref([]);
*/

// 报警表格数据（隐藏）
/*
const alarmTableData = ref([]);
*/

// 表格列配置（隐藏，恢复表格时取消注释）
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
  return [];
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
    const data: any = await getWarnStatistics('csaqzx_ql');
    console.log("🚀 ~ fetchWarningAndAlarmData ~ data:", data)
    
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

    // 获取预警列表数据（隐藏）
    // await fetchWarningListData();
  } catch (error) {
    console.error("获取预警报警数据失败:", error);
  }
};

/**
 * 获取预警列表数据（隐藏）
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
/*
const fetchWarningListData = async () => {
  try {
    const data: any = await getBridgeWarningTypeList();
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
*/

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
    gap: 16px;
    padding: 20px 0;
  }

  // 预警/报警总数卡片
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
    }

    // 总数环形
    .total-ring {
      width: 105px;
      height: 194px;
      background-image: url("@/assets/img/gasModule/warning_total.webp");
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-direction: column;

      .ring-value {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-4xl);
        color: #ffffff;
        line-height: calc(var(--font-size-4xl) * 1.294);
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
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-3xl);
      color: #d3eaf1;
      line-height: calc(var(--font-size-xl) * 1.458);
      text-align: center;
      font-style: normal;
    }

    .right-content {
      flex: 1;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    // 状态统计
    .status-stats {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      align-items: center;

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
            font-size: var(--font-size-xl);
            color: #ffffff;
            line-height: calc(var(--font-size-xl) * 1.292);
            text-align: center;
            font-style: normal;
            background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
          }
        }

        .status-label {
          font-size: var(--font-size-xl);
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
          width: 64.56px;
          height: 27.29px;
          text-align: center;
          line-height: 27.29px;
          margin-bottom: 11px;

          >span {
            font-family: YouSheBiaoTiHei;
            font-size: var(--font-size-2xl);
            color: #ffffff;
            line-height: calc(var(--font-size-xl) * 1.292);
            text-align: center;
            font-style: normal;
          }
        }

        .level-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-xl);
          color: #d3eaf1;
          line-height: calc(var(--font-size-sm) * 1.5);
          text-align: center;
          font-style: normal;
        }
      }
    }
  }

  /* 隐藏的表格区域样式 - 后期可能需要 */
  /*
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
        font-size: var(--font-size-3xl);
        color: #e74040;
        line-height: calc(var(--font-size-3xl) * 1.306);
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
  */

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
        font-size: var(--font-size-3xl);
        color: #e74040;
        line-height: calc(var(--font-size-3xl) * 1.306);
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

  .high-risk {
    color: #FF4757;
    font-weight: bold;
  }
  
  .medium-risk {
    color: #FFA502;
    font-weight: bold;
  }
  
  .low-risk {
    color: #2ED573;
    font-weight: bold;
  }
  
  .status-completed {
    color: #2ED573;
  }
  
  .status-processing {
    color: #FFA502;
  }
  
  .status-pending {
    color: #FF4757;
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
    width: 680px;
    height: auto;
    display: block;
  }
}
</style>
