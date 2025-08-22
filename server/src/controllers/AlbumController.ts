// 相册控制器

import { Request, Response, NextFunction } from 'express';
import { albumService, AlbumListQuery } from '../services/AlbumService';
import { CreateAlbumRequest, UpdateAlbumRequest } from '../models/AlbumDAO';

export class AlbumController {
  // 创建相册
  async createAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const albumData: CreateAlbumRequest = {
        name: req.body.name,
        description: req.body.description,
        canvasSizeId: req.body.canvasSizeId,
        themeId: req.body.themeId,
        settings: req.body.settings,
        tags: req.body.tags,
        category: req.body.category,
        userId: req.userId // 从用户上下文中获取
      };

      const album = await albumService.createAlbum(albumData);

      res.status(201).json({
        success: true,
        message: '相册创建成功',
        data: album
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取相册详情
  async getAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const album = await albumService.getAlbumById(id, req.userId);

      if (!album) {
        res.status(404).json({
          success: false,
          message: '相册不存在或无访问权限'
        });
        return;
      }

      res.json({
        success: true,
        data: album
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取相册列表
  async getAlbumList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AlbumListQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        search: req.query.search as string,
        category: req.query.category as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
        userId: req.userId // 从用户上下文中获取
      };

      const result = await albumService.getAlbumList(query);

      res.json({
        success: true,
        data: result.albums,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取相册摘要（轻量级列表）
  async getAlbumSummaries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
      };

      const summaries = await albumService.getAlbumSummaries(req.userId, options);

      res.json({
        success: true,
        data: summaries
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新相册
  async updateAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateAlbumRequest = {
        name: req.body.name,
        description: req.body.description,
        canvasSizeId: req.body.canvasSizeId,
        themeId: req.body.themeId,
        settings: req.body.settings,
        thumbnail: req.body.thumbnail,
        tags: req.body.tags,
        category: req.body.category
      };

      // 过滤掉undefined的字段
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateAlbumRequest] === undefined) {
          delete updateData[key as keyof UpdateAlbumRequest];
        }
      });

      const album = await albumService.updateAlbum(id, updateData, req.userId);

      if (!album) {
        res.status(404).json({
          success: false,
          message: '相册不存在或无访问权限'
        });
        return;
      }

      res.json({
        success: true,
        message: '相册更新成功',
        data: album
      });
    } catch (error) {
      next(error);
    }
  }

  // 删除相册
  async deleteAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await albumService.deleteAlbum(id, req.userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: '相册不存在或无访问权限'
        });
        return;
      }

      res.json({
        success: true,
        message: '相册删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取相册统计
  async getAlbumStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await albumService.getAlbumStats(req.userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

// 导出单例实例
export const albumController = new AlbumController();
