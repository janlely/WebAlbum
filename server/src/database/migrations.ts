// 数据库迁移系统

import { DatabaseConnection } from '../types/database';
import { DatabaseManager } from './factory';

export interface Migration {
  version: string;
  description: string;
  up: string[];
  down: string[];
}

export class MigrationManager {
  private connection: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  // 初始化迁移表
  async initializeMigrationTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.connection.execute(sql);
  }

  // 获取已应用的迁移
  async getAppliedMigrations(): Promise<string[]> {
    const result = await this.connection.query(
      'SELECT version FROM migrations ORDER BY applied_at'
    );
    return result.map(row => row.version);
  }

  // 应用迁移
  async applyMigration(migration: Migration): Promise<void> {
    try {
      await this.connection.beginTransaction();

      // 执行迁移SQL
      for (const sql of migration.up) {
        await this.connection.execute(sql);
      }

      // 记录迁移
      await this.connection.execute(
        'INSERT INTO migrations (version, description) VALUES (?, ?)',
        [migration.version, migration.description]
      );

      await this.connection.commit();
      console.log(`Applied migration: ${migration.version} - ${migration.description}`);
    } catch (error) {
      await this.connection.rollback();
      throw error;
    }
  }

  // 回滚迁移
  async rollbackMigration(migration: Migration): Promise<void> {
    try {
      await this.connection.beginTransaction();

      // 执行回滚SQL
      for (const sql of migration.down) {
        await this.connection.execute(sql);
      }

      // 删除迁移记录
      await this.connection.execute(
        'DELETE FROM migrations WHERE version = ?',
        [migration.version]
      );

      await this.connection.commit();
      console.log(`Rolled back migration: ${migration.version}`);
    } catch (error) {
      await this.connection.rollback();
      throw error;
    }
  }

  // 运行所有待应用的迁移
  async runMigrations(migrations: Migration[]): Promise<void> {
    await this.initializeMigrationTable();
    const appliedMigrations = await this.getAppliedMigrations();

    for (const migration of migrations) {
      if (!appliedMigrations.includes(migration.version)) {
        await this.applyMigration(migration);
      }
    }
  }
}

