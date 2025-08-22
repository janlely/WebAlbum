// 相册页面路由 - 处理特定相册的页面操作

import { Router } from 'express';
import { pageController } from '../controllers/PageController';

const router = Router();

// 获取指定相册的所有页面
router.get('/:albumId/pages', pageController.getAlbumPages.bind(pageController));

// 重新排序指定相册的页面
router.put('/:albumId/pages/reorder', pageController.reorderPages.bind(pageController));

export default router;
