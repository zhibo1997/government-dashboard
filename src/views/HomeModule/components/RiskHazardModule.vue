<template>
  <div class="data-module risk-hazard-module">
    <div class="module-header">
      <div class="module-title">风险隐患</div>
    </div>
    <div class="module-content">
      <!-- 风险隐患组件内容将在后续添加 -->
      <div class="placeholder-content">
        <p>风险隐患模块 - 组件占位</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 风险隐患组件 - 首页模块左侧下部分
// 用于展示各个模块的风险隐患统计
</script>

<style lang="scss" scoped>
.risk-hazard-module {
  flex: 0 0 calc(66.667% - 8px); // 占2/3高度，减去间距的一半
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
