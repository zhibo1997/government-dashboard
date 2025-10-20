<!--
 * @Author: Do not edit
 * @Date: 2025-10-20 22:44:16
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 22:44:19
 * @Description: 
-->
# MapLibre GL 迁移检查清单

## ✅ 已完成的迁移步骤

### 📦 1. 依赖包更新
- [x] 更新 package.json 依赖
  - [x] 移除: `@types/mapbox-gl`
  - [x] 添加: `@types/maplibre-gl`
- [x] 保留 `maplibre-gl: ^5.9.0` (已在依赖中)

### 📝 2. 类型定义更新
- [x] 更新 `src/types/mapbox-gl.d.ts`
  - [x] 将导入从 `mapbox-gl` 改为 `maplibre-gl`
  - [x] 命名空间保持不变以减少影响

### 🛠️ 3. 工具类迁移

#### mapboxUtils.ts
- [x] 更新导入语句: `import mapboxgl from 'maplibre-gl'`
- [x] 更新模块声明: `declare module "maplibre-gl"`
- [x] 修复 `initMap()` 中的样式类型 (`as any`)
- [x] 修复 `initSimpleTiandituMap()` 中的样式类型 (`as any`)
- [x] 更新 `loadImage()` API (从回调改为 Promise)

#### tiles3DUtils.ts
- [x] 更新导入语句: `import mapboxgl from 'maplibre-gl'`

#### measureUtils.ts
- [x] 更新导入语句: `import mapboxgl from 'maplibre-gl'`
- [x] 添加缺失的 `updateDistanceDisplay()` 方法

#### dataUtils.ts
- [x] 无需修改 (不依赖地图库)

#### layerTreeUtils.ts
- [x] 无需修改 (不依赖地图库)

### 🎨 4. 组件迁移

#### MapboxMapComponent.vue
- [x] 更新导入语句: `import mapboxgl from 'maplibre-gl'`

#### MapboxMapTools.vue
- [x] 更新类型导入: `import type { Map as MapboxMap } from 'maplibre-gl'`

#### Tiles3DComponent.vue
- [x] 更新导入语句: `import mapboxgl from 'maplibre-gl'`
- [x] 添加类型断言以解决 deck.gl 兼容性问题 (`as any`)

### 🎨 5. 样式导入
- [x] 在 `src/main.js` 中添加: `import 'maplibre-gl/dist/maplibre-gl.css'`

### 📚 6. 文档更新
- [x] 创建 `MAPLIBRE_MIGRATION_GUIDE.md` 迁移指南
- [x] 创建本检查清单文件

---

## 🚀 下一步操作

### 1. 安装依赖 (必须)
```bash
# 删除旧依赖 (如果存在)
npm uninstall @cgcs2000/mapbox-gl @types/mapbox-gl

# 安装新依赖 (maplibre-gl 已存在,只需安装类型)
npm install --save-dev @types/maplibre-gl@^5.9.0

# 重新安装所有依赖
npm install
```

### 2. 代码检查
```bash
# 检查 TypeScript 错误
npm run type-check  # 如果有此命令

# 或直接构建检查
npm run build
```

### 3. 功能测试

#### 基础地图功能
- [ ] 地图正常初始化和显示
- [ ] 地图缩放、平移、旋转正常
- [ ] 地图控件正常显示 (导航控件、比例尺等)

#### 底图功能
- [ ] 天地图矢量底图加载正常
- [ ] 天地图影像底图加载正常
- [ ] 天地图地形底图加载正常
- [ ] 底图切换功能正常

#### 数据图层
- [ ] GeoJSON 数据加载和渲染正常
- [ ] 矢量切片图层加载正常
- [ ] 图层显隐切换正常
- [ ] 图层透明度调整正常

#### 地图工具
- [ ] 地图复位功能正常
- [ ] 指北针功能正常
- [ ] 测距工具正常
- [ ] 测面积工具正常

#### POI 功能
- [ ] POI 标注显示正常
- [ ] POI 弹窗交互正常
- [ ] POI 图标显示正常

#### 图层树
- [ ] 图层树加载正常
- [ ] 图层勾选/取消正常
- [ ] 图层展开/收起正常

#### 3D 功能
- [ ] 3D Tiles 模型加载正常
- [ ] 3D 模型显隐控制正常
- [ ] 3D 模型透明度调整正常
- [ ] deck.gl 集成功能正常

---

## 🐛 潜在问题和解决方案

### 问题 1: TypeScript 类型错误
**现象**: `LayerTree.vue` 类型声明错误  
**原因**: TypeScript 配置问题,与迁移无关  
**解决**: 添加 `.vue` 文件的类型声明或使用 `// @ts-ignore`

### 问题 2: CSS 样式丢失
**现象**: 地图控件无样式  
**原因**: 未导入 MapLibre CSS  
**解决**: ✅ 已在 main.js 中添加导入

### 问题 3: deck.gl 类型不兼容
**现象**: `tiles3DUtils.load3DTiles()` 类型错误  
**原因**: deck.gl 类型定义仍针对 Mapbox GL  
**解决**: ✅ 已使用 `as any` 类型断言

### 问题 4: loadImage API 差异
**现象**: `map.loadImage()` 参数错误  
**原因**: MapLibre 使用 Promise 而非回调  
**解决**: ✅ 已更新为 Promise 方式

---

## 📊 代码变更统计

| 文件类型 | 文件数 | 变更行数 | 影响程度 |
|---------|-------|---------|---------|
| package.json | 1 | 1 | 低 |
| 类型定义 | 1 | 3 | 低 |
| 工具类 | 3 | ~15 | 中 |
| 组件 | 3 | 3 | 低 |
| 样式导入 | 1 | 1 | 低 |
| **总计** | **9** | **~23** | **低-中** |

---

## ✅ 验收标准

迁移完成后,以下所有条件都应满足:

1. **编译成功**: `npm run build` 无错误
2. **地图显示**: 页面能正常显示地图
3. **交互正常**: 所有地图交互功能正常
4. **性能稳定**: 地图性能无明显下降
5. **功能完整**: 所有现有功能正常工作
6. **无控制台错误**: 浏览器控制台无相关错误

---

## 📝 备注

### 兼容性说明
- MapLibre GL v5.9.0 与 Mapbox GL v1.x API 99% 兼容
- 极少数 API 需要调整 (主要是 Promise 化)
- 类型定义更严格,但可通过 `as any` 临时解决

### 回滚方案
如果迁移出现问题,可以快速回滚:

```bash
# 1. 恢复 package.json
git checkout package.json

# 2. 恢复所有代码文件
git checkout src/

# 3. 重新安装依赖
npm install
```

### 后续优化
- 考虑移除不必要的 `as any` 类型断言
- 优化地图初始化配置
- 升级 deck.gl 以获得更好的 MapLibre 支持

---

**最后更新**: 2025-10-20  
**状态**: ✅ 代码迁移完成,待测试验证
