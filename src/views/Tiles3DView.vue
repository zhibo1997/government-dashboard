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
      <a-button @click="handleBackToDashboard">返回仪表板</a-button>
    </div>
    
    <div class="content">
      <Tiles3DComponent 
        ref="tiles3DRef"
        :tileset-url="tilesetUrl"
        :auto-load="true"
      />
    </div>
    
    <div class="info-panel">
      <h3>使用说明</h3>
      <ul>
        <li>使用鼠标拖拽旋转视角</li>
        <li>滚轮缩放地图</li>
        <li>右键拖拽调整俯仰角</li>
        <li>使用右上角控制面板调整模型显示</li>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Tiles3DComponent from '@/mapComponents/Tiles3DComponent.vue';

const router = useRouter();
const tiles3DRef = ref<InstanceType<typeof Tiles3DComponent> | null>(null);

// 3D Tiles 数据源地址
const tilesetUrl = 'http://webres.cityfun.com.cn/CSSMX/model/YXJG/tileset.json';

/**
 * 返回仪表板
 */
function handleBackToDashboard() {
  router.push({ name: 'dashboard' });
}
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
