<template>
  <div class="data-module emergency-resource-module">
    <div class="module-header"><div class="module-title">应急资源</div></div>
    <div class="module-content">
      <div class="emergency-content">
        <!-- 资源统计 -->
        <div class="resource-stats">
          <div class="resource-stat-card" v-for="(item, idx) in resourceStats" :key="item.type"
            :class="[`resource-${item.type}`, `resource-${idx > 2 ? 'right' : 'left'}`, { active: selectedType === item.type }]"
            @click="handleItemClick(item)">
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
        <div class="resource-stat-card resource-vehicle" :class="{ active: selectedType === 'rescue-vehicle' }"
          @click="handleVehicleClick">
          <span class="stat-label">救援车辆：</span>
          <div class="stat-info">
            <img :src="rescueVehicleIcon" alt="救援车辆" />
            <span class="stat-value">{{ vehicleCount }}辆</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 点位详情弹窗 -->
  <EmergencyPointPopup
    :visible="popupVisible"
    :point-data="popupData"
    :point-type="selectedType || ''"
    @close="closePopup"
  />
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { getEmergencyCapacityList } from "@/services/commonService";
import {
  getWarehouseCoordinateList,
  getWarehouseDetail,
} from "@/services/commonService";
import { useGasOverviewPoints } from "@/hook/useGasOverviewPoints";
import { useBottomPanelStore } from "@/stores/bottomPanelStore";
import EmergencyPointPopup from "@/views/GasModule/components/GasPointPopup.vue";
import expertIcon from "@/assets/img/gasModule/expert.webp";
import medicalIcon from "@/assets/img/gasModule/medical.webp";
import shelterIcon from "@/assets/img/gasModule/shelter.webp";
import rescueTeamIcon from "@/assets/img/gasModule/rescue_team.webp";
import rescuePersonnelIcon from "@/assets/img/gasModule/rescue_personnel.webp";
import rescueWarehouseIcon from "@/assets/img/gasModule/rescue_warehouse.webp";
import rescueVehicleIcon from "@/assets/img/gasModule/rescue_vehicle.webp";

// 获取模块配置（供水/排水/燃气等）
const moduleConfig = inject('MODULE_CONFIG', { sszx: 'csaqzx_rq' });

// 地图点位管理
const { init: initMapPoints, addPoints, clearPoints } = useGasOverviewPoints();

// 底部面板
const bottomPanelStore = useBottomPanelStore();

// 弹窗状态
const popupVisible = ref(false);
const popupData = ref(null);
const selectedType = ref(null);

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
  { type: "rescue-personnel", label: "救援人员", count: "0", icon: rescuePersonnelIcon, unit: "人" },
  { type: "rescue-warehouse", label: "救援仓库", count: "0", icon: rescueWarehouseIcon, unit: "个" },
]);

// 点位展示类型（仅救援仓库）
const pointType = 'rescue-warehouse';

// 底部面板类型映射：type -> bottomPanelType
const panelTypeMap = {
  'expert': 'emergency-expert',
  'rescue-team': 'emergency-team',
  'rescue-personnel': 'emergency-personnel',
  'rescue-vehicle': 'emergency-vehicle',
};

// 接口映射：type -> 详情API
const detailApiMap = {
  'rescue-warehouse': getWarehouseDetail,
};

// 关闭弹窗
const closePopup = () => {
  popupVisible.value = false;
  popupData.value = null;
};

// 点击地图点位回调
const handlePointClick = async (point) => {
  const detailApi = detailApiMap[selectedType.value];
  if (detailApi) {
    try {
      const detail = await detailApi(point.lsh);
      popupData.value = detail;
      popupVisible.value = true;
    } catch (error) {
      console.error('获取详情失败:', error);
    }
  }
};

// 点击资源卡片
const handleItemClick = async (item) => {
  if (selectedType.value === item.type) {
    selectedType.value = null;
    clearPoints();
    closePopup();
    bottomPanelStore.hidePanel();
    return;
  }

  selectedType.value = item.type;
  closePopup();
  clearPoints();

  // 救援仓库展示点位
  if (item.type === pointType) {
    try {
      const data = await getWarehouseCoordinateList();
      if (Array.isArray(data) && data.length > 0) {
        const points = data.map(p => ({
          lsh: p.lsh,
          jd: p.jd,
          wd: p.wd,
          name: p.name || p.lsh,
        }));
        addPoints(points, item.label, handlePointClick);
      }
    } catch (error) {
      console.error(`获取${item.label}点位失败:`, error);
    }
    return;
  }

  // 其余打开底部面板展示列表
  if (panelTypeMap[item.type]) {
    bottomPanelStore.showPanel(panelTypeMap[item.type]);
  }
};

// 点击救援车辆
const handleVehicleClick = async () => {
  handleItemClick({ type: 'rescue-vehicle', label: '救援车辆' });
};

// 获取应急资源数据
const fetchEmergencyCapacityList = async () => {
  try {
    const data = await getEmergencyCapacityList({ Sszx: moduleConfig.sszx });

    const typeMap = {
      应急专家: "expert",
      医疗队伍: "medical",
      避难场所: "shelter",
      救援队伍: "rescue-team",
      救援人员: "rescue-personnel",
      救援仓库: "rescue-warehouse",
      救援车辆: "rescue-vehicle",
    };

    data.forEach((item) => {
      const type = typeMap[item.name];
      if (type) {
        if (type !== "rescue-vehicle") {
          const stat = resourceStats.value.find((s) => s.type === type);
          if (stat) {
            stat.count = item.count;
          }
        } else {
          vehicleCount.value = item.count;
        }
      }
    });
  } catch (error) {
    console.error("获取应急资源数据失败:", error);
  }
};

onMounted(async () => {
  await initMapPoints();
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
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 8px;
    border-radius: 8px;

    &:hover {
      background: rgba(13, 165, 190, 0.1);
    }

    &.active {
      background: rgba(13, 165, 190, 0.2);
      box-shadow: inset 0 0 0 2px #0da5be, 0 0 12px rgba(13, 165, 190, 0.3);
    }

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
