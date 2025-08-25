// 相册业务逻辑服务层

import { AlbumDAO, CreateAlbumRequest, UpdateAlbumRequest } from '../models/AlbumDAO';
import { DatabaseManager } from '../database/factory';
import { AlbumModel, PaginationOptions } from '../types/database';

export interface AlbumListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  userId: string; // 必需的用户ID
}

export class AlbumService {
  constructor() {
    // 构造函数中不初始化DAO，而是在方法中获取
  }

  private async getAlbumDAO(): Promise<AlbumDAO> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    return new AlbumDAO(connection);
  }

  // 创建相册
  async createAlbum(data: CreateAlbumRequest): Promise<AlbumModel> {
    // 验证输入数据
    this.validateCreateAlbumData(data);

    // 验证canvas_size_id和theme_id是否存在
    await this.validateReferences(data.canvasSizeId, data.themeId);

    const albumDAO = await this.getAlbumDAO();
    return await albumDAO.create(data);
  }

  // 获取相册详情
  async getAlbumById(id: string, userId: string): Promise<AlbumModel | null> {
    this.validateId(id);
    this.validateId(userId);
    
    const albumDAO = await this.getAlbumDAO();
    return await albumDAO.findById(id, userId);
  }

  // 获取相册列表
  async getAlbumList(query: AlbumListQuery): Promise<{
    albums: AlbumModel[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const options: PaginationOptions & AlbumListQuery = {
      page: Math.max(1, query.page || 1),
      pageSize: Math.min(100, Math.max(1, query.pageSize || 20)),
      sortBy: query.sortBy || 'updated_at',
      sortOrder: query.sortOrder || 'DESC',
      search: query.search,
      category: query.category,
      tags: query.tags,
      userId: query.userId
    };

    const albumDAO = await this.getAlbumDAO();
    const result = await albumDAO.findMany(options);

    return {
      albums: result.data,
      total: result.total || 0,
      page: result.page || 1,
      pageSize: result.pageSize || 20,
      totalPages: Math.ceil((result.total || 0) / (result.pageSize || 20))
    };
  }

  // 更新相册
  async updateAlbum(id: string, data: UpdateAlbumRequest, userId: string): Promise<AlbumModel | null> {
    this.validateId(id);
    this.validateId(userId);
    this.validateUpdateAlbumData(data);

    // 如果更新了引用，需要验证
    if (data.canvasSizeId || data.themeId) {
      await this.validateReferences(data.canvasSizeId, data.themeId);
    }

    const albumDAO = await this.getAlbumDAO();
    
    // 检查相册是否存在且属于该用户
    const exists = await albumDAO.exists(id, userId);
    if (!exists) {
      return null;
    }

    return await albumDAO.update(id, data, userId);
  }

  // 删除相册
  async deleteAlbum(id: string, userId: string): Promise<boolean> {
    this.validateId(id);
    this.validateId(userId);

    const albumDAO = await this.getAlbumDAO();
    
    // 检查相册是否存在且属于该用户
    const exists = await albumDAO.exists(id, userId);
    if (!exists) {
      return false;
    }

    return await albumDAO.delete(id, userId);
  }

  // 获取相册摘要列表（轻量级）
  async getAlbumSummaries(userId: string, options?: {
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    this.validateId(userId);
    
    const albumDAO = await this.getAlbumDAO();
    return await albumDAO.getSummaries({ ...options, userId });
  }

  // 获取相册统计信息
  async getAlbumStats(userId: string) {
    this.validateId(userId);
    
    const albumDAO = await this.getAlbumDAO();
    return await albumDAO.getStats(userId);
  }

  // 验证创建相册数据
  private validateCreateAlbumData(data: CreateAlbumRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('相册名称不能为空');
    }

    if (data.name.length > 255) {
      throw new Error('相册名称不能超过255个字符');
    }

    if (data.description && data.description.length > 1000) {
      throw new Error('相册描述不能超过1000个字符');
    }

    if (!data.canvasSizeId || data.canvasSizeId.trim().length === 0) {
      throw new Error('画布尺寸ID不能为空');
    }

    if (!data.themeId || data.themeId.trim().length === 0) {
      throw new Error('主题ID不能为空');
    }

    if (data.tags && data.tags.length > 20) {
      throw new Error('标签数量不能超过20个');
    }

    if (data.tags) {
      data.tags.forEach(tag => {
        if (tag.length > 50) {
          throw new Error('单个标签不能超过50个字符');
        }
      });
    }
  }

  // 验证更新相册数据
  private validateUpdateAlbumData(data: UpdateAlbumRequest): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('相册名称不能为空');
      }
      if (data.name.length > 255) {
        throw new Error('相册名称不能超过255个字符');
      }
    }

    if (data.description !== undefined && data.description && data.description.length > 1000) {
      throw new Error('相册描述不能超过1000个字符');
    }

    if (data.tags && data.tags.length > 20) {
      throw new Error('标签数量不能超过20个');
    }

    if (data.tags) {
      data.tags.forEach(tag => {
        if (tag.length > 50) {
          throw new Error('单个标签不能超过50个字符');
        }
      });
    }
  }

  // 验证ID格式
  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('ID不能为空');
    }

    // 完整的UUID v4验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('无效的ID格式');
    }
  }

  // 验证外键引用是否存在
  private async validateReferences(canvasSizeId?: string, themeId?: string): Promise<void> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();

    if (canvasSizeId) {
      const canvasSizeResult = await connection.query(
        'SELECT 1 FROM canvas_sizes WHERE id = ? AND is_active = 1 LIMIT 1',
        [canvasSizeId]
      );
      if (canvasSizeResult.length === 0) {
        throw new Error('指定的画布尺寸不存在或已禁用');
      }
    }

    if (themeId) {
      const themeResult = await connection.query(
        'SELECT 1 FROM themes WHERE id = ? AND is_active = 1 LIMIT 1',
        [themeId]
      );
      if (themeResult.length === 0) {
        throw new Error('指定的主题不存在或已禁用');
      }
    }
  }
}

// 单例实例
export const albumService = new AlbumService();
