import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 桥梁三维模型状态管理
 * 用于在 MapToolbar 和 OverviewModule 之间通信
 */
export const useBridgeModelStore = defineStore('bridgeModel', () => {
  /** 清除设备点位的回调（由 OverviewModule 注册） */
  let clearDevicePointsCallback: (() => void) | null = null

  /** 退出三维后重新加载散点的回调 */
  let reloadScatterCallback: (() => void) | null = null

  /** 已加载的 tileset 引用（由 OverviewModule 注册，退出时移除） */
  const loadedTilesets = ref<any[]>([])

  /** viewer 引用（用于移除 tileset） */
  let viewerRef: any = null

  function setViewer(v: any) {
    viewerRef = v
  }

  function addTileset(tileset: any) {
    loadedTilesets.value.push(tileset)
  }

  function removeAllTilesets() {
    if (!viewerRef) return
    for (const ts of loadedTilesets.value) {
      try {
        viewerRef.scene.primitives.remove(ts)
      } catch { /* ignore */ }
    }
    loadedTilesets.value = []
    // 清除设备点位 DOM 容器
    const dotContainer = viewerRef.container?.querySelector('#bridgeDeviceDots')
    if (dotContainer?.parentNode) {
      dotContainer.parentNode.removeChild(dotContainer)
    }
    viewerRef?.scene?.requestRender()
  }

  function registerClearCallback(cb: () => void) {
    clearDevicePointsCallback = cb
  }

  function unregisterClearCallback() {
    clearDevicePointsCallback = null
  }

  function clearDevicePoints() {
    clearDevicePointsCallback?.()
  }

  function registerReloadScatter(cb: () => void) {
    reloadScatterCallback = cb
  }

  function unregisterReloadScatter() {
    reloadScatterCallback = null
  }

  function reloadScatter() {
    reloadScatterCallback?.()
  }

  /** 退出三维时一键清除所有 */
  function clearAll() {
    removeAllTilesets()
    clearDevicePoints()
  }

  return {
    loadedTilesets,
    setViewer,
    addTileset,
    removeAllTilesets,
    registerClearCallback,
    unregisterClearCallback,
    clearDevicePoints,
    registerReloadScatter,
    unregisterReloadScatter,
    reloadScatter,
    clearAll,
  }
})
