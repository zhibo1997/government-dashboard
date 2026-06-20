<template>
  <div class="equipment-dialog" v-show="visible">
    <div class="dialog-header">
      <div class="dialog-title gradient-text">监测设备列表</div>
      <div class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" class="action-icon favorite-icon" />
      </div>
    </div>

    <div class="dialog-content">
      <!-- 搜索栏 -->
      <div class="toolbar">
        <div class="search-group">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="输入设备名称"
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
        <button class="reset-btn" @click="handleReset">重置</button>
      </div>

      <!-- 数据表格 -->
      <div class="data-table">
        <CommonTable
          :columns="equipmentColumns"
          :data="processedEquipmentData"
          row-key="sbbh"
          :empty-text="loading ? '加载中...' : '暂无设备数据'"
          :max-height="400"
          grid-template="0.6fr 1fr 1.5fr 2fr 1.5fr 1fr 1fr 1fr 0.8fr"
        >
          <template #sbyxzt="{ row }">
            <span class="status-text">{{ formatDeviceStatus(row.sbyxzt) }}</span>
          </template>
          <template #sbywzt="{ row }">
            <span class="status-text">{{ formatMaintStatus(row.sbywzt) }}</span>
          </template>
          <template #action="{ row }">
            <n-button text type="primary" class="view-btn" @click="handleViewEquipment(row)">查看</n-button>
          </template>
        </CommonTable>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <span class="page-info">共 {{ total }} 条</span>
        <span style="flex:1"></span>
        <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">&lt;</button>
        <span class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
            class="page-num"
          >{{ page }}</button>
        </span>
        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">&gt;</button>
        <span class="page-info">{{ pageSize }}/页</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getBridgeTargetEquipmentPageList } from '@/services/bridgeService'
import { getCachedDictionary } from '@/services/dictionaryService'
import { useBottomPanelStore } from '@/stores/bottomPanelStore'
import { Close } from '@vicons/ionicons5'
import { NButton, NIcon } from 'naive-ui'
import CommonTable from '@/components/CommonTable.vue'

const bottomPanelStore = useBottomPanelStore()
const visible = computed(() => bottomPanelStore.activePanel === 'equipment')
const bridgeData = computed(() => bottomPanelStore.panelData.bridgeData || {})

const sbyxztDict = ref<Array<{ f_ItemValue: string; f_ItemName: string }>>([])
const sbywztDict = ref<Array<{ f_ItemValue: string; f_ItemName: string }>>([])

onMounted(async () => {
  const [d1, d2] = await Promise.all([
    getCachedDictionary('sbyxzt'),
    getCachedDictionary('sbywzt'),
  ])
  sbyxztDict.value = d1 || []
  sbywztDict.value = d2 || []
})

const emit = defineEmits(['equipment-view'])

// 搜索
const searchKeyword = ref('')
// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<any[]>([])
const loading = ref(false)

// 所属专项映射
const sszxMap: Record<string, string> = {
  'csaqzx_ql': '桥梁',
  'csaqzx_gs': '供水',
  'csaqzx_rq': '燃气',
  'csaqzx_ps': '排水',
}

// 供电方式映射
const gdfsMap: Record<string, string> = {
  'gdfs001': '插电式',
  'gdfs002': '电池',
  'gdfs003': '太阳能',
}

// 设备表格列配置
const equipmentColumns = [
  { key: 'index', title: '序号', width: '0.6fr' },
  { key: 'sszxName', title: '所属专项', width: '1fr' },
  { key: 'sbbh', title: '设备编号', width: '1.5fr' },
  { key: 'sbmc', title: '设备名称', width: '2fr' },
  { key: 'azwz', title: '安装位置', width: '1.5fr' },
  { key: 'gdfsName', title: '供电方式', width: '1fr' },
  { key: 'sbyxzt', title: '运行状态', width: '1fr' },
  { key: 'sbywzt', title: '运维状态', width: '1fr' },
  { key: 'action', title: '操作', width: '0.8fr' },
]

const processedEquipmentData = computed(() => {
  return tableData.value.map((item, index) => ({
    ...item,
    index: index + 1 + (currentPage.value - 1) * pageSize.value,
    sszxName: sszxMap[item.sszx] || item.sszx || '—',
    gdfsName: gdfsMap[item.gdfs] || item.gdfs || '—',
  }))
})

// 监听 visible 变化，显示时加载数据
watch(visible, (val) => {
  if (val) {
    currentPage.value = 1
    searchKeyword.value = ''
    fetchData()
  } else {
    // 关闭时清理
  }
})

