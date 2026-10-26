<template>
  <Teleport to="body">
    <div
      v-if="visible && equipmentData"
      class="equipment-point-popup"
      :style="popupStyle"
      @click.stop
    >
      <!-- 背景层 -->
      <div class="popup-bg"></div>

      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="popup-title">{{ displayTitle }}</div>
        <div class="popup-close" @click="handleClose">
          <n-icon size="48" color="#11a7e2" :component="Close" />
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <div class="popup-scroll">
          <!-- 切换按钮 -->
          <div class="toggle-bar">
            <button
              class="toggle-btn"
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >基础信息</button>
            <button
              class="toggle-btn"
              :class="{ active: activeTab === 'trend' }"
              @click="switchToTrend"
            >数据趋势</button>
          </div>

          <!-- 基础信息 -->
          <div v-show="activeTab === 'info'" class="info-section">
            <div class="info-row">
              <label class="info-label">设备编号：</label>
              <span class="info-value">{{ equipmentData?.sbbh || '—' }}</span>
            </div>
            <div class="info-row">
              <label class="info-label">安装位置：</label>
              <span class="info-value">{{ equipmentData.azwz || '—' }}</span>
            </div>
            <div class="info-row" v-if="monitorTime">
              <label class="info-label">监测时间：</label>
              <span class="info-value">{{ formatTime(monitorTime) }}</span>
            </div>
            <template v-if="monitorValues.length > 0">
              <div class="info-row" v-for="(item, index) in monitorValues" :key="index">
                <label class="info-label">{{ item.name }}：</label>
                <span class="info-value">{{ item.value }} {{ item.unit }}</span>
              </div>
            </template>
            <div v-else class="empty-tip">暂无监测数据</div>
          </div>

          <!-- 数据趋势 -->
          <div v-show="activeTab === 'trend'" class="trend-section">
            <div class="filter-toolbar">
              <n-date-picker
                v-model:value="dateRange"
                type="daterange"
                size="large"
                clearable
                :to="false"
                :is-date-disabled="disableFutureDate"
                :theme-overrides="datePickerThemeOverrides"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                class="filter-date-picker"
                format="yyyy-MM-dd"
              />
              <button class="filter-btn btn-search" @click="handleSearch">查询</button>
              <button class="filter-btn btn-reset" @click="handleReset">重置</button>
            </div>
            <div v-if="chartLoading" class="empty-tip">加载中...</div>
            <div v-else-if="chartReady">
              <div ref="lineChartRef" class="line-chart"></div>
            </div>
            <div v-else class="empty-tip">暂无历史趋势数据</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, ref, inject, onBeforeUnmount } from 'vue'
import { NIcon, NDatePicker } from 'naive-ui'
import { Close } from '@vicons/ionicons5'
import { FONT_SIZE } from '@/assets/styles/font-sizes'
import { getEquipmentData, getEquipmentPageList } from '@/services/gasService'
import { getCachedDictionary } from '@/services/dictionaryService'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

const props = defineProps<{
  visible: boolean
  equipmentData: any | null
  sblxDictKeys?: string[]
}>()

const emit = defineEmits(['close'])

const scaleRatio = inject<any>('responsiveScale', ref(1))

const popupStyle = computed(() => ({
  left: '50%',
  top: '50%',
  transform: `scale(${scaleRatio.value})`,
  transformOrigin: 'left top',
}))

// 字典
const jczbDictMap = ref<Record<string, { name: string; unit: string }>>({})

// 标题
const displayTitle = computed(() => {
  const data = props.equipmentData
  if (!data) return '设备详情'
  return data.sbmc || data.sbbh || '设备详情'
})

// 监测时间
const monitorTime = computed(() => props.equipmentData?.jcsj || null)

// 解析最新监测值
const monitorValues = computed(() => {
  const raw = props.equipmentData?.jcz
  if (!raw) return []
  try {
    const jcz = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Object.entries(jcz).map(([key, val]: [string, any]) => ({
      key,
      name: jczbDictMap.value[key]?.name || key,
      value: val.jcz || '—',
      unit: val.jcdw || '',
    }))
  } catch {
    return []
  }
})

const formatTime = (ts: number) => {
  if (!ts) return '—'
  return dayjs(ts).format('YYYY-MM-DD HH:mm:ss')
}

// ============ Tab 切换与筛选 ============
const activeTab = ref<'info' | 'trend'>('info')
const chartLoading = ref(false)
const chartReady = ref(false)
const lineChartRef = ref<HTMLDivElement | null>(null)
let lineChartInstance: echarts.ECharts | null = null
let chartResizeObserver: ResizeObserver | null = null

// 自由时间范围筛选
const dateRange = ref<[number, number] | null>(null)
const allRawRecords = ref<any[]>([])

