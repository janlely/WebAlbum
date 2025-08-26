const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 连接到数据库
const dbPath = path.join(__dirname, '../../data/webalbum.db');
const db = new sqlite3.Database(dbPath);

async function addDemoUser() {
  try {
    // 检查demo用户是否已存在
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', ['demo'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('Demo用户已存在');
      return;
    }

    // 加密密码
    const passwordHash = await bcrypt.hash('123456', 10);
    
    // 插入demo用户
    const userId = require('crypto').randomUUID();
    const now = new Date().toISOString();
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, username, password_hash, display_name, email, avatar_url, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, 'demo', passwordHash, 'Demo User', null, null, JSON.stringify({}), now, now],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('Demo用户添加成功！');
    console.log('用户名: demo');
    console.log('密码: 123456');
    
  } catch (error) {
    console.error('添加Demo用户失败:', error);
  } finally {
    db.close();
  }
}

addDemoUser();
