<template>
  <div class="data-module emergency-resource-module">
    <div class="module-header">
      <div class="module-title">应急资源</div>
    </div>
    <div class="module-content">
      <div class="emergency-content">
        <!-- 资源统计 -->
        <div class="resource-stats">
          <div 
            class="resource-stat-card" 
            v-for="item in resourceStats" 
            :key="item.type"
            :class="`resource-${item.type}`"
          >
            <div class="stat-icon">
              <!-- 预留图片位置，可自定义添加 -->
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">{{ item.count }}</div>
            </div>
          </div>
        </div>

        <!-- 中心应急资源圆环 -->
        <div class="center-resource">
          <div class="center-ring">
            <div class="ring-text">应急<br />资源</div>
          </div>
        </div>

        <!-- 底部车辆统计 -->
        <div class="vehicle-stat">
          <div class="vehicle-icon">
            <!-- 预留图片位置 -->
          </div>
          <div class="vehicle-info">
            <span class="vehicle-label">救援车辆：</span>
            <span class="vehicle-count">102辆</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 资源统计（根据设计图布局：左侧3个，右侧3个）
const resourceStats = ref([
  // 左侧
  { type: 'expert', label: '应急专家', count: '12人' },
  { type: 'medical', label: '医疗队伍', count: '12支' },
  { type: 'shelter', label: '避难场所', count: '128处' },
  // 右侧
  { type: 'rescue-team', label: '救援队伍', count: '98支' },
  { type: 'rescue-personnel', label: '救援人员', count: '128人' },
  { type: 'rescue-warehouse', label: '救援仓库', count: '612个' },
]);
</script>

<style lang="scss" scoped>
.emergency-resource-module {
  flex: 0.7;
  background-image: url("@/assets/img/gasModule/emergency_resource_bg.webp");

  .module-content {
    padding: 20px 30px;
  }

  .emergency-content {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto auto;
    gap: 20px;
    align-items: center;
    position: relative;
  }

  // 资源统计卡片
  .resource-stats {
    display: contents;

    .resource-stat-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 15px;
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(22, 119, 255, 0.12) 0%,
        rgba(22, 119, 255, 0.04) 100%
      );
      border: 1px solid rgba(22, 119, 255, 0.25);
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(22, 119, 255, 0.4);
        box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(22, 119, 255, 0.2);
        flex-shrink: 0;
        // 预留图片背景位置
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          font-size: 14px;
          color: #d3eaf1;
          line-height: 20px;
        }

        .stat-value {
          font-family: YouSheBiaoTiHei;
          font-size: 20px;
          color: #ffffff;
          line-height: 26px;
          background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }

      // 左侧3个卡片
      &.resource-expert {
        grid-column: 1;
        grid-row: 1;
      }
      &.resource-medical {
        grid-column: 1;
        grid-row: 2;
      }
      &.resource-shelter {
        grid-column: 1;
        grid-row: 3;
      }

      // 右侧3个卡片
      &.resource-rescue-team {
        grid-column: 3;
        grid-row: 1;
      }
      &.resource-rescue-personnel {
        grid-column: 3;
        grid-row: 2;
      }
      &.resource-rescue-warehouse {
        grid-column: 3;
        grid-row: 3;
      }
    }
  }

  // 中心应急资源圆环
  .center-resource {
    grid-column: 2;
    grid-row: 1 / 3;
    display: flex;
    align-items: center;
    justify-content: center;

    .center-ring {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(255, 77, 79, 0.3) 0%,
        rgba(255, 77, 79, 0.1) 40%,
        transparent 70%
      );
      border: 3px solid rgba(255, 77, 79, 0.5);
      box-shadow: 
        0 0 20px rgba(255, 77, 79, 0.4),
        inset 0 0 30px rgba(255, 77, 79, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 140px;
        height: 140px;
        border-radius: 50%;
        border: 2px dashed rgba(255, 77, 79, 0.4);
      }

      .ring-text {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: bold;
        font-size: 28px;
        color: #ffffff;
        line-height: 40px;
        text-align: center;
        z-index: 1;
        text-shadow: 0 2px 8px rgba(255, 77, 79, 0.6);
      }
    }
  }

  // 底部车辆统计
  .vehicle-stat {
    grid-column: 2;
    grid-row: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 20px;
    border-radius: 6px;
    background: linear-gradient(
      90deg,
      rgba(22, 119, 255, 0.12) 0%,
      rgba(22, 119, 255, 0.04) 100%
    );
    border: 1px solid rgba(22, 119, 255, 0.25);

    .vehicle-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(250, 173, 20, 0.2);
      flex-shrink: 0;
      // 预留图片背景位置
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }

    .vehicle-info {
      display: flex;
      align-items: baseline;
      gap: 5px;

      .vehicle-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 16px;
        color: #d3eaf1;
      }

      .vehicle-count {
        font-family: YouSheBiaoTiHei;
        font-size: 20px;
        color: #ffffff;
        background: linear-gradient(90deg, #faad14 0%, #ff7875 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }
}
</style>
