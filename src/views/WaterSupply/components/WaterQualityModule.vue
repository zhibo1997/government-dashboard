<template>
  <div class="data-module water-quality-module">
    <div class="module-header">
      <div class="module-title">供水水质</div>
      <!-- <n-date-picker
        v-model:value="waterQualityDate"
        type="month"
        clearable
        class="custom-date-picker"
        :format="'yyyy年MM月'"
      /> -->
    </div>
    <div class="module-content">
      <div class="quality-content">
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
              <div class="parameter-title">{{ parameter.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getDataItemDetails } from "@/services/commonService";
import { getLatestWaterQuality } from "@/services/waterSupplyService";
import { onMounted, ref } from "vue";
import { parse } from "lossless-json";
import { nextTick } from "vue";

const waterQualityDate = ref(Date.now());

const szMap = ref({});
onMounted(async () => {
  // 获取最新供水水质字典
  const dictionaries = await getDataItemDetails("gs_szjcsb");
  szMap.value = dictionaries.reduce((acc, cur) => {
    acc[cur.f_ItemValue] = cur.f_ItemName;
    return acc;
  }, {});
  const res = await getLatestWaterQuality();
  nextTick(() => {
    waterPlants.value = res.map((item) => {
      const jcz = parse(item.jcz);
      const parameters = [];
      for (let key in jcz) {
        parameters.push({
          id: key,
          name: szMap.value[key],
          value: jcz[key]?.jcz,
          unit: jcz[key]?.jcdw || "",
          status: "normal",
        });
      }
      return {
        name: item.jcwz,
        parameters,
      };
    });
    console.log("🚀 ~ waterPlants.value:", waterPlants.value);
  });
});

const waterPlants = ref();
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
      font-size: 28px;
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
        font-size: 28px;
        caret-color: #1677ff;
      }

      .n-input__placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      .n-input__suffix,
      .n-input__prefix {
        .n-base-icon {
          color: rgba(255, 255, 255, 0.6);
          font-size: 24px;
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

.quality-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  overflow-y: auto;

  .quality-item-title {
    background-image: url("@/assets/img/waterSupply/quality_title.png");
    width: auto;
    height: 51px;
    background-size: 100% 100%;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: 36px;
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
        font-size: 40px;
        color: #ffffff;
        line-height: 52px;
        text-align: center;
        font-style: normal;
      }
    }

    .parameter-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 400;
      font-size: 30px;
      color: #e4f3ff;
      line-height: 44px;
      text-align: center;
      font-style: normal;
    }
  }
}
</style>
