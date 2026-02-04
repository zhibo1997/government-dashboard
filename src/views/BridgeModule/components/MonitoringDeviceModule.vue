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

        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/bridgeModule/device_fault.webp" alt="">
          </div>
          <div class="stat-info">
            <div class="stat-label">故障数</div>
            <div class="stat-value">
              <span class="value-fault gradient-text">0</span>
            </div>
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
          grid-template="2fr 1fr 1fr 1fr"
        >
          <!-- 自定义设备类型列 -->
          <template #sblxmc="{ value }">
            <span class="device-type">{{ value }}</span>
          </template>
          
          <!-- 自定义状态列 -->
          <template #zx="{ value }">
            <span class="status-online">{{ value }}</span>
          </template>
          
          <template #lx="{ value }">
            <span class="status-offline">{{ value }}</span>
          </template>
          
          <template #fault="{ value }">
            <span class="status-fault">{{ value }}</span>
          </template>
        </CommonTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBridgeEquipmentOnlineCount, getBridgeEquipmentRunStatusList } from "@/services/bridgeService";
import { getEquipmentPageList } from "@/services/gasService";
import { ref, computed, onMounted } from "vue";
import CommonTable from '@/components/CommonTable.vue';

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
          font-size: var(--font-size-32);
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
