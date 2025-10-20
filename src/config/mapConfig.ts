/*
 * @Author: Do not edit
 * @Date: 2025-10-16 20:57:09
 * @LastEditors: 王志博
 * @LastEditTime: 2025-10-20 23:01:12
 * @Description: 
 */
// 地图相关配置
export const mapConfig = {
  // 地图中心点坐标（阳新县）
  center: [115.186322, 29.864861] as [number, number],
  
  // 默认缩放级别
  zoom: 11,
  
  // 图层数据源URL配置
  layerUrls: {
    // 桥梁设施图层
    bridge: "https://webres.cityfun.com.cn/CSSMX/CSSMX_ZT/gspsp_dtrans_bridgebscinfo.json",
    
    // 井盖设施图层
    manhole: "https://webres.cityfun.com.cn/CSSMX/CSSMX_ZT/gspsp_dtrans_manholecoverbasetinfo.json",
  },
  
  // 天地图配置
  tianditu: {
    // 默认底图类型
    defaultType: "vec" as "vec" | "img" | "ter",
    
    // 缩放级别限制
    minZoom: 3,
    maxZoom: 15,
  },
  
  // 样式配置
  styles: {
    // 字体和图标资源
    glyphs: "https://webres.cityfun.com.cn/CSSMX/CSSMX_ZT/fonts/{fontstack}/{range}.pbf",
    sprite: "https://webres.cityfun.com.cn/CSSMX/CSSMX_ZT/sprites/sprite",
  }
};

export default mapConfig;