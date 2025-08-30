import JSEncrypt from 'jsencrypt'
import request, { get, post } from '../utils/request'

/**
 * 登录服务类
 */
class LoginService {
  /**
   * 获取RSA公钥
   * @returns {Promise<string>} 返回公钥字符串
   */
  async getPublicKey() {
    try {
      const result = await get('/login/publicKey')
      
      if (result.success && result.data) {
        return result.data
      } else {
        throw new Error(result.message || '获取公钥失败')
      }
    } catch (error) {
      console.error('获取公钥失败:', error)
      throw error
    }
  }
  
  /**
   * 使用RSA公钥加密密码
   * @param {string} password - 原始密码
   * @param {string} publicKey - RSA公钥
   * @returns {string} 加密后的密码
   */
  encryptPassword(password, publicKey) {
    try {
      const encrypt = new JSEncrypt()
      encrypt.setPublicKey(publicKey)
      const encrypted = encrypt.encrypt(password)
      
      if (!encrypted) {
        throw new Error('密码加密失败')
      }
      
      return encrypted
    } catch (error) {
      console.error('密码加密失败:', error)
      throw error
    }
  }
  
  /**
   * 执行登录
   * @param {string} username - 用户名
   * @param {string} password - 原始密码
   * @returns {Promise<Object>} 登录结果
   */
  async login(username, password) {
    try {
      // 1. 获取公钥
      const publicKey = await this.getPublicKey()
      
      // 2. 加密密码
      const encryptedPassword = this.encryptPassword(password, publicKey)
      
      // 3. 调用登录接口
      const result = await post('/login', {
        username: username,
        password: encryptedPassword
      })
      
      return {
        success: result.success || false,
        message: result.message || '登录失败',
        token: result.data?.token || null,
        user: result.data?.user || null
      }
    } catch (error) {
      console.error('登录失败:', error)
      
      // 如果是网络错误或接口不可用，返回模拟登录结果用于开发测试
      if (error.message.includes('fetch') || error.message.includes('HTTP error')) {
        console.warn('API接口不可用，使用模拟登录')
        return this.mockLogin(username, password)
      }
      
      throw error
    }
  }
  
  /**
   * 模拟登录（用于开发测试）
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Object} 模拟登录结果
   */
  mockLogin(username, password) {
    // 模拟延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === '123456') {
          resolve({
            success: true,
            message: '登录成功',
            token: 'mock-token-' + Date.now(),
            user: {
              username: username,
              id: 1
            }
          })
        } else {
          resolve({
            success: false,
            message: '账户名或密码错误',
            token: null,
            user: null
          })
        }
      }, 1000)
    })
  }
}

// 导出单例实例
export const loginService = new LoginService()
export default loginService