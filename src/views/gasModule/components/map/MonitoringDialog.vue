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
            <span class="icon">🔍</span>
          </button>
        </div>

        <div class="filter-group">
          <select v-model="filters.company" class="filter-select">
            <option value="">所属企业</option>
            <option value="company1">华川燃气</option>
            <option value="company2">阳新燃气</option>
          </select>
          <select v-model="filters.powerMethod" class="filter-select">
            <option value="">供电方式</option>
            <option value="battery">电池</option>
            <option value="solar">太阳能</option>
          </select>
          <select v-model="filters.runStatus" class="filter-select">
            <option value="">运行状态</option>
            <option value="online">在线</option>
            <option value="offline">离线</option>
          </select>
          <select v-model="filters.connectStatus" class="filter-select">
            <option value="">连接状态</option>
            <option value="connected">已连接</option>
            <option value="testing">测试中</option>
          </select>
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
          <div class="th th-action">操作</div>
        </div>

        <div class="table-body">
          <div 
            class="table-row"
            v-for="(item, index) in currentPageData"
            :key="item.id"
          >
            <div class="td td-index">{{ index + 1 }}</div>
            <div class="td td-area">{{ item.area }}</div>
            <div class="td td-id">{{ item.deviceId }}</div>
            <div class="td td-name">
              {{ item.deviceName }}
              <span class="alert-icon" v-if="item.hasAlert">⚠️</span>
            </div>
            <div class="td td-position">{{ item.position }}</div>
            <div class="td td-method">{{ item.powerMethod }}</div>
            <div class="td td-run">
              <span class="status-badge" :class="`status-${item.runStatus}`">
                {{ item.runStatusText }}
              </span>
            </div>
            <div class="td td-connect">
              <span class="status-badge" :class="`status-${item.connectStatus}`">
                {{ item.connectStatusText }}
              </span>
            </div>
            <div class="td td-predict">{{ item.predict }}</div>
            <div class="td td-action">{{ item.action }}</div>
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
            @click="currentPage = page"
            class="page-num"
          >
            {{ page }}
          </button>
          <span v-if="totalPages > 6" class="page-dots">...</span>
        </span>
        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">
          &gt;
        </button>
        <span class="page-info">{{ currentPage }} / 页</span>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  company: '',
  powerMethod: '',
  runStatus: '',
  connectStatus: ''
});

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
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '测试中',
    predict: '12',
    action: '40',
    hasAlert: true
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
    connectStatus: 'testing',
    connectStatusText: '维护中',
    predict: '23',
    action: '5',
    hasAlert: false
  },
  {
    id: 3,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '供电开关电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '维护中',
    predict: '12',
    action: '67',
    hasAlert: false
  },
  {
    id: 4,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '测试',
    predict: '4',
    action: '67',
    hasAlert: true
  },
  {
    id: 5,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '维护',
    predict: '5',
    action: '5',
    hasAlert: false
  },
  {
    id: 6,
    area: '燃气燃气测产',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '维护中',
    predict: '6',
    action: '4',
    hasAlert: false
  },
  {
    id: 7,
    area: '燃气燃气测产',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '维护中',
    predict: '4',
    action: '3',
    hasAlert: false
  },
  {
    id: 8,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '维护中',
    predict: '9',
    action: '8',
    hasAlert: false
  },
  {
    id: 9,
    area: '燃气',
    deviceId: 'SHB801',
    deviceName: '可燃气体智能监测仪',
    position: '安装位置',
    powerMethod: '电池',
    runStatus: 'online',
    runStatusText: '在线',
    connectStatus: 'testing',
    connectStatusText: '维护中',
    predict: '9',
    action: '9',
    hasAlert: false
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
</script>

<style lang="scss" scoped>
.monitoring-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1200px;
  max-height: 80vh;
  background: rgba(0, 30, 60, 0.92);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(22, 119, 255, 0.4);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 200;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .dialog-header {
    height: 60px;
    padding: 0 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(
      90deg,
      rgba(22, 119, 255, 0.25) 0%,
      rgba(22, 119, 255, 0.1) 100%
    );
    border-bottom: 1px solid rgba(22, 119, 255, 0.3);
    flex-shrink: 0;

    .dialog-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      background: rgba(255, 77, 79, 0.15);
      border: 1px solid rgba(255, 77, 79, 0.3);
      border-radius: 4px;
      color: #ff4d4f;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 77, 79, 0.25);
        border-color: rgba(255, 77, 79, 0.5);
      }
    }
  }

  .dialog-content {
    flex: 1;
    padding: 20px 25px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .toolbar {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-shrink: 0;

      .search-group {
        display: flex;
        gap: 8px;

        .search-input {
          width: 180px;
          height: 36px;
          padding: 0 12px;
          background: rgba(22, 119, 255, 0.1);
          border: 1px solid rgba(22, 119, 255, 0.3);
          border-radius: 4px;
          color: #ffffff;
          font-size: 14px;

          &::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          &:focus {
            outline: none;
            border-color: rgba(22, 119, 255, 0.6);
          }
        }

        .search-btn {
          width: 36px;
          height: 36px;
          background: rgba(22, 119, 255, 0.2);
          border: 1px solid rgba(22, 119, 255, 0.3);
          border-radius: 4px;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(22, 119, 255, 0.4);
          }

          .icon {
            font-size: 16px;
          }
        }
      }

      .filter-group {
        display: flex;
        gap: 10px;
        flex: 1;

        .filter-select {
          height: 36px;
          padding: 0 12px;
          background: rgba(22, 119, 255, 0.1);
          border: 1px solid rgba(22, 119, 255, 0.3);
          border-radius: 4px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;

          &:focus {
            outline: none;
            border-color: rgba(22, 119, 255, 0.6);
          }

          option {
            background: #001428;
            color: #ffffff;
          }
        }
      }
    }

    .data-table {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(22, 119, 255, 0.2);
      border-radius: 6px;

      .table-header {
        display: grid;
        grid-template-columns: 60px 120px 100px 180px 100px 120px 100px 100px 60px 60px;
        background: linear-gradient(
          90deg,
          rgba(22, 119, 255, 0.2) 0%,
          rgba(22, 119, 255, 0.1) 100%
        );
        border-bottom: 1px solid rgba(22, 119, 255, 0.3);

        .th {
          padding: 12px 8px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: bold;
          font-size: 14px;
          color: #d3eaf1;
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
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(22, 119, 255, 0.4);
          border-radius: 3px;

          &:hover {
            background: rgba(22, 119, 255, 0.6);
          }
        }

        .table-row {
          display: grid;
          grid-template-columns: 60px 120px 100px 180px 100px 120px 100px 100px 60px 60px;
          border-bottom: 1px solid rgba(22, 119, 255, 0.1);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(22, 119, 255, 0.08);
          }

          .td {
            padding: 10px 8px;
            font-size: 13px;
            color: #e4f3ff;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;

            &.td-name {
              color: #10adc0;
              gap: 5px;

              .alert-icon {
                font-size: 14px;
              }
            }

            &.td-run,
            &.td-connect {
              .status-badge {
                padding: 3px 10px;
                border-radius: 3px;
                font-size: 12px;

                &.status-online {
                  background: rgba(82, 196, 26, 0.15);
                  color: #52c41a;
                  border: 1px solid rgba(82, 196, 26, 0.3);
                }

                &.status-testing {
                  background: rgba(250, 173, 20, 0.15);
                  color: #faad14;
                  border: 1px solid rgba(250, 173, 20, 0.3);
                }

                &.status-offline {
                  background: rgba(255, 77, 79, 0.15);
                  color: #ff4d4f;
                  border: 1px solid rgba(255, 77, 79, 0.3);
                }
              }
            }
          }
        }
      }
    }

    .pagination {
      padding: 15px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-shrink: 0;

      .page-btn {
        width: 28px;
        height: 28px;
        background: rgba(22, 119, 255, 0.1);
        border: 1px solid rgba(22, 119, 255, 0.3);
        border-radius: 4px;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          background: rgba(22, 119, 255, 0.3);
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .page-numbers {
        display: flex;
        gap: 4px;
        align-items: center;

        .page-num {
          width: 28px;
          height: 28px;
          background: rgba(22, 119, 255, 0.1);
          border: 1px solid rgba(22, 119, 255, 0.3);
          border-radius: 4px;
          color: #ffffff;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s ease;

          &:hover,
          &.active {
            background: rgba(22, 119, 255, 0.4);
            border-color: rgba(22, 119, 255, 0.6);
          }
        }

        .page-dots {
          color: rgba(255, 255, 255, 0.5);
          padding: 0 4px;
        }
      }

      .page-info {
        margin-left: 8px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}
</style>
