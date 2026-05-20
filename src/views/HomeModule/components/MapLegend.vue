<template>
  <div class="map-legend">
    <div class="legend-header">
      <span class="title">图例</span>
    </div>
    <div class="legend-list">
      <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
        <img :src="item.icon" :alt="item.name" class="legend-icon" />
        <span class="legend-label">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCachedDictionary } from '@/services/dictionaryService'
import type { DictionaryItem } from '@/stores/dictionaryStore'

interface LegendItem {
  type: string
  name: string
  icon: string
}

const baseUrl = import.meta.env.VITE_BASE_URL
const dictData = ref<DictionaryItem[]>([])

onMounted(async () => {
  const data = await getCachedDictionary('jcsblx')
  dictData.value = data || []
})

const legendItems = computed<LegendItem[]>(() => {
  return dictData.value
    .filter(item => item.f_ItemValue)
    .map(item => ({
      type: item.f_ItemValue,
      name: item.f_ItemName,
      icon: `${baseUrl}/images/equipmentIcons/${item.f_ItemValue}.svg`
    }))
})
</script>

<style lang="scss" scoped>
.map-legend {
  position: absolute;
  bottom: 20px;
  right: 860px;
  // width: 286px;
  background: linear-gradient( 270deg, #021A2E 0.08%, #021F37 100%);
  border: 1px solid rgba(0, 246, 255, 0.3);
  border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(12, 93, 117, 0.24), rgba(8, 189, 243, 0.04), rgba(0, 28, 38, 0), rgba(8, 97, 132, 0), rgba(17, 171, 233, 1)) 2 2;
  border-radius: 4px;
  // padding: 16px;
  z-index: 5;
  pointer-events: auto;
  backdrop-filter: blur(4px);

  .legend-header {
    padding:  6px 0;
    text-align: center;
    border-bottom: 2px solid rgba(31, 199, 255, 0.24);

    .title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: var(--font-size-title);
      color: #E4F3FF;
      line-height: 58px;
      text-align: left;
      font-style: normal;
    }
  }

  .legend-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 20px;

      .legend-icon {
        width: 75px;
        height: 90px;
        object-fit: contain;
        display: block;
      }

      .legend-label {
        margin-left: 0;
        width: 360px;
        white-space: normal;
        word-break: break-all;
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 500;
        font-size: var(--font-size-subtitle);
        color: #E4F3FF;
        line-height: 50px;
        text-align: left;
        font-style: normal;
      }
    }
  }
}
</style>
