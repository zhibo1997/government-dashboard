<template>
  <Teleport to="body">
    <div
      v-if="visible && pointData"
      class="gas-point-popup"
      :style="popupStyle"
      @click.stop
    >
      <!-- 背景层 - 整张背景图 -->
      <div class="popup-bg"></div>

      <!-- 标题栏 - 固定在顶部，z-index 高于内容 -->
      <div class="popup-header">
        <div class="popup-title">{{ title }}</div>
        <div class="popup-close" @click="$emit('close')">
          <n-icon size="42" color="#11a7e2" :component="Close" />
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 字段列表 - 内部滚动 -->
        <div class="popup-fields">
          <div class="popup-row" v-for="(item, index) in displayFields" :key="index">
            <label class="popup-label">{{ item.label }}：</label>
            <span class="popup-value">{{ item.value || '—' }}</span>
          </div>
        </div>

        <!-- 桥梁操作按钮 -->
        <template v-if="pointType === '桥梁'">
          <div class="popup-divider"></div>
          <div class="popup-actions">
            <button class="action-btn btn-monitoring" @click="$emit('show-equipment')">监测设备</button>
            <button class="action-btn btn-camera" @click="$emit('show-camera')">监控设备</button>
            <button v-if="props.hasModel" class="action-btn btn-model" @click="$emit('show-model')">查看模型</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue'
import { NIcon } from 'naive-ui'
import { Close } from '@vicons/ionicons5'
import { mapToLabelValue } from '@/config/fieldLabelConfig'
import { getCachedDictionary } from '@/services/dictionaryService'

interface DisplayField {
  label: string
  value: string | number | null
}

const props = defineProps<{
  visible: boolean
  pointData: any | null
  position: { x: number; y: number }
  pointType: string
  hasModel?: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'show-equipment'): void
  (e: 'show-camera'): void
  (e: 'show-model'): void
}>()

// 响应式缩放
const scaleRatio = inject<any>('responsiveScale', ref(1))

// 标题
const title = computed(() => {
  if (!props.pointData) return '详情'
  const data = props.pointData
  if (props.pointType === '燃气井盖') return data.jgbh || '井盖详情'
  if (props.pointType === '燃气企业') return data.qymc || '企业详情'
  if (props.pointType === '液化气企业') return data.qymc || '企业详情'
  if (props.pointType === '桥梁') return data.llmc || data.qlmc || data.qlbh || '桥梁详情'
  return '详情'
})

// 弹窗位置样式 - 左上角锚定屏幕中心 + 缩放
const popupStyle = computed(() => {
  return {
    left: '50%',
    top: '50%',
    transform: `scale(${scaleRatio.value})`,
    transformOrigin: 'left top',
  }
})

// 桥梁字典映射
const bridgeDictCodes = ['qljglb', 'qlyhdj', 'qlhysx', 'qllx', 'ztdj'] as const
const bridgeDictMap = ref<Record<string, { value: string; label: string }[]>>({})

watchEffect(async () => {
  if (!props.visible || props.pointType !== '桥梁') return
  const results = await Promise.all(bridgeDictCodes.map((code) => getCachedDictionary(code)))
  const map: Record<string, { value: string; label: string }[]> = {}
  const fieldKeys = ['qljg', 'qlyhdj', 'hysx', 'qllx', 'ztdj']
  bridgeDictCodes.forEach((_, i) => {
    map[fieldKeys[i]] = results[i].map((item: any) => ({ value: item.f_ItemValue, label: item.f_ItemName }))
  })
  bridgeDictMap.value = map
})

// 统一使用 mapToLabelValue 映射字段
const displayFields = computed<DisplayField[]>(() => {
  if (!props.pointData) return []
  const dictMap = props.pointType === '桥梁' ? bridgeDictMap.value : {}
  return mapToLabelValue(props.pointData, [], dictMap) as DisplayField[]
})
</script>

<style scoped lang="scss">
// 背景图片比例 390:229
$bg-ratio-w: 390;
$bg-ratio-h: 229;

.gas-point-popup {
  position: fixed;
  z-index: 9999;
  // 宽高严格遵守背景图比例：width:height = 390:229
  width: 840px;
  height: calc(840px * #{$bg-ratio-h} / #{$bg-ratio-w}); // ≈ 493px
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
    height: calc(100% * 6 / 45);
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 2;

    .popup-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-subtitle);
      line-height: calc(var(--font-size-subtitle) * 1.3);
      color: #ffffff;
      font-weight: bold;
      position: relative;
      left: 24px;
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
    flex: 1;
    min-height: 0;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    z-index: 1;
    overflow: hidden;
  }

  .popup-fields {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 255, 255, 0.3);
      border-radius: 3px;
    }
  }

  .popup-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .popup-label {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-normal);
      font-size: var(--font-size-heading);
      line-height: calc(var(--font-size-heading) * 1.3);
      flex-shrink: 0;
      white-space: nowrap;
      color: #ffffff;
    }

    .popup-value {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-normal);
      font-size: var(--font-size-heading);
      line-height: calc(var(--font-size-heading) * 1.3);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #7fd3f2;
    }
  }

  .popup-divider {
    height: 2px;
    background: #7fd3f2;
    margin: 4px 0;
    flex-shrink: 0;
  }

  .popup-actions {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-shrink: 0;
    padding-top: 16px;

    .action-btn {
      width: 200px;
      height: 56px;
      cursor: pointer;
      text-align: center;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-heading);
      color: #ffffff;
      border-radius: 6px;
      transition: all 0.2s;

      &.btn-monitoring {
        background: rgba(0, 60, 80, 0.6);
        border: 2px solid #0da5be;

        &:hover {
          background: rgba(13, 165, 190, 0.4);
          border-color: #3fffff;
          box-shadow: 0 0 16px rgba(13, 165, 190, 0.5);
        }
      }

      &.btn-camera {
        background: rgba(60, 40, 0, 0.6);
        border: 2px solid #be8b0d;

        &:hover {
          background: rgba(190, 139, 13, 0.4);
          border-color: #ffdc3f;
          box-shadow: 0 0 16px rgba(190, 139, 13, 0.5);
        }
      }

      &.btn-model {
        background: rgba(40, 0, 60, 0.6);
        border: 2px solid #8b0dbe;

        &:hover {
          background: rgba(139, 13, 190, 0.4);
          border-color: #df3fff;
          box-shadow: 0 0 16px rgba(139, 13, 190, 0.5);
        }
      }
    }
  }
}
</style>
