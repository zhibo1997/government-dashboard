# API集成

<cite>
**本文档引用的文件**
- [apiFactory.ts](file://src/api/apiFactory.ts)
- [apiConfig.ts](file://src/api/apiConfig.ts)
- [gasService.ts](file://src/services/gasService.ts)
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts)
- [commonService.ts](file://src/services/commonService.ts)
- [vite.config.js](file://vite.config.js)
- [waterSupplyAndDrainage.ts](file://src/api/waterSupplyAndDrainage.ts)
- [gas.ts](file://src/api/gas.ts)
- [common.ts](file://src/api/common.ts)
- [dictionaryStore.ts](file://src/stores/dictionaryStore.ts)
- [README.md](file://src/api/README.md)
</cite>

## 目录
1. [概述](#概述)
2. [API架构设计](#api架构设计)
3. [API工厂机制](#api工厂机制)
4. [服务层封装](#服务层封装)
5. [Vite代理配置](#vite代理配置)
6. [API调用流程](#api调用流程)
7. [错误处理机制](#错误处理机制)
8. [API版本管理](#api版本管理)
9. [Mock数据使用](#mock数据使用)
10. [最佳实践](#最佳实践)

## 概述

政府dashboard项目采用基于Swagger的API生成机制，通过apiFactory.ts实现统一的API客户端管理。整个API集成体系包含以下核心组件：

- **API工厂层**：提供泛型API客户端创建和统一配置
- **服务层**：封装具体的业务逻辑和错误处理
- **配置层**：管理业务模块参数和环境变量
- **拦截器层**：统一处理请求/响应拦截和错误处理

## API架构设计

```mermaid
graph TB
subgraph "前端层"
A[Vue组件] --> B[服务层]
B --> C[API工厂]
C --> D[HTTP客户端]
end
subgraph "配置层"
E[业务模块配置]
F[环境变量]
G[拦截器配置]
end
subgraph "后端层"
H[Swagger API]
I[RESTful服务]
end
B --> E
C --> F
D --> G
D --> H
H --> I
```

**图表来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L67-L208)
- [apiConfig.ts](file://src/api/apiConfig.ts#L6-L98)

**章节来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L1-L253)
- [apiConfig.ts](file://src/api/apiConfig.ts#L1-L98)

## API工厂机制

### 泛型API客户端创建

apiFactory.ts提供了强大的泛型API工厂函数，支持任意swagger-typescript-api生成的API客户端实例创建。

```mermaid
classDiagram
class ApiClientBase {
+AxiosInstance instance
}
class ApiConfig {
+string baseURL
+number timeout
+object headers
+function securityWorker
+boolean secure
+ResponseType format
}
class ApiClientOptions {
+BusinessModule module
+CommonParams defaultParams
+boolean autoInjectParams
+AxiosRequestConfig axiosConfig
}
class createApiClient {
+createApiClient(TClient, ApiClientOptions) TClient
}
ApiClientBase --> ApiConfig : "配置"
ApiClientOptions --> ApiConfig : "扩展"
createApiClient --> ApiClientBase : "创建"
```

**图表来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L23-L66)

### 请求拦截器配置

API工厂内置了完整的请求拦截器，处理认证、参数注入和开发调试：

```mermaid
sequenceDiagram
participant Client as 客户端
participant Interceptor as 请求拦截器
participant Auth as 认证模块
participant Params as 参数注入
participant API as API服务
Client->>Interceptor : 发起请求
Interceptor->>Auth : 获取Token
Auth-->>Interceptor : 返回Token
Interceptor->>Params : 注入业务参数
Params-->>Interceptor : 返回合并参数
Interceptor->>API : 发送请求
API-->>Interceptor : 返回响应
Interceptor-->>Client : 返回处理后数据
```

**图表来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L99-L132)

### 响应拦截器配置

响应拦截器负责统一处理业务状态码、错误提示和数据转换：

```mermaid
flowchart TD
A[接收响应] --> B{检查业务状态码}
B --> |200/0| C[返回数据]
B --> |401| D[清除Token]
D --> E[跳转登录页]
B --> |其他错误| F[显示错误消息]
F --> G[抛出错误]
C --> H[开发环境日志]
E --> I[结束]
G --> I
H --> I
```

**图表来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L135-L206)

**章节来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L67-L208)

## 服务层封装

### 供水模块服务

waterSupplyService.ts提供了供水相关的业务服务函数，封装了复杂的API调用逻辑：

```mermaid
classDiagram
class WaterSupplyService {
+getWaterOverview(params) Promise~Array~
+getDeviceStatusRate(param) Promise~Object~
+getDeviceTypeStatusCount(param) Promise~Array~
+getLatestWaterQuality() Promise~Array~
+getRiskTypeCount(param) Promise~Array~
+getRiskStatusCount(param) Promise~Array~
+getWarnStatistics(sszx) Promise~Object~
+getMonthlyWarnStatistics(year) Promise~Array~
+getCheckResultStatistics(year) Promise~Array~
+getWaterSupplyMaterialRatio() Promise~Array~
+getRiskLevelCount(param) Promise~Array~
}
class WaterSupplyApi {
+overviewData List
+gspspDtransPubmnteqpinfo rateListList
+gspspDtransPubmnteqpinfo deviceTypeStatusCountList
+gspspDtransPubmnteqpinfo latestWaterQualityDataList
+gspspDtransPubrisks riskTypeCountList
+gspspDtransPubrisks riskStatusCountList
+gspspDtransPubmnteawarn warnStatisticsList
+gspspDtransPubmnteawarn monthlyWarnStatisticsList
+gspspDtransPubmnteawarn checkResultStatisticsList
+gspspDtransPubunderpipeline waterSupplyMaterialRatioList
+gspspDtransPubrisks inventoryRiskStatusCountList
}
WaterSupplyService --> WaterSupplyApi : "使用"
```

**图表来源**
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L1-L162)
- [waterSupplyAndDrainage.ts](file://src/api/waterSupplyAndDrainage.ts#L146-L731)

### 燃气模块服务

gasService.ts实现了燃气相关的业务逻辑，提供了丰富的数据获取函数：

```mermaid
classDiagram
class GasService {
+getGasCdRatio() Promise~Array~
+getGasMaterialRatio() Promise~Array~
+getGasPubunderpointRatio() Promise~Array~
+getEmergencyCapacityList() Promise~Array~
+getNaturalGasCountList() Promise~Array~
+getLiquefiedGasCountList() Promise~Array~
+getGasEnterprisePageList(params) Promise~Array~
+getGasEnterpriseLedgerDetail(lsh) Promise~Object~
+getGasStationPageList(params) Promise~Array~
+getGasUserPageList(params) Promise~Array~
+getTargetEquipmentPageList(params) Promise~Array~
+getEquipmentPageList(params) Promise~Array~
+getBottleGasEnterpriseLedgerList() Promise~Array~
+getGasOnlineStatus() Promise~Array~
+getEquipmentOperationStatusList() Promise~Array~
+getGasWarningTypeList() Promise~Array~
}
class GasApi {
+gspspDtransPubunderpipeline gasCdRatioList
+gspspDtransPubunderpipeline gasMaterialRatioList
+gspspDtransPubunderpipeline gasPubunderpointRatioList
+yjnl listList
+jcss trqCountListList
+jcss yhqCountListList
+gspspDtransGas pageList
+gspspDtransGas gasenterpriseledgerDetail
+gspspDtransGas gasfldstationPageList
+gspspDtransGas bottlegasuserPageList
+gspspDtrans glmbbhEqpPageList
+gspspDtrans eqpPageList
+gspspDtransPubmnteqpinfo gasRateListList
+gspspDtransGas jcsbYxztSjtjListList
+gspspDtransGas gasYjListListList
}
GasService --> GasApi : "使用"
```

**图表来源**
- [gasService.ts](file://src/services/gasService.ts#L1-L218)
- [gas.ts](file://src/api/gas.ts#L146-L532)

### 通用服务层

commonService.ts提供了登录、字典等通用功能的服务封装：

```mermaid
classDiagram
class CommonService {
+getPublicKey() Promise~any~
+login(account, password) Promise~Object~
+getDataItemDetails(code) Promise~Array~
+getDataItemDetailsByCodes(codes) Promise~Array~
+getDataItems(code) Promise~Array~
+getLayerTree(params) Promise~Object~
+encryptPasswordWithPublicKey(password, publicKey) Promise~string~
}
class CommonApi {
+login publicKeyList
+login loginCreate
+data dataitemDetailsDetail
+data dataitemDetailsAllDetail
+layer treeList
}
CommonService --> CommonApi : "使用"
```

**图表来源**
- [commonService.ts](file://src/services/commonService.ts#L1-L131)
- [common.ts](file://src/api/common.ts#L834-L961)

**章节来源**
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L1-L162)
- [gasService.ts](file://src/services/gasService.ts#L1-L218)
- [commonService.ts](file://src/services/commonService.ts#L1-L131)

## Vite代理配置

### 代理机制

Vite配置了反向代理来解决开发环境的跨域问题：

```mermaid
graph LR
A[前端开发服务器<br/>localhost:5174] --> B[Vite代理中间件]
B --> C[后端API服务器<br/>test.cityfun.com.cn]
C --> D[Swagger API<br/>/clapi]
subgraph "代理配置"
E[VITE_API_BASE_URL=/clapi]
F[VITE_API_URL=https://test.cityfun.com.cn]
G[changeOrigin: true]
end
B -.-> E
B -.-> F
B -.-> G
```

**图表来源**
- [vite.config.js](file://vite.config.js#L34-L39)

### 环境变量配置

项目通过环境变量管理API配置，支持开发和生产环境分离：

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| VITE_API_BASE_URL | /clapi | API请求的基础路径 |
| VITE_API_URL | - | 后端服务的实际地址 |
| VITE_BASE_URL | /clmap/ | 静态资源的基础路径 |
| VITE_DROP_CONSOLE | false | 是否移除console语句 |
| VITE_DROP_DEBUGGER | false | 是否移除debugger语句 |

**章节来源**
- [vite.config.js](file://vite.config.js#L1-L81)

## API调用流程

### 完整数据流

从组件发起请求到状态更新的完整数据流：

```mermaid
sequenceDiagram
participant Component as Vue组件
participant Service as 服务层
participant Factory as API工厂
participant Interceptor as 拦截器
participant Backend as 后端API
Component->>Service : 调用业务函数
Service->>Factory : 创建API实例
Factory->>Interceptor : 配置拦截器
Interceptor->>Backend : 发送HTTP请求
Backend-->>Interceptor : 返回响应
Interceptor-->>Factory : 处理响应
Factory-->>Service : 返回处理后数据
Service-->>Component : 返回业务数据
Note over Component,Backend : 整个过程包含错误处理和状态管理
```

**图表来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L99-L206)
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L15-L20)

### 代码示例模式

以下是典型的API调用模式：

```typescript
// 服务层函数示例
export async function getWaterOverview(params?: {
  Jcsslx?: string;
  Sjly?: string;
}) {
  const res = await waterApi.overviewData.List(params);
  return res.data || [];
}

// 在组件中使用
import { getWaterOverview } from '@/services/waterSupplyService';

onMounted(async () => {
  try {
    const data = await getWaterOverview();
    state.waterData = data;
  } catch (error) {
    console.error('获取供水数据失败:', error);
  }
});
```

**章节来源**
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L15-L20)

## 错误处理机制

### 统一错误处理

API工厂实现了多层次的错误处理机制：

```mermaid
flowchart TD
A[API请求] --> B{请求成功?}
B --> |是| C[响应拦截器]
B --> |否| D[网络错误处理]
C --> E{业务状态码检查}
E --> |200/0| F[返回数据]
E --> |401| G[未授权处理]
E --> |其他| H[业务错误处理]
D --> I{错误类型判断}
I --> |网络超时| J[提示网络问题]
I --> |服务器错误| K[提示服务器问题]
I --> |其他| L[通用错误提示]
G --> M[清除Token]
M --> N[跳转登录]
H --> O[显示错误消息]
J --> P[结束]
K --> P
L --> P
O --> P
N --> P
```

**图表来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L135-L206)

### 错误类型处理

| 错误类型 | HTTP状态码 | 处理方式 |
|---------|-----------|----------|
| 未授权 | 401 | 清除Token，跳转登录页 |
| 权限不足 | 403 | 显示权限不足提示 |
| 资源不存在 | 404 | 显示资源不存在提示 |
| 服务器错误 | 500 | 显示服务器错误提示 |
| 网关错误 | 502 | 显示网关错误提示 |
| 服务不可用 | 503 | 显示服务暂时不可用提示 |

**章节来源**
- [apiFactory.ts](file://src/api/apiFactory.ts#L135-L206)

## API版本管理

### 业务模块版本控制

项目通过业务模块枚举实现API版本管理：

```mermaid
classDiagram
class BusinessModule {
<<enumeration>>
WATER_SUPPLY : "csaqzx_gs"
DRAINAGE : "csaqzx_ps"
GAS : "csaqzx_rq"
BRIDGE : "csaqzx_ql"
GAS_END_USER : "csaqzx_rqzdyh"
BOTTLED_LPG : "csaqzx_pzyhq"
THIRD_PARTY_CONSTRUCTION : "csaqzx_sfsg"
}
class CommonParams {
+string Dsbm
+string Qhbm
+string Sszx
+string Sjly
}
class MODULE_CONFIG {
+Record~BusinessModule, CommonParams~
}
BusinessModule --> CommonParams : "配置"
MODULE_CONFIG --> BusinessModule : "映射"
```

**图表来源**
- [apiConfig.ts](file://src/api/apiConfig.ts#L7-L72)

### 向后兼容策略

1. **参数合并策略**：自定义参数优先于默认参数
2. **响应格式标准化**：统一返回格式，便于前端处理
3. **错误码标准化**：使用统一的业务状态码体系
4. **渐进式迁移**：保留旧接口，逐步替换新接口

**章节来源**
- [apiConfig.ts](file://src/api/apiConfig.ts#L7-L98)

## Mock数据使用

### 字典数据缓存机制

dictionaryStore.ts实现了智能的字典数据缓存机制：

```mermaid
classDiagram
class DictionaryStore {
+ref~DictionaryData~ dictionaries
+ref~Set~string~~ loadingCodes
+getDictionary(code) Promise~DictionaryItem[]~
+getDictionaries(codes) Promise~DictionaryData~
+clearDictionary(code) void
+clearAllDictionaries() void
}
class DictionaryItem {
+string f_ItemValue
+string f_ItemName
+string f_SimpleSpelling
}
DictionaryStore --> DictionaryItem : "管理"
```

**图表来源**
- [dictionaryStore.ts](file://src/stores/dictionaryStore.ts#L14-L222)

### 缓存策略

1. **内存缓存**：数据存储在内存中，访问速度快
2. **并发去重**：相同字典码的并发请求会被去重
3. **懒加载**：只在需要时才加载字典数据
4. **手动刷新**：支持手动清除特定字典的缓存

**章节来源**
- [dictionaryStore.ts](file://src/stores/dictionaryStore.ts#L26-L222)

## 最佳实践

### API调用最佳实践

1. **使用服务层函数**：避免直接操作API客户端
2. **参数校验**：在服务层进行参数验证
3. **错误处理**：在组件层面处理业务错误
4. **状态管理**：合理使用Pinia store管理API状态

### 开发调试建议

1. **启用开发日志**：开发环境下会输出详细的请求/响应日志
2. **使用浏览器开发者工具**：监控网络请求和响应
3. **模拟数据**：在开发阶段可以使用mock数据
4. **错误边界**：在组件层面设置错误边界

### 性能优化

1. **请求去重**：避免重复发送相同的API请求
2. **数据缓存**：合理使用字典缓存机制
3. **懒加载**：按需加载API模块
4. **批量请求**：对于相关数据使用批量API

**章节来源**
- [README.md](file://src/api/README.md#L1-L69)
- [CODEBUDDY.md](file://CODEBUDDY.md#L171-L330)