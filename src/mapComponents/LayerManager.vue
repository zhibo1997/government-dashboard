<template>
  <div class="layer-manager">
    <n-tabs v-model:value="activeTab" type="card">
      <n-tab-pane name="2d" tab="二维图层">
        <LayerTree2D
          ref="layerTree2DRef"
          @layer-visibility-change="handleLayerVisibilityChange"
          @layer-opacity-change="handleLayerOpacityChange"
        />
      </n-tab-pane>
      
      <n-tab-pane name="3d" tab="三维图层">
        <LayerTree3D
          ref="layerTree3DRef"
          @layer-visibility-change="handleLayerVisibilityChange"
          @layer-opacity-change="handleLayerOpacityChange"
          @locate-layer="handleLocateLayer"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import LayerTree2D from './LayerTree2D.vue'
import LayerTree3D from './LayerTree3D.vue'

interface LayerVisibilityEvent {
  layerKey: string
  visible: boolean
}

interface LayerOpacityEvent {
  layerKey: string
  opacity: number
}

interface LocateLayerEvent {
  layerKey: string
}

// 当前激活的标签页
const activeTab = ref('2d')

// 组件引用
const layerTree2DRef = ref<InstanceType<typeof LayerTree2D>>()
const layerTree3DRef = ref<InstanceType<typeof LayerTree3D>>()

/**
 * 处理图层可见性变化
 */
function handleLayerVisibilityChange(event: LayerVisibilityEvent) {
  console.log('图层可见性变化:', event)
  emit('layer-visibility-change', event)
}

/**
 * 处理图层透明度变化
 */
function handleLayerOpacityChange(event: LayerOpacityEvent) {
  console.log('图层透明度变化:', event)
  emit('layer-opacity-change', event)
}

/**
 * 处理定位图层
 */
function handleLocateLayer(event: LocateLayerEvent) {
  console.log('定位图层:', event)
  emit('locate-layer', event)
}

/**
 * 切换到二维图层
 */
function switchTo2D() {
  activeTab.value = '2d'
}

/**
 * 切换到三维图层
 */
function switchTo3D() {
  activeTab.value = '3d'
}

// 事件定义
const emit = defineEmits<{
  'layer-visibility-change': [LayerVisibilityEvent]
  'layer-opacity-change': [LayerOpacityEvent]
  'locate-layer': [LocateLayerEvent]
}>()

// 导出方法
defineExpose({
  layerTree2DRef,
  layerTree3DRef,
  switchTo2D,
  switchTo3D,
  activeTab
})
</script>

<style scoped>
.layer-manager {
  width: 320px;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

:deep(.n-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.n-tabs-nav) {
  margin-bottom: 0;
  padding: 8px 8px 0;
}

:deep(.n-tabs-content) {
  flex: 1;
  overflow: hidden;
  height: 100%;
}

:deep(.n-tabs-pane-wrapper) {
  height: 100%;
}

:deep(.n-tabs-tab) {
  background: #fafafa;
  border-color: #f0f0f0;
}

:deep(.n-tabs-tab--active) {
  background: #fff;
  border-bottom-color: #fff;
}
</style>
