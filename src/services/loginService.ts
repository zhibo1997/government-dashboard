import { getPublicKey, login } from '@/api'
import type { LoginRequest, UserInfo, ApiResponse } from '@/types'
import JSEncrypt from 'jsencrypt'

/**
 * 登录服务类
 * 提供用户认证相关的功能
 */
export class LoginService {
  private publicKey: string = ''
  private jsEncrypt: JSEncrypt | null = null

  /**
   * 获取RSA公钥
   * @returns Promise<string> 公钥字符串
   */
  public async getPublicKey(): Promise<string> {
    try {
      const response = await getPublicKey()
      
      if (response.code === 200 && response.data) {
        this.publicKey = response.data;
        this.initJSEncrypt()
        return this.publicKey
      } else {
        throw new Error(response.message || '获取公钥失败')
      }
    } catch (error) {
      console.error('获取公钥失败:', error)
      throw error
    }
  }

  /**
   * 初始化JSEncrypt实例
   * @private
   */
  private initJSEncrypt(): void {
    if (this.publicKey) {
      this.jsEncrypt = new JSEncrypt()
      this.jsEncrypt.setPublicKey(this.publicKey)
    }
  }

  /**
   * 使用RSA公钥加密密码
   * @param password - 明文密码
   * @returns Promise<string> 加密后的密码
   */
  public async encryptPassword(password: string): Promise<string> {
    try {
      // 如果没有公钥，先获取公钥
      if (!this.publicKey) {
        await this.getPublicKey()
      }

      // 如果JSEncrypt实例不存在，初始化它
      if (!this.jsEncrypt) {
        this.initJSEncrypt()
      }

      if (!this.jsEncrypt) {
        throw new Error('RSA加密初始化失败')
      }

      const encryptedPassword = this.jsEncrypt.encrypt(password)
      
      if (!encryptedPassword) {
        throw new Error('密码加密失败')
      }

      return encryptedPassword
    } catch (error) {
      console.error('密码加密失败:', error)
      throw error
    }
  }

  /**
   * 用户登录
   * @param loginData - 登录数据
   * @returns Promise<UserInfo> 用户信息
   */
  public async login(loginData: LoginRequest): Promise<UserInfo> {
    try {
      // 加密密码
      const encryptedPassword = await this.encryptPassword(loginData.password)
      
      const requestData = {
        ...loginData,
        password: encryptedPassword
      }

      const response = await login(requestData.username, requestData.password)
      
      if (response.code === 200 && response.data) {
        // 存储用户信息到localStorage
        this.saveUserInfo(response.data)
        return response.data
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 用户登出
   * @returns Promise<void>
   */
  public async logout(): Promise<void> {
    try {
      // 使用api中的logout接口，如果没有则暂时注释
      // await logout()
    } catch (error) {
      console.error('登出请求失败:', error)
      // 即使请求失败，也要清除本地存储
    } finally {
      this.clearUserInfo()
    }
  }

  /**
   * 获取当前用户信息
   * @returns Promise<UserInfo | null>
   */
  public async getCurrentUser(): Promise<UserInfo | null> {
    try {
      // 使用api中的getCurrentUser接口，如果没有则暂时注释
      // const response = await getCurrentUser()
      // if (response.code === 200 && response.data) {
      //   this.saveUserInfo(response.data)
      //   return response.data
      // } else {
      //   return null
      // }
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 刷新访问令牌
   * @returns Promise<string | null>
   */
  public async refreshToken(): Promise<string | null> {
    try {
      // 使用api中的refreshToken接口，如果没有则暂时注释
      // const response = await refreshToken()
      // if (response.code === 200 && response.data) {
      //   const token = response.data.token
      //   localStorage.setItem('token', token)
      //   return token
      // } else {
      //   throw new Error(response.message || '刷新令牌失败')
      // }
      return null
    } catch (error) {
      console.error('刷新令牌失败:', error)
      this.clearUserInfo()
      return null
    }
  }

  /**
   * 验证密码强度
   * @param password - 密码
   * @returns 密码强度等级 (weak, medium, strong)
   */
  public validatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 6) {
      return 'weak'
    }

    let score = 0
    
    // 长度检查
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    
    // 字符类型检查
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score < 3) return 'weak'
    if (score < 5) return 'medium'
    return 'strong'
  }

  /**
   * 保存用户信息到本地存储
   * @param userInfo - 用户信息
   * @private
   */
  private saveUserInfo(userInfo: UserInfo): void {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      if (userInfo.token) {
        localStorage.setItem('token', userInfo.token)
      }
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  }

  /**
   * 从本地存储获取用户信息
   * @returns UserInfo | null
   */
  public getUserInfoFromStorage(): UserInfo | null {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        return JSON.parse(userInfoStr) as UserInfo
      }
      return null
    } catch (error) {
      console.error('获取本地用户信息失败:', error)
      return null
    }
  }

  /**
   * 获取本地存储的令牌
   * @returns string | null
   */
  public getTokenFromStorage(): string | null {
    return localStorage.getItem('token')
  }

  /**
   * 清除用户信息
   * @private
   */
  private clearUserInfo(): void {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }

  /**
   * 检查用户是否已登录
   * @returns boolean
   */
  public isLoggedIn(): boolean {
    const token = this.getTokenFromStorage()
    const userInfo = this.getUserInfoFromStorage()
    return !!(token && userInfo)
  }

  /**
   * 检查令牌是否过期
   * @returns boolean
   */
  public isTokenExpired(): boolean {
    const userInfo = this.getUserInfoFromStorage()
    if (!userInfo || !userInfo.expiresAt) {
      return true
    }
    
    const expirationTime = new Date(userInfo.expiresAt).getTime()
    const currentTime = Date.now()
    
    return currentTime >= expirationTime
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    this.publicKey = ''
    this.jsEncrypt = null
  }
}

// 导出单例实例
export const loginService = new LoginService()