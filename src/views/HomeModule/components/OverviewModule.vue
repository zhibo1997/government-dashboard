<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">总览</div>
    </div>
    <div class="module-content">
      <div class="overview-content">
        <!-- 按 sszx 分组展示 -->
        <div class="overview-category" v-for="category in overviewData" :key="category.sszx">
          <div class="category-left">
            <span class="category-name">{{ category.title }}</span>
            <div class="category-icon">
              <img :src="category.icon" :alt="category.title" />
            </div>
          </div>
          <div class="category-items">
            <div class="overview-item" v-for="item in category.items" :key="item.lsh">
              <span class="item-text" :class="item.sszx">{{ item.name }}</span>
              <span class="value">{{ item.jcsstjsl }}</span>
              <span class="unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getBasicFacilitiesOverview } from "@/services/statusService";
import GasIcon from "@/assets/img/homeModule/gas_icon.webp";
import WaterIcon from "@/assets/img/homeModule/water_icon.webp";
import DrainageIcon from "@/assets/img/homeModule/drainage_icon.webp";
import BridgeIcon from "@/assets/img/homeModule/bridge_icon.webp";

// 根据设计图要求的固定数据结构
const designData = {
  "燃气": [
    {
      "f_ItemName": "天然气运营企业",
      "f_ItemValue": "jcssdstj0103",
      "f_Description": "个"
    },
    {
      "f_ItemName": "天然气场站",
      "f_ItemValue": "jcssdstj0102",
      "f_Description": "个"
    },
    {
      "f_ItemName": "液化气运营企业",
      "f_ItemValue": "jcssdstj0302",
      "f_Description": "个"
    },
    {
      "f_ItemName": "天然气管网",
      "f_ItemValue": "jcssdstj0101",
      "f_Description": "km"
    }
  ],
  "供水": [
    {
      "f_ItemName": "水厂",
      "f_ItemValue": "jcssdstj0504",
      "f_Description": "个"
    },
    {
      "f_ItemName": "供水管网",
      "f_ItemValue": "jcssdstj0501",
      "f_Description": "公里"
    },
    {
      "f_ItemName": "水源地",
      "f_ItemValue": "jcssdstj0503",
      "f_Description": "个"
    },
    {
      "f_ItemName": "供水大用户",
      "f_ItemValue": "jcssdstj0506",
      "f_Description": "户"
    }
  ],
  "排水": [
    {
      "f_ItemName": "污水厂",
      "f_ItemValue": "jcssdstj0405",
      "f_Description": "个"
    },
    {
      "f_ItemName": "排水管网",
      "f_ItemValue": "jcssdstj0401",
      "f_Description": "km"
    },
    {
      "f_ItemName": "排水泵站",
      "f_ItemValue": "jcssdstj0406",
      "f_Description": "个"
    },
    {
      "f_ItemName": "易积水点",
      "f_ItemValue": "jcssdstj0407",
      "f_Description": "个"
    }
  ],
  "桥梁": [
    {
      "f_ItemName": "桥梁",
      "f_ItemValue": "jcssdstj0601",
      "f_Description": "座"
    },
    {
      "f_ItemName": "大桥及特大桥",
      "f_ItemValue": "jcssdstj0602",
      "f_Description": "座"
    },
    {
      "f_ItemName": "立交桥",
      "f_ItemValue": "jcssdstj0603",
      "f_Description": "座"
    },
    {
      "f_ItemName": "涵洞",
      "f_ItemValue": "jcssdstj0604",
      "f_Description": "个"
    }
  ]
};

// sszx 到 icon 和 title 的映射关系（专项编号）
const sszxMapping: Record<string, { title: string, icon: string }> = {
  'csaqzx_rq': { title: '燃气', icon: GasIcon },           // 燃气
  'csaqzx_gs': { title: '供水', icon: WaterIcon },         // 供水
  'csaqzx_ps': { title: '排水', icon: DrainageIcon },      // 排水
  'csaqzx_ql': { title: '桥梁', icon: BridgeIcon },        // 桥梁
};

// 分类项数据类型
interface OverviewItem {
  lsh: string;
  jcsslx: string;
  sszx: string;
  name: string;
  unit: string;
  jcsstjsl: number;
}

// 分类数据类型
interface OverviewCategory {
  title: string;
  icon: string;
  sszx: string;
  items: OverviewItem[];
}

// 原始数据 - 按 sszx 分组
const overviewData = ref<OverviewCategory[]>([])


