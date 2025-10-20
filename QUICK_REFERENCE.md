<!--
 * @Author: Do not edit
 * @Date: 2025-10-20 22:45:12
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 22:45:15
 * @Description: 
-->
# 🚀 MapLibre GL 快速参考

## 一键安装

```bash
npm install --save-dev @types/maplibre-gl@^5.9.0 && npm install
```

## 主要变更

| 类别 | 之前 | 之后 |
|------|------|------|
| 包名 | `@cgcs2000/mapbox-gl` | `maplibre-gl` |
| 类型 | `@types/mapbox-gl` | `@types/maplibre-gl` |
| CSS | 无 | `import 'maplibre-gl/dist/maplibre-gl.css'` |

## API 差异速查

### loadImage (Promise化)

```typescript
// ❌ 旧 API (回调)
map.loadImage(url, (err, img) => {
  if (!err) map.addImage(id, img)
})

// ✅ 新 API (Promise)
map.loadImage(url).then(img => {
  if (img) map.addImage(id, img.data)
})
```

### 样式类型

```typescript
// ❌ 直接传入
style: baseStyle

// ✅ 类型断言
style: baseStyle as any
```

### deck.gl 集成

```typescript
// ❌ 直接传入
load3DTiles(overlay, map, options)

// ✅ 类型断言
load3DTiles(overlay, map as any, options)
```

## 测试要点

- ✅ 地图显示
- ✅ 底图切换
- ✅ 图层加载
- ✅ 测量工具
- ✅ 3D 模型

## 常见问题

**Q: 控件无样式?**  
A: 检查 `main.js` 是否导入了 CSS

**Q: TypeScript 报错?**  
A: 使用 `as any` 临时解决类型问题

**Q: deck.gl 不兼容?**  
A: 传递 map 实例时使用 `as any`

## 文档

- 📖 [完整迁移指南](./MAPLIBRE_MIGRATION_GUIDE.md)
- ✅ [检查清单](./MIGRATION_CHECKLIST.md)
- 📊 [迁移总结](./MIGRATION_SUMMARY.md)
