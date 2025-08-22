// 画布尺寸路由

import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseManager } from '../database/factory';

const router = Router();

// 获取所有可用的画布尺寸
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const sql = `
      SELECT id, name, width, height, aspect_ratio, description, is_active
      FROM canvas_sizes 
      WHERE is_active = 1
      ORDER BY name
    `;
    
    const canvasSizes = await connection.query(sql);
    
    // 将数据库字段名映射为前端期望的格式
    const mappedSizes = canvasSizes.map((size: any) => ({
      id: size.id,
      name: size.name,
      width: size.width,
      height: size.height,
      aspectRatio: size.aspect_ratio,
      description: size.description,
      isActive: Boolean(size.is_active)
    }));
    
    res.json({
      success: true,
      data: mappedSizes
    });
  } catch (error) {
    next(error);
  }
});

// 获取指定画布尺寸详情
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const sql = `
      SELECT id, name, width, height, aspect_ratio, description, is_active
      FROM canvas_sizes 
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await connection.query(sql, [id]);
    
    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: '画布尺寸不存在'
      });
      return;
    }
    
    // 将数据库字段名映射为前端期望的格式
    const size = result[0];
    const mappedSize = {
      id: size.id,
      name: size.name,
      width: size.width,
      height: size.height,
      aspectRatio: size.aspect_ratio,
      description: size.description,
      isActive: Boolean(size.is_active)
    };
    
    res.json({
      success: true,
      data: mappedSize
    });
  } catch (error) {
    next(error);
  }
});

export default router;
