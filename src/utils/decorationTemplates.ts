// 装饰元素模板
import type { DecorationCategory, DecorationSubtype } from '../types';

// 装饰模板定义
export interface DecorationTemplate {
  id: string;
  name: string;
  description: string;
  category: DecorationCategory;
  subtype: DecorationSubtype;
  svgContent: string; // 完整的SVG内容
  defaultStyle: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
  aspectRatio: number; // 宽高比
}

// 线条装饰
const lineDecorations: DecorationTemplate[] = [
  {
    id: 'line-straight',
    name: '直线',
    description: '简单的直线分割',
    category: 'lines',
    subtype: 'straight-line',
    svgContent: '<line x1="0" y1="50%" x2="100%" y2="50%" />',
    defaultStyle: { stroke: '#333333', strokeWidth: 2 },
    aspectRatio: 10
  },
  {
    id: 'line-dashed',
    name: '虚线',
    description: '虚线分割',
    category: 'lines',
    subtype: 'dashed-line',
    svgContent: '<line x1="0" y1="50%" x2="100%" y2="50%" stroke-dasharray="10,5" />',
    defaultStyle: { stroke: '#666666', strokeWidth: 2 },
    aspectRatio: 10
  },
  {
    id: 'line-wavy',
    name: '波浪线',
    description: '优雅的波浪分割线',
    category: 'lines',
    subtype: 'wavy-line',
    svgContent: '<path d="M0,50 Q25,25 50,50 T100,50" fill="none" />',
    defaultStyle: { stroke: '#4A90E2', strokeWidth: 3 },
    aspectRatio: 8
  },
  {
    id: 'arrow-right',
    name: '右箭头',
    description: '指向右侧的箭头',
    category: 'lines',
    subtype: 'arrow-line',
    svgContent: '<path d="M10,50 L80,50 M70,40 L80,50 L70,60" fill="none" />',
    defaultStyle: { stroke: '#E74C3C', strokeWidth: 3 },
    aspectRatio: 3
  },
  {
    id: 'divider-ornate',
    name: '装饰分割线',
    description: '带装饰的分割线',
    category: 'lines',
    subtype: 'divider',
    svgContent: `
      <g>
        <line x1="0" y1="50%" x2="40%" y2="50%" />
        <circle cx="50%" cy="50%" r="8" />
        <line x1="60%" y1="50%" x2="100%" y2="50%" />
      </g>
    `,
    defaultStyle: { stroke: '#8E44AD', strokeWidth: 2, fill: '#8E44AD' },
    aspectRatio: 8
  }
];

// 图案装饰
const patternDecorations: DecorationTemplate[] = [
  {
    id: 'pattern-dots',
    name: '圆点图案',
    description: '规律的圆点装饰',
    category: 'patterns',
    subtype: 'geometric-pattern',
    svgContent: `
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    `,
    defaultStyle: { fill: '#3498DB' },
    aspectRatio: 1
  },
  {
    id: 'pattern-stripes',
    name: '条纹图案',
    description: '斜条纹装饰',
    category: 'patterns',
    subtype: 'geometric-pattern',
    svgContent: `
      <defs>
        <pattern id="stripes" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stripes)" />
    `,
    defaultStyle: { fill: '#2ECC71' },
    aspectRatio: 1
  },
  {
    id: 'floral-corner',
    name: '花卉角饰',
    description: '精美的花卉装饰',
    category: 'patterns',
    subtype: 'floral-pattern',
    svgContent: `
      <g>
        <path d="M20,20 Q30,10 40,20 Q30,30 20,20" />
        <path d="M40,20 Q50,10 60,20 Q50,30 40,20" />
        <circle cx="30" cy="20" r="3" />
        <circle cx="50" cy="20" r="3" />
      </g>
    `,
    defaultStyle: { fill: '#E91E63', stroke: '#E91E63', strokeWidth: 1 },
    aspectRatio: 1
  }
];

