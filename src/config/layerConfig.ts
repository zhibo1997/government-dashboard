/**
 * 图层配置 — 只存 ID 和前端特有属性
 * URL 由图层树接口动态获取，通过 mapStore.findLayerById() 查找
 */

// 桥梁模型 ID 配置
export const BRIDGE_LAYER_CONFIG = [
  {
    id: '06ad0be1-f8fd-44fb-92ec-be82de6f8f38',
    qlbh: 'LHHDQ',
    image: '莲花湖大桥（莲花湖一号桥主桥）.png',
    equipmentId: 'ad960df4-4bd4-414c-a69c-6257d86982b2',
  },
  {
    id: '919829ed-9c4d-43ae-9a94-1ff0cef22a3f',
    qlbh: 'LYDDLJQ',
    image: '陵园大道立交桥.png',
    equipmentId: 'a046b72f-e018-49db-b6a8-7bd4b91c21cb',
  },
  {
    id: 'ecb4e7b6-6a2e-4948-85b0-0c5975816e07',
    qlbh: 'MYWDQ',
    image: '明月湾大桥（跨莲花湖二号桥）.png',
    equipmentId: '19e96888-190a-45fa-bcc1-c8f90ed6765a',
  },
  {
    id: 'b4cc6305-bfce-4f60-926c-0dff3e7a7a78',
    qlbh: 'DSHDQ',
    image: '独山湖大桥.jpg',
    equipmentId: '430c03ed-dce2-463a-8ce0-02b310b2685c',
  },
]

// 燃气专项父节点 ID — 从该分组下筛选 type=3dTile 的子节点
export const GAS_LAYER_PARENT_ID = '9821ec73-3e97-4a72-a205-ae7e5c269ff3'

// 默认建筑群模型 ID — 从三维模型分组中查找
export const DEFAULT_BUILDING_LAYER_ID = '28e7c821-50f4-454d-a565-5e2c10f95110'
