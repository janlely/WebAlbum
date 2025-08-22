// 页面控制器

import { Request, Response, NextFunction } from 'express';
import { pageService, PageListResult } from '../services/PageService';
import { CreatePageRequest, UpdatePageRequest, PageListQuery } from '../models/PageDAO';

export class PageController {
  // 创建页面
  async createPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageData: CreatePageRequest = {
        albumId: req.body.albumId,
        name: req.body.name,
        order: req.body.order || 0,
        templateId: req.body.templateId,
        elements: req.body.elements || [],
        backgroundColor: req.body.backgroundColor,
        backgroundImage: req.body.backgroundImage,
        userId: req.userId // 从用户上下文中获取
      };

      const page = await pageService.createPage(pageData);

      res.status(201).json({
        success: true,
        message: '页面创建成功',
        data: page
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取页面详情
  async getPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = await pageService.getPageById(id, req.userId);

      if (!page) {
        res.status(404).json({
          success: false,
          message: '页面不存在或无访问权限'
        });
        return;
      }

      res.json({
        success: true,
        data: page
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取相册的所有页面
  async getAlbumPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { albumId } = req.params;
      const pages = await pageService.getAlbumPages(albumId, req.userId);

      res.json({
        success: true,
        data: pages
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取页面列表（带搜索和分页）
  async getPageList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20,
        albumId: req.query.albumId as string,
        search: req.query.search as string,
        templateId: req.query.templateId as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
        userId: req.userId // 从用户上下文中获取
      };

      const result = await pageService.getPageList(query);

      res.json({
        success: true,
        data: result.pages,
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

  // 更新页面
  async updatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdatePageRequest = {
        name: req.body.name,
        order: req.body.order,
        templateId: req.body.templateId,
        elements: req.body.elements,
        backgroundColor: req.body.backgroundColor,
        backgroundImage: req.body.backgroundImage
      };

      // 过滤掉undefined的字段
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdatePageRequest] === undefined) {
          delete updateData[key as keyof UpdatePageRequest];
        }
      });

      const page = await pageService.updatePage(id, updateData, req.userId);

      if (!page) {
        res.status(404).json({
          success: false,
          message: '页面不存在或无访问权限'
        });
        return;
      }

      res.json({
        success: true,
        message: '页面更新成功',
        data: page
      });
    } catch (error) {
      next(error);
    }
  }

  // 删除页面
  async deletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await pageService.deletePage(id, req.userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: '页面不存在或无访问权限'
        });
        return;
      }

      res.json({
        success: true,
        message: '页面删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 重新排序页面
  async reorderPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { albumId } = req.params;
      const { pageIds } = req.body;

      if (!Array.isArray(pageIds)) {
        res.status(400).json({
          success: false,
          message: 'pageIds必须是数组'
        });
        return;
      }

      const success = await pageService.reorderPages(albumId, pageIds, req.userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: '相册不存在或无访问权限'
        });
        return;
      }

      res.json({
        success: true,
        message: '页面顺序更新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 复制页面
  async duplicatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = await pageService.duplicatePage(id, req.userId);

      if (!page) {
        res.status(404).json({
          success: false,
          message: '页面不存在或无访问权限'
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: '页面复制成功',
        data: page
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取页面统计
  async getPageStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { albumId } = req.query;
      const stats = await pageService.getPageStats(
        albumId as string,
        req.userId
      );

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
export const pageController = new PageController();
