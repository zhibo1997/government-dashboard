/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CityfunModuleAuthAdminDomainUserUserEntity {
  /** @format uuid */
  id?: string;
  deleted?: boolean;
  /** @format date-time */
  deletedTime?: string;
  /** @format uuid */
  deletedBy?: string;
  deleter?: string | null;
  /** @format date-time */
  createdTime?: string;
  /** @format uuid */
  createdBy?: string;
  /** @format date-time */
  modifiedTime?: string;
  /** @format uuid */
  modifiedBy?: string;
  creator?: string | null;
  modifier?: string | null;
  account?: string | null;
  password?: string | null;
  secretKey?: string | null;
  name?: string | null;
  nickName?: string | null;
  avatar?: string | null;
  /** @format int32 */
  gender?: number | null;
  status?: object;
  /** @format int32 */
  sort?: number | null;
  remark?: string | null;
  passwordResetRequired?: boolean | null;
  /** @format date-time */
  passwordLastChangedAt?: string | null;
  contact?: object;
  roles?: object[] | null;
  departments?: CityfunModuleAuthAdminDomainOrganizationOrganizationEntity[] | null;
  manageDepartments?: CityfunModuleAuthAdminDomainOrganizationOrganizationEntity[] | null;
}

export interface CityfunModuleAuthAdminDomainOrganizationOrganizationEntity {
  /** @format uuid */
  id?: string;
  deleted?: boolean;
  /** @format date-time */
  deletedTime?: string;
  /** @format uuid */
  deletedBy?: string;
  deleter?: string | null;
  /** @format date-time */
  createdTime?: string;
  /** @format uuid */
  createdBy?: string;
  /** @format date-time */
  modifiedTime?: string;
  /** @format uuid */
  modifiedBy?: string;
  creator?: string | null;
  modifier?: string | null;
  /** @format uuid */
  organizationId?: string;
  /** @format uuid */
  parentId?: string;
  code?: string | null;
  category?: string | null;
  type?: object;
  name?: string | null;
  shortName?: string | null;
  remark?: string | null;
  /** @format int32 */
  sort?: number;
  status?: object;
  departments?: CityfunModuleAuthAdminDomainOrganizationOrganizationEntity[] | null;
  organization?: CityfunModuleAuthAdminDomainOrganizationOrganizationEntity;
  users?: CityfunModuleAuthAdminDomainUserUserEntity[] | null;
}

/** @format int32 */
export enum CityfunModuleAuthAdminDomainEnumsCommonStatusEnum {
  Value0 = 0,
  Value1 = 1,
}

/** @format int32 */
export enum CityfunModuleAuthAdminDomainEnumsOrganizationTypeEnum {
  Value0 = 0,
  Value1 = 1,
}

export interface CityfunModuleAuthAdminDomainRoleRoleEntity {
  /** @format uuid */
  id?: string;
  deleted?: boolean;
  /** @format date-time */
  deletedTime?: string;
  /** @format uuid */
  deletedBy?: string;
  deleter?: string | null;
  /** @format date-time */
  createdTime?: string;
  /** @format uuid */
  createdBy?: string;
  /** @format date-time */
  modifiedTime?: string;
  /** @format uuid */
  modifiedBy?: string;
  creator?: string | null;
  modifier?: string | null;
  name?: string | null;
  category?: string | null;
  status?: object;
  remarks?: string | null;
  /** @format int32 */
  sort?: number;
  menus?: CityfunModuleAuthAdminDomainMenuMenuEntity[] | null;
}

