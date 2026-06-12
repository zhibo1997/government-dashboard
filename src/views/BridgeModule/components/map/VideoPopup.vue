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
            ref="videoRef"
            class="video-player"
            controls
            autoplay
            muted
          ></video>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Hls from 'hls.js'

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
const videoRef = ref<HTMLVideoElement | null>(null)
let hlsInstance: Hls | null = null

const popupStyle = computed(() => ({
  transform: `scale(${scaleRatio.value})`,
}))

// 弹窗显示时播放视频
watch(
  () => props.visible,
  async (val) => {
    if (val && props.videoUrl) {
      await nextTick()
      initVideo(props.videoUrl)
    }
  },
)

function initVideo(url: string) {
  destroyHls()
  const video = videoRef.value
  if (!video) return

  if (url.includes('.m3u8') && Hls.isSupported()) {
    const hls = new Hls({
      liveSyncDurationCount: 1,      // 直播同步到最新1个分片
      liveMaxLatencyDurationCount: 3, // 最大延迟3个分片
      maxBufferLength: 5,              // 最大缓冲5秒
      maxMaxBufferLength: 10,          // 绝对最大缓冲10秒
      lowLatencyMode: true,            // 低延迟模式
    })
    hls.loadSource(url)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {})
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error('[HLS] 播放错误:', data)
        destroyHls()
      }
    })
    hlsInstance = hls
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari 原生支持
    video.src = url
    video.play().catch(() => {})
  } else {
    video.src = url
    video.play().catch(() => {})
  }
}

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
}

const handleClose = () => {
  destroyHls()
  emit('update:visible', false)
}

onBeforeUnmount(() => {
  destroyHls()
})
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
    padding: 60px 30px 30px;
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
    top: 4px;
    left: 30px;
    font-family: SourceHanSansSC, SourceHanSansSC;
    font-weight: 500;
    font-size: var(--font-size-heading);
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
