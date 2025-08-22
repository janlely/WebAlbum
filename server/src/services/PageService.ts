// 页面业务逻辑服务层

import { PageDAO, CreatePageRequest, UpdatePageRequest, PageListQuery } from '../models/PageDAO';
import { DatabaseManager } from '../database/factory';
import { PageModel, PaginationOptions } from '../types/database';

export interface PageListResult {
  pages: PageModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class PageService {
  constructor() {
    // 构造函数中不初始化DAO，而是在方法中获取
  }

  private async getPageDAO(): Promise<PageDAO> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    return new PageDAO(connection);
  }

  // 创建页面
  async createPage(data: CreatePageRequest): Promise<PageModel> {
    // 验证输入数据
    this.validateCreatePageData(data);

    // 验证相册是否存在且用户有权限
    await this.validateAlbumAccess(data.albumId, data.userId);

    // 验证模板ID（如果提供）
    if (data.templateId) {
      await this.validateTemplateExists(data.templateId);
    }

    const pageDAO = await this.getPageDAO();
    return await pageDAO.create(data);
  }

  // 获取页面详情
  async getPageById(id: string, userId: string): Promise<PageModel | null> {
    this.validateId(id);
    this.validateId(userId);
    
    const pageDAO = await this.getPageDAO();
    return await pageDAO.findById(id, userId);
  }

  // 获取相册的所有页面
  async getAlbumPages(albumId: string, userId: string): Promise<PageModel[]> {
    this.validateId(albumId);
    this.validateId(userId);

    // 验证相册访问权限
    await this.validateAlbumAccess(albumId, userId);

    const pageDAO = await this.getPageDAO();
    return await pageDAO.findByAlbumId(albumId, userId);
  }

  // 获取页面列表（带搜索和分页）
  async getPageList(query: PageListQuery & PaginationOptions): Promise<PageListResult> {
    const options: PaginationOptions & PageListQuery = {
      page: Math.max(1, query.page),
      pageSize: Math.min(100, Math.max(1, query.pageSize)),
      sortBy: query.sortBy || 'page_order',
      sortOrder: query.sortOrder || 'ASC',
      albumId: query.albumId,
      search: query.search,
      templateId: query.templateId,
      userId: query.userId
    };

    // 如果指定了相册ID，验证访问权限
    if (options.albumId) {
      await this.validateAlbumAccess(options.albumId, options.userId);
    }

    const pageDAO = await this.getPageDAO();
    const result = await pageDAO.findMany(options);

    return {
      pages: result.data,
      total: result.total || 0,
      page: result.page || 1,
      pageSize: result.pageSize || 20,
      totalPages: Math.ceil((result.total || 0) / (result.pageSize || 20))
    };
  }

  // 更新页面
  async updatePage(id: string, data: UpdatePageRequest, userId: string): Promise<PageModel | null> {
    this.validateId(id);
    this.validateId(userId);
    this.validateUpdatePageData(data);

    // 验证模板ID（如果更新了模板）
    if (data.templateId) {
      await this.validateTemplateExists(data.templateId);
    }

    const pageDAO = await this.getPageDAO();
    
    // 检查页面是否存在且用户有权限
    const exists = await pageDAO.exists(id, userId);
    if (!exists) {
      return null;
    }

    return await pageDAO.update(id, data, userId);
  }

  // 删除页面
  async deletePage(id: string, userId: string): Promise<boolean> {
    this.validateId(id);
    this.validateId(userId);

    const pageDAO = await this.getPageDAO();
    
    // 检查页面是否存在且用户有权限
    const exists = await pageDAO.exists(id, userId);
    if (!exists) {
      return false;
    }

    return await pageDAO.delete(id, userId);
  }

