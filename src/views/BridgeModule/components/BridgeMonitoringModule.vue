<template>
  <div class="data-module bridge-monitoring-module">
    <div class="module-header">
      <div class="module-title">桥梁监控</div>
    </div>
    <div class="module-content">
      <!-- 顶部统计卡片 -->
       <!-- todo 目前为假数据 -->
      <div class="top-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/device_count.webp" alt="监测设备" />
          </div>
          <div class="stat-info">
            <div class="stat-label">监控设备总数</div>
            <div class="stat-value">
              <span class="value-total gradient-text">20</span>
              <span class="value-separator">/</span>
              <span class="value-offline gradient-text">18</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/online_rate.webp" alt="在线率" />
          </div>
          <div class="stat-info">
            <div class="stat-label">在线率</div>
            <div class="stat-value">
              <span class="value-rate gradient-text">90%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 下方：轮播图区域 -->
      <div class="carousel-container">
        <n-carousel
          ref="carouselRef"
          effect="card"
          :loop="true"
          :autoplay="false"
          :autoplay-speed="3000"
          :transition-duration="500"
          :show-dots="false"
          :show-arrow="false"
          prev-slide-style="transform: translateX(-150%) translateZ(-800px) translateY(-20px);"
          next-slide-style="transform: translateX(50%) translateZ(-800px) translateY(-20px);"
        >
          <n-carousel-item v-for="(item, index) in bridgeCarouselList" :key="index" :style="{ width: '65%' }">
            <div class="carousel-item">
              <img class="carousel-image" :src="getImagePath(item.filename)" alt="bridge" />
              <span class="carousel-label">{{ item.name }}</span>
            </div>
          </n-carousel-item>
        </n-carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NCarousel, NCarouselItem } from "naive-ui";

interface BridgeItem {
  name: string;
  filename: string;
  type: string;
}

const bridgeCarouselList: BridgeItem[] = [
  { "name": "下稚大道桥", "filename": "下稚大道桥.png", "type": "image" },
  { "name": "中百天桥", "filename": "中百天桥.png", "type": "image" },
  { "name": "光谷天桥", "filename": "光谷天桥.png", "type": "image" },
  { "name": "兴富大道1号桥", "filename": "兴富大道1号桥.png", "type": "image" },
  { "name": "兴富大道2号桥", "filename": "兴富大道2号桥.png", "type": "image" },
  { "name": "兴富大道3号桥", "filename": "兴富大道3号桥.png", "type": "image" },
  { "name": "南河桥", "filename": "南河桥.png", "type": "image" },
  { "name": "富川小学人人行天桥", "filename": "富川小学人人行天桥.png", "type": "image" },
  { "name": "富阳路桥", "filename": "富阳路桥.png", "type": "image" },
  { "name": "明月湾大桥（跨莲花湖二号桥）", "filename": "明月湾大桥（跨莲花湖二号桥）.png", "type": "image" },
  { "name": "林峰路上跨桥", "filename": "林峰路上跨桥.png", "type": "image" },
  { "name": "独山湖大桥", "filename": "独山湖大桥.jpg", "type": "image" },
  { "name": "纬八路跨1号", "filename": "纬八路跨1号.png", "type": "image" },
  { "name": "纬八路跨2号排洪渠桥", "filename": "纬八路跨2号排洪渠桥.png", "type": "image" },
  { "name": "纬六路跨1号", "filename": "纬六路跨1号.png", "type": "image" },
  { "name": "纬六路跨2号排洪渠桥", "filename": "纬六路跨2号排洪渠桥.png", "type": "image" },
  { "name": "莲花湖大桥（莲花湖一号桥主桥）", "filename": "莲花湖大桥（莲花湖一号桥主桥）.png", "type": "image" },
  { "name": "阳新大道1号桥", "filename": "阳新大道1号桥.png", "type": "image" },
  { "name": "陵园大道立交桥", "filename": "陵园大道立交桥.png", "type": "image" }
];

const baseUrl = import.meta.env.VITE_BASE_URL;
const getImagePath = (filename: string) => {
  return `${baseUrl}/images/bridgeImages/${filename}`;
};

const carouselRef = ref<any>(null);

defineOptions({
  name: "BridgeMonitoringModule"
});
</script>

<style lang="scss" scoped>
.bridge-monitoring-module {
  flex: 1;
}

// 顶部统计卡片
.top-stats {
  display: flex;
  background-image: url("@/assets/img/gasModule/device_bg.webp");
  background-size: 100% 100%;
  width: 100%;
  margin-bottom: 24px;

  .stat-card {
    border-radius: 8px;
    padding: 20px 25px;
    display: flex;
    align-items: center;
    gap: 20px;

    .stat-icon {
      width: 114px;
      height: 91px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .stat-info {
      flex: 1;

      .stat-label {
        font-family: SourceHanSansSC, SourceHanSansSC;
        font-weight: 500;
        font-size: var(--font-size-subtitle);
        color: #effaff;
        line-height: 46px;
        text-align: center;
        font-style: normal;
      }

      .stat-value {
        display: flex;
        align-items: baseline;
        gap: 8px;

        >span {
          font-family: YouSheBiaoTiHei;
          font-size: var(--font-size-subtitle);
          color: #ffffff;
          line-height: 42px;
          text-align: center;
          font-style: normal;
        }

        .value-total {
          background: linear-gradient(90deg, #ffffff 0%, #1677ff 100%);
        }

        .value-separator {
          color: #fff;
        }

        .value-online {
          background: linear-gradient(90deg, #fffeed 0%, #cdab06 100%);
        }

        .value-offline {
          background: linear-gradient(90deg, #ffe9da 0%, #ce5a0d 100%);
        }

        .value-rate {
          background: linear-gradient(0deg, #3ffefd 0%, #fff407 100%);
        }
      }
    }
  }
}

// ==================== 轮播图区域 ====================
.carousel-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  :deep(.n-carousel) {
    width: 100%;
  }

  :deep(.n-carousel__slides) {
    perspective: 1200px;
  }
}

.carousel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .carousel-image {
    width: 100%;
    height: 320px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid rgba(0, 212, 212, 0.2);
    transition: all 0.5s ease;
  }

  .carousel-label {
    width: 100%;
    min-height: 50px;
    background: linear-gradient(90deg, rgba(12, 59, 58, 0) 0%, #0C3B3A 53%, rgba(12, 59, 58, 0) 100%);
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: var(--font-size-subtitle);
    color: #EFFAFF;
    line-height: 26px;
    font-style: normal;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// Naive UI card effect - 中间活跃项样式
:deep(.n-carousel__slide-item--current) {
  .carousel-item .carousel-image {
    border-color: rgba(0, 212, 212, 0.6);
    box-shadow: 0 0 20px rgba(0, 212, 212, 0.3);
  }

  .carousel-item .carousel-label {
    color: #FFFFFF;
    font-weight: bold;
  }
}
</style>
