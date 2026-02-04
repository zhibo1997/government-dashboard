<template>
  <div class="common-table-container">
    <!-- 表格标题（可选） -->
    <div v-if="title" class="table-header">
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
      <div class="table-body">
        <template v-if="data && data.length > 0">
          <div
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
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
                :index="index"
                :value="getRowValue(row, column)"
              >
                {{ getRowValue(row, column) }}
              </slot>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="table-row empty-row" :style="{ gridTemplateColumns: gridTemplate }">
            <div class="table-cell empty-cell" :colspan="columns.length">
              {{ emptyText }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  // 表格标题
  title?: string
  // 列配置
  columns: TableColumn[]
  // 表格数据
  data?: TableRow[]
  // 空数据提示文字
  emptyText?: string
  // 行唯一标识字段名
  rowKey?: string
  // 自定义grid模板列（可选）
  gridTemplate?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  data: () => [],
  emptyText: '暂无数据',
  rowKey: 'id',
  gridTemplate: ''
})

// 计算grid模板
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

// 获取行的唯一key
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

// 获取单元格title属性（用于鼠标悬停显示完整内容）
const getCellTitle = (row: TableRow, column: TableColumn): string => {
  const value = getRowValue(row, column)
  return typeof value === 'string' ? value : ''
}
</script>

<style lang="scss" scoped>
.common-table-container {
  width: 100%;
  height: 100%;
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
  }
  
  // 表头样式
  .table-head {
    display: grid;
    min-height: 60px;
    background: #2A5768;
    border-bottom: 2px solid #09739C;
    
    .header-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 600;
      font-size: 24px;
      color: #E4F3FF;
      line-height: 1.4;
      text-align: center;
      border-right: 1px solid rgba(22, 119, 255, 0.15);
      
      &:last-child {
        border-right: none;
      }
      
      // 左对齐的列
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
    
    // 斑马线样式
    .table-row {
      display: grid;
      min-height: 58px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.1);
      transition: background-color 0.2s ease;
      
      // 奇数行（浅色背景）
      &.row-odd {
        background: rgba(0, 0, 0, 0.3);
      }
      
      // 偶数行（深色背景）
      &.row-even {
        background: rgba(49, 49, 49, 0.3);
      }
      
      &:hover {
        background: rgba(22, 119, 255, 0.1);
      }
      
      &:last-child {
        border-bottom: none;
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
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-size: 24px;
    color: #E4F3FF;
    line-height: 1.4;
    text-align: center;
    padding: 14px 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    // 左对齐的列
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