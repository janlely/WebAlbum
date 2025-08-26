// 相册路由

import { Router } from 'express';
import { albumController } from '../controllers/AlbumController';
import { userContextMiddleware, requireUserMiddleware } from '../middleware/userContext';

const router = Router();

// 获取相册统计信息
router.get('/stats', userContextMiddleware, requireUserMiddleware, albumController.getAlbumStats.bind(albumController));

// 获取相册摘要列表
router.get('/summaries', userContextMiddleware, requireUserMiddleware, albumController.getAlbumSummaries.bind(albumController));

// 获取相册列表
router.get('/', userContextMiddleware, requireUserMiddleware, albumController.getAlbumList.bind(albumController));

// 创建相册
router.post('/', userContextMiddleware, requireUserMiddleware, albumController.createAlbum.bind(albumController));

// 获取相册详情
router.get('/:id', userContextMiddleware, requireUserMiddleware, albumController.getAlbum.bind(albumController));

// 更新相册
router.put('/:id', userContextMiddleware, requireUserMiddleware, albumController.updateAlbum.bind(albumController));

// 删除相册
router.delete('/:id', userContextMiddleware, requireUserMiddleware, albumController.deleteAlbum.bind(albumController));

export default router;
