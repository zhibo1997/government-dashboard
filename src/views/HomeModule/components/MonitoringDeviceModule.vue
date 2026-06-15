<template>
  <div class="data-module monitoring-device-module">
    <div class="module-header">
      <div class="module-title">监测设备</div>
    </div>
    <div class="module-content">
      <div class="module-scroll">
        <template v-for="mod in moduleStats" :key="mod.key">
          <!-- 顶部统计卡片（数量） -->
          <div class="top-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <img src="@/assets/img/device_count.webp" :alt="mod.name" />
              </div>
              <div class="stat-info">
                <div class="stat-label">{{ mod.name }}监测设备</div>
                <div class="stat-value">
                  <span class="value-total gradient-text">{{ mod.onlineCount }}</span>
                  <span class="value-separator">/</span>
                  <span class="value-offline gradient-text">{{ mod.offlineCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 在线率概览 -->
          <div class="overview-section">
            <div class="overview-item">
              <div class="rate-badge rate-online">
                <div class="rate-value gradient-text">{{ mod.onlineRate }}</div>
                <div class="rate-name">在线率</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="rate-badge rate-offline">
                <div class="rate-value gradient-text">{{ mod.offlineRate }}</div>
                <div class="rate-name">离线率</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="rate-badge rate-fault">
                <div class="rate-value gradient-text">{{ mod.faultRate }}</div>
                <div class="rate-name">故障率</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSpecialRateList } from "@/services/commonService";

interface ModuleStat {
  key: string;
  name: string;
  sszx: string;
  onlineCount: number;
  offlineCount: number;
  onlineRate: string;
  offlineRate: string;
  faultRate: string;
}

const moduleStats = ref<ModuleStat[]>([
  { key: "bridge", name: "桥梁", sszx: "csaqzx_ql", onlineCount: 0, offlineCount: 0, onlineRate: "0%", offlineRate: "0%", faultRate: "0%" },
  { key: "water", name: "供水", sszx: "csaqzx_gs", onlineCount: 0, offlineCount: 0, onlineRate: "0%", offlineRate: "0%", faultRate: "0%" },
  { key: "drainage", name: "排水", sszx: "csaqzx_ps", onlineCount: 0, offlineCount: 0, onlineRate: "0%", offlineRate: "0%", faultRate: "0%" },
  { key: "gas", name: "燃气", sszx: "csaqzx_rq", onlineCount: 0, offlineCount: 0, onlineRate: "0%", offlineRate: "0%", faultRate: "0%" },
]);

onMounted(async () => {
  try {
    // 只需请求一次，按 sszx 查找即可
    const data = await getSpecialRateList("csaqzx_ql");
    if (!Array.isArray(data)) return;

    moduleStats.value.forEach((mod) => {
      const item = data.find((d: any) => d.sszx === mod.sszx);
      if (item) {
        mod.onlineCount = item.onlineCount || 0;
        mod.offlineCount = item.offlineCount || 0;
        mod.onlineRate = item.onlineRate || "0%";
        mod.offlineRate = item.offlineRate || "0%";
        mod.faultRate = item.faultRate || "0%";
      }
    });
  } catch (error) {
    console.error("获取设备在线离线数据失败:", error);
  }
});
</script>

<style lang="scss" scoped>
.monitoring-device-module {
  flex: 0 0 calc(66.667% - 8px);
  overflow: hidden;

  .module-content {
    height: calc(100% - 80px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }
  }

  .module-scroll {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
