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
          <span class="title-text">燃气企业</span>
          <img src="@/assets/img/gasModule/pull_down.webp" class="pull-down-icon" alt="" />
        </div>
        <img src="@/assets/img/gasModule/icon_close.webp" class="panel-close" alt="" />
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <!-- 名称搜索 -->
        <div class="filter-row search-row">
          <div class="filter-item search-item">
            <input v-model="searchKeyword" type="text" class="filter-input" placeholder="请输入燃气厂站名称" />
          </div>
          <button class="reset-btn" @click="resetFilters">重置</button>
        </div>


        <!-- 燃气类型 -->
        <div class="filter-item filter-item-select">
          <n-select
            v-model:value="filters.type"
            :options="gasTypeOptions"
            class="filter-select"
          />
        </div>
      </div>
    </div>

    <div class="panel-content" :class="{ hidden: isCollapsed }">

      <!-- 主标题 -->
      <div class="panel-title">
        <div class="title-container">
          <span class="title-text">共{{ total }}条记录</span>
        </div>
      </div>
      <!-- 企业列表 -->
      <div class="list-section">
        <div class="list-content">
          <div class="station-item" v-for="station in stations" :key="station.lsh"
            :class="{ active: station.lsh === activeStationId }" @click="handleStationClick(station)">
            <div class="station-badges">
              <span class="badge badge-type">{{ getStationType(station.rqlx) }}</span>
            </div>
            <div class="station-name">{{ station.qymc }}</div>
            <div class="station-address">{{ station.xxdz }}</div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">‹</button>
          <button v-for="page in visiblePages" :key="page" class="page-btn" :class="{ active: page === currentPage }"
            @click="currentPage = page">
            {{ page }}
          </button>
          <button class="page-btn page-more" v-if="totalPages > 6">...</button>
          <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">›</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getGasEnterprisePageList, getGasEnterpriseLedgerDetail, getBottleGasEnterpriseLedgerDetail, getGasUserPageList, getGasStationPageList } from "@/services/gasService";
import { ref, computed, onMounted, watch } from "vue";
import { NSelect } from "naive-ui";

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:visible", "station-click"]);

// 面板折叠状态
const isCollapsed = ref(false);
const showSearch = ref(false);

// 搜索关键词
const searchKeyword = ref("");

// 筛选条件
const filters = ref({
  company: "",
  type: "rqlx001",
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

// 监听筛选条件变化
watch([searchKeyword, () => filters.value.type], () => {
  currentPage.value = 1;
  loadStations();
}, { deep: true });

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = "";
  filters.value.company = "";
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

// 加载场站数据
const loadStations = async () => {
  try {
    const response: any = await getGasEnterprisePageList({
      page: currentPage.value.toString(),
      rows: pageSize.value.toString(),
      rqlx: filters.value.type,
      qymc: searchKeyword.value
    });
    if (response && response.rows) {
      stations.value = response.rows || [];
      total.value = response.records || 0;
    }
  } catch (error) {
    console.error("加载场站数据失败:", error);
  }
}

onMounted(() => {
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
  return Math.ceil(stations.value.length / pageSize.value);
});

// 可见页码
const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= Math.min(6, totalPages.value); i++) {
    pages.push(i);
  }
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

// 翻页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}
</script>

<style lang="scss" scoped>
.panel-content {
  margin-bottom: 20px;

  &.hidden {
    display: none;
  }
}

.station-list-panel {
  position: absolute;
  left: 840px;
  width: 460px;
  height: calc(100% - 40px);
  border-radius: 8px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
    padding: 12px 15px;
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
      width: 180px;
      background-image: url("@/assets/img/gasModule/icon_menu_bg.webp");

      cursor: pointer;

      .text {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 500;
        font-size: 20px;
        color: #3fffff;
        letter-spacing: 1px;
        text-align: center;
        font-style: normal;
        margin-left: 8px;
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

    .title-container {
      display: flex;
      align-items: baseline;

      .pull-down-icon {
        width: 16px;
        height: 9px;
      }

      .title-text {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 500;
        font-size: 30px;
        color: #FFFFFF;
        line-height: 44px;
        text-align: center;
        font-style: normal;
        margin-right: 18px;
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
    background: linear-gradient(270deg, rgb(8, 46, 77, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%);
    border-bottom: 1px solid rgba(0, 255, 255, 0.15);
    flex-shrink: 0;
    backdrop-filter: blur(30px);
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
          font-weight: 500;
          font-size: 26px;
          color: #FFFFFF;
          line-height: 37px;
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

        font-size: 16px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 24px;
        line-height: 35px;
        text-align: left;
        font-style: normal;
        color: #ffffff;
        background-color: transparent;
        outline: none;
        border: none;

        &::placeholder {
          font-size: 24px;
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
          --n-font-size: 24px !important;
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
    height: 1160px;
    overflow: hidden;
    padding: 0;

    .list-header {
      padding: 20px 15px 12px;
      display: flex;
      align-items: center;

      .count-text {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 20px;
        color: #FFFFFF;
        line-height: 29px;
      }
    }

    .list-content {
      flex: 1;
      overflow-y: auto;

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
        padding: 20px 19px 22px;
        border-bottom: 2px solid #09739C;

        background: rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: all 0.2s ease;

        &:last-child {
          border-bottom: none;
        }

        .station-badges {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .badge {
          padding: 6px 16px;
          border-radius: 8px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 500;
          font-size: 20px;
          line-height: 29px;

          &.badge-type {
            background: #313D56;
            border-radius: 8px;
            border: 2px solid #15779D;

            color: #E4F3FF;
            line-height: 29px;
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
          font-weight: 500;
          font-size: 30px;
          color: #E4F3FF;
          line-height: 44px;
          text-align: left;
          font-style: normal;
        }

        .station-address {
          font-family: SourceHanSansCNVF, SourceHanSansCNVF;
          font-weight: 400;
          font-size: 18px;
          color: #BFC5C0;
          line-height: 26px;
          text-align: left;
          font-style: normal;

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
        min-width: 40px;
        height: 40px;
        padding: 0 8px;
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid #11A7E2;
        border-radius: 6px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 20px;
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

      .page-info {
        margin-left: 8px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 20px;
        color: #FFFFFF;
        line-height: 29px;
      }
    }
  }
}
</style>