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
          <!-- 筛选按钮暂时保留样式，功能待定或隐藏 -->
          <!--
          <button 
            class="filter-btn" 
            :class="{ active: filters.area }" 
            @click="toggleFilter('area')"
          >
            所属专区
          </button>
          -->
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="data-table">
        <CommonTable
          :columns="tableColumns"
          :data="processedTableData"
          row-key="lsh"
          :empty-text="loading ? '加载中...' : '暂无数据'"
          grid-template="0.8fr 1.2fr 1.5fr 2fr 2fr 1.5fr 1.2fr"
        >
          <!-- 自定义序号列 -->
          <template #index="{ value }">
            <span class="index-number">{{ value }}</span>
          </template>
          
          <!-- 自定义专项列 -->
          <template #specialty="{ row }">
            <span class="specialty-tag">燃气</span>
          </template>
          
          <!-- 自定义场站编号列 -->
          <template #stationId="{ value }">
            <span class="station-id">{{ value }}</span>
          </template>
          
          <!-- 自定义场站名称列 -->
          <template #stationName="{ value }">
            <span class="station-name" :title="value">{{ value }}</span>
          </template>
          
          <!-- 自定义安装位置列 -->
          <template #position="{ value }">
            <span class="position" :title="value">{{ value }}</span>
          </template>
          
          <!-- 自定义场站类型列 -->
          <template #stationType="{ value }">
            <span class="station-type">{{ value }}</span>
          </template>
          
          <!-- 自定义运行状态列 -->
          <template #runStatus="{ row }">
            <span 
              class="status-text" 
              :class="row.sjtbzt === 'I' ? 'status-online' : 'status-offline'"
            >
              {{ row.sjtbzt === 'I' ? '正常' : '异常' }}
            </span>
          </template>
        </CommonTable>
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
import { ref, computed, watch } from 'vue';
import { getGasStationPageList } from '@/services/gasService';
import { Close } from "@vicons/ionicons5";
import { NButton, NIcon } from "naive-ui";
import CommonTable from '@/components/CommonTable.vue';

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

// 处理表格数据，添加序号
const processedTableData = computed(() => {
  return tableData.value.map((item, index) => ({
    ...item,
    index: index + 1 + (currentPage.value - 1) * pageSize.value
  }));
});

// 监听 visible 变化，显示时加载数据
watch(() => props.visible, (val) => {
  if (val) {
    currentPage.value = 1;
    searchKeyword.value = '';
    fetchData();
  }
});

// 获取数据
const fetchData = async () => {
  if (!props.stationData?.qybm) return;
  
  loading.value = true;
  try {
    const res = await getGasStationPageList({
      page: currentPage.value.toString(),
      rows: pageSize.value.toString(),
      Ssqybm: props.stationData.qybm,
      Yysfzc:'-1'
    });
    
    if (res && res.rows) {
      tableData.value = res.rows;
      total.value = res.total || 0;
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
  emit('update:visible', false);
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
  left: 1320px;
  width: 1920px;
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
      font-size: 44px;
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
          font-size: var(--font-size-3xl);
          font-family: SourceHanSansSC, SourceHanSansSC;

          &::placeholder {
            color: rgba(255, 255, 255, 0.65);
            font-size: var(--font-size-3xl);
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
        gap: 8px;
        margin-left: auto;
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
        font-size: var(--font-size-sm);
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
        font-size: var(--font-size-sm);
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
        font-size: var(--font-size-3xl);
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
          font-size: var(--font-size-3xl);
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
          font-size: var(--font-size-3xl);
        }
      }

      .page-info {
        margin-left: 12px;
        font-size: var(--font-size-3xl);
        color: rgba(255, 255, 255, 0.5);
        font-family: SourceHanSansSC, SourceHanSansSC;
      }
    }
  }
}
</style>