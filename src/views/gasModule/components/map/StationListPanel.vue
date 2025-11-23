<template>
  <div class="station-list-panel" :class="{ collapsed: isCollapsed }">
    <!-- 头部工具栏 -->
    <div class="panel-header">
      <button class="search-icon-btn btn" @click="toggleSearch">
        <img
          src="@/assets/img/gasModule/icon_search.webp"
          class="icon"
          alt=""
        />
      </button>
      <button class="toggle-btn btn" @click="togglePanel">
        <img src="@/assets/img/gasModule/icon_menu.webp" class="icon" alt="" />
        <span class="text">收起侧边栏</span>
      </button>
    </div>
    <div class="panel-content">
      <!-- 主标题 -->
      <div class="panel-title">
        <span class="title-text">燃气厂站</span>
        <span class="arrow-icon">▼</span>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-item">
          <label>所属企业</label>
          <select v-model="filters.company" class="filter-select">
            <option value="">全部</option>
            <option value="company1">华川燃气公司</option>
            <option value="company2">阳新燃气公司</option>
          </select>
        </div>

        <div class="filter-item">
          <label>场站类型</label>
          <select v-model="filters.type" class="filter-select">
            <option value="">全部</option>
            <option value="cng">CNG站</option>
            <option value="lng">LNG站</option>
          </select>
        </div>

        <div class="filter-item">
          <label>运营是否正常</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">全部</option>
            <option value="normal">正常</option>
            <option value="abnormal">异常</option>
          </select>
        </div>

        <div class="filter-row">
          <div class="filter-item-half">
            <label>是否预警</label>
            <select v-model="filters.warning" class="filter-select">
              <option value="">全部</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
          <div class="filter-item-half">
            <label>是否报警</label>
            <select v-model="filters.alarm" class="filter-select">
              <option value="">全部</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 场站列表 -->
    <div class="station-list">
      <div class="list-header">
        <span class="count-badge">共{{ filteredStations.length }}条记录</span>
      </div>

      <div class="list-content">
        <div
          class="station-item"
          v-for="station in currentPageStations"
          :key="station.id"
          :class="{ active: station.id === activeStationId }"
          @click="handleStationClick(station)"
        >
          <div class="station-header">
            <div class="station-type-badge">{{ station.gasType }}</div>
            <div
              class="station-status-badge"
              :class="`status-${station.status}`"
            >
              {{ station.statusText }}
            </div>
          </div>
          <div class="station-name">{{ station.name }}</div>
          <div class="station-address">{{ station.address }}</div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button
          class="page-btn"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          &lt;
        </button>
        <span class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="{ active: page === currentPage }"
            @click="currentPage = page"
            class="page-num"
          >
            {{ page }}
          </button>
        </span>
        <button
          class="page-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          &gt;
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

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
  type: "",
  status: "",
  warning: "",
  alarm: "",
});

// 当前激活的场站
const activeStationId = ref(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(7);

// 场站数据（示例）
const stations = ref([
  {
    id: 1,
    name: "华川燃气场站1",
    address: "阳新县X区XX路1号",
    gasType: "天然气门站",
    status: "normal",
    statusText: "维修站",
    company: "company1",
  },
  {
    id: 2,
    name: "华川燃气场站2",
    address: "阳新县X区XX路2号",
    gasType: "天然气门站",
    status: "normal",
    statusText: "维修站",
    company: "company1",
  },
  {
    id: 3,
    name: "华川燃气场站1",
    address: "阳新县X区XX路1号",
    gasType: "天然气门站",
    status: "normal",
    statusText: "维修站",
    company: "company2",
  },
  {
    id: 4,
    name: "华川燃气场站2",
    address: "阳新县X区XX路2号",
    gasType: "天然气门站",
    status: "normal",
    statusText: "维修站",
    company: "company2",
  },
  {
    id: 5,
    name: "华川燃气场站1",
    address: "阳新县X区XX路1号",
    gasType: "天然气门站",
    status: "normal",
    statusText: "维修站",
    company: "company1",
  },
  {
    id: 6,
    name: "华川燃气场站2",
    address: "阳新县X区XX路2号",
    gasType: "天然气门站",
    status: "normal",
    statusText: "维修站",
    company: "company1",
  },
]);

// 过滤后的场站列表
const filteredStations = computed(() => {
  return stations.value.filter((station) => {
    if (searchKeyword.value && !station.name.includes(searchKeyword.value)) {
      return false;
    }
    if (filters.value.company && station.company !== filters.value.company) {
      return false;
    }
    return true;
  });
});

// 当前页显示的场站
const currentPageStations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredStations.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredStations.value.length / pageSize.value);
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

// 获取场站图标
const getStationIcon = (gasType) => {
  // 返回对应的图标路径
  return new URL("@/assets/img/gasModule/station_icon.png", import.meta.url)
    .href;
};

