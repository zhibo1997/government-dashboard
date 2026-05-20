<template>
  <div class="weather-component" v-if="weatherData">
    <div class="weather-info" :title="`天气更新时间 ${formatTime(weatherData.last_update)}`">
      <img class="weather-icon" :src="getWeatherImagePath(weatherData.now.code)" alt="" />
      <span class="weather-text">{{ weatherData.now.text }}</span>
      <span class="temperature">{{ weatherData.now.temperature }}°C</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'

const baseUrl = import.meta.env.VITE_BASE_URL

const getWeatherImagePath = (code: string): string => {
  return `${baseUrl}/images/weatherIcons/${code}@2x.png`
}

interface WeatherNow {
  text: string
  code: string
  temperature: string
}

interface WeatherResult {
  location: {
    name: string
  }
  now: WeatherNow
  last_update: string
}

interface WeatherResponse {
  results: WeatherResult[]
}

// 组件状态
const weatherData = ref<WeatherResult | null>(null)

// 天气 API 配置
const WEATHER_API_URL = 'https://api.seniverse.com/v3/weather/now.json'
const WEATHER_API_KEY = 'S7UpaNKFdnOsxV2sE'
const LOCATION = '29.85:115.2'
const LANGUAGE = 'zh-Hans'
const UNIT = 'c'
const UPDATE_INTERVAL = 15 * 60 * 1000 // 15分钟

let weatherTimer: number | null = null

// 获取天气数据
const fetchWeatherData = async (): Promise<void> => {
  try {
    const url = `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&location=${LOCATION}&language=${LANGUAGE}&unit=${UNIT}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.statusText}`)
    }

    const data: WeatherResponse = await response.json()

    if (data.results && data.results.length > 0) {
      weatherData.value = data.results[0]
    }
  } catch (err) {
    console.error('天气数据获取错误:', err)
  }
}

// 格式化时间显示
const formatTime = (dateString: string): string => {
  try {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
  } catch {
    return dateString
  }
}

// 启动定时器
const startWeatherPolling = (): void => {
  // 立即获取一次
  fetchWeatherData()
  
  // 设置15分钟自动更新
  weatherTimer = window.setInterval(() => {
    fetchWeatherData()
  }, UPDATE_INTERVAL)
}

// 清理定时器
const clearWeatherTimer = (): void => {
  if (weatherTimer !== null) {
    window.clearInterval(weatherTimer)
    weatherTimer = null
  }
}

onMounted(() => {
  startWeatherPolling()
})

onUnmounted(() => {
  clearWeatherTimer()
})
</script>

<style scoped lang="scss">
.weather-component {
  margin-top: 16px;

  .weather-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-family: YouSheBiaoTiHei;
    font-size: var(--font-size-subtitle);
    color: #FFFFFF;
    line-height: 42px;
    text-align: left;
    font-style: normal;
    gap: 24px;
    cursor: pointer;
  }

  .weather-icon {
    width: 60px;
  }
}
</style>