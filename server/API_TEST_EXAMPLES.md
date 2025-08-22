# WebAlbum API 测试示例

本文档包含了后端API的测试示例和使用方法。

## 基础信息

- **服务器地址**: http://localhost:3001
- **API前缀**: /api
- **数据格式**: JSON

## API 端点测试

### 1. 健康检查

```bash
curl -s http://localhost:3001/health | python3 -m json.tool
```

**响应示例**:
```json
{
    "status": "ok",
    "timestamp": "2025-08-22T07:00:52.977Z",
    "database": "connected",
    "version": "1.0.0"
}
```

### 2. 画布尺寸管理

#### 获取所有画布尺寸
```bash
curl -s http://localhost:3001/api/canvas-sizes | python3 -m json.tool
```

#### 获取单个画布尺寸
```bash
curl -s http://localhost:3001/api/canvas-sizes/canvas_16_9 | python3 -m json.tool
```

### 3. 主题管理

#### 获取所有主题
```bash
curl -s http://localhost:3001/api/themes | python3 -m json.tool
```

#### 获取单个主题
```bash
curl -s http://localhost:3001/api/themes/theme_classic | python3 -m json.tool
```

### 4. 相册管理

#### 创建相册
```bash
curl -X POST http://localhost:3001/api/albums \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的第一个相册",
    "description": "这是一个测试相册",
    "canvasSizeId": "canvas_16_9",
    "themeId": "theme_classic",
    "category": "个人",
    "tags": ["测试", "相册"]
  }' | python3 -m json.tool
```

**响应示例**:
```json
{
    "success": true,
    "message": "相册创建成功",
    "data": {
        "id": "29f2e9ae-82ad-4cee-a7c3-a539af3b0ace",
        "name": "我的第一个相册",
        "description": "这是一个测试相册",
        "canvasSizeId": "canvas_16_9",
        "themeId": "theme_classic",
        "settings": "{}",
        "pageCount": 0,
        "tags": "[\"测试\",\"相册\"]",
        "category": "个人",
        "createdAt": "2025-08-22T07:00:15.738Z",
        "updatedAt": "2025-08-22T07:00:15.738Z"
    }
}
```

#### 获取相册详情
```bash
curl -s http://localhost:3001/api/albums/{ALBUM_ID} | python3 -m json.tool
```

#### 获取相册列表（带分页）
```bash
curl -s "http://localhost:3001/api/albums?page=1&pageSize=10" | python3 -m json.tool
```

**响应示例**:
```json
{
    "success": true,
    "data": [...],
    "pagination": {
        "page": 1,
        "pageSize": 10,
        "total": 1,
        "totalPages": 1
    }
}
```

#### 搜索相册
```bash
curl -s "http://localhost:3001/api/albums?search=测试&category=个人" | python3 -m json.tool
```

#### 更新相册
```bash
curl -X PUT http://localhost:3001/api/albums/{ALBUM_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的第一个相册 (已更新)",
    "description": "这是一个更新后的测试相册"
  }' | python3 -m json.tool
```

#### 删除相册
```bash
curl -X DELETE http://localhost:3001/api/albums/{ALBUM_ID} | python3 -m json.tool
```

#### 获取相册统计
```bash
curl -s http://localhost:3001/api/albums/stats | python3 -m json.tool
```

**响应示例**:
```json
{
    "success": true,
    "data": {
        "totalAlbums": 1,
        "avgPageCount": 0,
        "maxPageCount": 0,
        "recentAlbums": 1
    }
}
```

#### 获取相册摘要
```bash
curl -s "http://localhost:3001/api/albums/summaries?limit=5" | python3 -m json.tool
```

## 错误处理

所有API都遵循统一的错误格式：

```json
{
    "success": false,
    "message": "错误描述",
    "error": "详细错误信息"
}
```

常见HTTP状态码：
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 数据验证

### 相册创建验证规则
- `name`: 必填，最大255字符
- `description`: 可选，最大1000字符
- `canvasSizeId`: 必填，必须是有效的画布尺寸ID
- `themeId`: 必填，必须是有效的主题ID
- `tags`: 可选，最多20个标签，每个标签最大50字符
- `category`: 可选

### 相册搜索参数
- `page`: 页码，默认1
- `pageSize`: 每页大小，默认20，最大100
- `search`: 搜索关键词（匹配名称和描述）
- `category`: 按分类筛选
- `tags`: 按标签筛选（逗号分隔）
- `sortBy`: 排序字段，默认updated_at
- `sortOrder`: 排序方向，ASC或DESC，默认DESC

## 测试建议

1. **健康检查**: 首先测试 `/health` 端点确保服务正常
2. **基础数据**: 获取画布尺寸和主题数据
3. **CRUD操作**: 按顺序测试创建、读取、更新、删除
4. **边界测试**: 测试无效ID、空数据、超长数据等场景
5. **性能测试**: 测试大量数据的分页和搜索功能

### 5. 页面管理

#### 创建页面
```bash
curl -X POST http://localhost:3001/api/pages \
  -H "Content-Type: application/json" \
  -d '{
    "albumId": "29f2e9ae-82ad-4cee-a7c3-a539af3b0ace",
    "name": "封面页",
    "order": 0,
    "templateId": "template_single_photo",
    "elements": [
      {
        "id": "element_1",
        "type": "photo",
        "x": 0.1,
        "y": 0.1,
        "width": 0.8,
        "height": 0.6,
        "url": "/uploads/images/photo.jpg"
      }
    ]
  }' | python3 -m json.tool
```

#### 获取相册的所有页面
```bash
curl -s http://localhost:3001/api/albums/{ALBUM_ID}/pages | python3 -m json.tool
```

