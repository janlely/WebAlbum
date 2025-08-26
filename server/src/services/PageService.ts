import { PageDAO } from '../models/PageDAO';
import { DatabaseManager } from '../database/factory';
import { CreatePageRequest, UpdatePageRequest, PageListQuery } from '../models/PageDAO';

export class PageService {
  async getPagesByAlbumId(albumId: string, userId: string): Promise<any[]> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.findByAlbumId(albumId, userId);
  }

  async createPage(data: CreatePageRequest): Promise<any> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.create(data);
  }

  async getPageById(id: string, userId: string): Promise<any> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.findById(id, userId);
  }

  async getAlbumPages(albumId: string, userId: string): Promise<any[]> {
    return this.getPagesByAlbumId(albumId, userId);
  }

  async getPageList(query: PageListQuery): Promise<any> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    
    // 提供page和pageSize的默认值
    const fullQuery = {
      ...query,
      page: query.page || 1,
      pageSize: query.pageSize || 20
    };
    
    return pageDAO.findMany(fullQuery);
  }

  async updatePage(id: string, data: UpdatePageRequest, userId: string): Promise<any> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.update(id, data, userId);
  }

  async deletePage(id: string, userId: string): Promise<boolean> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.delete(id, userId);
  }

  async reorderPages(albumId: string, pageIds: string[], userId: string): Promise<boolean> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.reorderPages(albumId, pageIds, userId);
  }

  async duplicatePage(pageId: string, userId: string): Promise<any> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.duplicate(pageId, userId);
  }

  async getPageStats(albumId: string, userId: string): Promise<any> {
    const dbManager = DatabaseManager.getInstance();
    const connection = await dbManager.getConnection();
    const pageDAO = new PageDAO(connection);
    return pageDAO.getPageStats(albumId, userId);
  }
}

export const pageService = new PageService();
