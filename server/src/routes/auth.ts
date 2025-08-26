import { Router } from 'express';
import { UserDAO } from '../models/UserDAO';
import bcrypt from 'bcrypt';
import { DatabaseManager } from '../database/factory';

// 扩展Express的Session类型
declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      username: string;
      email?: string;
    };
  }
}

const router = Router();

// 用户登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const userDAO = new UserDAO(connection);
    
    // 查找用户
    const user = await userDAO.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 设置session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    return res.json({ success: true, message: '登录成功', data: { user: req.session.user } });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登出
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: '注销失败' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: '注销成功' });
  });
});

// 获取当前用户
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: '未登录' });
  }
  return res.json({ success: true, data: req.session.user });
});

export default router;
