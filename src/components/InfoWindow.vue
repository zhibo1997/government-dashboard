<template>
  <div class="info-window">
    <!-- 标题栏 -->
    <div class="title-bar">
      <span class="title-content">
        <span class="icon">🏗️</span>
        桥梁监测预警
      </span>
    </div>
    
    <!-- 图片区域 -->
    <div class="image-area">
      <img src="/src/assets/W020250807316543521334_600.jpg" alt="桥梁图片" class="bridge-image" />
    </div>
    
    <!-- 信息内容 -->
    <div class="content-area">
      <!-- 基础信息行 -->
      <div class="info-grid">
        <div class="info-item">
          <span class="label">桥梁名称：</span>
          <span class="value">莲花湖一桥</span>
        </div>
        <div class="info-item">
          <span class="label">桥梁类型：</span>
          <span class="value">斜拉桥</span>
        </div>
        <div class="info-item">
          <span class="label">在役年限：</span>
          <span class="value">15年</span>
        </div>
        <div class="info-item">
          <span class="label">养护类型：</span>
          <span class="value">巡检</span>
        </div>
      </div>
      
      <!-- 养护单位 -->
      <div class="maintenance-unit">
        <span class="label">养护单位：</span>
        <span class="value">阳新绿洲园林绿化养护有限公司</span>
      </div>
      
      
      <!-- 详情按钮 -->
      <div class="button-area">
        <button class="detail-btn" @click="$emit('detail')">
          详情
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoWindow',
  emits: ['close', 'detail']
}
</script>

<style scoped>
.info-window {
  border-radius: 8px;
  width: 570px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  color: white;
  background-color:rgba(0, 0, 0, 0.75);
}

.title-bar {
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: normal;
  border-bottom: 1px solid rgb(255, 255, 255);
}

.title-content {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
  font-size: 16px;
}

.close-btn {
  color: white;
  font-size: 26px;
  cursor: pointer;
  line-height: 1;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  opacity: 0.8;
}

.image-area {
  padding: 12px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bridge-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  user-select: none;
  user-drag: none;
}

.content-area {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 40px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.maintenance-unit {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-right: 8px;
  flex-shrink: 0;
}

.value {
  color: white;
  font-size: 14px;
}


.button-area {
  text-align: right;
}

.detail-btn {
  background: rgba(255, 165, 0, 0.9);
  color: white;
  border: 1px solid rgba(255, 165, 0, 1);
  border-radius: 4px;
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: normal;
}

.detail-btn:hover {
  background: rgba(255, 165, 0, 1);
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
}
</style>