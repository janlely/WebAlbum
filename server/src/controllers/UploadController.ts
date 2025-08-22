// 文件上传控制器

import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/UploadService';

export class UploadController {
  // 单个文件上传
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: '未找到上传的文件'
        });
        return;
      }

      const uploadedFile = await uploadService.processUpload(file, req.userId);

      res.status(201).json({
        success: true,
        message: '文件上传成功',
        data: uploadedFile
      });
    } catch (error) {
      next(error);
    }
  }

  // 批量文件上传
  async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = (req as any).files;
      if (!files || !Array.isArray(files) || files.length === 0) {
        res.status(400).json({
          success: false,
          message: '未找到上传的文件'
        });
        return;
      }

      const uploadedFiles = await uploadService.processBatchUpload(files, req.userId);

      res.status(201).json({
        success: true,
        message: `成功上传 ${uploadedFiles.length} 个文件`,
        data: uploadedFiles
      });
    } catch (error) {
      next(error);
    }
  }

  // 压缩图片
  async compressImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: '未找到要压缩的文件'
        });
        return;
      }

      const {
        quality = 85,
        width,
        height,
        format = 'jpeg'
      } = req.body;

      const compressedBuffer = await uploadService.compressImage(file.buffer, {
        quality: parseInt(quality),
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        format
      });

      // 设置响应头
      res.set({
        'Content-Type': `image/${format}`,
        'Content-Length': compressedBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="compressed.${format}"`
      });

      res.send(compressedBuffer);
    } catch (error) {
      next(error);
    }
  }

  // 删除文件
  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          success: false,
          message: '文件ID不能为空'
        });
        return;
      }

      await uploadService.deleteFile(fileId);

      res.json({
        success: true,
        message: '文件删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取文件信息
  async getFileInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename } = req.params;

      if (!filename) {
        res.status(400).json({
          success: false,
          message: '文件名不能为空'
        });
        return;
      }

      const fileInfo = await uploadService.getFileInfo(filename);

      if (!fileInfo.exists) {
        res.status(404).json({
          success: false,
          message: '文件不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          filename,
          size: fileInfo.stats.size,
          lastModified: fileInfo.stats.mtime,
          created: fileInfo.stats.birthtime
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取存储使用情况
  async getStorageUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await uploadService.getStorageUsage();

      res.json({
        success: true,
        data: {
          ...usage,
          totalSizeMB: Math.round(usage.totalSize / 1024 / 1024 * 100) / 100,
          uploadDirSizeMB: Math.round(usage.uploadDirSize / 1024 / 1024 * 100) / 100,
          thumbnailDirSizeMB: Math.round(usage.thumbnailDirSize / 1024 / 1024 * 100) / 100
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 图片处理和转换
  async processImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: '未找到要处理的文件'
        });
        return;
      }

      const {
        operation = 'resize',
        width,
        height,
        quality = 85,
        format = 'jpeg',
        blur,
        sharpen,
        brightness,
        contrast,
        saturation
      } = req.body;

      let processedBuffer: Buffer;

      switch (operation) {
        case 'compress':
          processedBuffer = await uploadService.compressImage(file.buffer, {
            quality: parseInt(quality),
            width: width ? parseInt(width) : undefined,
            height: height ? parseInt(height) : undefined,
            format
          });
          break;

        default:
          processedBuffer = await uploadService.compressImage(file.buffer, {
            quality: parseInt(quality),
            format
          });
      }

      // 设置响应头
      res.set({
        'Content-Type': `image/${format}`,
        'Content-Length': processedBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="processed.${format}"`
      });

      res.send(processedBuffer);
    } catch (error) {
      next(error);
    }
  }
}

// 导出单例实例
export const uploadController = new UploadController();