// 初始化数据 - 根据设计图要求使用固定数据结构
const initOverviewData = async () => {
  try {
    // 1. 获取后端数据
    const responseData = await getBasicFacilitiesOverview();
    const data = Array.isArray(responseData) ? responseData : [];

    // 2. 建立 jcsslx -> 实际数据 的映射
    const dataMap = new Map();
    data.forEach((item: any) => {
      dataMap.set(item.jcsslx, item.jcsstjsl || 0);
    });

    // 3. 构建最终的 overviewData 数组 - 按照设计图要求的固定结构
    const categories: OverviewCategory[] = [];
    
    // 遍历设计图定义的数据结构
    Object.entries(designData).forEach(([categoryTitle, items]) => {
      // 找到对应的 sszx
      const sszxEntry = Object.entries(sszxMapping).find(([_, mapping]) => mapping.title === categoryTitle);
      if (!sszxEntry) return;
      
      const [sszx, mapping] = sszxEntry;
      
      // 转换设计图数据为组件需要的格式
      const convertedItems: OverviewItem[] = items.map(item => ({
        lsh: item.f_ItemValue, // 使用 f_ItemValue 作为唯一标识
        jcsslx: item.f_ItemValue,
        sszx: sszx,
        name: item.f_ItemName,
        unit: item.f_Description,
        jcsstjsl: dataMap.get(item.f_ItemValue) || 0 // 从后端数据获取实际值，如果没有则为0
      }));

      categories.push({
        title: mapping.title,
        icon: mapping.icon,
        sszx: sszx,
        items: convertedItems
      });
    });

    overviewData.value = categories;
  } catch (error) {
    console.error("获取总览数据失败:", error);
    // 出错时显示设计图定义的默认结构，数值为0
    const categories: OverviewCategory[] = [];
    
    Object.entries(designData).forEach(([categoryTitle, items]) => {
      const sszxEntry = Object.entries(sszxMapping).find(([_, mapping]) => mapping.title === categoryTitle);
      if (!sszxEntry) return;
      
      const [sszx, mapping] = sszxEntry;
      
      const convertedItems: OverviewItem[] = items.map(item => ({
        lsh: item.f_ItemValue,
        jcsslx: item.f_ItemValue,
        sszx: sszx,
        name: item.f_ItemName,
        unit: item.f_Description,
        jcsstjsl: 0
      }));

      categories.push({
        title: mapping.title,
        icon: mapping.icon,
        sszx: sszx,
        items: convertedItems
      });
    });
    
    overviewData.value = categories;
  }
};

onMounted(() => {
  initOverviewData();
});
</script>

<style lang="scss" scoped>
.overview-module {
  flex: 0 0 calc(33.333% - 8px);
  overflow: hidden;

  .overview-content {
    display: flex;
    flex-direction: column;
    gap: 34px;
    padding: 0 10px;
    max-height: 100%;
    overflow-y: auto;
  }
  .module-content{
    padding-right: 10px;
  }

  // 根据设计图优化布局
  .overview-category {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-shrink: 0;

    .category-left {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 10px;
      position: relative;
      margin: 0 26px;

      .category-icon {
        flex-shrink: 0;
        width: 94.35px;
        height: 78.74px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 12px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .category-name {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 500;
        font-size: var(--font-size-heading);
        color: #EFFAFF;
        line-height: 40px;
        text-align: center;
        font-style: normal;
      }
    }

    .category-items {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 20px;
      padding-top: 6px;
      padding-left: 20px;
      flex: 1;
      height: 100px;
      overflow-y: auto;
      background-size: 100% 100%;
      background-image: url("@/assets/img/homeModule/overview_item_bg.webp");
    }

    .overview-item {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      span {
        font-family: SourceHanSansCNVF, SourceHanSansCNVF;
        font-weight: 400;
        font-size: var(--font-size-body);
        color: #F5FCFF;
        line-height: 37px;
        text-align: left;
        font-style: normal;
        margin-right: 12px;
        &:last-child {
          margin-right: 0;
        }
      }
      .item-text{
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &::before {
          content: '';
          display: inline-block;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          margin-right: 12px;
          margin-bottom: 5px;
          flex-shrink: 0;
        }
        &.csaqzx_rq::before {
          background-color: #0BDE8B;
        }
        &.csaqzx_gs::before {
          background-color: #FBDB4D;
        }
        &.csaqzx_ps::before {
          background-color: #3C7CF8;
        }
        &.csaqzx_ql::before {
          background-color: #08DBF2;
        }
      }
    }
  }
}
</style>
