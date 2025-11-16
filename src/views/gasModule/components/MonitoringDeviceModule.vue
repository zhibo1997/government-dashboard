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
            <img src="@/assets/img/waterSupply/monitor_device.png" alt="监测设备" />
          </div>
          <div class="stat-info">
            <div class="stat-label">监测设备总数</div>
            <div class="stat-value">
              <span class="value-total gradient-text">25</span>
              <span class="value-separator">/</span>
              <span class="value-online gradient-text">11</span>
              <span class="value-separator">/</span>
              <span class="value-offline gradient-text">0</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/waterSupply/online_rate.png" alt="在线率" />
          </div>
          <div class="stat-info">
            <div class="stat-label">在线率</div>
            <div class="stat-value">
              <span class="value-rate gradient-text">98%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 设备分类统计 -->
      <div class="device-categories">
        <div class="category-column" v-for="category in deviceCategories" :key="category.title">
          <div class="category-header">
            <div class="header-decoration"></div>
            <div class="header-title">{{ category.title }}</div>
            <div class="header-decoration"></div>
          </div>
          <div class="category-items">
            <div class="device-row" v-for="device in category.devices" :key="device.name">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-count gradient-text">{{ device.count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 设备分类数据
const deviceCategories = ref([
  {
    title: '燃气管网',
    devices: [
      { name: '可燃气体', count: '25/0' },
      { name: '物联网远程终端', count: '33/0' },
      { name: '阴极保护桩', count: '32/0' }
    ]
  },
  {
    title: '燃气场站',
    devices: [
      { name: '场站可燃气体', count: '25/2' },
      { name: '燃气压力计', count: '76/0' },
      { name: '燃气流量计', count: '25/0' }
    ]
  },
  {
    title: '终端用户',
    devices: [
      { name: '家用可燃气体', count: '298/6' },
      { name: '工商业可燃气体', count: '25/0' },
      { name: '小型餐饮厨房用气', count: '25/0' }
    ]
  }
]);
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
    gap: 30px;

    .stat-card {
      flex: 1;
      background: linear-gradient(135deg, rgba(22, 119, 255, 0.15) 0%, rgba(22, 119, 255, 0.05) 100%);
      border: 2px solid rgba(22, 119, 255, 0.4);
      border-radius: 8px;
      padding: 20px 25px;
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 120px;
        height: 120px;
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
          font-weight: 400;
          font-size: 26px;
          color: #9ec3e8;
          margin-bottom: 12px;
        }

        .stat-value {
          display: flex;
          align-items: baseline;
          gap: 8px;

          .value-total {
            font-family: YouSheBiaoTiHei;
            font-size: 52px;
            color: #ffffff;
            background: linear-gradient(90deg, #ffffff 0%, #1677ff 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .value-separator {
            font-family: YouSheBiaoTiHei;
            font-size: 42px;
            color: #9ec3e8;
          }

          .value-online {
            font-family: YouSheBiaoTiHei;
            font-size: 52px;
            color: #ffffff;
            background: linear-gradient(90deg, #ffffff 0%, #faad14 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .value-offline {
            font-family: YouSheBiaoTiHei;
            font-size: 52px;
            color: #ffffff;
            background: linear-gradient(90deg, #ffe9da 0%, #ff4d4f 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .value-rate {
            font-family: YouSheBiaoTiHei;
            font-size: 64px;
            color: #ffffff;
            background: linear-gradient(90deg, #ffffff 0%, #52c41a 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
      }
    }
  }

  // 设备分类统计
  .device-categories {
    display: flex;
    gap: 25px;

    .category-column {
      flex: 1;
      background: linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 100, 200, 0.03) 100%);
      border: 1px solid rgba(22, 119, 255, 0.25);
      border-radius: 8px;
      overflow: hidden;

      .category-header {
        height: 70px;
        background: linear-gradient(90deg, rgba(22, 119, 255, 0.3) 0%, rgba(22, 119, 255, 0.15) 100%);
        border-bottom: 2px solid rgba(22, 119, 255, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(22, 119, 255, 0.1) 20%, 
            rgba(22, 119, 255, 0.1) 80%, 
            transparent 100%
          );
        }

        .header-decoration {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #1677ff 100%);
          position: relative;

          &::before,
          &::after {
            content: '';
            position: absolute;
            width: 6px;
            height: 6px;
            background: #1677ff;
            transform: rotate(45deg);
          }

          &::before {
            left: -3px;
            top: -2px;
          }

          &::after {
            right: -3px;
            top: -2px;
          }
        }

        .header-title {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 500;
          font-size: 32px;
          color: #ffffff;
          text-shadow: 0 0 10px rgba(22, 119, 255, 0.8);
          position: relative;
          z-index: 1;
        }
      }

      .category-items {
        padding: 20px;

        .device-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 15px;
          margin-bottom: 12px;
          background: linear-gradient(90deg, rgba(0, 150, 255, 0.06) 0%, rgba(0, 100, 200, 0.02) 100%);
          border: 1px solid rgba(22, 119, 255, 0.15);
          border-radius: 6px;
          transition: all 0.3s ease;

          &:last-child {
            margin-bottom: 0;
          }

          &:hover {
            background: linear-gradient(90deg, rgba(0, 150, 255, 0.12) 0%, rgba(0, 100, 200, 0.06) 100%);
            border-color: rgba(22, 119, 255, 0.3);
            transform: translateX(5px);
          }

          .device-name {
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: 400;
            font-size: 26px;
            color: #e4f3ff;
          }

          .device-count {
            font-family: YouSheBiaoTiHei;
            font-size: 32px;
            color: #ffffff;
            background: linear-gradient(90deg, #ffffff 0%, #faad14 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
      }
    }
  }
}
</style>
          position: relative;
          top: -20px;
        }
      }
    }
  }
}
</style>
