# API 迁移指南

本文档指导如何将现有代码从旧的 API 使用方式迁移到新的 API 工厂模式。

## 📋 迁移前后对比

### 旧方式 (openApi.ts)

```typescript
// ❌ 问题：硬编码参数，所有模块共享同一个配置
import api from '@/api/openApi'

// 所有请求都使用相同的 sszx: 'csaqzx_gs'
const waterData = await api.overviewData.List()
const gasData = await api.overviewData.List() // ⚠️ 错误！还是供水的数据
```

### 新方式 (apiFactory.ts)

```typescript
// ✅ 优势：按模块创建实例，参数灵活可配置
import { createWaterSupplyApi, createGasApi } from '@/api/apiFactory'

const waterApi = createWaterSupplyApi()
const gasApi = createGasApi()

const waterData = await waterApi.overviewData.List() // ✓ 供水数据
const gasData = await gasApi.overviewData.List()     // ✓ 燃气数据
```

## 🔄 实际迁移步骤

### 步骤 1: 更新导入语句

**修改前：**
```typescript
import api from '@/api/openApi'
```

**修改后：**
```typescript
import { createWaterSupplyApi } from '@/api/apiFactory'
// 或者使用统一入口
import { createWaterSupplyApi } from '@/api'
```

### 步骤 2: 创建 API 实例

**在 setup 函数顶部添加：**
```typescript
const api = createWaterSupplyApi()
```

**或者在组件外部创建（推荐用于单例）：**
```typescript
// 组件外部
const waterApi = createWaterSupplyApi()

// 组件内部
export default {
  setup() {
    // 直接使用 waterApi
  }
}
```

### 步骤 3: 保持其余代码不变

API 调用方式完全相同，无需修改：
```typescript
// ✓ 代码无需改动
const res = await api.overviewData.List()
const deviceStatus = await api.gspspDtransPubmnteqpinfo.rateListList()
```

## 📝 完整迁移示例

### 示例 1: OverviewModule.vue

**修改前：**
```vue
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/openApi' // ❌ 旧方式

const initOverviewData = async () => {
  const res = await api.overviewData.List()
  // ...
}
</script>
```

**修改后：**
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { createWaterSupplyApi } from '@/api/apiFactory' // ✅ 新方式

const api = createWaterSupplyApi() // ✅ 创建实例

const initOverviewData = async () => {
  const res = await api.overviewData.List() // ✓ 调用方式不变
  // ...
}
</script>
```

### 示例 2: 多模块页面

**场景：** 一个页面需要同时请求供水和排水数据

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { createWaterSupplyApi, createDrainageApi } from '@/api/apiFactory'

// ✅ 创建不同模块的 API 实例
const waterApi = createWaterSupplyApi()
const drainageApi = createDrainageApi()

const waterData = ref([])
const drainageData = ref([])

const fetchData = async () => {
  try {
    // ✅ 并行请求不同模块的数据
    const [water, drainage] = await Promise.all([
      waterApi.overviewData.List(),
      drainageApi.gspspDtransPubrisks.drainageRiskCountList()
    ])
    
    waterData.value = water.data
    drainageData.value = drainage.data
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

### 示例 3: 使用 Composable 封装（推荐）

**创建 `src/composables/useWaterSupplyData.ts`：**
```typescript
import { ref } from 'vue'
import { createWaterSupplyApi } from '@/api/apiFactory'

