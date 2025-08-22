// 数据库连接工厂

import { DatabaseConnection, DatabaseConfig } from '../types/database';
import { SQLiteConnection } from './sqlite';

export class DatabaseFactory {
  static async createConnection(config: DatabaseConfig): Promise<DatabaseConnection> {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteConnection(config);
      
      case 'postgresql':
        // TODO: 实现PostgreSQL连接
        throw new Error('PostgreSQL support not implemented yet');
      
      case 'mysql':
        // TODO: 实现MySQL连接
        throw new Error('MySQL support not implemented yet');
      
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  static getConfigFromEnv(): DatabaseConfig {
    const dbType = (process.env.DB_TYPE || 'sqlite') as DatabaseConfig['type'];
    
    switch (dbType) {
      case 'sqlite':
        return {
          type: 'sqlite',
          path: process.env.DB_PATH || './data/webalbum.db'
        };
      
      case 'postgresql':
        return {
          type: 'postgresql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'webalbum',
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || ''
        };
      
      case 'mysql':
        return {
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          database: process.env.DB_NAME || 'webalbum',
          username: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || ''
        };
      
      default:
        throw new Error(`Invalid database type: ${dbType}`);
    }
  }
}

// 单例数据库连接管理器
export class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: DatabaseConnection | null = null;
  private config: DatabaseConfig;

  private constructor() {
    this.config = DatabaseFactory.getConfigFromEnv();
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async getConnection(): Promise<DatabaseConnection> {
    if (!this.connection) {
      this.connection = await DatabaseFactory.createConnection(this.config);
      await this.connection.connect();
    }
    return this.connection;
  }

  async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = null;
    }
  }

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.query('SELECT 1 as health');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}
