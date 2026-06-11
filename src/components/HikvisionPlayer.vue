<template>
  <div ref="playerContainer" class="hikvision-player" :id="containerId"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Props {
  /** 播放容器 ID（页面唯一） */
  containerId?: string
}

const props = withDefaults(defineProps<Props>(), {
  containerId: 'hikvision-player',
})

const playerContainer = ref<HTMLDivElement | null>(null)
let player: any = null
let scriptLoaded = false

/** 动态加载 h5player.min.js */
function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded || (window as any).JSPlugin) {
      scriptLoaded = true
      resolve()
      return
    }
    const script = document.createElement('script')
    const base = import.meta.env.BASE_URL || '/'
    script.src = `${base}hikvision-h5player/h5player.min.js`
    script.onload = () => {
      scriptLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('h5player.min.js 加载失败'))
    document.head.appendChild(script)
  })
}

/** 初始化播放器 */
async function initPlayer() {
  await loadScript()
  await nextTick()

  const JSPlugin = (window as any).JSPlugin
  if (!JSPlugin) {
    console.error('JSPlugin 未定义')
    return
  }

  const base = import.meta.env.BASE_URL || '/'
  player = new JSPlugin({
    szId: props.containerId,
    szBasePath: `${base}hikvision-h5player/`,
    iMaxSplit: 1,
    iCurrentSplit: 1,
    openDebug: false,
    mseWorkerEnable: false,
    oStyle: {
      borderSelect: '#FFCC00',
    },
  })

  player.JS_SetWindowControlCallback({
    windowEventSelect: (iWndIndex: number) => {
      console.log('[H5player] 窗口选中:', iWndIndex)
    },
    pluginErrorHandler: (iWndIndex: number, iErrorCode: any, oError: any) => {
      const code: string = typeof iErrorCode === 'number' ? '0x' + iErrorCode.toString(16) : String(iErrorCode)
      console.error(`[H5player] 错误: 窗口=${iWndIndex}, 错误码=${code}, 详情=`, oError)
      // 常见错误码提示
      const tips: Record<string, string> = {
        '0x12f900001': 'URL格式错误，需wss://协议',
        '0x12f900002': 'WebSocket连接失败，请检查网络',
        '0x12f900004': 'wss连接失败，需安装平台根证书',
        '0x12f900005': 'ws/wss连接超时，请检查网络',
      }
      if (tips[code]) console.warn('[H5player] 提示:', tips[code])
    },
    firstFrameDisplay: (iWndIndex: number, iWidth: number, iHeight: number) => {
      console.log('[H5player] 首帧显示:', iWndIndex, iWidth, 'x', iHeight)
    },
  })

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

/** 播放视频 */
async function play(url: string, token?: string) {
  console.log('[H5player] play:', url)
  if (!player) {
    await initPlayer()
  }
  if (!player) return

  // 先停止之前的播放
  await player.JS_Stop().catch((e: any) => {
    console.warn('[H5player] JS_Stop:', e)
  })

  const index = player.currentWindowIndex
  const mode = 0 // 0=MSE模式，1=解码模式

  await player.JS_Play(
    url,
    { playURL: url, mode, keepDecoder: 0, token: token || '' },
    index,
  )
}

/** 停止播放 */
async function stop() {
  if (!player) return
  await player.JS_Stop().catch(() => {})
}

/** 窗口大小变化时重新调整 */
function handleResize() {
  if (player) {
    player.JS_Resize()
  }
}

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  play,
  stop,
  initPlayer,
})
</script>

<style lang="scss" scoped>
.hikvision-player {
  width: 100%;
  height: 100%;
  background: #000;
}
</style>
