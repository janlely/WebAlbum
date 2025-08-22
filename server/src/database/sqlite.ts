// SQLite数据库连接实现

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseConnection, DatabaseConfig } from '../types/database';

export class SQLiteConnection implements DatabaseConnection {
  private db: sqlite3.Database | null = null;
  private config: DatabaseConfig;
  private isInTransaction = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config.path) {
        reject(new Error('SQLite path is required'));
        return;
      }

      // 确保数据目录存在
      const dbDir = path.dirname(this.config.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.config.path, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Connected to SQLite database at ${this.config.path}`);
          // 启用外键约束
          this.db!.run('PRAGMA foreign_keys = ON');
          resolve();
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Disconnected from SQLite database');
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            affectedRows: this.changes,
            insertId: this.lastID
          });
        }
      });
    });
  }

  async beginTransaction(): Promise<void> {
    if (this.isInTransaction) {
      throw new Error('Transaction already in progress');
    }

    await this.execute('BEGIN TRANSACTION');
    this.isInTransaction = true;
  }

  async commit(): Promise<void> {
    if (!this.isInTransaction) {
      throw new Error('No transaction in progress');
    }

    await this.execute('COMMIT');
    this.isInTransaction = false;
  }

  async rollback(): Promise<void> {
    if (!this.isInTransaction) {
      throw new Error('No transaction in progress');
    }

    await this.execute('ROLLBACK');
    this.isInTransaction = false;
  }

  // SQLite特有的优化方法
  async enableWALMode(): Promise<void> {
    await this.execute('PRAGMA journal_mode = WAL');
  }

  async vacuum(): Promise<void> {
    await this.execute('VACUUM');
  }

  async analyze(): Promise<void> {
    await this.execute('ANALYZE');
  }

  // 获取表信息
  async getTableInfo(tableName: string): Promise<any[]> {
    return this.query(`PRAGMA table_info(${tableName})`);
  }

  // 检查表是否存在
  async tableExists(tableName: string): Promise<boolean> {
    const result = await this.query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );
    return result.length > 0;
  }

  // 获取数据库版本
  async getVersion(): Promise<string> {
    const result = await this.query('SELECT sqlite_version() as version');
    return result[0]?.version || 'unknown';
  }
}
