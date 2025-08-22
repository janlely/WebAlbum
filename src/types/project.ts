// 用户项目和页面实例相关类型定义

import type { Theme } from './theme';
import type { PageTemplate } from './pageTemplate';

// 画布尺寸定义
export interface CanvasSize {
  id: string;
  name: string;
  width: number; // 像素
  height: number; // 像素
  aspectRatio: string;
  description: string;
  category: 'standard' | 'social' | 'print';
  isPopular?: boolean;
}

// 预设画布尺寸
export const defaultCanvasSizes: CanvasSize[] = [
  {
    id: 'canvas_a4_portrait',
    name: 'A4 竖版',
    width: 210,
    height: 297,
    aspectRatio: '3:4',
    description: 'A4纸张竖版尺寸',
    category: 'print',
    isPopular: true
  },
  {
    id: 'canvas_a4_landscape',
    name: 'A4 横版',
    width: 297,
    height: 210,
    aspectRatio: '4:3',
    description: 'A4纸张横版尺寸',
    category: 'print'
  },
  {
    id: 'canvas_square',
    name: '正方形',
    width: 300,
    height: 300,
    aspectRatio: '1:1',
    description: '正方形画布',
    category: 'standard',
    isPopular: true
  },
  {
    id: 'canvas_16_9',
    name: '16:9 横版',
    width: 400,
    height: 225,
    aspectRatio: '16:9',
    description: '宽屏横版比例',
    category: 'standard',
    isPopular: true
  },
  {
    id: 'canvas_9_16',
    name: '9:16 竖版',
    width: 225,
    height: 400,
    aspectRatio: '9:16',
    description: '手机竖版比例',
    category: 'social'
  }
];

// 用户添加的照片数据
export interface PhotoData {
  id: string;
  url: string; // 图片数据URL
  frameId: string; // 对应的框架ID
  pageId: string; // 所属页面ID
  
  // 图片调整参数
  scale?: number; // 缩放比例
  offsetX?: number; // 水平偏移
  offsetY?: number; // 垂直偏移
  rotation?: number; // 旋转角度
  
  // 元数据
  originalName?: string;
  uploadTime: number;
}

// 用户添加的文本数据
export interface TextData {
  id: string;
  content: string;
  frameId: string; // 对应的框架ID
  pageId: string; // 所属页面ID
  
  // 文本格式化
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  
  // 颜色
  color?: string;
  backgroundColor?: string;
  
  // 创建时间
  createTime: number;
  updateTime: number;
}

// 页面实例（用户创建的具体页面）
export interface PageInstance {
  id: string;
  name: string; // 用户可以给页面命名
  templateId: string; // 基于哪个页面模板
  order: number; // 在照片书中的顺序
  
  // 页面内容
  photos: PhotoData[];
  texts: TextData[];
  
  // 页面设置
  backgroundColor?: string;
  backgroundImage?: string;
  
  // 元数据
  createTime: number;
  updateTime: number;
}

// 照片书项目
export interface PhotoBookProject {
  id: string;
  name: string;
  description?: string;
  
  // 基础设置
  canvasSize: CanvasSize;
  theme: Theme;
  
  // 页面列表
  pages: PageInstance[];
  
  // 项目设置
  settings: {
    showGrid?: boolean; // 是否显示网格
    snapToGrid?: boolean; // 是否对齐网格
    gridSize?: number; // 网格大小
    backgroundColor?: string; // 全局背景色
  };
  
  // 元数据
  createTime: number;
  updateTime: number;
  lastEditTime: number;
  
  // 版本控制
  version: string;
  
  // 导出历史
  exportHistory?: {
    format: 'pdf' | 'jpg' | 'png';
    timestamp: number;
    settings: any;
  }[];
}

// 项目创建配置
export interface ProjectCreateConfig {
  name: string;
  canvasSize: CanvasSize;
  theme: Theme;
  initialTemplate?: PageTemplate; // 初始页面模板
}

// 项目导出配置
export interface ExportConfig {
  format: 'pdf' | 'jpg' | 'png';
  quality: number; // 0-1
  includeBleed?: boolean; // 是否包含出血
  colorSpace: 'sRGB' | 'CMYK';
  compression?: boolean;
}
