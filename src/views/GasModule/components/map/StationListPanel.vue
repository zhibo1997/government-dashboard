<template>
  <div class="station-list-panel">
    <!-- 头部工具栏 -->
    <div class="panel-header">
      <button class="search-icon-btn btn" @click="toggleSearch">
        <img src="@/assets/img/gasModule/icon_search.webp" class="icon" alt="" />
      </button>
      <button class="toggle-btn btn" @click="togglePanel">
        <img src="@/assets/img/gasModule/icon_menu.webp" class="icon" alt="" />
        <span class="text">{{ isCollapsed ? '展开侧边栏' : '收起侧边栏' }}</span>
      </button>
    </div>
    <div class="panel-content" :class="{ hidden: isCollapsed }">
      <!-- 主标题 -->
      <div class="panel-title">
        <div class="title-container">
          <div class="title-dropdown" @click="toggleTitleMenu">
            <span class="title-text">{{ currentTitle }}</span>
            <img
              src="@/assets/img/gasModule/pull_down.webp"
              class="pull-down-icon"
              :class="{ rotated: showTitleMenu }"
              alt=""
            />
          </div>
          <div class="title-menu" v-if="showTitleMenu">
            <div
              class="title-menu-item"
              :class="{ active: currentTitle === item.label }"
              v-for="item in titleOptions"
              :key="item.value"
              @click.stop="selectTitle(item)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <img src="@/assets/img/gasModule/icon_close.webp" class="panel-close" alt="" />
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <!-- 名称搜索 -->
        <div class="filter-row search-row">
          <div class="filter-item search-item">
            <input v-model="searchKeyword" type="text" class="filter-input" :placeholder="listMode === 'monitor' ? '请输入设备名称' : '请输入名称'" />
          </div>
          <button class="reset-btn" @click="resetFilters">重置</button>
        </div>

        <!-- 燃气类型（仅企业模式显示） -->
        <div class="filter-item filter-item-select" v-if="listMode === 'enterprise'">
          <n-select
            v-model:value="filters.type"
            :options="gasTypeOptions"
            class="filter-select"
          />
        </div>

        <!-- 设备类型（仅监测设备模式显示） -->
        <div class="filter-item filter-item-select" v-if="listMode === 'monitor'">
          <n-select
            v-model:value="filters.sblx"
            :options="sblxOptions"
            placeholder="全部设备类型"
            clearable
            class="filter-select"
          />
        </div>
      </div>
    </div>

    <div class="panel-content station-list-section" :class="{ hidden: isCollapsed }">

      <!-- 主标题 -->
      <div class="panel-title">
        <div class="title-container">
          <span class="title-text">共{{ total }}条记录</span>
        </div>
      </div>
      <!-- 企业列表 -->
      <div class="list-section">
        <div class="list-content">
          <!-- 燃气企业列表 -->
          <template v-if="listMode === 'enterprise'">
            <div class="station-item" v-for="station in stations" :key="station.lsh"
              :class="{ active: station.lsh === activeStationId }" @click="handleStationClick(station)">
              <div class="station-badges">
                <span class="badge badge-type">{{ getStationType(station.rqlx) }}</span>
              </div>
              <div class="station-name">{{ station.qymc || station.czmc }}</div>
              <div class="station-address">{{ station.xxdz }}</div>
            </div>
          </template>
          <!-- 监测设备列表 -->
          <template v-else>
            <div class="station-item" v-for="item in stations" :key="item.lsh"
              :class="{ active: item.lsh === activeStationId }" @click="handleEquipmentClick(item)">
              <div class="station-badges">
                <span class="badge badge-type">{{ getSblxName(item.sblx) }}</span>
                <span class="badge badge-status" :class="item.sbyxzt === 'sbyxzt001' ? 'badge-normal' : 'badge-error'">
                  {{ item.sbyxzt === 'sbyxzt001' ? '正常' : '异常' }}
                </span>
              </div>
              <div class="station-name">{{ item.sbmc }}</div>
              <div class="station-address">{{ item.sbbh }}</div>
            </div>
          </template>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">‹</button>
          <template v-for="page in visiblePages" :key="page">
            <span v-if="page < 0" class="page-ellipsis">...</span>
            <button v-else class="page-btn" :class="{ active: page === currentPage }"
              @click="goToPage(page)">
              {{ page }}
            </button>
          </template>
          <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">›</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getGasEnterprisePageList, getGasEnterpriseLedgerDetail, getBottleGasEnterpriseLedgerDetail, getGasUserPageList, getGasStationPageList, getEquipmentPageList } from "@/services/gasService";
