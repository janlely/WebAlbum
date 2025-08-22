#!/usr/bin/env ts-node

// 数据库迁移脚本

import * as dotenv from 'dotenv';
import { runAllMigrations } from '../database/migrations';
import { DatabaseManager } from '../database/factory';

// 加载环境变量
dotenv.config();

async function main() {
  try {
    console.log('🔄 Starting database migration...');
    
    // 初始化数据库连接
    const dbManager = DatabaseManager.getInstance();
    await dbManager.getConnection();
    console.log('📡 Database connected');

    // 运行迁移
    await runAllMigrations();
    console.log('✅ Database migration completed successfully');

    // 关闭连接
    await dbManager.closeConnection();
    console.log('🔌 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
WebAlbum Database Migration Tool

Usage:
  npm run db:migrate         Run all pending migrations
  npm run db:migrate -- -h   Show this help

Environment Variables:
  DB_TYPE    Database type (sqlite, postgresql, mysql)
  DB_PATH    SQLite database file path
  DB_HOST    Database host (for PostgreSQL/MySQL)
  DB_PORT    Database port (for PostgreSQL/MySQL)
  DB_NAME    Database name (for PostgreSQL/MySQL)
  DB_USER    Database username (for PostgreSQL/MySQL)
  DB_PASSWORD Database password (for PostgreSQL/MySQL)
  `);
  process.exit(0);
}

// 运行迁移
main();
