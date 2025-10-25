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
  
  overviewData = {
    /**
     * @description 1.市州编码 黄石市 420200 区划编码 阳新县 420222 2.专项 专项名称	专项编号 燃气	csaqzx_rq 桥梁	csaqzx_ql 供水	csaqzx_gs 排水	csaqzx_ps 燃气终端用户	csaqzx_rqzdyh 瓶装液化气	csaqzx_pzyhq 第三方施工	csaqzx_sfsg 3.基础设施底数统计类型 代码	专项	名称	单位 jcssdstj0101	燃气	天然气管网	公里 jcssdstj0102	天然气场站	个 jcssdstj0103	天然气运营企业	个 jcssdstj0201	燃气终端用户	燃气居民用户	户 jcssdstj0202	燃气工商业用户	户 jcssdstj0301	瓶装液化气	液化气瓶	个 jcssdstj0302	液化气运营企业	个 jcssdstj0303	供应站	个 jcssdstj0304	灌装站	个 jcssdstj0305	灌装秤	个 jcssdstj0306	运输车	辆 jcssdstj0401	排水	排水管网	公里 jcssdstj0402	雨水管网	公里 jcssdstj0403	污水管网	公里 jcssdstj0404	雨污合流管网	公里 jcssdstj0405	污水厂	个 jcssdstj0406	排水泵站	个 jcssdstj0407	易积水点	个 jcssdstj0408	河道	条 jcssdstj0409	河道测站	个 jcssdstj0410	雨量站	个 jcssdstj0501	供水	供水管网	公里 jcssdstj0502	市政消火栓	个 jcssdstj0503	水源地	个 jcssdstj0504	水厂	个 jcssdstj0505	供水泵站	个 jcssdstj0506	供水大用户	户 jcssdstj0601	桥梁	桥梁	座 jcssdstj0602	大桥及特大桥	座 jcssdstj0603	立交桥	座 jcssdstj0604	涵洞	个 4.返回字段说明 字段注释	字段名	字段类型	长度	约束	说明 流水号	lsh	字符型	256	M	市州编码+公司代码+原始库主键 市州编码	dsbm	字符型	6	M	见附录市州编码字典 区划编码	qhbm	字符型	6	C	根据2022年中华人民共和国县以上行政区划代码上传 所属专项	sszx	字符型	16	M	见附录专项类别表字典 基础设施类型	jcsslx	字符型	16	M	见附录基础设施底数统计字典 基础设施统计数量	jcsstjsl	浮点型	16	M 已监测基础设施统计数量	yjcjcsstjsl	浮点型	16	M 监测覆盖率	jcfgl	浮点型	16	M	100以内 统计时间	tjsj	日期型		M	格式：2022-01-01 00:00:00 原始库主键标志	yskzjbz	字符型	128	M 数据同步状态	sjtbzt	字符型	1	M	见附录数据状态字典 同步时间	tbsj	日期型		M	格式：2022-01-01 00:00:00 数据来源	sjly	字符型	8	M	公司代码 数据版本	sjbb	整数型	2	M	如1、2
     *
     * @name ListList
     * @summary 002-001 基础设施总览统计
     * @request GET:/gspspDtransPubbasicfacilitiesinfo/list
     */
    List: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /** 基础设施类型 */
        Jcsslx?: string;
        /** 数据来源 */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          code: number;
          info: string;
          data: {
            lsh: string;
            dsbm: string;
            qhbm: string;
            sszx: string;
            jcsslx: string;
            jcsstjsl: number;
            yjcjcsstjsl: number;
            jcfgl: number;
            tjsj: string;
            yskzjbz: string;
            sjtbzt: string;
            tbsj: string;
            sjly: string;
            sjbb: number;
          }[];
        },
        any
      >({
        path: `/gspspDtransPubbasicfacilitiesinfo/list`,
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
     * @name RateListList
     * @summary  获取设备运行状态比例数据
     * @request GET:/gspspDtransPubmnteqpinfo/rateList
     */
    rateListList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_rq"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubmnteqpinfo/rateList`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DeviceTypeStatusCountList
     * @summary 获取设备类型状态统计数据
     * @request GET:/gspspDtransPubmnteqpinfo/deviceTypeStatusCount
     */
    deviceTypeStatusCountList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_rq"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubmnteqpinfo/deviceTypeStatusCount`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name LatestWaterQualityDataList
     * @summary 获取最新水质监测数据
     * @request GET:/gspspDtransPubmnteqpinfo/latestWaterQualityData
     */
    latestWaterQualityDataList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubmnteqpinfo/latestWaterQualityData`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  gspspDtransPubrisks = {
    /**
     * No description
     *
     * @name RiskTypeCountList
     * @summary 按隐患类型统计隐患数量
     * @request GET:/gspspDtransPubrisks/riskTypeCount
     */
    riskTypeCountList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubrisks/riskTypeCount`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RiskStatusCountList
     * @summary 按整改状态统计隐患数量
     * @request GET:/gspspDtransPubrisks/riskStatusCount
     */
    riskStatusCountList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubrisks/riskStatusCount`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name InventoryRiskStatusCountList
     * @summary 按风险等级统计风险数量
     * @request GET:/gspspDtransPubrisks/inventory/riskStatusCount
     */
    inventoryRiskStatusCountList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubrisks/inventory/riskStatusCount`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name WaterSupplyRiskCountList
     * @summary 统计供水管网隐患数量，按照隐患细类聚合
     * @request GET:/gspspDtransPubrisks/waterSupplyRiskCount
     */
    waterSupplyRiskCountList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubrisks/waterSupplyRiskCount`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DrainageRiskCountList
     * @summary 统计排水管网隐患数量，按照隐患细类聚合
     * @request GET:/gspspDtransPubrisks/drainageRiskCount
     */
    drainageRiskCountList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubrisks/drainageRiskCount`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  gspspDtransPubmnteawarn = {
    /**
     * No description
     *
     * @name WarnStatisticsList
     * @summary 获取预警统计信息
     * @request GET:/gspspDtransPubmnteawarn/warnStatistics
     */
    warnStatisticsList: (
      query?: {
        /**
         * 年份
         * @example ""
         */
        Year?: string;
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubmnteawarn/warnStatistics`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name MonthlyWarnStatisticsList
     * @summary 获取月度预警统计信息
     * @request GET:/gspspDtransPubmnteawarn/monthlyWarnStatistics
     */
    monthlyWarnStatisticsList: (
      query?: {
        /**
         * 年份
         * @example ""
         */
        Year?: string;
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubmnteawarn/monthlyWarnStatistics`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CheckResultStatisticsList
     * @summary 获取排查结果统计信息
     * @request GET:/gspspDtransPubmnteawarn/checkResultStatistics
     */
    checkResultStatisticsList: (
      query?: {
        /**
         * 年份
         * @example ""
         */
        Year?: string;
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
        /**
         * 数据来源
         * @example ""
         */
        Sjly?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubmnteawarn/checkResultStatistics`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  gspspDtransPubunderpipeline = {
    /**
     * No description
     *
     * @name WaterSupplyMaterialRatioList
     * @summary 统计供水管线材质占比
     * @request GET:/gspspDtransPubunderpipeline/waterSupplyMaterialRatio
     */
    waterSupplyMaterialRatioList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubunderpipeline/waterSupplyMaterialRatio`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name DrainageMaterialRatioList
     * @summary 统计排水管线材质占比
     * @request GET:/gspspDtransPubunderpipeline/drainageMaterialRatio
     */
    drainageMaterialRatioList: (
      query?: {
        /**
         * 市州编码
         * @example "420200"
         */
        Dsbm?: string;
        /**
         * 区划编码
         * @example "420222"
         */
        Qhbm?: string;
        /**
         * 所属专项
         * @example "csaqzx_gs"
         */
        Sszx?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, any>({
        path: `/gspspDtransPubunderpipeline/drainageMaterialRatio`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
