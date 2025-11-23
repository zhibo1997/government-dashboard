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
 * 获取多个数据字典明细根据分类编码逗号分隔
 * @param codes 分类编号
 * @returns 数据字典明细数组数组
 */
export async function getDataItemDetailsByCodes(codes: string) {
  const res = await commonApi.data.dataitemDetailsAllDetail(codes);
  return res.data || [];
}

/**
 * 优化的字典数据获取函数，带缓存功能
 * @param code 字典编码
 * @returns 字典数据数组
 */
export async function getDataItems(code: string): Promise<any[]> {
  // 直接调用批量接口获取数据
  const result = await getDataItemDetailsByCodes(code);

  if (Array.isArray(result) && result.length > 0) {
    const dict = result[0];

    if (dict.itemCode && Array.isArray(dict.itemDetailEntityList)) {
      // 提取有用的数据字段
      const items = dict.itemDetailEntityList.map((item: any) => ({
        f_ItemValue: item.f_ItemValue,
        f_ItemName: item.f_ItemName,
        f_SimpleSpelling: item.f_SimpleSpelling
      }));

      return items;
    }
  }

  return [];
}

/**
 * 获取图层树
 */
export async function getLayerTree() {
  const res = await commonApi.layer.treeList();
  return res.data;
}

/**
 * 使用 RSA 公钥加密密码
 * @param password 原始密码
 * @param publicKey RSA 公钥
 * @returns 加密后的密码
 */
export async function encryptPasswordWithPublicKey(
  password: string,
  publicKey: string
): Promise<string> {
  if (!publicKey) {
    console.warn("公钥为空，将使用原始密码");
    return password;
  }

  try {
    // 动态导入 jsencrypt
    let JSEncrypt;
    if (typeof window !== 'undefined' && (window as any).JSEncrypt) {
      JSEncrypt = (window as any).JSEncrypt;
    } else {
      const jsEncryptModule = await import("jsencrypt");
      JSEncrypt = jsEncryptModule.default;
    }
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