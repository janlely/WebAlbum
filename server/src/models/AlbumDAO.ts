import { DatabaseConnection, AlbumModel, QueryResult, PaginationOptions } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateAlbumRequest {
  name: string;
  description?: string;
  canvasSizeId: string;
  themeId: string;
  settings?: any;
  tags?: string[];
  category?: string;
  userId: string; // 新增用户ID字段
}

export interface UpdateAlbumRequest {
  name?: string;
  description?: string;
  canvasSizeId?: string;
  themeId?: string;
  settings?: any;
  thumbnail?: string;
  tags?: string[];
  category?: string;
}

export class AlbumDAO {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  // 创建相册
  async create(data: CreateAlbumRequest): Promise<AlbumModel> {
    const id = uuidv4();
    const now = new Date();
    
    const sql = `
      INSERT INTO albums (
        id, name, description, canvas_size_id, theme_id, 
        settings, page_count, thumbnail, tags, category, user_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.execute(sql, [
      id,
      data.name,
      data.description || null,
      data.canvasSizeId,
      data.themeId,
      JSON.stringify(data.settings || {}),
      0,
      null, // thumbnail - 数据库中存储为null
      JSON.stringify(data.tags || []),
      data.category || null,
      data.userId,
      now.toISOString(),
      now.toISOString()
    ]);

    return {
      id,
      name: data.name,
      description: data.description,
      canvasSizeId: data.canvasSizeId,
      themeId: data.themeId,
      settings: JSON.stringify(data.settings || {}),
      pageCount: 0,
      thumbnail: undefined,
      tags: JSON.stringify(data.tags || []),
      category: data.category,
      userId: data.userId,
      createdAt: now,
      updatedAt: now
    };
  }

  // 根据ID查找相册（带用户过滤）
  async findById(id: string, userId?: string): Promise<AlbumModel | null> {
    let sql = `
      SELECT id, name, description, canvas_size_id as canvasSizeId, theme_id as themeId,
             settings, page_count as pageCount, thumbnail, tags, category, user_id as userId,
             created_at as createdAt, updated_at as updatedAt
      FROM albums 
      WHERE id = ?
    `;
    
    const params = [id];
    
    // 如果提供了用户ID，添加用户过滤
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    
    const result = await this.db.query(sql, params);
    return result.length > 0 ? this.mapRowToModel(result[0]) : null;
  }

  // 查找多个相册（带用户过滤）
  async findMany(options: PaginationOptions & {
    search?: string;
    category?: string;
    tags?: string[];
    userId?: string;
  }): Promise<QueryResult<AlbumModel>> {
    let sql = `
      SELECT id, name, description, canvas_size_id as canvasSizeId, theme_id as themeId,
             settings, page_count as pageCount, thumbnail, tags, category, user_id as userId,
             created_at as createdAt, updated_at as updatedAt
      FROM albums 
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // 用户过滤（必需）
    if (options.userId) {
      sql += ' AND user_id = ?';
      params.push(options.userId);
    }
    
    // 搜索条件
    if (options.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${options.search}%`, `%${options.search}%`);
    }
    
    if (options.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }
    
    if (options.tags && options.tags.length > 0) {
      const tagConditions = options.tags.map(() => 'tags LIKE ?').join(' OR ');
      sql += ` AND (${tagConditions})`;
      options.tags.forEach(tag => params.push(`%"${tag}"%`));
    }
    
    // 排序
    const sortBy = options.sortBy || 'updated_at';
    const sortOrder = options.sortOrder || 'DESC';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    // 分页
    const offset = (options.page - 1) * options.pageSize;
    sql += ' LIMIT ? OFFSET ?';
    params.push(options.pageSize, offset);
    
    const data = await this.db.query(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM albums WHERE 1=1';
    const countParams: any[] = [];
    
    // 用户过滤（必需）
    if (options.userId) {
      countSql += ' AND user_id = ?';
      countParams.push(options.userId);
    }
    
    if (options.search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${options.search}%`, `%${options.search}%`);
    }
    
    if (options.category) {
      countSql += ' AND category = ?';
      countParams.push(options.category);
    }
    
