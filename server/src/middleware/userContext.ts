// 用户上下文中间件

import { Request, Response, NextFunction } from 'express';

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      userId: string;
      userInfo?: {
        id: string;
        username: string;
        displayName: string;
        email?: string;
      };
    }
  }
}

/**
 * 用户上下文中间件
 * 从请求中提取用户信息并注入到req对象中
 */
export const userContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 多种方式获取用户ID的优先级：
    // 1. Authorization Bearer token (将来实现JWT时使用)
    // 2. X-User-Id 请求头
    // 3. userId 查询参数
    // 4. 默认用户

    let userId: string = 'default-user'; // 默认用户

    // 从请求头获取用户ID
    const headerUserId = req.headers['x-user-id'] as string;
    if (headerUserId && typeof headerUserId === 'string' && headerUserId.trim()) {
      userId = headerUserId.trim();
    }

    // 从查询参数获取用户ID（优先级较低）
    const queryUserId = req.query.userId as string;
    if (!headerUserId && queryUserId && typeof queryUserId === 'string' && queryUserId.trim()) {
      userId = queryUserId.trim();
    }

    // 从请求体获取用户ID（仅对POST/PUT请求）
    if (!headerUserId && !queryUserId && req.body && req.body.userId) {
      const bodyUserId = req.body.userId;
      if (typeof bodyUserId === 'string' && bodyUserId.trim()) {
        userId = bodyUserId.trim();
      }
    }

    // 验证用户ID格式（简单验证）
    if (!isValidUserId(userId)) {
      res.status(400).json({
        success: false,
        message: '无效的用户ID格式'
      });
      return;
    }

    // 注入用户上下文
    req.userId = userId;

    // 在开发模式下添加调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`[UserContext] Request from user: ${userId} to ${req.method} ${req.path}`);
    }

    next();
  } catch (error) {
    console.error('Error in userContextMiddleware:', error);
    res.status(500).json({
      success: false,
      message: '用户上下文处理失败'
    });
    return;
  }
};

/**
 * 验证用户ID格式的辅助函数
 */
function isValidUserId(userId: string): boolean {
  // 允许默认用户
  if (userId === 'default-user') {
    return true;
  }

  // UUID格式验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) {
    return true;
  }

  // 自定义用户名格式验证（字母数字下划线，3-50字符）
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  if (usernameRegex.test(userId)) {
    return true;
  }

  return false;
}

/**
 * 可选的用户信息加载中间件
 * 在需要用户详细信息的路由中使用
 */
export const loadUserInfoMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      next(); // 如果没有用户ID，跳过
      return;
    }

    // TODO: 从数据库加载用户信息
    // 这里暂时使用模拟数据
    if (req.userId === 'default-user') {
      req.userInfo = {
        id: 'default-user',
        username: 'default',
        displayName: '默认用户',
        email: 'default@webalbum.local'
      };
    }

    next();
  } catch (error) {
    console.error('Error in loadUserInfoMiddleware:', error);
    // 不阻止请求继续，只是无法加载用户信息
    next();
  }
};

/**
 * 要求用户认证的中间件
 * 确保请求必须有有效的用户上下文
 */
export const requireUserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: '需要用户认证'
    });
    return;
  }

  next();
};
