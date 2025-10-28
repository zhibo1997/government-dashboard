/**
 * 通用服务层（登录、数据字典等）
 * 基于 common.ts 生成的 API 客户端，提供函数化调用方式
 */

import { createCommonApi } from "@/api/apiFactory";
import type {
  LearunIapplicationLoginInputDto,
  LearunUtilResponseDto1LearunIapplicationLoginOutputDtoLearunIapplicationVersion6010CultureNeutralPublicKeyTokenNull,
} from "@/api/common";

const commonApi = createCommonApi();

/**
 * 获取 RSA 公钥
 * @returns 公钥字符串
 */
export async function getPublicKey(): Promise<any> {
  const res = await commonApi.login.publicKeyList();
  return res;
}

/**
 * 用户登录
 * @param account 账号
 * @param password 密码（MD5 编码后）
 * @returns 登录结果（包含 token 和用户信息）
 */
export async function login(account: string, password: string) {
  const loginData: LearunIapplicationLoginInputDto = {
    account,
    password,
  };
  const res = await commonApi.login.loginCreate(loginData);
  return res;
}

/**
 * 获取数据字典明细（根据分类编号）
 * @param code 分类编号
 * @returns 数据字典明细数组
 */
export async function getDataItemDetails(code: string) {
  const res = await commonApi.data.dataitemDetailsDetail(code);
  return res.data || [];
}


/**
 * 获取菜单树
 * @returns 菜单树数据
 */
export async function getModuleTree() {
  const res = await commonApi.system.moduleTreeList();
  return res.data;
}

/**
 * 使用 RSA 公钥加密密码
 * @param password 原始密码
 * @param publicKey RSA 公钥
 * @returns 加密后的密码
 */
export function encryptPasswordWithPublicKey(
  password: string,
  publicKey: string
): string {
  if (!publicKey) {
    console.warn("公钥为空，将使用原始密码");
    return password;
  }

  try {
    // 动态导入 jsencrypt
    const JSEncrypt = require("jsencrypt").default;
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encrypted = encrypt.encrypt(password);
    
    if (!encrypted) {
      console.error("密码加密失败");
      return password;
    }
    
    return encrypted;
  } catch (error) {
    console.error("密码加密异常:", error);
    return password;
  }
}
