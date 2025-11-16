<template>
  <div class="station-detail-dialog" v-show="visible">
    <div class="dialog-header">
      <div class="dialog-title">华川燃气场站</div>
      <button class="close-btn" @click="handleClose">×</button>
    </div>

    <div class="dialog-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="info-row">
          <label>场站编号：</label>
          <span>HCR0C21</span>
          <button class="tag-btn tag-primary">查询</button>
        </div>
        <div class="info-row">
          <label>天然气门站：</label>
          <span>—</span>
        </div>
        <div class="info-row">
          <label>场站地址：</label>
          <span>阳新县X区XX路街道G351</span>
        </div>
        <div class="info-row">
          <label>所属企业：</label>
          <span>阳新县华川燃气有限公司</span>
        </div>
        <div class="info-row">
          <label>设计机气量：</label>
          <span>300,000 $m³</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn btn-monitoring" @click="handleShowMonitoring">
          监测设备
        </button>
        <button class="action-btn btn-warning">
          告警监控
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 520px;
  background: rgba(0, 30, 60, 0.92);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(22, 119, 255, 0.4);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 200;
  overflow: hidden;

  .dialog-header {
    height: 60px;
    padding: 0 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(
      90deg,
      rgba(22, 119, 255, 0.25) 0%,
      rgba(22, 119, 255, 0.1) 100%
    );
    border-bottom: 1px solid rgba(22, 119, 255, 0.3);

    .dialog-title {
      font-family: SourceHanSansSC, SourceHanSansSC;
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      background: rgba(255, 77, 79, 0.15);
      border: 1px solid rgba(255, 77, 79, 0.3);
      border-radius: 4px;
      color: #ff4d4f;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 77, 79, 0.25);
        border-color: rgba(255, 77, 79, 0.5);
      }
    }
  }

  .dialog-content {
    padding: 25px;

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 25px;

      .info-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;

        label {
          color: #10adc0;
          min-width: 100px;
          flex-shrink: 0;
        }

        span {
          color: #ffffff;
          flex: 1;
        }

        .tag-btn {
          padding: 4px 16px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;

          &.tag-primary {
            background: linear-gradient(135deg, #1677ff 0%, #0d4a8f 100%);
            color: #ffffff;

            &:hover {
              background: linear-gradient(135deg, #3d8dff 0%, #1677ff 100%);
            }
          }
        }
      }
    }

    .action-section {
      display: flex;
      gap: 15px;
      padding-top: 20px;
      border-top: 1px solid rgba(22, 119, 255, 0.2);

      .action-btn {
        flex: 1;
        height: 44px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;

        &.btn-monitoring {
          background: linear-gradient(135deg, #1677ff 0%, #0d4a8f 100%);
          color: #ffffff;

          &:hover {
            background: linear-gradient(135deg, #3d8dff 0%, #1677ff 100%);
            box-shadow: 0 4px 12px rgba(22, 119, 255, 0.4);
          }
        }

        &.btn-warning {
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
          color: #ffffff;

          &:hover {
            background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
            box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
          }
        }
      }
    }
  }
}
</style>
