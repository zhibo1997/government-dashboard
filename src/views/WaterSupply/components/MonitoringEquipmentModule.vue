<template>
  <div class="data-module monitoring-equipment-module">
    <div class="module-header">
      <div class="module-title">监测设备</div>
    </div>
    <div class="module-content">
      <div class="monitoring-content">
        <!-- 在线率概览 -->
        <div class="overview-section">
          <div
            class="overview-item"
            v-for="item in monitoringRate"
            :key="item.type"
          >
            <div class="rate-badge" :class="`rate-${item.type}`">
              <div class="rate-value gradient-text">{{ item.value }}</div>
              <div class="rate-name">{{ item.name }}</div>
            </div>
          </div>
        </div>

        <!-- 设备列表 -->
        <div class="devices-section">
          <div
            class="device-item"
            v-for="device in monitoringData.monitoring.devices"
            :key="device.name"
          >
            <div class="device-count">
              <span class="count-online gradient-text">{{
                device.online
              }}</span>
              <span class="count-separator">/</span>
              <span class="count-offline gradient-text">{{
                device.offline
              }}</span>
              <span class="count-separator">/</span>
              <span class="count-fault gradient-text">{{ device.fault }}</span>
            </div>
            <div class="device-name">{{ device.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getDeviceStatusRate } from "@/services/waterSupplyService";
import { onMounted, ref } from "vue";
// 初始化监控设备数据
const initMonitoringData = async () => {
  const res = await getDeviceTypeStatusCount();
  console.log("🚀 ~ initMonitoringData ~ res:", res);
};
const rateMap = {
  在线率: "online",
  故障率: "fault",
  离线率: "offline",
};
const monitoringRate = ref([]);
// 获取设备运行状态
const getDeviceTypeStatusCount = async () => {
  const res = await getDeviceStatusRate();
  res.forEach((item) => {
    item['type'] = rateMap[item.name];
  });
  monitoringRate.value = res;
};

onMounted(() => {
  initMonitoringData();
  getDeviceTypeStatusCount();
});

const monitoringData = {
  monitoring: {
    devices: [
      {
        name: "流量计",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "消火栓智能监测仪",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "压力计",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "应力检测仪",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "漏水监测仪",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "水质检测设备",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "河道水位计",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "温度计",
        online: 25,
        offline: 1,
        fault: 0,
      },
      {
        name: "液位计",
        online: 25,
        offline: 1,
        fault: 0,
      },
    ],
  },
};
</script>

<style lang="scss" scoped>
.monitoring-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  // 在线率概览区域
  .overview-section {
    display: flex;
    justify-content: space-around;

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
          background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
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
        font-size: 40px;
        color: #ffffff;
        line-height: 52px;
        text-align: center;
        font-style: normal;
      }

      .rate-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 24px;
        color: #e4f3ff;
        line-height: 35px;
        text-align: center;
        font-style: normal;
        margin-top: 8px;
      }
    }
  }

  // 设备列表区域
  .devices-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0px 50px;
    flex: 1;

    .device-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -20px;

      .device-count {
        width: 233px;
        height: 88px;
        display: flex;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2);
        position: relative;
        overflow: hidden;
        padding-top: 10px;
        background-size: 100% 100%;
        background-image: url("@/assets/img/waterSupply/monitor_device.png");

        .gradient-text {
          font-family: YouSheBiaoTiHei;
          font-size: 32px;
          color: #ffffff;
          line-height: 42px;
          text-align: center;
          font-style: normal;
        }

        .count-online {
          background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
        }

        .count-separator {
          font-family: YouSheBiaoTiHei;
          font-size: 32px;
          color: #ffffff;
          line-height: 42px;
          text-align: center;
          font-style: normal;
        }

        .count-offline {
          background: linear-gradient(90deg, #fffeed 0%, #cdab06 100%);
        }

        .count-fault {
          background: linear-gradient(90deg, #ffe9da 0%, #ce5a0d 100%);
        }
      }

      .device-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 24px;
        color: #e4f3ff;
        line-height: 35px;
        text-align: center;
        font-style: normal;
        position: relative;
        top: -20px;
      }
    }
  }
}
</style>
