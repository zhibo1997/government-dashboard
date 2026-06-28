# 图层树 API 数据结构

## 请求参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `SszxCode` | 水务专项代码（可选，空=全部） | `csaqzx_ql`（桥梁） |

## 响应结构

```typescript
interface LayerNode {
  id: string              // 唯一标识
  sszxCode: string | null // 专项代码
  name: string            // 图层名称
  parentId: string | null // 父节点 ID
  type: '3dTile' | 'mvt' | 'group' | 'specialLayer'
  url: string | null      // 瓦片/样式 URL
  visible: string | null  // "1"=可见
  opacity: string | null  // 透明度
  sortOrder: number       // 排序
  common: string | null   // "1"=通用图层
  child: LayerNode[] | null
}
```

## type 分类说明

| type | 说明 | url 示例 |
|------|------|----------|
| `3dTile` | 3D Tiles 模型 | `https://webres.cityfun.com.cn/CSSMX/model/xxx/tileset.json` |
| `mvt` | Mapbox 矢量切片样式 | `/layer/bridgelayer_1/style` |
| `group` | 分组文件夹 | — |
| `specialLayer` | 特殊图层（监测点） | 设备类型编码 `sblx` |

## 桥梁专项图层结构（ID 映射）

基于 `tmp/data1.json` 整理：

### 桥梁模型（id → 桥梁名称 → tileset URL）

| ID | 名称 | URL |
|----|------|-----|
| `cea5650d-878b-4440-834b-64ddbc5ddf93` | 莲花湖大桥 | `.../LHQ/tileset.json` |
| `919829ed-9c4d-43ae-9a94-1ff0cef22a3f` | 陵园大道立交桥 | `.../LYDDLJQ/tileset.json` |
| `ecb4e7b6-6a2e-4948-85b0-0c5975816e07` | 明月湾大桥 | `.../MYWDQ/tileset.json` |
| `b4cc6305-bfce-4f60-926c-0dff3e7a7a78` | 独山湖大桥 | `.../DSHDQ/tileset.json` |

### 监测设备（equipmentId → 设备名称 → tileset URL）

| ID | 名称 | URL |
|----|------|-----|
| `ad960df4-4bd4-414c-a69c-6257d86982b2` | 莲花湖大桥设备 | `.../LHQ_SB/tileset.json` |
| `088c8814-cb09-41e8-bc87-ffa6a49ea94a` | 陵园大道立交桥传感设备 | `.../LYDDLJQ_CGSB/tileset.json` |
| `19e96888-190a-45fa-bcc1-c8f90ed6765a` | 明月湾大桥设备 | `.../MYWDQ_SB/tileset.json` |
| `430c03ed-dce2-463a-8ce0-02b310b2685c` | 独山湖大桥设备 | `.../DSHDQ_SB/tileset.json` |

### 监控设备（monitorId → 设备名称 → tileset URL）

| ID | 名称 | URL |
|----|------|-----|
| `357c8870-5013-43e7-af73-547e01bb9809` | 莲花湖大桥监控设备 | `.../LHQ_JKSB/tileset.json` |
| `d2fc0dc7-0b20-471e-86c0-bda308d35edd` | 陵园大道立交桥监控 | `.../LYDDLJQ_JKSB/tileset.json` |
| `911a8a6d-bbd2-425f-aab2-b1f8956a0417` | 明月湾大桥监控设备 | `.../MYWDQ_JKSB/tileset.json` |
| `29ed01bd-c99a-4667-a54b-ac245724c2dc` | 独山湖大桥监控及基站 | `.../DSHDQ_JKJJZ/tileset.json` |

### 其他图层

| ID | 名称 | URL |
|----|------|-----|
| `28e7c821-50f4-454d-a565-5e2c10f95110` | 默认建筑群白膜 | （从图层树获取） |
| `f898d75c-77c2-4339-b5f9-48b811664923` | MVT 桥梁图层 | `/layer/bridgelayer_1/style` |

## specialLayer 设备类型

图层树中的 `specialLayer` 节点代表监测设备分类，其 `url` 字段为设备类型编码（`sblx`），用于调用监测数据 API。

## 使用方式

```typescript
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()
await mapStore.loadLayerTree()  // 确保已加载

// 按 ID 查找图层
const layer = mapStore.findLayerById('cea5650d-...')
console.log(layer.url)  // tileset URL

// 图层树数据来源
const tree = mapStore.layerTree  // 响应式数据
```

## 数据来源

- `data1.json` — `curl http://localhost:5173/clapi/layer/tree`（2026-06-27）
