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
            <img src="@/assets/img/device_count.webp" alt="监测设备" />
          </div>
          <div class="stat-info">
            <div class="stat-label">监测设备</div>
            <div class="stat-value">
              <span class="value-total gradient-text">{{ topStats.online }}</span>
              <span class="value-separator">/</span>
              <span class="value-offline gradient-text">{{ topStats.offline }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 在线率概览 -->
      <div class="overview-section">
        <div class="overview-item" v-for="item in monitoringRate" :key="item.type">
          <div class="rate-badge" :class="`rate-${item.type}`">
            <div class="rate-value gradient-text">{{ item.value }}</div>
            <div class="rate-name">{{ item.name }}</div>
          </div>
        </div>
      </div>

      <!-- 预警类型统计区域 -->
      <div class="warning-statistics">
        <CommonTable
          :columns="tableColumns"
          :data="tableData"
          row-key="sblxmc"
          empty-text="暂无设备数据"
          :max-height="640"
          grid-template="2fr 1fr 1fr 1fr"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBridgeEquipmentRunStatusList } from "@/services/bridgeService";
import { getSpecialRateList } from "@/services/commonService";
import { ref, computed, onMounted } from "vue";
import CommonTable from '@/components/CommonTable.vue';

// 在线率概览数据
const monitoringRate = ref<any[]>([]);

// 顶部统计数据
const topStats = ref({
  online: 0,
  offline: 0,
  fault: 0,
});

// 从 getSpecialRateList 获取设备数量和在线率
const fetchSpecialRate = async () => {
  try {
    const data = await getSpecialRateList();
    const item = Array.isArray(data) ? data.find((d: any) => d.sszx === "csaqzx_ql") : null;
    if (item) {
      topStats.value.online = item.onlineCount || 0;
      topStats.value.offline = item.offlineCount || 0;
      topStats.value.fault = item.faultCount || 0;
      monitoringRate.value = [
        { name: "在线率", value: item.onlineRate || "0%", type: "online" },
        { name: "离线率", value: item.offlineRate || "0%", type: "offline" },
        { name: "故障率", value: item.faultRate || "0%", type: "fault" },
      ];
    }
  } catch (error) {
    console.error("获取专项设备数据失败:", error);
  }
};

// 预警统计数据
const warningStatistics = ref<
  Array<{
    sblxmc: string;
    zx: string | number;
    lx: string | number;
  }>
>([]);

// 表格列配置
const tableColumns = [
  { key: 'sblxmc', title: '设备类型', width: '2fr' },
  { key: 'zx', title: '在线', width: '1fr' },
  { key: 'lx', title: '离线', width: '1fr' },
  { key: 'fault', title: '故障', width: '1fr' }
];

// 处理表格数据，添加故障字段
const tableData = computed(() => {
  return warningStatistics.value.map(item => ({
    ...item,
    fault: 0 // 默认故障数为0
  }));
});

// 初始化获取数据
onMounted(async () => {
  await fetchSpecialRate();
  await initWarningStatistics();
});

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
.module-content {
  gap:24px;
}
.monitoring-device-module {

  // 顶部统计卡片
  .top-stats {
    display: flex;
    justify-content: center;
    background-image: url("@/assets/img/gasModule/device_bg.webp");
    background-size: 100% 100%;
    width: 100%;

    .stat-card {
      border-radius: 8px;
      padding: 20px 25px 20px 0;
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 114px;
        height: 91px;
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
        flex: 1;

        .stat-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-subtitle);
          color: #effaff;
          line-height: calc(var(--font-size-subtitle) * 1.438);
          text-align: center;
          font-style: normal;
        }

        .stat-value {
          display: flex;
          align-items: baseline;
          gap: 8px;

          > span {
            font-family: YouSheBiaoTiHei;
            font-size: var(--font-size-subtitle);
            color: #ffffff;
            line-height: calc(var(--font-size-subtitle) * 1.313);
            text-align: center;
            font-style: normal;
          }

          .value-total {
            background: linear-gradient(90deg, #ffffff 0%, #1677ff 100%);
          }

          .value-separator {
            color: #fff;
          }

          .value-offline {
            background: linear-gradient(90deg, #ffe9da 0%, #ce5a0d 100%);
          }
        }
      }
    }
  }

  // 在线率概览区域
  .overview-section {
    display: flex;
    justify-content: space-around;
    padding: 8px 0;

    .overview-item {
      display: flex;
      justify-content: center;
    }

    .rate-badge {
      width: 112px;
      height: 139px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;

      &.rate-online {
        background-image: url("@/assets/img/waterSupply/online_rate.png");

        .rate-value {
          background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
        }
      }

      &.rate-offline {
        background-image: url("@/assets/img/waterSupply/offline_rate.png");

        .rate-value {
          background: linear-gradient(90deg, #fffeed 0%, #cdab06 100%);
        }
      }

      &.rate-fault {
        background-image: url("@/assets/img/waterSupply/fault_rate.png");

        .rate-value {
          background: linear-gradient(90deg, #fffeed 0%, #cdab06 100%);
        }
      }

      .rate-value {
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-title);
        color: #ffffff;
        line-height: 52px;
        text-align: center;
        font-style: normal;
      }

      .rate-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: var(--font-size-heading);
        color: #e4f3ff;
        line-height: 35px;
        text-align: center;
        font-style: normal;
        margin-top: 8px;
      }
    }
  }

  // 预警类型统计区域
  .warning-statistics {
    width: 100%;
  }
  
  // 自定义表格样式
  .device-type {
    color: #FFFFFF;
    font-weight: 500;
  }
  
  .status-online {
    color: #2ED573;
    font-weight: bold;
  }
  
  .status-offline {
    color: #FFA502;
    font-weight: bold;
  }
  
  .status-fault {
    color: #FF4757;
    font-weight: bold;
  }
}
</style>
