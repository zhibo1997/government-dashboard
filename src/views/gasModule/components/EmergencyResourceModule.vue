<template>
  <div class="data-module emergency-resource-module">
    <div class="module-header">
      <div class="module-title">应急资源</div>
    </div>
    <div class="module-content">
      <div class="emergency-content">
        <!-- 资源统计 -->
        <div class="resource-stats">
          <div class="resource-stat-card" v-for="(item, idx) in resourceStats" :key="item.type"
            :class="`resource-${item.type}  resource-${idx > 2 ? 'right' : 'left'}`">
            <div class="stat-icon">
              <img :src="item.icon" :alt="item.label">
            </div>
            <div class="stat-info">
              <span class="stat-label">{{ item.label }}：</span>
              <span class="stat-value">{{ item.count }}</span>
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
        <div class="resource-stat-card resource-vehicle">
          <div class="stat-icon">
            <img :src="rescueVehicleIcon" alt="救援车辆">
          </div>
          <div class="stat-info">
            <span class="stat-label">救援车辆：</span>
            <span class="stat-value">{{ vehicleCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getEmergencyCapacityList } from '@/services/gasService';
import expertIcon from '@/assets/img/gasModule/expert.webp';
import medicalIcon from '@/assets/img/gasModule/medical.webp';
import shelterIcon from '@/assets/img/gasModule/shelter.webp';
import rescueTeamIcon from '@/assets/img/gasModule/rescue_team.webp';
import rescuePersonnelIcon from '@/assets/img/gasModule/rescue_personnel.webp';
import rescueWarehouseIcon from '@/assets/img/gasModule/rescue_warehouse.webp';
import rescueVehicleIcon from '@/assets/img/gasModule/rescue_vehicle.webp';

// 救援车辆数量
const vehicleCount = ref('0');

// 资源统计（根据设计图布局：左侧3个，右侧3个）
const resourceStats = ref([
  // 左侧
  { type: 'expert', label: '应急专家', count: '0', icon: expertIcon },
  { type: 'medical', label: '医疗队伍', count: '0', icon: medicalIcon },
  { type: 'shelter', label: '避难场所', count: '0', icon: shelterIcon },
  // 右侧
  { type: 'rescue-team', label: '救援队伍', count: '0', icon: rescueTeamIcon },
  { type: 'rescue-personnel', label: '救援人员', count: '0', icon: rescuePersonnelIcon },
  { type: 'rescue-warehouse', label: '救援仓库', count: '0', icon: rescueWarehouseIcon },
]);

// 获取应急资源数据
const fetchEmergencyCapacityList = async () => {
  try {
    const data = await getEmergencyCapacityList();

    // 映射接口数据到组件数据结构
    const typeMap = {
      '应急专家': 'expert',
      '医疗队伍': 'medical',
      '避难场所': 'shelter',
      '救援队伍': 'rescue-team',
      '救援人员': 'rescue-personnel',
      '救援仓库': 'rescue-warehouse',
      '救援车辆': 'rescue-vehicle'  // 用于车辆统计
    };

    // 更新资源统计数据
    data.forEach(item => {
      const type = typeMap[item.name];
      if (type) {
        // 更新普通资源统计
        if (type !== 'rescue-vehicle') {
          const stat = resourceStats.value.find(s => s.type === type);
          if (stat) {
            stat.count = item.count;
          }
        }
        // 特殊处理救援车辆
        else {
          vehicleCount.value = item.count;
        }
      }
    });
  } catch (error) {
    console.error('获取应急资源数据失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchEmergencyCapacityList();
});
</script>

<style lang="scss" scoped>
.emergency-resource-module {
  flex: 0.7;
  background-image: url("@/assets/img/gasModule/emergency_resource_bg.webp");

  .module-content {
    padding: 12px 20px;
  }

  .emergency-content {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: repeat(3, 1fr);
    row-gap: 8px;
    column-gap: 30px;
    align-items: center;
    position: relative;
    background: url("@/assets/img/gasModule/emergency_list.webp") no-repeat center center;
    background-size: contain;
    background-position: center;
    height: 220px;
    padding: 20px 0;
  }

  // 资源统计卡片
  .resource-stats {
    display: contents;
  }

  .resource-stat-card {
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;

    .stat-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &.resource-left {
      justify-self: flex-start;
      padding-left: 10px;
    }

    &.resource-right {
      flex-direction: row-reverse;
      justify-self: flex-end;
      padding-right: 10px;

      .stat-info {
        background-image: url("@/assets/img/gasModule/resource_right.webp");
        flex-direction: row-reverse;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 32px;
      min-width: 160px;
      padding: 0 12px;
      justify-content: space-between;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      gap: 4px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      background-image: url("@/assets/img/gasModule/resource_left.webp");

      .stat-label {
        font-weight: 400;
        font-size: 16px;
        color: #B8D8FF;
        white-space: nowrap;
      }

      .stat-value {
        font-weight: 500;
        font-size: 18px;
        color: #FFFFFF;
        white-space: nowrap;
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

  // 中心应急资源圆环
  .center-resource {
    grid-column: 2;
    grid-row: 1 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;

    .center-ring {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ring-text {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 26px;
      color: #FF6B6D;
      line-height: 36px;
      text-align: center;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(255, 107, 109, 0.8),
                   0 0 20px rgba(255, 107, 109, 0.5);
    }
  }

  // 底部车辆统计
  .resource-vehicle {
    grid-column: 2;
    grid-row: 3;
    justify-self: center;
    align-self: flex-end;
    margin-bottom: 5px;

    .stat-info {
      min-width: 180px;
    }
  }
}
</style>
