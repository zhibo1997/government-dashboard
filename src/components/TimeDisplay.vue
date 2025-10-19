<!--
 * @Author: Do not edit
 * @Date: 2025-09-01 20:25:59
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-19 18:30:10
 * @Description: 
-->
<template>
  <div class="time-display">
    <div class="time-content">
      <div class="date-line">{{ currentDate }}</div>
      <div class="time-line">{{ currentTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentDate = ref('')
const currentTime = ref('')
let timer = null

function updateTime() {
  const now = new Date()

  // 格式化日期
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[now.getDay()]

  currentDate.value = `${year}.${month}.${day}`

  // 格式化时间
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  currentTime.value = `${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.time-content {
  font-family: YouSheBiaoTiHei;
  font-size: 40px;
  color: #FFFFFF;
  text-align: left;
  font-style: normal;
  display: flex;
  flex-direction: row;
  margin-left: 60px;
  margin-top: 10px;
}
.date-line{
  margin-right: 20px;
}
</style>