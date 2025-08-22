// 导出控制器

import { Request, Response, NextFunction } from 'express';
import { exportService, ExportOptions } from '../services/ExportService';

export class ExportController {
  // 创建导出任务
  async createExportTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { albumId, pageIds, options } = req.body;

      if (!albumId) {
        res.status(400).json({
          success: false,
          message: '相册ID不能为空'
        });
        return;
      }

      const exportOptions: ExportOptions = {
        format: options?.format || 'A4',
        orientation: options?.orientation || 'portrait',
        quality: options?.quality || 85,
        includeBackground: options?.includeBackground !== false,
        margin: options?.margin || {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      };

      const taskId = await exportService.createExportTask(
        albumId,
        req.userId,
        pageIds,
        exportOptions
      );

      res.status(201).json({
        success: true,
        message: '导出任务创建成功',
        data: {
          taskId,
          status: 'pending'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取导出任务状态
  async getExportTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          message: '任务ID不能为空'
        });
        return;
      }

      const task = exportService.getExportTask(taskId);

      if (!task || task.userId !== req.userId) {
        res.status(404).json({
          success: false,
          message: '导出任务不存在或无权限'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: task.id,
          albumId: task.albumId,
          status: task.status,
          progress: task.progress,
          downloadUrl: task.downloadUrl,
          createTime: task.createTime,
          completeTime: task.completeTime,
          error: task.error
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取用户的导出任务列表
  async getUserExportTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = exportService.getUserExportTasks(req.userId);

      const taskList = tasks.map(task => ({
        id: task.id,
        albumId: task.albumId,
        status: task.status,
        progress: task.progress,
        downloadUrl: task.downloadUrl,
        createTime: task.createTime,
        completeTime: task.completeTime,
        error: task.error
      }));

      res.json({
        success: true,
        data: taskList
      });
    } catch (error) {
      next(error);
    }
  }

  // 下载导出的文件
  async downloadExportFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          message: '任务ID不能为空'
        });
        return;
      }

      const fileInfo = await exportService.downloadExportFile(taskId, req.userId);

      if (!fileInfo) {
        res.status(404).json({
          success: false,
          message: '导出文件不存在或无权限'
        });
        return;
      }

      // 设置响应头
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`,
        'Cache-Control': 'no-cache'
      });

      // 发送文件
      res.sendFile(fileInfo.filePath);
    } catch (error) {
      next(error);
    }
  }

  // 快速导出整个相册
  async exportAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { albumId } = req.params;
      const { options } = req.body;

      if (!albumId) {
        res.status(400).json({
          success: false,
          message: '相册ID不能为空'
        });
        return;
      }

      const exportOptions: ExportOptions = {
        format: options?.format || 'A4',
        orientation: options?.orientation || 'portrait',
        quality: options?.quality || 85,
        includeBackground: options?.includeBackground !== false,
        margin: options?.margin || {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      };

      const taskId = await exportService.createExportTask(
        albumId,
        req.userId,
        undefined, // 导出所有页面
        exportOptions
      );

      res.status(201).json({
        success: true,
        message: '相册导出任务创建成功',
        data: {
          taskId,
          status: 'pending',
          statusUrl: `/api/export/status/${taskId}`,
          downloadUrl: `/api/export/download/${taskId}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 快速导出指定页面
  async exportPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { albumId, pageIds, options } = req.body;

      if (!albumId) {
        res.status(400).json({
          success: false,
          message: '相册ID不能为空'
        });
        return;
      }

      if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
        res.status(400).json({
          success: false,
          message: '页面ID列表不能为空'
        });
        return;
      }

      const exportOptions: ExportOptions = {
        format: options?.format || 'A4',
        orientation: options?.orientation || 'portrait',
        quality: options?.quality || 85,
        includeBackground: options?.includeBackground !== false,
        margin: options?.margin || {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      };

      const taskId = await exportService.createExportTask(
        albumId,
        req.userId,
        pageIds,
        exportOptions
      );

      res.status(201).json({
        success: true,
        message: '页面导出任务创建成功',
        data: {
          taskId,
          status: 'pending',
          pageCount: pageIds.length,
          statusUrl: `/api/export/status/${taskId}`,
          downloadUrl: `/api/export/download/${taskId}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 清理过期的导出任务
  async cleanupExpired(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { maxAge } = req.query;
      const maxAgeMs = maxAge ? parseInt(maxAge as string) * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 默认24小时

      await exportService.cleanupExpiredExports(maxAgeMs);

      res.json({
        success: true,
        message: '过期导出任务清理完成'
      });
    } catch (error) {
      next(error);
    }
  }

  // 取消导出任务
  async cancelExportTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          message: '任务ID不能为空'
        });
        return;
      }

      const task = exportService.getExportTask(taskId);

      if (!task || task.userId !== req.userId) {
        res.status(404).json({
          success: false,
          message: '导出任务不存在或无权限'
        });
        return;
      }

      if (task.status !== 'pending' && task.status !== 'processing') {
        res.status(400).json({
          success: false,
          message: '只能取消待处理或处理中的任务'
        });
        return;
      }

      // 注意：这里简化了取消逻辑，实际实现中可能需要中断正在进行的PDF生成过程
      task.status = 'failed';
      task.error = '用户取消';

      res.json({
        success: true,
        message: '导出任务已取消'
      });
    } catch (error) {
      next(error);
    }
  }
}

// 导出单例实例
export const exportController = new ExportController();
