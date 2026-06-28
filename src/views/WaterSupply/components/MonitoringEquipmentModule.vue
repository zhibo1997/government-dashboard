<template>
  <div class="data-module monitoring-equipment-module">
    <div class="module-header">
      <div class="module-title">监测设备</div>
    </div>
    <div class="module-content">
      <!-- 设备总数统计 -->
      <div class="total-stats">
        <img src="@/assets/img/monitoring_equipment.webp" alt="监测设备" class="total-icon" />
        <span class="total-label">监测设备总数：</span>
        <span class="total-online gradient-text">在线{{ topStats.online }}</span>
        <span class="total-separator">/</span>
        <span class="total-offline gradient-text">离线{{ topStats.offline }}</span>
      </div>

      <!-- 顶部统计卡片（3个矩形卡片） -->
      <div class="top-stats">
        <div class="stat-card">
          <img src="@/assets/img/bridgeModule/device_online.webp" alt="在线" class="stat-icon" />
          <div class="stat-info">
            <div class="stat-label">在线总数</div>
            <div class="stat-value online-value">{{ topStats.online }}</div>
          </div>
        </div>
        <div class="stat-card">
          <img src="@/assets/img/bridgeModule/device_offline.webp" alt="离线" class="stat-icon" />
          <div class="stat-info">
            <div class="stat-label">离线总数</div>
            <div class="stat-value offline-value">{{ topStats.offline }}</div>
          </div>
        </div>
        <div class="stat-card">
          <img src="@/assets/img/bridgeModule/device_fault.webp" alt="故障" class="stat-icon" />
          <div class="stat-info">
            <div class="stat-label">故障总数</div>
            <div class="stat-value fault-value">{{ topStats.fault }}</div>
          </div>
        </div>
      </div>

      <!-- 在线率概览（3个圆形卡片） -->
      <div class="overview-section">
        <div class="overview-item" v-for="item in monitoringRate" :key="item.type">
          <div class="rate-badge" :class="`rate-${item.type}`">
            <div class="rate-value gradient-text">{{ item.value }}</div>
            <div class="rate-name">{{ item.name }}</div>
          </div>
        </div>
      </div>

      <!-- 设备列表 -->
      <div class="table-wrapper">
        <CommonTable
          :columns="deviceTableColumns"
          :data="deviceList"
          row-key="sblx"
          empty-text="暂无设备数据"
          grid-template="1fr 2.4fr 0.6fr 0.6fr"
          :active-row-key="activeDeviceType"
          @row-click="handleRowClick"
        />
      </div>
    </div>
  </div>

  <!-- 监测设备详情弹窗 -->
  <EquipmentPointPopup
    :visible="popupVisible"
    :equipment-data="popupData"
    :sblx-dict-keys="[moduleConfig.dictKey.jcsblx]"
    @close="closePopup"
  />
</template>

<script setup lang="ts">
import { getSpecialRateList, getDeviceStatusList } from "@/services/commonService";
import { onMounted, ref, inject } from "vue";
import CommonTable from '@/components/CommonTable.vue';
import EquipmentPointPopup from '@/components/EquipmentPointPopup.vue';
import { useMonitoringDeviceScatter } from "@/hook/useMonitoringDeviceScatter";

const { activeDeviceType, popupVisible, popupData, init: initScatter, toggleDevicePoints, closePopup } = useMonitoringDeviceScatter();

// 从根组件接收模块配置
const moduleConfig = inject('MODULE_CONFIG', {
  sszx: 'csaqzx_gs',
  dictKey: { jcsblx: 'jcsblx_gs' }
});

// 设备列表数据
const deviceList = ref<any[]>([]);

// 顶部统计
const topStats = ref({
  total: 0,
  online: 0,
  offline: 0,
  fault: 0,
});

// 获取设备在线率
const fetchSpecialRate = async () => {
  try {
    const data = await getSpecialRateList();
    const item = Array.isArray(data) ? data.find((d: any) => d.sszx === moduleConfig.sszx) : null;
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

// 获取设备状态列表
const initDeviceStatus = async () => {
  try {
    deviceList.value = await getDeviceStatusList(moduleConfig.sszx);
  } catch (error) {
    console.error("获取设备状态列表失败:", error);
  }
};

const monitoringRate = ref<any[]>([]);

// 表格行点击
const handleRowClick = (row: any) => {
  toggleDevicePoints(row.sblx, row.sblxmc);
};

// 表格列配置
const deviceTableColumns = [
  { key: 'bigType', title: '分类', width: '1fr' },
  { key: 'sblxmc', title: '设备', width: '2.4fr' },
  { key: 'zx', title: '在线', width: '0.6fr' },
  { key: 'lx', title: '离线', width: '0.6fr' },
];

onMounted(async () => {
  await initScatter();
  fetchSpecialRate();
  initDeviceStatus();
});
</script>

<style lang="scss" scoped>
.monitoring-equipment-module {
  flex: 1.5;
  display: flex;
  flex-direction: column;

  .module-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }

  // 设备总数统计行
  .total-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px 25px;
    background-image: url("@/assets/img/gasModule/device_bg.webp");
    background-size: 100% 100%;
    width: 100%;
    flex-shrink: 0;

    .total-icon {
      width: 114px;
      height: 91px;
      object-fit: contain;
    }

    .total-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-subtitle);
      color: #effaff;
      line-height: calc(var(--font-size-subtitle) * 1.438);
    }

    .total-online {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-subtitle);
      color: #ffffff;
      line-height: calc(var(--font-size-subtitle) * 1.313);
      background: linear-gradient(90deg, #ffffff 0%, #1677ff 100%);
    }

    .total-separator {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-subtitle);
      color: #fff;
      line-height: calc(var(--font-size-subtitle) * 1.313);
    }

    .total-offline {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-subtitle);
      color: #ffffff;
      line-height: calc(var(--font-size-subtitle) * 1.313);
      background: linear-gradient(90deg, #ffe9da 0%, #ce5a0d 100%);
    }
  }

  // 顶部统计卡片（3个矩形卡片）
  .top-stats {
    display: flex;
    justify-content: space-around;
    width: 100%;
    flex-shrink: 0;

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .stat-icon {
        width: 80px;
        height: 80px;
        object-fit: contain;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .stat-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: 32px;
          color: #effaff;
          white-space: nowrap;
        }

        .stat-value {
          font-family: YouSheBiaoTiHei;
          font-size: var(--font-size-title);
          font-weight: bold;
          line-height: 1.2;
        }

        .online-value {
          background: linear-gradient(0deg, #3FFEFD 0%, #FFF407 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .offline-value {
          background: linear-gradient(0deg, #F75E04 0%, #FEAC04 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fault-value {
          background: linear-gradient(0deg, #FF1D1D 0%, #FD8837 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }
  }

  // 在线率概览区域（3个圆形卡片）
  .overview-section {
    display: flex;
    justify-content: space-around;
    width: 100%;
    padding: 8px 0;
    flex-shrink: 0;

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
      justify-content: center;
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

  // 表格区域 — flex: 1 撑满剩余空间，内部滚动
  .table-wrapper {
    flex: 1;
    width: 100%;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
