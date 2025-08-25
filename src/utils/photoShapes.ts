// 图片形状工具函数
import type { PhotoShapeType } from '../types';

// 形状定义
export interface PhotoShapeDefinition {
  name: string;
  description: string;
  clipPath: string;
  icon: string; // 图标的SVG路径或字符
}

// 预定义的图片形状
export const photoShapes: Record<PhotoShapeType, PhotoShapeDefinition> = {
  rectangle: {
    name: '矩形',
    description: '经典的矩形图片框',
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    icon: '⬜'
  },
  circle: {
    name: '圆形',
    description: '圆形图片框，初始为正圆，可调整为椭圆',
    clipPath: 'ellipse(50% 50% at 50% 50%)',
    icon: '⭕'
  },
  triangle: {
    name: '三角形',
    description: '三角形图片框，现代感设计',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    icon: '🔺'
  },
  hexagon: {
    name: '六边形',
    description: '六边形图片框，蜂窝效果',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    icon: '⬢'
  },
  star: {
    name: '星形',
    description: '五角星图片框，突出重点',
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    icon: '⭐'
  },
  heart: {
    name: '心形',
    description: '心形图片框，温馨浪漫',
    clipPath: 'path("M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z")',
    icon: '❤️'
  },
  diamond: {
    name: '菱形',
    description: '菱形图片框，优雅设计',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    icon: '💎'
  }
};

// 获取形状的CSS样式
export const getPhotoShapeStyle = (shape: PhotoShapeType = 'rectangle') => {
  const shapeDefinition = photoShapes[shape];
  return {
    clipPath: shapeDefinition.clipPath
  };
};

// 获取形状列表（用于UI选择器）
export const getPhotoShapeOptions = (): Array<{ value: PhotoShapeType; label: string; icon: string; description: string }> => {
  return Object.entries(photoShapes).map(([key, shape]) => ({
    value: key as PhotoShapeType,
    label: shape.name,
    icon: shape.icon,
    description: shape.description
  }));
};

// 检查是否为有效的形状类型
export const isValidPhotoShape = (shape: string): shape is PhotoShapeType => {
  return shape in photoShapes;
};
