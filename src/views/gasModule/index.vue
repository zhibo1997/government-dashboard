<template>
  <div class="gas-module-container module-container">
    <!-- 中间地图区域 -->

    <div class="center-map" data-interactive>
      <CesiumMap />
    </div>
    <ResponsiveWrapper :base-width="4096" :base-height="1920" v-if="!loading">
      <!-- 头部区域 -->
      <DashboardHeader />

      <!-- 主体容器 -->
      <div class="container">
        <!-- 左侧数据展示区 -->
        <LeftContent />
        <SidebarModule />

        <!-- 右侧数据展示区 -->
        <RightContent />
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup lang="ts">
import ResponsiveWrapper from "@/components/ResponsiveWrapper.vue";
import LeftContent from "./leftContent.vue";
import RightContent from "./rightContent.vue";
import DashboardHeader from "@/components/DashboardHeader.vue";
import SidebarModule from "./sidebarModule.vue";
import CesiumMap from "@/mapComponents/Map.vue";
import { onBeforeMount, ref } from "vue";
import { getCachedDictionaries } from "@/services/dictionaryService";

// 定义组件名称以支持keep-alive
defineOptions({
  name: "GasModule",
});
const loading = ref(false);
// 在页面初始化时预加载所有字典数据
onBeforeMount(async () => {
  try {
    loading.value = true;
    // 批量预加载所有需要的字典数据
    await getCachedDictionaries([
      "rqzx_glmbzx",
      "gxdlb_rq", // OverviewModule
      "gwcz", // PipelineModule
      "jcsblx_rq", // PipelineModule
      "jcsblx_rqzdyh", // MonitoringEquipmentModule
      "zgzt", // RiskHazardModule
    ]);
    loading.value = false;
    console.log("字典数据预加载完成");
  } catch (error) {
    console.error("字典数据预加载失败:", error);
  }
});
</script>

<style lang="scss">
.module-title {
  -webkit-background-clip: text !important;
  background-clip: text !important; /* 标准属性 */
  -webkit-text-fill-color: transparent !important;
  color: transparent !important; /* 标准属性回退 */
  background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
}
</style>
