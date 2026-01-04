<template>
  <div class="monitoring-dialog" v-show="visible">
    <div class="dialog-header">
      <div class="dialog-title">监测设备</div>
      <button class="close-btn" @click="handleClose">×</button>
    </div>

    <div class="dialog-content">
      <!-- 搜索和筛选 -->
      <div class="toolbar">
        <div class="search-group">
          <input 
            type="text" 
            v-model="searchKeyword"
            placeholder="输入设备名称"
            class="search-input"
          />
          <button class="search-btn" @click="handleSearch">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        <div class="filter-group">
          <button 
            class="filter-btn" 
            :class="{ active: filters.area }" 
            @click="toggleFilter('area')"
          >
            所属专区
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: filters.powerMethod }" 
            @click="toggleFilter('powerMethod')"
          >
            供电方式
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: filters.runStatus }" 
            @click="toggleFilter('runStatus')"
          >
            运行状态
          </button>
          <button 
            class="filter-btn" 
            :class="{ active: filters.connectStatus }" 
            @click="toggleFilter('connectStatus')"
          >
            连接状态
          </button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="data-table">
        <div class="table-header">
          <div class="th th-index">序号</div>
          <div class="th th-area">所属专区</div>
          <div class="th th-id">设备编号</div>
          <div class="th th-name">设备名称</div>
          <div class="th th-position">安装位置</div>
          <div class="th th-method">供电方式</div>
          <div class="th th-run">运行状态</div>
          <div class="th th-connect">连接状态</div>
          <div class="th th-predict">预警</div>
          <div class="th th-alarm">报警</div>
        </div>

        <div class="table-body">
          <div 
            class="table-row"
            :class="{ 'row-even': index % 2 === 1 }"
            v-for="(item, index) in currentPageData"
            :key="item.id"
          >
            <div class="td td-index">{{ (currentPage - 1) * pageSize + index + 1 }}</div>
            <div class="td td-area">{{ item.area }}</div>
            <div class="td td-id">{{ item.deviceId }}</div>
            <div class="td td-name">{{ item.deviceName }}</div>
            <div class="td td-position">{{ item.position }}</div>
            <div class="td td-method">{{ item.powerMethod }}</div>
            <div class="td td-run">
              <span class="status-text" :class="`status-${item.runStatus}`">
                {{ item.runStatusText }}
              </span>
            </div>
            <div class="td td-connect">
              <span class="status-text" :class="`connect-${item.connectStatus}`">
                {{ item.connectStatusText }}
              </span>
            </div>
            <div class="td td-predict">{{ item.predict }}</div>
            <div class="td td-alarm">{{ item.alarm }}</div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">
          &lt;
        </button>
        <span class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            :class="{ 'active': page === currentPage }"
            @click="goToPage(page)"
            class="page-num"
          >
            {{ page }}
          </button>
          <span v-if="totalPages > 5" class="page-dots">...</span>
        </span>
        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">
          &gt;
        </button>
        <span class="page-info">{{ pageSize }}/页</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  stationData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible']);

// 搜索关键词
const searchKeyword = ref('');

// 筛选条件
const filters = ref({
  area: false,
  powerMethod: false,
  runStatus: false,
  connectStatus: false
});

// 切换筛选状态
const toggleFilter = (key: string) => {
  filters.value[key as keyof typeof filters.value] = !filters.value[key as keyof typeof filters.value];
};

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 监测设备数据
const monitoringData = ref([
  {
    id: 1,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '插电式',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'good',
    connectStatusText: '良好',
    predict: '12',
    alarm: '49'
  },
  {
    id: 2,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'good',
    connectStatusText: '良好',
    predict: '23',
    alarm: '5'
  },
  {
    id: 3,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '低功耗锂电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'maintenance',
    connectStatusText: '维护中',
    predict: '4',
    alarm: '67'
  },
  {
    id: 4,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '插电式',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'maintenance',
    connectStatusText: '维护中',
    predict: '4',
    alarm: '67'
  },
  {
    id: 5,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '插电式',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'scrapped',
    connectStatusText: '报废',
    predict: '5',
    alarm: '5'
  },
  {
    id: 6,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '插电式',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'good',
    connectStatusText: '良好',
    predict: '6',
    alarm: '4'
  },
  {
    id: 7,
    area: '燃气终端用户',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '插电式',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'good',
    connectStatusText: '良好',
    predict: '4',
    alarm: '3'
  },
  {
    id: 8,
    area: '燃气终端用户',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '插电式',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'good',
    connectStatusText: '良好',
    predict: '9',
    alarm: '8'
  },
  {
    id: 9,
    area: '燃气终端用户',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '插电式',
    runStatus: 'offline',
    runStatusText: '离线',
    connectStatus: 'maintenance',
    connectStatusText: '维护中',
    predict: '9',
    alarm: '9'
  },
]);

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return monitoringData.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(monitoringData.value.length / pageSize.value);
});

