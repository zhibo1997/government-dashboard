<template>
  <div class="data-module monitoring-device-module">
    <div class="module-header">
      <div class="module-title">监测设备</div>
    </div>
    <div class="module-content">
      <div class="monitoring-content">
        <!-- 设备在线率概览 -->
        <div class="overview-section">
          <div class="overview-item" v-for="item in deviceRate" :key="item.type">
            <div class="rate-badge" :class="`rate-${item.type}`">
              <div class="rate-value gradient-text">{{ item.value }}</div>
              <div class="rate-name">{{ item.name }}</div>
            </div>
          </div>
        </div>

        <!-- 设备列表 -->
        <div class="devices-section">
          <div class="device-item" v-for="device in deviceData" :key="device.name">
            <div class="device-count">
              <span class="count-online gradient-text">{{ device.online }}</span>
              <span class="count-separator">/</span>
              <span class="count-offline gradient-text">{{ device.offline }}</span>
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
import { ref, onMounted } from "vue";

// 设备运行状态
const deviceRate = ref([
  { type: 'online', name: '在线率', value: '96.5%' },
  { type: 'offline', name: '离线率', value: '2.8%' },
  { type: 'fault', name: '故障率', value: '0.7%' },
]);

// 设备列表数据
const deviceData = ref([
  { name: '压力监测', online: 45, offline: 2, fault: 1 },
  { name: '流量监测', online: 38, offline: 3, fault: 0 },
  { name: '泄漏检测', online: 52, offline: 1, fault: 2 },
  { name: '温度监测', online: 28, offline: 2, fault: 0 },
  { name: '阀门监控', online: 62, offline: 4, fault: 1 },
  { name: '智能表具', online: 156, offline: 8, fault: 3 },
]);

onMounted(() => {
  // TODO: 调用API获取实际设备数据
});
</script>

<style lang="scss" scoped>
.monitoring-device-module {
  .monitoring-content {
    display: flex;
    flex-direction: column;
    height: 100%;

    .overview-section {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;

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
            background: linear-gradient(90deg, #ffffff 0%, #52c41a 100%);
          }
        }

        &.rate-offline {
          background-image: url("@/assets/img/waterSupply/offline_rate.png");

          .rate-value {
            background: linear-gradient(90deg, #fffeed 0%, #faad14 100%);
          }
        }

        &.rate-fault {
          background-image: url("@/assets/img/waterSupply/fault_rate.png");

          .rate-value {
            background: linear-gradient(90deg, #ffe9da 0%, #ff4d4f 100%);
          }
        }

        .rate-value {
          font-family: YouSheBiaoTiHei;
          font-size: 36px;
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

    .devices-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0px 50px;
      flex: 1;
      overflow-y: auto;

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
            margin-right: 6px;
          }

          .count-online {
            background: linear-gradient(90deg, #ffffff 0%, #52c41a 100%);
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
            background: linear-gradient(90deg, #fffeed 0%, #faad14 100%);
          }

          .count-fault {
            background: linear-gradient(90deg, #ffe9da 0%, #ff4d4f 100%);
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
}
</style>
