// 页面路由

import { Router } from 'express';
import { pageController } from '../controllers/PageController';

const router = Router();

// 获取页面统计信息
router.get('/stats', pageController.getPageStats.bind(pageController));

// 获取页面列表（支持搜索和分页）
router.get('/', pageController.getPageList.bind(pageController));

// 创建页面
router.post('/', pageController.createPage.bind(pageController));

// 获取页面详情
router.get('/:id', pageController.getPage.bind(pageController));

// 更新页面
router.put('/:id', pageController.updatePage.bind(pageController));

// 删除页面
router.delete('/:id', pageController.deletePage.bind(pageController));

// 复制页面
router.post('/:id/duplicate', pageController.duplicatePage.bind(pageController));

export default router;