export interface CityfunModuleAuthAdminDomainMenuMenuEntity {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  createdTime?: string;
  /** @format uuid */
  createdBy?: string;
  /** @format date-time */
  modifiedTime?: string;
  /** @format uuid */
  modifiedBy?: string;
  creator?: string | null;
  modifier?: string | null;
  moduleCode?: string | null;
  type?: CityfunModuleAuthAdminDomainEnumsMenuTypeEnum;
  /** @format uuid */
  parentId?: string;
  name?: string | null;
  routeName?: string | null;
  routeParams?: string | null;
  routeQuery?: string | null;
  path?: string | null;
  url?: string | null;
  icon?: string | null;
  iconColor?: string | null;
  /** @format int32 */
  level?: number;
  remarks?: string | null;
  /** @format int32 */
  sort?: number;
  show?: boolean;
  target?: CityfunModuleAuthAdminDomainEnumsMenuTargetEnum;
  dialogWidth?: string | null;
  dialogHeight?: string | null;
  dialogFullscreen?: boolean;
  functionPoints?: CityfunModuleAuthAdminDomainMenuFunctionPointMenuFunctionPointEntity[] | null;
  permissions?: CityfunModuleAuthAdminDomainMenuPermissionMenuPermissionEntity[] | null;
  columns?: CityfunModuleAuthAdminDomainMenuColumnMenuColumnEntity[] | null;
  forms?: CityfunModuleAuthAdminDomainMenuFormItemMenuFormItemEntity[] | null;
}

export interface CityfunModuleAuthAdminDomainMenuFormItemMenuFormItemEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  menuId?: string;
  /** @format uuid */
  parentId?: string;
  type?: string | null;
  value?: string | null;
  name?: string | null;
  description?: string | null;
  fullCode?: string | null;
  /** @format int32 */
  sort?: number | null;
}

export interface CityfunModuleAuthAdminDomainMenuColumnMenuColumnEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  menuId?: string;
  type?: CityfunModuleAuthAdminDomainEnumsMenuColumnTypeEnum;
  code?: string | null;
  label?: string | null;
  description?: string | null;
  /** @format uuid */
  parentId?: string;
  /** @format int32 */
  sort?: number | null;
}

/** @format int32 */
export enum CityfunModuleAuthAdminDomainEnumsMenuColumnTypeEnum {
  Value0 = 0,
  Value1 = 1,
}

export interface CityfunModuleAuthAdminDomainMenuPermissionMenuPermissionEntity {
  /** @format int64 */
  id?: number;
  /** @format int32 */
  type?: number;
  /** @format uuid */
  relationId?: string;
  code?: string | null;
  description?: string | null;
}

export interface CityfunModuleAuthAdminDomainMenuFunctionPointMenuFunctionPointEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  menuId?: string;
  type?: CityfunModuleAuthAdminDomainEnumsFunctionPointsTypeEnum;
  code?: string | null;
  icon?: string | null;
  text?: string | null;
  styleType?: string | null;
  permissions?: CityfunModuleAuthAdminDomainMenuPermissionMenuPermissionEntity[] | null;
}

/** @format int32 */
export enum CityfunModuleAuthAdminDomainEnumsFunctionPointsTypeEnum {
  Value0 = 0,
}

/** @format int32 */
export enum CityfunModuleAuthAdminDomainEnumsMenuTargetEnum {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
}

/** @format int32 */
export enum CityfunModuleAuthAdminDomainEnumsMenuTypeEnum {
  Value0 = 0,
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value5 = 5,
  Value6 = 6,
}

export interface CityfunModuleAuthAdminDomainUserContactUserContactEntity {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  userId?: string;
  phone?: string | null;
  email?: string | null;
  qq?: string | null;
  weChat?: string | null;
  dingTalk?: string | null;
}

/** @format int32 */
export enum CityfunModuleAuthAdminDomainEnumsUserStatusEnum {
  Value0 = 0,
  Value1 = 1,
}

export interface Type {
  code?: LearunUtilResponseCode;
  info?: string | null;
  data?: LearunIapplicationDataItemDetailEntity[] | null;
}

/**
 * 版 本 Learun-Core-VUE 力软开发框架
 * Copyright (c) 2019-present 力软信息技术（苏州）有限公司
 * 创建人：tobin
 * 日 期：2019.09.19
 * 描 述：数据字典明细
 */
