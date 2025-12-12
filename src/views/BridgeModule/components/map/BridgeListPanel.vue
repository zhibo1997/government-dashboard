<template>
  <div class="bridge-list-panel" >
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
          <span class="title-text">桥梁</span>
          <img src="@/assets/img/gasModule/pull_down.webp" class="pull-down-icon" alt="" />
        </div>
        <img src="@/assets/img/gasModule/icon_close.webp" class="panel-close" alt="" />
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <!-- 名称搜索 -->
        <div class="filter-row search-row">
          <div class="filter-item search-item">
            <input v-model="filters.name" type="text" class="filter-input" placeholder="请输入桥梁名称" />
          </div>
          <button class="reset-btn" @click="resetFilters">重置</button>
        </div>
        <!-- 桥梁结构 -->
        <div class="filter-row">
          <div class="filter-item" style="flex: 1;">
            <select v-model="filters.structure" class="filter-select">
              <option value="">结构</option>
              <option :value="value.value" v-for="value in qljgDict" :key="value.value">{{ value.text }}</option>
            </select>
          </div>
          <!-- 桥梁类型 -->
          <div class="filter-item" style="flex: 1;">
            <select v-model="filters.type" class="filter-select">
              <option value="">类型</option>
              <option :value="value.value" v-for="value in qllxDict" :key="value.value">{{ value.text }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-content" :class="{ hidden: isCollapsed }">
      <!-- 主标题 -->
      <div class="panel-title">
        <div class="title-container">
          <span class="title-text">共{{ totalRecords }}条记录</span>
        </div>
      </div>
      <!-- 桥梁列表 -->
      <div class="list-section">
        <div class="list-content">
          <div class="bridge-item" v-for="bridge in currentPageBridges" :key="bridge.lsh"
            :class="{ active: bridge.lsh === activeBridgeId }" @click="handleBridgeClick(bridge)">
            <div class="bridge-badges">
              <span class="badge badge-type">{{ getBridgeType(bridge.qllx) }}</span>
            </div>
            <div class="bridge-name">{{ bridge.llmc }}</div>
            <div class="bridge-info">{{ bridge.ssdl }}</div>
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
import { getBridgePageList } from "@/services/bridgeService";
import { ref, computed, onMounted, watch } from "vue";
import { getCachedDictionary } from "@/services/dictionaryService";

const qljgDict = ref([]);
const qllxDict = ref([]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:visible", "bridge-click"]);

// 面板折叠状态
const isCollapsed = ref(false);
const showSearch = ref(false);



// 筛选条件
const filters = ref({
  name: "", // 桥梁名称
  structure: "", // 桥梁结构
  type: "", // 桥梁类型
});

// 监听筛选条件变化
watch([() => filters.value.name, () => filters.value.structure, () => filters.value.type], () => {
  currentPage.value = 1;
  loadBridges();
}, { deep: true });

// 重置筛选条件
const resetFilters = () => {
  filters.value.name = "";
  filters.value.structure = "";
  filters.value.type = "";
  currentPage.value = 1;
  loadBridges();
};

// 获取桥梁类型文本
const getBridgeType = (qllx) => {
  const typeMap = {
    'qllx001': '钢构桥',
    'qllx002': '钢筋混凝土桥',
    'qllx003': '圬工桥',
    'qllx004': '其他',
  };
  return typeMap[qllx] || qllx || '未知类型';
};

// 加载桥梁数据
const loadBridges = async () => {
  try {
    const params: any = {
      page: currentPage.value.toString(),
      rows: pageSize.value.toString(),
    };

    // 添加搜索条件
    if (filters.value.name) {
      params.Llmc = filters.value.name;
    }
    if (filters.value.structure) {
      params.Qljg = filters.value.structure;
    }
    if (filters.value.type) {
      params.Qllx = filters.value.type;
    }

    const res: any = await getBridgePageList(params);
    
    // 处理分页数据结构
    if (res && res.rows && Array.isArray(res.rows)) {
      bridges.value = res.rows;
      totalRecords.value = res.total || 0;
    } else {
      bridges.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error("加载桥梁数据失败:", error);
    bridges.value = [];
    totalRecords.value = 0;
  }
};

onMounted(async () => {
  // 加载字典数据
  const dict1 = await getCachedDictionary("qljg");
  const dict2 = await getCachedDictionary("qllx");
  qljgDict.value = dict1.map((item) => ({ value: item.f_ItemValue, text: item.f_ItemName }));
  qllxDict.value = dict2.map((item) => ({ value: item.f_ItemValue, text: item.f_ItemName }));
  
  // 加载桥梁数据
  loadBridges();
});

// 当前激活的桥梁
const activeBridgeId = ref(null);



// 分页
const currentPage = ref(1);
const pageSize = ref(7);
const totalRecords = ref(0);

// 桥梁数据
const bridges = ref([]);

// 过滤后的桥梁列表
const filteredBridges = computed(() => bridges.value);

// 当前页显示的桥梁
const currentPageBridges = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBridges.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(totalRecords.value / pageSize.value);
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

// 处理桥梁点击
const handleBridgeClick = async (bridge) => {
  activeBridgeId.value = bridge.lsh;

  try {
    // 发送桥梁数据
    emit("bridge-click", bridge);
  } catch (error) {
    console.error("处理桥梁点击失败:", error);
    // 如果处理失败，仍然发送桥梁数据
    emit("bridge-click", bridge);
  }
};

// 翻页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};
</script>

<style lang="scss" scoped>
.panel-content {
  margin-bottom: 20px;
  &.hidden {
    display: none;
  }
}

.bridge-list-panel {
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
        height: 100%;

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

        &:focus {
          outline: none;
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
        }

        option {
          background: #001428;
          color: #ffffff;

          &:first-child {
            color: rgba(255, 255, 255, 0.4);
          }
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

      .bridge-item {
        padding: 20px 19px 22px;
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

        .bridge-badges {
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
        }

        .bridge-name {
          font-family: SourceHanSansCNVF, SourceHanSansCNVF;
          font-weight: 500;
          font-size: 30px;
          color: #E4F3FF;
          line-height: 44px;
          text-align: left;
          font-style: normal;
        }

        .bridge-info {
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