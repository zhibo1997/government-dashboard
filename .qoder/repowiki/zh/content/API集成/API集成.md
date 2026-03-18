# API集成

<cite>
**本文档引用的文件**
- [httpClient.ts](file://src/services/httpClient.ts)
- [config.ts](file://src/services/config.ts)
- [gasService.ts](file://src/services/gasService.ts)
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts)
- [commonService.ts](file://src/services/commonService.ts)
- [vite.config.js](file://vite.config.js)
- [dictionaryStore.ts](file://src/stores/dictionaryStore.ts)
</cite>

## 更新摘要
**变更内容**
- 删除了旧的API工厂机制，引入了现代化的HTTP客户端架构
- 新增了统一的请求队列管理和并发控制机制
- 更新了服务层封装方式，直接使用新的HTTP客户端
- 改进了错误处理和消息防重复机制
- 保持了原有的业务模块配置和环境变量管理

## 目录
1. [概述](#概述)
2. [HTTP客户端架构](#http客户端架构)
3. [统一HTTP客户端](#统一http客户端)
4. [请求队列管理](#请求队列管理)
5. [服务层封装](#服务层封装)
6. [Vite代理配置](#vite代理配置)
7. [API调用流程](#api调用流程)
8. [错误处理机制](#错误处理机制)
9. [API版本管理](#api版本管理)
10. [Mock数据使用](#mock数据使用)
11. [最佳实践](#最佳实践)

## 概述

政府dashboard项目采用现代化的HTTP客户端架构，通过httpClient.ts提供统一的API请求管理。整个API集成体系包含以下核心组件：

- **统一HTTP客户端**：提供统一的请求配置、拦截器和错误处理
- **请求队列管理**：支持并发控制和请求去重
- **服务层封装**：封装具体的业务逻辑和参数管理
- **配置层**：管理业务模块参数和环境变量
- **拦截器层**：统一处理请求/响应拦截和错误处理

## HTTP客户端架构

```mermaid
graph TB
subgraph "前端层"
A[Vue组件] --> B[服务层]
B --> C[HTTP客户端]
C --> D[Axios实例]
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
- [httpClient.ts](file://src/services/httpClient.ts#L96-L104)
- [config.ts](file://src/services/config.ts#L48-L53)

**章节来源**
- [httpClient.ts](file://src/services/httpClient.ts#L1-L297)
- [config.ts](file://src/services/config.ts#L1-L114)

## 统一HTTP客户端

### HTTP客户端核心功能

httpClient.ts提供了现代化的HTTP客户端，替代了旧的API工厂机制：

```mermaid
classDiagram
class HttpClient {
+AxiosInstance httpInstance
+Map~string,number~ messageDedupMap
+RequestQueue requestQueue
+string baseURL
+number timeout
+function get(url, params, options) Promise~T~
+function post(url, data, options) Promise~T~
+function put(url, data, options) Promise~T~
+function del(url, params, options) Promise~T~
}
class RequestQueue {
+RequestItem[] queue
+number running
+number concurrency
+add(requestFn) Promise~T~
+cancle() void
+process() void
}
class TokenManager {
+boolean isHandlingTokenExpired
+boolean tokenInvalid
+getAuthToken() string
+resetTokenExpiredFlag() void
}
HttpClient --> RequestQueue : "使用"
HttpClient --> TokenManager : "管理"
```

**图表来源**
- [httpClient.ts](file://src/services/httpClient.ts#L53-L92)
- [httpClient.ts](file://src/services/httpClient.ts#L20-L29)

### 请求拦截器配置

HTTP客户端内置了完整的请求拦截器，处理认证、参数注入和开发调试：

```mermaid
sequenceDiagram
participant Client as 客户端
participant Interceptor as 请求拦截器
participant Token as Token管理
participant Queue as 请求队列
participant API as API服务
Client->>Interceptor : 发起请求
Interceptor->>Token : 检查Token状态
Token-->>Interceptor : 返回Token状态
Interceptor->>Queue : 添加到请求队列
Queue->>API : 发送请求
API-->>Queue : 返回响应
Queue-->>Interceptor : 处理响应
Interceptor-->>Client : 返回处理后数据
```

**图表来源**
- [httpClient.ts](file://src/services/httpClient.ts#L107-L140)

### 响应拦截器配置

响应拦截器负责统一处理业务状态码、错误提示和数据转换：

```mermaid
flowchart TD
A[接收响应] --> B{检查业务状态码}
B --> |200/0| C[返回数据]
B --> |401| D[Token失效处理]
D --> E[取消队列请求]
D --> F[清除Token]
D --> G[跳转登录页]
B --> |其他错误| H[显示错误消息]
H --> I[抛出错误]
C --> J[开发环境日志]
G --> K[结束]
I --> K
J --> K
```

**图表来源**
- [httpClient.ts](file://src/services/httpClient.ts#L143-L231)

**章节来源**
- [httpClient.ts](file://src/services/httpClient.ts#L96-L297)

## 请求队列管理

### 并发控制机制

HTTP客户端实现了智能的请求队列管理，支持并发控制和请求去重：

```mermaid
classDiagram
class RequestQueue {
+QueueItem[] queue
+number running
+number concurrency
+add(requestFn) Promise~T~
+cancle() void
+process() void
}
class QueueItem {
+Function requestFn
+Function resolve
+Function reject
}
RequestQueue --> QueueItem : "管理"
```

**图表来源**
- [httpClient.ts](file://src/services/httpClient.ts#L53-L92)

### Token失效处理

当检测到Token失效时，系统会自动取消所有排队的请求：

```mermaid
flowchart TD
A[收到401错误] --> B{是否跳过认证?}
B --> |否| C[设置tokenInvalid=true]
C --> D[取消队列中的所有请求]
D --> E[清除localStorage中的token]
E --> F[显示错误消息]
F --> G[跳转到登录页]
B --> |是| H[直接拒绝请求]
G --> I[结束]
H --> I
```

**图表来源**
- [httpClient.ts](file://src/services/httpClient.ts#L161-L174)

**章节来源**
- [httpClient.ts](file://src/services/httpClient.ts#L53-L92)

## 服务层封装

### 供水模块服务

waterSupplyService.ts提供了供水相关的业务服务函数，现在直接使用新的HTTP客户端：

```mermaid
classDiagram
class WaterSupplyService {
+getWaterOverview(params) Promise~Array~
+getDeviceStatusRate(param) Promise~Object~
+getDeviceTypeStatusCount(param) Promise~Array~
+getLatestWaterQuality(param) Promise~Array~
+getRiskTypeCount(param) Promise~Array~
+getRiskStatusCount(param) Promise~Array~
+getWaterSupplyRiskCount(param) Promise~Array~
+getDrainageRiskCount(param) Promise~Array~
+getWarnStatistics(sszx) Promise~Object~
+getMonthlyWarnStatistics(params) Promise~Array~
+getCheckResultStatistics(params) Promise~Array~
+getWaterSupplyMaterialRatio(params) Promise~Array~
+getDrainageMaterialRatio(params) Promise~Array~
+getRiskLevelCount(param) Promise~Array~
+getHazardLevelCountList(param) Promise~Array~
}
class HttpClient {
+get(url, params, options) Promise~T~
+post(url, data, options) Promise~T~
+put(url, data, options) Promise~T~
+del(url, params, options) Promise~T~
}
WaterSupplyService --> HttpClient : "使用"
```

**图表来源**
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L1-L186)
- [httpClient.ts](file://src/services/httpClient.ts#L243-L294)

### 燃气模块服务

gasService.ts实现了燃气相关的业务逻辑，同样直接使用新的HTTP客户端：

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
+getBottleGasEnterpriseLedgerDetail(lsh) Promise~Object~
+getGasStationPageList(params) Promise~Array~
+getGasUserPageList(params) Promise~Array~
+getTargetEquipmentPageList(params) Promise~Array~
+getEquipmentPageList(params) Promise~Array~
+getBottleGasEnterpriseLedgerList() Promise~Array~
+getGasEnterpriseLedgerList() Promise~Array~
+getGasOnlineStatus() Promise~Array~
+getEquipmentOperationStatusList() Promise~Array~
+getGasWarningTypeList() Promise~Array~
}
class HttpClient {
+get(url, params, options) Promise~T~
+post(url, data, options) Promise~T~
+put(url, data, options) Promise~T~
+del(url, params, options) Promise~T~
}
GasService --> HttpClient : "使用"
```

**图表来源**
- [gasService.ts](file://src/services/gasService.ts#L1-L192)
- [httpClient.ts](file://src/services/httpClient.ts#L243-L294)

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
+getMonitoringPointLatestData(sszx, sblx) Promise~Array~
+encryptPasswordWithPublicKey(password, publicKey) Promise~string~
}
class HttpClient {
+get(url, params, options) Promise~T~
+post(url, data, options) Promise~T~
+put(url, data, options) Promise~T~
+del(url, params, options) Promise~T~
}
CommonService --> HttpClient : "使用"
```

**图表来源**
- [commonService.ts](file://src/services/commonService.ts#L1-L160)
- [httpClient.ts](file://src/services/httpClient.ts#L243-L294)

**章节来源**
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L1-L186)
- [gasService.ts](file://src/services/gasService.ts#L1-L192)
- [commonService.ts](file://src/services/commonService.ts#L1-L160)

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
- [vite.config.js](file://vite.config.js#L35-L40)

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
- [vite.config.js](file://vite.config.js#L1-L82)

## API调用流程

### 完整数据流

从组件发起请求到状态更新的完整数据流：

```mermaid
sequenceDiagram
participant Component as Vue组件
participant Service as 服务层
participant HttpClient as HTTP客户端
participant RequestQueue as 请求队列
participant Interceptor as 拦截器
participant Backend as 后端API
Component->>Service : 调用业务函数
Service->>HttpClient : 调用HTTP方法
HttpClient->>RequestQueue : 添加到队列
RequestQueue->>Interceptor : 配置拦截器
Interceptor->>Backend : 发送HTTP请求
Backend-->>Interceptor : 返回响应
Interceptor-->>RequestQueue : 处理响应
RequestQueue-->>HttpClient : 返回处理后数据
HttpClient-->>Service : 返回业务数据
Service-->>Component : 返回业务数据
Note over Component,Backend : 整个过程包含错误处理和状态管理
```

**图表来源**
- [httpClient.ts](file://src/services/httpClient.ts#L107-L231)
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L15-L22)

### 代码示例模式

以下是典型的API调用模式：

```typescript
// 服务层函数示例
export async function getWaterOverview(params?: {
  Sszx: string
  Jcsslx?: string
  Sjly?: string
}) {
  const res = await get<any>('/gspspDtransPubbasicfacilitiesinfo/list', { ...defaultParams, ...params })
  return res.data || []
}

// 在组件中使用
import { getWaterOverview } from '@/services/waterSupplyService'

onMounted(async () => {
  try {
    const data = await getWaterOverview({ Sszx: 'csaqzx_gs' })
    state.waterData = data
  } catch (error) {
    console.error('获取供水数据失败:', error)
  }
})
```

**章节来源**
- [waterSupplyService.ts](file://src/services/waterSupplyService.ts#L15-L22)

## 错误处理机制

### 统一错误处理

HTTP客户端实现了多层次的错误处理机制：

```mermaid
flowchart TD
A[API请求] --> B{请求成功?}
B --> |是| C[响应拦截器]
B --> |否| D[网络错误处理]
C --> E{业务状态码检查}
E --> |200/0| F[返回数据]
E --> |401| G[Token失效处理]
E --> |其他| H[业务错误处理]
D --> I{错误类型判断}
I --> |网络超时| J[提示网络问题]
I --> |服务器错误| K[提示服务器问题]
I --> |其他| L[通用错误提示]
G --> M[取消队列请求]
M --> N[清除Token]
N --> O[跳转登录]
H --> P[显示错误消息]
J --> Q[结束]
K --> Q
L --> Q
P --> Q
O --> Q
```

**图表来源**
- [httpClient.ts](file://src/services/httpClient.ts#L143-L231)

### 错误类型处理

| 错误类型 | HTTP状态码 | 处理方式 |
|---------|-----------|----------|
| 未授权 | 401 | Token失效，清除Token，跳转登录页 |
| 权限不足 | 403 | 显示权限不足提示 |
| 资源不存在 | 404 | 显示资源不存在提示 |
| 服务器错误 | 500 | 清除Token，跳转登录页 |
| 网关错误 | 502 | 显示网关错误提示 |
| 服务不可用 | 503 | 显示服务暂时不可用提示 |

**章节来源**
- [httpClient.ts](file://src/services/httpClient.ts#L143-L231)

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
class Config {
+DEFAULT_COMMON_PARAMS
+getModuleParams(module) CommonParams
+mergeParams(defaultParams, customParams) Object
}
BusinessModule --> CommonParams : "配置"
Config --> BusinessModule : "映射"
```

**图表来源**
- [config.ts](file://src/services/config.ts#L8-L53)

### 向后兼容策略

1. **参数合并策略**：自定义参数优先于默认参数
2. **响应格式标准化**：统一返回格式，便于前端处理
3. **错误码标准化**：使用统一的业务状态码体系
4. **渐进式迁移**：保留旧接口，逐步替换新接口

**章节来源**
- [config.ts](file://src/services/config.ts#L48-L66)

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
- [dictionaryStore.ts](file://src/stores/dictionaryStore.ts#L26-L225)

### 缓存策略

1. **内存缓存**：数据存储在内存中，访问速度快
2. **并发去重**：相同字典码的并发请求会被去重
3. **懒加载**：只在需要时才加载字典数据
4. **手动刷新**：支持手动清除特定字典的缓存

**章节来源**
- [dictionaryStore.ts](file://src/stores/dictionaryStore.ts#L38-L97)

## 最佳实践

### API调用最佳实践

1. **使用服务层函数**：避免直接操作HTTP客户端
2. **参数校验**：在服务层进行参数验证
3. **错误处理**：在组件层面处理业务错误
4. **状态管理**：合理使用Pinia store管理API状态
5. **请求去重**：利用内置的请求队列避免重复请求

### 开发调试建议

1. **启用开发日志**：开发环境下会输出详细的请求/响应日志
2. **使用浏览器开发者工具**：监控网络请求和响应
3. **模拟数据**：在开发阶段可以使用mock数据
4. **错误边界**：在组件层面设置错误边界

### 性能优化

1. **请求去重**：利用内置的消息防重复机制
2. **数据缓存**：合理使用字典缓存机制
3. **懒加载**：按需加载API模块
4. **批量请求**：对于相关数据使用批量API

**章节来源**
- [httpClient.ts](file://src/services/httpClient.ts#L35-L49)
- [dictionaryStore.ts](file://src/stores/dictionaryStore.ts#L104-L197)