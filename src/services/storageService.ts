// 本地存储服务

import type { Album, AlbumPage, AlbumSummary, PageSummary } from '../types/album';

const STORAGE_KEYS = {
  ALBUMS: 'webalbum_albums',
  PAGES: 'webalbum_pages',
  EDITOR_STATE: 'webalbum_editor_state',
  USER_SETTINGS: 'webalbum_user_settings'
} as const;

export class StorageService {
  // 相册管理
  static async saveAlbum(album: Album): Promise<void> {
    try {
      const albums = await this.getAlbums();
      const existingIndex = albums.findIndex(a => a.id === album.id);
      
      if (existingIndex >= 0) {
        albums[existingIndex] = album;
      } else {
        albums.push(album);
      }
      
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
      console.log('相册保存成功:', album.name);
    } catch (error) {
      console.error('保存相册失败:', error);
      throw new Error('保存相册失败');
    }
  }

  static async getAlbums(): Promise<Album[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALBUMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载相册列表失败:', error);
      return [];
    }
  }

  static async getAlbum(albumId: string): Promise<Album | null> {
    try {
      const albums = await this.getAlbums();
      return albums.find(album => album.id === albumId) || null;
    } catch (error) {
      console.error('加载相册失败:', error);
      return null;
    }
  }

  static async deleteAlbum(albumId: string): Promise<void> {
    try {
      // 删除相册
      const albums = await this.getAlbums();
      const filteredAlbums = albums.filter(album => album.id !== albumId);
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(filteredAlbums));
      
      // 删除相册的所有页面
      const pages = await this.getPages();
      const filteredPages = pages.filter(page => page.albumId !== albumId);
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(filteredPages));
      
      console.log('相册删除成功:', albumId);
    } catch (error) {
      console.error('删除相册失败:', error);
      throw new Error('删除相册失败');
    }
  }

  static async getAlbumSummaries(): Promise<AlbumSummary[]> {
    try {
      const albums = await this.getAlbums();
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

  // 页面管理
  static async savePage(page: AlbumPage): Promise<void> {
    try {
      const pages = await this.getPages();
      const existingIndex = pages.findIndex(p => p.id === page.id);
      
      if (existingIndex >= 0) {
        pages[existingIndex] = page;
      } else {
        pages.push(page);
      }
      
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
      
      // 更新相册的页面数量和最后编辑时间
      await this.updateAlbumStats(page.albumId);
      
      console.log('页面保存成功:', page.name);
    } catch (error) {
      console.error('保存页面失败:', error);
      throw new Error('保存页面失败');
    }
  }

  static async getPages(): Promise<AlbumPage[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载页面列表失败:', error);
      return [];
    }
  }

  static async getPage(pageId: string): Promise<AlbumPage | null> {
    try {
      const pages = await this.getPages();
      return pages.find(page => page.id === pageId) || null;
    } catch (error) {
      console.error('加载页面失败:', error);
      return null;
    }
  }

  static async getAlbumPages(albumId: string): Promise<AlbumPage[]> {
    try {
      const pages = await this.getPages();
      return pages
        .filter(page => page.albumId === albumId)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('加载相册页面失败:', error);
      return [];
    }
  }

  static async deletePage(pageId: string): Promise<void> {
    try {
      const pages = await this.getPages();
      const page = pages.find(p => p.id === pageId);
      if (!page) return;
      
      const filteredPages = pages.filter(p => p.id !== pageId);
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(filteredPages));
      
      // 更新相册统计
      await this.updateAlbumStats(page.albumId);
      
      console.log('页面删除成功:', pageId);
    } catch (error) {
      console.error('删除页面失败:', error);
      throw new Error('删除页面失败');
    }
  }

  static async getPageSummaries(albumId: string): Promise<PageSummary[]> {
    try {
      const pages = await this.getAlbumPages(albumId);
      return pages.map(page => ({
        id: page.id,
        albumId: page.albumId,
        name: page.name,
        order: page.order,
        thumbnail: this.generatePageThumbnail(page),
        updateTime: page.updateTime,
        elementCount: page.elements.length
      }));
    } catch (error) {
      console.error('加载页面摘要失败:', error);
      return [];
    }
  }

  // 重新排序页面
  static async reorderPages(albumId: string, pageIds: string[]): Promise<void> {
    try {
      const pages = await this.getPages();
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

  // 辅助方法
  private static async updateAlbumStats(albumId: string): Promise<void> {
    try {
      const album = await this.getAlbum(albumId);
      if (!album) return;
      
      const pages = await this.getAlbumPages(albumId);
      album.pageCount = pages.length;
      album.lastEditTime = Date.now();
      album.updateTime = Date.now();
      
      await this.saveAlbum(album);
    } catch (error) {
      console.error('更新相册统计失败:', error);
    }
  }

  private static generatePageThumbnail(page: AlbumPage): string {
    // TODO: 根据页面内容生成缩略图
    // 这里先返回一个占位符，后续可以实现canvas渲染缩略图
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f8f9fa"/>
        <text x="50" y="50" text-anchor="middle" font-size="12" fill="#6b7280">
          ${page.elements.length}个元素
        </text>
      </svg>
    `)}`;
  }

  // 编辑器状态管理
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
    try {
      const albums = await this.getAlbums();
      const pages = await this.getPages();
      
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

  static async importData(jsonData: string): Promise<void> {
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

  // 清理数据
  static async clearAllData(): Promise<void> {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('所有数据已清理');
    } catch (error) {
      console.error('清理数据失败:', error);
      throw new Error('清理数据失败');
    }
  }

  // 获取存储使用情况
  static getStorageUsage(): { used: number; total: number; percentage: number } {
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