export function useWaterSupplyData() {
  const api = createWaterSupplyApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 获取总览数据
  const getOverviewData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const res = await api.overviewData.List()
      return res.data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 获取设备状态
  const getDeviceStatus = async () => {
    loading.value = true
    try {
      const res = await api.gspspDtransPubmnteqpinfo.rateListList()
      return res
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getOverviewData,
    getDeviceStatus,
  }
}
```

**在组件中使用：**
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useWaterSupplyData } from '@/composables/useWaterSupplyData'

const { loading, error, getOverviewData } = useWaterSupplyData()
const overviewData = ref([])

onMounted(async () => {
  try {
    overviewData.value = await getOverviewData()
  } catch (e) {
    console.error('加载失败:', e)
  }
})
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else>
    <!-- 数据展示 -->
  </div>
</template>
```

## 🎯 不同场景的迁移策略

### 场景 1: 单一模块组件

**策略：** 直接替换导入，创建对应模块的 API 实例

```diff
- import api from '@/api/openApi'
+ import { createWaterSupplyApi } from '@/api/apiFactory'
+ const api = createWaterSupplyApi()
```

### 场景 2: 需要动态切换模块

**策略：** 使用 `createApiInstance` + 动态参数

```typescript
import { createApiInstance } from '@/api/apiFactory'
import { ref, computed } from 'vue'

const currentModule = ref('csaqzx_gs') // 当前模块

const api = computed(() => 
  createApiInstance({
    defaultParams: {
      Dsbm: '420200',
      Qhbm: '420222',
      Sszx: currentModule.value
    }
  })
)

// 切换模块
const switchModule = (module: string) => {
  currentModule.value = module
}
```

### 场景 3: 需要覆盖个别请求的参数

**策略：** 在请求时传入参数覆盖

```typescript
const api = createWaterSupplyApi()

// 大部分请求使用默认参数
const normalData = await api.overviewData.List()

// 特殊请求覆盖参数
const specialData = await api.overviewData.List({
  Sszx: 'csaqzx_rq', // 临时查询燃气数据
  Qhbm: '420281'     // 覆盖区划编码
})
```

## ✅ 迁移检查清单

在完成迁移后，请检查以下项目：

- [ ] 已将 `import api from '@/api/openApi'` 替换为工厂函数导入
- [ ] 已为每个业务模块创建对应的 API 实例
- [ ] 多模块页面已创建多个独立的 API 实例
- [ ] API 调用返回的数据结构正确
- [ ] 错误处理和 loading 状态正常工作
- [ ] TypeScript 类型提示正常
- [ ] 开发环境日志输出正确
- [ ] 认证 Token 正常注入请求头

## 🐛 常见迁移问题

### 问题 1: TypeScript 类型错误

**错误信息：**
```
Cannot find name 'createWaterSupplyApi'
```

**解决方案：**
```typescript
// 确保从正确的路径导入
import { createWaterSupplyApi } from '@/api/apiFactory'
// 或
import { createWaterSupplyApi } from '@/api'
```

### 问题 2: 请求参数未生效

**原因：** 可能使用了 `autoInjectParams: false`

**解决方案：**
```typescript
// 确保启用了自动注入（默认启用）
const api = createApiInstance({
  module: BusinessModule.WATER_SUPPLY,
  autoInjectParams: true // 确保为 true
})
```

### 问题 3: 向后兼容性

**需求：** 旧代码暂时无法迁移

**解决方案：** 新方案已保留 `openApi.ts` 的向后兼容

```typescript
// ✓ 旧代码仍然可以工作（但建议尽快迁移）
import api from '@/api/openApi'
const data = await api.overviewData.List()
```

## 📊 迁移进度跟踪

建议按以下顺序迁移：

1. **第一批**：供水模块相关组件
   - [ ] `OverviewModule.vue`
   - [ ] `PipelineModule.vue`
   - [ ] `WaterQualityModule.vue`
   - [ ] `leftContent.vue`
   - [ ] `rightContent.vue`

2. **第二批**：排水模块相关组件（如有）

3. **第三批**：其他业务模块

4. **最后**：清理 `openApi.ts`（所有组件迁移完成后）

## 🎓 最佳实践建议

1. **优先使用工厂函数**：`createWaterSupplyApi()` 等预设函数
2. **单例模式适用于跨组件共享**：在 `instances.ts` 中导出
3. **Composable 适用于复杂业务逻辑**：封装 API 调用和状态管理
4. **保持参数覆盖的灵活性**：在请求时传入参数
5. **充分利用 TypeScript 类型提示**：提高开发效率

## 📚 相关文档

- [API 使用指南](./README.md)
- [示例代码](./examples.ts)
- [配置说明](./apiConfig.ts)