// 可见页码
const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= Math.min(6, totalPages.value); i++) {
    pages.push(i);
  }
  return pages;
});

const handleClose = () => {
  emit('update:visible', false);
};

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value);
};

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

const goToPage = (page: number) => {
  currentPage.value = page;
};
</script>

<style lang="scss" scoped>
.monitoring-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1100px;
  max-height: 80vh;
  background: rgba(0, 20, 40, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(22, 119, 255, 0.3);
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 200;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .dialog-header {
    height: 40px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(
      90deg,
      rgba(22, 119, 255, 0.3) 0%,
      rgba(22, 119, 255, 0.1) 100%
    );
    border-bottom: 1px solid rgba(22, 119, 255, 0.3);
    flex-shrink: 0;

    .dialog-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-bold);
      font-size: 16px;
      color: #ffffff;
    }

    .close-btn {
      width: 24px;
      height: 24px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        color: #ff4d4f;
      }
    }
  }

  .dialog-content {
    flex: 1;
    padding: 12px 15px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
      flex-shrink: 0;
      align-items: center;

      .search-group {
        display: flex;
        gap: 0;

        .search-input {
          width: 140px;
          height: 28px;
          padding: 0 10px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-right: none;
          border-radius: 2px 0 0 2px;
          color: #ffffff;
          font-size: 12px;

          &::placeholder {
            color: rgba(255, 255, 255, 0.35);
          }

          &:focus {
            outline: none;
            border-color: rgba(22, 119, 255, 0.5);
          }
        }

        .search-btn {
          width: 32px;
          height: 28px;
          background: rgba(22, 119, 255, 0.6);
          border: 1px solid rgba(22, 119, 255, 0.6);
          border-radius: 0 2px 2px 0;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(22, 119, 255, 0.8);
          }

          .search-icon {
            width: 14px;
            height: 14px;
          }
        }
      }

      .filter-group {
        display: flex;
        gap: 8px;
        margin-left: auto;

        .filter-btn {
          height: 28px;
          padding: 0 16px;
          background: rgba(22, 119, 255, 0.5);
          border: none;
          border-radius: 2px;
          color: #ffffff;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(22, 119, 255, 0.7);
          }

          &.active {
            background: rgba(22, 119, 255, 0.8);
            box-shadow: 0 0 8px rgba(22, 119, 255, 0.5);
          }
        }
      }
    }

    .data-table {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .table-header {
        display: grid;
        grid-template-columns: 50px 100px 80px 1fr 80px 100px 80px 80px 50px 50px;
        background: rgba(22, 119, 255, 0.25);

        .th {
          padding: 10px 6px;
          font-weight: 500;
          font-size: 12px;
          color: #8ecff0;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .table-body {
        flex: 1;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(22, 119, 255, 0.4);
          border-radius: 2px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 50px 100px 80px 1fr 80px 100px 80px 80px 50px 50px;
          background: rgba(0, 30, 50, 0.4);
          border-bottom: 1px solid rgba(22, 119, 255, 0.1);
          transition: all 0.2s ease;

          &.row-even {
            background: rgba(0, 40, 60, 0.5);
          }

          &:hover {
            background: rgba(22, 119, 255, 0.15);
          }

          .td {
            padding: 8px 6px;
            font-size: 12px;
            color: #d0e8f0;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &.td-name {
              color: #6dd5ed;
            }

            .status-text {
              font-size: 12px;

              &.status-online {
                color: #52c41a;
              }

              &.status-offline {
                color: #ff4d4f;
              }

              &.connect-good {
                color: #52c41a;
              }

              &.connect-maintenance {
                color: #faad14;
              }

              &.connect-scrapped {
                color: #ff4d4f;
              }
            }
          }
        }
      }
    }

    .pagination {
      padding: 12px 0 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      flex-shrink: 0;

      .page-btn {
        width: 24px;
        height: 24px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          border-color: rgba(22, 119, 255, 0.5);
          color: #ffffff;
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }

      .page-numbers {
        display: flex;
        gap: 4px;
        align-items: center;

        .page-num {
          min-width: 24px;
          height: 24px;
          padding: 0 6px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;

          &:hover {
            border-color: rgba(22, 119, 255, 0.5);
            color: #ffffff;
          }

          &.active {
            background: rgba(22, 119, 255, 0.6);
            border-color: rgba(22, 119, 255, 0.6);
            color: #ffffff;
          }
        }

        .page-dots {
          color: rgba(255, 255, 255, 0.4);
          padding: 0 2px;
          font-size: 12px;
        }
      }

      .page-info {
        margin-left: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}
</style>
