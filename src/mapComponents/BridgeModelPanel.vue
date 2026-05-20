<template>
  <div class="bridge-model-panel">
    <div class="panel-title">桥梁模型</div>
    <div class="bridge-list" @wheel.prevent="onBridgeListWheel">
      <div
        v-for="bridge in bridgeList"
        :key="bridge.id"
        class="bridge-card"
        :class="{ active: activeBridgeIds.has(bridge.id) }"
        @click="toggleBridge(bridge)"
      >
        <div class="bridge-image-wrapper">
          <img :src="bridge.image" :alt="bridge.name" class="bridge-image" />
          <div class="bridge-overlay" v-if="!activeBridgeIds.has(bridge.id)"></div>
          <div class="equipment-label" v-if="bridge.equipment">监测设备</div>
          <div class="bridge-name">{{ bridge.name }}</div>
          <div class="equipment-area" v-if="bridge.equipment">
            <n-checkbox
              :checked="activeBridgeIds.has(bridge.equipment.id)"
              class="equipment-checkbox"
              @mouseenter="hoveredEquipmentId = bridge.equipment!.id"
              @mouseleave="hoveredEquipmentId = ''"
              @update:checked="(checked: boolean) => toggleEquipment(bridge, checked)"
              @click.stop
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { NCheckbox } from "naive-ui";

interface BridgeModel {
  name: string;
  id: string;
  qlbh: string;
  url: string;
  image: string;
  equipment?: {
    id: string;
    url: string;
  };
}

defineProps<{
  viewerInstance: any;
}>();

const emit = defineEmits<{
  "load-3dtiles": [url: string, layerId: string, options?: { flyTo?: boolean }];
  "layer-toggle": [layerId: string, visible: boolean, layerData: any];
  "equipment-activate": [bridge: BridgeModel, active: boolean];
}>();

const baseUrl = import.meta.env.VITE_BASE_URL || '';

const bridgeList: BridgeModel[] = [
  {
    name: "莲花湖大桥",
    id: "06ad0be1-f8fd-44fb-92ec-be82de6f8f38",
    qlbh: "LHQ",
    url: "https://webres.cityfun.com.cn/CSSMX/model/LHQ/tileset.json",
    image: `${baseUrl}/images/bridgeImages/莲花湖大桥（莲花湖一号桥主桥）.png`,
    equipment: {
      id: "ad960df4-4bd4-414c-a69c-6257d86982b2",
      url: "http://webres.cityfun.com.cn/CSSMX/model/LHQ_SB/tileset.json",
    },
  },
  {
    name: "陵园大道立交桥",
    id: "919829ed-9c4d-43ae-9a94-1ff0cef22a3f",
    qlbh: "LYDDLJQ",
    url: "https://webres.cityfun.com.cn/CSSMX/model/LYDDLJQ/tileset.json",
    image: `${baseUrl}/images/bridgeImages/陵园大道立交桥.png`,
    equipment: {
      id: "aa50cee7-c4f6-4315-bcb1-f89aea7c00c0",
      url: "http://webres.cityfun.com.cn/CSSMX/model/LYDDLJQ_SB/tileset.json",
    },
  },
  {
    name: "明月湾大桥",
    id: "ecb4e7b6-6a2e-4948-85b0-0c5975816e07",
    qlbh: "MYWDQ",
    url: "https://webres.cityfun.com.cn/CSSMX/model/MYWDQ/tileset.json",
    image: `${baseUrl}/images/bridgeImages/明月湾大桥（跨莲花湖二号桥）.png`,
    equipment: {
      id: "19e96888-190a-45fa-bcc1-c8f90ed6765a",
      url: "http://webres.cityfun.com.cn/CSSMX/model/MYWDQ_SB/tileset.json",
    },
  },
  {
    name: "独山湖大桥",
    id: "b4cc6305-bfce-4f60-926c-0dff3e7a7a78",
    qlbh: "DSHDQ",
    url: "http://webres.cityfun.com.cn/CSSMX/model/DSHDQ/tileset.json",
    image: `${baseUrl}/images/bridgeImages/独山湖大桥.jpg`,
    equipment: {
      id: "430c03ed-dce2-463a-8ce0-02b310b2685c",
      url: "http://webres.cityfun.com.cn/CSSMX/model/DSHDQ_SB/tileset.json",
    },
  },
];

