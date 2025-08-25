// 数据库抽象层类型定义

// 基础数据库连接接口
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: number }>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  close?: () => Promise<void>; // 兼容旧接口
}

export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mysql';
  path?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

// 兼容旧接口
export interface IDatabase extends DatabaseConnection {
  run(sql: string, params?: any[]): Promise<any>;
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

export interface Migration {
  version: string;
  description: string;
  up: string[];
  down: string[];
}

export interface QueryResult<T = any> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 基础模型接口
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 用户模型
export interface UserModel extends BaseModel {
  username: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  settings: string; // JSON string
}

// 相册模型
export interface AlbumModel extends BaseModel {
  name: string;
  description?: string;
  canvasSizeId: string;
  themeId: string;
  settings: string; // JSON string
  pageCount: number;
  thumbnail?: string;
  tags?: string; // JSON string array
  category?: string;
  userId: string; // 新增用户ID字段
}

// 页面模型
export interface PageModel extends BaseModel {
  albumId: string;
  name: string;
  order: number;
  templateId?: string;
  elements: string; // JSON string
  backgroundColor?: string;
  backgroundImage?: string;
}

// 画布尺寸模型
export interface CanvasSizeModel extends BaseModel {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description?: string;
  isActive: boolean;
}

// 主题模型
export interface ThemeModel extends BaseModel {
  name: string;
  description?: string;
  backgroundColor: string;
  backgroundGradient?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  preview: string;
  isActive: boolean;
}

// 页面模板模型
export interface PageTemplateModel extends BaseModel {
  name: string;
  description?: string;
  preview: string;
  frameDefinitions: string; // JSON string
  tags: string; // JSON string array
  category: string;
  isActive: boolean;
}
