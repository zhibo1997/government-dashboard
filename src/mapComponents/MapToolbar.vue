<template>
  <div class="map-toolbar" :class="{ collapsed: isCollapsed }">
    <!-- 收缩按钮 -->
    <div class="toolbar-item" @click="toggleCollapse" title="收缩/展开">
      <div class="tool-icon">
        <img src="@/assets/map/collapse.webp" alt="" />
      </div>
    </div>

    <!-- 工具按钮组 (收缩时隐藏) -->
    <template v-if="!isCollapsed">
      <!-- 图层树 (暂不开发) -->
      <div class="toolbar-item disabled" title="图层树 (敬请期待)">
        <div class="tool-icon">
          <img src="@/assets/map/map_tree.webp" alt="">
        </div>
      </div>

      <!-- 底图切换 -->
      <div 
        class="toolbar-item" 
        :class="{ active: showBaseMapPanel }"
        @click="toggleBaseMapPanel" 
        title="底图切换"
      >
        <div class="tool-icon">
          <img src="@/assets/map/base_map.webp" alt="">
        </div>
        <!-- 底图切换面板 -->
        <transition name="slide-left">
          <div v-if="showBaseMapPanel" class="base-map-panel">
            <div class="panel-title">底图切换</div>
            <div class="base-map-options">
              <div 
                v-for="item in baseMapTypes" 
                :key="item.value"
                class="base-map-option"
                :class="{ active: currentBaseMap === item.value }"
                @click.stop="switchBaseMap(item.value)"
              >
                <div class="option-icon">{{ item.icon }}</div>
                <div class="option-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 地图重置 -->
      <div class="toolbar-item" @click="resetMap" title="重置地图">
        <div class="tool-icon">
          <img src="@/assets/map/reset_map.webp" alt="">
        </div>
      </div>

      <!-- 2D/3D切换 -->
      <div class="toolbar-item" @click="toggleViewMode" title="2D/3D切换">
        <div class="tool-icon">
          <img src="@/assets/map/view_mode.webp" alt="">
        </div>
      </div>

      <!-- 指北针 -->
      <div class="toolbar-item" @click="resetNorth" title="指北针">
        <div class="tool-icon compass" :style="{ transform: `rotate(${compassRotation}deg)` }">
          <img src="@/assets/map/compass.webp" alt="">
        </div>
      </div>

      <!-- 测量工具 -->
      <div 
        class="toolbar-item" 
        :class="{ active: showMeasurePanel }"
        @click="toggleMeasurePanel" 
        title="测量工具"
      >
        <div class="tool-icon">
          <img src="@/assets/map/measure.webp" alt="">
        </div>
        <!-- 测量工具面板 -->
        <transition name="slide-left">
          <div v-if="showMeasurePanel" class="measure-panel">
            <div class="panel-title">测量工具</div>
            <div class="measure-options">
              <div 
                class="measure-option"
                :class="{ active: measureMode === 'distance' }"
                @click.stop="startMeasure('distance')"
              >
                <span class="option-icon">📐</span>
                <span class="option-label">距离测量</span>
              </div>
              <div 
                class="measure-option"
                :class="{ active: measureMode === 'area' }"
                @click.stop="startMeasure('area')"
              >
                <span class="option-icon">📦</span>
                <span class="option-label">面积测量</span>
              </div>
              <div 
                v-if="measureMode"
                class="measure-option clear"
                @click.stop="clearMeasure"
              >
                <span class="option-icon">🗑️</span>
                <span class="option-label">清除测量</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import mapConfig from '@/config/mapConfig'

// Props定义
const props = defineProps<{
  viewerInstance?: any
}>()

// Emits定义
const emit = defineEmits<{
  baseMapChange: [type: 'vec' | 'img' | 'ter']
  resetMap: []
  viewModeChange: [is3D: boolean]
  measureStart: [mode: 'distance' | 'area']
  measureClear: []
}>()

// 状态管理
const isCollapsed = ref(false)
const showBaseMapPanel = ref(false)
const showMeasurePanel = ref(false)
const currentBaseMap = ref<'vec' | 'img' | 'ter'>('vec')
const is3D = ref(false)
const measureMode = ref<'distance' | 'area' | null>(null)
const compassRotation = ref(0)

// 底图类型配置
const baseMapTypes = [
  { value: 'vec', label: '矢量地图', icon: '🗺️' },
  { value: 'img', label: '影像地图', icon: '🛰️' },
  { value: 'ter', label: '地形地图', icon: '🏔️' }
] as const

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // 收缩时关闭所有面板
  if (isCollapsed.value) {
    showBaseMapPanel.value = false
    showMeasurePanel.value = false
  }
}

// 切换底图面板
const toggleBaseMapPanel = () => {
  showBaseMapPanel.value = !showBaseMapPanel.value
  showMeasurePanel.value = false
}

// 切换测量面板
const toggleMeasurePanel = () => {
  showMeasurePanel.value = !showMeasurePanel.value
  showBaseMapPanel.value = false
}