const activeBridgeIds = reactive(new Set<string>());
const hoveredEquipmentId = ref("");

function onBridgeListWheel(e: WheelEvent) {
  const el = e.currentTarget as HTMLElement;
  el.scrollLeft += e.deltaY;
}

function convertUrlProtocol(url: string): string {
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === "production";
  if (isProduction && url && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
}

function toggleBridge(bridge: BridgeModel) {
  const isActive = activeBridgeIds.has(bridge.id);

  if (isActive) {
    activeBridgeIds.delete(bridge.id);
    const url = convertUrlProtocol(bridge.url);
    emit("layer-toggle", bridge.id, false, { type: "3dTile", url });
    if (bridge.equipment && activeBridgeIds.has(bridge.equipment.id)) {
      activeBridgeIds.delete(bridge.equipment.id);
      emit("layer-toggle", bridge.equipment.id, false, { type: "3dTile", url: convertUrlProtocol(bridge.equipment.url) });
      emit("equipment-activate", bridge, false);
    }
    return;
  }

  // 互斥：关闭其他已激活的桥梁和设备
  for (const id of [...activeBridgeIds]) {
    const otherBridge = bridgeList.find(b => b.id === id || b.equipment?.id === id);
    if (otherBridge) {
      const isEquipment = otherBridge.equipment?.id === id;
      if (isEquipment) {
        emit("equipment-activate", otherBridge, false);
      }
      emit("layer-toggle", id, false, { type: "3dTile", url: convertUrlProtocol(isEquipment ? otherBridge.equipment!.url : otherBridge.url) });
    }
  }
  activeBridgeIds.clear();

  activeBridgeIds.add(bridge.id);
  emit("load-3dtiles", convertUrlProtocol(bridge.url), bridge.id);
}

function toggleEquipment(bridge: BridgeModel, checked: boolean) {
  if (!bridge.equipment) return;

  const url = convertUrlProtocol(bridge.equipment.url);

  if (checked) {
    activeBridgeIds.add(bridge.equipment.id);
    emit("load-3dtiles", url, bridge.equipment.id, { flyTo: false });
    emit("equipment-activate", bridge, true);
  } else {
    activeBridgeIds.delete(bridge.equipment.id);
    emit("layer-toggle", bridge.equipment.id, false, { type: "3dTile", url });
    emit("equipment-activate", bridge, false);
  }
}
</script>

<style lang="scss" scoped>
.bridge-model-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.panel-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.bridge-list {
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

.bridge-card {
  flex-shrink: 0;
  width: 280px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(22, 119, 255, 0.5);
  }

  &.active {
    border-color: #1890ff;
    border-width: 6px;
    box-shadow: 0 0 24px rgba(24, 144, 255, 0.7), 0 0 48px rgba(24, 144, 255, 0.3);
  }
}

.bridge-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bridge-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.4s ease;
}

.bridge-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(3px);
  transition: all 0.4s ease;
  pointer-events: none;
}

.bridge-name {
  position: absolute;
  bottom: 4px;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
  pointer-events: none;
      width: 100%;
    text-align: center;

  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.equipment-area {
  position: absolute;
  top: 28px;
  right: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.equipment-checkbox {
  :deep(.n-checkbox-box) {
    border: 3px solid rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    width: 40px;
    height: 40px;
  }

  &.n-checkbox--checked .n-checkbox-box {
    background-color: #1890ff;
    border-color: #1890ff;
  }

  :deep(.n-checkbox-box .n-checkbox-box__border) {
    border: none;
  }

  :deep(.n-checkbox-box .n-checkbox-icon) {
    color: #fff;
    font-size: 26px;
  }
}

.equipment-label {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 28px;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.3;
  pointer-events: none;

  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}
</style>
