<template>
  <div class="monitoring-dialog" v-show="visible">
    <div class="dialog-header">
      <div class="dialog-title gradient-text">场站列表</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" class="action-icon favorite-icon" />
      </n-button>
    </div>

    <div class="dialog-content">
      <!-- 搜索和筛选 -->
      <div class="toolbar">
        <div class="search-group">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="输入场站名称"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
        <div class="filter-group">
          <n-select
            v-model:value="selectedCzlx"
            :options="czlxOptions"
            placeholder="场站类型"
            clearable
            class="filter-select"
            @update:value="handleSearch"
          />
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="data-table">
        <CommonTable
          :columns="tableColumns"
          :data="processedTableData"
          row-key="lsh"
          :empty-text="loading ? '加载中...' : '暂无数据'"
          :max-height="400"
          grid-template="0.8fr 1.2fr 1.5fr 2fr 2fr 1.5fr 1.2fr"
        />
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
import { ref, computed, watch, onMounted } from 'vue';
import { getGasStationPageList } from '@/services/gasService';
import { getCachedDictionary } from '@/services/dictionaryService';
import { useBottomPanelStore } from '@/stores/bottomPanelStore'
import { Close } from "@vicons/ionicons5";
import { NButton, NIcon, NSelect } from "naive-ui";
import CommonTable from '@/components/CommonTable.vue';

const bottomPanelStore = useBottomPanelStore()
const visible = computed(() => bottomPanelStore.activePanel === 'monitoring')
const stationData = computed(() => bottomPanelStore.panelData.stationData || {})

// 搜索关键词
const searchKeyword = ref('');
// 场站类型筛选
const selectedCzlx = ref('');
const czlxOptions = ref<{ label: string; value: string }[]>([]);

// 场站类型字典映射
const czlxDictMap = ref<Record<string, string>>({});

// 加载场站类型字典
const loadCzlxDict = async () => {
  try {
    const czlxDict = await getCachedDictionary('czlx');
    if (czlxDict && czlxDict.length > 0) {
      czlxDictMap.value = czlxDict.reduce((acc: Record<string, string>, cur: any) => {
        acc[cur.f_ItemValue] = cur.f_ItemName;
        return acc;
      }, {});
      czlxOptions.value = czlxDict.map((item: any) => ({
        label: item.f_ItemName,
        value: item.f_ItemValue,
      }));
    }
  } catch (error) {
    console.error('获取场站类型字典失败:', error);
  }
};

const getCzlxName = (code: string): string => {
  return czlxDictMap.value[code] || code || '—';
};

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref<any[]>([]);
const loading = ref(false);

// 表格列配置
const tableColumns = [
  { key: 'index', title: '序号', width: '0.8fr' },
  { key: 'specialty', title: '所属专项', width: '1.2fr' },
  { key: 'stationId', title: '场站编号', width: '1.5fr' },
  { key: 'stationName', title: '场站名称', width: '2fr' },
  { key: 'position', title: '安装位置', width: '2fr' },
  { key: 'stationType', title: '场站类型', width: '1.5fr' },
  { key: 'runStatus', title: '运行状态', width: '1.2fr' }
];

// 处理表格数据，映射字段并添加序号
const processedTableData = computed(() => {
  return tableData.value.map((item, index) => ({
    ...item,
    index: index + 1 + (currentPage.value - 1) * pageSize.value,
    specialty: '燃气',
    stationId: item.czbh || '—',
    stationName: item.czmc || '—',
    position: item.xxdz || '—',
    stationType: getCzlxName(item.czlx),
    runStatus: item.sjtbzt === 'I' ? '在线' : '离线',
  }));
});

// 监听 visible 变化，显示时加载数据
watch(visible, (val) => {
  if (val) {
    currentPage.value = 1;
    searchKeyword.value = '';
    selectedCzlx.value = '';
    fetchData();
  }
});

onMounted(() => {
  loadCzlxDict();
});

// 获取数据
const fetchData = async () => {
  if (!stationData.value?.qybm) return;
  
  loading.value = true;
  try {
    const res = await getGasStationPageList({
      page: currentPage.value.toString(),
      rows: pageSize.value.toString(),
      Ssqybm: stationData.value.qybm,
      czmc: searchKeyword.value || undefined,
      Czlx: selectedCzlx.value || undefined,
      Yysfzc:'-1'
    });
    
    if (res && res.rows) {
      tableData.value = res.rows;
      total.value = res.records || 0;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取场站列表失败:', error);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  bottomPanelStore.hidePanel();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData();
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchData();
};

// 总页数
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1;
});

