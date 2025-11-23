<!--
 * @Author: zhibo1997 1174985654@qq.com
 * @Date: 2025-11-17 19:13:37
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-22 19:01:09
 * @FilePath: \government-dashboard\src\views\WaterSupply\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="water-supply-special-container module-container">
    <!-- 中间地图区域 -->
    <div class="center-map" data-interactive>
      <MapComponent />
    </div>

    <ResponsiveWrapper :base-width="4096" :base-height="1920">
      <!-- 头部区域 -->
      <DashboardHeader />

      <!-- 主体容器 -->
      <div class="container">
        <!-- 左侧数据展示区 -->
        <LeftNav />
        
        <!-- 右侧数据展示区 -->
        <RightNav />
      </div>
    </ResponsiveWrapper>
  </div>
</template>

<script setup>
import ResponsiveWrapper from "@/components/ResponsiveWrapper.vue";
import MapComponent from "@/mapComponents/Map.vue";
// 引入左侧导航组件
import LeftNav from "./leftContent.vue";
import RightNav from "./rightContent.vue";
// 引入头部组件
import DashboardHeader from "@/components/DashboardHeader.vue";

// 定义组件名称以支持keep-alive
defineOptions({
  name: 'WaterSupplyView'
});
</script>

<style lang="scss" scoped>
.water-supply-special-container {

}

// 供水模块的 module-content 特殊布局
:deep(.data-module .module-content) {
  height: calc(100% - 60px);
  align-items: center;
  justify-content: center;
}
</style>