import { getCachedDictionary } from "@/services/dictionaryService";
import { ref, computed, onMounted, watch, inject, type Ref } from "vue";
import { NSelect } from "naive-ui";

// 监测设备模块点击回调
const switchToMonitorMode = inject<Ref<(() => void) | null>>('switchToMonitorMode', ref(null));

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:visible", "station-click", "equipment-click"]);

// 面板折叠状态
const isCollapsed = ref(true);
const showSearch = ref(false);

// 标题下拉切换
const showTitleMenu = ref(false);
const currentTitle = ref('燃气企业');
const titleOptions = [
  { label: '燃气企业', value: 'enterprise' },
  { label: '监测设备', value: 'monitor' },
];

const toggleTitleMenu = () => {
  showTitleMenu.value = !showTitleMenu.value;
};

const selectTitle = (item: { label: string; value: string }) => {
  currentTitle.value = item.label;
  showTitleMenu.value = false;
  currentPage.value = 1;
  searchKeyword.value = "";
  loadStations();
};

// 搜索关键词
const searchKeyword = ref("");

// 筛选条件
const filters = ref({
  company: "",
  type: "rqlx001",
  sblx: null as string | null,
});

// 燃气类型选项
const gasTypeOptions = [
  {
    label: '天然气',
    value: 'rqlx001',
    class: 'type-option'
  },
  {
    label: '液化气',
    value: 'rqlx002',
    class: 'type-option'
  }
];

// 设备类型字典
const sblxDictMap = ref<Record<string, string>>({});
const sblxOptions = ref<{ label: string; value: string }[]>([]);

const getSblxName = (code: string): string => {
  return sblxDictMap.value[code] || code || '未知类型';
};

// 监听筛选条件变化
watch([searchKeyword, () => filters.value.type, () => filters.value.sblx], () => {
  currentPage.value = 1;
  loadStations();
}, { deep: true });

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = "";
  filters.value.company = "";
  filters.value.sblx = null;
  currentPage.value = 1;
  loadStations();
};

// 获取场站类型文本
const getStationType = (rqlx) => {
  const typeMap = {
    'rqlx001': '天然气',
    'rqlx002': '液化气',
  };
  return typeMap[rqlx] || rqlx || '未知类型';
};

// 当前列表模式
const listMode = computed(() => {
  const opt = titleOptions.find(o => o.label === currentTitle.value);
  return opt?.value || 'enterprise';
});

// 加载列表数据
const loadStations = async () => {
  try {
    let response: any;
    if (listMode.value === 'monitor') {
      response = await getEquipmentPageList({
        page: currentPage.value.toString(),
        rows: pageSize.value.toString(),
        sbmc: searchKeyword.value || undefined,
        sblx: filters.value.sblx || undefined,
      });
    } else {
      response = await getGasEnterprisePageList({
        page: currentPage.value.toString(),
        rows: pageSize.value.toString(),
        rqlx: filters.value.type,
        qymc: searchKeyword.value
      });
    }
    if (response && response.rows) {
      stations.value = response.rows || [];
      total.value = response.records || 0;
    }
  } catch (error) {
    console.error("加载数据失败:", error);
  }
}