// 限制不能选择之后的时间（今天之后的日期禁用）
const disableFutureDate = (ts: number) => {
  return ts > dayjs().endOf('day').valueOf()
}

// 日历展开面板超大尺寸配置（字号、单元格尺寸、年月标题等全面放大）
const datePickerThemeOverrides = {
  itemFontSize: '26px',
  calendarDaysFontSize: '24px',
  calendarTitleFontSize: '26px',
  itemSize: '48px',
  itemCellWidth: '62px',
  itemCellHeight: '52px',
  calendarTitleHeight: '56px',
  arrowSize: '26px',
  calendarDaysHeight: '52px',
  calendarTitleGridTempateColumns: '48px 48px 1fr 48px 48px',
  calendarLeftPaddingDaterange: '8px 10px 6px 10px',
  calendarRightPaddingDaterange: '8px 10px 6px 10px',
}

// 获取监测历史趋势数据
const fetchTrendData = async () => {
  const data = props.equipmentData
  const sbbh = data?.sbbh || ''
  const sblx = data?.sblx || ''
  if (!sbbh || !sblx) return

  chartLoading.value = true
  try {
    // 获取 gldwbh：先从 equipmentData 取，没有则通过设备列表接口查询
    let gldwbh = data?.gldwbh || data?.dwbm || ''
    if (!gldwbh) {
      const pageRes = await getEquipmentPageList({ sblx, rows: '1000' })
      const matched = pageRes?.rows?.find((r: any) => r.sbbh === sbbh)
      gldwbh = matched?.gldwbh || matched?.dwbm || ''
    }

    if (!gldwbh) {
      chartLoading.value = false
      return
    }

    const params: any = {
      gldwbh,
      sbbh,
      sblx,
    }

    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      const start = dayjs(dateRange.value[0]).startOf('day')
      const end = dayjs(dateRange.value[1]).endOf('day')
      params.startTime = start.format('YYYY-MM-DD HH:mm:ss')
      params.endTime = end.format('YYYY-MM-DD HH:mm:ss')
    } else {
      params.number = 20
    }

    const res = await getEquipmentData(params)
    allRawRecords.value = res || []
    applyFilterAndRender()
  } catch (e) {
    console.error('获取设备监测数据失败:', e)
    allRawRecords.value = []
    applyFilterAndRender()
  } finally {
    chartLoading.value = false
  }
}

// 筛选并渲染图表
const applyFilterAndRender = () => {
  let records = allRawRecords.value || []
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startMs = dayjs(dateRange.value[0]).startOf('day').valueOf()
    const endMs = dayjs(dateRange.value[1]).endOf('day').valueOf()
    records = records.filter((item: any) => {
      const ts = Number(item.jcsj)
      return ts >= startMs && ts <= endMs
    })
  }

  if (records.length > 0) {
    chartReady.value = true
    setTimeout(() => initLineChart(records), 150)
  } else {
    chartReady.value = false
    if (lineChartInstance) {
      lineChartInstance.dispose()
      lineChartInstance = null
    }
  }
}

const switchToTrend = async () => {
  activeTab.value = 'trend'
  if (allRawRecords.value.length > 0) {
    applyFilterAndRender()
    return
  }
  await fetchTrendData()
}

// 查询操作
const handleSearch = async () => {
  await fetchTrendData()
}

// 重置操作
const handleReset = async () => {
  dateRange.value = null
  await fetchTrendData()
}

