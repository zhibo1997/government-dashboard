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
  gspspDtransPubunderpipeline = {
    /**
     * No description
     *
     * @name GasCdRatioList
     * @summary 统计燃气管网按长度占比
     * @request GET:/gspspDtransPubunderpipeline/gasCdRatio
     */
    gasCdRatioList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransPubunderpipeline/gasCdRatio`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GasMaterialRatioList
     * @summary 统计燃气管网按材质占比
     * @request GET:/gspspDtransPubunderpipeline/gasMaterialRatio
     */
    gasMaterialRatioList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransPubunderpipeline/gasMaterialRatio`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GasPubunderpointRatioList
     * @summary 燃气管网统计管点数量占比
     * @request GET:/gspspDtransPubunderpipeline/gasPubunderpointRatio
     */
    gasPubunderpointRatioList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransPubunderpipeline/gasPubunderpointRatio`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  yjnl = {
    /**
     * No description
     *
     * @name ListList
     * @summary 获取应急能力数量统计
     * @request GET:/yjnl/list
     */
    listList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/yjnl/list`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  jcss = {
    /**
     * No description
     *
     * @name TrqCountListList
     * @summary 基础设施-天然气-数量统计
     * @request GET:/jcss/trq/count/list
     */
    trqCountListList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/jcss/trq/count/list`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name YhqCountListList
     * @summary 基础设施-液化气-数量统计
     * @request GET:/jcss/yhq/count/list
     */
    yhqCountListList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/jcss/yhq/count/list`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  gspspDtransGas = {
    /**
     * No description
     *
     * @name PageList
     * @summary 获取燃气企业视图分页列表
     * @request GET:/gspspDtransGas/page
     */
    pageList: (
      query?: {
        /**
         * 页码
         * @example "1"
         */
        page?: string;
        /**
         * 页大小
         * @example "10"
         */
        rows?: string;
        /** 燃气类型 */
        rqlx?: string;
        /** 企业名称 */
        qymc?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransGas/page`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GasenterpriseledgerDetail
     * @summary 获取燃气企业台账详情信息
     * @request GET:/gspspDtransGas/gasenterpriseledger/{lsh}
     */
    gasenterpriseledgerDetail: (lsh: string, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransGas/gasenterpriseledger/${lsh}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name BottlegasenterpriseledgerDetail
     * @summary 获取瓶装气企业台账详情信息
     * @request GET:/gspspDtransGas/bottlegasenterpriseledger/{lsh}
     */
    bottlegasenterpriseledgerDetail: (lsh: string, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransGas/bottlegasenterpriseledger/${lsh}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GasfldstationPageList
     * @summary 获取燃气场站分页列表
     * @request GET:/gspspDtransGas/gasfldstation/page
     */
    gasfldstationPageList: (
      query?: {
        /**
         * 页码
         * @example "1"
         */
        page?: string;
        /**
         * 页大小
         * @example "10"
         */
        rows?: string;
        /** 所属企业 */
        ssqy?: string;
        /** 场站名称 */
        czmc?: string;
        /** 场站类型 */
        Czlx?: string;
        /** 运营状态 */
        Yysfzc?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransGas/gasfldstation/page`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name BottlegasuserPageList
     * @summary 获取用气用户分页列表
     * @request GET:/gspspDtransGas/bottlegasuser/page
     */
    bottlegasuserPageList: (
      query?: {
        /**
         * 页码
         * @example "1"
         */
        page?: string;
        /**
         * 页大小
         * @example "10"
         */
        rows?: string;
        /** 售气企业编码 */
        sqqybm?: string;
        /** 用户名称 */
        Yhmc?: string;
        /** 用户类型 */
        Yhlx?: string;
        /** 运营状态 */
        Yysfzc?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransGas/bottlegasuser/page`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name BottlegasenterpriseledgerListList
     * @summary 获取瓶装气企业台账列表
     * @request GET:/gspspDtransGas/bottlegasenterpriseledger/list
     */
    bottlegasenterpriseledgerListList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransGas/bottlegasenterpriseledger/list`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GasenterpriseledgerListList
     * @summary 获取燃气企业台账列表
     * @request GET:/gspspDtransGas/gasenterpriseledger/list
     */
    gasenterpriseledgerListList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransGas/gasenterpriseledger/list`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name JcsbYxztSjtjListList
     * @summary 获取监测设备运行状态统计列表
     * @request GET:/gspspDtransGas/jcsbYxztSjtj/list
     */
    jcsbYxztSjtjListList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransGas/jcsbYxztSjtj/list`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GasYjListListList
     * @summary 获取燃气预警类型统计列表
     * @request GET:/gspspDtransGas/gasYjList/list
     */
    gasYjListListList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransGas/gasYjList/list`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  gspspDtrans = {
    /**
     * No description
     *
     * @name GlmbbhEqpPageList
     * @summary 某目标编码下的监测设备列表
     * @request GET:/gspspDtrans/glmbbh/eqp/page
     */
    glmbbhEqpPageList: (
      query?: {
        /**
         * 页码
         * @example "1"
         */
        page?: string;
        /**
         * 页大小
         * @example "10"
         */
        rows?: string;
        /**
         * 关联目标编码
         * @example "91420222682667688H"
         */
        glmbbh?: string;
        sbmc?: string;
        sszx?: string;
        gdfs?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtrans/glmbbh/eqp/page`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name EqpPageList
     * @summary 获取监测设备列表分页
     * @request GET:/gspspDtrans/eqp/page
     */
    eqpPageList: (
      query?: {
        /**
         * 页码
         * @example "1"
         */
        page?: string;
        /**
         * 页大小
         * @example "10"
         */
        rows?: string;
        /** @example "csaqzx_rq,csaqzx_rqzdyh,csaqzx_pzyhq" */
        sszx?: string;
        /** @example "" */
        sbmc?: string;
        sblx?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtrans/eqp/page`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  gspspDtransPubmnteqpinfo = {
    /**
     * No description
     *
     * @name GasRateListList
     * @summary 燃气专项-监测设备在线数量
     * @request GET:/gspspDtransPubmnteqpinfo/gas/rateList
     */
    gasRateListList: (params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/gspspDtransPubmnteqpinfo/gas/rateList`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
