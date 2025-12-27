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
import { ref, computed, onMounted } from "vue";
import { getBasicFacilitiesOverview } from "@/services/statusService";
import { getCachedDictionary } from "@/services/dictionaryService";
import GasIcon from "@/assets/img/homeModule/gas_icon.webp";
import WaterIcon from "@/assets/img/homeModule/water_icon.webp";
import DrainageIcon from "@/assets/img/homeModule/drainage_icon.webp";
import BridgeIcon from "@/assets/img/homeModule/bridge_icon.webp";

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


// 初始化数据
const initOverviewData = async () => {
  try {
    // 1. 先获取字典数据，建立 jcsslx -> 字典信息 的映射
    const dictData = await getCachedDictionary("jcsstjlx");
    const dictMap = new Map();

    if (dictData && dictData.length > 0) {
      dictData.forEach((dict: any) => {
        dictMap.set(dict.f_ItemValue, {
          name: dict.f_ItemName,
          unit: dict.f_Description
        });
      });
    }

    // 2. 获取后端数据
    const responseData = await getBasicFacilitiesOverview();
    const data = Array.isArray(responseData) ? responseData : [];

    if (data && data.length > 0) {
      // 转换数据并按 sszx 分组
      const processedData = data.map((item: any) => {
        const dictInfo = dictMap.get(item.jcsslx);
        return {
          lsh: item.lsh,
          jcsslx: item.jcsslx,
          sszx: item.sszx,
          name: dictInfo?.name || item.jcsslx,
          unit: dictInfo?.unit || '',
          jcsstjsl: item.jcsstjsl || 0
        } as OverviewItem;
      });

      // 按 sszx 分组，构建带有分类信息的数据结构
      const groupedMap = new Map<string, OverviewItem[]>();
      processedData.forEach((item: OverviewItem) => {
        if (!groupedMap.has(item.sszx)) {
          groupedMap.set(item.sszx, []);
        }
        groupedMap.get(item.sszx)!.push(item);
      });

      // 构建最终的 overviewData 数组
      const categories: OverviewCategory[] = [];
      groupedMap.forEach((items, sszx) => {
        const mapping = sszxMapping[sszx];
        if (mapping) {
          categories.push({
            title: mapping.title,
            icon: mapping.icon,
            sszx: sszx,
            items: items
          });
        }
      });

      overviewData.value = categories;
    }
  } catch (error) {
    console.error("获取总览数据失败:", error);
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
    gap: 20px;
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
        font-size: 28px;
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
        font-size: 26px;
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
        max-width: 160px;
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
