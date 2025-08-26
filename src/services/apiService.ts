// API服务 - 替换本地存储为后端API调用

import type { Album, AlbumPage, AlbumSummary, PageSummary } from '../types/album';

const API_BASE_URL = 'http://localhost:9999/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 添加公共请求方法类型
export interface IApiService {
  get<T = any>(url: string): Promise<ApiResponse<T>>;
  post<T = any>(url: string, body?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, body?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string): Promise<ApiResponse<T>>;
}

export interface UploadResponse {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  thumbnails: {
    [suffix: string]: {
      filename: string;
      path: string;
      url: string;
      width: number;
      height: number;
    };
  };
  uploadTime: number;
  userId: string;
}

export interface ExportTask {
  id: string;
  albumId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  createTime: number;
  completeTime?: number;
  error?: string;
}

class ApiService implements IApiService {
  // 实现公共请求接口
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url);
  }

  async post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'DELETE'
    });
  }
  private baseUrl: string;
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // 基础请求方法
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // 移除过期的X-User-Info头

    const config: RequestInit = {
      ...options,
      credentials: 'include', // 确保携带cookie
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // 清除认证状态
          const { triggerLogout } = await import('../context/AuthContext');
          await triggerLogout();
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      if (error instanceof Error && error.message.includes('401')) {
        // 使用统一的登出方法
        const { triggerLogout } = await import('../context/AuthContext');
        await triggerLogout();
      }
      throw error;
    }
  }

  // 文件上传请求
  private async uploadRequest<T = any>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        },
      body: formData,
    };

    try {
      console.log(`Upload Request: POST ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('上传请求失败:', error);
      throw error;
    }
  }

  // 相册管理
  async saveAlbum(album: Album): Promise<Album> {
    // 对于新相册（没有有效ID），直接创建
    const isNewAlbum = !album.id || album.id.startsWith('album_');
    
    if (!isNewAlbum) {
      try {
        // 尝试获取现有相册来判断是否需要更新
        const existingAlbum = await this.getAlbum(album.id);
        if (existingAlbum) {
          // 更新相册
          const response = await this.request<any>(`/albums/${album.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              name: album.name,
              description: album.description,
              canvasSizeId: album.canvasSizeId,
              themeId: album.themeId,
              settings: album.settings,
              tags: album.tags,
              category: album.category,
              thumbnail: album.thumbnail,
            }),
          });
          return this.mapBackendAlbumToFrontend(response.data);
        }
      } catch (error) {
        console.log('相册不存在，将创建新相册');
      }
    }
    
    // 创建新相册
    const response = await this.request<any>(`/albums`, {
      method: 'POST',
      body: JSON.stringify({
        name: album.name,
        description: album.description,
        canvasSizeId: album.canvasSizeId,
        themeId: album.themeId,
        settings: album.settings || {},
        tags: album.tags || [],
        category: album.category,
      }),
    });
    return this.mapBackendAlbumToFrontend(response.data);
  }

  async getAlbums(): Promise<Album[]> {
    const response = await this.request<Album[]>('/albums');
    return response.data!.map(album => this.mapBackendAlbumToFrontend(album));
  }

  async getAlbum(albumId: string): Promise<Album | null> {
    try {
      const response = await this.request<Album>(`/albums/${albumId}`);
      return this.mapBackendAlbumToFrontend(response.data!);
    } catch (error) {
      console.error('获取相册失败:', error);
      return null;
    }
  }

  async deleteAlbum(albumId: string): Promise<void> {
    await this.request(`/albums/${albumId}`, {
      method: 'DELETE',
    });
  }

  async getAlbumSummaries(): Promise<AlbumSummary[]> {
    const response = await this.request<AlbumSummary[]>('/albums/summaries');
    return response.data!;
  }

  // 页面管理
  async savePage(page: AlbumPage): Promise<AlbumPage> {
    if (await this.getPage(page.id)) {
      // 更新页面
      const response = await this.request<AlbumPage>(`/pages/${page.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: page.name,
          order: page.order,
          templateId: page.templateId,
          elements: page.elements,
          backgroundColor: page.backgroundColor,
          backgroundImage: page.backgroundImage,
        }),
      });
      return this.mapBackendPageToFrontend(response.data!);
    } else {
      // 创建页面
      const response = await this.request<AlbumPage>(`/pages`, {
        method: 'POST',
        body: JSON.stringify({
          albumId: page.albumId,
          name: page.name,
          order: page.order,
          templateId: page.templateId,
          elements: page.elements || [],
          backgroundColor: page.backgroundColor,
          backgroundImage: page.backgroundImage,
        }),
      });
      return this.mapBackendPageToFrontend(response.data!);
    }
  }

  async getPages(): Promise<AlbumPage[]> {
    const response = await this.request<AlbumPage[]>('/pages');
    return response.data!.map(page => this.mapBackendPageToFrontend(page));
  }

  async getPage(pageId: string): Promise<AlbumPage | null> {
    try {
      const response = await this.request<AlbumPage>(`/pages/${pageId}`);
      return this.mapBackendPageToFrontend(response.data!);
    } catch (error) {
      console.error('获取页面失败:', error);
      return null;
    }
  }

  async getAlbumPages(albumId: string): Promise<AlbumPage[]> {
    const response = await this.request<AlbumPage[]>(`/albums/${albumId}/pages`);
    return response.data!.map(page => this.mapBackendPageToFrontend(page));
  }

  async deletePage(pageId: string): Promise<void> {
    await this.request(`/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  async getPageSummaries(albumId: string): Promise<PageSummary[]> {
    const response = await this.request<PageSummary[]>(`/albums/${albumId}/pages`);
    return response.data!.map(page => ({
      id: page.id,
      albumId: page.albumId,
      name: page.name,
      order: page.order,
      thumbnail: this.generatePageThumbnail(page),
      updateTime: Date.now(),
      elementCount: 0,
    }));
  }

  async reorderPages(albumId: string, pageIds: string[]): Promise<void> {
    await this.request(`/albums/${albumId}/pages/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ pageIds }),
    });
  }

  async duplicatePage(pageId: string): Promise<AlbumPage> {
    const response = await this.request<AlbumPage>(`/pages/${pageId}/duplicate`, {
      method: 'POST',
    });
    return this.mapBackendPageToFrontend(response.data!);
  }

  // 文件上传
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.uploadRequest<UploadResponse>('/upload/image', formData);
    return response.data!;
  }

  async uploadImages(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await this.uploadRequest<UploadResponse[]>('/upload/images', formData);
    return response.data!;
  }

  async getUploadUsage(): Promise<any> {
    const response = await this.request('/upload/usage');
    return response.data!;
  }

  // 导出功能
  async exportAlbum(albumId: string, options?: any): Promise<string> {
    const response = await this.request<{ taskId: string }>(`/export/album/${albumId}`, {
      method: 'POST',
      body: JSON.stringify({ options: options || {} }),
    });
    return response.data!.taskId;
  }

  async exportPages(albumId: string, pageIds: string[], options?: any): Promise<string> {
    const response = await this.request<{ taskId: string }>('/export/pages', {
      method: 'POST',
      body: JSON.stringify({ albumId, pageIds, options: options || {} }),
    });
    return response.data!.taskId;
  }

  async getExportTask(taskId: string): Promise<ExportTask> {
    const response = await this.request<ExportTask>(`/export/status/${taskId}`);
    return response.data!;
  }

  async getExportTasks(): Promise<ExportTask[]> {
    const response = await this.request<ExportTask[]>('/export/tasks');
    return response.data!;
  }

  async downloadExportFile(taskId: string): Promise<void> {
    const url = `${this.baseUrl}/export/download/${taskId}`;
    const response = await fetch(url, {
      headers: {},
    });

    if (!response.ok) {
      throw new Error('下载失败');
    }

    // 创建下载链接
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `export_${taskId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // 获取页面模板
  async getPageTemplates(): Promise<any[]> {
    const response = await this.request('/page-templates');
    return response.data!;
  }

  // 获取主题
  async getThemes(): Promise<any[]> {
    const response = await this.request('/themes');
    return response.data!;
  }

  // 获取画布尺寸
  async getCanvasSizes(): Promise<any[]> {
    const response = await this.request('/canvas-sizes');
    return response.data!;
  }

  // 编辑器状态管理（保留本地存储）
  async saveEditorState(state: any): Promise<void> {
    try {
      localStorage.setItem('webalbum_editor_state', JSON.stringify(state));
    } catch (error) {
      console.error('保存编辑器状态失败:', error);
    }
  }

  async getEditorState(): Promise<any> {
    try {
      const data = localStorage.getItem('webalbum_editor_state');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载编辑器状态失败:', error);
      return null;
    }
  }

  // 数据导入导出
  async exportData(): Promise<string> {
    const albums = await this.getAlbums();
    const pages = await this.getPages();
    
    const exportData = {
      version: '1.0.0',
      exportTime: Date.now(),
      albums,
      pages
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      console.log('数据导入功能需要后端支持，当前仅支持导出');
      throw new Error('数据导入功能开发中');
    } catch (error) {
      console.error('导入数据失败:', error);
      throw new Error('导入数据失败');
    }
  }

  // 清理数据
  async clearAllData(): Promise<void> {
    console.warn('清理所有数据功能需要谨慎实现，当前不支持');
    throw new Error('此功能为安全考虑暂不支持');
  }

  // 获取存储使用情况
  getStorageUsage(): { used: number; total: number; percentage: number } {
    // 这里可以调用后端API获取真实的存储使用情况
    return { used: 0, total: 0, percentage: 0 };
  }

  // 数据映射方法
  private mapBackendAlbumToFrontend(backendAlbum: any): Album {
    return {
      id: backendAlbum.id,
      name: backendAlbum.name,
      description: backendAlbum.description,
      canvasSizeId: backendAlbum.canvasSizeId,
      themeId: backendAlbum.themeId,
      canvasSize: backendAlbum.canvasSize ? this.mapBackendCanvasSizeToFrontend(backendAlbum.canvasSize) : undefined,
      theme: backendAlbum.theme ? this.mapBackendThemeToFrontend(backendAlbum.theme) : undefined,
      settings: typeof backendAlbum.settings === 'string' 
        ? JSON.parse(backendAlbum.settings) 
        : backendAlbum.settings,
      pageCount: backendAlbum.pageCount || 0,
      thumbnail: backendAlbum.thumbnail,
      tags: typeof backendAlbum.tags === 'string' 
        ? JSON.parse(backendAlbum.tags) 
        : backendAlbum.tags || [],
      category: backendAlbum.category,
      createTime: new Date(backendAlbum.createdAt).getTime(),
      updateTime: new Date(backendAlbum.updatedAt).getTime(),
      lastEditTime: new Date(backendAlbum.updatedAt).getTime(),
    } as Album;
  }

  private mapBackendCanvasSizeToFrontend(backendSize: any): any {
    if (!backendSize) return null;
    
    return {
      id: backendSize.id,
      name: backendSize.name,
      width: backendSize.width,
      height: backendSize.height,
      aspectRatio: backendSize.aspectRatio || backendSize.aspect_ratio,
      description: backendSize.description,
      category: 'standard', // 默认分类
      isPopular: false
    };
  }

  private mapBackendThemeToFrontend(backendTheme: any): any {
    if (!backendTheme) return null;
    
    return {
      id: backendTheme.id,
      name: backendTheme.name,
      description: backendTheme.description,
      preview: backendTheme.preview,
      backgroundColor: backendTheme.backgroundColor || backendTheme.background_color,
      backgroundGradient: backendTheme.backgroundGradient || backendTheme.background_gradient,
      colorScheme: {
        primary: backendTheme.primaryColor || backendTheme.primary_color || '#3b82f6',
        secondary: backendTheme.secondaryColor || backendTheme.secondary_color || '#64748b',
        accent: backendTheme.primaryColor || backendTheme.primary_color || '#3b82f6',
        text: backendTheme.textColor || backendTheme.text_color || '#1e293b',
        textLight: backendTheme.secondaryColor || backendTheme.secondary_color || '#64748b',
        background: backendTheme.backgroundColor || backendTheme.background_color || '#ffffff',
        surface: '#f8f9fa'
      },
      fontFamily: 'sans-serif',
      fontWeights: { normal: 400, medium: 500, bold: 700 },
      borderRadius: 8,
      shadowStyle: '0 1px 3px rgba(0, 0, 0, 0.1)',
      category: 'modern',
      isBuiltIn: true
    };
  }

  private mapBackendPageToFrontend(backendPage: any): AlbumPage {
    return {
      id: backendPage.id,
      albumId: backendPage.albumId,
      name: backendPage.name,
      order: backendPage.order,
      templateId: backendPage.templateId,
      elements: typeof backendPage.elements === 'string' 
        ? JSON.parse(backendPage.elements) 
        : backendPage.elements || [],
      backgroundColor: backendPage.backgroundColor,
      backgroundImage: backendPage.backgroundImage,
      createTime: new Date(backendPage.createdAt).getTime(),
      updateTime: new Date(backendPage.updatedAt).getTime(),
    };
  }

  private generatePageThumbnail(page: any): string {
    // 简化的缩略图生成
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f8f9fa"/>
        <text x="50" y="50" text-anchor="middle" font-size="12" fill="#6b7280">
          ${page.elements?.length || 0}个元素
        </text>
      </svg>
    `)}`;
  }
}

// 导出单例实例
export const apiService = new ApiService();
