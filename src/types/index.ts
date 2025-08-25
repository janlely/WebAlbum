// 导出所有类型定义

// 原有模板类型（兼容性保留）
export type { 
  PhotoFrame, 
  TextFrame, 
  Page, 
  Template,
  PhotoData as OldPhotoData,
  TextData as OldTextData
} from './template';

// 新的架构类型
export type {
  Theme,
  ColorScheme
} from './theme';

export type {
  PageTemplate,
  PhotoFrameDefinition,
  TextFrameDefinition,
  FrameDefinition
} from './pageTemplate';

export type {
  PhotoBookProject,
  PageInstance,
  PhotoData,
  TextData,
  CanvasSize,
  ProjectCreateConfig,
  ExportConfig
} from './project';

// 新的相册系统类型
export type {
  Album,
  AlbumPage,
  AlbumSummary,
  PageSummary,
  PageElement,
  PhotoElement,
  TextElement,
  ShapeElement,
  DecorationElement,
  BaseElement,
  EditorState,
  ToolPanelState,
  ProjectPanelState,
  PhotoShapeType,
  DecorationCategory,
  DecorationSubtype
} from './album';

// 导出常量数据
export { defaultThemes } from './theme';
export { defaultPageTemplates } from './pageTemplate';
export { defaultCanvasSizes } from './project';
