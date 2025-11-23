/*
 * @Author: Do not edit
 * @Date: 2025-11-23 13:30:35
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-23 13:30:39
 * @Description: 
 */
import { useDictionaryStore } from '@/stores/dictionaryStore'

/**
 * 获取字典数据（带缓存）
 * @param code 字典编码
 * @returns 字典数据数组
 */
export async function getCachedDictionary(code: string) {
  const dictionaryStore = useDictionaryStore()
  return await dictionaryStore.getDictionary(code)
}

/**
 * 批量获取字典数据（带缓存）
 * @param codes 字典编码数组
 * @returns 字典数据对象
 */
export async function getCachedDictionaries(codes: string[]) {
  const dictionaryStore = useDictionaryStore()
  return await dictionaryStore.getDictionaries(codes)
}

/**
 * 清除指定字典缓存
 * @param code 字典编码
 */
export function clearDictionaryCache(code: string) {
  const dictionaryStore = useDictionaryStore()
  dictionaryStore.clearDictionary(code)
}

/**
 * 清除所有字典缓存
 */
export function clearAllDictionaryCache() {
  const dictionaryStore = useDictionaryStore()
  dictionaryStore.clearAllDictionaries()
}