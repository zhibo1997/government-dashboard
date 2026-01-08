/**
 * Billboard管理模块
 * @description 使用BillboardCollection管理监测点Billboard，实现防重叠算法和智能渲染
 */

import type { EnhancedMonitoringPoint } from "./useMonitoringPoints";

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
  const width = 180;
  const padding = 8;
  const lineHeight = 18;
  const headerHeight = 22;
  const arrowHeight = 10; // 三角箭头高度

  // 计算需要的高度
  const dataRows = point.parsedJcz.length;
  // 增加一行用于显示设备类型
  const contentHeight =
    headerHeight + (dataRows + 1) * lineHeight + padding * 2;
  const height = contentHeight + arrowHeight;

  canvas.width = width;
  canvas.height = height;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 保存上下文状态
  ctx.save();

  // 创建圆角矩形路径（包含底部三角箭头）
  const radius = 4;
  const arrowWidth = 16;
  const arrowCenterX = width / 2;

  ctx.beginPath();
  // 顶部左圆角
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  // 顶部右圆角
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, contentHeight - radius);
  // 底部右圆角
  ctx.quadraticCurveTo(width, contentHeight, width - radius, contentHeight);

  // 底部右边到箭头右侧
  ctx.lineTo(arrowCenterX + arrowWidth / 2, contentHeight);
  // 箭头尖端
  ctx.lineTo(arrowCenterX, contentHeight + arrowHeight);
  // 箭头左侧
  ctx.lineTo(arrowCenterX - arrowWidth / 2, contentHeight);

  // 底部左边
  ctx.lineTo(radius, contentHeight);
  // 底部左圆角
  ctx.quadraticCurveTo(0, contentHeight, 0, contentHeight - radius);
  ctx.lineTo(0, radius);
  // 顶部左圆角
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  // 裁剪区域
  ctx.clip();

  // 绘制渐变背景（加深透明度）
  const gradient = ctx.createLinearGradient(0, 0, width, contentHeight);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  gradient.addColorStop(0.25, "rgba(249, 255, 252, 0.9)");
  gradient.addColorStop(0.5, "rgba(227, 255, 240, 0.9)");
  gradient.addColorStop(1, "rgba(179, 253, 214, 0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 恢复上下文（移除裁剪）
  ctx.restore();

  // 绘制边框
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(radius, 0.5);
  ctx.lineTo(width - radius, 0.5);
  ctx.quadraticCurveTo(width - 0.5, 0.5, width - 0.5, radius);
  ctx.lineTo(width - 0.5, contentHeight - radius);
  ctx.quadraticCurveTo(
    width - 0.5,
    contentHeight - 0.5,
    width - radius,
    contentHeight - 0.5
  );
  ctx.lineTo(arrowCenterX + arrowWidth / 2, contentHeight - 0.5);
  ctx.lineTo(arrowCenterX, contentHeight + arrowHeight - 0.5);
  ctx.lineTo(arrowCenterX - arrowWidth / 2, contentHeight - 0.5);
  ctx.lineTo(radius, contentHeight - 0.5);
  ctx.quadraticCurveTo(0.5, contentHeight - 0.5, 0.5, contentHeight - radius);
  ctx.lineTo(0.5, radius);
  ctx.quadraticCurveTo(0.5, 0.5, radius, 0.5);
  ctx.stroke();

  // 绘制顶部时间栏背景
  ctx.fillStyle = "rgba(245, 245, 245, 0.9)";
  ctx.fillRect(0, 0, width, headerHeight);

  // 绘制时间栏分隔线
  ctx.strokeStyle = "rgba(239, 239, 239, 0.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(width, headerHeight);
  ctx.stroke();

  // 绘制时间文字
  ctx.fillStyle = '#333'  // 加深颜色
  ctx.font = '10px Arial, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(`🕐 ${point.formattedTime}`, padding, headerHeight / 2)
  
  // 绘制监测数据
  point.parsedJcz.forEach((item) => {
    // 绘制指标名称
    ctx.fillStyle = '#444'  // 加深颜色
    ctx.font = '10px Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${item.name}：`, padding, yOffset)
    
    // 绘制指标值
    ctx.fillStyle = '#0066cc'  // 加深蓝色
    ctx.font = 'bold 12px Arial, sans-serif'
    const labelWidth = ctx.measureText(`${item.name}：`).width
    ctx.fillText(String(item.value), padding + labelWidth, yOffset)
    
    // 绘制单位
    if (item.unit) {
      ctx.fillStyle = '#666'  // 加深颜色
      ctx.font = '10px Arial, sans-serif'
      const valueWidth = ctx.measureText(String(item.value)).width
      ctx.fillText(item.unit, padding + labelWidth + valueWidth + 2, yOffset)
    }
    
    yOffset += lineHeight
  })
  
  return canvas
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
