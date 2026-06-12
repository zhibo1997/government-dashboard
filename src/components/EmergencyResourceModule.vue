<template>
  <div class="data-module emergency-resource-module">
    <div class="module-header"><div class="module-title">应急资源</div></div>
    <div class="module-content">
      <div class="emergency-content">
        <!-- 资源统计 -->
        <div class="resource-stats">
          <div class="resource-stat-card" v-for="(item, idx) in resourceStats" :key="item.type"
            :class="`resource-${item.type}  resource-${idx > 2 ? 'right' : 'left'}`">
            <span class="stat-label">{{ item.label }}</span>
            <div class="stat-info">
              <img :src="item.icon" :alt="item.label" />
              <span class="stat-value">{{ item.count }}{{ item.unit }}</span>
            </div>
          </div>
        </div>

        <!-- 中心应急资源圆环 -->
        <div class="center-resource">
          <span class="ring-text">应急<br />资源</span>
        </div>

        <!-- 底部车辆统计 -->
        <div class="resource-stat-card resource-vehicle">
          <span class="stat-label">救援车辆：</span>
          <div class="stat-info">
            <img :src="rescueVehicleIcon" alt="救援车辆" />
            <span class="stat-value">{{ vehicleCount }}辆</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { getEmergencyCapacityList } from "@/services/commonService";

// 获取模块配置（供水/排水/燃气等）
const moduleConfig = inject('MODULE_CONFIG', { sszx: 'csaqzx_rq' });
import expertIcon from "@/assets/img/gasModule/expert.webp";
import medicalIcon from "@/assets/img/gasModule/medical.webp";
import shelterIcon from "@/assets/img/gasModule/shelter.webp";
import rescueTeamIcon from "@/assets/img/gasModule/rescue_team.webp";
import rescuePersonnelIcon from "@/assets/img/gasModule/rescue_personnel.webp";
import rescueWarehouseIcon from "@/assets/img/gasModule/rescue_warehouse.webp";
import rescueVehicleIcon from "@/assets/img/gasModule/rescue_vehicle.webp";

// 救援车辆数量
const vehicleCount = ref("0");

// 资源统计（根据设计图布局：左侧3个，右侧3个）
const resourceStats = ref([
  // 左侧
  { type: "expert", label: "应急专家", count: "0", icon: expertIcon, unit: "人" },
  { type: "medical", label: "医疗队伍", count: "0", icon: medicalIcon, unit: "支" },
  { type: "shelter", label: "避难场所", count: "0", icon: shelterIcon, unit: "处" },
  // 右侧
  { type: "rescue-team", label: "救援队伍", count: "0", icon: rescueTeamIcon, unit: "支" },
  {
    type: "rescue-personnel",
    label: "救援人员",
    count: "0",
    icon: rescuePersonnelIcon,
    unit: "人",
  },
  {
    type: "rescue-warehouse",
    label: "救援仓库",
    count: "0",
    icon: rescueWarehouseIcon,
    unit: "个",
  },
]);

// 获取应急资源数据
const fetchEmergencyCapacityList = async () => {
  try {
    const data = await getEmergencyCapacityList({ Sszx: moduleConfig.sszx });

    // 映射接口数据到组件数据结构
    const typeMap = {
      应急专家: "expert",
      医疗队伍: "medical",
      避难场所: "shelter",
      救援队伍: "rescue-team",
      救援人员: "rescue-personnel",
      救援仓库: "rescue-warehouse",
      救援车辆: "rescue-vehicle", // 用于车辆统计
    };

    // 更新资源统计数据
    data.forEach((item) => {
      const type = typeMap[item.name];
      if (type) {
        // 更新普通资源统计
        if (type !== "rescue-vehicle") {
          const stat = resourceStats.value.find((s) => s.type === type);
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
    console.error("获取应急资源数据失败:", error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchEmergencyCapacityList();
});
</script>

<style lang="scss" scoped>
.module-content{
  padding: 0 30px 15px;
  display: flex;
  justify-content: center;
}
.emergency-resource-module {
  flex: 1;

  .emergency-content {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: repeat(3, 1fr);
    // column-gap: 30px;
    align-items: center;
    position: relative;
    background: url("@/assets/img/gasModule/emergency_list.webp") no-repeat center center;
    background-size: contain;
    background-position: center;
    height: 80%;
    width: 100%;
  }

  // 资源统计卡片
  .resource-stats {
    display: contents;
  }

  .resource-stat-card {
    display: flex;
    align-items: center;
    flex-direction: column;
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
      justify-self: flex-end;
      padding-right: 10px;

      .stat-info {
        background-image: url("@/assets/img/gasModule/resource_right.webp");
        flex-direction: row-reverse;
      }
    }

    .stat-label {
      font-weight: var(--font-weight-normal);
      font-size: var(--font-size-subtitle);
      color: #E4F3FF;
      white-space: nowrap;
    }

    .stat-info {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 42px;
      min-width: 142px;
      padding: 0 20px;
      justify-content: space-between;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      gap: 4px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      background-image: url("@/assets/img/gasModule/resource_left.webp");

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .stat-value {
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-subtitle);
        color: #ffffff;
        white-space: nowrap;
        
      }
    }

    // 左侧3个卡片
    &.resource-expert {
      grid-column: 1;
      grid-row: 1;
      margin-left: 69px;
    }

    &.resource-medical {
      grid-column: 1;
      grid-row: 2;
      margin-left: 33px;
    }

    &.resource-shelter {
      grid-column: 1;
      grid-row: 3;
      margin-left: 69px;
    }

    // 右侧3个卡片
    &.resource-rescue-team {
      grid-column: 3;
      grid-row: 1;
      margin-right: 69px;
    }

    &.resource-rescue-personnel {
      grid-column: 3;
      grid-row: 2;
      margin-right: 33px;
    }

    &.resource-rescue-warehouse {
      grid-column: 3;
      grid-row: 3;
      margin-right: 69px;
    }
  }

  // 中心应急资源圆环
  .center-resource {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    position: relative;
    top: calc(50% + 36px);
    .ring-text {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-heading);
      color: #effaff;
      line-height: calc(var(--font-size-heading) * 1.321);
      text-align: center;
      font-style: normal;
    }
  }

  // 底部车辆统计
  .resource-vehicle {
    position: absolute;
    bottom: 0px;
    justify-self: center;
    margin-bottom: 5px;

    .stat-info {
      min-width: 142px;
    }
  }
}
</style>