// 切换底图
const switchBaseMap = (type: 'vec' | 'img' | 'ter') => {
  currentBaseMap.value = type
  emit('baseMapChange', type)
  console.log(`切换底图: ${type}`)
  
  // 可选：切换后自动关闭面板
  // showBaseMapPanel.value = false
}

// 重置地图
const resetMap = () => {
  emit('resetMap')
  console.log('重置地图视角')
}

// 切换2D/3D视图
const toggleViewMode = () => {
  is3D.value = !is3D.value
  emit('viewModeChange', is3D.value)
  console.log(`切换视图模式: ${is3D.value ? '3D' : '2D'}`)
}

// 重置指北
const resetNorth = () => {
  compassRotation.value = 0
  console.log('重置指北方向')
  
  // TODO: 调用Cesium API重置相机朝向
  if (props.viewerInstance) {
    // props.viewerInstance.camera.setView({
    //   orientation: {
    //     heading: 0,
    //     pitch: -90,
    //     roll: 0
    //   }
    // })
  }
}

// 开始测量
const startMeasure = (mode: 'distance' | 'area') => {
  measureMode.value = mode
  emit('measureStart', mode)
  console.log(`开始${mode === 'distance' ? '距离' : '面积'}测量`)
}

// 清除测量
const clearMeasure = () => {
  measureMode.value = null
  emit('measureClear')
  console.log('清除测量结果')
}

// 监听相机朝向变化更新指北针
watch(() => props.viewerInstance, (viewer) => {
  if (viewer) {
    // TODO: 监听相机变化更新指北针旋转角度
    // viewer.camera.changed.addEventListener(() => {
    //   const heading = viewer.camera.heading
    //   compassRotation.value = Cesium.Math.toDegrees(heading)
    // })
  }
}, { immediate: true })

// 暴露方法
defineExpose({
  isCollapsed,
  currentBaseMap,
  measureMode
})
</script>

<style lang="scss" scoped>
.map-toolbar {
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1000;
  transition: all 0.3s ease;

  &.collapsed {
    gap: 0;
    
    .toolbar-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .toolbar-item {
    position: relative;
    width: 80px;
    height: 80px;
    background: rgba(0, 15, 35, 0.85);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

    &:hover:not(.disabled) {
      transform: scale(1.05);
    }

    &.active {
      border-color: #1677ff;
      background: rgba(22, 119, 255, 0.25);
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        border-color: rgba(22, 119, 255, 0.3);
        background: rgba(0, 15, 35, 0.85);
      }
    }

    .tool-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
      background-image: url('@/assets/map/tool_bg.webp');

      &.compass {
        transition: transform 0.6s ease;
      }

      .icon-placeholder {
        font-size: 32px;
        color: #1677ff;
        text-shadow: 0 2px 8px rgba(22, 119, 255, 0.5);
      }
    }

  }

  // 底图切换面板
  .base-map-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 240px;
    background: rgba(0, 15, 35, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);
    }

    .base-map-options {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .base-map-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(22, 119, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(22, 119, 255, 0.15);
          border-color: rgba(22, 119, 255, 0.5);
          transform: translateX(-4px);
        }

        &.active {
          background: rgba(22, 119, 255, 0.25);
          border-color: #1677ff;
          
          .option-label {
            color: #1677ff;
            font-weight: bold;
          }
        }

        .option-icon {
          font-size: 24px;
        }

        .option-label {
          font-size: 16px;
          color: #ffffff;
          flex: 1;
        }
      }
    }
  }

  // 测量工具面板
  .measure-panel {
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 16px;
    width: 240px;
    background: rgba(0, 15, 35, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(22, 119, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(22, 119, 255, 0.2);
    }

    .measure-options {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .measure-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(22, 119, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(22, 119, 255, 0.15);
          border-color: rgba(22, 119, 255, 0.5);
          transform: translateX(-4px);
        }

        &.active {
          background: rgba(22, 119, 255, 0.25);
          border-color: #1677ff;
          
          .option-label {
            color: #1677ff;
            font-weight: bold;
          }
        }

        &.clear {
          border-color: rgba(255, 77, 79, 0.3);
          
          &:hover {
            background: rgba(255, 77, 79, 0.15);
            border-color: rgba(255, 77, 79, 0.6);
          }
          
          .option-label {
            color: #ff4d4f;
          }
        }

        .option-icon {
          font-size: 20px;
        }

        .option-label {
          font-size: 16px;
          color: #ffffff;
          flex: 1;
        }
      }
    }
  }

  // 面板滑入动画
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: all 0.3s ease;
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
}

// 响应式适配
@media (max-width: 1920px) {
  .map-toolbar {
    right: 20px;
    
    .toolbar-item {
      width: 60px;
      height: 60px;
      
      .tool-icon .icon-placeholder {
        font-size: 24px;
      }
    }
    
    .base-map-panel,
    .measure-panel {
      width: 200px;
      padding: 16px;
      
      .panel-title {
        font-size: 16px;
      }
      
      .base-map-option,
      .measure-option {
        padding: 10px 12px;
        
        .option-icon {
          font-size: 20px;
        }
        
        .option-label {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
