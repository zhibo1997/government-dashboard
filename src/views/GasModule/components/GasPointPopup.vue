<template>
  <Teleport to="body">
    <div
      v-if="visible && pointData"
      class="gas-point-popup"
      :style="popupStyle"
      @click.stop
    >
      <!-- 头部 -->
      <div class="popup-header">
        <div class="popup-title">{{ title }}</div>
        <div class="popup-close" @click="$emit('close')">
          <n-icon size="64" color="rgb(17,167,226)" :component="Close" />
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <div class="popup-row" v-for="(item, index) in displayFields" :key="index">
          <label class="popup-label">{{ item.label }}：</label>
          <span class="popup-value">{{ item.value || '—' }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { NIcon } from 'naive-ui'
import { Close } from "@vicons/ionicons5"
import { mapToLabelValue } from '@/config/fieldLabelConfig'

interface DisplayField {
  label: string
  value: string | number | null
}

const props = defineProps<{
  visible: boolean
  pointData: any | null
  position: { x: number; y: number }
  pointType: string
}>()

defineEmits(['close'])

// 响应式缩放
const scaleRatio = inject<any>('responsiveScale', ref(1))

// 标题
const title = computed(() => {
  if (!props.pointData) return '详情'
  const data = props.pointData
  if (props.pointType === '燃气井盖') return data.jgbh || '井盖详情'
  if (props.pointType === '燃气企业') return data.qymc || '企业详情'
  if (props.pointType === '液化气企业') return data.qymc || '企业详情'
  return '详情'
})

// 弹窗位置样式 - 居中显示 + 缩放
const popupStyle = computed(() => {
  return {
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) scale(${scaleRatio.value})`,
  }
})

// 统一使用 mapToLabelValue 映射字段
const displayFields = computed<DisplayField[]>(() => {
  if (!props.pointData) return []
  return mapToLabelValue(props.pointData) as DisplayField[]
})
</script>

<style scoped lang="scss">
.gas-point-popup {
  position: fixed;
  z-index: 9999;
  width: 840px;
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  flex-direction: column;

  .popup-header {
    flex-shrink: 0;
    height: 112px;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-image: url("@/assets/img/gasModule/detail_head_bg.webp");
    background-size: 100% 100%;
    border-bottom: 2px solid rgba(13, 165, 190, 0.5);

    .popup-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-title);
      color: #e4f3ff;
      line-height: calc(var(--font-size-title) * 1.464);
    }

    .popup-close {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .popup-content {
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-height: 600px;
    overflow-y: auto;
    background: linear-gradient(270deg, rgba(2, 31, 55, 0.85) 0%, rgba(2, 17, 29, 0.85) 99.92%);
    box-shadow: -34px 0px 17px 0px rgba(4, 17, 38, 0.4), 34px 9px 17px 0px rgba(4, 17, 38, 0.4);
    border: 2px solid;
    border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(12, 93, 117, 0.24), rgba(8, 189, 243, 0.04), rgba(0, 28, 38, 0), rgba(8, 97, 132, 0), rgba(17, 171, 233, 1)) 2 2;
    backdrop-filter: blur(20px);

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 255, 255, 0.3);
      border-radius: 4px;
    }
  }

  .popup-row {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: var(--font-size-subtitle);
    line-height: calc(var(--font-size-subtitle) * 1.4);
    color: #e4f3ff;

    .popup-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-normal);
      min-width: 240px;
      flex-shrink: 0;
      text-align: right;
      white-space: nowrap;
    }

    .popup-value {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-normal);
      flex: 1;
      min-width: 0;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
