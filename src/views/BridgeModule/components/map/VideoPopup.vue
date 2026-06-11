<template>
  <Teleport to="body">
    <div v-if="visible" class="video-overlay" @click.self="handleClose">
      <div class="video-popup" :style="popupStyle">
        <div class="video-popup-bg">
          <img src="@/assets/img/video_popup.webp" alt="" />
        </div>
        <div class="video-popup-content">
          <div class="video-close-area" @click="handleClose"></div>
          <div class="video-title">{{ cameraName }}</div>
          <video
            class="video-player"
            :src="videoUrl"
            controls
            autoplay
            muted
            @error="onVideoError"
          ></video>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  cameraName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:visible'])

const scaleRatio = inject<any>('responsiveScale', ref(1))

const popupStyle = computed(() => ({
  transform: `scale(${scaleRatio.value})`,
}))

const handleClose = () => {
  emit('update:visible', false)
}

function onVideoError(e: Event) {
  console.error('视频播放错误:', e)
}
</script>

<style lang="scss" scoped>
.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.video-popup {
  position: relative;
  width: 1600px;
  height: 950px;
  transform-origin: center center;

  .video-popup-bg {
    position: absolute;
    inset: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: fill;
    }
  }

  .video-popup-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 60px 10px 10px;
    box-sizing: border-box;
  }

  .video-close-area {
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 80px;
    z-index: 2;
    cursor: pointer;
  }

  .video-title {
    position: absolute;
    top: 16px;
    left: 30px;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 500;
    font-size: 18px;
    color: #e4f3ff;
    z-index: 2;
  }

  .video-player {
    flex: 1;
    width: 100%;
    background: #000;
    border-radius: 4px;
  }
}
</style>
