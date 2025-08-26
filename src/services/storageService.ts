// 存储服务 - 简化版，直接使用API模式

import type { Album, AlbumPage, AlbumSummary, PageSummary } from '../types/album';
import { apiService } from './apiService';

export class StorageService {
  // 相册管理
  static async saveAlbum(album: Album): Promise<Album> {
    try {
      const savedAlbum = await apiService.saveAlbum(album);
      console.log('相册保存成功:', savedAlbum.name);
      return savedAlbum;
    } catch (error) {
      console.error('保存相册失败:', error);
      throw new Error('保存相册失败');
    }
  }

  static async getAlbums(): Promise<Album[]> {
    try {
      return await apiService.getAlbums();
    } catch (error) {
      console.error('获取相册列表失败:', error);
      throw new Error('获取相册列表失败');
    }
  }

  static async getAlbum(albumId: string): Promise<Album | null> {
    try {
      return await apiService.getAlbum(albumId);
    } catch (error) {
      console.error('获取相册失败:', error);
      return null;
    }
  }

  static async deleteAlbum(albumId: string): Promise<void> {
    try {
      await apiService.deleteAlbum(albumId);
      console.log('相册删除成功:', albumId);
    } catch (error) {
      console.error('删除相册失败:', error);
      throw new Error('删除相册失败');
    }
  }

  static async getAlbumSummaries(): Promise<AlbumSummary[]> {
    try {
      return await apiService.getAlbumSummaries();
    } catch (error) {
      console.error('获取相册摘要失败:', error);
      throw new Error('获取相册摘要失败');
    }
  }

  // 页面管理
  static async savePage(page: AlbumPage): Promise<void> {
    try {
      await apiService.savePage(page);
      console.log('页面保存成功:', page.name);
    } catch (error) {
      console.error('保存页面失败:', error);
      throw new Error('保存页面失败');
    }
  }

  static async getPages(): Promise<AlbumPage[]> {
    try {
      return await apiService.getPages();
    } catch (error) {
      console.error('获取页面列表失败:', error);
      throw new Error('获取页面列表失败');
    }
  }

  static async getPage(pageId: string): Promise<AlbumPage | null> {
    try {
      return await apiService.getPage(pageId);
    } catch (error) {
      console.error('获取页面失败:', error);
      return null;
    }
  }

  static async getAlbumPages(albumId: string): Promise<AlbumPage[]> {
    try {
      // 使用新的API接口获取相册页面
      const response = await apiService.get(`/albums/${albumId}/pages`);
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.message || '获取相册页面失败');
      }
    } catch (error) {
      console.error('获取相册页面失败:', error);
      throw new Error('获取相册页面失败');
    }
  }

  static async deletePage(pageId: string): Promise<void> {
    try {
      await apiService.deletePage(pageId);
      console.log('页面删除成功:', pageId);
    } catch (error) {
      console.error('删除页面失败:', error);
      throw new Error('删除页面失败');
    }
  }

  static async getPageSummaries(albumId: string): Promise<PageSummary[]> {
    try {
      return await apiService.getPageSummaries(albumId);
    } catch (error) {
      console.error('获取页面摘要失败:', error);
      throw new Error('获取页面摘要失败');
    }
  }

  // 重新排序页面
  static async reorderPages(albumId: string, pageIds: string[]): Promise<void> {
    try {
      await apiService.reorderPages(albumId, pageIds);
      console.log('页面重排序成功');
    } catch (error) {
      console.error('重排序页面失败:', error);
      throw new Error('重排序页面失败');
    }
  }

  // 画布尺寸和主题
  static async getCanvasSizes() {
    try {
      return await apiService.getCanvasSizes();
    } catch (error) {
      console.error('获取画布尺寸失败:', error);
      throw new Error('获取画布尺寸失败');
    }
  }

  static async getThemes() {
    try {
      return await apiService.getThemes();
    } catch (error) {
      console.error('获取主题失败:', error);
      throw new Error('获取主题失败');
    }
  }

  // 页面模板
  static async getPageTemplates() {
    try {
      return await apiService.getPageTemplates();
    } catch (error) {
      console.error('获取页面模板失败:', error);
      throw new Error('获取页面模板失败');
    }
  }

  static async getPageTemplate(templateId: string) {
    try {
      const templates = await apiService.getPageTemplates();
      return templates.find(t => t.id === templateId) || null;
    } catch (error) {
      console.error('获取页面模板失败:', error);
      return null;
    }
  }

  // 文件上传
  static async uploadImage(file: File) {
    try {
      return await apiService.uploadImage(file);
    } catch (error) {
      console.error('图片上传失败:', error);
      throw new Error('图片上传失败');
    }
  }

  static async uploadImages(files: File[]) {
    try {
      return await apiService.uploadImages(files);
    } catch (error) {
      console.error('批量图片上传失败:', error);
      throw new Error('批量图片上传失败');
    }
  }

  // 数据导入导出
  static async exportData(): Promise<string> {
    try {
      return await apiService.exportData();
    } catch (error) {
      console.error('数据导出失败:', error);
      throw new Error('数据导出失败');
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      await apiService.importData(jsonData);
      console.log('数据导入成功');
    } catch (error) {
      console.error('数据导入失败:', error);
      throw new Error('数据导入失败');
    }
  }

  // PDF导出
  static async exportAlbum(albumId: string, options?: any): Promise<string> {
    try {
      return await apiService.exportAlbum(albumId, options);
    } catch (error) {
      console.error('相册导出失败:', error);
      throw new Error('相册导出失败');
    }
  }

  static async getExportTask(taskId: string): Promise<any> {
    try {
      return await apiService.getExportTask(taskId);
    } catch (error) {
      console.error('导出任务查询失败:', error);
      throw new Error('导出任务查询失败');
    }
  }

  static async downloadExportFile(taskId: string): Promise<void> {
    try {
      return await apiService.downloadExportFile(taskId);
    } catch (error) {
      console.error('文件下载失败:', error);
      throw new Error('文件下载失败');
    }
  }

  // 编辑器状态管理（保留本地存储）
  static saveEditorState(state: any): void {
    try {
      localStorage.setItem('webalbum_editor_state', JSON.stringify(state));
    } catch (error) {
      console.warn('保存编辑器状态失败:', error);
    }
  }

  static getEditorState(): any {
    try {
      const state = localStorage.getItem('webalbum_editor_state');
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.warn('获取编辑器状态失败:', error);
      return null;
    }
  }

  static clearEditorState(): void {
    try {
      localStorage.removeItem('webalbum_editor_state');
    } catch (error) {
      console.warn('清理编辑器状态失败:', error);
    }
  }

  // 用户设置（保留本地存储）
  static saveUserSettings(settings: any): void {
    try {
      localStorage.setItem('webalbum_user_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('保存用户设置失败:', error);
    }
  }

  static getUserSettings(): any {
    try {
      const settings = localStorage.getItem('webalbum_user_settings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.warn('获取用户设置失败:', error);
      return {};
    }
  }

  // 兼容性方法（标记为已废弃）
  /** @deprecated 不再需要模式设置，统一使用API模式 */
  static setApiMode(_useApi: boolean): void {
    console.warn('setApiMode方法已废弃，现在统一使用API模式');
  }

  /** @deprecated 不再需要模式查询，统一使用API模式 */
  static getStorageMode(): 'api' {
    return 'api';
  }
}
