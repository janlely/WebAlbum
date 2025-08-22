// 相册相关类型定义

import type { CanvasSize, Theme } from './index';

// 页面元素基础类型
export interface BaseElement {
  id: string;
  type: 'photo' | 'text' | 'shape';
  x: number; // 相对位置 0-1
  y: number; // 相对位置 0-1
  width: number; // 相对宽度 0-1
  height: number; // 相对高度 0-1
  zIndex: number;
  rotation?: number; // 旋转角度
  opacity?: number; // 透明度 0-1
  locked?: boolean; // 是否锁定
}

// 照片元素
export interface PhotoElement extends BaseElement {
  type: 'photo';
  url: string; // 图片数据URL
  originalName?: string;
  
  // 图片调整
  scale?: number; // 缩放比例
  offsetX?: number; // 裁剪偏移X
  offsetY?: number; // 裁剪偏移Y
  
  // 样式
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: string;
  
  // 滤镜
  brightness?: number;
  contrast?: number;
  saturation?: number;
  filter?: 'none' | 'grayscale' | 'sepia' | 'blur';
}

// 文本元素
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  
  // 字体样式
  fontFamily?: string;
  fontSize?: number; // 像素值
  fontWeight?: 'normal' | 'medium' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  
  // 颜色
  color?: string;
  backgroundColor?: string;
  
  // 文本效果
  shadow?: string;
  stroke?: {
    color: string;
    width: number;
  };
}

// 形状元素
export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'line';
  
  // 样式
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

// 页面元素联合类型
export type PageElement = PhotoElement | TextElement | ShapeElement;

// 页面数据结构
export interface AlbumPage {
  id: string;
  albumId: string; // 所属相册ID
  name: string; // 页面名称
  order: number; // 页面顺序
  
  // 模板信息
  templateId?: string; // 基础模板ID
  
  // 页面内容
  elements: PageElement[];
  
  // 页面设置
  backgroundColor?: string;
  backgroundImage?: string;
  
  // 元数据
  createTime: number;
  updateTime: number;
}

// 相册数据结构
export interface Album {
  id: string;
  name: string;
  description?: string;
  
  // 画布设置
  canvasSize: CanvasSize;
  theme: Theme;
  
  // 相册设置
  settings: {
    backgroundColor?: string;
    showGrid?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
    autoSave?: boolean;
    autoSaveInterval?: number; // 自动保存间隔（秒）
  };
  
  // 统计信息
  pageCount: number; // 页面数量
  
  // 元数据
  createTime: number;
  updateTime: number;
  lastEditTime: number;
  
  // 缩略图
  thumbnail?: string; // 封面缩略图
  
  // 标签和分类
  tags?: string[];
  category?: string;
}

// 相册摘要（用于列表显示）
export interface AlbumSummary {
  id: string;
  name: string;
  pageCount: number;
  thumbnail?: string;
  lastEditTime: number;
  canvasSize: CanvasSize;
  theme: Theme;
}

// 页面摘要（用于树形显示）
export interface PageSummary {
  id: string;
  albumId: string;
  name: string;
  order: number;
  thumbnail?: string;
  updateTime: number;
  elementCount: number;
}

// 编辑器状态
export interface EditorState {
  currentAlbumId: string | null;
  currentPageId: string | null;
  selectedElementIds: string[];
  clipboard: PageElement[];
  history: {
    past: any[];
    present: any;
    future: any[];
  };
  isAutoSaving: boolean;
  lastSaveTime: number;
}

// 工具面板状态
export interface ToolPanelState {
  activeTab: 'canvas' | 'templates' | 'elements' | 'properties';
  isCollapsed: boolean;
}

// 项目管理面板状态
export interface ProjectPanelState {
  expandedAlbums: Set<string>;
  isCollapsed: boolean;
  searchQuery: string;
  sortBy: 'name' | 'lastEdit' | 'createTime';
  sortOrder: 'asc' | 'desc';
}