export interface LearunIapplicationDataItemDetailEntity {
  /** 明细主键 */
  f_Id?: string | null;
  /** 分类主键 */
  f_ItemId?: string | null;
  /** 父级主键 */
  f_ParentId?: string | null;
  /** 编码 */
  f_ItemCode?: string | null;
  /** 名称 */
  f_ItemName?: string | null;
  /** 值 */
  f_ItemValue?: string | null;
  /** 快速查询 */
  f_QuickQuery?: string | null;
  /** 简拼 */
  f_SimpleSpelling?: string | null;
  /**
   * 是否默认
   * @format int32
   */
  f_IsDefault?: number | null;
  /**
   * 排序码
   * @format int32
   */
  f_SortCode?: number | null;
  /**
   * 删除标记
   * @format int32
   */
  f_DeleteMark?: number | null;
  /**
   * 有效标志
   * @format int32
   */
  f_EnabledMark?: number | null;
  /** 备注 */
  f_Description?: string | null;
  /**
   * 创建日期
   * @format date-time
   */
  f_CreateDate?: string | null;
  /** 创建用户主键 */
  f_CreateUserId?: string | null;
  /** 创建用户 */
  f_CreateUserName?: string | null;
  /**
   * 修改日期
   * @format date-time
   */
  f_ModifyDate?: string | null;
  /** 修改用户主键 */
  f_ModifyUserId?: string | null;
  /** 修改用户 */
  f_ModifyUserName?: string | null;
  /** 租户ID */
  f_TenantId?: string | null;
}

/** @format int32 */
export enum LearunUtilResponseCode {
  Value200 = 200,
  Value400 = 400,
  Value401 = 401,
  Value500 = 500,
}

/**
 * 版 本 Learun-Core-VUE 力软开发框架
 * Copyright (c) 2019-present 力软信息技术（苏州）有限公司
 * 创建人：tobin
 * 日 期：2020.08.25
 * 描 述：登录输入参数
 */
export interface LearunIapplicationLoginInputDto {
  /**
   * 账号
   * @minLength 1
   */
  account: string;
  /**
   * 密码，md5编码
   * @minLength 1
   */
  password: string;
}

export interface LearunUtilResponseDto1LearunIapplicationLoginOutputDtoLearunIapplicationVersion6010CultureNeutralPublicKeyTokenNull {
  code?: LearunUtilResponseCode;
  info?: string | null;
  /**
   * 版 本 Learun-Core-VUE 力软开发框架
   * Copyright (c) 2019-present 力软信息技术（苏州）有限公司
   * 创建人：tobin
   * 日 期：2020.08.25
   * 描 述：登录返回数据
   */
  data?: LearunIapplicationLoginOutputDto;
}

/**
 * 版 本 Learun-Core-VUE 力软开发框架
 * Copyright (c) 2019-present 力软信息技术（苏州）有限公司
 * 创建人：tobin
 * 日 期：2020.08.25
 * 描 述：登录返回数据
 */
export interface LearunIapplicationLoginOutputDto {
  /** idtoken */
  id_token?: string | null;
  /** 登录凭证 */
  token?: string | null;
  /**
   * 版 本 Learun-Core-VUE 力软开发框架
   * Copyright (c) 2019-present 力软信息技术（苏州）有限公司
   * 创建人：tobin
   * 日 期：2019.09.12
   * 描 述：用户实体类
   */
  user?: LearunIapplicationUserEntity;
}

/**
 * 版 本 Learun-Core-VUE 力软开发框架
 * Copyright (c) 2019-present 力软信息技术（苏州）有限公司
 * 创建人：tobin
 * 日 期：2019.09.12
 * 描 述：用户实体类
 */
