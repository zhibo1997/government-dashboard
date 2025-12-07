<template>
  <div class="data-module bridge-monitoring-module">
    <div class="module-header">
      <div class="module-title">桥梁监控</div>
    </div>
    <div class="module-content">
      <!-- 顶部统计卡片 -->
      <div class="top-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/img/device_count.webp" alt="监测设备" />
          </div>
          <div class="stat-info">
            <div class="stat-label">监测设备总数</div>
            <div class="stat-value">
              <span class="value-total gradient-text">-</span>
              <span class="value-separator">/</span>
              <span class="value-offline gradient-text">-</span>
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
              <span class="value-rate gradient-text">-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 下方：轮播图区域 -->
      <div class="carousel-container">
        <n-carousel ref="carouselRef" :slides-per-view="3" :space-between="0" :loop="true" :autoplay="false"
          :autoplay-speed="3000" :transition-duration="500" :show-dots="false" :show-arrow="false"
          @mouseenter="handleCarouselMouseEnter" @mouseleave="handleCarouselMouseLeave">
          <n-carousel-item v-for="(item, index) in bridgeCarouselList" :key="index">
            <div class="carousel-item-wrapper">
              <div class="carousel-item">
                <img class="carousel-image" :src="item.image" alt="bridge" />
                <span class="carousel-label">{{ item.title }}</span>
              </div>
            </div>
          </n-carousel-item>
        </n-carousel>

        <button class="carousel-btn prev-btn" @click="handlePrevClick"></button>
        <button class="carousel-btn next-btn" @click="handleNextClick"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NCarousel, NCarouselItem } from "naive-ui";
import BridgeImage1 from "@/assets/img/bridgeModule/bridge_1.png";
import BridgeImage2 from "@/assets/img/bridgeModule/bridge_2.png";
import BridgeImage3 from "@/assets/img/bridgeModule/bridge_3.png";

const bridgeCarouselList = [
  { title: "莲湖大桥", image: BridgeImage1 },
  { title: "林园大道立交桥", image: BridgeImage2 },
  { title: "明月湾大桥", image: BridgeImage3 },
  { title: "莲湖大桥", image: BridgeImage1 },
  { title: "林园大道立交桥", image: BridgeImage2 },
  { title: "明月湾大桥", image: BridgeImage3 },
];

// ==================== 轮播引用和状态 ====================
const carouselRef = ref<any>(null);
let isAutoPlayEnabled = true;

// ==================== 轮播控制函数 ====================
/**
 * 处理上一个按钮点击
 */
const handlePrevClick = () => {
  if (carouselRef.value) {
    carouselRef.value.prev();
    resetAutoPlay();
  }
};

/**
 * 处理下一个按钮点击
 */
const handleNextClick = () => {
  if (carouselRef.value) {
    carouselRef.value.next();
    resetAutoPlay();
  }
};

/**
 * 鼠标进入轮播区域，暂停自动播放
 */
const handleCarouselMouseEnter = () => {
  if (carouselRef.value) {
    isAutoPlayEnabled = false;
    carouselRef.value.stopAutoplay?.();
  }
};

/**
 * 鼠标离开轮播区域，恢复自动播放
 */
const handleCarouselMouseLeave = () => {
  if (carouselRef.value) {
    isAutoPlayEnabled = true;
    carouselRef.value.startAutoplay?.();
  }
};

/**
 * 重置自动播放（用户交互后重新启动）
 */
const resetAutoPlay = () => {
  if (carouselRef.value && isAutoPlayEnabled) {
    carouselRef.value.stopAutoplay?.();
    carouselRef.value.startAutoplay?.();
  }
};

defineOptions({
  name: "BridgeMonitoringModule"
});
</script>

<style lang="scss" scoped>
.bridge-monitoring-module {}


// 顶部统计卡片
.top-stats {
  display: flex;
  background-image: url("@/assets/img/gasModule/device_bg.webp");
  background-size: 100% 100%;
  width: 100%;

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
        font-size: 32px;
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
          font-size: 32px;
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
  gap: 10px;
  position: relative;

  :deep(.n-carousel) {
    width: 630px;
  }

  :deep(.n-carousel__slides) {
    margin-top: 60px;
  }
  :deep(.n-carousel__slide-item) {
    display: flex !important;
    justify-content: center;
    align-items: flex-end;
  }
}

.carousel-item-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
}

.carousel-btn {
  width: 48px;
  height: 48px;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(0, 150, 150, 0.6);
  border: 2px solid rgba(0, 212, 212, 0.5);
  color: #FFFFFF;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  &:hover {
    background: rgba(0, 180, 180, 0.8);
    border-color: #00D4D4;
    box-shadow: 0 0 16px rgba(0, 212, 212, 0.4);
  }

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
  }
}

.prev-btn {
  left: 10px;

  &::before {
    border-right: 8px solid currentColor;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
}

.next-btn {
  right: 10px;

  &::before {
    border-left: 8px solid currentColor;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
}

.carousel-item {
  width: 195px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.3s ease;

  .carousel-image {
    width: 100%;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(0, 212, 212, 0.2);
    transition: all 0.3s ease;
  }

  .carousel-label {
    margin-top: 16px;
    width: 100%;
    height: 50px;
    background: linear-gradient(90deg, rgba(12, 59, 58, 0) 0%, #0C3B3A 53%, rgba(12, 59, 58, 0) 100%);
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 400;
    font-size: 24px;
    color: #EFFAFF;
    line-height: 50px;
    font-style: normal;
    text-align: center;
    transition: all 0.3s ease;
  }
}

// Naive UI carousel 中间项为活跃状态的样式
:deep(.n-carousel__slide-item--active) {
  .carousel-item .carousel-image {
    border: 2px solid #00D4D4;
    box-shadow: 0 0 20px rgba(0, 212, 212, 0.4);
  }

  .carousel-item .carousel-label {
    color: #FFFFFF;
    font-weight: bold;
  }
}
</style>
