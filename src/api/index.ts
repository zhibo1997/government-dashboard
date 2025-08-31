import { get, post } from "@/utils/request";
import type {
  ApiResponse,
  PublicKeyResponse,
  LoginResponse,
  LoginParams,
} from "@/types";

/**
 * 获取公钥
 * @returns Promise<ApiResponse<PublicKeyResponse>> 公钥信息
 */
export function getPublicKey(): Promise<ApiResponse<string>> {
  return get<string>("/login/publickey");
}

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @param code 验证码（可选）
 * @param uuid 唯一标识符（可选）
 * @returns Promise<ApiResponse<LoginResponse>> 登录结果
 */
export function login(
  username: string,
  password: string,
  code?: string,
  uuid?: string
): Promise<ApiResponse<LoginResponse>> {
  const data: LoginParams = {
    account: username,
    password,
    code,
    uuid,
  };

  return post<LoginResponse>("/login", data);
}

/**
 * 用户登录（使用参数对象）
 * @param params 登录参数对象
 * @returns Promise<ApiResponse<LoginResponse>> 登录结果
 */
export function loginWithParams(
  params: LoginParams
): Promise<ApiResponse<LoginResponse>> {
  return post<LoginResponse>("/login", params);
}
