<!--
 * @Author: Do not edit
 * @Date: 2025-10-20 00:16:38
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 23:52:14
 * @Description: 
-->
<template>
  <div class="tiles3d-view">
    <div class="header">
      <h1>3D Tiles 模型展示</h1>
      <n-button @click="handleBackToDashboard" type="primary">返回仪表板</n-button>
    </div>
    
    <!-- 模型切换面板 -->
    <div class="model-switcher">
      <h3>选择模型</h3>
      <n-radio-group v-model:value="currentModelKey" @update:value="handleModelSwitch" size="large">
        <n-radio-button 
          v-for="model in modelOptions" 
          :key="model.key"
          :value="model.key"
        >
          <span class="model-icon" :class="model.iconClass"></span>
          {{ model.name }}
        </n-radio-button>
      </n-radio-group>
    </div>
    
    <div class="content">
      <Tiles3DComponent 
        ref="tiles3DRef"
        :tileset-url="tilesetUrl"
        :auto-load="false"
      />
    </div>
    
    <div class="info-panel">
      <h3>使用说明</h3>
      <ul>
        <li>使用鼠标拖拽旋转视角</li>
        <li>滚轮缩放地图</li>
        <li>右键拖拽调整俯仰角</li>
        <li>使用右上角控制面板调整模型显示</li>
        <li>使用顶部面板切换不同的3D模型</li>
      </ul>
      
      <h3>技术栈</h3>
      <ul>
        <li>Mapbox GL JS v1.13.3</li>
        <li>deck.gl v9.2.2</li>
        <li>@deck.gl/mapbox</li>
        <li>@deck.gl/geo-layers</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NRadioGroup, NRadioButton, useMessage } from 'naive-ui';
import Tiles3DComponent from '@/mapComponents/Tiles3DComponent.vue';

const router = useRouter();
const tiles3DRef = ref<InstanceType<typeof Tiles3DComponent> | null>(null);
const message = useMessage();

// 模型配置选项
interface ModelOption {
  key: string;
  name: string;
  url: string;
  description: string;
  iconClass: string;
}

const modelOptions: ModelOption[] = [
  {
    key: 'manhole',
    name: '圆形井盖',
    url: 'http://webres.cityfun.com.cn/CSSMX/model/YXJG/tileset.json',
    description: '展示城市圆形井盖的3D模型数据',
    iconClass: 'icon-circle'
  },
  {
    key: 'round-pipe',
    name: '圆形管线',
    url: 'http://webres.cityfun.com.cn/CSSMX/model/YXGX/tileset.json',
    description: '展示地下圆形管线的3D模型数据',
    iconClass: 'icon-pipe-circle'
  },
  {
    key: 'square-pipe',
    name: '方形管线',
    url: 'http://webres.cityfun.com.cn/CSSMX/model/FXGX/tileset.json',
    description: '展示地下方形管线的3D模型数据',
    iconClass: 'icon-pipe-square'
  }
];

// 当前选中的模型
const currentModelKey = ref<string>('manhole');

// 当前模型对象
const currentModel = computed(() => {
  return modelOptions.find(m => m.key === currentModelKey.value) || modelOptions[0];
});

// 当前模型URL
const tilesetUrl = computed(() => currentModel.value.url);

/**
 * 处理模型切换
 */
function handleModelSwitch() {
  console.log('切换模型:', currentModel.value.name);
  message.info(`正在加载${currentModel.value.name}...`);
  
  // 调用子组件的加载方法
  if (tiles3DRef.value) {
    tiles3DRef.value.load3DTiles();
  }
}

/**
 * 返回仪表板
 */
function handleBackToDashboard() {
  router.push({ name: 'dashboard' });
}

/**
 * 组件挂载后加载默认模型
 */
onMounted(() => {
  setTimeout(() => {
    if (tiles3DRef.value) {
      tiles3DRef.value.load3DTiles();
    }
  }, 500);
});
</script>

<style scoped lang="scss">
.tiles3d-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a1929;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(8, 21, 38, 0.9);
  border-bottom: 2px solid #1677ff;
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
  }
}

.model-switcher {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(8, 21, 38, 0.95);
  border: 2px solid #1677ff;
  border-radius: 12px;
  padding: 20px 24px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.2);
  min-width: 600px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1677ff;
    text-align: center;
  }
  
  :deep(.n-radio-group) {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  
  :deep(.n-radio-button) {
    height: 48px;
    line-height: 46px;
    padding: 0 24px;
    border-color: #1677ff;
    background: rgba(22, 119, 255, 0.05);
    color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(22, 119, 255, 0.15);
      color: #1677ff;
    }
  }
  
  :deep(.n-radio-button--checked) {
    background: #1677ff !important;
    color: #ffffff !important;
    border-color: #1677ff !important;
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.4);
    
    &:hover {
      background: #4096ff !important;
      border-color: #4096ff !important;
    }
  }
  
  .model-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    border-radius: 50%;
    vertical-align: middle;
    
    &.icon-circle {
      background: radial-gradient(circle, #52c41a 40%, transparent 40%);
      border: 2px solid #52c41a;
    }
    
    &.icon-pipe-circle {
      background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%);
      border: 2px solid #1677ff;
    }
    
    &.icon-pipe-square {
      background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
      border: 2px solid #faad14;
      border-radius: 2px;
    }
  }
  
  .model-info {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(22, 119, 255, 0.2);
    text-align: center;
    
    .model-description {
      margin: 0 0 8px 0;
      color: rgba(255, 255, 255, 0.85);
      font-size: 14px;
      line-height: 1.5;
    }
    
    .model-url {
      margin: 0;
      color: rgba(255, 255, 255, 0.45);
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      word-break: break-all;
    }
  }
}

.content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(8, 21, 38, 0.9);
  border: 1px solid #1677ff;
  border-radius: 8px;
  padding: 16px;
  max-width: 300px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1677ff;
    
    &:not(:first-child) {
      margin-top: 16px;
    }
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    
    li {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
