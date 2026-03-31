<template>
  <div class="warning-disposal-table-container">
    <!-- 表格标题 -->
    <div class="table-header">
      <span class="table-title gradient-text">{{ title }}</span>
    </div>

    <!-- 表格主体 -->
    <div class="table-wrapper">
      <!-- 表头 -->
      <div class="table-head" :style="{ gridTemplateColumns: gridTemplate }">
        <div
          v-for="column in columns"
          :key="column.key"
          class="table-cell header-cell"
          :class="[`col-${column.key}`, column.className]"
        >
          {{ column.title }}
        </div>
      </div>

      <!-- 表体 -->
      <div class="table-body" ref="tableBodyRef" @mouseenter="pauseScroll" @mouseleave="resumeScroll">
        <template v-if="loopData && loopData.length > 0">
          <div
            v-for="(row, index) in loopData"
            :key="`${getRowKey(row, index % data!.length)}-${index}`"
            class="table-row"
            :class="{ 'row-even': index % 2 === 1, 'row-odd': index % 2 === 0 }"
            :style="{ gridTemplateColumns: gridTemplate }"
          >
            <div
              v-for="column in columns"
              :key="`${column.key}-${index}`"
              class="table-cell body-cell"
              :class="[`col-${column.key}`, column.className]"
              :title="getCellTitle(row, column)"
            >
              <slot
                :name="column.key"
                :row="row"
                :index="index % data!.length"
                :value="getRowValue(row, column)"
              >
                {{ getRowValue(row, column) }}
              </slot>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="table-row empty-row" :style="{ gridTemplateColumns: gridTemplate }">
            <div class="table-cell empty-cell">
              {{ emptyText }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

// 定义列配置接口
interface TableColumn {
  key: string
  title: string
  width?: string | number
  className?: string
  formatter?: (value: any, row: any, index: number) => any
}

// 定义行数据接口
interface TableRow {
  [key: string]: any
}

// 组件属性
interface Props {
  title?: string
  columns: TableColumn[]
  data?: TableRow[]
  emptyText?: string
  rowKey?: string
  gridTemplate?: string
  autoScroll?: boolean
  scrollSpeed?: number
  visibleRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  data: () => [],
  emptyText: '暂无数据',
  rowKey: 'id',
  gridTemplate: '',
  autoScroll: true,
  scrollSpeed: 1,
  visibleRows: 6,
})

const tableBodyRef = ref<HTMLElement | null>(null)
let scrollTimer: ReturnType<typeof setInterval> | null = null
let isPaused = false
const ROW_HEIGHT = 78 // 行高（px）

// 复制一份数据用于无缝循环滚动
const loopData = computed(() => {
  if (!props.data || props.data.length === 0) return []
  return [...props.data, ...props.data]
})

// 计算网格布局
const gridTemplate = computed(() => {
  if (props.gridTemplate) return props.gridTemplate

  return props.columns
    .map(column => {
      if (column.width) {
        return typeof column.width === 'number'
          ? `${column.width}px`
          : column.width
      }
      return '1fr'
    })
    .join(' ')
})

// 获取行的唯一 key
const getRowKey = (row: TableRow, index: number): string | number => {
  return row[props.rowKey] ?? index
}

// 获取单元格显示值
const getRowValue = (row: TableRow, column: TableColumn): any => {
  const value = row[column.key]
  if (column.formatter) {
    return column.formatter(value, row, props.data?.indexOf(row) ?? 0)
  }
  return value
}

// 获取单元格 title 属性
const getCellTitle = (row: TableRow, column: TableColumn): string => {
  const value = getRowValue(row, column)
  return typeof value === 'string' ? value : ''
}

