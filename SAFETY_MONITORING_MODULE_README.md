# 城市安全综合监测预警平台模块

## 📋 模块概述

城市安全综合监测预警平台是阳新县城市安全监测系统的主页面，提供全局监测数据总览、预警通报和座舱管理功能。

## 🎯 核心功能

### 1. 监测管理模块 (左侧)
- **监测统计**: 总数、气象、供水、燃气、桥梁五大类别监测点统计
- **区域分布**: 按乡镇/街道展示监测设备分布情况
- **实时数据**: 各类监测设备数量实时统计

### 2. 监测综合模块 (左侧)
- **在线率监控**: 环形图展示设备在线/离线状态
- **健康度分析**: 统计健康、亚健康、故障设备数量
- **可视化展示**: ECharts环形图直观展示监测状态

### 3. 井盖统计模块 (左侧)
- **状态统计**: 正常、预警、离线三种状态快速统计
- **分类监测**: 智慧井盖、智慧阀门、流量监测、压力监测
- **详细列表**: 表格形式展示各类设备详细数据

### 4. 预警通报模块 (右侧)
- **时间筛选**: 支持今日/本周/本月时间范围筛选
- **分级统计**: 严重/一般/提示三级预警统计
- **预警列表**: 实时展示最新预警信息
- **详细信息**: 预警级别、位置、类型、时间等完整信息

### 5. 座舱管理模块 (右侧)
- **座舱概览**: 总座舱、运行中、预警、离线状态统计
- **座舱列表**: 各专项监测座舱详细信息
- **快捷操作**: 查看和管理座舱功能

### 6. 中央地图区域
- **3D地图**: 基于Cesium的三维地图展示
- **图层控制**: 支持多图层切换和管理
- **设备定位**: 地图上展示监测设备位置

## 📁 文件结构

```
src/views/SafetyMonitoring/
├── index.vue                                    # 主视图入口
├── leftContent.vue                              # 左侧内容容器
├── rightContent.vue                             # 右侧内容容器
└── components/
    ├── MonitoringManagementModule.vue           # 监测管理模块
    ├── MonitoringComprehensiveModule.vue        # 监测综合模块
    ├── ManholeStatisticsModule.vue              # 井盖统计模块
    ├── WarningNotificationModule.vue            # 预警通报模块
    └── CockpitManagementModule.vue              # 座舱管理模块
```

## 🎨 设计规范

### 颜色体系
- **主色调**: `#1677ff` (拂晓蓝)
- **成功色**: `#52c41a` (极光绿)
- **警告色**: `#faad14` (金盏花)
- **错误色**: `#ff4d4f` (薄暮红)
- **信息色**: `#1890ff` (明蓝)
- **背景**: 半透明黑色渐变 + 毛玻璃效果

### 布局规范
- **基准分辨率**: 4096 x 1920
- **左侧宽度**: 820px
- **右侧宽度**: 820px
- **中间地图**: 自适应宽度
- **模块间距**: 16px

## 🔧 技术实现

### 核心技术栈
- **Vue 3**: Composition API
- **Ant Design Vue**: UI组件库
- **ECharts**: 数据可视化
- **Vue Cesium**: 3D地图
- **SCSS**: 样式预处理

### 关键特性
1. **响应式设计**: 使用ResponsiveWrapper实现多分辨率适配
2. **模块化开发**: 每个功能模块独立组件
3. **性能优化**: 使用keep-alive缓存组件
4. **数据可视化**: ECharts实现环形图统计
5. **实时更新**: 支持数据实时刷新

## 🚀 使用说明

### 路由访问
```typescript
// 主页访问
router.push('/');

// 或使用路由名称
router.push({ name: 'home' });
```

### 组件使用
```vue
<template>
  <SafetyMonitoringView />
</template>

<script setup>
import SafetyMonitoringView from '@/views/SafetyMonitoring/index.vue';
</script>
```

### 自定义配置
可通过修改各模块组件的data来自定义显示内容:

```javascript
// 修改监测统计数据
const monitoringStats = ref([
  { label: '总数', value: '795', class: 'total' },
  // ... 更多配置
]);

// 修改预警列表
const warningList = ref([
  {
    id: 1,
    level: '严重',
    title: '供水管道压力异常',
    // ... 更多字段
  }
]);
```

## 📊 数据接口

各模块预留了数据接口对接点，可根据实际后端API进行调整:

```javascript
// 示例：获取监测统计数据
async function fetchMonitoringStats() {
  const response = await api.get('/monitoring/stats');
  monitoringStats.value = response.data;
}

// 示例：获取预警列表
async function fetchWarnings(timeRange) {
  const response = await api.get('/warnings', { params: { range: timeRange } });
  warningList.value = response.data;
}
```

## 🎯 功能扩展

### 添加新的监测类型
1. 在 `MonitoringManagementModule.vue` 的 `monitoringStats` 中添加新类型
2. 在表格 `columns` 和 `tableData` 中添加对应字段
3. 添加对应的样式类

### 添加新的预警级别
1. 在 `WarningNotificationModule.vue` 的 `warningStats` 中添加新级别
2. 在 `warningList` 中使用新的级别和颜色
3. 添加对应的样式类

### 添加新的座舱
1. 在 `CockpitManagementModule.vue` 的 `tableData` 中添加新座舱
2. 配置座舱状态和监测数据
3. 实现查看和管理功能

## 🔍 注意事项

1. **性能优化**: 大数据量时建议使用虚拟滚动
2. **实时更新**: 使用WebSocket或定时轮询更新数据
3. **错误处理**: 添加网络请求错误处理和用户提示
4. **权限控制**: 根据用户角色显示不同功能
5. **响应式适配**: 确保在不同分辨率下正常显示

## 📝 开发规范

1. 遵循Vue3 Composition API规范
2. 使用Ant Design色彩体系
3. 保持模块化和组件独立性
4. 添加必要的注释和文档
5. 统一代码格式和命名规范

## 🐛 已知问题

- 暂无

## 🔄 版本历史

### v1.0.0 (2025-11-14)
- ✅ 完成主页面布局
- ✅ 实现左侧三个监测模块
- ✅ 实现右侧预警和座舱模块
- ✅ 集成3D地图组件
- ✅ 配置路由和导航

## 📮 联系方式

如有问题或建议，请联系开发团队。