// 可见页码
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  // 简单的页码逻辑，始终显示当前页附近的页码
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, 5);
    if (end === total) start = Math.max(1, total - 4);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>

<style lang="scss" scoped>
.monitoring-dialog {
  position: absolute;
  bottom: 0;
  left: var(--bottom-panel-left, 1320px);
  width: var(--bottom-panel-width, 1920px);
  max-height: 80vh;
  z-index: 200;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  background: rgba(5, 23, 40, 0.85);

  .dialog-header {
    height: 71px;
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
      font-size: var(--font-size-hero);
      color: #FFFFFF;
      line-height: 57px;
      text-align: left;
      font-style: normal;
      background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);;
    }
  }

  .dialog-content {
    flex: 1;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(270deg, rgba(8, 46, 77, 0.4) 0%, rgba(0, 0, 0, 0.45) 99.92%);

    .toolbar {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-shrink: 0;
      align-items: center;

      .search-group {
        display: flex;
        gap: 0;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.15);

        .search-input {
          width: 360px;
          height: 60px;
          padding: 0 16px;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: var(--font-size-heading);
          font-family: SourceHanSansSC, SourceHanSansSC;

          &::placeholder {
            color: rgba(255, 255, 255, 0.65);
            font-size: var(--font-size-heading);
          }

          &:focus {
            outline: none;
            background: rgba(0, 0, 0, 0.3);
          }
        }

        .search-btn {
          width: 60px;
          height: 60px;
          background: rgba(22, 119, 255, 0.7);
          border: none;
          border-left: 1px solid rgba(22, 119, 255, 0.3);
          border-radius: 0 6px 6px 0;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(22, 119, 255, 0.9);
          }

          .search-icon {
            width: 30px;
            height: 30px;
          }
        }
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-select {
          width: 280px;
          :deep(.n-base-selection) {
            --n-height: 60px !important;
            --n-color: transparent !important;
            --n-color-active: transparent !important;
            --n-text-color: #E4F3FF !important;
            --n-font-size: var(--font-size-heading) !important;
            --n-padding-single: 0 16px !important;
            --n-border: 1px solid rgba(255, 255, 255, 0.15) !important;
            --n-border-active: 1px solid rgba(22, 119, 255, 0.5) !important;
            --n-border-focus: 1px solid rgba(22, 119, 255, 0.5) !important;
            --n-border-hover: 1px solid rgba(22, 119, 255, 0.4) !important;
            --n-border-radius: 6px !important;
          }
        }
      }
    }

    .data-table {
      flex: 1;
      overflow: auto;
      margin-top: 20px;
      
      // 自定义表格样式
      .index-number {
        color: #8CB7CF;
        font-weight: 500;
      }
      
      .specialty-tag {
        background: linear-gradient(135deg, #10ADC0 0%, #0DA5BE 100%);
        padding: 4px 12px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        font-size: var(--font-size-mini);
      }
      
      .station-id {
        color: #FFFFFF;
        font-weight: 500;
      }
      
      .station-name {
        color: #FFFFFF;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .position {
        color: #e4f3ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .station-type {
        color: #e4f3ff;
      }
      
      .status-text {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: var(--font-size-mini);
        font-weight: 500;

        &.status-online {
          background: rgba(46, 213, 115, 0.2);
          color: #2ED573;
        }

        &.status-offline {
          background: rgba(255, 71, 87, 0.2);
          color: #FF4757;
        }
      }
    }

    .pagination {
      padding: 16px 0 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      flex-shrink: 0;

      .page-btn {
        width: 36px;
        height: 36px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        font-size: var(--font-size-heading);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover:not(:disabled) {
          background: rgba(22, 119, 255, 0.2);
          border-color: rgba(22, 119, 255, 0.6);
          color: #ffffff;
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }

      .page-numbers {
        display: flex;
        gap: 6px;
        align-items: center;

        .page-num {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: var(--font-size-heading);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background: rgba(22, 119, 255, 0.2);
            border-color: rgba(22, 119, 255, 0.6);
            color: #ffffff;
          }

          &.active {
            background: linear-gradient(135deg, rgba(22, 119, 255, 0.9) 0%, rgba(13, 165, 190, 0.8) 100%);
            border-color: rgba(22, 119, 255, 0.8);
            color: #ffffff;
            font-weight: 500;
          }
        }

        .page-dots {
          color: rgba(255, 255, 255, 0.4);
          padding: 0 4px;
          font-size: var(--font-size-heading);
        }
      }

      .page-info {
        margin-left: 12px;
        font-size: var(--font-size-heading);
        color: rgba(255, 255, 255, 0.5);
        font-family: SourceHanSansSC, SourceHanSansSC;
      }
    }
  }
}
</style>