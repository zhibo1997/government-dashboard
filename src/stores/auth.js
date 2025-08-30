import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const login = (userData) => {
    user.value = userData
    token.value = userData.token
    
    // 保存到本地存储
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化用户信息（从本地存储恢复）
  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  // 检查token是否有效（可扩展为调用后端验证）
  const validateToken = async () => {
    if (!token.value) {
      return false
    }
    
    try {
      // 这里可以调用后端API验证token
      // const response = await api.validateToken(token.value)
      // return response.valid
      
      // 目前使用简单的时间戳验证
      const tokenData = token.value.split('-')
      if (tokenData.length === 3 && tokenData[0] === 'mock' && tokenData[1] === 'token') {
        const timestamp = parseInt(tokenData[2])
        const now = Date.now()
        // token有效期24小时
        return (now - timestamp) < 24 * 60 * 60 * 1000
      }
      
      return false
    } catch (error) {
      console.error('验证token失败:', error)
      return false
    }
  }

  return {
    // 状态
    user,
    token,
    isLoggedIn,
    
    // 方法
    login,
    logout,
    initAuth,
    validateToken
  }
})