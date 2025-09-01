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
  
  currentDate.value = `${year}年${month}月${day}日 ${weekday}`
  
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
.time-display {
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  font-family: 'Microsoft YaHei', sans-serif;
}


.time-content {
  display: flex;
  flex-direction: row;
  text-align: center;
  align-items: center;
}

.date-line {
  font-size: 22px;
  color: #fff;
  font-weight: 600;
  margin-right: 16px;
}

.time-line {
  font-size: 24px;
  color: #fff;
  font-weight: 600;
  font-family: 'Consolas', 'Monaco', monospace;
  letter-spacing: 1px;
}

</style>