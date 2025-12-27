/*
 * @Author: Do not edit
 * @Date: 2025-11-23 13:29:59
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-23 13:30:02
 * @Description: 
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDataItemDetailsByCodes } from '@/services/commonService'
import type { LearunIapplicationDataItemDetailEntity } from '@/api/common'

// 字典项类型定义
export interface DictionaryItem {
  f_ItemValue: string
  f_ItemName: string
  f_SimpleSpelling?: string
  f_Description?: string
  [key: string]: any
}

// 字典数据类型定义
export interface DictionaryData {
  [code: string]: DictionaryItem[]
}

export const useDictionaryStore = defineStore('dictionary', () => {
  // 字典数据缓存
  const dictionaries = ref<DictionaryData>({})

  // 正在加载的字典code集合（防止重复请求）
  const loadingCodes = ref<Set<string>>(new Set())

  /**
   * 获取单个字典数据
   * @param code 字典编码
   * @returns 字典数据数组
   */
  async function getDictionary(code: string): Promise<DictionaryItem[]> {
    // 如果缓存中已有数据，直接返回
    if (dictionaries.value[code]) {
      return dictionaries.value[code]
    }

    // 如果正在加载中，等待加载完成
    if (loadingCodes.value.has(code)) {
      // 等待数据加载完成，最多等待5秒
      return new Promise((resolve) => {
        let attempts = 0
        const check = () => {
          attempts++
          if (dictionaries.value[code] || attempts > 50) {
            resolve(dictionaries.value[code] || [])
          } else {
            setTimeout(check, 100)
          }
        }
        check()
      })
    }

    // 标记为正在加载
    loadingCodes.value.add(code)

    try {
      const result = await getDataItemDetailsByCodes(code)
      
      // 处理返回的数据格式
      if (Array.isArray(result) && result.length > 0) {
        const dict = result[0]
        
        if (dict.itemCode && Array.isArray(dict.itemDetailEntityList)) {
          // 提取有用的数据字段
          const items: DictionaryItem[] = dict.itemDetailEntityList.map((item: any) => ({
            f_ItemValue: item.f_ItemValue,
            f_ItemName: item.f_ItemName,
            f_SimpleSpelling: item.f_SimpleSpelling,
            f_Description: item.f_Description   
          }))
          
          // 缓存数据
          dictionaries.value[dict.itemCode] = items
          return items
        }
      }
      
      // 如果没有获取到数据，返回空数组
      dictionaries.value[code] = []
      return []
    } catch (error) {
      console.error(`获取字典数据失败 (${code}):`, error)
      dictionaries.value[code] = []
      return []
    } finally {
      // 移除加载标记
      loadingCodes.value.delete(code)
    }
  }

  /**
   * 批量获取字典数据
   * @param codes 字典编码数组
   * @returns 字典数据对象
   */
  async function getDictionaries(codes: string[]): Promise<DictionaryData> {
    // 分离已缓存和未缓存的codes
    const cachedCodes: string[] = []
    const uncachedCodes: string[] = []
    
    codes.forEach(code => {
      if (dictionaries.value[code]) {
        cachedCodes.push(code)
      } else {
        uncachedCodes.push(code)
      }
    })
    
    // 构建结果对象，包含已缓存的数据
    const result: DictionaryData = {}
    cachedCodes.forEach(code => {
      result[code] = dictionaries.value[code]
    })
    
    // 如果没有未缓存的codes，直接返回结果
    if (uncachedCodes.length === 0) {
      return result
    }
    
    // 过滤掉正在加载的codes
    const requestingCodes = uncachedCodes.filter(code => loadingCodes.value.has(code))
    const needRequestCodes = uncachedCodes.filter(code => !loadingCodes.value.has(code))
    
    // 等待正在请求的codes完成
    if (requestingCodes.length > 0) {
      await Promise.all(requestingCodes.map(code => 
        new Promise((resolve) => {
          let attempts = 0
          const check = () => {
            attempts++
            if (dictionaries.value[code] || attempts > 50) {
              resolve(dictionaries.value[code] || [])
            } else {
              setTimeout(check, 100)
            }
          }
          check()
        })
      ))
      
      // 将已完成的数据加入结果
      requestingCodes.forEach(code => {
        result[code] = dictionaries.value[code] || []
      })
    }
    
    // 请求未缓存且未请求的codes
    if (needRequestCodes.length > 0) {
      // 标记为正在加载
      needRequestCodes.forEach(code => loadingCodes.value.add(code))
      
      try {
        const codesParam = needRequestCodes.join(',')
        const response = await getDataItemDetailsByCodes(codesParam)
        
        // 处理返回的数据
        if (Array.isArray(response)) {
          response.forEach(dict => {
            if (dict.itemCode && Array.isArray(dict.itemDetailEntityList)) {
              // 提取有用的数据字段
              const items: DictionaryItem[] = dict.itemDetailEntityList.map((item: any) => ({
                f_ItemValue: item.f_ItemValue,
                f_ItemName: item.f_ItemName,
                f_SimpleSpelling: item.f_SimpleSpelling,
                f_Description: item.f_Description
              }))
              
              // 缓存数据
              dictionaries.value[dict.itemCode] = items
              result[dict.itemCode] = items
            }
          })
        }
      } catch (error) {
        console.error(`批量获取字典数据失败 (${codesParam}):`, error)
        // 出错时为每个code设置空数组
        needRequestCodes.forEach(code => {
          dictionaries.value[code] = []
          result[code] = []
        })
      } finally {
        // 移除加载标记
        needRequestCodes.forEach(code => loadingCodes.value.delete(code))
      }
    }
    
    return result
  }

  /**
   * 清除指定字典的缓存
   * @param code 字典编码
   */
  function clearDictionary(code: string) {
    delete dictionaries.value[code]
  }

  /**
   * 清除所有字典缓存
   */
  function clearAllDictionaries() {
    dictionaries.value = {}
  }

  return {
    // State
    dictionaries,
    loadingCodes,
    
    // Actions
    getDictionary,
    getDictionaries,
    clearDictionary,
    clearAllDictionaries
  }
})