/*
 * @Author: Do not edit
 * @Date: 2025-10-16 20:57:09
 * @LastEditors: 王志博
 * @LastEditTime: 2025-11-04 21:45:00
 * @Description: 
 */
// 地图相关配置
export const mapConfig = {
  // 地图中心点坐标（阳新县）
  center: [115.186322, 29.864861] as [number, number],

  // 默认缩放级别
  zoom: 11,

  // 初始相机视角（修改这里即可调整默认视角）
  initialCamera: {
    center: [115.206458, 29.834871] as [number, number],
    height: 1099.05,
    heading: 21.17,
    pitch: -29.76,
  },

  // 全域视角（正视图，展示阳新县全域）
  fullDomainCamera: {
    center: [115.227262, 29.850032] as [number, number],
    height: 11447.60,
    heading: 360,
    pitch: -90,
  },
  
  // 相机平移范围限制（阳新县范围）
  cameraBounds: {
    west: 114.8,   // 西边界（最小经度）
    south: 29.4,   // 南边界（最小纬度）
    east: 115.6,   // 东边界（最大经度）
    north: 30.2,   // 北边界（最大纬度）
    buffer: 0.1,   // 边界缓冲距离（度）
    smoothCorrection: false,  // 立即修正，避免死循环（如需平滑效果可改为true，但可能导致重复触发）
    minHeight: 10000,    // 最小高度10km（最大放大级别）
    maxHeight: 150000    // 最大高度150km（最小放大级别，确保能看到整个阳新县）
  },
  
  // 天地图配置
  tianditu: {
    // 默认底图类型
    defaultType: "vec" as "vec" | "img" | "ter",
    
    // 缩放级别限制
    minZoom: 3,
    maxZoom: 15,
  },
};

export default mapConfig;