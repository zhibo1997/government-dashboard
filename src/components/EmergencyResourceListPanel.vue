<template>
  <div class="emergency-resource-list-panel" v-show="visible">
    <div class="dialog-header">
      <div class="dialog-title gradient-text">{{ title }}</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" />
      </n-button>
    </div>

    <div class="dialog-content">
      <!-- 数据表格 -->
      <div class="data-table">
        <CommonTable
          :columns="tableColumns"
          :data="tableData"
          row-key="lsh"
          :empty-text="loading ? '加载中...' : '暂无数据'"
          :max-height="400"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBottomPanelStore } from '@/stores/bottomPanelStore';
import { Close } from "@vicons/ionicons5";
import { NButton, NIcon } from "naive-ui";
import CommonTable from '@/components/CommonTable.vue';
import {
  getEmergencySpecialistList,
  getTeamInformationList,
  getTeamPersonList,
  getEmergencyVehiclesList,
} from "@/services/commonService";

const bottomPanelStore = useBottomPanelStore();

const visible = computed(() => {
  return bottomPanelStore.activePanel?.startsWith('emergency-') || false;
});

// 标题映射
const titleMap: Record<string, string> = {
  'emergency-expert': '应急专家列表',
  'emergency-team': '救援队伍列表',
  'emergency-personnel': '救援人员列表',
  'emergency-vehicle': '救援车辆列表',
};

const title = computed(() => {
  return titleMap[bottomPanelStore.activePanel || ''] || '列表';
});

// 列配置映射
const columnsMap: Record<string, any[]> = {
  'emergency-expert': [
    { key: 'index', title: '序号', width: '60px' },
    { key: 'xm', title: '姓名', width: '1fr' },
    { key: 'zyjstc', title: '专业特长', width: '1.5fr' },
    { key: 'gzdw', title: '工作单位', width: '1.5fr' },
    { key: 'dwdz', title: '单位地址', width: '2fr' },
  ],
  'emergency-team': [
    { key: 'index', title: '序号', width: '60px' },
    { key: 'dwmc', title: '单位名称', width: '1.5fr' },
    { key: 'dwlx', title: '单位类型', width: '1fr' },
    { key: 'dwgm', title: '单位规模', width: '80px' },
    { key: 'lsdw', title: '隶属单位', width: '1.5fr' },
  ],
  'emergency-personnel': [
    { key: 'index', title: '序号', width: '60px' },
    { key: 'ryxm', title: '姓名', width: '1fr' },
    { key: 'ssdw', title: '所属单位', width: '1.5fr' },
    { key: 'zw', title: '职务', width: '1fr' },
    { key: 'zytc', title: '专业特长', width: '1fr' },
    { key: 'rydh', title: '联系电话', width: '1fr' },
  ],
  'emergency-vehicle': [
    { key: 'index', title: '序号', width: '60px' },
    { key: 'mc', title: '名称', width: '1fr' },
    { key: 'lx', title: '类型', width: '1fr' },
    { key: 'cph', title: '车牌号', width: '1fr' },
    { key: 'jyclssdw', title: '所属单位', width: '1.5fr' },
    { key: 'fzrxm', title: '负责人', width: '1fr' },
  ],
};

const tableColumns = computed(() => {
  return columnsMap[bottomPanelStore.activePanel || ''] || [];
});

// API 映射
const apiMap: Record<string, () => Promise<any>> = {
  'emergency-expert': getEmergencySpecialistList,
  'emergency-team': getTeamInformationList,
  'emergency-personnel': getTeamPersonList,
  'emergency-vehicle': getEmergencyVehiclesList,
};

const loading = ref(false);
const tableData = ref<any[]>([]);

// 获取数据
const fetchData = async () => {
  const api = apiMap[bottomPanelStore.activePanel || ''];
  if (!api) return;

  loading.value = true;
  try {
    const data = await api();
    tableData.value = (Array.isArray(data) ? data : []).map((item: any, index: number) => ({
      ...item,
      index: index + 1,
    }));
  } catch (error) {
    console.error('获取数据失败:', error);
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听面板类型变化
watch(() => bottomPanelStore.activePanel, (val) => {
  if (val?.startsWith('emergency-')) {
    fetchData();
  }
});

const handleClose = () => {
  bottomPanelStore.hidePanel();
};
</script>

<style lang="scss" scoped>
.emergency-resource-list-panel {
  position: absolute;
  bottom: 0;
  left: var(--bottom-panel-left, 1320px);
  width: var(--bottom-panel-width, 1920px);
  max-height: 50vh;
  z-index: 200;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  background: rgba(5, 23, 40, 0.85);

  .dialog-header {
    height: 60px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-image: url("@/assets/img/gasModule/detail_head_bg.webp");
    border-bottom: 2px solid rgba(13, 165, 190, 0.5);
    background-size: 100% 100%;
    flex-shrink: 0;

    .dialog-title {
      font-family: YouSheBiaoTiHei;
      font-size: var(--font-size-subtitle);
      color: #FFFFFF;
      line-height: 48px;
      text-align: left;
      font-style: normal;
      background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
    }
  }

  .dialog-content {
    flex: 1;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(270deg, rgba(8, 46, 77, 0.4) 0%, rgba(0, 0, 0, 0.45) 99.92%);

    .data-table {
      flex: 1;
      overflow: auto;
    }
  }
}
</style>