onMounted(async () => {
  // 注册监测设备模块点击回调
  switchToMonitorMode.value = () => {
    currentTitle.value = '监测设备';
    searchKeyword.value = "";
    currentPage.value = 1;
    isCollapsed.value = false;
    loadStations();
  };

  // 加载设备类型字典
  try {
    const rqDict = await getCachedDictionary("jcsblx_rq");
    const rqzdyhDict = await getCachedDictionary("jcsblx_rqzdyh");
    const allDict = [...(rqDict || []), ...(rqzdyhDict || [])];
    sblxDictMap.value = allDict.reduce((acc: Record<string, string>, cur: any) => {
      acc[cur.f_ItemValue] = cur.f_ItemName;
      return acc;
    }, {});
    sblxOptions.value = allDict.map((item: any) => ({
      label: item.f_ItemName,
      value: item.f_ItemValue,
    }));
  } catch (error) {
    console.error("加载设备类型字典失败:", error);
  }
  loadStations();
});

// 当前激活的场站
const activeStationId = ref(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 场站数据
const stations = ref([]);



// 总页数
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1;
});

// 可见页码（只显示3个：第1页、当前页、最后一页）
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 3) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [1];

  if (current !== 1 && current !== total) {
    pages.push(-1); // 省略号
    pages.push(current);
    pages.push(-2); // 省略号
  } else if (current === 1) {
    pages.push(-2); // 省略号
  } else {
    pages.push(-1); // 省略号
  }

  pages.push(total);
  return pages;
});

// 切换面板显示
const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 切换搜索框
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};


// 处理场站点击
const handleStationClick = async (station) => {
  activeStationId.value = station.lsh;

  try {
    let detailData;
    // 根据燃气类型调用不同的详情接口
    if (station.rqlx === 'rqlx001') {
      // 天然气
      detailData = await getGasEnterpriseLedgerDetail(station.lsh);
    } else if (station.rqlx === 'rqlx002') {
      // 液化气
      detailData = await getBottleGasEnterpriseLedgerDetail(station.lsh);
    }

    // 合并基础数据和详情数据
    const fullStationData = {
      ...station,
      ...detailData,
      gasType: station.rqlx // 保留燃气类型标识
    };

    emit("station-click", fullStationData);
  } catch (error) {
    console.error("获取企业详情失败:", error);
    // 如果详情获取失败，仍然传递基础数据
    emit("station-click", { ...station, gasType: station.rqlx });
  }
};

// 监测设备详情
const handleEquipmentClick = (item: any) => {
  activeStationId.value = item.lsh;
  emit("equipment-click", item);
};

// 翻页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadStations();
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadStations();
  }
}

const goToPage = (page: number) => {
  currentPage.value = page;
  loadStations();
}
</script>

<style lang="scss" scoped>
.panel-content {
  background: linear-gradient(270deg, #021F37 0%, #02111D 99.92%);
  box-shadow: -34px 0px 17px 0px rgba(4, 17, 38, 0.4), 34px 9px 17px 0px rgba(4, 17, 38, 0.4);
  border: 2px solid;
  border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(12, 93, 117, 0.24), rgba(8, 189, 243, 0.04), rgba(0, 28, 38, 0), rgba(8, 97, 132, 0), rgba(17, 171, 233, 1)) 2 2;
  backdrop-filter: blur(20px);
    margin-bottom: 12px;
    overflow: visible;

  &.hidden {
    display: none;
  }
  &.station-list-section {
    flex: 1;
    min-height: 600px;
    display: flex;
    flex-direction: column;
  }
}