#### 重新排序页面
```bash
curl -X PUT http://localhost:3001/api/albums/{ALBUM_ID}/pages/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "pageIds": ["page_1", "page_2", "page_3"]
  }' | python3 -m json.tool
```

#### 复制页面
```bash
curl -X POST http://localhost:3001/api/pages/{PAGE_ID}/duplicate | python3 -m json.tool
```

### 6. 页面模板

#### 获取所有页面模板
```bash
curl -s http://localhost:3001/api/page-templates | python3 -m json.tool
```

#### 按分类获取模板
```bash
curl -s "http://localhost:3001/api/page-templates?category=basic" | python3 -m json.tool
```

#### 获取模板分类列表
```bash
curl -s http://localhost:3001/api/page-templates/categories/list | python3 -m json.tool
```

### 7. 文件上传

#### 单个图片上传
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -F "image=@/path/to/your/image.jpg" | python3 -m json.tool
```

#### 批量图片上传
```bash
curl -X POST http://localhost:3001/api/upload/images \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" | python3 -m json.tool
```

#### 图片压缩
```bash
curl -X POST http://localhost:3001/api/upload/compress \
  -F "image=@/path/to/your/image.jpg" \
  -F "quality=60" \
  -F "width=800" \
  -F "format=jpeg" \
  --output compressed.jpg
```

#### 获取存储使用情况
```bash
curl -s http://localhost:3001/api/upload/usage | python3 -m json.tool
```

### 8. PDF导出

#### 导出整个相册
```bash
curl -X POST http://localhost:3001/api/export/album/{ALBUM_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "format": "A4",
      "orientation": "portrait",
      "quality": 85
    }
  }' | python3 -m json.tool
```

#### 导出指定页面
```bash
curl -X POST http://localhost:3001/api/export/pages \
  -H "Content-Type: application/json" \
  -d '{
    "albumId": "29f2e9ae-82ad-4cee-a7c3-a539af3b0ace",
    "pageIds": ["page_1", "page_2"],
    "options": {
      "format": "A4",
      "orientation": "landscape"
    }
  }' | python3 -m json.tool
```

#### 查询导出状态
```bash
curl -s http://localhost:3001/api/export/status/{TASK_ID} | python3 -m json.tool
```

#### 下载导出文件
```bash
curl -L http://localhost:3001/api/export/download/{TASK_ID} --output album.pdf
```

#### 获取导出任务列表
```bash
curl -s http://localhost:3001/api/export/tasks | python3 -m json.tool
```

## 用户认证说明

所有需要认证的API都支持以下方式传递用户ID：

1. **请求头方式**（推荐）:
```bash
curl -H "X-User-Id: default-user" http://localhost:3001/api/albums
```

2. **查询参数方式**:
```bash
curl "http://localhost:3001/api/albums?userId=default-user"
```

3. **请求体方式**（仅POST/PUT请求）:
```bash
curl -X POST http://localhost:3001/api/albums \
  -H "Content-Type: application/json" \
  -d '{"userId": "default-user", "name": "测试相册"}'
```

## 完整API端点列表

### 相册管理
- `GET /api/albums` - 获取相册列表
- `POST /api/albums` - 创建相册
- `GET /api/albums/:id` - 获取相册详情
- `PUT /api/albums/:id` - 更新相册
- `DELETE /api/albums/:id` - 删除相册
- `GET /api/albums/stats` - 获取相册统计
- `GET /api/albums/summaries` - 获取相册摘要

### 页面管理
- `GET /api/pages` - 获取页面列表
- `POST /api/pages` - 创建页面
- `GET /api/pages/:id` - 获取页面详情
- `PUT /api/pages/:id` - 更新页面
- `DELETE /api/pages/:id` - 删除页面
- `POST /api/pages/:id/duplicate` - 复制页面
- `GET /api/pages/stats` - 获取页面统计

### 相册页面关联
- `GET /api/albums/:albumId/pages` - 获取相册的所有页面
- `PUT /api/albums/:albumId/pages/reorder` - 重新排序页面

### 页面模板
- `GET /api/page-templates` - 获取页面模板列表
- `GET /api/page-templates/:id` - 获取页面模板详情
- `GET /api/page-templates/categories/list` - 获取模板分类
- `GET /api/page-templates/tags/list` - 获取模板标签

### 文件上传
- `POST /api/upload/image` - 单个图片上传
- `POST /api/upload/images` - 批量图片上传
- `POST /api/upload/compress` - 图片压缩
- `POST /api/upload/process` - 图片处理
- `GET /api/upload/info/:filename` - 获取文件信息
- `DELETE /api/upload/:fileId` - 删除文件
- `GET /api/upload/usage` - 获取存储使用情况

### PDF导出
- `POST /api/export/album/:albumId` - 导出整个相册
- `POST /api/export/pages` - 导出指定页面
- `POST /api/export/task` - 创建导出任务
- `GET /api/export/status/:taskId` - 查询导出状态
- `GET /api/export/download/:taskId` - 下载导出文件
- `GET /api/export/tasks` - 获取导出任务列表
- `DELETE /api/export/task/:taskId` - 取消导出任务

### 基础数据
- `GET /api/themes` - 获取主题列表
- `GET /api/themes/:id` - 获取主题详情
- `GET /api/canvas-sizes` - 获取画布尺寸列表
- `GET /api/canvas-sizes/:id` - 获取画布尺寸详情

### 静态文件
- `GET /uploads/images/:filename` - 获取上传的图片
- `GET /uploads/thumbnails/:filename` - 获取缩略图

## 下一步开发

- [x] 页面API (pages) ✅
- [x] 文件上传API (upload) ✅
- [x] 页面模板API (page-templates) ✅
- [x] 导出API (export) ✅
- [ ] 用户认证API (auth)
- [ ] 前端API集成
- [ ] 实时预览功能
