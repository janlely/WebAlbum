// 页面模板（布局）相关类型定义

export interface FrameDefinition {
  id: string;
  x: number; // 相对位置 (0-1)
  y: number; // 相对位置 (0-1)
  width: number; // 相对宽度 (0-1)
  height: number; // 相对高度 (0-1)
  placeholder?: string;
  zIndex?: number;
}

export interface PhotoFrameDefinition extends FrameDefinition {
  aspectRatio?: 'square' | '4:3' | '16:9' | 'portrait' | 'auto';
  borderRadius?: number;
}

export interface TextFrameDefinition extends FrameDefinition {
  fontSize?: 'small' | 'medium' | 'large' | 'xl';
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'medium' | 'bold';
  maxLines?: number;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // 模板预览图
  
  // 分类
  category: 'single-photo' | 'multi-photo' | 'text-heavy' | 'cover' | 'mixed';
  
  // 适用场景标签
  tags: string[];
  
  // 框架定义
  photoFrames: PhotoFrameDefinition[];
  textFrames: TextFrameDefinition[];
  
  // 推荐使用的画布比例
  recommendedAspectRatio?: string;
  
  // 是否为内置模板
  isBuiltIn: boolean;
}

// 预设页面模板
export const defaultPageTemplates: PageTemplate[] = [
  {
    id: 'single-large',
    name: '大图展示',
    description: '单张大图布局，突出主要内容',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjEwIiB5PSIxNSIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRTVFN0VCIiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPgo8dGV4dCB4PSI1MCIgeT0iODUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWkp+WbvuWxleekujwvdGV4dD4KPC9zdmc+',
    category: 'single-photo',
    tags: ['简洁', '突出', '展示'],
    photoFrames: [
      {
        id: 'photo-1',
        x: 0.1,
        y: 0.15,
        width: 0.8,
        height: 0.6,
        aspectRatio: 'auto',
        placeholder: '添加主要图片'
      }
    ],
    textFrames: [
      {
        id: 'text-1',
        x: 0.1,
        y: 0.8,
        width: 0.8,
        height: 0.15,
        fontSize: 'medium',
        textAlign: 'center',
        placeholder: '添加标题或描述'
      }
    ],
    recommendedAspectRatio: '4:3',
    isBuiltIn: true
  },
  {
    id: 'double-horizontal',
    name: '左右双图',
    description: '两张图片水平排列，平衡构图',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjUiIHk9IjE1IiB3aWR0aD0iNDAiIGhlaWdodD0iNTAiIGZpbGw9IiNFNUU3RUIiIHN0cm9rZT0iI0QxRDVEQiIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIi8+CjxyZWN0IHg9IjU1IiB5PSIxNSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRTVFN0VCIiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPgo8dGV4dCB4PSI1MCIgeT0iODUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuW3puWPs+WOj+WbvjwvdGV4dD4KPC9zdmc+',
    category: 'multi-photo',
    tags: ['对比', '并列', '双图'],
    photoFrames: [
      {
        id: 'photo-1',
        x: 0.05,
        y: 0.15,
        width: 0.4,
        height: 0.5,
        aspectRatio: '4:3',
        placeholder: '左侧图片'
      },
      {
        id: 'photo-2',
        x: 0.55,
        y: 0.15,
        width: 0.4,
        height: 0.5,
        aspectRatio: '4:3',
        placeholder: '右侧图片'
      }
    ],
    textFrames: [
      {
        id: 'text-1',
        x: 0.1,
        y: 0.75,
        width: 0.8,
        height: 0.2,
        fontSize: 'medium',
        textAlign: 'center',
        placeholder: '添加说明文字'
      }
    ],
    recommendedAspectRatio: '16:9',
    isBuiltIn: true
  },
  {
    id: 'triple-grid',
    name: '三图网格',
    description: '三张图片网格布局，适合展示系列内容',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjI1IiBoZWlnaHQ9IjI1IiBmaWxsPSIjRTVFN0VCIiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS1kYXNoYXJyYXk9IjEgMSIvPgo8cmVjdCB4PSI0MCIgeT0iMTAiIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNSIgZmlsbD0iI0U1RTdFQiIgc3Ryb2tlPSIjRDFENURCIiBzdHJva2UtZGFzaGFycmF5PSIxIDEiLz4KPHJlY3QgeD0iNzAiIHk9IjEwIiB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIGZpbGw9IiNFNUU3RUIiIHN0cm9rZT0iI0QxRDVEQiIgc3Ryb2tlLWRhc2hhcnJheT0iMSAxIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5LiJ5Zu+572R5qC8PC90ZXh0Pgo8L3N2Zz4=',
    category: 'multi-photo',
    tags: ['网格', '系列', '多图'],
    photoFrames: [
      {
        id: 'photo-1',
        x: 0.1,
        y: 0.1,
        width: 0.25,
        height: 0.25,
        aspectRatio: 'square',
        placeholder: '图片1'
      },
      {
        id: 'photo-2',
        x: 0.4,
        y: 0.1,
        width: 0.25,
        height: 0.25,
        aspectRatio: 'square',
        placeholder: '图片2'
      },
      {
        id: 'photo-3',
        x: 0.7,
        y: 0.1,
        width: 0.25,
        height: 0.25,
        aspectRatio: 'square',
        placeholder: '图片3'
      }
    ],
    textFrames: [
      {
        id: 'text-1',
        x: 0.1,
        y: 0.45,
        width: 0.8,
        height: 0.4,
        fontSize: 'medium',
        textAlign: 'left',
        maxLines: 8,
        placeholder: '添加详细描述内容...'
      }
    ],
    recommendedAspectRatio: '4:3',
    isBuiltIn: true
  },
  {
    id: 'text-focus',
    name: '文字为主',
    description: '以文字内容为主，适合文章或长文本',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEyIiBmaWxsPSIjMzc0MTUxIi8+CjxyZWN0IHg9IjEwIiB5PSIzMCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjMiIGZpbGw9IiM2QjcyODAiLz4KPHJlY3QgeD0iMTAiIHk9IjM4IiB3aWR0aD0iNzUiIGhlaWdodD0iMyIgZmlsbD0iIzZCNzI4MCIvPgo8cmVjdCB4PSIxMCIgeT0iNDYiIHdpZHRoPSI2NSIgaGVpZ2h0PSIzIiBmaWxsPSIjNkI3MjgwIi8+CjxyZWN0IHg9IjEwIiB5PSI1NCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjMiIGZpbGw9IiM2QjcyODAiLz4KPHJlY3QgeD0iMTAiIHk9IjYyIiB3aWR0aD0iNTUiIGhlaWdodD0iMyIgZmlsbD0iIzZCNzI4MCIvPgo8dGV4dCB4PSI1MCIgeT0iODUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuaWh+Wtl+S4uuS4ujwvdGV4dD4KPC9zdmc+',
    category: 'text-heavy',
    tags: ['文章', '文字', '长文本'],
    photoFrames: [],
    textFrames: [
      {
        id: 'text-1',
        x: 0.1,
        y: 0.1,
        width: 0.8,
        height: 0.15,
        fontSize: 'xl',
        textAlign: 'center',
        fontWeight: 'bold',
        placeholder: '文章标题'
      },
      {
        id: 'text-2',
        x: 0.1,
        y: 0.3,
        width: 0.8,
        height: 0.6,
        fontSize: 'medium',
        textAlign: 'left',
        maxLines: 15,
        placeholder: '在这里添加你的文章内容...'
      }
    ],
    recommendedAspectRatio: '4:3',
    isBuiltIn: true
  },
  {
    id: 'cover-design',
    name: '封面设计',
    description: '专门的封面布局，适合作为照片书封面',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTVFN0VCIiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPgo8dGV4dCB4PSI1MCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+5bCB6Z2i6K6+6K6hPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iODUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWJr+agh+mimTwvdGV4dD4KPC9zdmc+',
    category: 'cover',
    tags: ['封面', '标题', '主题'],
    photoFrames: [
      {
        id: 'photo-1',
        x: 0.2,
        y: 0.3,
        width: 0.6,
        height: 0.4,
        aspectRatio: '4:3',
        placeholder: '封面主图'
      }
    ],
    textFrames: [
      {
        id: 'text-1',
        x: 0.1,
        y: 0.1,
        width: 0.8,
        height: 0.15,
        fontSize: 'xl',
        textAlign: 'center',
        fontWeight: 'bold',
        placeholder: '照片书标题'
      },
      {
        id: 'text-2',
        x: 0.1,
        y: 0.8,
        width: 0.8,
        height: 0.1,
        fontSize: 'medium',
        textAlign: 'center',
        placeholder: '副标题'
      }
    ],
    recommendedAspectRatio: '4:3',
    isBuiltIn: true
  },
  {
    id: 'mixed-layout',
    name: '图文混排',
    description: '图片和文字灵活混排，内容丰富',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjM1IiBoZWlnaHQ9IjM1IiBmaWxsPSIjRTVFN0VCIiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPgo8cmVjdCB4PSI1NSIgeT0iMTAiIHdpZHRoPSIzNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSI1NSIgeT0iMzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzIiBmaWxsPSIjNkI3MjgwIi8+CjxyZWN0IHg9IjU1IiB5PSIzNiIgd2lkdGg9IjM1IiBoZWlnaHQ9IjMiIGZpbGw9IiM2QjcyODAiLz4KPHJlY3QgeD0iMTAiIHk9IjU1IiB3aWR0aD0iODAiIGhlaWdodD0iMzUiIGZpbGw9IiNFNUU3RUIiIHN0cm9rZT0iI0QxRDVEQiIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIi8+Cjwvc3ZnPg==',
    category: 'mixed',
    tags: ['混排', '图文', '灵活'],
    photoFrames: [
      {
        id: 'photo-1',
        x: 0.1,
        y: 0.1,
        width: 0.35,
        height: 0.35,
        aspectRatio: 'square',
        placeholder: '主图'
      },
      {
        id: 'photo-2',
        x: 0.1,
        y: 0.55,
        width: 0.8,
        height: 0.35,
        aspectRatio: '16:9',
        placeholder: '横图'
      }
    ],
    textFrames: [
      {
        id: 'text-1',
        x: 0.55,
        y: 0.1,
        width: 0.35,
        height: 0.15,
        fontSize: 'large',
        textAlign: 'left',
        fontWeight: 'bold',
        placeholder: '小标题'
      },
      {
        id: 'text-2',
        x: 0.55,
        y: 0.3,
        width: 0.35,
        height: 0.2,
        fontSize: 'small',
        textAlign: 'left',
        maxLines: 4,
        placeholder: '详细说明文字...'
      }
    ],
    recommendedAspectRatio: '4:3',
    isBuiltIn: true
  }
];
