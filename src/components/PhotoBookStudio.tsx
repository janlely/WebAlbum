// 新的照片书工作室 - 三栏布局专业编辑器

import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import type { 
  Album, 
  AlbumPage, 
  EditorState, 
  ToolPanelState, 
  ProjectPanelState 
} from '../types';

// 组件导入
import ProjectPanel from './studio/ProjectPanel';
import CanvasEditor from './studio/CanvasEditor';
import ToolPanel from './studio/ToolPanel';

interface PhotoBookStudioProps {
  onBackToHome: () => void;
}

const PhotoBookStudio: React.FC<PhotoBookStudioProps> = ({ onBackToHome }) => {
  // 主要状态
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [currentPage, setCurrentPage] = useState<AlbumPage | null>(null);
  const [albumPages, setAlbumPages] = useState<AlbumPage[]>([]);
  
  // 编辑器状态
  const [editorState, setEditorState] = useState<EditorState>({
    currentAlbumId: null,
    currentPageId: null,
    selectedElementIds: [],
    clipboard: [],
    history: { past: [], present: null, future: [] },
    isAutoSaving: false,
    lastSaveTime: Date.now()
  });
  
  // 面板状态
  const [projectPanelState, setProjectPanelState] = useState<ProjectPanelState>({
    expandedAlbums: new Set(),
    isCollapsed: false,
    searchQuery: '',
    sortBy: 'lastEdit',
    sortOrder: 'desc'
  });
  
  const [toolPanelState, setToolPanelState] = useState<ToolPanelState>({
    activeTab: 'templates',
    isCollapsed: false
  });
  
  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 初始化加载数据
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // 加载相册列表
      const albumList = await StorageService.getAlbums();
      setAlbums(albumList);
      
      // 尝试恢复编辑器状态
      const savedState = await StorageService.getEditorState();
      if (savedState && savedState.currentAlbumId) {
        const album = albumList.find(a => a.id === savedState.currentAlbumId);
        if (album) {
          await selectAlbum(album.id);
          if (savedState.currentPageId) {
            const page = await StorageService.getPage(savedState.currentPageId);
            if (page) {
              setCurrentPage(page);
              setEditorState(prev => ({ ...prev, currentPageId: page.id }));
            }
          }
        }
      }
    } catch (error) {
      console.error('加载初始数据失败:', error);
    }
  };

  // 选择相册
  const selectAlbum = useCallback(async (albumId: string) => {
    try {
      const album = await StorageService.getAlbum(albumId);
      if (!album) return;
      
      const pages = await StorageService.getAlbumPages(albumId);
      
      setCurrentAlbum(album);
      setAlbumPages(pages);
      setEditorState(prev => ({ 
        ...prev, 
        currentAlbumId: albumId,
        currentPageId: pages.length > 0 ? pages[0].id : null
      }));
      
      // 选择第一页
      if (pages.length > 0) {
        setCurrentPage(pages[0]);
      } else {
        setCurrentPage(null);
      }
      
      // 展开当前相册
      setProjectPanelState(prev => ({
        ...prev,
        expandedAlbums: new Set([...prev.expandedAlbums, albumId])
      }));
    } catch (error) {
      console.error('选择相册失败:', error);
    }
  }, []);

  // 选择页面
  const selectPage = useCallback(async (pageId: string) => {
    try {
      // 保存当前页面
      if (currentPage) {
        await savePage(currentPage);
      }
      
      const page = await StorageService.getPage(pageId);
      if (!page) return;
      
      setCurrentPage(page);
      setEditorState(prev => ({ 
        ...prev, 
        currentPageId: pageId,
        selectedElementIds: [] // 清除选择
      }));
    } catch (error) {
      console.error('选择页面失败:', error);
    }
  }, [currentPage]);

  // 创建新相册
  const createNewAlbum = useCallback(async (albumData: Partial<Album>) => {
    try {
      const newAlbum: Album = {
        id: `album_${Date.now()}`,
        name: albumData.name || '新相册',
        description: albumData.description,
        canvasSize: albumData.canvasSize!,
        theme: albumData.theme!,
        settings: {
          showGrid: true,
          snapToGrid: true,
          gridSize: 10,
          autoSave: true,
          autoSaveInterval: 30
        },
        pageCount: 0,
        createTime: Date.now(),
        updateTime: Date.now(),
        lastEditTime: Date.now(),
        tags: [],
        category: 'default'
      };
      
      await StorageService.saveAlbum(newAlbum);
      
      // 更新状态
      setAlbums(prev => [newAlbum, ...prev]);
      await selectAlbum(newAlbum.id);
      
      showSaveMessage('新相册创建成功');
    } catch (error) {
      console.error('创建相册失败:', error);
      showSaveMessage('创建相册失败', true);
    }
  }, [selectAlbum]);

  // 创建新页面
  const createNewPage = useCallback(async (templateId?: string) => {
    if (!currentAlbum) return;
    
    try {
      const newPage: AlbumPage = {
        id: `page_${Date.now()}`,
        albumId: currentAlbum.id,
        name: `页面 ${albumPages.length + 1}`,
        order: albumPages.length,
        templateId,
        elements: [],
        createTime: Date.now(),
        updateTime: Date.now()
      };
      
      await StorageService.savePage(newPage);
      
      // 更新状态
      const updatedPages = [...albumPages, newPage];
      setAlbumPages(updatedPages);
      setCurrentPage(newPage);
      setEditorState(prev => ({ ...prev, currentPageId: newPage.id }));
      
      showSaveMessage('新页面创建成功');
    } catch (error) {
      console.error('创建页面失败:', error);
      showSaveMessage('创建页面失败', true);
    }
  }, [currentAlbum, albumPages]);

  // 保存页面
  const savePage = useCallback(async (page: AlbumPage) => {
    if (!page) return;
    
    try {
      setIsSaving(true);
      page.updateTime = Date.now();
      await StorageService.savePage(page);
      
      // 更新本地状态
      setAlbumPages(prev => 
        prev.map(p => p.id === page.id ? page : p)
      );
      
      setEditorState(prev => ({ ...prev, lastSaveTime: Date.now() }));
      showSaveMessage('保存成功');
    } catch (error) {
      console.error('保存页面失败:', error);
      showSaveMessage('保存失败', true);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // 手动保存
  const handleSave = useCallback(async () => {
    if (currentPage) {
      await savePage(currentPage);
    }
  }, [currentPage, savePage]);

  // 自动保存
  useEffect(() => {
    if (!currentAlbum?.settings.autoSave || !currentPage) return;
    
    const interval = setInterval(() => {
      savePage(currentPage);
    }, (currentAlbum.settings.autoSaveInterval || 30) * 1000);
    
    return () => clearInterval(interval);
  }, [currentAlbum, currentPage, savePage]);

  // 显示保存消息
  const showSaveMessage = (message: string, isError = false) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // 删除相册
  const deleteAlbum = useCallback(async (albumId: string) => {
    try {
      await StorageService.deleteAlbum(albumId);
      
      // 更新状态
      const updatedAlbums = albums.filter(a => a.id !== albumId);
      setAlbums(updatedAlbums);
      
      // 如果删除的是当前相册，切换到第一个相册或清空
      if (currentAlbum?.id === albumId) {
        if (updatedAlbums.length > 0) {
          await selectAlbum(updatedAlbums[0].id);
        } else {
          setCurrentAlbum(null);
          setCurrentPage(null);
          setAlbumPages([]);
          setEditorState(prev => ({ 
            ...prev, 
            currentAlbumId: null, 
            currentPageId: null 
          }));
        }
      }
      
      showSaveMessage('相册删除成功');
    } catch (error) {
      console.error('删除相册失败:', error);
      showSaveMessage('删除相册失败', true);
    }
  }, [albums, currentAlbum, selectAlbum]);

  // 删除页面
  const deletePage = useCallback(async (pageId: string) => {
    try {
      await StorageService.deletePage(pageId);
      
      // 更新状态
      const updatedPages = albumPages.filter(p => p.id !== pageId);
      setAlbumPages(updatedPages);
      
      // 如果删除的是当前页面，切换到第一页或清空
      if (currentPage?.id === pageId) {
        if (updatedPages.length > 0) {
          setCurrentPage(updatedPages[0]);
          setEditorState(prev => ({ ...prev, currentPageId: updatedPages[0].id }));
        } else {
          setCurrentPage(null);
          setEditorState(prev => ({ ...prev, currentPageId: null }));
        }
      }
      
      showSaveMessage('页面删除成功');
    } catch (error) {
      console.error('删除页面失败:', error);
      showSaveMessage('删除页面失败', true);
    }
  }, [albumPages, currentPage]);

  // 复制相册
  const duplicateAlbum = useCallback(async (albumId: string) => {
    try {
      const originalAlbum = await StorageService.getAlbum(albumId);
      if (!originalAlbum) return;
      
      const newAlbum: Album = {
        ...originalAlbum,
        id: `album_${Date.now()}`,
        name: `${originalAlbum.name} - 副本`,
        createTime: Date.now(),
        updateTime: Date.now(),
        lastEditTime: Date.now(),
        pageCount: 0
      };
      
      await StorageService.saveAlbum(newAlbum);
      
      // 复制所有页面
      const originalPages = await StorageService.getAlbumPages(albumId);
      for (const originalPage of originalPages) {
        const newPage: AlbumPage = {
          ...originalPage,
          id: `page_${Date.now()}_${Math.random()}`,
          albumId: newAlbum.id,
          createTime: Date.now(),
          updateTime: Date.now()
        };
        await StorageService.savePage(newPage);
      }
      
      // 更新相册列表
      setAlbums(prev => [newAlbum, ...prev]);
      showSaveMessage('相册复制成功');
    } catch (error) {
      console.error('复制相册失败:', error);
      showSaveMessage('复制相册失败', true);
    }
  }, []);

  // 复制页面
  const duplicatePage = useCallback(async (pageId: string) => {
    try {
      const originalPage = await StorageService.getPage(pageId);
      if (!originalPage || !currentAlbum) return;
      
      const newPage: AlbumPage = {
        ...originalPage,
        id: `page_${Date.now()}`,
        name: `${originalPage.name} - 副本`,
        order: albumPages.length,
        createTime: Date.now(),
        updateTime: Date.now()
      };
      
      await StorageService.savePage(newPage);
      
      // 更新状态
      const updatedPages = [...albumPages, newPage];
      setAlbumPages(updatedPages);
      showSaveMessage('页面复制成功');
    } catch (error) {
      console.error('复制页面失败:', error);
      showSaveMessage('复制页面失败', true);
    }
  }, [albumPages, currentAlbum]);

  // 重命名相册
  const renameAlbum = useCallback(async (albumId: string, newName: string) => {
    try {
      const album = await StorageService.getAlbum(albumId);
      if (!album) return;
      
      album.name = newName;
      album.updateTime = Date.now();
      await StorageService.saveAlbum(album);
      
      // 更新状态
      setAlbums(prev => 
        prev.map(a => a.id === albumId ? { ...a, name: newName } : a)
      );
      
      if (currentAlbum?.id === albumId) {
        setCurrentAlbum(prev => prev ? { ...prev, name: newName } : null);
      }
      
      showSaveMessage('相册重命名成功');
    } catch (error) {
      console.error('重命名相册失败:', error);
      showSaveMessage('重命名相册失败', true);
    }
  }, [currentAlbum]);

  // 重命名页面
  const renamePage = useCallback(async (pageId: string, newName: string) => {
    try {
      const page = await StorageService.getPage(pageId);
      if (!page) return;
      
      page.name = newName;
      page.updateTime = Date.now();
      await StorageService.savePage(page);
      
      // 更新状态
      setAlbumPages(prev => 
        prev.map(p => p.id === pageId ? { ...p, name: newName } : p)
      );
      
      if (currentPage?.id === pageId) {
        setCurrentPage(prev => prev ? { ...prev, name: newName } : null);
      }
      
      showSaveMessage('页面重命名成功');
    } catch (error) {
      console.error('重命名页面失败:', error);
      showSaveMessage('重命名页面失败', true);
    }
  }, [currentPage]);

  // 重新排序页面
  const reorderPages = useCallback(async (albumId: string, pageIds: string[]) => {
    try {
      await StorageService.reorderPages(albumId, pageIds);
      
      // 重新加载页面
      if (currentAlbum?.id === albumId) {
        const updatedPages = await StorageService.getAlbumPages(albumId);
        setAlbumPages(updatedPages);
      }
      
      showSaveMessage('页面顺序已更新');
    } catch (error) {
      console.error('重排序页面失败:', error);
      showSaveMessage('重排序页面失败', true);
    }
  }, [currentAlbum]);

  // 刷新相册列表
  const refreshAlbums = useCallback(async () => {
    try {
      const albumList = await StorageService.getAlbums();
      setAlbums(albumList);
    } catch (error) {
      console.error('刷新相册列表失败:', error);
    }
  }, []);

  // 导出相册
  const handleExport = useCallback(async () => {
    if (!currentAlbum) return;
    
    try {
      // TODO: 实现导出功能
      console.log('导出相册:', currentAlbum.name);
      showSaveMessage('导出功能开发中...');
    } catch (error) {
      console.error('导出失败:', error);
      showSaveMessage('导出失败', true);
    }
  }, [currentAlbum]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>返回首页</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentAlbum?.name || 'WebAlbum Studio'}
            </h1>
            {currentPage && (
              <p className="text-sm text-gray-500">
                {currentPage.name} • {currentAlbum?.canvasSize.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 保存状态 */}
          {saveMessage && (
            <div className={`text-sm px-3 py-1 rounded ${
              saveMessage.includes('失败') 
                ? 'text-red-600 bg-red-50' 
                : 'text-green-600 bg-green-50'
            }`}>
              {saveMessage}
            </div>
          )}
          
          {/* 自动保存状态 */}
          {currentAlbum?.settings.autoSave && (
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>自动保存已开启</span>
            </div>
          )}
          
          {/* 操作按钮 */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            导出PDF
          </button>
        </div>
      </div>

      {/* 主要工作区域 - 三栏布局 */}
      <div className="flex-1 flex">
        {/* 左侧：项目管理面板 */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          projectPanelState.isCollapsed ? 'w-12' : 'w-64'
        }`}>
          <ProjectPanel
            albums={albums}
            currentAlbum={currentAlbum}
            albumPages={albumPages}
            currentPage={currentPage}
            panelState={projectPanelState}
            onPanelStateChange={setProjectPanelState}
            onSelectAlbum={selectAlbum}
            onSelectPage={selectPage}
            onCreateAlbum={createNewAlbum}
            onCreatePage={createNewPage}
            onDeleteAlbum={deleteAlbum}
            onDeletePage={deletePage}
            onDuplicateAlbum={duplicateAlbum}
            onDuplicatePage={duplicatePage}
            onRenameAlbum={renameAlbum}
            onRenamePage={renamePage}
            onReorderPages={reorderPages}
            onRefreshAlbums={refreshAlbums}
          />
        </div>

        {/* 中间：画布编辑区 */}
        <div className="flex-1 bg-gray-100">
          <CanvasEditor
            album={currentAlbum}
            page={currentPage}
            editorState={editorState}
            onPageChange={setCurrentPage}
            onStateChange={setEditorState}
          />
        </div>

        {/* 右侧：工具面板 */}
        <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
          toolPanelState.isCollapsed ? 'w-12' : 'w-80'
        }`}>
          <ToolPanel
            album={currentAlbum}
            page={currentPage}
            panelState={toolPanelState}
            editorState={editorState}
            onPanelStateChange={setToolPanelState}
            onCreatePage={createNewPage}
            onAlbumChange={setCurrentAlbum}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default PhotoBookStudio;