// 自动滚动逻辑（逐条无缝循环）
const startAutoScroll = () => {
  if (!props.autoScroll) return

  scrollTimer = setInterval(() => {
    if (!tableBodyRef.value || isPaused) return

    const { scrollTop, scrollHeight } = tableBodyRef.value
    const halfHeight = scrollHeight / 2

    // 当滚动超过原始数据高度时，静默重置
    if (scrollTop >= halfHeight) {
      tableBodyRef.value.scrollTop = scrollTop - halfHeight
    }

    // 平滑滚动一行
    tableBodyRef.value.scrollBy({ top: ROW_HEIGHT, behavior: 'smooth' })
  }, 3000)
}

// 停止自动滚动
const stopAutoScroll = () => {
  if (scrollTimer !== null) {
    clearInterval(scrollTimer)
    scrollTimer = null
  }
}

// 鼠标悬停暂停
const pauseScroll = () => {
  isPaused = true
}

// 鼠标离开恢复
const resumeScroll = () => {
  isPaused = false
}

onMounted(() => {
  if (props.autoScroll) {
    startAutoScroll()
  }
})

onBeforeUnmount(() => {
  stopAutoScroll()
})

// 数据变化时重置滚动位置
watch(() => props.data, () => {
  if (tableBodyRef.value) {
    tableBodyRef.value.scrollTop = 0
  }
})
</script>

<style lang="scss" scoped>
.warning-disposal-table-container {
  width: 100%;
  height: 520px;
  display: flex;
  flex-direction: column;

  // 表格标题
  .table-header {
    width: 100%;
    height: 70px;
    background-image: url("@/assets/img/homeModule/risk_hazard_head_bg.webp");
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 16px;

    .table-title {
      font-family: YouSheBiaoTiHei;
      font-size: 36px;
      color: #FFFFFF;
      line-height: 47px;
      text-align: left;
      font-style: normal;
      background: linear-gradient(180deg, #FFFFFF 0%, #10ADC0 100%);
    }
  }

  // 表格包装器
  .table-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 2px solid #09739C;
    border-radius: 6px;
    overflow: hidden;
    min-height: 0;
  }

  // 表头样式
  .table-head {
    display: grid;
    min-height: 64px;
    background: #2A5768;
    border-bottom: 2px solid #09739C;
    flex-shrink: 0;

    .header-cell {
      display: flex;
      align-items: center;
      padding-left: 8px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 28px;
      color: #E4F3FF;
      line-height: 40px;
      text-align: left;
      font-style: normal;
      border-right: 1px solid rgba(22, 119, 255, 0.15);

      &:last-child {
        border-right: none;
      }

      &.col-name,
      &[class*="name"] {
        justify-content: flex-start;
        text-align: left;
        padding-left: 20px;
      }
    }
  }

  // 表体样式
  .table-body {
    flex: 1;
    overflow-y: auto;
    background: rgba(13, 35, 42, 0.3);
    min-height: 0;

    // 斑马线样式
    .table-row {
      display: grid;
      height: 78px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.1);
      transition: background-color 0.2s ease;

      // 奇数行
      &.row-odd {
        background: rgba(0, 0, 0, 0.3);
      }

      // 偶数行
      &.row-even {
        background: rgba(49, 49, 49, 0.3);
      }

      &:hover {
        background: rgba(22, 119, 255, 0.1);
      }
    }

    // 空数据行
    .empty-row {
      .empty-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 120px;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-size: 24px;
        color: rgba(255, 255, 255, 0.5);
        grid-column: 1 / -1;
      }
    }
  }

  // 单元格通用样式
  .table-cell {
    padding-left: 12px;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: 30px;
    color: #E4F3FF;
    line-height: 58px;
    text-align: left;
    font-style: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;

    &.col-name,
    &[class*="name"] {
      text-align: left;
      padding-left: 20px;
    }
  }

  // 滚动条样式
  .table-body::-webkit-scrollbar {
    width: 6px;
  }

  .table-body::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }

  .table-body::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(22, 119, 255, 0.6) 0%, rgba(13, 165, 190, 0.6) 100%);
    border-radius: 3px;
  }
}
</style>
