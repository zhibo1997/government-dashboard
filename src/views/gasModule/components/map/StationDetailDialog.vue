<template>
  <div class="station-detail-dialog" v-show="visible">
    <div class="dialog-header">
      <div class="dialog-title">{{ stationData?.qymc || '企业详情' }}</div>
      <n-button text class="close-btn" @click="handleClose">
        <n-icon size="40" color="rgb(17,167,226)" :component="Close" class="action-icon favorite-icon" />
      </n-button>
    </div>

    <div class="dialog-content">
      <!-- 天然气企业信息 -->
      <div class="info-section" v-if="isNaturalGas">
        <div class="info-grid">
          <div class="info-row">
            <label>流水号：</label>
            <span class="info-value">{{ stationData?.lsh || '—' }}</span>
          </div>

          <div class="info-row">
            <label>企业编码：</label>
            <span class="info-value">{{ stationData?.qybm || '—' }}</span>
          </div>

          <div class="info-row">
            <label>企业名称：</label>
            <span class="info-value">{{ stationData?.qymc || '—' }}</span>
          </div>

          <div class="info-row">
            <label>详细地址：</label>
            <span class="info-value">{{ stationData?.xxdz || '—' }}</span>
          </div>

          <div class="info-row">
            <label>经营区域：</label>
            <span class="info-value">{{ stationData?.jyqy || '—' }}</span>
          </div>

          <div class="info-row">
            <label>职工人数：</label>
            <span class="info-value">{{ formatNumber(stationData?.zgrs) }} 人</span>
          </div>

          <div class="info-row">
            <label>拥有窨井数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.yyyjsl) }} 个</span>
          </div>

          <div class="info-row">
            <label>拥有厂站数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.yyczsl) }} 个</span>
          </div>

          <div class="info-row">
            <label>拥有管线长度：</label>
            <span class="info-value">{{ formatNumber(stationData?.yygxcd) }} km</span>
          </div>
        </div>

        <div class="status-badge-row">
          <button class="badge-btn badge-type">天然气企业</button>
          <button class="badge-btn badge-normal" v-if="stationData?.sjtbzt === 'I'">正常</button>
          <button class="badge-btn badge-error" v-else>异常</button>
        </div>
      </div>

      <!-- 液化气企业信息 -->
      <div class="info-section" v-else-if="isLiquefiedGas">
        <div class="info-grid">
          <div class="info-row">
            <label>流水号：</label>
            <span class="info-value">{{ stationData?.lsh || '—' }}</span>
          </div>

          <div class="info-row">
            <label>企业编码：</label>
            <span class="info-value">{{ stationData?.qybm || '—' }}</span>
          </div>

          <div class="info-row">
            <label>企业名称：</label>
            <span class="info-value">{{ stationData?.qymc || '—' }}</span>
          </div>

          <div class="info-row">
            <label>详细地址：</label>
            <span class="info-value">{{ stationData?.xxdz || '—' }}</span>
          </div>

          <div class="info-row">
            <label>经营区域：</label>
            <span class="info-value">{{ stationData?.jyqy || '—' }}</span>
          </div>

          <div class="info-row">
            <label>液化气瓶数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.yhqpsl) }} 个</span>
          </div>

          <div class="info-row">
            <label>职工人数：</label>
            <span class="info-value">{{ formatNumber(stationData?.zgrs) }} 人</span>
          </div>

          <div class="info-row">
            <label>充装工数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.czgsl) }} 人</span>
          </div>

          <div class="info-row">
            <label>送气工数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.sqgsl) }} 人</span>
          </div>

          <div class="info-row">
            <label>客户总数：</label>
            <span class="info-value">{{ formatNumber(stationData?.khzs) }} 户</span>
          </div>

          <div class="info-row">
            <label>居民客户数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.jmkhsl) }} 户</span>
          </div>

          <div class="info-row">
            <label>非居民客户数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.fjmkhsl) }} 户</span>
          </div>

          <div class="info-row">
            <label>运输车辆数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.ysclsl) }} 辆</span>
          </div>

          <div class="info-row">
            <label>安装定位设备车辆数量：</label>
            <span class="info-value">{{ formatNumber(stationData?.azdwsbclsl) }} 辆</span>
          </div>

          <div class="info-row">
            <label>企业负责人姓名：</label>
            <span class="info-value">{{ stationData?.qyfzrxm || '—' }}</span>
          </div>

          <div class="info-row">
            <label>企业经营有效期：</label>
            <span class="info-value">{{ stationData?.qyjyyxq || '—' }}</span>
          </div>

        </div>

        <div class="status-badge-row">
          <button class="badge-btn badge-type">液化气企业</button>
          <button class="badge-btn badge-normal" v-if="stationData?.sjtbzt === 'I'">正常</button>
          <button class="badge-btn badge-error" v-else>异常</button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn btn-monitoring" @click="handleShowMonitoring">
          监测设备
        </button>
        <button class="action-btn btn-warning">
          查看监控
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { NButton, NIcon } from 'naive-ui';
import { Close } from '@vicons/ionicons5';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  stationData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible', 'show-monitoring']);

