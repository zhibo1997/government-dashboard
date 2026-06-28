/**
 * 视频播放 Hook（各模块共用）
 * @description 封装海康视频预览 URL 获取 + VideoPopup 状态管理
 */

import { ref } from 'vue'
import { getCameraPreviewUrl } from '@/services/hikvisionService'

export function useVideoPlayer() {
  const visible = ref(false)
  const videoUrl = ref('')
  const cameraName = ref('')

  /** 通过摄像头编号播放 */
  const play = async (spbh: string, name?: string) => {
    if (!spbh) return
    try {
      const preview = await getCameraPreviewUrl({
        cameraIndexCode: spbh,
        streamType: 0,
        protocol: 'hls',
        transmode: 1,
      })
      const url = preview?.url || preview?.data?.url
      if (url) {
        videoUrl.value = url
        cameraName.value = name || ''
        visible.value = true
      }
    } catch (e) {
      console.error('获取监控视频失败:', e)
    }
  }

  /** 直接传入 URL 播放（侧边栏等已有 URL 的场景） */
  const playUrl = (url: string, name?: string) => {
    if (!url) return
    videoUrl.value = url
    cameraName.value = name || ''
    visible.value = true
  }

  const close = () => {
    visible.value = false
    videoUrl.value = ''
    cameraName.value = ''
  }

  return { visible, videoUrl, cameraName, play, playUrl, close }
}
