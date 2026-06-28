/**
 * 图层配置 — 只存 ID 和前端特有属性
 * URL 由图层树接口动态获取，通过 mapStore.findLayerById() 查找
 */

// 桥梁模型 ID 配置
export const BRIDGE_LAYER_CONFIG = [
  {
    id: 'cea5650d-878b-4440-834b-64ddbc5ddf93',
    qlbh: 'LHHDQ',
    image: '莲花湖大桥（莲花湖一号桥主桥）.png',
    equipmentId: 'ad960df4-4bd4-414c-a69c-6257d86982b2',  // 莲花湖大桥设备 (LHQ_SB)
    monitorId: '357c8870-5013-43e7-af73-547e01bb9809',     // 莲花湖大桥监控设备 (LHQ_JKSB)
  },
  {
    id: '919829ed-9c4d-43ae-9a94-1ff0cef22a3f',
    qlbh: 'LYDDLJQ',
    image: '陵园大道立交桥.png',
    equipmentId: '088c8814-cb09-41e8-bc87-ffa6a49ea94a',  // 陵园大道立交桥传感设备 (LYDDLJQ_CGSB)
    monitorId: 'd2fc0dc7-0b20-471e-86c0-bda308d35edd',     // 陵园大道立交桥监控 (LYDDLJQ_JKSB)
  },
  {
    id: 'ecb4e7b6-6a2e-4948-85b0-0c5975816e07',
    qlbh: 'MYWDQ',
    image: '明月湾大桥（跨莲花湖二号桥）.png',
    equipmentId: '19e96888-190a-45fa-bcc1-c8f90ed6765a',  // 明月湾大桥设备 (MYWDQ_SB)
    monitorId: '911a8a6d-bbd2-425f-aab2-b1f8956a0417',     // 明月湾大桥监控设备 (MYWDQ_JKSB)
  },
  {
    id: 'b4cc6305-bfce-4f60-926c-0dff3e7a7a78',
    qlbh: 'DSHDQ',
    image: '独山湖大桥.jpg',
    equipmentId: '430c03ed-dce2-463a-8ce0-02b310b2685c',  // 独山湖大桥设备 (DSHDQ_SB)
    monitorId: '29ed01bd-c99a-4667-a54b-ac245724c2dc',     // 独山湖大桥监控及基站 (DSHDQ_JKJJZ)
  },
]

// 燃气专项父节点 ID — 从该分组下筛选 type=3dTile 的子节点
export const GAS_LAYER_PARENT_ID = '9821ec73-3e97-4a72-a205-ae7e5c269ff3'

// 默认建筑群模型 ID — 从三维模型分组中查找
export const DEFAULT_BUILDING_LAYER_ID = '28e7c821-50f4-454d-a565-5e2c10f95110'
