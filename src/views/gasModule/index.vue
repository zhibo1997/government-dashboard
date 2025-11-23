<!--
 * @Author: zhibo1997 1174985654@qq.com
 * @Date: 2025-11-17 19:13:37
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-22 19:50:24
 * @FilePath: \government-dashboard\src\views\gasModule\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="gas-module-container module-container">
    <!-- 中间地图区域 -->
    
    <div class="center-map" data-interactive>
      <CesiumMap />
    </div>
    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <!-- 头部区域 -->
      <DashboardHeader />

      <!-- 主体容器 -->
      <div class="container">
        <!-- 左侧数据展示区 -->
        <LeftContent />
        
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
import SidebarModule from "./SidebarModule.vue";
import CesiumMap from "@/mapComponents/Map.vue";

// 定义组件名称以支持keep-alive
defineOptions({
  name: 'GasModule'
});
</script>

<style lang="scss" scoped>
.gas-module-container {
}
</style>
