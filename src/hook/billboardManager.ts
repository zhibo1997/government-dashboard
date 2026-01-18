/**
 * Billboard管理模块
 * @description 使用BillboardCollection管理监测点Billboard，实现防重叠算法和智能渲染
 */

import type { EnhancedMonitoringPoint } from "./useMonitoringPoints";
import BillboardContentBg from "@/assets/img/homeModule/billboard_content.webp";
import BillboardArrow from "@/assets/img/homeModule/billboard_header.webp";
import TimeIcon from "@/assets/img/homeModule/time_icon.webp";

// 预加载图片资源
const resources = {
  contentBg: new Image(),
  headerBg: new Image(),
  timeIcon: new Image(),
};

resources.contentBg.src = BillboardContentBg;
resources.headerBg.src = BillboardArrow;
resources.timeIcon.src = TimeIcon;

/**
 * 屏幕坐标
 */
interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * Billboard项
 */
interface BillboardItem {
  point: EnhancedMonitoringPoint;
  screenPosition: ScreenPosition;
  billboard: any; // Cesium.Billboard
}

/**
 * 防重叠配置
 */
interface AntiOverlapConfig {
  minDistance: number; // 最小距离（像素）
  enabled: boolean;
}

/**
 * 创建带箭头的Billboard Canvas
 * @param point 监测点数据
 * @returns Canvas元素
 */
export function createBillboardCanvasWithArrow(
  point: EnhancedMonitoringPoint
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Canvas尺寸设置
  const width = 220; // 加宽以适应新样式
  const padding = 10;
  const lineHeight = 24; // 增加行高
  const headerHeight = 36; // 增加头部高度
  
  // 计算内容高度
  const dataRows = point.parsedJcz.length;
  const contentBodyHeight = dataRows * lineHeight + padding * 2;
  const height = headerHeight + contentBodyHeight;

  canvas.width = width;
  canvas.height = height;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 1. 绘制头部背景
  if (resources.headerBg.complete && resources.headerBg.naturalWidth > 0) {
    ctx.drawImage(resources.headerBg, 0, 0, width, headerHeight);
  } else {
    // 降级渲染：头部背景
    ctx.fillStyle = "rgba(0, 50, 100, 0.8)";
    ctx.fillRect(0, 0, width, headerHeight);
  }

  // 2. 绘制内容背景
  if (resources.contentBg.complete && resources.contentBg.naturalWidth > 0) {
    ctx.drawImage(resources.contentBg, 0, headerHeight, width, contentBodyHeight);
  } else {
    // 降级渲染：内容背景
    ctx.fillStyle = "rgba(0, 20, 40, 0.8)";
    ctx.fillRect(0, headerHeight, width, contentBodyHeight);
  }

  // 3. 绘制时间图标
  const iconSize = 16;
  const iconY = (headerHeight - iconSize) / 2;
  if (resources.timeIcon.complete && resources.timeIcon.naturalWidth > 0) {
    ctx.drawImage(resources.timeIcon, padding, iconY, iconSize, iconSize);
  }

  // 4. 绘制时间文字
  ctx.fillStyle = '#00F6FF'; // 亮青色
  ctx.font = '14px "Microsoft YaHei", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  // 时间文字位置：图标右侧
  const timeTextX = padding + iconSize + 8;
  ctx.fillText(point.formattedTime, timeTextX, headerHeight / 2);

  // 5. 绘制分割线 (可选，如果背景图自带分割线则不需要，这里为了保险加一个淡淡的线)
  // ctx.strokeStyle = "rgba(0, 246, 255, 0.3)";
  // ctx.beginPath();
  // ctx.moveTo(0, headerHeight);
  // ctx.lineTo(width, headerHeight);
  // ctx.stroke();

  // 6. 绘制监测数据
  let yOffset = headerHeight + padding + lineHeight / 2;
  
  point.parsedJcz.forEach((item) => {
    // 绘制指标名称 (白色)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px "Microsoft YaHei", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // 名称 + 单位
    const nameText = `${item.name}${item.unit ? `(${item.unit})` : ""}`;
    ctx.fillText(nameText, padding + 10, yOffset);
      
    // 绘制指标值 (渐变色或高亮色)
    const valueText = String(item.value);
    
    // 计算值的宽度以便右对齐
    ctx.font = 'bold 16px "Microsoft YaHei", Arial, sans-serif'; // 值字体稍大
    const valueWidth = ctx.measureText(valueText).width;
    const valueX = width - padding - 10;
    
    // 创建值的渐变色
    const gradient = ctx.createLinearGradient(valueX - valueWidth, yOffset - 10, valueX, yOffset + 10);
    gradient.addColorStop(0, "#00F6FF"); // 青色
    gradient.addColorStop(1, "#F9FF00"); // 黄色
    ctx.fillStyle = gradient;
    
    ctx.textAlign = 'right';
    ctx.fillText(valueText, valueX, yOffset);
    
    yOffset += lineHeight;
  });
  
  return canvas;
}

/**
 * 计算两点之间的屏幕距离
 */
function calculateScreenDistance(
  pos1: ScreenPosition,
  pos2: ScreenPosition
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 防重叠算法：过滤掉距离过近的Billboard
 * @param items Billboard项数组
 * @param config 防重叠配置
 * @returns 过滤后的Billboard项数组
 */
export function filterOverlappingBillboards(
  items: BillboardItem[],
  config: AntiOverlapConfig
): BillboardItem[] {
  if (!config.enabled || items.length === 0) {
    return items;
  }

  const result: BillboardItem[] = [];
  const { minDistance } = config;

  for (const item of items) {
    let canAdd = true;

    // 检查与已添加的Billboard的距离
    for (const addedItem of result) {
      const distance = calculateScreenDistance(
        item.screenPosition,
        addedItem.screenPosition
      );
      if (distance < minDistance) {
        canAdd = false;
        break;
      }
    }

    if (canAdd) {
      result.push(item);
    }
  }

  console.log(
    `🔍 防重叠过滤: ${items.length} -> ${result.length} (过滤掉 ${items.length - result.length} 个)`
  );
  return result;
}

/**
 * 将世界坐标转换为屏幕坐标
 */
export function worldToScreen(
  viewer: any,
  longitude: number,
  latitude: number
): ScreenPosition | null {
  const Cesium = (window as any).Cesium;
  if (!Cesium || !viewer) return null;

  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
  const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    viewer.scene,
    position
  );

  return screenPosition ? { x: screenPosition.x, y: screenPosition.y } : null;
}

/**
 * 获取当前相机高度
 */
export function getCameraHeight(viewer: any): number {
  if (!viewer) return Infinity;

  const Cesium = (window as any).Cesium;
  if (!Cesium) return Infinity;

  const cameraPosition = viewer.camera.positionCartographic;
  return cameraPosition.height;
}
