<template>
  <div class="gas-model-panel">
    <div class="panel-title">燃气模型</div>
    <div class="gas-list">
      <div
        v-for="item in gasList"
        :key="item.id"
        class="gas-card"
        :class="{ active: activeIds.has(item.id) }"
        @click="toggleItem(item)"
      >
        <div class="gas-card-bg" :class="{ dimmed: !activeIds.has(item.id) }"></div>
        <div class="gas-name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

interface GasModel {
  name: string;
  id: string;
  url: string;
}

defineProps<{
  viewerInstance: any;
}>();

const emit = defineEmits<{
  "load-3dtiles": [url: string, layerId: string];
  "layer-toggle": [layerId: string, visible: boolean, layerData: any];
}>();

const gasList: GasModel[] = [
  {
    name: "燃气接头",
    id: "3d950e5e-967a-41cb-81bd-71d195ad7576",
    url: "http://webres.cityfun.com.cn/CSSMX/model/RQ_TR_RQJT/tileset.json",
  },
  {
    name: "燃气井",
    id: "a0a68eaf-a734-4bbf-a3da-766e31bf9eae",
    url: "http://webres.cityfun.com.cn/CSSMX/model/RQ_TR_RQJ/tileset.json",
  },
  {
    name: "燃气可燃气体检测设备",
    id: "389bf6c1-16bd-4ec3-a7c6-7e2e0cc0e4fa",
    url: "http://webres.cityfun.com.cn/CSSMX/model/RQ_TR_KRQTJCSB/tileset.json",
  },
  {
    name: "燃气中压管道",
    id: "f155d789-ffa5-4a71-a49a-0c12381bfc61",
    url: "http://webres.cityfun.com.cn/CSSMX/model/RQ_TR_ZYGX/tileset.json",
  },
];

const activeIds = reactive(new Set<string>());

function convertUrlProtocol(url: string): string {
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === "production";
  if (isProduction && url && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
}

function toggleItem(item: GasModel) {
  const isActive = activeIds.has(item.id);
  const url = convertUrlProtocol(item.url);

  if (isActive) {
    activeIds.delete(item.id);
    emit("layer-toggle", item.id, false, { type: "3dTile", url });
  } else {
    activeIds.add(item.id);
    emit("load-3dtiles", url, item.id);
  }
}
</script>

<style lang="scss" scoped>
.gas-model-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.panel-title {
  font-size: var(--font-size-subtitle);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.gas-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0;
  flex: 1;
  align-items: stretch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
}

.gas-card {
  flex-shrink: 0;
  width: 240px;
  border-radius: 8px;
  cursor: pointer;
  border: 4px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: rgba(22, 119, 255, 0.5);
  }

  &.active {
    border-color: #1890ff;
    border-width: 6px;
    box-shadow: 0 0 24px rgba(24, 144, 255, 0.7), 0 0 48px rgba(24, 144, 255, 0.3);

    .gas-card-bg {
      opacity: 1;
      background: linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(10, 80, 160, 0.3));
    }

    .gas-name {
      color: #ffffff;
      text-shadow: 0 0 12px rgba(24, 144, 255, 0.6);
    }
  }
}

.gas-card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  transition: all 0.3s ease;

  &.dimmed {
    opacity: 0.5;
  }
}

.gas-name {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
  font-size: var(--font-size-heading);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  line-height: 1.3;
  transition: all 0.3s ease;
}
</style>
