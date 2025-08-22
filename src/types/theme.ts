// 风格主题相关类型定义

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  background: string;
  surface: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string; // 主题预览图
  
  // 背景样式
  backgroundColor: string;
  backgroundGradient?: string;
  backgroundPattern?: string;
  
  // 颜色方案
  colorScheme: ColorScheme;
  
  // 字体设置
  fontFamily: string;
  fontWeights: {
    normal: number;
    medium: number;
    bold: number;
  };
  
  // 边框和阴影
  borderRadius: number;
  shadowStyle: string;
  
  // 分类标签
  category: 'elegant' | 'modern' | 'vintage' | 'minimal' | 'creative';
  
  // 是否为内置主题
  isBuiltIn: boolean;
}

// 预设主题数据
export const defaultThemes: Theme[] = [
  {
    id: 'elegant-classic',
    name: '优雅经典',
    description: '经典优雅的设计风格，适合正式场合',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjhGOUZBIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMSIvPgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RWxlZ2FudDwvdGV4dD4KPC9zdmc+',
    backgroundColor: '#FFFFFF',
    backgroundGradient: 'linear-gradient(to bottom, #FFFFFF, #F8F9FA)',
    colorScheme: {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#8B5CF6',
      text: '#111827',
      textLight: '#6B7280',
      background: '#FFFFFF',
      surface: '#F8F9FA'
    },
    fontFamily: 'serif',
    fontWeights: { normal: 400, medium: 500, bold: 700 },
    borderRadius: 8,
    shadowStyle: '0 1px 3px rgba(0, 0, 0, 0.1)',
    category: 'elegant',
    isBuiltIn: true
  },
  {
    id: 'modern-minimal',
    name: '现代简约',
    description: '简洁现代的设计风格，注重留白和几何美感',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjMF0RjQiIHN0cm9rZT0iIzNGOTRGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzRjk0RkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1vZGVybjwvdGV4dD4KPC9zdmc+',
    backgroundColor: '#FFFFFF',
    backgroundGradient: 'linear-gradient(135deg, #FFFFFF, #F3F4F6)',
    colorScheme: {
      primary: '#3F94FF',
      secondary: '#6B7280',
      accent: '#10B981',
      text: '#1F2937',
      textLight: '#6B7280',
      background: '#FFFFFF',
      surface: '#F3F4F6'
    },
    fontFamily: 'sans-serif',
    fontWeights: { normal: 400, medium: 500, bold: 600 },
    borderRadius: 12,
    shadowStyle: '0 4px 6px rgba(0, 0, 0, 0.07)',
    category: 'modern',
    isBuiltIn: true
  },
  {
    id: 'vintage-warm',
    name: '复古暖调',
    description: '温暖的复古色调，营造怀旧温馨的氛围',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkVGN0VEIi8+CjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRkZFREM5IiBzdHJva2U9IiNEOTdENkIiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iI0Q5N0U2QiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmludGFnZTwvdGV4dD4KPC9zdmc+',
    backgroundColor: '#FEF7ED',
    backgroundGradient: 'linear-gradient(to bottom, #FEF7ED, #FFEDC9)',
    colorScheme: {
      primary: '#D97E6B',
      secondary: '#A0683A',
      accent: '#F59E0B',
      text: '#92400E',
      textLight: '#A0683A',
      background: '#FEF7ED',
      surface: '#FFEDC9'
    },
    fontFamily: 'serif',
    fontWeights: { normal: 400, medium: 500, bold: 700 },
    borderRadius: 6,
    shadowStyle: '0 2px 4px rgba(217, 126, 107, 0.15)',
    category: 'vintage',
    isBuiltIn: true
  },
  {
    id: 'fresh-nature',
    name: '清新自然',
    description: '清新的自然色调，带来舒适宁静的感觉',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGREY0Ii8+CjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRENGQ0U3IiBzdHJva2U9IiM2M0I2N0IiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjNCNjdCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OYXR1cmU8L3RleHQ+Cjwvc3ZnPg==',
    backgroundColor: '#F0FDF4',
    backgroundGradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    colorScheme: {
      primary: '#16A34A',
      secondary: '#65A30D',
      accent: '#059669',
      text: '#14532D',
      textLight: '#16A34A',
      background: '#F0FDF4',
      surface: '#DCFCE7'
    },
    fontFamily: 'sans-serif',
    fontWeights: { normal: 400, medium: 500, bold: 600 },
    borderRadius: 10,
    shadowStyle: '0 2px 4px rgba(22, 163, 74, 0.1)',
    category: 'minimal',
    isBuiltIn: true
  },
  {
    id: 'creative-vibrant',
    name: '创意活力',
    description: '充满活力的创意设计，适合年轻活泼的内容',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkJCRjI0Ii8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0Y0NzFCNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiIHJ4PSIxNSIvPgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjRDk0NkVGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWJyYW50PC90ZXh0Pgo8L3N2Zz4=',
    backgroundColor: '#FFFFFF',
    backgroundGradient: 'linear-gradient(135deg, #FBBF24, #F471B5, #A855F7)',
    colorScheme: {
      primary: '#D946EF',
      secondary: '#F471B5',
      accent: '#FBBF24',
      text: '#7C2D92',
      textLight: '#A855F7',
      background: '#FFFFFF',
      surface: '#FDF4FF'
    },
    fontFamily: 'sans-serif',
    fontWeights: { normal: 400, medium: 600, bold: 700 },
    borderRadius: 16,
    shadowStyle: '0 8px 25px rgba(212, 70, 239, 0.15)',
    category: 'creative',
    isBuiltIn: true
  }
];
