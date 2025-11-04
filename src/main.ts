/*
 * @Author: Do not edit
 * @Date: 2025-10-30 20:50:05
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-04 22:29:14
 * @Description: 
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import VueCesium from 'vue-cesium'
import "@/assets/font/font.css"
import 'vue-cesium/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(naive)
app.use(VueCesium,{
  cesiumPath: 'https://unpkg.com/cesium@1.104.0/Build/Cesium/Cesium.js'
})

app.mount('#app')