// 页面模板路由

import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseManager } from '../database/factory';

const router = Router();

// 获取所有可用的页面模板
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const { category, search, tags } = req.query;
    
    let sql = `
      SELECT id, name, description, preview, frame_definitions, tags, category, is_active
      FROM page_templates 
      WHERE is_active = 1
    `;
    
    const params: any[] = [];
    
    // 按分类过滤
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    // 搜索过滤
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // 按标签过滤
    if (tags) {
      const tagList = (tags as string).split(',');
      const tagConditions = tagList.map(() => 'tags LIKE ?').join(' OR ');
      sql += ` AND (${tagConditions})`;
      tagList.forEach(tag => params.push(`%"${tag.trim()}"%`));
    }
    
    sql += ' ORDER BY category, name';
    
    const templates = await connection.query(sql, params);
    
    // 解析JSON字段
    const processedTemplates = templates.map((template: any) => ({
      ...template,
      frameDefinitions: JSON.parse(template.frame_definitions),
      tags: JSON.parse(template.tags),
      isActive: Boolean(template.is_active)
    }));
    
    res.json({
      success: true,
      data: processedTemplates
    });
  } catch (error) {
    next(error);
  }
});

// 获取指定页面模板详情
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const sql = `
      SELECT id, name, description, preview, frame_definitions, tags, category, is_active
      FROM page_templates 
      WHERE id = ? AND is_active = 1
    `;
    
    const result = await connection.query(sql, [id]);
    
    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: '页面模板不存在'
      });
      return;
    }
    
    const template = {
      ...result[0],
      frameDefinitions: JSON.parse(result[0].frame_definitions),
      tags: JSON.parse(result[0].tags),
      isActive: Boolean(result[0].is_active)
    };
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
});

// 获取页面模板分类列表
router.get('/categories/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const sql = `
      SELECT category, COUNT(*) as count
      FROM page_templates 
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category
    `;
    
    const categories = await connection.query(sql);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// 获取页面模板标签列表
router.get('/tags/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    
    const sql = `
      SELECT tags
      FROM page_templates 
      WHERE is_active = 1
    `;
    
    const result = await connection.query(sql);
    
    // 提取所有标签并去重
    const allTags = new Set<string>();
    result.forEach((row: any) => {
      try {
        const tags = JSON.parse(row.tags);
        if (Array.isArray(tags)) {
          tags.forEach(tag => allTags.add(tag));
        }
      } catch (error) {
        // 忽略JSON解析错误
      }
    });
    
    const uniqueTags = Array.from(allTags).sort();
    
    res.json({
      success: true,
      data: uniqueTags
    });
  } catch (error) {
    next(error);
  }
});

export default router;