// 定义数据库迁移
export const migrations: Migration[] = [
  {
    version: '001_initial_schema',
    description: 'Create initial database schema',
    up: [
      // 画布尺寸表
      `CREATE TABLE canvas_sizes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        aspect_ratio VARCHAR(50) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 主题表
      `CREATE TABLE themes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        background_color VARCHAR(50) NOT NULL,
        background_gradient TEXT,
        primary_color VARCHAR(50) NOT NULL,
        secondary_color VARCHAR(50) NOT NULL,
        text_color VARCHAR(50) NOT NULL,
        preview TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 页面模板表
      `CREATE TABLE page_templates (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        preview TEXT NOT NULL,
        frame_definitions TEXT NOT NULL,
        tags TEXT,
        category VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 相册表
      `CREATE TABLE albums (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        canvas_size_id VARCHAR(255) NOT NULL,
        theme_id VARCHAR(255) NOT NULL,
        settings TEXT NOT NULL,
        page_count INTEGER DEFAULT 0,
        thumbnail TEXT,
        tags TEXT,
        category VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (canvas_size_id) REFERENCES canvas_sizes(id),
        FOREIGN KEY (theme_id) REFERENCES themes(id)
      )`,

      // 页面表
      `CREATE TABLE pages (
        id VARCHAR(255) PRIMARY KEY,
        album_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        page_order INTEGER NOT NULL,
        template_id VARCHAR(255),
        elements TEXT NOT NULL,
        background_color VARCHAR(50),
        background_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES page_templates(id)
      )`,

      // 创建索引
      'CREATE INDEX idx_albums_created_at ON albums(created_at)',
      'CREATE INDEX idx_albums_updated_at ON albums(updated_at)',
      'CREATE INDEX idx_pages_album_id ON pages(album_id)',
      'CREATE INDEX idx_pages_order ON pages(album_id, page_order)',

      // 触发器：更新updated_at字段
      `CREATE TRIGGER update_albums_updated_at 
       AFTER UPDATE ON albums 
       BEGIN 
         UPDATE albums SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`,

      `CREATE TRIGGER update_pages_updated_at 
       AFTER UPDATE ON pages 
       BEGIN 
         UPDATE pages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`,

      // 触发器：维护相册页面数量
      `CREATE TRIGGER update_album_page_count_insert
       AFTER INSERT ON pages
       BEGIN
         UPDATE albums SET page_count = (
           SELECT COUNT(*) FROM pages WHERE album_id = NEW.album_id
         ) WHERE id = NEW.album_id;
       END`,

      `CREATE TRIGGER update_album_page_count_delete
       AFTER DELETE ON pages
       BEGIN
         UPDATE albums SET page_count = (
           SELECT COUNT(*) FROM pages WHERE album_id = OLD.album_id
         ) WHERE id = OLD.album_id;
       END`
    ],
    down: [
      'DROP TRIGGER IF EXISTS update_album_page_count_delete',
      'DROP TRIGGER IF EXISTS update_album_page_count_insert',
      'DROP TRIGGER IF EXISTS update_pages_updated_at',
      'DROP TRIGGER IF EXISTS update_albums_updated_at',
      'DROP INDEX IF EXISTS idx_pages_order',
      'DROP INDEX IF EXISTS idx_pages_album_id',
      'DROP INDEX IF EXISTS idx_albums_updated_at',
      'DROP INDEX IF EXISTS idx_albums_created_at',
      'DROP TABLE IF EXISTS pages',
      'DROP TABLE IF EXISTS albums',
      'DROP TABLE IF EXISTS page_templates',
      'DROP TABLE IF EXISTS themes',
      'DROP TABLE IF EXISTS canvas_sizes'
    ]
  },

  {
    version: '002_seed_default_data',
    description: 'Insert default canvas sizes, themes, and page templates',
    up: [
      // 插入默认画布尺寸
      `INSERT INTO canvas_sizes (id, name, width, height, aspect_ratio, description) VALUES
        ('canvas_a4_portrait', 'A4 竖版', 210, 297, '3:4', 'A4纸张竖版尺寸'),
        ('canvas_a4_landscape', 'A4 横版', 297, 210, '4:3', 'A4纸张横版尺寸'),
        ('canvas_square', '正方形', 300, 300, '1:1', '正方形画布'),
        ('canvas_16_9', '16:9 横版', 400, 225, '16:9', '宽屏横版比例'),
        ('canvas_9_16', '9:16 竖版', 225, 400, '9:16', '手机竖版比例')`,

      // 插入默认主题
      `INSERT INTO themes (id, name, description, background_color, primary_color, secondary_color, text_color, preview) VALUES
        ('theme_classic', '经典白', '简洁经典的白色主题', '#ffffff', '#3b82f6', '#64748b', '#1e293b', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzNiODJmNiI+QTwvdGV4dD4KPC9zdmc+'),
        ('theme_dark', '深色主题', '现代感十足的深色主题', '#1f2937', '#60a5fa', '#94a3b8', '#f8fafc', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWYyOTM3Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzYwYTVmYSI+QjwvdGV4dD4KPC9zdmc+'),
        ('theme_warm', '暖色调', '温馨的暖色调主题', '#fef7ed', '#ea580c', '#f97316', '#9a3412', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmVmN2VkIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VhNTgwYyI+QzwvdGV4dD4KPC9zdmc+')`,

      // 插入默认页面模板
      `INSERT INTO page_templates (id, name, description, preview, frame_definitions, tags, category) VALUES
        ('template_single_photo', '单张大图', '一张大图的简洁布局', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTVlN2ViIiBzdHJva2U9IiM5Y2EzYWYiLz4KPC9zdmc+', '[{"type":"photo","x":0.1,"y":0.1,"width":0.8,"height":0.6}]', '["简洁","单图"]', 'basic'),
        ('template_two_photos', '双图并排', '两张图片并排显示', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjUiIHk9IjIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIGZpbGw9IiNlNWU3ZWIiIHN0cm9rZT0iIzljYTNhZiIvPgo8cmVjdCB4PSI1NSIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2U1ZTdlYiIgc3Ryb2tlPSIjOWNhM2FmIi8+Cjwvc3ZnPg==', '[{"type":"photo","x":0.05,"y":0.2,"width":0.4,"height":0.6},{"type":"photo","x":0.55,"y":0.2,"width":0.4,"height":0.6}]', '["双图","并排"]', 'basic'),
        ('template_photo_with_text', '图文混排', '图片配文字的经典布局', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTVlN2ViIiBzdHJva2U9IiM5Y2EzYWYiLz4KPGxpbmUgeDE9IjE1IiB5MT0iNzAiIHgyPSI4NSIgeTI9IjcwIiBzdHJva2U9IiM2Yjc0ODYiLz4KPGxpbmUgeDE9IjE1IiB5MT0iODAiIHgyPSI2NSIgeTI9IjgwIiBzdHJva2U9IiM2Yjc0ODYiLz4KPC9zdmc+', '[{"type":"photo","x":0.1,"y":0.1,"width":0.8,"height":0.5},{"type":"text","x":0.1,"y":0.65,"width":0.8,"height":0.25}]', '["图文","混排"]', 'basic')`
    ],
    down: [
      'DELETE FROM page_templates',
      'DELETE FROM themes',
      'DELETE FROM canvas_sizes'
    ]
  },

  {
    version: '003_add_user_support',
    description: 'Add user support and modify albums table',
    up: [
      // 创建用户表
      `CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        display_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        settings TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 插入默认用户
      `INSERT INTO users (id, username, display_name, email) VALUES 
        ('default-user', 'default', '默认用户', 'default@webalbum.local')`,

      // 为albums表添加user_id字段
      `ALTER TABLE albums ADD COLUMN user_id VARCHAR(255) REFERENCES users(id)`,

      // 将现有相册关联到默认用户
      `UPDATE albums SET user_id = 'default-user' WHERE user_id IS NULL`,

      // 创建用户相关索引
      'CREATE INDEX idx_albums_user_id ON albums(user_id)',
      'CREATE INDEX idx_albums_user_created ON albums(user_id, created_at)',
      'CREATE INDEX idx_users_username ON users(username)',

      // 创建更新用户updated_at的触发器
      `CREATE TRIGGER update_users_updated_at 
       AFTER UPDATE ON users 
       BEGIN 
         UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`
    ],
    down: [
      'DROP TRIGGER IF EXISTS update_users_updated_at',
      'DROP INDEX IF EXISTS idx_users_username',
      'DROP INDEX IF EXISTS idx_albums_user_created',
      'DROP INDEX IF EXISTS idx_albums_user_id',
      'ALTER TABLE albums DROP COLUMN user_id',
      'DROP TABLE IF EXISTS users'
    ]
  }
];

// 便捷函数：运行所有迁移
export async function runAllMigrations(): Promise<void> {
  const dbManager = DatabaseManager.getInstance();
  const connection = await dbManager.getConnection();
  const migrationManager = new MigrationManager(connection);
  
  await migrationManager.runMigrations(migrations);
}
