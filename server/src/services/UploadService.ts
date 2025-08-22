// 文件上传服务

import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadConfig {
  maxFileSize: number; // 最大文件大小（字节）
  allowedMimeTypes: string[]; // 允许的MIME类型
  uploadDir: string; // 上传目录
  thumbnailDir: string; // 缩略图目录
  thumbnailSizes: { width: number; height: number; suffix: string }[]; // 缩略图尺寸
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  thumbnails: {
    [suffix: string]: {
      filename: string;
      path: string;
      url: string;
      width: number;
      height: number;
    };
  };
  uploadTime: number;
  userId: string;
}

export class UploadService {
  private config: UploadConfig;

  constructor(config?: Partial<UploadConfig>) {
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff'
      ],
      uploadDir: path.join(process.cwd(), 'uploads', 'images'),
      thumbnailDir: path.join(process.cwd(), 'uploads', 'thumbnails'),
      thumbnailSizes: [
        { width: 150, height: 150, suffix: 'thumb' },
        { width: 400, height: 400, suffix: 'medium' },
        { width: 800, height: 600, suffix: 'large' }
      ],
      ...config
    };

    // 确保目录存在
    this.ensureDirectoriesExist();
  }

  // 确保必要的目录存在
  private async ensureDirectoriesExist(): Promise<void> {
    try {
      await fs.mkdir(this.config.uploadDir, { recursive: true });
      await fs.mkdir(this.config.thumbnailDir, { recursive: true });
    } catch (error) {
      console.error('创建上传目录失败:', error);
    }
  }

  // 验证文件
  validateFile(file: any): void {
    // 检查文件大小
    if (file.size > this.config.maxFileSize) {
      throw new Error(`文件大小超过限制 (${this.config.maxFileSize / 1024 / 1024}MB)`);
    }

    // 检查MIME类型
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`不支持的文件类型: ${file.mimetype}`);
    }

    // 检查文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    if (!allowedExts.includes(ext)) {
      throw new Error(`不支持的文件扩展名: ${ext}`);
    }
  }

  // 处理单个文件上传
  async processUpload(file: any, userId: string): Promise<UploadedFile> {
    // 验证文件
    this.validateFile(file);

    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const filePath = path.join(this.config.uploadDir, filename);

    try {
      // 保存原始文件
      await fs.writeFile(filePath, file.buffer);

      // 生成缩略图
      const thumbnails = await this.generateThumbnails(file.buffer, fileId, ext);

      // 获取图片元数据
      const metadata = await sharp(file.buffer).metadata();

      const uploadedFile: UploadedFile = {
        id: fileId,
        originalName: file.originalname,
        filename,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        url: `/uploads/images/${filename}`,
        thumbnails,
        uploadTime: Date.now(),
        userId
      };

      console.log('文件上传成功:', uploadedFile.originalName);
      return uploadedFile;
    } catch (error) {
      // 清理已创建的文件
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('清理文件失败:', cleanupError);
      }
      throw error;
    }
  }

  // 生成缩略图
  private async generateThumbnails(
    buffer: Buffer, 
    fileId: string, 
    ext: string
  ): Promise<UploadedFile['thumbnails']> {
    const thumbnails: UploadedFile['thumbnails'] = {};

    for (const size of this.config.thumbnailSizes) {
      const thumbnailFilename = `${fileId}_${size.suffix}${ext}`;
      const thumbnailPath = path.join(this.config.thumbnailDir, thumbnailFilename);

      try {
        await sharp(buffer)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 }) // 统一输出为JPEG格式以减小文件大小
          .toFile(thumbnailPath);

        thumbnails[size.suffix] = {
          filename: thumbnailFilename,
          path: thumbnailPath,
          url: `/uploads/thumbnails/${thumbnailFilename}`,
          width: size.width,
          height: size.height
        };
      } catch (error) {
        console.error(`生成缩略图失败 (${size.suffix}):`, error);
        // 不中断流程，继续生成其他尺寸
      }
    }

    return thumbnails;
  }

  // 批量处理文件上传
  async processBatchUpload(files: any[], userId: string): Promise<UploadedFile[]> {
    const results: UploadedFile[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (const file of files) {
      try {
        const uploadedFile = await this.processUpload(file, userId);
        results.push(uploadedFile);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    if (errors.length > 0) {
      console.warn('批量上传部分失败:', errors);
    }

    return results;
  }

  // 删除文件
  async deleteFile(fileId: string): Promise<void> {
    try {
      // 这里应该从数据库获取文件信息，暂时使用简单的文件名匹配
      const files = await fs.readdir(this.config.uploadDir);
      const thumbnailFiles = await fs.readdir(this.config.thumbnailDir);

      // 删除主文件
      const mainFile = files.find(f => f.startsWith(fileId));
      if (mainFile) {
        await fs.unlink(path.join(this.config.uploadDir, mainFile));
      }

      // 删除缩略图
      const relatedThumbnails = thumbnailFiles.filter(f => f.startsWith(fileId));
      for (const thumbnail of relatedThumbnails) {
        await fs.unlink(path.join(this.config.thumbnailDir, thumbnail));
      }

      console.log('文件删除成功:', fileId);
    } catch (error) {
      console.error('删除文件失败:', error);
      throw new Error('删除文件失败');
    }
  }

  // 获取文件信息
  async getFileInfo(filename: string): Promise<{ exists: boolean; stats?: any }> {
    try {
      const filePath = path.join(this.config.uploadDir, filename);
      const stats = await fs.stat(filePath);
      return { exists: true, stats };
    } catch (error) {
      return { exists: false };
    }
  }

  // 压缩图片
  async compressImage(
    buffer: Buffer, 
    options: {
      quality?: number;
      width?: number;
      height?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    const {
      quality = 85,
      width,
      height,
      format = 'jpeg'
    } = options;

    let pipeline = sharp(buffer);

    // 调整尺寸
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // 设置输出格式和质量
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
    }

    return pipeline.toBuffer();
  }

  // 获取存储使用情况
  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
    uploadDirSize: number;
    thumbnailDirSize: number;
  }> {
    try {
      const [uploadFiles, thumbnailFiles] = await Promise.all([
        fs.readdir(this.config.uploadDir),
        fs.readdir(this.config.thumbnailDir)
      ]);

      let uploadDirSize = 0;
      let thumbnailDirSize = 0;

      // 计算上传目录大小
      for (const file of uploadFiles) {
        const stats = await fs.stat(path.join(this.config.uploadDir, file));
        uploadDirSize += stats.size;
      }

      // 计算缩略图目录大小
      for (const file of thumbnailFiles) {
        const stats = await fs.stat(path.join(this.config.thumbnailDir, file));
        thumbnailDirSize += stats.size;
      }

      return {
        totalFiles: uploadFiles.length,
        totalSize: uploadDirSize + thumbnailDirSize,
        uploadDirSize,
        thumbnailDirSize
      };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        uploadDirSize: 0,
        thumbnailDirSize: 0
      };
    }
  }
}

// 单例实例
export const uploadService = new UploadService();