// 标签装饰
const badgeDecorations: DecorationTemplate[] = [
  {
    id: 'ribbon-banner',
    name: '丝带标签',
    description: '经典的丝带横幅',
    category: 'badges',
    subtype: 'ribbon-badge',
    svgContent: `
      <g>
        <path d="M10,30 L90,30 L85,50 L90,70 L10,70 L15,50 Z" />
        <path d="M10,30 L5,35 L5,65 L10,70" />
        <path d="M90,30 L95,35 L95,65 L90,70" />
      </g>
    `,
    defaultStyle: { fill: '#F39C12', stroke: '#D68910', strokeWidth: 1 },
    aspectRatio: 2
  },
  {
    id: 'circle-badge',
    name: '圆形徽章',
    description: '圆形徽章装饰',
    category: 'badges',
    subtype: 'circle-badge',
    svgContent: `
      <g>
        <circle cx="50" cy="50" r="45" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-width="2" />
      </g>
    `,
    defaultStyle: { fill: '#9B59B6' },
    aspectRatio: 1
  },
  {
    id: 'corner-badge',
    name: '角标',
    description: '页面角落装饰',
    category: 'badges',
    subtype: 'corner-badge',
    svgContent: `
      <g>
        <path d="M0,0 L50,0 L0,50 Z" />
        <path d="M5,5 L5,25 L25,5 Z" fill="white" opacity="0.3" />
      </g>
    `,
    defaultStyle: { fill: '#E74C3C' },
    aspectRatio: 1
  }
];

// 特效装饰
const effectDecorations: DecorationTemplate[] = [
  {
    id: 'star-sparkle',
    name: '星星闪烁',
    description: '闪烁的星星效果',
    category: 'effects',
    subtype: 'star-effect',
    svgContent: `
      <g>
        <g transform="translate(20,20)">
          <path d="M0,-8 L2,0 L8,0 L3,3 L5,9 L0,6 L-5,9 L-3,3 L-8,0 L-2,0 Z" />
        </g>
        <g transform="translate(60,40) scale(0.7)">
          <path d="M0,-8 L2,0 L8,0 L3,3 L5,9 L0,6 L-5,9 L-3,3 L-8,0 L-2,0 Z" />
        </g>
        <g transform="translate(80,20) scale(0.5)">
          <path d="M0,-8 L2,0 L8,0 L3,3 L5,9 L0,6 L-5,9 L-3,3 L-8,0 L-2,0 Z" />
        </g>
      </g>
    `,
    defaultStyle: { fill: '#F1C40F' },
    aspectRatio: 1
  },
  {
    id: 'heart-love',
    name: '爱心装饰',
    description: '温馨的爱心图案',
    category: 'effects',
    subtype: 'heart-effect',
    svgContent: `
      <g>
        <path d="M50,80 C50,80 20,55 20,40 C20,30 28,25 35,25 C42,25 50,32 50,32 C50,32 58,25 65,25 C72,25 80,30 80,40 C80,55 50,80 50,80 Z" />
      </g>
    `,
    defaultStyle: { fill: '#E91E63' },
    aspectRatio: 1
  },
  {
    id: 'glow-circle',
    name: '光晕效果',
    description: '发光圆形装饰',
    category: 'effects',
    subtype: 'glow-effect',
    svgContent: `
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
          <stop offset="70%" style="stop-color:currentColor;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#glow)" />
    `,
    defaultStyle: { fill: '#3498DB' },
    aspectRatio: 1
  }
];

// 所有装饰模板
export const decorationTemplates: DecorationTemplate[] = [
  ...lineDecorations,
  ...patternDecorations,
  ...badgeDecorations,
  ...effectDecorations
];

// 按分类获取装饰模板
export const getDecorationsByCategory = (category: DecorationCategory): DecorationTemplate[] => {
  return decorationTemplates.filter(template => template.category === category);
};

// 获取装饰模板按分类分组
export const getDecorationsGrouped = () => {
  return {
    lines: getDecorationsByCategory('lines'),
    patterns: getDecorationsByCategory('patterns'),
    badges: getDecorationsByCategory('badges'),
    effects: getDecorationsByCategory('effects')
  };
};

// 根据ID获取装饰模板
export const getDecorationTemplate = (id: string): DecorationTemplate | undefined => {
  return decorationTemplates.find(template => template.id === id);
};
