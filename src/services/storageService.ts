// 存储服务 - 支持API和本地存储两种模式

import type { Album, AlbumPage, AlbumSummary, PageSummary } from '../types/album';
import { apiService } from './apiService';

const STORAGE_KEYS = {
  ALBUMS: 'webalbum_albums',
  PAGES: 'webalbum_pages',
  EDITOR_STATE: 'webalbum_editor_state',
  USER_SETTINGS: 'webalbum_user_settings',
  USE_API_MODE: 'webalbum_use_api_mode'
} as const;

export class StorageService {
  // 检查是否使用API模式
  private static isApiMode(): boolean {
    try {
      const useApiMode = localStorage.getItem(STORAGE_KEYS.USE_API_MODE);
      return useApiMode === 'true';
    } catch (error) {
      return false; // 默认使用本地存储模式
    }
  }

  // 设置存储模式
  static setApiMode(useApi: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USE_API_MODE, useApi.toString());
      
      // 如果启用API模式，确保设置用户ID
      if (useApi) {
        const userId = localStorage.getItem('user_id') || 'demo_user';
        localStorage.setItem('user_id', userId);
        apiService.setUserId(userId);
        console.log('API模式已启用，用户ID:', userId);
      }
      
      console.log(`存储模式已切换为: ${useApi ? 'API模式' : '本地存储模式'}`);
    } catch (error) {
      console.error('设置存储模式失败:', error);
    }
  }

  // 获取当前存储模式
  static getStorageMode(): 'api' | 'local' {
    return this.isApiMode() ? 'api' : 'local';
  }

  // 相册管理
  static async saveAlbum(album: Album): Promise<Album> {
    if (this.isApiMode()) {
      try {
        const savedAlbum = await apiService.saveAlbum(album);
        console.log('相册保存成功:', savedAlbum.name);
        return savedAlbum;
      } catch (error) {
        console.error('保存相册失败:', error);
        throw new Error('保存相册失败');
      }
    } else {
      try {
        const albums = await this.getAlbumsLocal();
        const existingIndex = albums.findIndex(a => a.id === album.id);
        
        if (existingIndex >= 0) {
          albums[existingIndex] = album;
        } else {
          albums.push(album);
        }
        
        localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
        console.log('相册保存成功:', album.name);
        return album;
      } catch (error) {
        console.error('保存相册失败:', error);
        throw new Error('保存相册失败');
      }
    }
  }

  static async getAlbums(): Promise<Album[]> {
    if (this.isApiMode()) {
      try {
        return await apiService.getAlbums();
      } catch (error) {
        console.error('加载相册列表失败:', error);
        return [];
      }
    } else {
      return this.getAlbumsLocal();
    }
  }

  private static async getAlbumsLocal(): Promise<Album[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALBUMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载相册列表失败:', error);
      return [];
    }
  }

  static async getAlbum(albumId: string): Promise<Album | null> {
    if (this.isApiMode()) {
      try {
        return await apiService.getAlbum(albumId);
      } catch (error) {
        console.error('加载相册失败:', error);
        return null;
      }
    } else {
      try {
        const albums = await this.getAlbumsLocal();
        return albums.find(album => album.id === albumId) || null;
      } catch (error) {
        console.error('加载相册失败:', error);
        return null;
      }
    }
  }

  static async deleteAlbum(albumId: string): Promise<void> {
    if (this.isApiMode()) {
      try {
        await apiService.deleteAlbum(albumId);
        console.log('相册删除成功:', albumId);
      } catch (error) {
        console.error('删除相册失败:', error);
        throw new Error('删除相册失败');
      }
    } else {
      try {
        // 删除相册
        const albums = await this.getAlbumsLocal();
        const filteredAlbums = albums.filter(album => album.id !== albumId);
        localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(filteredAlbums));
        
        // 删除相册的所有页面
        const pages = await this.getPagesLocal();
        const filteredPages = pages.filter(page => page.albumId !== albumId);
        localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(filteredPages));
        
        console.log('相册删除成功:', albumId);
      } catch (error) {
        console.error('删除相册失败:', error);
        throw new Error('删除相册失败');
      }
    }
  }

  static async getAlbumSummaries(): Promise<AlbumSummary[]> {
    if (this.isApiMode()) {
      try {
        return await apiService.getAlbumSummaries();
      } catch (error) {
        console.error('加载相册摘要失败:', error);
        return [];
      }
    } else {
      try {
        const albums = await this.getAlbumsLocal();
        return albums.map(album => ({
          id: album.id,
          name: album.name,
          pageCount: album.pageCount,
          thumbnail: album.thumbnail,
          lastEditTime: album.lastEditTime,
          canvasSize: album.canvasSize,
          theme: album.theme
        }));
      } catch (error) {
        console.error('加载相册摘要失败:', error);
        return [];
      }
    }
  }

  // 页面管理
  static async savePage(page: AlbumPage): Promise<void> {
    if (this.isApiMode()) {
      try {
        await apiService.savePage(page);
        console.log('页面保存成功:', page.name);
      } catch (error) {
        console.error('保存页面失败:', error);
        throw new Error('保存页面失败');
      }
    } else {
      try {
        const pages = await this.getPagesLocal();
        const existingIndex = pages.findIndex(p => p.id === page.id);
        
        if (existingIndex >= 0) {
          pages[existingIndex] = page;
        } else {
          pages.push(page);
        }
        
        localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
        
        // 更新相册的页面数量和最后编辑时间
        await this.updateAlbumStatsLocal(page.albumId);
        
        console.log('页面保存成功:', page.name);
      } catch (error) {
        console.error('保存页面失败:', error);
        throw new Error('保存页面失败');
      }
    }
  }

  static async getPages(): Promise<AlbumPage[]> {
    if (this.isApiMode()) {
      try {
        return await apiService.getPages();
      } catch (error) {
        console.error('加载页面列表失败:', error);
        return [];
      }
    } else {
      return this.getPagesLocal();
    }
  }

  private static async getPagesLocal(): Promise<AlbumPage[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载页面列表失败:', error);
      return [];
    }
  }

  static async getPage(pageId: string): Promise<AlbumPage | null> {
    if (this.isApiMode()) {
      try {
        return await apiService.getPage(pageId);
      } catch (error) {
        console.error('加载页面失败:', error);
        return null;
      }
    } else {
      try {
        const pages = await this.getPagesLocal();
        return pages.find(page => page.id === pageId) || null;
      } catch (error) {
        console.error('加载页面失败:', error);
        return null;
      }
    }
  }

  static async getAlbumPages(albumId: string): Promise<AlbumPage[]> {
    if (this.isApiMode()) {
      try {
        return await apiService.getAlbumPages(albumId);
      } catch (error) {
        console.error('加载相册页面失败:', error);
        return [];
      }
    } else {
      try {
        const pages = await this.getPagesLocal();
        return pages
          .filter(page => page.albumId === albumId)
          .sort((a, b) => a.order - b.order);
      } catch (error) {
        console.error('加载相册页面失败:', error);
        return [];
      }
    }
  }

  static async deletePage(pageId: string): Promise<void> {
    if (this.isApiMode()) {
      try {
        await apiService.deletePage(pageId);
        console.log('页面删除成功:', pageId);
      } catch (error) {
        console.error('删除页面失败:', error);
        throw new Error('删除页面失败');
      }
    } else {
      try {
        const pages = await this.getPagesLocal();
        const page = pages.find(p => p.id === pageId);
        if (!page) return;
        
        const filteredPages = pages.filter(p => p.id !== pageId);
        localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(filteredPages));
        
        // 更新相册统计
        await this.updateAlbumStatsLocal(page.albumId);
        
        console.log('页面删除成功:', pageId);
      } catch (error) {
        console.error('删除页面失败:', error);
        throw new Error('删除页面失败');
      }
    }
  }

  static async getPageSummaries(albumId: string): Promise<PageSummary[]> {
    if (this.isApiMode()) {
      try {
        return await apiService.getPageSummaries(albumId);
      } catch (error) {
        console.error('加载页面摘要失败:', error);
        return [];
      }
    } else {
      try {
        const pages = await this.getAlbumPages(albumId);
        return pages.map(page => ({
          id: page.id,
          albumId: page.albumId,
          name: page.name,
          order: page.order,
          thumbnail: this.generatePageThumbnailLocal(page),
          updateTime: page.updateTime,
          elementCount: page.elements.length
        }));
      } catch (error) {
        console.error('加载页面摘要失败:', error);
        return [];
      }
    }
  }

  // 重新排序页面
  static async reorderPages(albumId: string, pageIds: string[]): Promise<void> {
    if (this.isApiMode()) {
      try {
        await apiService.reorderPages(albumId, pageIds);
        console.log('页面重排序成功');
      } catch (error) {
        console.error('页面重排序失败:', error);
        throw new Error('页面重排序失败');
      }
    } else {
      try {
        const pages = await this.getPagesLocal();
        const albumPages = pages.filter(p => p.albumId === albumId);
        
        // 更新页面顺序
        pageIds.forEach((pageId, index) => {
          const page = albumPages.find(p => p.id === pageId);
          if (page) {
            page.order = index;
            page.updateTime = Date.now();
          }
        });
        
        // 保存更新
        const otherPages = pages.filter(p => p.albumId !== albumId);
        const allPages = [...otherPages, ...albumPages];
        localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(allPages));
        
        console.log('页面重排序成功');
      } catch (error) {
        console.error('页面重排序失败:', error);
        throw new Error('页面重排序失败');
      }
    }
  }

  // 辅助方法
  private static async updateAlbumStatsLocal(albumId: string): Promise<void> {
    try {
      const albums = await this.getAlbumsLocal();
      const album = albums.find(a => a.id === albumId);
      if (!album) return;
      
      const pages = await this.getAlbumPages(albumId);
      album.pageCount = pages.length;
      album.lastEditTime = Date.now();
      album.updateTime = Date.now();
      
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
    } catch (error) {
      console.error('更新相册统计失败:', error);
    }
  }

  private static generatePageThumbnailLocal(page: AlbumPage): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f8f9fa"/>
        <text x="50" y="50" text-anchor="middle" font-size="12" fill="#6b7280">
          ${page.elements.length}个元素
        </text>
      </svg>
    `)}`;
  }

  // 编辑器状态管理（始终使用本地存储）
  static async saveEditorState(state: any): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('保存编辑器状态失败:', error);
    }
  }

  static async getEditorState(): Promise<any> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EDITOR_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载编辑器状态失败:', error);
      return null;
    }
  }

  // 数据导入导出
  static async exportData(): Promise<string> {
    if (this.isApiMode()) {
      try {
        return await apiService.exportData();
      } catch (error) {
        console.error('导出数据失败:', error);
        throw new Error('导出数据失败');
      }
    } else {
      try {
        const albums = await this.getAlbumsLocal();
        const pages = await this.getPagesLocal();
        
        const exportData = {
          version: '1.0.0',
          exportTime: Date.now(),
          albums,
          pages
        };
        
        return JSON.stringify(exportData, null, 2);
      } catch (error) {
        console.error('导出数据失败:', error);
        throw new Error('导出数据失败');
      }
    }
  }

  static async importData(jsonData: string): Promise<void> {
    if (this.isApiMode()) {
      try {
        await apiService.importData(jsonData);
        console.log('数据导入成功');
      } catch (error) {
        console.error('导入数据失败:', error);
        throw new Error('导入数据失败');
      }
    } else {
      try {
        const data = JSON.parse(jsonData);
        
        if (data.albums) {
          localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(data.albums));
        }
        
        if (data.pages) {
          localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(data.pages));
        }
        
        console.log('数据导入成功');
      } catch (error) {
        console.error('导入数据失败:', error);
        throw new Error('导入数据失败');
      }
    }
  }

  // 清理数据
  static async clearAllData(): Promise<void> {
    if (this.isApiMode()) {
      console.warn('API模式下不支持清理所有数据');
      throw new Error('API模式下不支持此操作');
    } else {
      try {
        Object.values(STORAGE_KEYS).forEach(key => {
          if (key !== STORAGE_KEYS.USE_API_MODE) { // 保留存储模式设置
            localStorage.removeItem(key);
          }
        });
        console.log('所有数据已清理');
      } catch (error) {
        console.error('清理数据失败:', error);
        throw new Error('清理数据失败');
      }
    }
  }

  // 获取存储使用情况
  static getStorageUsage(): { used: number; total: number; percentage: number } {
    if (this.isApiMode()) {
      // API模式下返回占位数据
      return { used: 0, total: 0, percentage: 0 };
    } else {
      try {
        let used = 0;
        Object.values(STORAGE_KEYS).forEach(key => {
          const data = localStorage.getItem(key);
          if (data) {
            used += new Blob([data]).size;
          }
        });
        
        // localStorage 通常限制为 5-10MB
        const total = 5 * 1024 * 1024; // 5MB
        const percentage = (used / total) * 100;
        
        return { used, total, percentage };
      } catch (error) {
        console.error('获取存储使用情况失败:', error);
        return { used: 0, total: 0, percentage: 0 };
      }
    }
  }

  // API专用方法（仅在API模式下可用）
  static async uploadImage(file: File): Promise<any> {
    if (!this.isApiMode()) {
      throw new Error('图片上传功能仅在API模式下可用');
    }
    return await apiService.uploadImage(file);
  }

  static async uploadImages(files: File[]): Promise<any[]> {
    if (!this.isApiMode()) {
      throw new Error('图片上传功能仅在API模式下可用');
    }
    return await apiService.uploadImages(files);
  }

  static async exportAlbum(albumId: string, options?: any): Promise<string> {
    if (!this.isApiMode()) {
      throw new Error('PDF导出功能仅在API模式下可用');
    }
    return await apiService.exportAlbum(albumId, options);
  }

  static async getExportTask(taskId: string): Promise<any> {
    if (!this.isApiMode()) {
      throw new Error('导出任务查询功能仅在API模式下可用');
    }
    return await apiService.getExportTask(taskId);
  }

  static async downloadExportFile(taskId: string): Promise<void> {
    if (!this.isApiMode()) {
      throw new Error('文件下载功能仅在API模式下可用');
    }
    return await apiService.downloadExportFile(taskId);
  }
}