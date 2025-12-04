<template>
  <div class="sidebar-module">
    <!-- 桥梁模块侧边栏内容占位 -->
  </div>
</template>

<script setup lang="ts">
// 桥梁模块侧边栏组件
defineOptions({
  name: "BridgeSidebarModule"
});
</script>

<style scoped lang="scss">
.sidebar-module {
  position: absolute;
  right: 840px;
  top: 201px;
  width: 64px;
  height: calc(100% - 201px);
  background: linear-gradient(180deg, rgba(22, 119, 255, 0.3) 0%, rgba(22, 119, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  z-index: 10;
  pointer-events: auto;
}
</style>