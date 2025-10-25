<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">纵览</div>
    </div>
    <div class="module-content">
      <div class="overview-content">
        <div class="overview-item" v-for="item in overviewData" :key="item.id">
          <div class="item-icon">
            <img :src="getIconUrl(item.icon)" :alt="item.name" />
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.name }}</div>
            <div class="item-value">
              <span class="value gradient-text">{{ item.value !== null && item.value !== undefined ? item.value : '-' }}</span>
              <span class="unit" v-if="item.value !== null && item.value !== undefined">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getWaterOverview } from "@/services/waterSupplyService";
import { getDataItemDetails, getDataItems } from "@/services/commonService";

// 响应式数据
const overviewData = ref([]);

// jcsslx 到 icon 的映射关系
const iconMapping = {
  jcssdstj0502: "fire_hydrant",    // 市政消火栓
  jcssdstj0503: "water_source",           // 水源地
  jcssdstj0504: "water_treatment",  // 水厂
  jcssdstj0505: "pump_station",     // 供水泵站
  jcssdstj0506: "major_customer",   // 供水大户
  jcssdstj0501: "pipeline",         // 供水管网
};

// 初始化基础配置数据(从字典获取)
const initGSItems = async () => {
  try {
    const res = await getDataItems("jcsstjlx", "gs");
    console.log("🚀 ~ initGSItems ~ res:", res)
    
    if (res && res.length > 0) {
      overviewData.value = res.map(item => ({
        id: item.f_ItemValue,
        name: item.f_ItemName,
        unit: item.f_Description,
        icon: iconMapping[item.f_ItemValue] ,
        value: null, // 初始值为 null,后续从 initOverviewData 获取
        jcsslx: item.f_ItemValue // 保存原始类型码,用于数据匹配
      }));
      console.log("🚀 ~ initGSItems ~ overviewData.value:", overviewData.value)
    }
  } catch (error) {
    console.error("获取基础配置数据失败:", error);
  }
};
// 动态获取图标路径
const getIconUrl = (iconName) => {
  return new URL(
    `../../../assets/img/waterSupply/${iconName}.png`,
    import.meta.url
  ).href;
};

// 初始化统计数据(获取 value)
const initOverviewData = async () => {
  try {
    const data = await getWaterOverview();
    console.log("🚀 ~ initOverviewData ~ data:", data);

    if (data && data.length > 0) {
      // 更新 overviewData 中的 value 值
      data.forEach((item) => {
        const targetItem = overviewData.value.find(
          (d) => d.jcsslx === item.jcsslx
        );
        if (targetItem) {
          targetItem.value = item.jcsstjsl;
        }
      });
    }
  } catch (error) {
    console.error("获取纵览数据失败:", error);
  }
};

onMounted(async () => {
  await initGSItems();      // 先获取基础配置
  await initOverviewData(); // 再获取统计数据
});
</script>

<style lang="scss" scoped>
.overview-module {
  .overview-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 40px;
    padding: 0 10px;
  }

  .overview-item {
    display: flex;
    align-items: center;

    .item-icon {
      width: 90px;
      height: 100px;
      display: flex;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .item-info {
      flex: 1;
      padding-left: 8px;
    }

    .item-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      color: #e4f3ff;
      margin-bottom: 6px;
    }

    .item-value {
      width: 240px;
      height: 81.5px;
      background-image: url("@/assets/img/waterSupply/overflow_item_bg.png");
      background-size: 100% 100%;
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;

      .value {
        font-family: YouSheBiaoTiHei;
        font-size: 40px;
        color: #ffffff;
        line-height: 52px;
        text-align: left;
        font-style: normal;
        background: linear-gradient(90deg, #ffffff 0%, #10adc0 100%);
      }

      .unit {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 400;
        font-size: 20px;
        color: #e4f3ff;
        line-height: 29px;
        text-align: left;
        font-style: normal;
      }
    }
  }
}
</style>
