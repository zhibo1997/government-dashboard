<!--
 * @Description: 首页专项图层开关组件 - 位于左侧内容区底部
 * @Date: 2026-01-09
-->
<template>
  <div class="layer-switch-container">
    <!-- 标题 -->
    <div class="switch-header">
      <span class="switch-icon">⚙️</span>
      <span class="switch-title">快捷控制</span>
    </div>
    
    <!-- 开关列表 -->
    <div class="switch-list">
      <div
        v-for="item in layerOptions"
        :key="item.value"
        class="switch-item"
        :class="{ disabled: loading }"
      >
        <div class="item-info">
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-label">{{ item.label }}</span>
        </div>
        
        <!-- 开关按钮 -->
        <label class="toggle-switch">
          <input
            type="checkbox"
            :checked="item.visible"
            :disabled="loading"
            @change="handleToggle(item.value, $event)"
          />
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 定义专项选项
const layerOptions = reactive([
  { value: 'csaqzx_ql', label: '桥梁监测', icon: '🌉', visible: true },
  { value: 'csaqzx_rq', label: '燃气监测', icon: '🔥', visible: false }
])

// 加载状态
const loading = ref(false)

// 定义事件
const emit = defineEmits<{
  'layer-toggle': [payload: { sszx: string; visible: boolean }]
}>()

// 切换图层显示/隐藏
const handleToggle = async (sszx: string, event: Event) => {
  if (loading.value) return
  
  const target = event.target as HTMLInputElement
  const visible = target.checked
  
  loading.value = true
  
  try {
    // 更新本地状态
    const item = layerOptions.find(opt => opt.value === sszx)
    if (item) {
      item.visible = visible
    }
    
    // 触发事件
    emit('layer-toggle', { sszx, visible })
  } finally {
    // 延迟恢复状态，确保切换完成
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}
</script>

<style lang="scss" scoped>
.layer-switch-container {
  background: linear-gradient(135deg, rgba(16, 24, 48, 0.95) 0%, rgba(32, 48, 96, 0.9) 100%);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(16, 173, 192, 0.3);
  min-width: 200px;
}

.switch-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(16, 173, 192, 0.2);
}

.switch-icon {
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.switch-title {
  font-size: 14px;
  font-weight: 600;
  color: #10adc0;
  letter-spacing: 0.5px;
}

.switch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(16, 173, 192, 0.3);
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.item-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background: linear-gradient(135deg, #10adc0 0%, #0d8b9a 100%);
      box-shadow: 
        0 0 10px rgba(16, 173, 192, 0.5),
        inset 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    &:checked + .slider:before {
      transform: translateX(20px);
      box-shadow: 0 2px 8px rgba(16, 173, 192, 0.5);
    }

    &:disabled + .slider {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:before {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 2px;
      background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
      transition: all 0.3s ease;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
