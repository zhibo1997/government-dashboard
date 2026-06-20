<template>
  <div class="drain-flood-list-panel" :class="{ collapsed: isCollapsed }">
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
          <span class="title-text">易涝点</span>
        </div>
        <img src="@/assets/img/gasModule/icon_close.webp" class="panel-close" alt="" @click="closePanel" />
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-row search-row">
          <div class="filter-item search-item">
            <input v-model="filters.jsdmc" type="text" class="filter-input" placeholder="请输入名称" />
          </div>
          <button class="reset-btn" @click="resetFilters">重置</button>
        </div>
        <div class="filter-item filter-item-select">
          <n-select
            v-model:value="filters.zgzt"
            :options="zgztOptions"
            placeholder="整改状态"
            :consistent-menu-width="false"
            class="filter-select"
          />
        </div>
      </div>
    </div>

    <div class="panel-content station-list-section" :class="{ hidden: isCollapsed }">
      <!-- 主标题 -->
      <div class="panel-title">
        <div class="title-container">
          <span class="title-text">共{{ totalRecords }}条记录</span>
        </div>
      </div>
      <!-- 列表 -->
      <div class="list-section">
        <div class="list-content">
          <div class="flood-item" v-for="item in currentPageData" :key="item.lsh"
            :class="{ active: item.lsh === activeId }" @click="handleItemClick(item)">
            <div class="flood-badges">
              <span class="badge badge-type">{{ getZgztName(item.zgzt) }}</span>
            </div>
            <div class="flood-name">{{ item.jsdmc }}</div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">‹</button>
          <button v-for="page in visiblePages" :key="page" class="page-btn" :class="{ active: page === currentPage }"
            @click="goToPage(page)">
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
import { getDrainFloodPage } from "@/services/waterSupplyService";
import { ref, computed, onMounted, watch } from "vue";
import { getCachedDictionary } from "@/services/dictionaryService";
import { NSelect } from "naive-ui";

const zgztDict = ref<any[]>([]);

const zgztOptions = computed(() => {
  return [
    { label: '整改状态', value: '' },
    ...zgztDict.value.map((item) => ({ label: item.f_ItemName, value: item.f_ItemValue }))
  ];
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:visible", "item-click", "collapsed-change"]);

const isCollapsed = ref(true);

// 折叠状态变化时通知父组件
watch(isCollapsed, (val) => {
  emit("collapsed-change", val);
});

const filters = ref({
  jsdmc: "",
  zgzt: "",
});

watch([() => filters.value.jsdmc, () => filters.value.zgzt], () => {
  currentPage.value = 1;
  loadData();
}, { deep: true });

const resetFilters = () => {
  filters.value.jsdmc = "";
  filters.value.zgzt = "";
  currentPage.value = 1;
  loadData();
};

const getZgztName = (zgzt: string) => {
  const item = zgztDict.value.find((d: any) => d.f_ItemValue === zgzt);
  return item?.f_ItemName || zgzt || '—';
};

const loadData = async () => {
  try {
    const params: any = {
      page: currentPage.value.toString(),
      rows: pageSize.value.toString(),
    };
    if (filters.value.jsdmc) {
      params.jsdmc = filters.value.jsdmc;
    }
    if (filters.value.zgzt) {
      params.zgzt = filters.value.zgzt;
    }

    const res: any = await getDrainFloodPage(params);

    if (res && res.rows && Array.isArray(res.rows)) {
      listData.value = res.rows;
      totalRecords.value = res.records || 0;
    } else {
      listData.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error("加载易涝点数据失败:", error);
    listData.value = [];
    totalRecords.value = 0;
  }
};

onMounted(async () => {
  const dict = await getCachedDictionary("zgzt");
  zgztDict.value = dict || [];
  loadData();
});

const activeId = ref('');

const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

const listData = ref<any[]>([]);

const currentPageData = computed(() => listData.value);

const totalPages = computed(() => {
  return Math.ceil(totalRecords.value / pageSize.value);
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= Math.min(6, totalPages.value); i++) {
    pages.push(i);
  }
  return pages;
});

const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 关闭面板
const closePanel = () => {
  isCollapsed.value = true;
  emit("update:visible", false);
};

const toggleSearch = () => {};

const handleItemClick = (item: any) => {
  activeId.value = item.lsh;
  emit("item-click", item);
};

const goToPage = (page: number) => {
  if (page !== currentPage.value && page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadData();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadData();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadData();
  }
};
</script>

<style lang="scss" scoped>
.panel-content {
  background: linear-gradient(270deg, #021F37 0%, #02111D 99.92%);
  box-shadow: -34px 0px 17px 0px rgba(4, 17, 38, 0.4), 34px 9px 17px 0px rgba(4, 17, 38, 0.4);
  border: 2px solid;
  border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(12, 93, 117, 0.24), rgba(8, 189, 243, 0.04), rgba(0, 28, 38, 0), rgba(8, 97, 132, 0), rgba(17, 171, 233, 1)) 2 2;
  backdrop-filter: blur(20px);

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

.drain-flood-list-panel {
  position: absolute;
  left: 860px;
  width: 460px;
  height: 100%;
  border-radius: 8px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;

  &.collapsed {
    pointer-events: none;
  }

  .panel-header {
    padding: 12px 0;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    flex-shrink: 0;
    pointer-events: auto;

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
        font-size: var(--font-size-heading);
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

    .title-container {
      display: flex;
      align-items: baseline;

      .title-text {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-subtitle);
        color: #FFFFFF;
        line-height: calc(var(--font-size-heading) * 1.467);
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
          font-size: var(--font-size-body);
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
        font-size: var(--font-size-heading);
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
          font-size: var(--font-size-heading);
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
          --n-font-size: var(--font-size-heading) !important;
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

      .flood-item {
        padding: 20px;
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

        .flood-badges {
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
          font-size: var(--font-size-caption);
          line-height: calc(var(--font-size-caption) * 1.45);

          &.badge-type {
            background: #313D56;
            border-radius: 8px;
            border: 2px solid #15779D;
            color: #E4F3FF;
            line-height: calc(var(--font-size-caption) * 1.45);
          }
        }

        .flood-name {
          font-family: SourceHanSansCNVF, SourceHanSansCNVF;
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-heading);
          color: #E4F3FF;
          line-height: calc(var(--font-size-heading) * 1.467);
          text-align: left;
          font-style: normal;
        }

        .flood-info {
          font-family: SourceHanSansCNVF, SourceHanSansCNVF;
          font-weight: var(--font-weight-normal);
          font-size: var(--font-size-heading);
          color: #BFC5C0;
          line-height: calc(var(--font-size-caption) * 1.444);
          text-align: left;
          font-style: normal;
          margin-top: 8px;
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
        font-size: var(--font-size-body);
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
        font-weight: var(--font-weight-normal);
        font-size: var(--font-size-body);
        color: #FFFFFF;
        line-height: 1.4;
      }
    }
  }
}
</style>
