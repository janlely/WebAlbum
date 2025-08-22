// 导出路由

import { Router } from 'express';
import { exportController } from '../controllers/ExportController';

const router = Router();

// 获取用户的导出任务列表
router.get('/tasks', exportController.getUserExportTasks.bind(exportController));

// 创建通用导出任务
router.post('/task', exportController.createExportTask.bind(exportController));

// 快速导出整个相册
router.post('/album/:albumId', exportController.exportAlbum.bind(exportController));

// 快速导出指定页面
router.post('/pages', exportController.exportPages.bind(exportController));

// 获取导出任务状态
router.get('/status/:taskId', exportController.getExportTask.bind(exportController));

// 下载导出的文件
router.get('/download/:taskId', exportController.downloadExportFile.bind(exportController));

// 取消导出任务
router.delete('/task/:taskId', exportController.cancelExportTask.bind(exportController));

// 清理过期的导出任务（管理员功能）
router.post('/cleanup', exportController.cleanupExpired.bind(exportController));

export default router;
