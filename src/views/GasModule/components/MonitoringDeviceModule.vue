<template>
  <div class="data-module monitoring-device-module" @click="switchToMonitorMode?.()">
    <div class="module-header">
      <div class="module-title">监测设备</div>
    </div>
    <div class="module-content">
      <!-- 顶部统计卡片 -->
      <div class="top-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <img
              src="@/assets/img/device_count.webp"
              alt="监测设备"
            />
          </div>
          <div class="stat-info">
            <div class="stat-label">监测设备</div>
            <div class="stat-value">
              <span class="value-total gradient-text">{{
                topStats.online
              }}</span>
              <span class="value-separator">/</span>
              <span class="value-offline gradient-text">{{
                topStats.offline
              }}</span>
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
        :data="flatDeviceList"
        row-key="name"
        empty-text="暂无数据"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCachedDictionary } from "@/services/dictionaryService";
import { getEquipmentOperationStatusList } from "@/services/gasService";
import {
  getDeviceStatusRate,
  getDeviceTypeStatusCount,
} from "@/services/waterSupplyService";

import { ref, onMounted, inject, computed, type Ref } from "vue";
import CommonTable from '@/components/CommonTable.vue';

const switchToMonitorMode = inject<Ref<(() => void) | null>>('switchToMonitorMode', ref(null));

const jcsblxMap = ref<any>({});
// 初始化获取状态数据
onMounted(async () => {
  const rqDict = await getCachedDictionary("jcsblx_rq");
  const rqzdyhDict = await getCachedDictionary("jcsblx_rqzdyh");
  jcsblxMap.value = [...rqDict, ...rqzdyhDict].reduce((acc, cur) => {
    acc[cur.f_ItemValue] = cur.f_ItemName;
    return acc;
  }, {});

  initMonitoringCount();
  getDeviceTypeRate();

  initGasOnlineStatus();
});

// 获取设备运行状态
const getDeviceTypeRate = async () => {
  const res = await getDeviceStatusRate({ Sszx: "csaqzx_rq" });
  topStats.value.onlineRate =
    (res as Array<any>).find((item) => item.name === "在线率")?.value || "-";

  const rateMap: Record<string, string> = {
    在线率: "online",
    故障率: "fault",
    离线率: "offline",
  };
  monitoringRate.value = (res as Array<any>).map((item) => ({
    ...item,
    type: rateMap[item.name] || "",
  }));
};

//获取设备情况并更新分类统计
const initGasOnlineStatus = async () => {
  try {
    const res = await getEquipmentOperationStatusList();

    // 按 bigType 和 sblx 聚合数据
    const aggregated: Record<
      string,
      Record<string, { onlineNum: number; offlineNum: number }>
    > = {};

    (res as Array<any>).forEach((item) => {
      if (!aggregated[item.bigType]) {
        aggregated[item.bigType] = {};
      }
      if (!aggregated[item.bigType][item.sblx]) {
        aggregated[item.bigType][item.sblx] = { onlineNum: 0, offlineNum: 0 };
      }

      if (item.sbyxzt === "sbyxzt001") {
        aggregated[item.bigType][item.sblx].onlineNum += item.number;
      } else if (item.sbyxzt === "sbyxzt002") {
        aggregated[item.bigType][item.sblx].offlineNum += item.number;
      }
    });
    console.log("🚀 ~ initGasOnlineStatus ~ aggregated:", aggregated);

    // 更新设备分类数据
    deviceCategories.value = Object.keys(aggregated).map((bigType) => ({
      title: bigType,
      devices: Object.keys(aggregated[bigType]).map((sblx) => ({
        name: sblx,
        ...aggregated[bigType][sblx],
      })),
    }));
  } catch (error) {
    console.error("获取设备在线状态失败:", error);
  }
};

const initMonitoringCount = async () => {
  try {
    const res = await getDeviceTypeStatusCount({ Sszx: "csaqzx_rq" });

    // 计算总设备数
    let total = 0;
    let online = 0;
    let offline = 0;
    let fault = 0;

    // 遍历所有设备类型的状态数据
    (res as Array<any>).forEach((item) => {
      item.statusCounts.forEach((status) => {
        const count = status.count || 0;
        total += count;

        switch (status.status) {
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
    });

    topStats.value.online = online;
    topStats.value.offline = offline;

    // 这里可以进一步处理设备分类数据，如果需要的话
    // 目前保持原有的硬编码数据不变
  } catch (error) {
    console.error("获取设备状态数据失败:", error);
  }
};

// 在线率概览数据
const monitoringRate = ref<any[]>([]);

// 顶部统计数据
const topStats = ref({
  total: 0,
  online: 0,
  offline: 0,
  onlineRate: "-",
});

// 设备分类数据
const deviceCategories = ref<
  Array<{
    title: string;
    devices: Array<{ name: string; onlineNum: number; offlineNum: number }>;
  }>
>([]);

// 展平的设备列表
const flatDeviceList = computed(() =>
  deviceCategories.value.flatMap((cat) =>
    cat.devices.map((d) => ({
      bigType: cat.title,
      name: jcsblxMap.value[d.name] || d.name,
      onlineNum: d.onlineNum,
      offlineNum: d.offlineNum,
    }))
  )
);

// 表格列配置
const deviceTableColumns = computed(() => [
  { key: 'bigType', title: '分类', width: '1fr' },
  { key: 'name', title: '设备', width: '2.4fr' },
  { key: 'onlineNum', title: '在线', width: '0.6fr' },
  { key: 'offlineNum', title: '离线', width: '0.6fr' },
]);
</script>

<style lang="scss" scoped>
.monitoring-device-module {
  .module-content{
    // justify-content: space-around;
    gap: 32px;
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

          .value-online {
            background: linear-gradient(90deg, #fffeed 0%, #cdab06 100%);
          }

          .value-offline {
            background: linear-gradient(90deg, #ffe9da 0%, #ce5a0d 100%);
          }

          .value-rate {
            background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
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

}
</style>
