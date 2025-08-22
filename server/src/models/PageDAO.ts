import { DatabaseConnection, PageModel, QueryResult, PaginationOptions } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreatePageRequest {
  albumId: string;
  name: string;
  order: number;
  templateId?: string;
  elements: any; // JSON object
  backgroundColor?: string;
  backgroundImage?: string;
  userId: string; // 用于权限验证
}

export interface UpdatePageRequest {
  name?: string;
  order?: number;
  templateId?: string;
  elements?: any; // JSON object
  backgroundColor?: string;
  backgroundImage?: string;
}

export interface PageListQuery {
  albumId?: string;
  search?: string;
  templateId?: string;
  userId: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class PageDAO {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  // 创建页面
  async create(data: CreatePageRequest): Promise<PageModel> {
    const id = uuidv4();
    const now = new Date();
    
    const sql = `
      INSERT INTO pages (
        id, album_id, name, page_order, template_id, 
        elements, background_color, background_image,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.execute(sql, [
      id,
      data.albumId,
      data.name,
      data.order,
      data.templateId || null,
      JSON.stringify(data.elements || []),
      data.backgroundColor || null,
      data.backgroundImage || null,
      now.toISOString(),
      now.toISOString()
    ]);

    return {
      id,
      albumId: data.albumId,
      name: data.name,
      order: data.order,
      templateId: data.templateId,
      elements: JSON.stringify(data.elements || []),
      backgroundColor: data.backgroundColor,
      backgroundImage: data.backgroundImage,
      createdAt: now,
      updatedAt: now
    };
  }

  // 根据ID查找页面（带权限验证）
  async findById(id: string, userId?: string): Promise<PageModel | null> {
    let sql = `
      SELECT p.id, p.album_id as albumId, p.name, p.page_order as "order",
             p.template_id as templateId, p.elements, p.background_color as backgroundColor,
             p.background_image as backgroundImage, p.created_at as createdAt,
             p.updated_at as updatedAt
      FROM pages p
    `;
    
    const params = [id];
    
    // 如果提供了用户ID，需要通过相册验证权限
    if (userId) {
      sql += `
        INNER JOIN albums a ON p.album_id = a.id 
        WHERE p.id = ? AND a.user_id = ?
      `;
      params.push(userId);
    } else {
      sql += ' WHERE p.id = ?';
    }
    
    const result = await this.db.query(sql, params);
    return result.length > 0 ? this.mapRowToModel(result[0]) : null;
  }

  // 根据相册ID查找页面列表
  async findByAlbumId(albumId: string, userId?: string): Promise<PageModel[]> {
    let sql = `
      SELECT p.id, p.album_id as albumId, p.name, p.page_order as "order",
             p.template_id as templateId, p.elements, p.background_color as backgroundColor,
             p.background_image as backgroundImage, p.created_at as createdAt,
             p.updated_at as updatedAt
      FROM pages p
    `;
    
    const params = [albumId];
    
    // 如果提供了用户ID，需要通过相册验证权限
    if (userId) {
      sql += `
        INNER JOIN albums a ON p.album_id = a.id 
        WHERE p.album_id = ? AND a.user_id = ?
      `;
      params.push(userId);
    } else {
      sql += ' WHERE p.album_id = ?';
    }
    
    sql += ' ORDER BY p.page_order ASC';
    
    const result = await this.db.query(sql, params);
    return result.map(row => this.mapRowToModel(row));
  }

  // 查找多个页面（带搜索和分页）
  async findMany(options: PaginationOptions & PageListQuery): Promise<QueryResult<PageModel>> {
    let sql = `
      SELECT p.id, p.album_id as albumId, p.name, p.page_order as "order",
             p.template_id as templateId, p.elements, p.background_color as backgroundColor,
             p.background_image as backgroundImage, p.created_at as createdAt,
             p.updated_at as updatedAt
      FROM pages p
      INNER JOIN albums a ON p.album_id = a.id
      WHERE a.user_id = ?
    `;
    
    const params: any[] = [options.userId];
    
    // 按相册过滤
    if (options.albumId) {
      sql += ' AND p.album_id = ?';
      params.push(options.albumId);
    }
    
    // 搜索条件
    if (options.search) {
      sql += ' AND p.name LIKE ?';
      params.push(`%${options.search}%`);
    }
    
    // 按模板过滤
    if (options.templateId) {
      sql += ' AND p.template_id = ?';
      params.push(options.templateId);
    }
    
    // 排序
    const sortBy = options.sortBy || 'page_order';
    const sortOrder = options.sortOrder || 'ASC';
    sql += ` ORDER BY p.${sortBy} ${sortOrder}`;
    
    // 分页
    if (options.page && options.pageSize) {
      const offset = (options.page - 1) * options.pageSize;
      sql += ' LIMIT ? OFFSET ?';
      params.push(options.pageSize, offset);
    }
    
    const data = await this.db.query(sql, params);
    
    // 获取总数
    let countSql = `
      SELECT COUNT(*) as total 
      FROM pages p 
      INNER JOIN albums a ON p.album_id = a.id 
      WHERE a.user_id = ?
    `;
    const countParams: any[] = [options.userId];
    
    if (options.albumId) {
      countSql += ' AND p.album_id = ?';
      countParams.push(options.albumId);
    }
    
    if (options.search) {
      countSql += ' AND p.name LIKE ?';
      countParams.push(`%${options.search}%`);
    }
    
    if (options.templateId) {
      countSql += ' AND p.template_id = ?';
      countParams.push(options.templateId);
    }
    
    const countResult = await this.db.query(countSql, countParams);
    const total = countResult[0]?.total || 0;
    
    return {
      data: data.map(row => this.mapRowToModel(row)),
      total,
      page: options.page || 1,
      pageSize: options.pageSize || data.length
    };
  }

  // 更新页面（带权限验证）
  async update(id: string, data: UpdatePageRequest, userId?: string): Promise<PageModel | null> {
    const updateFields: string[] = [];
    const params: any[] = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      params.push(data.name);
    }
    
    if (data.order !== undefined) {
      updateFields.push('page_order = ?');
      params.push(data.order);
    }
    
    if (data.templateId !== undefined) {
      updateFields.push('template_id = ?');
      params.push(data.templateId);
    }
    
    if (data.elements !== undefined) {
      updateFields.push('elements = ?');
      params.push(JSON.stringify(data.elements));
    }
    
    if (data.backgroundColor !== undefined) {
      updateFields.push('background_color = ?');
      params.push(data.backgroundColor);
    }
    
    if (data.backgroundImage !== undefined) {
      updateFields.push('background_image = ?');
      params.push(data.backgroundImage);
    }
    
    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());
    
    params.push(id);
    
    let sql = `UPDATE pages SET ${updateFields.join(', ')} WHERE id = ?`;
    
    // 如果提供了用户ID，添加权限验证
    if (userId) {
      sql = `
        UPDATE pages SET ${updateFields.join(', ')} 
        WHERE id = ? AND album_id IN (
          SELECT id FROM albums WHERE user_id = ?
        )
      `;
      params.push(userId);
    }
    
    const result = await this.db.execute(sql, params);
    
    // 如果没有更新任何行，说明页面不存在或无权限
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.findById(id, userId);
  }

  // 删除页面（带权限验证）
  async delete(id: string, userId?: string): Promise<boolean> {
    let sql = 'DELETE FROM pages WHERE id = ?';
    const params = [id];
    
    // 如果提供了用户ID，添加权限验证
    if (userId) {
      sql = `
        DELETE FROM pages 
        WHERE id = ? AND album_id IN (
          SELECT id FROM albums WHERE user_id = ?
        )
      `;
      params.push(userId);
    }
    
    const result = await this.db.execute(sql, params);
    return result.affectedRows > 0;
  }

  // 检查页面是否存在（带权限验证）
  async exists(id: string, userId?: string): Promise<boolean> {
    let sql = 'SELECT 1 FROM pages WHERE id = ?';
    const params = [id];
    
    // 如果提供了用户ID，添加权限验证
    if (userId) {
      sql = `
        SELECT 1 FROM pages p
        INNER JOIN albums a ON p.album_id = a.id
        WHERE p.id = ? AND a.user_id = ?
      `;
      params.push(userId);
    }
    
    sql += ' LIMIT 1';
    const result = await this.db.query(sql, params);
    return result.length > 0;
  }

  // 重新排序页面
  async reorderPages(albumId: string, pageIds: string[], userId?: string): Promise<boolean> {
    try {
      await this.db.beginTransaction();

      // 验证权限（如果提供了userId）
      if (userId) {
        const albumCheck = await this.db.query(
          'SELECT 1 FROM albums WHERE id = ? AND user_id = ? LIMIT 1',
          [albumId, userId]
        );
        if (albumCheck.length === 0) {
          await this.db.rollback();
          return false;
        }
      }

      // 批量更新页面顺序
      for (let i = 0; i < pageIds.length; i++) {
        const pageId = pageIds[i];
        await this.db.execute(
          'UPDATE pages SET page_order = ?, updated_at = ? WHERE id = ? AND album_id = ?',
          [i, new Date().toISOString(), pageId, albumId]
        );
      }

      await this.db.commit();
      return true;
    } catch (error) {
      await this.db.rollback();
      throw error;
    }
  }

  // 获取页面统计
  async getPageStats(albumId?: string, userId?: string) {
    let sql = `
      SELECT 
        COUNT(*) as totalPages,
        AVG(LENGTH(elements)) as avgElementsSize,
        COUNT(CASE WHEN template_id IS NOT NULL THEN 1 END) as templatedPages,
        COUNT(CASE WHEN background_image IS NOT NULL THEN 1 END) as pagesWithBackground
      FROM pages p
    `;
    
    const params: any[] = [];
    
    if (userId) {
      sql += ' INNER JOIN albums a ON p.album_id = a.id WHERE a.user_id = ?';
      params.push(userId);
      
      if (albumId) {
        sql += ' AND p.album_id = ?';
        params.push(albumId);
      }
    } else if (albumId) {
      sql += ' WHERE p.album_id = ?';
      params.push(albumId);
    }
    
    const result = await this.db.query(sql, params);
    return result[0] || {};
  }

  // 复制页面
  async duplicate(pageId: string, userId?: string): Promise<PageModel | null> {
    const originalPage = await this.findById(pageId, userId);
    if (!originalPage) return null;

    const newPageData: CreatePageRequest = {
      albumId: originalPage.albumId,
      name: `${originalPage.name} - 副本`,
      order: originalPage.order + 1,
      templateId: originalPage.templateId,
      elements: JSON.parse(originalPage.elements),
      backgroundColor: originalPage.backgroundColor,
      backgroundImage: originalPage.backgroundImage,
      userId: userId || 'default-user'
    };

    // 更新后续页面的顺序
    await this.db.execute(
      'UPDATE pages SET page_order = page_order + 1, updated_at = ? WHERE album_id = ? AND page_order > ?',
      [new Date().toISOString(), originalPage.albumId, originalPage.order]
    );

    return this.create(newPageData);
  }

  // 映射数据库行到模型
  private mapRowToModel(row: any): PageModel {
    return {
      id: row.id,
      albumId: row.albumId,
      name: row.name,
      order: row.order,
      templateId: row.templateId,
      elements: row.elements,
      backgroundColor: row.backgroundColor,
      backgroundImage: row.backgroundImage,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}
