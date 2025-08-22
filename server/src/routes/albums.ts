// 相册路由

import { Router } from 'express';
import { albumController } from '../controllers/AlbumController';

const router = Router();

// 获取相册统计信息
router.get('/stats', albumController.getAlbumStats.bind(albumController));

// 获取相册摘要列表
router.get('/summaries', albumController.getAlbumSummaries.bind(albumController));

// 获取相册列表
router.get('/', albumController.getAlbumList.bind(albumController));

// 创建相册
router.post('/', albumController.createAlbum.bind(albumController));

// 获取相册详情
router.get('/:id', albumController.getAlbum.bind(albumController));

// 更新相册
router.put('/:id', albumController.updateAlbum.bind(albumController));

// 删除相册
router.delete('/:id', albumController.deleteAlbum.bind(albumController));

export default router;
