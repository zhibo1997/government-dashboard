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
export async function getPublicKey(): Promise<string> {
  const res = await commonApi.login.publicKeyList();
  return res.data || "";
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
  return res.data;
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
 * 获取具体数据字典
 * @param code 分类编号
 * @param parentSimpleSpelling 父级简拼
 * @returns 数据字典明细数组
 */
export async function getDataItems(
  code: string,
  parentSimpleSpelling: string
) {
  const res = await commonApi.data.dataitemDetailsDetail(code);
  const parentItem = (res.data || []).find(
    (item) => item.f_SimpleSpelling === parentSimpleSpelling
  );
  return res.data.filter((item) => item.f_ParentId === parentItem.f_Id);
}

/**
 * 获取菜单树
 * @returns 菜单树数据
 */
export async function getModuleTree() {
  const res = await commonApi.system.moduleTreeList();
  return res.data;
}
