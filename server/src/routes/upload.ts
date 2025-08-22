// 文件上传路由

import { Router } from 'express';
import { uploadController } from '../controllers/UploadController';
import { 
  uploadSingle, 
  uploadMultiple, 
  uploadForProcessing, 
  handleUploadError 
} from '../middleware/uploadMiddleware';

const router = Router();

// 获取存储使用情况
router.get('/usage', uploadController.getStorageUsage.bind(uploadController));

// 单个图片上传
router.post('/image', 
  uploadSingle,
  handleUploadError,
  uploadController.uploadImage.bind(uploadController)
);

// 批量图片上传
router.post('/images', 
  uploadMultiple,
  handleUploadError,
  uploadController.uploadImages.bind(uploadController)
);

// 图片压缩
router.post('/compress', 
  uploadForProcessing,
  handleUploadError,
  uploadController.compressImage.bind(uploadController)
);

// 图片处理
router.post('/process', 
  uploadForProcessing,
  handleUploadError,
  uploadController.processImage.bind(uploadController)
);

// 获取文件信息
router.get('/info/:filename', uploadController.getFileInfo.bind(uploadController));

// 删除文件
router.delete('/:fileId', uploadController.deleteFile.bind(uploadController));

export default router;
