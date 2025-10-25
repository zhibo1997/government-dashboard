# API 使用指南

## 📦 核心文件

```
src/api/
├── common.ts                 # 通用模块（登录、字典）- swagger 生成
├── waterSupplyAndDrainage.ts # 供水排水模块 - swagger 生成
├── apiConfig.ts              # 业务模块参数配置
├── apiFactory.ts             # 泛型 API 工厂函数
├── index.ts                  # 统一导出入口
└── README.md                 # 本文档

src/services/
├── commonService.ts          # 通用服务（登录、字典）
└── waterSupplyService.ts     # 供水服务
```

## 🚀 快速开始

### 方式 1：使用服务层函数（推荐）

```typescript
import { login, getPublicKey } from '@/services/commonService'
import { getWaterOverview } from '@/services/waterSupplyService'

// 登录
const loginData = await login('username', 'password')

// 获取供水总览
const waterData = await getWaterOverview()
```

### 方式 2：使用 API 客户端

```typescript
import { createWaterSupplyApi, createCommonApi } from '@/api'

const waterApi = createWaterSupplyApi()
const commonApi = createCommonApi()

// 调用接口
const data = await waterApi.overviewData.List()
const publicKey = await commonApi.login.publicKeyList()
```

## 🔧 添加新的 Swagger 模块

### 步骤 1：生成 API 客户端

```bash
# 生成燃气模块
npx swagger-typescript-api \
  -p "http://your-api-url/swagger.json" \
  -o ./src/api/ \
  -n gas \
  --axios
```

### 步骤 2：在 apiFactory.ts 中添加工厂函数

```typescript
import { Api as GasApi } from './gas'

export function createGasApi(): GasApi<unknown> {
  return createApiClient(GasApi, { module: BusinessModule.GAS })
}
```

### 步骤 3：创建服务层封装（可选）

```typescript
// src/services/gasService.ts
import { createGasApi } from '@/api/apiFactory'

const gasApi = createGasApi()

export async function getGasOverview() {
  const res = await gasApi.overview.List()
  return res.data
}
```

## 📝 业务模块配置

在 `apiConfig.ts` 中配置：

```typescript
export enum BusinessModule {
  WATER_SUPPLY = 'csaqzx_gs',  // 供水
  DRAINAGE = 'csaqzx_ps',      // 排水
  GAS = 'csaqzx_rq',           // 燃气
  BRIDGE = 'csaqzx_ql',        // 桥梁
}
```

## 🎯 最佳实践

1. **优先使用服务层函数**：更简洁，易于维护
2. **保留 swagger 生成的代码不变**：所有配置通过工厂函数管理
3. **按模块创建独立的 API 实例**：避免参数混淆
4. **服务层提供薄封装**：直接返回数据，处理错误

## 📚 更多文档

- [迁移指南](./MIGRATION_GUIDE.md) - 从旧方案迁移到新方案
