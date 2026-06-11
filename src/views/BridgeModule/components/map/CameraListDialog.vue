<template>
  <div class="camera-dialog" v-show="visible" :style="{ left: dialogLeft, width: dialogWidth }">
    <div class="dialog-header">
      <div class="dialog-title gradient-text">监控视频列表</div>
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
            placeholder="输入监控名称"
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
          :columns="cameraColumns"
          :data="processedCameraData"
          row-key="lsh"
          :empty-text="loading ? '加载中...' : '暂无监控数据'"
          :max-height="400"
          grid-template="0.6fr 1.5fr 2fr 2fr 1fr 0.8fr"
        >
          <template #sfzx="{ row }">
            <span :class="['status-text', row.sfzx === 1 ? 'status-online' : 'status-offline']">
              {{ row.sfzx === 1 ? '在线' : '离线' }}
            </span>
          </template>
          <template #action="{ row }">
            <n-button text type="primary" class="view-btn" @click="handleViewCamera(row)">查看</n-button>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useVueCesium } from 'vue-cesium'
import { getSurveillanceVideoPage } from '@/services/surveillanceVideoService'
import { Close } from '@vicons/ionicons5'
import { NButton, NIcon } from 'naive-ui'
import CommonTable from '@/components/CommonTable.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  bridgeName: {
    type: String,
    default: '',
  },
  dialogLeft: {
    type: String,
    default: '1320px',
  },
  dialogWidth: {
    type: String,
    default: '1920px',
  },
})

const emit = defineEmits(['update:visible', 'camera-view', 'cameras-loaded'])

const viewer = ref<Cesium.Viewer | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<any[]>([])
const loading = ref(false)

const cameraColumns = [
  { key: 'index', title: '序号', width: '0.6fr' },
  { key: 'spbh', title: '设备编号', width: '1.5fr' },
  { key: 'spmc', title: '监控名称', width: '2fr' },
  { key: 'spszwz', title: '所在位置', width: '2fr' },
  { key: 'sfzx', title: '状态', width: '1fr' },
  { key: 'action', title: '操作', width: '0.8fr' },
]

const processedCameraData = computed(() => {
  return tableData.value.map((item, index) => ({
    ...item,
    index: index + 1 + (currentPage.value - 1) * pageSize.value,
  }))
})

onMounted(async () => {
  const $vc = useVueCesium()
  const readyObj = await $vc.creatingPromise
  viewer.value = readyObj.viewer
})

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val) {
    currentPage.value = 1
    searchKeyword.value = ''
    fetchData()
  } else {
    // 关闭时清除所有监控标记
    removeAllCameraMarkers()
  }
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {
      page: currentPage.value.toString(),
      rows: pageSize.value.toString(),
      sszx: 'csaqzx_ql',
    }
    if (searchKeyword.value) {
      params.spmc = searchKeyword.value
    }
    if (props.bridgeName) {
      params.spszwz = props.bridgeName
    }
    const res = await getSurveillanceVideoPage(params)
    if (res && res.rows) {
      tableData.value = res.rows
      total.value = res.records || 0
      emit('cameras-loaded', res.rows)
      // 显示所有监控点位
      showAllCameraMarkers(res.rows)
    } else {
      tableData.value = []
      total.value = 0
      removeAllCameraMarkers()
    }
  } catch (error) {
    console.error('获取监控视频列表失败:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ==================== 地图标记管理 ====================

const CAMERA_MARKER_PREFIX = 'camera-list-'

/** 在地图上显示所有监控点位 */
const showAllCameraMarkers = (cameras: any[]) => {
  if (!viewer.value) return
  // 先清除旧标记
  removeAllCameraMarkers()

  cameras.forEach((camera) => {
    if (!camera.spdwjd || !camera.spdwwd) return
    const markerId = `${CAMERA_MARKER_PREFIX}${camera.lsh}`
    viewer.value!.entities.add({
      id: markerId,
      position: Cesium.Cartesian3.fromDegrees(camera.spdwjd, camera.spdwwd),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#ff9900'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0.4),
      },
      label: {
        text: camera.spmc || '',
        font: '14px SourceHanSansSC',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        scaleByDistance: new Cesium.NearFarScalar(500, 1, 1000000, 0.4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  })
}

/** 清除所有监控点位标记 */
const removeAllCameraMarkers = () => {
  if (!viewer.value) return
  const entities = viewer.value.entities.values
  const toRemove = entities.filter((e: any) => e.id?.startsWith(CAMERA_MARKER_PREFIX))
  toRemove.forEach((e: any) => viewer.value!.entities.remove(e))
}

const handleClose = () => {
  removeAllCameraMarkers()
  emit('update:visible', false)
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

const handleViewCamera = (camera: any) => {
  emit('camera-view', camera)
}

onBeforeUnmount(() => {
  removeAllCameraMarkers()
})
</script>

<style lang="scss" scoped>
.camera-dialog {
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
      font-size: var(--font-size-hero);
      color: #FFFFFF;
      line-height: 57px;
      text-align: left;
      font-style: normal;
      background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
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
        font-size: var(--font-size-heading);
      }

      .status-online {
        color: #04f767;
      }

      .status-offline {
        color: #f75e04;
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