export interface LearunIapplicationUserEntity {
  /** @format uuid */
  id?: string;
  deleted?: boolean;
  /** @format date-time */
  deletedTime?: string;
  /** @format uuid */
  deletedBy?: string;
  deleter?: string | null;
  /** @format date-time */
  createdTime?: string;
  /** @format uuid */
  createdBy?: string;
  /** @format date-time */
  modifiedTime?: string;
  /** @format uuid */
  modifiedBy?: string;
  creator?: string | null;
  modifier?: string | null;
  account?: string | null;
  password?: string | null;
  secretKey?: string | null;
  name?: string | null;
  nickName?: string | null;
  avatar?: string | null;
  /** @format int32 */
  gender?: number | null;
  status?: object;
  /** @format int32 */
  sort?: number | null;
  remark?: string | null;
  passwordResetRequired?: boolean | null;
  /** @format date-time */
  passwordLastChangedAt?: string | null;
  contact?: object;
  roles?: object[] | null;
  departments?: CityfunModuleAuthAdminDomainOrganizationOrganizationEntity[] | null;
  manageDepartments?: CityfunModuleAuthAdminDomainOrganizationOrganizationEntity[] | null;
  /**
   * 用户主键
   * @deprecated
   */
  f_UserId?: string | null;
  /**
   * 账户
   * @deprecated
   */
  f_Account?: string | null;
  /**
   * 登录密码
   * @deprecated
   */
  f_Password?: string | null;
  /**
   * 密码秘钥
   * @deprecated
   */
  f_Secretkey?: string | null;
  /**
   * 真实姓名
   * @deprecated
   */
  f_RealName?: string | null;
  /**
   * 呢称
   * @deprecated
   */
  f_NickName?: string | null;
  /**
   * 头像
   * @deprecated
   */
  f_HeadIcon?: string | null;
  /**
   * 性别
   * @deprecated
   * @format int32
   */
  f_Gender?: number | null;
  /**
   * 生日
   * @format date-time
   */
  f_Birthday?: string | null;
  /** @deprecated */
  f_CompanyId?: string | null;
  /**
   * 部门主键
   * @deprecated
   */
  f_DepartmentId?: string | null;
  f_Mobile?: string | null;
  f_Telephone?: string | null;
  f_Email?: string | null;
  f_OICQ?: string | null;
  f_WeChat?: string | null;
  f_MSN?: string | null;
  /**
   * 安全级别：1超级用户 2三员-系统管理员、3三员-安全管理员、4三员-审计员
   * @format int32
   */
  f_SecurityLevel?: number | null;
  /** 微信小程序 OpenId */
  f_WxOpenId?: string | null;
  /** 钉钉小程序 OpenId */
  f_DDOpenId?: string | null;
  /** 支付宝小程序 OpenId */
  f_AliOpenId?: string | null;
  /** 同步后的钉钉用户ID----ADD BY SSY 20221017 */
  f_DingUserId?: string | null;
  /** 同步后的企微用户ID----ADD BY SSY 20231108 */
  f_WechatUserId?: string | null;
  /**
   * 基础-是否开启密码验证(0是，1否)--ADD BY SSY 20230323
   * @format int32
   */
  f_IsCheckPassword?: number | null;
  /**
   * 最后一次修改密码的时间--ADD BY SSY 20230323
   * @format date-time
   */
  f_LastChangePDate?: string | null;
  /** 基础-绑定IP--ADD BY SSY 20230315 */
  f_BindIp?: string | null;
  /** 基础-CA登录名--ADD BY SSY 20230315 */
  f_DomainName?: string | null;
  /**
   * 基础-是否只能CA登录(默认是0,不是1)--ADD BY SSY 20230315
   * @format int32
   */
  f_DomainOnly?: number | null;
  /** 身份-身份证号--ADD BY SSY 20230315 */
  f_IdCard?: string | null;
  /** 身份-政治面貌--ADD BY SSY 20230315 */
  f_Party?: string | null;
  /** 身份-行政职务--ADD BY SSY 20230315 */
  f_Job?: string | null;
  /** 身份-行政职级--ADD BY SSY 20230315 */
  f_Level?: string | null;
  /**
   * 身份-用户密级(0公开，1内部，2秘密，3机密，4绝密)--ADD BY SSY 20230315
   * @format int32
   */
  f_SecretLevel?: number | null;
  /** 身份-职称等级--ADD BY SSY 20230315 */
  f_Title?: string | null;
  /** 身份-技术职务--ADD BY SSY 20230315 */
  f_Role?: string | null;
  /** 身份-管理职务--ADD BY SSY 20230315 */
  f_Post?: string | null;
  /** 身份-职业技能--ADD BY SSY 20230315 */
  f_WorkerDegree?: string | null;
  /** 密码的盐 */
  f_PasswdSalt?: string | null;
  /** 全拼--ADD BY SSY 20230414 */
  f_FullSpelling?: string | null;
  /**
   * 是否绑定IP(默认是0,不是1)--ADD BY SSY 20230414
   * @format int32
   */
  f_BindIpOnly?: number | null;
  /** ADD BY SSY 20230414 */
  f_CardInfo?: string | null;
  /**
   * (默认是0,不是1)--ADD BY SSY 20230414
   * @format int32
   */
  f_CardOnly?: number | null;
  /** 科室--ADD BY SSY 20230414 */
  f_Room?: string | null;
  /**
   * 排序码
   * @format int32
   */
  f_SortCode?: number | null;
  /** 简拼 */
  f_SimpleSpelling?: string | null;
  /**
   * 是否是黑名单 0 不是 1 是
   * @format int32
   */
  f_IsBlack?: number | null;
  /**
   * 账号类型 1 正式 2 试用  3 离职
   * @format int32
   */
  f_Type?: number | null;
  /** 人员类别 */
  f_UserType?: string | null;
  /** 待遇级别 */
  f_SalaryLevel?: string | null;
  /** 租户ID */
  f_TenantId?: string | null;
  /**
   * 最后登录时间--ADD BY SSY 20230519
   * @format date-time
   */
  f_LastLoginTime?: string | null;
  /**
   * 锁定计数--ADD BY SSY 20230519
   * @format int32
   */
  f_LockCount?: number | null;
  /**
   * 锁定时间--ADD BY SSY 20230519
   * @format date-time
   */
  f_LockTime?: string | null;
  /** 登录随机代码--ADD BY SSY 20230519 */
  f_LoginRandomCode?: string | null;
  /**
   * 删除标记
   * @deprecated
   * @format int32
   */
  f_DeleteMark?: number | null;
  /**
   * 有效标志 1 有效 0 无效 2 被锁定
   * @deprecated
   * @format int32
   */
  f_EnabledMark?: number | null;
  /** 备注 */
  f_Description?: string | null;
  /**
   * 创建日期
   * @deprecated
   * @format date-time
   */
  f_CreateDate?: string | null;
  /**
   * 创建用户主键
   * @deprecated
   */
  f_CreateUserId?: string | null;
  /** 创建用户 */
  f_CreateUserName?: string | null;
  /**
   * 修改日期
   * @deprecated
   * @format date-time
   */
  f_ModifyDate?: string | null;
  /**
   * 修改用户主键
   * @deprecated
   */
  f_ModifyUserId?: string | null;
  /** 修改用户 */
  f_ModifyUserName?: string | null;
  /**
   * 需要更改密码 1需要，2不需要
   * @format int32
   */
  f_IsNeedChangePwd?: number | null;
  /** 用户角色信息 */
  roleIds?: string | null;
  /** 用户岗位信息 */
  postIds?: string | null;
  /** 功能权限id */
  moduleAuthIds?: string[] | null;
  /** 企业微信同步情况 */
  webchatSyn?: string | null;
  /**
   * 企业微信同步情况[是否同步 1 是 0 不是]
   * @format int32
   */
  isWebchatSyn?: number | null;
  /** 租户编码 */
  tenantNo?: string | null;
  /** 租户名称 */
  tenantName?: string | null;
  /** 租户公司 */
  tenantCompany?: string | null;
}