// 处理场站点击
const handleStationClick = (station) => {
  activeStationId.value = station.id;
  emit("station-click", station);
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
.station-list-panel {
  width: 380px;
  height: calc(100% - 40px);
  border: 1px solid rgba(22, 119, 255, 0.3);
  border-radius: 8px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header {
    padding: 12px 15px;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    flex-shrink: 0;
    .icon{
      width: 32px;
      height: 32px;
    }
    .btn{
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
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient( 270deg, rgba(9,24,39,0) 0%, #083957 100%);
    border-bottom: 1px solid rgba(0, 255, 255, 0.15);
    flex-shrink: 0;

    .title-text {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 20px;
      color: #00ffff;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .arrow-icon {
      color: #00ffff;
      font-size: 12px;
    }
  }

  .filter-section {
    padding: 12px 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: linear-gradient( 270deg, rgb(8, 46, 77,0.4) 0%, rgba(0,0,0,0.4) 100%);
    border-bottom: 1px solid rgba(0, 255, 255, 0.15);
    flex-shrink: 0;
    backdrop-filter: blur(30px);

    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 13px;
        color: #00ffff;
        font-weight: 500;
      }

      .filter-select {
        width: 100%;
        height: 36px;
        padding: 0 30px 0 12px;
        background: rgba(0, 40, 60, 0.6);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 4px;
        color: #ffffff;
        font-size: 14px;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300ffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;

        &:focus {
          outline: none;
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
        }

        option {
          background: #001428;
          color: #ffffff;
        }
      }
    }

    .filter-row {
      display: flex;
      gap: 10px;

      .filter-item-half {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 13px;
          color: #00ffff;
          font-weight: 500;
        }

        .filter-select {
          width: 100%;
          height: 36px;
          padding: 0 30px 0 12px;
          background: rgba(0, 40, 60, 0.6);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 4px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300ffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;

          &:focus {
            outline: none;
            border-color: rgba(0, 255, 255, 0.6);
            box-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
          }

          option {
            background: #001428;
          }
        }
      }
    }
  }

  .station-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .list-header {
      padding: 12px 15px;
      display: flex;
      align-items: center;
      flex-shrink: 0;

      .count-badge {
        font-size: 14px;
        color: #00ffff;
        padding: 5px 15px;
        background: rgba(0, 40, 60, 0.6);
        border-radius: 15px;
        border: 1px solid rgba(0, 255, 255, 0.4);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
      }
    }

    .list-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 15px 10px;

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
        padding: 12px;
        margin-bottom: 10px;
        background: rgba(0, 40, 60, 0.5);
        border: 1px solid rgba(0, 255, 255, 0.25);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;

        &:hover {
          background: rgba(0, 60, 80, 0.7);
          border-color: rgba(0, 255, 255, 0.5);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }

        &.active {
          background: rgba(0, 80, 100, 0.8);
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }

        .station-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .station-type-badge {
            padding: 3px 10px;
            background: rgba(0, 255, 255, 0.15);
            border: 1px solid rgba(0, 255, 255, 0.4);
            border-radius: 3px;
            font-size: 12px;
            color: #00ffff;
          }

          .station-status-badge {
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 12px;

            &.status-normal {
              background: rgba(0, 255, 0, 0.15);
              color: #00ff00;
              border: 1px solid rgba(0, 255, 0, 0.4);
            }

            &.status-warning {
              background: rgba(255, 200, 0, 0.15);
              color: #ffc800;
              border: 1px solid rgba(255, 200, 0, 0.4);
            }

            &.status-error {
              background: rgba(255, 50, 50, 0.15);
              color: #ff3232;
              border: 1px solid rgba(255, 50, 50, 0.4);
            }
          }
        }

        .station-name {
          font-size: 15px;
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 6px;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
        }

        .station-address {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    .pagination {
      padding: 12px 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-top: 1px solid rgba(0, 255, 255, 0.2);
      flex-shrink: 0;

      .page-btn {
        width: 26px;
        height: 26px;
        background: rgba(0, 40, 60, 0.6);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 3px;
        color: #00ffff;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 12px;

        &:hover:not(:disabled) {
          background: rgba(0, 60, 80, 0.8);
          border-color: rgba(0, 255, 255, 0.5);
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }

      .page-numbers {
        display: flex;
        gap: 4px;

        .page-num {
          width: 26px;
          height: 26px;
          background: rgba(0, 40, 60, 0.6);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 3px;
          color: #00ffff;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;

          &:hover,
          &.active {
            background: rgba(0, 255, 255, 0.2);
            border-color: rgba(0, 255, 255, 0.6);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
          }
        }
      }

      .page-info {
        margin-left: 6px;
        font-size: 12px;
        color: rgba(0, 255, 255, 0.8);
      }
    }
  }
}
</style>