    if (options.tags && options.tags.length > 0) {
      const tagConditions = options.tags.map(() => 'tags LIKE ?').join(' OR ');
      countSql += ` AND (${tagConditions})`;
      options.tags.forEach(tag => countParams.push(`%"${tag}"%`));
    }
    
    const countResult = await this.db.query(countSql, countParams);
    const total = countResult[0]?.total || 0;
    
    return {
      data: data.map(row => this.mapRowToModel(row)),
      total,
      page: options.page,
      pageSize: options.pageSize
    };
  }

  // 更新相册（带用户验证）
  async update(id: string, data: UpdateAlbumRequest, userId?: string): Promise<AlbumModel | null> {
    const updateFields: string[] = [];
    const params: any[] = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      params.push(data.name);
    }
    
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      params.push(data.description);
    }
    
    if (data.canvasSizeId !== undefined) {
      updateFields.push('canvas_size_id = ?');
      params.push(data.canvasSizeId);
    }
    
    if (data.themeId !== undefined) {
      updateFields.push('theme_id = ?');
      params.push(data.themeId);
    }
    
    if (data.settings !== undefined) {
      updateFields.push('settings = ?');
      params.push(JSON.stringify(data.settings));
    }
    
    if (data.thumbnail !== undefined) {
      updateFields.push('thumbnail = ?');
      params.push(data.thumbnail);
    }
    
    if (data.tags !== undefined) {
      updateFields.push('tags = ?');
      params.push(JSON.stringify(data.tags));
    }
    
    if (data.category !== undefined) {
      updateFields.push('category = ?');
      params.push(data.category);
    }
    
    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());
    
    params.push(id);
    
    let sql = `UPDATE albums SET ${updateFields.join(', ')} WHERE id = ?`;
    
    // 如果提供了用户ID，添加用户验证
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    
    const result = await this.db.execute(sql, params);
    
    // 如果没有更新任何行，说明相册不存在或不属于该用户
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id, userId);
  }

  // 删除相册（带用户验证）
  async delete(id: string, userId?: string): Promise<boolean> {
    let sql = 'DELETE FROM albums WHERE id = ?';
    const params = [id];
    
    // 如果提供了用户ID，添加用户验证
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    
    const result = await this.db.execute(sql, params);
    return result.affectedRows > 0;
  }

  // 检查相册是否存在（带用户验证）
  async exists(id: string, userId?: string): Promise<boolean> {
    let sql = 'SELECT 1 FROM albums WHERE id = ?';
    const params = [id];
    
    // 如果提供了用户ID，添加用户验证
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    
    sql += ' LIMIT 1';
    const result = await this.db.query(sql, params);
    return result.length > 0;
  }

  // 获取相册摘要（带用户过滤）
  async getSummaries(options?: {
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    userId?: string;
  }) {
    let sql = `
      SELECT id, name, thumbnail, page_count as pageCount, user_id as userId,
             updated_at as updatedAt
      FROM albums
    `;
    
    const params: any[] = [];
    
    // 用户过滤
    if (options?.userId) {
      sql += ' WHERE user_id = ?';
      params.push(options.userId);
    }
    
    const sortBy = options?.sortBy || 'updated_at';
    const sortOrder = options?.sortOrder || 'DESC';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    
    return this.db.query(sql, params);
  }

  // 获取统计信息（带用户过滤）
  async getStats(userId?: string) {
    let sql = `
      SELECT 
        COUNT(*) as totalAlbums,
        AVG(page_count) as avgPageCount,
        MAX(page_count) as maxPageCount,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as recentAlbums
      FROM albums
    `;
    
    const params: any[] = [];
    
    // 用户过滤
    if (userId) {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    const result = await this.db.query(sql, params);
    return result[0] || {};
  }

  // 映射数据库行到模型
  private mapRowToModel(row: any): AlbumModel {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      canvasSizeId: row.canvasSizeId,
      themeId: row.themeId,
      settings: row.settings,
      pageCount: row.pageCount,
      thumbnail: row.thumbnail,
      tags: row.tags,
      category: row.category,
      userId: row.userId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}