export interface LearunUtilResponseDto1SystemStringSystemPrivateCoreLibVersion8000CultureNeutralPublicKeyToken7Cec85D7Bea7798E {
  code?: LearunUtilResponseCode;
  info?: string | null;
  data?: string | null;
}

export interface LearunUtilResponseDto {
  code?: LearunUtilResponseCode;
  info?: string | null;
  data?: null;
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title 湖北-城市生命线项目
 * @version 1.0.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  data = {
    /**
     * No description
     *
     * @tags DataItem
     * @name DataitemDetailsDetail
     * @summary 获取数据字典明显根据分类编号
     * @request GET:/data/dataitem/details/{code}
     */
    dataitemDetailsDetail: (code: string, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/data/dataitem/details/${code}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  login = {
    /**
     * No description
     *
     * @tags Login
     * @name LoginCreate
     * @summary 登录接口
     * @request POST:/login
     */
    loginCreate: (data: LearunIapplicationLoginInputDto, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Login
     * @name PublicKeyList
     * @summary 获取Rsa公钥
     * @request GET:/login/publicKey
     */
    publicKeyList: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/login/publicKey`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  system = {
    /**
     * No description
     *
     * @tags Module
     * @name ModuleTreeList
     * @summary 获取菜单树
     * @request GET:/system/module/tree
     */
    moduleTreeList: (params: RequestParams = {}) =>
      this.request<LearunUtilResponseDto, any>({
        path: `/system/module/tree`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
