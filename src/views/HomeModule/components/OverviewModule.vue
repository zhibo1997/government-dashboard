<template>
  <div class="data-module overview-module">
    <div class="module-header">
      <div class="module-title">总览</div>
    </div>
    <div class="module-content">
      <div class="overview-content">
        <!-- 按 sszx 分组展示 -->
        <div class="overview-category" v-for="category in overviewData" :key="category.sszx" @click="handleCategoryClick(category.sszx)">
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
import { useRouter } from "vue-router";
import { getGasStats } from "@/services/gasService";
import { getBridgeTypeCount } from "@/services/bridgeService";
import { getWaterSupplyStats, getDrainageStats } from "@/services/waterSupplyService";
import GasIcon from "@/assets/img/homeModule/gas_icon.webp";
import WaterIcon from "@/assets/img/homeModule/water_icon.webp";
import DrainageIcon from "@/assets/img/homeModule/drainage_icon.webp";
import BridgeIcon from "@/assets/img/homeModule/bridge_icon.webp";

// 各专项对应的数据获取函数
const categoryFetchers: Record<string, () => Promise<any[]>> = {
  "燃气": getGasStats,
  "桥梁": async () => {
    const data = await getBridgeTypeCount();
    return Array.isArray(data) ? data.map((d: any) => ({
      name: d.name,
      count: d.count,
      unit: '座',
    })) : [];
  },
  "供水": getWaterSupplyStats,
  "排水": getDrainageStats,
};

// sszx 到 icon 和 title 的映射关系（专项编号）
const sszxMapping: Record<string, { title: string, icon: string, routePath: string }> = {
  'csaqzx_rq': { title: '燃气', icon: GasIcon, routePath: '/gas' },
  'csaqzx_gs': { title: '供水', icon: WaterIcon, routePath: '/waterProject' },
  'csaqzx_ps': { title: '排水', icon: DrainageIcon, routePath: '/drainage' },
  'csaqzx_ql': { title: '桥梁', icon: BridgeIcon, routePath: '/bridge' },
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

// 路由
const router = useRouter()

// 点击专项分类跳转到对应专项页面
const handleCategoryClick = (sszx: string) => {
  const mapping = sszxMapping[sszx]
  if (mapping?.routePath) {
    router.push(mapping.routePath)
  }
}

// 原始数据 - 按 sszx 分组
const overviewData = ref<OverviewCategory[]>([])


// 初始化数据 - 从各专项接口获取
const initOverviewData = async () => {
  try {
    // 1. 并行请求四个专项接口
    const [gasData, bridgeData, waterData, drainageData] = await Promise.all([
      getGasStats().catch(() => []),
      categoryFetchers["桥梁"]().catch(() => []),
      getWaterSupplyStats().catch(() => []),
      getDrainageStats().catch(() => []),
    ]);

    // 2. 按专项构建数据
    const rawData: Record<string, any[]> = {
      "燃气": Array.isArray(gasData) ? gasData : [],
      "桥梁": Array.isArray(bridgeData) ? bridgeData : [],
      "供水": Array.isArray(waterData) ? waterData : [],
      "排水": Array.isArray(drainageData) ? drainageData : [],
    };

    // 3. 构建最终数据
    const categories: OverviewCategory[] = [];
    Object.entries(sszxMapping).forEach(([sszx, mapping]) => {
      const items = (rawData[mapping.title] || []).map((item: any, index: number) => ({
        lsh: `${sszx}_${index}`,
        jcsslx: sszx,
        sszx,
        name: item.name || '',
        unit: item.unit || '',
        jcsstjsl: item.count || 0,
      }));

      categories.push({ title: mapping.title, icon: mapping.icon, sszx, items });
    });

    overviewData.value = categories;
  } catch (error) {
    console.error("获取总览数据失败:", error);
    overviewData.value = [];
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
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.15s ease;

    &:hover {
      opacity: 0.85;
    }

    &:active {
      transform: scale(0.98);
      opacity: 0.75;
    }

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
        top: 18px;

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
        line-height: 47px;
        text-align: center;
        font-style: bold;
      }
    }

    .category-items {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 20px;
      padding-top: 6px;
      padding-left: 20px;
      flex: 1;
      height: 115px;
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
        font-size: var(--font-size-heading);
        color: #F5FCFF;
        line-height: 43px;
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
          width: 14px;
          height: 14px;
          margin-right: 12px;
          margin-bottom: 7px;
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
