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
            <img
              src="@/assets/img/gasModule/device_count.webp"
              alt="监测设备"
            />
          </div>
          <div class="stat-info">
            <div class="stat-label">监测设备总数</div>
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

        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/gasModule/online_rate.webp" alt="在线率" />
          </div>
          <div class="stat-info">
            <div class="stat-label">在线率</div>
            <div class="stat-value">
              <span class="value-rate gradient-text">{{
                topStats.onlineRate
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 设备分类统计 -->
      <div class="device-categories">
        <div
          class="category-column"
          v-for="category in deviceCategories"
          :key="category.title"
        >
          <div class="category-header">
            <span class="header-title">{{ category.title }}</span>
          </div>
          <div class="category-items">
            <div
              class="device-row"
              v-for="device in category.devices"
              :key="device.name"
            >
              <div class="device-name">{{ jcsblxMap[device.name] || device.name }}</div>
              <div class="device-count">
                <span class="online gradient-text">{{ device.onlineNum }}</span>
                <span class="separator">/</span>
                <span class="offline gradient-text">{{
                  device.offlineNum
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCachedDictionary } from "@/services/dictionaryService";
import { getBridgeEquipmentOnlineCount } from "@/services/bridgeService";

import { ref, onMounted } from "vue";

const jcsblxMap = ref<any>({});
// 初始化获取状态数据
onMounted(async () => {
  // 桥梁模块暂不使用设备类型映射
  jcsblxMap.value = {};

  initMonitoringCount();
  getDeviceTypeRate();

  initBridgeOnlineStatus();
});

// 获取设备运行状态
const getDeviceTypeRate = async () => {
  // 桥梁模块暂不实现在线率功能
  topStats.value.onlineRate = "-";
};

//获取设备情况并更新分类统计
const initBridgeOnlineStatus = async () => {
  try {
    // 桥梁模块暂不实现设备分类统计功能
    // 保持空数组
    deviceCategories.value = [];
  } catch (error) {
    console.error("获取设备在线状态失败:", error);
  }
};

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

  } catch (error) {
    console.error("获取设备状态数据失败:", error);
  }
};

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
</script>

<style lang="scss" scoped>
.monitoring-device-module {
  .module-content {
    padding: 20px 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  // 顶部统计卡片
  .top-stats {
    display: flex;
    background-image: url("@/assets/img/gasModule/device_bg.webp");
    background-size: 100% 100%;
    width: 100%;

    .stat-card {
      border-radius: 8px;
      padding: 20px 25px;
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
          font-weight: 500;
          font-size: 32px;
          color: #effaff;
          line-height: 46px;
          text-align: center;
          font-style: normal;
        }

        .stat-value {
          display: flex;
          align-items: baseline;
          gap: 8px;

          > span {
            font-family: YouSheBiaoTiHei;
            font-size: 32px;
            color: #ffffff;
            line-height: 42px;
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

  // 设备分类统计
  .device-categories {
    display: flex;
    gap: 20px;
    width: 100%;

    .category-column {
      background-image: url("@/assets/img/gasModule/device_item.webp");
      width: 33.3%;
      height: 285px;

      .category-header {
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        position: relative;

        .header-title {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: bold;
          font-size: 24px;
          color: #effaff;
          line-height: 35px;
          text-align: center;
          font-style: normal;
        }
      }

      .category-items {
        .device-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          padding: 12px 8px 0;
          // margin-bottom: 8px;

          .device-name {
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: 400;
            font-size: 20px;
            color: #effaff;
            line-height: 29px;
            text-align: left;
            font-style: normal;
          }

          .device-count {
            display: flex;
            align-items: baseline;
            gap: 2px;

            > span {
              font-family: YouSheBiaoTiHei;
              font-size: 20px;
              color: #ffffff;
              line-height: 26px;
              font-style: normal;
            }

            .online {
              background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
            }

            .separator {
              color: #fff;
            }

            .offline {
              background: linear-gradient(90deg, #ffe9da 0%, #ce5a0d 100%);
            }
          }
        }
      }
    }
  }
}
</style>
