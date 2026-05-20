<template>
  <div class="data-module water-quality-module">
    <div class="module-header">
      <div class="module-title">{{moduleConfig.moduleName}}水质</div>
      <!-- <n-date-picker
        v-model:value="waterQualityDate"
        type="month"
        clearable
        class="custom-date-picker"
        :format="'yyyy年MM月'"
      /> -->
    </div>
    <div class="module-content">
      <div v-if="waterPlants && waterPlants.length > 0" class="quality-content">
        <div
          class="quality-item"
          v-for="plant in waterPlants"
          :key="plant.name"
        >
          <div class="quality-item-title">{{ plant.name }}</div>
          <div class="quality-item-content">
            <div
              class="quality-item-parameter"
              v-for="parameter in plant.parameters"
              :key="parameter.id"
            >
              <div class="parameter-value">
                <span
                  class="value gradient-text"
                  :style="{
                    backgroundImage:
                      parameter.status == 'normal'
                        ? 'linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%)'
                        : 'linear-gradient(0deg, #F75E04 0%, #FEAC04 100%)',
                  }"
                  >{{ parameter.value }}</span
                >
                <img
                  v-if="parameter.status == 'normal'"
                  src="@/assets/img/waterSupply/quality_normal.png"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/img/waterSupply/quality_abnormal.png"
                  alt=""
                />
              </div>
              <div class="parameter-title">{{ parameter.name }}
                <span v-if="parameter.unit" class="parameter-unit">({{ parameter.unit }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-text">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getLatestWaterQuality } from "@/services/waterSupplyService";
import { inject, onMounted, ref } from "vue";
import { parse } from "lossless-json";
import { nextTick } from "vue";
import { getCachedDictionary } from "@/services/dictionaryService";

const waterQualityDate = ref(Date.now());

// 从根组件接收模块配置
const moduleConfig = inject('MODULE_CONFIG', {
  sszx: 'csaqzx_gs',
  moduleName: '供水',
  dictKey: {
    szjcsb: 'gs_szjcsb'
  }
});

const szMap = ref<Record<string, { name: string; unit: string }>>({});
onMounted(async () => {
  // 获取监测指标字典（jczbzd），用于映射指标编码为中文名称和单位
  const dictionaries = await getCachedDictionary("jczbzd");
  szMap.value = dictionaries.reduce((acc, cur) => {
    acc[cur.f_ItemValue] = {
      name: cur.f_ItemName,
      unit: cur.f_Description || '',
    };
    return acc;
  }, {});

  const Sszx = moduleConfig.sszx || "";
  const res = await getLatestWaterQuality({Sszx}) as any[];
  nextTick(() => {
    waterPlants.value = res.map((item: any) => {
      const jcz = parse(item.jcz) as Record<string, any>;
      const parameters = [];
      for (let key in jcz) {
        const dictItem = szMap.value[key];
        parameters.push({
          id: key,
          name: dictItem?.name || key,
          value: jcz[key]?.jcz,
          unit: dictItem?.unit || jcz[key]?.jcdw || "",
          status: "normal",
        });
      }
      return {
        name: item.jcwz,
        parameters,
      };
    });
  });
});

const waterPlants = ref([]);
</script>

<style lang="scss" scoped>
.water-quality-module {
  .module-header {
    display: flex;
    justify-content: space-between;
  }

  :deep(.custom-date-picker) {
    .n-input {
      width: 260px;
      background-color: #094358;
      border: 2px solid #11a7e2;
      border-radius: 8px;
      height: 56px;
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-size: var(--font-size-heading);
      color: #ffffff;
      padding: 6px 20px;

      &:hover {
        border-color: rgba(22, 119, 255, 0.8);
      }

      &:focus-within {
        border-color: #1677ff;
        box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
      }

      .n-input__input-el {
        color: #ffffff;
        font-size: var(--font-size-heading);
        caret-color: #1677ff;
      }

      .n-input__placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      .n-input__suffix,
      .n-input__prefix {
        .n-base-icon {
          color: rgba(255, 255, 255, 0.6);
          font-size: var(--font-size-body);
        }
      }

      .n-input__state-border {
        border: none;
      }
    }

    .n-base-clear {
      color: rgba(255, 255, 255, 0.6);

      &:hover {
        color: #ff4d4f;
      }
    }
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  .empty-text {
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-size: var(--font-size-subtitle);
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
  }
}

.quality-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  gap: 0;
  
  .quality-item{
    width: 50%;
    flex-shrink: 0;
    flex-grow: 0;
  }
  .quality-item-title {
    background-image: url("@/assets/img/waterSupply/quality_title.png");
    width: auto;
    height: 51px;
    background-size: 100% 100%;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: var(--font-size-subtitle);
    color: #effaff;
    text-align: center;
    font-style: normal;
    margin-bottom: 40px;
  }

  .quality-item-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .quality-item-parameter {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    margin-bottom: 40px;

    .parameter-value {
      display: flex;
      flex-direction: column;
      width: 86px;
      position: relative;

      img {
        width: 100%;
        height: 90px;
      }

      .value {
        width: 100%;
        position: absolute;
        top: -30px;
        font-family: YouSheBiaoTiHei;
        font-size: var(--font-size-title);
        color: #ffffff;
        line-height: 52px;
        text-align: center;
        font-style: normal;
      }
    }

    .parameter-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: var(--font-size-heading);
      color: #e4f3ff;
      line-height: 44px;
      text-align: center;
      font-style: normal;

      .parameter-unit {
        font-size: var(--font-size-body);
        color: rgba(228, 243, 255, 0.7);
        margin-left: 4px;
      }
    }
  }
}
</style>
