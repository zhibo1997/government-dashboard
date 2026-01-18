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
        <div class="table-header">
          <div class="th th-index">序号</div>
          <div class="th th-area">所属专项</div>
          <div class="th th-id">场站编号</div>
          <div class="th th-name">场站名称</div>
          <div class="th th-position">安装位置</div>
          <div class="th th-type">场站类型</div>
          <div class="th th-run">运行状态</div>
          <!-- <div class="th th-connect">运维状态</div>
          <div class="th th-predict">预警</div>
          <div class="th th-alarm">报警</div> -->
        </div>

        <div class="table-body" v-if="loading">
            <div class="loading-text">加载中...</div>
        </div>
        <div class="table-body" v-else>
          <div 
            class="table-row"
            :class="{ 'row-even': index % 2 === 1 }"
            v-for="(item, index) in tableData"
            :key="item.lsh || index"
          >
            <div class="td td-index">{{ (currentPage - 1) * pageSize + index + 1 }}</div>
            <div class="td td-area">燃气</div>
            <div class="td td-id">{{ item.czbh }}</div>
            <div class="td td-name" :title="item.czmc">{{ item.czmc }}</div>
            <div class="td td-position" :title="item.xxdz">{{ item.xxdz }}</div>
            <div class="td td-type">{{ item.czlx }}</div>
            <div class="td td-run">
              <span class="status-text" :class="item.sjtbzt === 'I' ? 'status-online' : 'status-offline'">
                {{ item.sjtbzt === 'I' ? '正常' : '异常' }}
              </span>
            </div>
            <!-- 
            <div class="td td-connect">-</div>
            <div class="td td-predict">-</div>
            <div class="td td-alarm">-</div> 
            -->
          </div>
          <div v-if="tableData.length === 0" class="no-data">暂无数据</div>
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
import { ref, computed, watch } from 'vue';
import { getGasStationPageList } from '@/services/gasService';
import { Close } from "@vicons/ionicons5";
import { NButton, NIcon } from "naive-ui";

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
  backdrop-filter: blur(10px);
  border: 1px solid rgba(22, 119, 255, 0.3);
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 200;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  .dialog-header {
    height: 71px;
    padding: 0 21px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-image: url("@/assets/img/gasModule/detail_head_bg.webp");
    border-bottom: 2px solid rgba(13, 165, 190, 0.5);
    background-size: 100% 100%;
    flex-shrink: 0;

    .dialog-title {
      font-family: YouSheBiaoTiHei;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-2xl);
      color: #e4f3ff;
      line-height: calc(var(--font-size-2xl) * 1.464);
      background: linear-gradient(90deg, #FFFFFF 18%, #10ADC0 100%);
    }
  }

  .dialog-content {
    flex: 1;
    padding: 12px 15px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient( 270deg, rgba(8, 46, 77, 0.6) 0%, rgba(0, 0, 0, 0.6) 99.92%);

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
          width: 200px; /* 稍微加宽 */
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
      }
    }

    .data-table {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .table-header {
        display: grid;
        /* 调整列宽以适应场站数据 */
        grid-template-columns: 50px 80px 120px 1fr 1fr 100px 80px;
        background: rgba(22, 119, 255, 0.25);

        .th {
          padding: 10px 6px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: bold;
          font-size: 28px;
          color: #E4F3FF;
          line-height: 40px;
          text-align: left;
          font-style: normal;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .table-body {
        flex: 1;
        overflow-y: auto;
        
        .loading-text, .no-data {
            text-align: center;
            padding: 20px;
            color: rgba(255,255,255,0.6);
            font-size: 14px;
        }

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
          /* 与 header 保持一致 */
          grid-template-columns: 50px 80px 120px 1fr 1fr 100px 80px;
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
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: 400;
            font-size: 30px;
            color: #E4F3FF;
            line-height: 60px;
            text-align: left;
            font-style: normal;
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
              font-family: SourceHanSansSC, SourceHanSansSC;
              font-weight: 400;
              font-size: 30px;
              color: #E4F3FF;
              line-height: 60px;
              text-align: left;
              font-style: normal;

              &.status-online {
                color: #52c41a;
              }

              &.status-offline {
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