<!--
 * @Author: Do not edit
 * @Date: 2025-11-23 13:30:46
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-23 13:30:50
 * @Description: 
-->
<template>
  <div class="dictionary-example">
    <h2>字典缓存使用示例</h2>
    
    <div class="controls">
      <n-button @click="loadSingleDictionary">加载单个字典</n-button>
      <n-button @click="loadMultipleDictionaries">批量加载字典</n-button>
      <n-button @click="clearCache">清除缓存</n-button>
    </div>
    
    <div class="dictionary-list">
      <div v-for="(items, code) in cachedDictionaries" :key="code" class="dictionary-item">
        <h3>字典编码: {{ code }}</h3>
        <ul>
          <li v-for="item in items" :key="item.f_ItemValue">
            {{ item.f_ItemValue }} - {{ item.f_ItemName }}
          </li>
        </ul>
      </div>
    </div>
    
    <div class="loading" v-if="loading">
      加载中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { NButton } from 'naive-ui'

// 使用字典store
const dictionaryStore = useDictionaryStore()

// 状态
const cachedDictionaries = ref<Record<string, any[]>>({})
const loading = ref(false)

// 加载单个字典
const loadSingleDictionary = async () => {
  loading.value = true
  try {
    // 获取供水水质字典
    const items = await dictionaryStore.getDictionary('gs_szjcsb')
    cachedDictionaries.value['gs_szjcsb'] = items
  } catch (error) {
    console.error('加载字典失败:', error)
  } finally {
    loading.value = false
  }
}

// 批量加载字典
const loadMultipleDictionaries = async () => {
  loading.value = true
  try {
    // 批量获取多个字典
    const codes = ['gs_szjcsb', 'other_code1', 'other_code2']
    const result = await dictionaryStore.getDictionaries(codes)
    cachedDictionaries.value = result
  } catch (error) {
    console.error('批量加载字典失败:', error)
  } finally {
    loading.value = false
  }
}

// 清除缓存
const clearCache = () => {
  dictionaryStore.clearAllDictionaries()
  cachedDictionaries.value = {}
}

// 组件挂载时可以预加载常用字典
onMounted(async () => {
  // 预加载常用字典
  // await dictionaryStore.getDictionary('gs_szjcsb')
})
</script>

<style scoped>
.dictionary-example {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

.controls button {
  margin-right: 10px;
}

.dictionary-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.dictionary-item h3 {
  margin-top: 0;
}

.loading {
  text-align: center;
  padding: 20px;
}
</style>