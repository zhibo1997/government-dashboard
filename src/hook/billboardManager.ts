/**
 * Billboard管理模块
 * @description 使用BillboardCollection管理监测点Billboard，实现防重叠算法和智能渲染
 */

import type { EnhancedMonitoringPoint } from "./useMonitoringPoints";
import BillboardContentBg from "@/assets/map/popup_content.webp";
import BillboardArrow from "@/assets/map/popup_title.webp";
import TimeIcon from "@/assets/map/date_icon.webp";

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

  // Canvas尺寸设置 - 缩放系数0.8
  const width = 230;
  const padding = 10;
  const headerHeight = 34;
  const lineHeight = 23;

  // 确保 parsedJcz 是有效数组
  const dataRows = Array.isArray(point.parsedJcz) ? Math.max(1, point.parsedJcz.length) : 1;
  // 内容区 = 设备名称行 + 数据行
  const contentBodyHeight = (1 + dataRows) * lineHeight + padding * 2;
  const height = Math.max(1, headerHeight + contentBodyHeight);

  canvas.width = width;
  canvas.height = height;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 1. 绘制头部背景 - 水平渐变 (左0.85 → 中1.0 → 右0.85)
  const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
  headerGrad.addColorStop(0, "rgba(6, 30, 52, 0.85)");
  headerGrad.addColorStop(0.5, "rgba(6, 30, 52, 1)");
  headerGrad.addColorStop(1, "rgba(6, 30, 52, 0.85)");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, width, headerHeight);

  // 2. 绘制时间图标
  const iconSize = 19;
  const iconY = (headerHeight - iconSize) / 2;
  if (resources.timeIcon.complete && resources.timeIcon.naturalWidth > 0) {
    ctx.drawImage(resources.timeIcon, padding, iconY, iconSize, iconSize);
  }

  // 3. 绘制时间文字
  ctx.fillStyle = '#3FFFFF';
  ctx.font = '500 19px "Source Han Sans SC", "Microsoft YaHei", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  const timeTextX = padding + iconSize + 4;
  ctx.fillText(point.formattedTime || '-', timeTextX, headerHeight / 2);

  // 4. 绘制内容背景 - 水平渐变 (左0.85 → 中1.0 → 右0.85)
  const contentGrad = ctx.createLinearGradient(0, 0, width, 0);
  contentGrad.addColorStop(0, "rgba(6, 30, 52, 0.85)");
  contentGrad.addColorStop(0.5, "rgba(6, 30, 52, 1)");
  contentGrad.addColorStop(1, "rgba(6, 30, 52, 0.85)");
  ctx.fillStyle = contentGrad;
  ctx.fillRect(0, headerHeight - 2, width, contentBodyHeight);

  // 5. 绘制设备名称（内容区第一行）
  let yOffset = headerHeight + padding + lineHeight / 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 18px "Source Han Sans SC", "Microsoft YaHei", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const sbmcText = point.sbmc || point.sbbh || '-';
  ctx.fillText(sbmcText, padding, yOffset);
  yOffset += lineHeight;

  // 6. 绘制监测数据
  if (Array.isArray(point.parsedJcz) && point.parsedJcz.length > 0) {
    const bulletRadius = 3;
    const bulletOuterRadius = 4;
    const bulletX = padding + 6;
    const labelX = bulletX + bulletOuterRadius + 8;

    point.parsedJcz.forEach((item) => {
      // 绘制圆点装饰
      ctx.save();
      ctx.shadowColor = "rgba(0, 246, 255, 0.9)";
      ctx.shadowBlur = 6;
      ctx.fillStyle = "#00F6FF";
      ctx.beginPath();
      ctx.arc(bulletX, yOffset, bulletRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bulletX, yOffset, bulletOuterRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 绘制指标名称
      ctx.fillStyle = '#E4F3FF';
      ctx.font = '500 18px "Source Han Sans SC", "Microsoft YaHei", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const nameText = `${item.name}${item.unit ? `(${item.unit})` : ""}`;
      ctx.fillText(nameText, labelX, yOffset);

      // 绘制指标值
      const valueText = String(item.value ?? '-');

      ctx.font = '18px "YouSheBiaoTiYuan", "Microsoft YaHei", Arial, sans-serif';
      const valueWidth = Math.max(1, ctx.measureText(valueText).width);
      const valueX = width - padding - 10;

      // 创建渐变色
      const gradient = ctx.createLinearGradient(valueX - valueWidth, yOffset - 9, valueX, yOffset + 9);
      gradient.addColorStop(0, "#3FFEFD");
      gradient.addColorStop(1, "#FFF407");
      ctx.fillStyle = gradient;

      ctx.textAlign = 'right';
      ctx.fillText(valueText, valueX, yOffset);

      yOffset += lineHeight;
    });
  }

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
