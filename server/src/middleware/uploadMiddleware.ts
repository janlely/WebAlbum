// 文件上传中间件

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

// 内存存储配置（用于处理后再保存）
const memoryStorage = multer.memoryStorage();

// 上传配置
const uploadConfig = {
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // 最多10个文件
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // 检查文件类型
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`));
      return;
    }

    // 检查文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    
    if (!allowedExts.includes(ext)) {
      cb(new Error(`不支持的文件扩展名: ${ext}`));
      return;
    }

    cb(null, true);
  }
};

// 单文件上传中间件
export const uploadSingle = multer(uploadConfig).single('image');

// 多文件上传中间件
export const uploadMultiple = multer(uploadConfig).array('images', 10);

// 图片压缩处理中间件
export const uploadForProcessing = multer(uploadConfig).single('image');

// 错误处理中间件
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: '文件大小超过限制 (10MB)'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: '文件数量超过限制 (10个)'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: '意外的文件字段'
        });
      default:
        return res.status(400).json({
          success: false,
          message: `上传错误: ${error.message}`
        });
    }
  }

  if (error.message.includes('不支持的文件类型') || error.message.includes('不支持的文件扩展名')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};