.station-list-panel {
  position: absolute;
  left: 860px;
  width: 460px;
  height: 100%;
  // height: calc(100% - 30px);
  border-radius: 8px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: visible;
  pointer-events: auto;

  &.collapsed {
    width: 120px;

    .panel-header {
      flex-direction: column;
      align-items: center;

      .toggle-btn {
        width: 60px;
        padding: 0;
        justify-content: center;
      }

      .text {
        writing-mode: vertical-lr;
        text-orientation: mixed;
        margin: 0;
        font-size: 18px;
      }
    }
  }

  .panel-header {
    padding: 12px 0;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    flex-shrink: 0;

    .icon {
      width: 32px;
      height: 32px;
    }

    .btn {
      border-radius: 8px;
      height: 60px;
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      padding: 0 14px;
      cursor: pointer;
    }

    .search-icon-btn {
      width: 60px;
      background-image: url("@/assets/img/gasModule/icon_search_bg.webp");
    }

    .toggle-btn {
      width: 226px;
      background-image: url("@/assets/img/gasModule/icon_menu_bg.webp");

      cursor: pointer;

      .text {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-3xl);
        color: #3fffff;
        letter-spacing: 1px;
        text-align: center;
        font-style: normal;
        margin-left: 4px;
        margin-bottom: 4px;
      }
    }
  }

  .panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 460px;
    height: 70px;
    background-image: url("@/assets/img/gasModule/panel_title.webp");
    background-size: 100% 100%;
    flex-shrink: 0;
    padding: 0 12px 0 30px;
    overflow: visible;

    .title-container {
      display: flex;
      align-items: baseline;
      position: relative;

      .pull-down-icon {
        width: 16px;
        height: 9px;
      }

      .title-dropdown {
        display: flex;
        align-items: center;
        cursor: pointer;
        position: relative;

        .title-text {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-4xl);
          color: #FFFFFF;
          line-height: calc(var(--font-size-3xl) * 1.467);
          text-align: center;
          font-style: normal;
          margin-right: 10px;
        }

        .pull-down-icon {
          width: 16px;
          height: 9px;
          transition: transform 0.3s ease;

          &.rotated {
            transform: rotate(180deg);
          }
        }
      }

      .title-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 8px;
        background: linear-gradient(180deg, #0A2A3F 0%, #061A28 100%);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        z-index: 200;
        min-width: 180px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

        .title-menu-item {
          padding: 14px 20px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-xl);
          color: #E4F3FF;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(13, 165, 190, 0.3);
          }

          &.active {
            color: #3FFFFF;
            background: rgba(13, 165, 190, 0.2);
          }
        }
      }
    }

    .panel-close {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
  }

  // 公共内容区域样式
  .filter-section,
  .list-section {
    padding: 12px 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: linear-gradient(270deg, rgba(2, 31, 55, 0.6) 0%, rgba(2, 17, 29, 0.6) 99.92%);
    border-bottom: 1px solid rgba(0, 255, 255, 0.15);
  }

  .filter-section {
    flex-shrink: 0;
  }

  .list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
  }

  .filter-section {
    .filter-row {
      display: flex;
      gap: 10px;

      &.search-row {
        align-items: stretch;

        .search-item {
          flex: 1;
        }

        .reset-btn {
          width: 116px;
          height: 60px;
          background: linear-gradient(180deg, #0D9191 0%, #017474 26%, #013D3D 66%, #079090 100%);
          border-radius: 8px;
          border: 2px solid #3FFFFF;
          font-weight: var(--font-weight-medium);
          font-size: 24px;
          color: #FFFFFF;
          line-height: 1.4;
          text-align: center;
          font-style: normal;
          cursor: pointer;

          &:hover {
            background: rgba(0, 160, 200, 0.6);
            border-color: rgba(0, 255, 255, 0.6);
            box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
          }

          &:active {
            background: rgba(0, 100, 140, 0.7);
          }
        }
      }
    }

    .filter-item {
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      overflow: hidden;
      height: 60px;
      border: 2px solid #11A7E2;
      padding: 0 16px;
      background-color: rgba(0, 0, 0, 0.3);

      .filter-input {
        flex: 1;

        font-size: 28px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-normal);
        line-height: 1.4;
        text-align: left;
        font-style: normal;
        color: #ffffff;
        background-color: transparent;
        outline: none;
        border: none;

        &::placeholder {
          font-size: 28px;
          color: #E4F3FF;
        }

        &:focus {
          outline: none;
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
        }
      }

      .filter-select {
        width: 100%;
        :deep(.n-base-selection) {
          --n-height: 60px !important;
          --n-color:transparent !important;
          --n-color-active: transparent !important;
          --n-text-color: #E4F3FF !important;
          --n-font-size: 28px !important;
          --n-padding-single: 0px !important;
          --n-border: none !important;
          --n-border-active: none !important;
          --n-border-focus: none !important;
          --n-border-hover: none !important;
        }
      }
    }
  }

  .list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;

    .list-header {
      padding: 20px 15px 12px;
      display: flex;
      align-items: center;

      .count-text {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-normal);
        font-size: var(--font-size-lg);
        color: #FFFFFF;
        line-height: calc(var(--font-size-lg) * 1.45);
      }
    }

    .list-content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 255, 255, 0.3);
        border-radius: 2px;

        &:hover {
          background: rgba(0, 255, 255, 0.5);
        }
      }

      .station-item {
        padding: 20px 20px 30px;
        border-bottom: 2px solid #09739C;

        background: rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: all 0.2s ease;

        &:last-child {
          border-bottom: none;
        }

        &.active {
          background: rgba(13, 165, 190, 0.2);
          border-left: 4px solid #0da5be;
          padding-left: 15px;
        }
        .station-badges {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .badge {
          padding: 4px 16px;
          border-radius: 8px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-lg);
          line-height: calc(var(--font-size-lg) * 1.45);

          &.badge-type {
            background: #313D56;
            border-radius: 8px;
            border: 2px solid #15779D;

            color: #E4F3FF;
            line-height: calc(var(--font-size-lg) * 1.45);
          }

          &.badge-status {
            border-radius: 8px;

            &.badge-normal {
              background: linear-gradient(90deg, rgba(4, 247, 103, 0.6) 0%, rgba(4, 199, 254, 0.6) 99%);
              border: 2px solid #04C7FE;
              color: #fff;
            }

            &.badge-error {
              color: #fff;
              background: linear-gradient(90deg, rgba(247, 94, 4, 0.6) 0%, rgba(254, 172, 4, 0.6) 100%);
              border: 2px solid #F76204;
              border-image: linear-gradient(180deg, rgba(252, 155, 10, 1), rgba(247, 98, 4, 1)) 2 2;
            }
          }
        }

        .station-name {
          font-family: SourceHanSansCNVF, SourceHanSansCNVF;
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-3xl);
          color: #E4F3FF;
          line-height: calc(var(--font-size-3xl) * 1.467);
          text-align: left;
          font-style: normal;
        }

        .station-address {
          font-family: SourceHanSansCNVF, SourceHanSansCNVF;
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-2xl);
          color: #BFC5C0;
          line-height: calc(var(--font-size-md) * 1.444);
          text-align: left;
          font-style: normal;
          margin-top: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .pagination {
      padding: 20px 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .page-btn {
        min-width: 48px;
        height: 48px;
        padding: 0 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid #11A7E2;
        border-radius: 6px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-normal);
        font-size: 24px;
        color: #FFFFFF;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover:not(:disabled):not(.page-more) {
          background: rgba(17, 167, 226, 0.2);
          box-shadow: 0 0 8px rgba(17, 167, 226, 0.4);
        }

        &.active {
          background: linear-gradient(180deg, #0D9191 0%, #017474 26%, #013D3D 66%, #079090 100%);
          border-color: #3FFFFF;
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        &.page-more {
          cursor: default;
          border-color: transparent;
          background: transparent;
        }
      }

      .page-ellipsis {
        font-size: 24px;
        color: #FFFFFF;
        line-height: 48px;
        padding: 0 4px;
      }

      .page-info {
        margin-left: 8px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-normal);
        font-size: 24px;
        color: #FFFFFF;
        line-height: 1.4;
      }
    }
  }
}
</style>