// 折线图
const initLineChart = (rawData: any[]) => {
  if (!lineChartRef.value || !rawData?.length) return
  if (lineChartInstance) { lineChartInstance.dispose(); lineChartInstance = null }

  const chart = echarts.init(lineChartRef.value)
  lineChartInstance = chart

  // 按时间升序排序
  const sorted = [...rawData].sort((a, b) => Number(a.jcsj) - Number(b.jcsj))
  const processed = sorted.map(item => {
    let jcz = {}
    try { jcz = JSON.parse(item.jcz) } catch {}
    return { jcsj: item.jcsj, jcz }
  })

  const indicators: string[] = []
  const seriesData: Record<string, { t: number; v: number }[]> = {}
  if (processed.length && Object.keys(processed[0].jcz).length) {
    Object.keys(processed[0].jcz).forEach(key => {
      indicators.push(jczbDictMap.value[key]?.name || key)
      seriesData[key] = []
    })
  }
  processed.forEach(item => {
    Object.keys(item.jcz).forEach(key => {
      if (seriesData[key]) {
        seriesData[key].push({ t: item.jcsj, v: parseFloat((item.jcz as any)[key]?.jcz) || 0 })
      }
    })
  })

  const timestamps = processed.map(i => i.jcsj)
  const multiDay = new Set(timestamps.map((ts: number) => dayjs(ts).format('YYYY-MM-DD'))).size > 1
  const fmt = multiDay ? 'MM-DD HH:mm' : 'HH:mm'
  const xData = timestamps.map((ts: number) => dayjs(ts).format(fmt))
  const fontSize = 32

  const series = Object.keys(seriesData).map((key, i) => ({
    name: indicators[i] || key,
    type: 'line' as const,
    data: seriesData[key].map(d => d.v),
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
  }))

  let unit = ''
  const first = Object.values(processed[0]?.jcz || {})[0]
  if (first && typeof first === 'object') unit = (first as any).jcdw || ''

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: 'rgba(13, 165, 190, 0.5)',
      textStyle: { color: '#e4f3ff', fontSize },
      formatter: (params: any) => {
        if (!Array.isArray(params)) return ''
        let html = `<div style="margin-bottom:4px;color:#9ec3e8;font-size:${fontSize}px">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          html += `<div style="display:flex;align-items:center;gap:6px;font-size:${fontSize}px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            ${p.seriesName}: <b>${p.value}</b> ${unit}
          </div>`
        })
        return html
      },
    },
    legend: { data: indicators, top: 0, textStyle: { color: '#9ec3e8', fontSize }, itemWidth: 16, itemHeight: 8 },
    grid: { left: 16, right: 20, top: 32, bottom: 10, containLabel: true },
    xAxis: {
      type: 'category', data: xData,
      axisLabel: { color: '#9ec3e8', fontSize, interval: 'auto' },
      axisLine: { lineStyle: { color: 'rgba(13, 165, 190, 0.3)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ec3e8', fontSize },
      splitLine: { lineStyle: { color: 'rgba(13, 165, 190, 0.15)' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series,
  })

  chartResizeObserver?.disconnect()
  chartResizeObserver = new ResizeObserver(() => chart.resize())
  chartResizeObserver.observe(lineChartRef.value!)
  setTimeout(() => chart.resize(), 100)
}

// 字典初始化
let dictInitialized = false
watch(() => props.visible, async (v) => {
  if (v && !dictInitialized) {
    dictInitialized = true
    try {
      const keys = props.sblxDictKeys || ['jcsblx_rq', 'jcsblx_rqzdyh']
      const results = await Promise.all([
        ...keys.map((k: string) => getCachedDictionary(k)),
        getCachedDictionary('jczbzd'),
      ])
      const jczbDict = results.pop()
      if (jczbDict?.length) {
        jczbDictMap.value = jczbDict.reduce((acc: Record<string, any>, cur: any) => {
          acc[cur.f_ItemValue] = { name: cur.f_ItemName, unit: cur.f_Description || '' }
          return acc
        }, {})
      }
    } catch (e) {
      console.error('加载字典失败:', e)
    }
  }
  if (!v) {
    activeTab.value = 'info'
    chartReady.value = false
    chartLoading.value = false
    dateRange.value = null
    allRawRecords.value = []
    if (lineChartInstance) { lineChartInstance.dispose(); lineChartInstance = null }
    chartResizeObserver?.disconnect()
    chartResizeObserver = null
  }
})

watch(
  () => props.equipmentData,
  () => {
    allRawRecords.value = []
    chartReady.value = false
    dateRange.value = null
    if (props.visible && activeTab.value === 'trend') {
      fetchTrendData()
    }
  },
  { deep: true }
)

const handleClose = () => emit('close')

onBeforeUnmount(() => {
  chartResizeObserver?.disconnect()
  if (lineChartInstance) { lineChartInstance.dispose(); lineChartInstance = null }
})
</script>

<style scoped lang="scss">
$bg-ratio-w: 390;
$bg-ratio-h: 229;

.equipment-point-popup {
  position: fixed;
  z-index: 9999;
  width: 1008px;
  height: 744px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;

  .popup-bg {
    position: absolute;
    inset: 0;
    background-image: url('@/assets/img/points/gas-point-popup-bg.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 0;
  }

  .popup-header {
    position: relative;
    flex-shrink: 0;
    height: 110px;
    padding: 0 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 2;

    .popup-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-title);
      line-height: calc(var(--font-size-title) * 1.3);
      color: #ffffff;
      font-weight: bold;
      position: relative;
      left: 28px;
    }

    .popup-close {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      &:hover { opacity: 0.8; }
    }
  }

  .popup-content {
    flex: 1;
    min-height: 0;
    padding: 16px 40px 16px;
    z-index: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .popup-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;

    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
    &::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.3); border-radius: 3px; }
  }

  // 切换按钮
  .toggle-bar {
    display: flex;
    flex-shrink: 0;
    border: 2px solid rgba(13, 165, 190, 0.4);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 36px;

    .toggle-btn {
      flex: 1;
      padding: 5px 0;
      text-align: center;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-heading);
      line-height: calc(var(--font-size-heading) * 1.3);
      color: #7fd3f2;
      background: rgba(0, 30, 45, 0.4);
      cursor: pointer;
      transition: all 0.2s;
      border: none;

      &:first-child {
        border-right: 1px solid rgba(13, 165, 190, 0.3);
      }

      &.active {
        background: rgba(13, 165, 190, 0.3);
        color: #ffffff;
      }

      &:hover:not(.active) {
        background: rgba(13, 165, 190, 0.15);
      }
    }
  }

  // 基础信息 - label:value 样式
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .info-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-normal);
        font-size: var(--font-size-subtitle);
        line-height: calc(var(--font-size-subtitle) * 1.3);
        color: #ffffff;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .info-value {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: var(--font-weight-normal);
        font-size: var(--font-size-subtitle);
        line-height: calc(var(--font-size-subtitle) * 1.3);
        color: #7fd3f2;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // 数据趋势
  .trend-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  // 自由时间范围筛选栏
  .filter-toolbar {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 10;
    margin-bottom: 36px;
    flex-shrink: 0;

    .filter-btn {
      height: 54px;
      padding: 0 32px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-body);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &.btn-search {
        margin-left: 14px;
        background: rgba(9, 67, 88, 0.85);
        border: 1px solid rgba(17, 167, 226, 0.8);
        color: #ffffff;
        &:hover {
          background: rgba(17, 105, 145, 0.95);
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(17, 167, 226, 0.3);
        }
      }

      &.btn-reset {
        margin-left: 10px;
        background: rgba(0, 30, 45, 0.65);
        border: 1px solid rgba(13, 165, 190, 0.5);
        color: #7fd3f2;
        &:hover {
          background: rgba(13, 165, 190, 0.25);
          border-color: #11a7e2;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(17, 167, 226, 0.2);
        }
      }
    }
  }

  :deep(.filter-date-picker) {
    width: 480px;

    .n-input {
      --n-height: 54px !important;
      --n-font-size: var(--font-size-body) !important;
      background-color: rgba(9, 67, 88, 0.7) !important;
      border: 1px solid #11a7e2 !important;
      border-radius: 6px;
      height: 54px !important;
      color: #ffffff;

      &:hover {
        border-color: #1890ff !important;
      }

      &:focus-within {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }

      .n-input-wrapper {
        height: 54px !important;
        line-height: 54px !important;
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      .n-input__input-el {
        color: #ffffff !important;
        font-size: var(--font-size-body) !important;
        height: 54px !important;
        line-height: 54px !important;
        text-align: center;
        font-weight: 500;
      }

      .n-input__placeholder {
        color: rgba(255, 255, 255, 0.45) !important;
        font-size: var(--font-size-body) !important;
        line-height: 54px !important;
        text-align: center;
      }

      .n-input__separator {
        color: #7fd3f2 !important;
        font-size: var(--font-size-body) !important;
        line-height: 54px !important;
      }

      .n-input__prefix,
      .n-input__suffix {
        .n-base-icon {
          color: #11a7e2;
          font-size: 28px !important;
        }
      }

      .n-input__state-border {
        display: none;
      }
    }

    .n-base-clear {
      color: rgba(255, 255, 255, 0.6);
      font-size: 24px !important;
      &:hover {
        color: #ff4d4f;
      }
    }
  }

  // 展开日历面板样式增强（超大尺寸展示）
  :deep(.n-date-panel) {
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(17, 167, 226, 0.6);
    border-radius: 10px;

    .n-date-panel-month {
      height: 56px !important;
    }

    .n-date-panel-month__text {
      font-size: 26px !important;
      line-height: 30px !important;
      font-weight: bold;
    }

    .n-date-panel-weekdays {
      margin-bottom: 6px !important;
    }

    .n-date-panel-weekdays__day {
      font-size: 24px !important;
      line-height: 1 !important;
      font-weight: 600;
      width: 48px !important;
      height: 48px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .n-date-panel-date {
      font-size: 26px !important;
      font-weight: 500;

      .n-date-panel-date__trigger {
        font-size: 26px !important;
      }
    }

    .n-date-panel-month__prev,
    .n-date-panel-month__next,
    .n-date-panel-month__fast-prev,
    .n-date-panel-month__fast-next {
      font-size: 26px !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      .n-base-icon,
      svg {
        width: 26px !important;
        height: 26px !important;
      }
    }

    .n-date-panel-actions {
      padding: 10px 16px !important;

      .n-button {
        font-size: 20px !important;
        height: 40px !important;
        padding: 0 18px !important;
      }
    }
  }

  .line-chart {
    width: 100%;
    height: 400px;
  }

  .empty-tip {
    text-align: center;
    color: rgba(127, 211, 242, 0.5);
    font-size: var(--font-size-heading);
    padding: 36px 0;
  }
}
</style>
