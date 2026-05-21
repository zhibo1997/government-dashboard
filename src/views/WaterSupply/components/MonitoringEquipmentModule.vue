<template>
  <div class="data-module monitoring-equipment-module">
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

      <!-- 设备列表 -->
      <CommonTable
        :columns="deviceTableColumns"
        :data="monitoringData"
        row-key="name"
        empty-text="暂无设备数据"
        :max-height="760"
        grid-template="2fr 1fr 1fr"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCachedDictionary } from "@/services/dictionaryService";
import {
  getDeviceStatusRate,
  getDeviceTypeStatusCount,
} from "@/services/waterSupplyService";
import { nextTick, onMounted, ref, inject } from "vue";
import CommonTable from '@/components/CommonTable.vue';

// 从根组件接收模块配置
const moduleConfig = inject('MODULE_CONFIG', {
  sszx: 'csaqzx_gs',
  dictKey: {
    jcsblx: 'jcsblx_gs'
  }
});

const csblxMap = ref({});
const monitoringData = ref<any[]>([]);

// 顶部统计
const topStats = ref({
  total: 0,
  online: 0,
  offline: 0,
});

// 初始化监控设备数据
const initMonitoringData = async () => {
  const jcsblx = moduleConfig.dictKey?.jcsblx || "jcsblx_gs";
  const dictionaries = await getCachedDictionary(jcsblx);
  csblxMap.value = dictionaries.reduce((acc, cur) => {
    acc[cur.f_ItemValue] = cur.f_ItemName;
    return acc;
  }, {});

  const res = await getDeviceTypeStatusCount({ Sszx: moduleConfig.sszx });

  let online = 0;
  let offline = 0;

  nextTick(() => {
    monitoringData.value = res.map((item) => {
      const itemOnline = item.statusCounts.find((s: any) => s.status === "sbyxzt001")?.count || 0;
      const itemOffline = item.statusCounts.find((s: any) => s.status === "sbyxzt002")?.count || 0;

      online += itemOnline;
      offline += itemOffline;

      return {
        name: csblxMap.value[item.deviceType],
        online: itemOnline,
        offline: itemOffline,
      };
    });

    topStats.value.online = online;
    topStats.value.offline = offline;
  });
};

const rateMap: Record<string, string> = {
  在线率: "online",
  故障率: "fault",
  离线率: "offline",
};
const monitoringRate = ref<any[]>([]);

const getDeviceTypeRate = async () => {
  const res = await getDeviceStatusRate({ Sszx: moduleConfig.sszx });
  monitoringRate.value = (res as any[]).map((item) => ({
    ...item,
    type: rateMap[item.name] || "",
  }));
};

// 表格列配置
const deviceTableColumns = [
  { key: 'name', title: '类型', width: '2fr' },
  { key: 'online', title: '在线', width: '1fr' },
  { key: 'offline', title: '离线', width: '1fr' },
];

onMounted(() => {
  initMonitoringData();
  getDeviceTypeRate();
});
</script>

<style lang="scss" scoped>
.monitoring-equipment-module {
  flex: 1.5;

  .module-content {
    gap: 24px;
  }

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
    width: 100%;
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
}
</style>
