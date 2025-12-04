<template>
  <div class="data-module bridge-monitoring-module">
    <div class="module-header">
      <div class="module-title">桥梁监控</div>
    </div>
    <div class="module-content">
      <!-- 桥梁监控内容占位 -->
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "BridgeMonitoringModule"
});
</script>

<style lang="scss" scoped>
.bridge-monitoring-module {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.module-header {
  height: 90px;
  display: flex;
  align-items: center;

  .module-title {
    font-family: YouSheBiaoTiHei;
    font-size: 44px;
    color: #ffffff;
    text-align: left;
    font-style: normal;
    padding-left: 140px;
    margin-top: 10px;
  }
}

.module-content {
  flex: 1;
  padding: 40px 30px;
  height: calc(100% - 90px);
  display: flex;
  flex-direction: column;
  border-radius: 8px;
}
</style>
