<template>
  <div class="data-module monitoring-device-module">
    <div class="module-header">
      <div class="module-title">监测设备</div>
    </div>
    <div class="module-content">
      <!-- 顶部统计卡片 -->
      <div class="top-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/bridgeModule/device_online.webp" alt="">
          </div>
          <div class="stat-info">
            <div class="stat-label">在线数</div>
            <div class="stat-value">
              <span class="value-online gradient-text">{{ topStats.online }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/bridgeModule/device_offline.webp" alt="">
          </div>
          <div class="stat-info">
            <div class="stat-label">离线数</div>
            <div class="stat-value">
              <span class="value-offline gradient-text">{{ topStats.offline }}</span>
            </div>
          </div>
        </div>

        <!-- <div class="stat-card">
          <div class="stat-icon">
          </div>
          <div class="stat-info">
            <div class="stat-label">故障数</div>
            <div class="stat-value">
              <span class="value-fault gradient-text">{{ topStats.fault }}</span>
            </div>
          </div>
        </div> -->
      </div>

      <!-- 预警类型统计区域 -->
      <div class="warning-statistics">
        <div class="warning-table">
          <div class="table-header">
            <div class="header-cell">设备类型</div>
            <div class="header-cell">在线</div>
            <div class="header-cell">离线</div>
            <div class="header-cell">故障</div>
          </div>
          <div class="table-body">
            <div class="table-row" v-for="warning in warningStatistics" :key="warning.sblxmc">
              <div class="row-cell">{{ warning.sblxmc }}</div>
              <div class="row-cell">{{ warning.zx }}</div>
              <div class="row-cell">{{ warning.lx }}</div>
              <div class="row-cell">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBridgeEquipmentOnlineCount, getBridgeEquipmentRunStatusList } from "@/services/bridgeService";
import { getEquipmentPageList } from "@/services/gasService";
import { ref, onMounted } from "vue";

// 顶部统计数据
const topStats = ref({
  online: 0,
  offline: 0,
  fault: 0,
});

// 预警统计数据
const warningStatistics = ref<
  Array<{
    sblxmc: string;
    zx: string | number;
    lx: string | number;
  }>
>([]);

// 初始化获取数据
onMounted(async () => {
  await initMonitoringCount();
  await initWarningStatistics();
});

// 获取监测设备统计数据
const initMonitoringCount = async () => {
  try {
    const res = await getBridgeEquipmentOnlineCount();

    // 计算总设备数
    let online = 0;
    let offline = 0;
    let fault = 0;

    // 遍历设备状态数据
    (res as Array<any>).forEach((item) => {
      const count = item.count || 0;
      switch (item.sbyxzt) {
        case "sbyxzt001": // 在线
          online += count;
          break;
        case "sbyxzt002": // 离线
          offline += count;
          break;
        case "sbyxzt003": // 故障
          fault += count;
          break;
      }
    });
    topStats.value.online = online;
    topStats.value.offline = offline;
    topStats.value.fault = fault;
  } catch (error) {
    console.error("获取设备状态数据失败:", error);
  }
};

// 获取预警类型统计数据
const initWarningStatistics = async () => {
  try {
    const res = await getBridgeEquipmentRunStatusList();

    warningStatistics.value = res;
  } catch (error) {
    console.error("获取预警统计数据失败:", error);
  }
};
</script>

<style lang="scss" scoped>
.monitoring-device-module {

  // 顶部统计卡片
  .top-stats {
    display: flex;
    width: 100%;
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      flex: 1;
      border-radius: 8px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 10px;

      .stat-icon {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .stat-info {
        text-align: center;
        margin-left: 10px;

        .stat-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 500;
          font-size: 30px;
          color: #EFFAFF;
          line-height: 44px;
          text-align: left;
          font-style: normal;
        }

        .stat-value {
          display: flex;
          align-items: baseline;
          gap: 8px;
          // justify-content: center;

          >span {
            font-family: YouSheBiaoTiHei;
            font-size: 30px;
            color: #FFFFFF;
            line-height: 39px;
            text-align: right;
            font-style: normal;
          }

          .value-online {
            background: linear-gradient(90deg, #ffffff 0%, #1677ff 100%);
          }

          .value-offline {
            background: linear-gradient(0deg, #F75E04 0%, #FEAC04 100%);
          }

        }
      }
    }
  }

  // 预警类型统计区域
  .warning-statistics {
    width: 100%;

    .warning-table {
      background: rgba(2, 48, 71, 0.5);
      border: 1px solid rgba(79, 184, 211, 0.3);
      border-radius: 4px;
      overflow: hidden;

      .table-header {
        display: flex;
        background: linear-gradient(90deg, rgba(2, 48, 71, 0.6) 0%, rgba(2, 48, 71, 0.3) 100%);
        border-bottom: 1px solid rgba(79, 184, 211, 0.3);

        .header-cell {
          flex: 1;
          padding: 16px 12px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: bold;
          font-size: 20px;
          color: #e4f3ff;
          line-height: 29px;
          text-align: center;
          font-style: normal;

          &:first-child {
            text-align: left;
            padding-left: 20px;
          }
        }
      }

      .table-body {
        max-height: 260px;
        overflow-y: auto;

        .table-row {
          display: flex;
          border-bottom: 1px solid rgba(79, 184, 211, 0.15);
          transition: background-color 0.3s ease;

          &:hover {
            background: rgba(79, 184, 211, 0.1);
          }

          &:last-child {
            border-bottom: none;
          }

          .row-cell {
            flex: 1;
            padding: 14px 12px;
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: 400;
            font-size: 20px;
            color: #effaff;
            line-height: 29px;
            text-align: center;
            font-style: normal;

            &:first-child {
              text-align: left;
              padding-left: 20px;
              color: #fff;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>