const fetchData = async () => {
  loading.value = true
  try {
    if (bridgeData.value?.qlbh) {
      const params: Record<string, string> = {
        page: currentPage.value.toString(),
        rows: pageSize.value.toString(),
        glmbbh: bridgeData.value.qlbh,
      }
      if (searchKeyword.value) {
        params.sbmc = searchKeyword.value
      }
      const res = await getBridgeTargetEquipmentPageList(params)
      if (res && res.rows) {
        tableData.value = res.rows
        total.value = res.records || 0
      } else {
        tableData.value = []
        total.value = 0
      }
    } else {
      // Mock 数据，用于调试交互样式
      tableData.value = [
        { sbbh: 'SB2024001', sbmc: '应变传感器-01', sszx: 'csaqzx_ql', azwz: '主跨跨中截面', gdfs: 'gdfs001', sbyxzt: 'sbyxzt001', sbywzt: 'sbywzt001' },
        { sbbh: 'SB2024002', sbmc: '位移传感器-01', sszx: 'csaqzx_ql', azwz: '桥墩顶部', gdfs: 'gdfs003', sbyxzt: 'sbyxzt001', sbywzt: 'sbywzt001' },
        { sbbh: 'SB2024003', sbmc: '温湿度传感器-01', sszx: 'csaqzx_ql', azwz: '主梁内部', gdfs: 'gdfs002', sbyxzt: 'sbyxzt002', sbywzt: 'sbywzt002' },
        { sbbh: 'SB2024004', sbmc: '加速度传感器-01', sszx: 'csaqzx_ql', azwz: '桥塔顶部', gdfs: 'gdfs001', sbyxzt: 'sbyxzt001', sbywzt: 'sbywzt001' },
        { sbbh: 'SB2024005', sbmc: '倾角传感器-01', sszx: 'csaqzx_ql', azwz: '支座位置', gdfs: 'gdfs001', sbyxzt: 'sbyxzt003', sbywzt: 'sbywzt001' },
        { sbbh: 'SB2024006', sbmc: '风速风向仪-01', sszx: 'csaqzx_ql', azwz: '桥面中段', gdfs: 'gdfs003', sbyxzt: 'sbyxzt001', sbywzt: 'sbywzt001' },
        { sbbh: 'SB2024007', sbmc: '挠度传感器-01', sszx: 'csaqzx_ql', azwz: '主跨1/4截面', gdfs: 'gdfs002', sbyxzt: 'sbyxzt002', sbywzt: 'sbywzt003' },
        { sbbh: 'SB2024008', sbmc: '索力传感器-01', sszx: 'csaqzx_ql', azwz: '斜拉索锚固端', gdfs: 'gdfs001', sbyxzt: 'sbyxzt001', sbywzt: 'sbywzt001' },
      ]
      total.value = 8
    }
  } catch (error) {
    console.error('获取桥梁设备列表失败:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  bottomPanelStore.hidePanel()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  fetchData()
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchData()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData()
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchData()
}

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1
})

const visiblePages = computed(() => {
  const pages = []
  const t = totalPages.value
  const c = currentPage.value
  let start = Math.max(1, c - 2)
  let end = Math.min(t, c + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(t, 5)
    if (end === t) start = Math.max(1, t - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatDeviceStatus = (sbyxzt: string) => {
  const item = sbyxztDict.value.find((d: any) => d.f_ItemValue === sbyxzt)
  return item?.f_ItemName || sbyxzt || '—'
}

const formatMaintStatus = (sbywzt: string) => {
  const item = sbywztDict.value.find((d: any) => d.f_ItemValue === sbywzt)
  return item?.f_ItemName || sbywzt || '—'
}

// 查看设备 - 通知父组件显示详情弹窗
const handleViewEquipment = (equipment: any) => {
  emit('equipment-view', equipment)
}
</script>

<style lang="scss" scoped>
.equipment-dialog {
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

    .close-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(22, 119, 255, 0.1);
      }

      &:active {
        transform: scale(0.95);
      }
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

      .reset-btn {
        height: 60px;
        padding: 0 24px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: #ffffff;
        font-size: var(--font-size-heading);
        font-family: SourceHanSansSC, SourceHanSansSC;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .data-table {
      flex: 1;
      overflow: hidden;
      margin-top: 20px;

      .status-text {
        color: #ffffff;
        font-size: var(--font-size-heading);
      }

      .view-btn {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: var(--font-size-heading);
        color: #3FFFFF;
        line-height: 60px;
        text-align: left;
        font-style: normal;
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
          cursor: not-a allowed;
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
