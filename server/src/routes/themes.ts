// 主题路由

import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseManager } from '../database/factory';

const router = Router();

// 获取所有可用的主题
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const sql = `
      SELECT id, name, description, background_color, background_gradient,
             primary_color, secondary_color, text_color, preview, is_active
      FROM themes 
      WHERE is_active = 1
      ORDER BY name
    `;
    
    const themes = await connection.query(sql);
    
    // 将数据库字段名映射为前端期望的格式
    const mappedThemes = themes.map((theme: any) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      backgroundColor: theme.background_color,
      backgroundGradient: theme.background_gradient,
      primaryColor: theme.primary_color,
      secondaryColor: theme.secondary_color,
      textColor: theme.text_color,
      preview: theme.preview,
      isActive: Boolean(theme.is_active)
    }));
    
    res.json({
      success: true,
      data: mappedThemes
    });
  } catch (error) {
    next(error);
  }
});

// 获取指定主题详情
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const sql = `
      SELECT id, name, description, background_color, background_gradient,
             primary_color, secondary_color, text_color, preview, is_active
      FROM themes 
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await connection.query(sql, [id]);
    
    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: '主题不存在'
      });
      return;
    }
    
    // 将数据库字段名映射为前端期望的格式
    const theme = result[0];
    const mappedTheme = {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      backgroundColor: theme.background_color,
      backgroundGradient: theme.background_gradient,
      primaryColor: theme.primary_color,
      secondaryColor: theme.secondary_color,
      textColor: theme.text_color,
      preview: theme.preview,
      isActive: Boolean(theme.is_active)
    };
    
    res.json({
      success: true,
      data: mappedTheme
    });
  } catch (error) {
    next(error);
  }
});

export default router;
