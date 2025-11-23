<!--
 * @Author: Do not edit
 * @Date: 2025-11-23 13:31:49
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-23 13:31:55
 * @Description: 
-->
# 字典数据缓存优化说明

## 概述

本优化方案旨在解决项目中字典数据重复请求的问题，通过引入缓存机制来提高性能和减少不必要的网络请求。

## 优化内容

### 1. 新增文件

- `src/stores/dictionaryStore.ts` - 字典数据缓存状态管理
- `src/services/dictionaryService.ts` - 字典数据获取服务封装
- `src/components/DictionaryCacheExample.vue` - 使用示例组件

### 2. 修改文件

- `src/services/commonService.ts` - 添加 `getDataItems` 函数
- `src/views/WaterSupply/components/WaterQualityModule.vue` - 使用优化后的函数

## 核心功能

### 字典Store (dictionaryStore.ts)

提供了以下核心功能：

1. **单个字典获取**: `getDictionary(code)` - 带缓存的单个字典获取
2. **批量字典获取**: `getDictionaries(codes)` - 带缓存的批量字典获取
3. **缓存清除**: `clearDictionary(code)` 和 `clearAllDictionaries()`
4. **防重复请求**: 自动处理并发请求，避免同一字典的重复请求

### 使用方式

#### 在组件中使用

```typescript
import { useDictionaryStore } from '@/stores/dictionaryStore'

export default {
  setup() {
    const dictionaryStore = useDictionaryStore()
    
    // 获取单个字典
    const loadDictionary = async () => {
      const items = await dictionaryStore.getDictionary('gs_szjcsb')
      // 使用字典数据
    }
    
    // 批量获取字典
    const loadDictionaries = async () => {
      const codes = ['code1', 'code2', 'code3']
      const result = await dictionaryStore.getDictionaries(codes)
      // result 是一个对象，key为字典编码，value为字典数据数组
    }
    
    return {
      loadDictionary,
      loadDictionaries
    }
  }
}
```

#### 使用封装的服务函数

```typescript
import { getCachedDictionary, getCachedDictionaries } from '@/services/dictionaryService'

// 获取单个字典
const items = await getCachedDictionary('gs_szjcsb')

// 批量获取字典
const result = await getCachedDictionaries(['code1', 'code2', 'code3'])
```

## 优化效果

1. **减少网络请求**: 相同字典数据只会请求一次
2. **提高响应速度**: 缓存命中时直接返回数据，无需等待网络请求
3. **防止重复请求**: 自动处理并发请求，避免同一时间发起多个相同请求
4. **易于管理**: 提供缓存清除功能，便于开发和调试

## 注意事项

1. 字典数据缓存是基于字典编码的，确保编码的唯一性和准确性
2. 在开发过程中，可以通过清除缓存来获取最新的字典数据
3. 批量获取字典时，会自动分离已缓存和未缓存的数据，只请求未缓存的部分
4. 错误处理已内置，网络请求失败不会影响缓存机制的正常运行

## 扩展建议

1. 可以添加缓存过期时间机制
2. 可以添加LRU缓存淘汰策略
3. 可以添加缓存持久化功能