// 判断是否为天然气
const isNaturalGas = computed(() => {
  return props.stationData?.gasType === 'rqlx001' || props.stationData?.rqlx === 'rqlx001';
});

// 判断是否为液化气
const isLiquefiedGas = computed(() => {
  return props.stationData?.gasType === 'rqlx002' || props.stationData?.rqlx === 'rqlx002';
});

// 格式化数字
const formatNumber = (value) => {
  if (!value && value !== 0) return '—';
  return value.toLocaleString('zh-CN');
};

// 格式化坐标
const formatCoordinate = (value) => {
  if (!value && value !== 0) return '—';
  return parseFloat(value).toFixed(6);
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const handleClose = () => {
  emit('update:visible', false);
};

const handleShowMonitoring = () => {
  emit('show-monitoring');
};
</script>

<style lang="scss" scoped>
.station-detail-dialog {
  position: absolute;
  top: 80px;
  left: 1320px;
  width: 516px;
  background: linear-gradient(270deg, rgba(8, 46, 77, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%);

  border: 3px solid #226d76;
  z-index: 200;
  overflow: hidden;
  pointer-events: auto;

  .dialog-header {
    height: 70px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-image: url("@/assets/img/gasModule/detail_head_bg.webp");
    border-bottom: 2px solid rgba(13, 165, 190, 0.5);

    .dialog-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: 500;
      font-size: 28px;
      color: #E4F3FF;
      line-height: 41px;
    }

  }

  .dialog-content {
    padding: 30px 20px 24px;
    backdrop-filter: blur(30px);

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 30px;

      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px 20px;
        margin-bottom: 20px;
      }

      .status-badge-row {
        display: flex;
        gap: 12px;
        justify-content: center;
        padding: 15px 0;
        border-top: 2px solid rgba(13, 165, 190, 0.3);

        .badge-btn {
          padding: 6px 16px;
          border-radius: 8px;
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 500;
          font-size: 20px;
          line-height: 29px;

          &.badge-type {
            background: #313D56;
            border-radius: 8px;
            border: 2px solid #15779D;

            color: #E4F3FF;
            line-height: 29px;
          }

          &.badge-normal {
            background: linear-gradient(90deg, rgba(4, 247, 103, 0.6) 0%, rgba(4, 199, 254, 0.6) 99%);
            border: 2px solid #04C7FE;
            color: #fff;
          }

          &.badge-error {
            color: #fff;
            background: linear-gradient(90deg, rgba(247, 94, 4, 0.6) 0%, rgba(254, 172, 4, 0.6) 100%);
            border: 2px solid #F76204;
            border-image: linear-gradient(180deg, rgba(252, 155, 10, 1), rgba(247, 98, 4, 1)) 2 2;
          }
        }
      }

      .info-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 18px;
        line-height: 26px;

        label {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          color: #A8D4E0;
          min-width: 140px;
          flex-shrink: 0;
        }

        .info-value {
          font-family: SourceHanSansSC, SourceHanSansSC;
          font-weight: 400;
          color: #E4F3FF;
          flex: 1;
          min-width: 0;
        }
      }
    }

    .action-section {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding-top: 24px;
      border-top: 2px solid rgba(13, 165, 190, 0.3);

      .action-btn {
        width: 170px;
        height: 60px;
        background: linear-gradient(180deg, #083957 0%, #091827 100%);
        border: 2px solid;
        border-image: linear-gradient(153deg, rgba(25, 163, 203, 1), rgba(62, 109, 123, 1), rgba(17, 171, 233, 1)) 2 2;

        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 500;
        font-size: 30px;
        color: #FFFFFF;
        line-height: 44px;
        text-align: left;
        font-style: normal;
        background: linear-gradient(90deg, #FFFFFF 18%, #10ADC0 100%);
        cursor: pointer;
        text-align: center;

        &.btn-monitoring {
          background: rgba(0, 60, 80, 0.6);
          border-color: #0DA5BE;
          color: #FFFFFF;

          &:hover {
            background: rgba(13, 165, 190, 0.4);
            border-color: #3FFFFF;
            box-shadow: 0 0 16px rgba(13, 165, 190, 0.5);
          }
        }

        &.btn-warning {
          background: rgba(0, 60, 80, 0.6);
          border-color: #0DA5BE;
          color: #FFFFFF;

          &:hover {
            background: rgba(13, 165, 190, 0.4);
            border-color: #3FFFFF;
            box-shadow: 0 0 16px rgba(13, 165, 190, 0.5);
          }
        }
      }
    }
  }


}
</style>