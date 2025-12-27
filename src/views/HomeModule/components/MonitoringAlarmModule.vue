<template>
  <div class="data-module monitoring-alarm-module">
    <div class="module-header">
      <div class="module-title">监测报警</div>
    </div>
    <div class="module-content">
      <!-- 监测报警组件内容将在后续添加 -->
      <div class="placeholder-content">
        <p>监测报警模块 - 组件占位</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 监测报警组件 - 首页模块右侧上部分
// 用于展示各个模块的报警信息统计
</script>

<style lang="scss" scoped>
.monitoring-alarm-module {
  flex: 0 0 calc(33.333% - 8px); // 占1/3高度，减去间距的一半
  overflow: hidden;

  .module-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .placeholder-content {
      text-align: center;
      color: #b0d7ff;
      font-size: 14px;
      opacity: 0.6;
    }
  }
}
</style>
