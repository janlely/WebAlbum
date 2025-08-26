// Express应用主文件

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import session from 'express-session';
import * as dotenv from 'dotenv';
import { DatabaseManager } from './database/factory';
import { runAllMigrations } from './database/migrations';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'webalbum-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件服务 - 提供上传的图片
app.use('/uploads', express.static('uploads'));

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const isDbHealthy = await dbManager.healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isDbHealthy ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API路由
app.get('/api', (req, res) => {
  res.json({
    message: 'WebAlbum API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      albums: '/api/albums',
      albumPages: '/api/albums/:albumId/pages',
      pages: '/api/pages',
      themes: '/api/themes',
      canvasSizes: '/api/canvas-sizes',
      pageTemplates: '/api/page-templates',
      upload: '/api/upload',
      export: '/api/export'
    }
  });
});

// 用户上下文中间件
import { userContextMiddleware, requireUserMiddleware } from './middleware/userContext';

// API路由
import albumRoutes from './routes/albums';
import themeRoutes from './routes/themes';
import canvasSizeRoutes from './routes/canvasSizes';
import pageRoutes from './routes/pages';
import albumPageRoutes from './routes/albumPages';
import pageTemplateRoutes from './routes/pageTemplates';
import uploadRoutes from './routes/upload';
import exportRoutes from './routes/export';
import authRoutes from './routes/auth';

// 应用用户上下文中间件到所有API路由
app.use('/api', userContextMiddleware);

// 认证路由（公开访问）
app.use('/api/auth', authRoutes);

// 相册路由需要用户认证
app.use('/api/albums', requireUserMiddleware, albumRoutes);
app.use('/api/albums', requireUserMiddleware, albumPageRoutes); // 相册页面路由
app.use('/api/pages', requireUserMiddleware, pageRoutes); // 页面路由
app.use('/api/page-templates', pageTemplateRoutes); // 页面模板路由（公开访问）
app.use('/api/upload', requireUserMiddleware, uploadRoutes); // 文件上传路由
app.use('/api/export', requireUserMiddleware, exportRoutes); // 导出路由
app.use('/api/themes', themeRoutes);
app.use('/api/canvas-sizes', canvasSizeRoutes);

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库连接
    console.log('Initializing database connection...');
    const dbManager = DatabaseManager.getInstance();
    await dbManager.getConnection();
    console.log('Database connected successfully');

    // 运行数据库迁移
    console.log('Running database migrations...');
    await runAllMigrations();
    console.log('Database migrations completed');

    // 启动Express服务器
    app.listen(PORT, () => {
      console.log(`✅ WebAlbum Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.CORS_ORIGIN}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  const dbManager = DatabaseManager.getInstance();
  await dbManager.closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  const dbManager = DatabaseManager.getInstance();
  await dbManager.closeConnection();
  process.exit(0);
});

// 未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 启动应用
startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

export default app;
