# 政府大屏 WebGIS 项目规则（Trae 专用）

本文件为“可执行规则与约束”，用于指导在 Trae 中对项目进行安全、高效、一致的开发与重构。避免写成说明书风格，强调行为规范、约束与检查清单。

---

## 0. 全局硬性约束
- 平台与环境：Windows 10（路径与命令需兼容）。
- GIS 引擎：Cesium 版本锁定 1.96（禁止升级/降级）。
- 框架与构建：Vue 3 + Vite。
- 样式：SCSS，选择器嵌套最多 3 级；遵循 BEM。
- 颜色：必须使用 Ant Design 色彩变量（仅作用于自研组件，不影响第三方组件库样式）。
- 资源：新建图片仅允许 SVG；禁止提交二进制大图；严禁在仓库中泄露任何密钥。
- Vue 文件：单文件超过 500 行必须考虑拆分组件。
- 最小改动原则：优先编辑已有文件，避免无必要的新建文件；严禁创建 README 等非必要文档。
- 部署产物：禁止修改/提交 dist.zip 等构建产物。

---

## 1. Trae 助手操作 SOP
1) 在做任何改动前：
   - 读取目录与相关文件，理解现有约束与代码风格。
   - 创建结构化 TODO 列表（仅一个任务标记为进行中）。
2) 变更实施：
   - 严格遵循本规则，使用最少步骤完成改动。
   - 添加必要的 import/依赖与配置，但不得引入不必要的大型库。
   - 修改涉及样式时，只在自研组件内使用色彩变量，不污染组件库默认样式。
3) 交付后：
   - 不启动开发服务器、不执行 npm run dev、不打开预览（由你手动检查）。
   - 用文字列出自检要点与影响面，以便人工核验。

---

## 2. 主题与样式边界
- 全局颜色变量（仅示意，不得覆盖组件库样式）：
  :root {
    --primary-color: #1677ff;
    --success-color: #52c41a;
    --warning-color: #faad14;
    --error-color: #ff4d4f;
    --text-primary: rgba(0, 0, 0, 0.88);
    --text-secondary: rgba(0, 0, 0, 0.65);
    --border-primary: #d9d9d9;
    --bg-layout: #f5f5f5;
  }
- SCSS 最多三级嵌套，示例：
  .map-container { .map-tools { .tool-button { /* ≤3 级 */ } } }
- 禁止在全局覆盖第三方组件库样式；若必须，采用局部作用域并经评审。

---

## 3. Cesium 1.96 专属规则
- 初始化建议（按需精简功能按钮，默认关闭动画/时间轴）：
  const viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,
    animation: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    requestRenderMode: true, // 降低渲染负载
  });
- 坐标与单位：统一 WGS84（EPSG:4326）；高度单位米；经度在前、纬度在后。
- 数据接入：优先使用 DataSource（GeoJsonDataSource、CZML、3DTileset）；大数据用聚合/分片。
- 事件管理：所有自定义事件监听在组件卸载前必须解除；不可遗留监听导致内存泄漏。
- 资源清理：
  - viewer.entities.removeAll() / viewer.dataSources.removeAll()
  - 挂载期生成的 primitive/imagery/terrain/listeners 在卸载时逐一销毁
  - 组件销毁时若创建了独立 viewer 必须 viewer.destroy()
- 性能首选项：
  - imageryLayers ≤ 3（底图/标注/业务图层）；
  - 实体数量基线 ≤ 5,000；超出使用聚合或 3D Tiles；
  - 相机/鼠标事件节流 ≥ 100ms；
  - 禁止在渲染循环中频繁 setView；尽量使用 flyTo 并合并请求。

---

## 4. 构建与资源（Vite）
- 资源路径：静态数据与图标放于 public/ 或 src/assets/；GeoJSON 建议置于 src/assets/data/。
- Cesium 资源：
  - 若使用包方式，请确保正确设置静态资源基路径（如需要 CESIUM_BASE_URL 等），并避免将庞大未使用资源打包。
  - 若使用 CDN 方式，在 index.html 中以延迟/按需策略加载，避免阻塞首屏。
- 严禁将私有 token 写死在源码中（例如 Ion Token）。

---

## 5. 目录与命名
- 组件：PascalCase 文件名；单一职责，必要时拆分。
- 文件：kebab-case；变量 camelCase；常量 UPPER_SNAKE_CASE；BEM 类名。
- 推荐目录（按现有项目对齐、非强制迁移）：
  src/
  ├─ components/ (MapComponent.vue, MapTools.vue, InfoWindow.vue, ...)
  ├─ assets/ (icons/, images/, data/)
  ├─ utils/ (cesiumUtils.js, mapUtils.js)
  └─ styles/ (variables.scss, mixins.scss)

---

## 6. 性能预算与容量约束
- 运行时目标：1080p 大屏 ≥ 30 FPS。
- 网络预算：首屏关键资源 ≤ 1.5 MB；非关键 GIS 数据延迟加载。
- 数据预算：单 GeoJSON 文件 ≤ 5 MB（超过需切片/抽稀/服务器端聚合）。
- 渲染策略：启用 requestRenderMode；仅在交互或数据变化时触发渲染。
- 调试建议：定期检查帧率与内存增长，确认无持续攀升。

---

## 7. 提交与评审清单
在提交任何改动前，请逐项自检：
- 是否遵守了版本、样式、色彩、资源等硬性约束？
- 是否出现 Vue 单文件 > 500 行未拆分？
- SCSS 是否 ≤ 3 级嵌套？
- 是否避免污染第三方组件库样式？
- Cesium 资源/事件是否在卸载时正确清理？
- 是否引入了新的大型依赖或多余文件？
- 是否为新增模块提供了最小使用示例或调用约定？
- 是否提供了手工验证步骤与影响面说明（无需运行命令）？

---

## 8. 最小调用约定（示例）
- 加载 GeoJSON：
  const dataSource = await Cesium.GeoJsonDataSource.load('/assets/data/example.geojson');
  viewer.dataSources.add(dataSource);
- 相机定位：
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  });
- 清理：
  viewer.entities.removeAll();
  viewer.dataSources.removeAll();

---

## 9. Do / Don’t
- Do：使用 AntD 色彩变量；限制样式嵌套；拆分超大组件；按需加载数据；集中清理资源。
- Don’t：升级 Cesium；在渲染循环频繁 setView；全局覆盖第三方样式；提交二进制大图/密钥；修改 dist.zip。

---

遵照以上规则执行，确保在 Trae 中的改动可控、可审、可回滚，并适配大屏 WebGIS 的性能与工程约束。