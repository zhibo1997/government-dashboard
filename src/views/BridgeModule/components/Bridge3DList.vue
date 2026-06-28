<template>
  <div class="bridge-3d-list">
    <div class="list-title">桥梁模型</div>
    <div class="list-items">
      <div
        v-for="bridge in bridgeList"
        :key="bridge.qlbh"
        class="bridge-item"
        :class="{ active: activeBridge === bridge.qlbh }"
        @click="handleClick(bridge)"
      >
        <div class="bridge-img-wrapper">
          <img :src="bridge.imageUrl" :alt="bridge.name" />
          <div class="bridge-overlay" v-if="activeBridge !== bridge.qlbh"></div>
        </div>
        <div class="bridge-name">{{ bridge.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BRIDGE_LAYER_CONFIG } from '@/config/layerConfig'
import { useMapStore } from '@/stores/mapStore'

const props = defineProps<{
  activeBridge: string | null
}>()

const emit = defineEmits<{
  (e: 'select', qlbh: string): void
}>()

const mapStore = useMapStore()
const baseUrl = import.meta.env.VITE_BASE_URL || ''

const bridgeList = computed(() => {
  return BRIDGE_LAYER_CONFIG.map((cfg) => {
    const layer = mapStore.findLayerById(cfg.id)
    return {
      qlbh: cfg.qlbh,
      name: layer?.name || cfg.qlbh,
      imageUrl: `${baseUrl}/images/bridgeImages/${cfg.image}`,
    }
  })
})

function handleClick(bridge: { qlbh: string }) {
  emit('select', bridge.qlbh)
}
</script>

<style scoped lang="scss">
.bridge-3d-list {
  position: absolute;
  right: 120px;
  top: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: auto;
  padding: 16px;
  background: rgba(11, 28, 45, 0.65);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(22, 119, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);

  .list-title {
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 700;
    font-size: var(--font-size-subtitle);
    color: #ffffff;
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(79, 195, 247, 0.3);
  }

  .list-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bridge-item {
    width: 280px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(79, 195, 247, 0.5);
    }

    &.active {
      border-color: #4fc3f7;
      box-shadow: 0 0 16px rgba(79, 195, 247, 0.6);
    }

    .bridge-img-wrapper {
      position: relative;
      width: 100%;
      height: 140px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .bridge-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        pointer-events: none;
      }
    }

    .bridge-name {
      padding: 10px 12px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-size: var(--font-size-heading);
      font-weight: 500;
      color: #e4f3ff;
      text-align: center;
      background: rgba(0, 20, 40, 0.85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
