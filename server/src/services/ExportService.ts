// PDF导出服务

import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseManager } from '../database/factory';
import { AlbumModel, PageModel } from '../types/database';

export interface ExportOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  quality?: number; // 1-100
  includeBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export interface ExportTask {
  id: string;
  albumId: string;
  pageIds?: string[];
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  filename?: string;
  filePath?: string;
  downloadUrl?: string;
  options: ExportOptions;
  createTime: number;
  completeTime?: number;
  error?: string;
}

export class ExportService {
  private browser: Browser | null = null;
  private exportTasks: Map<string, ExportTask> = new Map();
  private exportDir: string;

  constructor() {
    this.exportDir = path.join(process.cwd(), 'exports');
    this.ensureExportDirExists();
  }

  // 确保导出目录存在
  private async ensureExportDirExists(): Promise<void> {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
    } catch (error) {
      console.error('创建导出目录失败:', error);
    }
  }

  // 初始化浏览器
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  // 创建导出任务
  async createExportTask(
    albumId: string,
    userId: string,
    pageIds?: string[],
    options: ExportOptions = {}
  ): Promise<string> {
    const taskId = uuidv4();
    
    const task: ExportTask = {
      id: taskId,
      albumId,
      pageIds,
      userId,
      status: 'pending',
      progress: 0,
      options: {
        format: 'A4',
        orientation: 'portrait',
        quality: 85,
        includeBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        },
        ...options
      },
      createTime: Date.now()
    };

    this.exportTasks.set(taskId, task);
    
    // 异步处理导出任务
    this.processExportTask(taskId).catch(error => {
      console.error('导出任务处理失败:', error);
      this.updateTaskStatus(taskId, 'failed', error.message);
    });

    return taskId;
  }

  // 处理导出任务
  private async processExportTask(taskId: string): Promise<void> {
    const task = this.exportTasks.get(taskId);
    if (!task) {
      throw new Error('导出任务不存在');
    }

    try {
      this.updateTaskStatus(taskId, 'processing');

      // 获取相册和页面数据
      const { album, pages } = await this.getAlbumData(task.albumId, task.pageIds, task.userId);
      
      if (!album) {
        throw new Error('相册不存在或无权限');
      }

      this.updateTaskProgress(taskId, 10);

      // 生成HTML内容
      const htmlContent = await this.generateHTML(album, pages);
      this.updateTaskProgress(taskId, 30);

      // 生成PDF
      const pdfBuffer = await this.generatePDF(htmlContent, task.options);
      this.updateTaskProgress(taskId, 80);

      // 保存文件
      const filename = `${album.name}_${Date.now()}.pdf`;
      const filePath = path.join(this.exportDir, filename);
      await fs.writeFile(filePath, pdfBuffer);

      // 更新任务状态
      task.filename = filename;
      task.filePath = filePath;
      task.downloadUrl = `/api/export/download/${taskId}`;
      task.completeTime = Date.now();
      
      this.updateTaskStatus(taskId, 'completed');
      this.updateTaskProgress(taskId, 100);

      console.log('PDF导出完成:', filename);
    } catch (error) {
      console.error('PDF导出失败:', error);
      this.updateTaskStatus(taskId, 'failed', error instanceof Error ? error.message : '未知错误');
    }
  }

  // 获取相册和页面数据
  private async getAlbumData(
    albumId: string, 
    pageIds?: string[], 
    userId?: string
  ): Promise<{ album: AlbumModel | null; pages: PageModel[] }> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();

    // 获取相册信息
    let albumSql = `
      SELECT id, name, description, canvas_size_id as canvasSizeId, theme_id as themeId,
             settings, page_count as pageCount, thumbnail, tags, category, user_id as userId,
             created_at as createdAt, updated_at as updatedAt
      FROM albums WHERE id = ?
    `;
    const albumParams = [albumId];

    if (userId) {
      albumSql += ' AND user_id = ?';
      albumParams.push(userId);
    }

    const albumResult = await connection.query(albumSql, albumParams);
    const album = albumResult.length > 0 ? this.mapAlbumRow(albumResult[0]) : null;

    // 获取页面信息
    let pagesSql = `
      SELECT p.id, p.album_id as albumId, p.name, p.page_order as "order",
             p.template_id as templateId, p.elements, p.background_color as backgroundColor,
             p.background_image as backgroundImage, p.created_at as createdAt,
             p.updated_at as updatedAt
      FROM pages p
      WHERE p.album_id = ?
    `;
    const pagesParams = [albumId];

    if (pageIds && pageIds.length > 0) {
      const placeholders = pageIds.map(() => '?').join(',');
      pagesSql += ` AND p.id IN (${placeholders})`;
      pagesParams.push(...pageIds);
    }

    if (userId) {
      pagesSql += ' AND EXISTS (SELECT 1 FROM albums a WHERE a.id = p.album_id AND a.user_id = ?)';
      pagesParams.push(userId);
    }

    pagesSql += ' ORDER BY p.page_order ASC';

    const pagesResult = await connection.query(pagesSql, pagesParams);
    const pages = pagesResult.map(row => this.mapPageRow(row));

    return { album, pages };
  }

  // 生成HTML内容
  private async generateHTML(album: AlbumModel, pages: PageModel[]): Promise<string> {
    // 获取画布尺寸和主题信息
    const { canvasSize, theme } = await this.getCanvasSizeAndTheme(album.canvasSizeId, album.themeId);

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${album.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Microsoft YaHei', sans-serif;
            background: ${theme?.backgroundColor || '#ffffff'};
            color: ${theme?.textColor || '#000000'};
        }
        
        .page {
            width: ${canvasSize?.width || 210}mm;
            height: ${canvasSize?.height || 297}mm;
            margin: 0 auto;
            position: relative;
            page-break-after: always;
            background: white;
            overflow: hidden;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        .page-content {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        .element {
            position: absolute;
        }
        
        .photo-element {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }
        
        .text-element {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            word-wrap: break-word;
            overflow: hidden;
        }
        
        .shape-element {
            border-radius: 0;
        }
        
        .shape-circle {
            border-radius: 50%;
        }
        
        @media print {
            @page {
                margin: 0;
                size: ${canvasSize?.width || 210}mm ${canvasSize?.height || 297}mm;
            }
            
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    ${pages.map(page => this.generatePageHTML(page)).join('')}
</body>
</html>`;

    return html;
  }

  // 生成单个页面HTML
  private generatePageHTML(page: PageModel): string {
    const elements = JSON.parse(page.elements);
    
    const elementsHTML = elements.map((element: any) => {
      const style = `
        left: ${(element.x * 100)}%;
        top: ${(element.y * 100)}%;
        width: ${(element.width * 100)}%;
        height: ${(element.height * 100)}%;
        transform: rotate(${element.rotation || 0}deg);
        opacity: ${element.opacity || 1};
        z-index: ${element.zIndex || 1};
      `;

      switch (element.type) {
        case 'photo':
          return `
            <div class="element photo-element" style="${style}
              background-image: url('${element.url}');
              border-radius: ${element.borderRadius || 0}px;
              border: ${element.borderWidth || 0}px solid ${element.borderColor || 'transparent'};
              box-shadow: ${element.shadow || 'none'};
              filter: brightness(${element.brightness || 1}) 
                     contrast(${element.contrast || 1}) 
                     saturate(${element.saturation || 1});
            "></div>`;

        case 'text':
          return `
            <div class="element text-element" style="${style}
              font-family: ${element.fontFamily || 'Arial'};
              font-size: ${element.fontSize || 16}px;
              font-weight: ${element.fontWeight || 'normal'};
              font-style: ${element.fontStyle || 'normal'};
              color: ${element.color || '#000000'};
              background-color: ${element.backgroundColor || 'transparent'};
              text-align: ${element.textAlign || 'center'};
              line-height: ${element.lineHeight || 1.2};
              letter-spacing: ${element.letterSpacing || 0}px;
              text-shadow: ${element.shadow || 'none'};
            ">${element.content || ''}</div>`;

        case 'shape':
          return `
            <div class="element shape-element ${element.shapeType === 'circle' ? 'shape-circle' : ''}" style="${style}
              background-color: ${element.fillColor || 'transparent'};
              border: ${element.strokeWidth || 0}px solid ${element.strokeColor || 'transparent'};
              border-radius: ${element.borderRadius || 0}px;
            "></div>`;

        default:
          return '';
      }
    }).join('');

    return `
      <div class="page" style="
        background-color: ${page.backgroundColor || 'white'};
        ${page.backgroundImage ? `background-image: url('${page.backgroundImage}'); background-size: cover; background-position: center;` : ''}
      ">
        <div class="page-content">
          ${elementsHTML}
        </div>
      </div>`;
  }

  // 生成PDF
  private async generatePDF(htmlContent: string, options: ExportOptions): Promise<Buffer> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // 设置页面内容
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 等待图片加载
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 生成PDF
      const pdfBuffer = await page.pdf({
        format: options.format as any,
        landscape: options.orientation === 'landscape',
        printBackground: options.includeBackground,
        margin: options.margin,
        preferCSSPageSize: true
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  // 获取画布尺寸和主题信息
  private async getCanvasSizeAndTheme(canvasSizeId: string, themeId: string) {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();

    const [canvasSizeResult, themeResult] = await Promise.all([
      connection.query('SELECT * FROM canvas_sizes WHERE id = ?', [canvasSizeId]),
      connection.query('SELECT * FROM themes WHERE id = ?', [themeId])
    ]);

    return {
      canvasSize: canvasSizeResult[0] || null,
      theme: themeResult[0] || null
    };
  }

  // 获取导出任务状态
  getExportTask(taskId: string): ExportTask | null {
    return this.exportTasks.get(taskId) || null;
  }

  // 获取用户的导出任务列表
  getUserExportTasks(userId: string): ExportTask[] {
    return Array.from(this.exportTasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => b.createTime - a.createTime);
  }

  // 下载导出的文件
  async downloadExportFile(taskId: string, userId: string): Promise<{ filePath: string; filename: string } | null> {
    const task = this.exportTasks.get(taskId);
    
    if (!task || task.userId !== userId || task.status !== 'completed' || !task.filePath) {
      return null;
    }

    // 检查文件是否存在
    try {
      await fs.access(task.filePath);
      return {
        filePath: task.filePath,
        filename: task.filename || 'export.pdf'
      };
    } catch (error) {
      return null;
    }
  }

  // 清理过期的导出文件
  async cleanupExpiredExports(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const expiredTasks: string[] = [];

    for (const [taskId, task] of this.exportTasks.entries()) {
      if (now - task.createTime > maxAge) {
        expiredTasks.push(taskId);
        
        // 删除文件
        if (task.filePath) {
          try {
            await fs.unlink(task.filePath);
          } catch (error) {
            console.error('删除过期导出文件失败:', error);
          }
        }
      }
    }

    // 删除过期任务记录
    expiredTasks.forEach(taskId => {
      this.exportTasks.delete(taskId);
    });

    if (expiredTasks.length > 0) {
      console.log(`清理了 ${expiredTasks.length} 个过期导出任务`);
    }
  }

  // 更新任务状态
  private updateTaskStatus(taskId: string, status: ExportTask['status'], error?: string): void {
    const task = this.exportTasks.get(taskId);
    if (task) {
      task.status = status;
      if (error) {
        task.error = error;
      }
    }
  }

  // 更新任务进度
  private updateTaskProgress(taskId: string, progress: number): void {
    const task = this.exportTasks.get(taskId);
    if (task) {
      task.progress = Math.min(100, Math.max(0, progress));
    }
  }

  // 映射相册数据
  private mapAlbumRow(row: any): AlbumModel {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      canvasSizeId: row.canvasSizeId,
      themeId: row.themeId,
      settings: row.settings,
      pageCount: row.pageCount,
      thumbnail: row.thumbnail,
      tags: row.tags,
      category: row.category,
      userId: row.userId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  // 映射页面数据
  private mapPageRow(row: any): PageModel {
    return {
      id: row.id,
      albumId: row.albumId,
      name: row.name,
      order: row.order,
      templateId: row.templateId,
      elements: row.elements,
      backgroundColor: row.backgroundColor,
      backgroundImage: row.backgroundImage,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  // 关闭浏览器
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// 单例实例
export const exportService = new ExportService();