  // 重新排序页面
  async reorderPages(albumId: string, pageIds: string[], userId: string): Promise<boolean> {
    this.validateId(albumId);
    this.validateId(userId);

    if (!Array.isArray(pageIds) || pageIds.length === 0) {
      throw new Error('页面ID列表不能为空');
    }

    // 验证相册访问权限
    await this.validateAlbumAccess(albumId, userId);

    // 验证所有页面ID的格式
    pageIds.forEach(id => this.validateId(id));

    const pageDAO = await this.getPageDAO();
    return await pageDAO.reorderPages(albumId, pageIds, userId);
  }

  // 复制页面
  async duplicatePage(pageId: string, userId: string): Promise<PageModel | null> {
    this.validateId(pageId);
    this.validateId(userId);

    const pageDAO = await this.getPageDAO();
    
    // 检查页面是否存在且用户有权限
    const exists = await pageDAO.exists(pageId, userId);
    if (!exists) {
      return null;
    }

    return await pageDAO.duplicate(pageId, userId);
  }

  // 获取页面统计
  async getPageStats(albumId?: string, userId?: string) {
    if (albumId) {
      this.validateId(albumId);
      // 验证相册访问权限
      if (userId) {
        await this.validateAlbumAccess(albumId, userId);
      }
    }
    
    if (userId) {
      this.validateId(userId);
    }

    const pageDAO = await this.getPageDAO();
    return await pageDAO.getPageStats(albumId, userId);
  }

  // 验证创建页面数据
  private validateCreatePageData(data: CreatePageRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('页面名称不能为空');
    }

    if (data.name.length > 255) {
      throw new Error('页面名称不能超过255个字符');
    }

    if (!data.albumId || data.albumId.trim().length === 0) {
      throw new Error('相册ID不能为空');
    }

    if (typeof data.order !== 'number' || data.order < 0) {
      throw new Error('页面顺序必须是非负整数');
    }

    if (!data.userId || data.userId.trim().length === 0) {
      throw new Error('用户ID不能为空');
    }

    // 验证elements是否为有效的JSON
    if (data.elements) {
      try {
        if (typeof data.elements === 'string') {
          JSON.parse(data.elements);
        } else if (typeof data.elements !== 'object') {
          throw new Error('元素数据格式无效');
        }
      } catch (error) {
        throw new Error('页面元素数据格式无效');
      }
    }
  }

  // 验证更新页面数据
  private validateUpdatePageData(data: UpdatePageRequest): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('页面名称不能为空');
      }
      if (data.name.length > 255) {
        throw new Error('页面名称不能超过255个字符');
      }
    }

    if (data.order !== undefined && (typeof data.order !== 'number' || data.order < 0)) {
      throw new Error('页面顺序必须是非负整数');
    }

    // 验证elements是否为有效的JSON
    if (data.elements !== undefined) {
      try {
        if (typeof data.elements === 'string') {
          JSON.parse(data.elements);
        } else if (typeof data.elements !== 'object') {
          throw new Error('元素数据格式无效');
        }
      } catch (error) {
        throw new Error('页面元素数据格式无效');
      }
    }
  }

  // 验证ID格式
  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('ID不能为空');
    }

    // 允许默认用户
    if (id === 'default-user') {
      return;
    }

    // UUID v4格式验证（简化）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('无效的ID格式');
    }
  }

  // 验证相册访问权限
  private async validateAlbumAccess(albumId: string, userId: string): Promise<void> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();

    const result = await connection.query(
      'SELECT 1 FROM albums WHERE id = ? AND user_id = ? LIMIT 1',
      [albumId, userId]
    );

    if (result.length === 0) {
      throw new Error('相册不存在或无访问权限');
    }
  }

  // 验证模板是否存在
  private async validateTemplateExists(templateId: string): Promise<void> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();

    const result = await connection.query(
      'SELECT 1 FROM page_templates WHERE id = ? AND is_active = 1 LIMIT 1',
      [templateId]
    );

    if (result.length === 0) {
      throw new Error('指定的页面模板不存在或已禁用');
    }
  }
}

// 单例实例
export const pageService = new PageService();
