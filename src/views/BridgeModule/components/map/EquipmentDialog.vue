<template>
  <div class="equipment-dialog" v-show="visible">
    <div class="dialog-header">
      <div class="dialog-title gradient-text">监测设备列表</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" class="action-icon favorite-icon" />
      </n-button>
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
import { useVueCesium } from 'vue-cesium'
import { getBridgeTargetEquipmentPageList } from '@/services/bridgeService'
import { Close } from '@vicons/ionicons5'
import { NButton, NIcon } from 'naive-ui'
import CommonTable from '@/components/CommonTable.vue'
import BridgeMarkerIcon from '@/assets/img/bridgeModule/bridge_marker.webp'

const viewer = ref<Cesium.Viewer | null>(null)

onMounted(async () => {
  const $vc = useVueCesium()
  const readyObj = await $vc.creatingPromise
  viewer.value = readyObj.viewer
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  bridgeData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:visible'])

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
watch(() => props.visible, (val) => {
  if (val) {
    currentPage.value = 1
    searchKeyword.value = ''
    fetchData()
  } else {
    // 关闭时移除设备标记
    try {
      if (viewer.value) {
        const marker = viewer.value.entities.getById('equipment-marker')
        if (marker) viewer.value.entities.remove(marker)
      }
    } catch (e) {
      console.warn('移除设备标记失败:', e)
    }
  }
})

const fetchData = async () => {
  if (!props.bridgeData?.qlbh) return

  loading.value = true
  try {
    const params: Record<string, string> = {
      page: currentPage.value.toString(),
      rows: pageSize.value.toString(),
      glmbbh: props.bridgeData.qlbh,
    }
    if (searchKeyword.value) {
      params.sbmc = searchKeyword.value
    }
    const res = await getBridgeTargetEquipmentPageList(params)
    if (res && res.rows) {
      tableData.value = res.rows;
      total.value = res.total || 0
    } else {
      tableData.value = []
      total.value = 0
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
  emit('update:visible', false)
}

const handleSearch = () => {
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
  const map: Record<string, string> = {
    'sbyxzt001': '在线',
    'sbyxzt002': '离线',
    'sbyxzt003': '故障',
  }
  return map[sbyxzt] || sbyxzt || '—'
}

const getDeviceStatusClass = (sbyxzt: string) => {
  const map: Record<string, string> = {
    'sbyxzt001': 'status-online',
    'sbyxzt002': 'status-offline',
    'sbyxzt003': 'status-fault',
  }
  return map[sbyxzt] || ''
}

const formatMaintStatus = (sbywzt: string) => {
  const map: Record<string, string> = {
    'sbywzt001': '完好',
    'sbywzt002': '维修',
    'sbywzt003': '停用',
  }
  return map[sbywzt] || sbywzt || '—'
}

const getMaintStatusClass = (sbywzt: string) => {
  const map: Record<string, string> = {
    'sbywzt001': 'status-online',
    'sbywzt002': 'status-fault',
    'sbywzt003': 'status-offline',
  }
  return map[sbywzt] || ''
}

// 查看设备位置 - 在地图上标注并飞行
const handleViewEquipment = (equipment: any) => {
  if (!viewer.value) {
    console.warn('Cesium viewer 实例未找到')
    return
  }
  const lng = equipment.jd || equipment.longitude
  const lat = equipment.wd || equipment.latitude
  if (!lng || !lat) {
    console.warn('设备缺少位置数据')
    return
  }

  // 移除之前的设备标记
  const existingMarker = viewer.value.entities.getById('equipment-marker')
  if (existingMarker) {
    viewer.value.entities.remove(existingMarker)
  }

  // 添加设备标记
  const entity = viewer.value.entities.add({
    id: 'equipment-marker',
    position: Cesium.Cartesian3.fromDegrees(lng, lat),
    billboard: {
      image: BridgeMarkerIcon,
      scale: 1.0,
      scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0),
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    }
  })

  viewer.value.flyTo(entity, {
    duration: 2,
    offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 1000),
  })
}
</script>

<style lang="scss" scoped>
.equipment-dialog {
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
    }

    .data-table {
      flex: 1;
      overflow: auto;
      margin-top: 20px;

      .status-text {
        color: #ffffff;
        font-size: var(--font-size-sm);
      }

      .view-btn {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 30px;
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
