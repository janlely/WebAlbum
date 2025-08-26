// 新的照片书工作室 - 三栏布局专业编辑器

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { useAutoSave } from '../hooks/useAutoSave';
import { generateUUID } from '../utils/uuid';
import type { 
  Album, 
  AlbumPage, 
  EditorState, 
  ToolPanelState, 
  ProjectPanelState,
  PageElement
} from '../types';
import { defaultPageTemplates } from '../types';

// 组件导入
import ProjectPanel from './studio/ProjectPanel';
import CanvasEditor from './studio/CanvasEditor';
import ToolPanel from './studio/ToolPanel';

const PhotoBookStudio: React.FC = () => {
  const navigate = useNavigate();
  
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

  // 初始化加载数据
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 确保设置用户ID
      const { apiService } = await import('../services/apiService');
      // 用户认证将由后端会话管理
      console.log('API服务已初始化');
      
      // 清理旧的本地数据，避免ID格式冲突
      await clearLegacyLocalData();
      
      await loadInitialData();
    } catch (error) {
      console.error('初始化应用失败:', error);
    }
  };

  // 清理旧的本地存储数据
  const clearLegacyLocalData = async () => {
    try {
      const legacyKeys = [
        'webalbum_albums',
        'webalbum_pages', 
        'webalbum_current_album_id',
        'webalbum_current_page_id'
      ];
      
      legacyKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          console.log(`清理旧数据: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      console.log('旧数据清理完成');
    } catch (error) {
      console.warn('清理旧数据失败:', error);
    }
  };

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
      // 直接从albums状态中获取相册数据
      const album = albums.find(a => a.id === albumId);
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
  }, [albums]);

  // 选择页面
  const selectPage = useCallback(async (pageId: string) => {
    try {
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
      // 确保canvasSizeId有值（使用默认值）
      const { apiService } = await import('../services/apiService');
      let canvasSizeId = albumData.canvasSizeId;
      
      // 如果未提供canvasSizeId，获取默认值
      if (!canvasSizeId) {
        try {
          console.log('尝试获取画布尺寸列表...');
          const canvasSizes = await apiService.getCanvasSizes();
          console.log('获取到的画布尺寸列表:', canvasSizes);
          
          if (canvasSizes.length > 0) {
            canvasSizeId = canvasSizes[0].id;
            console.log('使用第一个画布尺寸ID:', canvasSizeId);
          } else {
            console.warn('画布尺寸列表为空');
          }
        } catch (error) {
          console.error('获取画布尺寸失败:', error);
        }
      }
      
      // 确保canvasSizeId有值，否则使用硬编码默认值
      if (!canvasSizeId) {
        canvasSizeId = 'default_canvas_size';
        console.warn('使用默认画布尺寸ID');
      }
      
      let themeId = albumData.themeId;
      // 如果未提供themeId，尝试获取默认主题
      if (!themeId) {
        try {
          console.log('尝试获取主题列表...');
          const themes = await apiService.getThemes();
          console.log('获取到的主题列表:', themes);
          
          if (themes.length > 0) {
            themeId = themes[0].id;
            console.log('使用第一个主题ID:', themeId);
          } else {
            console.warn('主题列表为空');
            themeId = 'default_theme';
          }
        } catch (error) {
          console.error('获取主题失败:', error);
          themeId = 'default_theme';
        }
      }
      
      const albumToCreate = {
        name: albumData.name || '新相册',
        description: albumData.description || '',
        canvasSizeId: canvasSizeId, // 使用有效值
        themeId: albumData.themeId || '',
        settings: JSON.stringify({
          showGrid: true,
          snapToGrid: true,
          gridSize: 10
        }),
        tags: [],
        category: 'default'
      };
      
      // 调用StorageService，它会自动使用API并返回创建的相册
      const savedAlbum = await StorageService.saveAlbum(albumToCreate as any);
        
        // 重新加载相册列表以获取最新数据
        const updatedAlbums = await StorageService.getAlbums();
        setAlbums(updatedAlbums);
        
        // 选择新创建的相册
        if (savedAlbum) {
          await selectAlbum(savedAlbum.id);
        }
      
      console.log('新相册创建成功');
    } catch (error) {
      console.error('创建相册失败:', error);
      // 错误已在console.error中记录
    }
  }, [selectAlbum]);

  // 创建新页面
  const createNewPage = useCallback(async (templateId?: string) => {
    if (!currentAlbum) return;
    
    try {
      const newPage: AlbumPage = {
        id: generateUUID(),
        albumId: currentAlbum.id,
        name: `页面 ${albumPages.length + 1}`,
        order: albumPages.length,
        templateId,
        elements: templateId ? generateElementsFromTemplate(templateId) : [],
        createTime: Date.now(),
        updateTime: Date.now()
      };
      
      await StorageService.savePage(newPage);
      
      // 更新状态
      const updatedPages = [...albumPages, newPage];
      setAlbumPages(updatedPages);
      setCurrentPage(newPage);
      setEditorState(prev => ({ ...prev, currentPageId: newPage.id }));
      
      console.log('新页面创建成功');
    } catch (error) {
      console.error('创建页面失败', error);
      // 错误已在console.error中记录
    }
  }, [currentAlbum, albumPages]);

  // 应用模板到当前页面
  const applyTemplate = useCallback(async (templateId: string) => {
    if (!currentPage) return;
    
    try {
      const updatedPage: AlbumPage = {
        ...currentPage,
        templateId,
        elements: generateElementsFromTemplate(templateId),
        updateTime: Date.now()
      };
      
      await StorageService.savePage(updatedPage);
      setCurrentPage(updatedPage);
      
      // 更新页面列表中的页面
      setAlbumPages(prev => 
        prev.map(p => p.id === updatedPage.id ? updatedPage : p)
      );
      
      console.log('模板应用成功');
    } catch (error) {
      console.error('应用模板失败', error);
      // 错误已在console.error中记录
    }
  }, [currentPage]);

  // 从模板生成页面元素
  const generateElementsFromTemplate = useCallback((templateId: string): PageElement[] => {
    const template = defaultPageTemplates.find((t: any) => t.id === templateId);
    if (!template) return [];

    const elements: PageElement[] = [];

    // 添加照片框架
    template.photoFrames.forEach((frame: any, index: number) => {
      elements.push({
        id: `photo_${Date.now()}_${index}`,
        type: 'photo',
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        zIndex: frame.zIndex || index + 1,
        url: '', // 空的，等待用户添加图片
        placeholder: frame.placeholder || '点击添加图片'
      });
    });

    // 添加文本框架
    template.textFrames.forEach((frame: any, index: number) => {
      elements.push({
        id: `text_${Date.now()}_${index}`,
        type: 'text',
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        zIndex: frame.zIndex || (template.photoFrames.length + index + 1),
        content: frame.placeholder || '点击添加文本',
        fontSize: frame.fontSize === 'large' ? 24 : frame.fontSize === 'medium' ? 18 : 14,
        textAlign: frame.textAlign || 'left',
        fontWeight: frame.fontWeight || 'normal',
        color: '#333333'
      });
    });

    return elements;
  }, []);

  // 实时自动保存 - 监听数据变化
  const { forceSave } = useAutoSave(
    currentPage,
    async (page: AlbumPage) => {
      try {
        setIsSaving(true);
        page.updateTime = Date.now();
        await StorageService.savePage(page);
        
        // 更新本地状态
        setAlbumPages(prev => 
          prev.map(p => p.id === page.id ? page : p)
        );
        
        setEditorState(prev => ({ ...prev, lastSaveTime: Date.now() }));
      } catch (error) {
        console.error('自动保存失败', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    {
      enabled: true, // 始终启用实时保存
      delay: 500    // 500ms防抖延迟
    }
  );

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
      
      console.log('相册删除成功');
    } catch (error) {
      console.error('删除相册失败', error);
      // 错误已在console.error中记录
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
      
      console.log('页面删除成功');
    } catch (error) {
      console.error('删除页面失败', error);
      // 错误已在console.error中记录
    }
  }, [albumPages, currentPage]);

  // 复制相册
  const duplicateAlbum = useCallback(async (albumId: string) => {
    try {
      const originalAlbum = await StorageService.getAlbum(albumId);
      if (!originalAlbum) return;
      
      // 创建副本（使用后端API期望的字段）
      const albumData = {
        name: `${originalAlbum.name} - 副本`,
        description: originalAlbum.description,
        canvasSizeId: originalAlbum.canvasSizeId,
        themeId: originalAlbum.themeId,
        settings: originalAlbum.settings,
        tags: originalAlbum.tags,
        category: originalAlbum.category
      };
      
      const newAlbum = await StorageService.saveAlbum(albumData as Album);
      
      // 复制所有页面
      const originalPages = await StorageService.getAlbumPages(albumId);
      for (const originalPage of originalPages) {
        const newPage: AlbumPage = {
          ...originalPage,
          id: generateUUID(),
          albumId: newAlbum.id,
          createTime: Date.now(),
          updateTime: Date.now()
        };
        await StorageService.savePage(newPage);
      }
      
      // 更新相册列表
      setAlbums(prev => [newAlbum, ...prev]);
      console.log('相册复制成功');
    } catch (error) {
      console.error('复制相册失败', error);
      // 错误已在console.error中记录
    }
  }, []);

  // 复制页面
  const duplicatePage = useCallback(async (pageId: string) => {
    try {
      const originalPage = await StorageService.getPage(pageId);
      if (!originalPage || !currentAlbum) return;
      
      const newPage: AlbumPage = {
        ...originalPage,
        id: generateUUID(),
        name: `${originalPage.name} - 副本`,
        order: albumPages.length,
        createTime: Date.now(),
        updateTime: Date.now()
      };
      
      await StorageService.savePage(newPage);
      
      // 更新状态
      const updatedPages = [...albumPages, newPage];
      setAlbumPages(updatedPages);
      console.log('页面复制成功');
    } catch (error) {
      console.error('复制页面失败', error);
      // 错误已在console.error中记录
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
      
      console.log('相册重命名成功');
    } catch (error) {
      console.error('重命名相册失败', error);
      // 错误已在console.error中记录
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
      
      console.log('页面重命名成功');
    } catch (error) {
      console.error('重命名页面失败', error);
      // 错误已在console.error中记录
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
      
      console.log('页面顺序已更新');
    } catch (error) {
      console.error('重排序页面失败', error);
      // 错误已在console.error中记录
    }
  }, [currentAlbum]);

  // 刷新相册列表
  const refreshAlbums = useCallback(async () => {
    try {
      const albumList = await StorageService.getAlbums();
      setAlbums(albumList);
    } catch (error) {
      console.error('刷新相册列表失败', error);
    }
  }, []);

  // 导出相册
  const handleExport = useCallback(async () => {
    if (!currentAlbum) return;
    
    try {
      // TODO: 实现导出功能
      console.log('导出相册:', currentAlbum.name);
      console.log('导出功能开发中...');
    } catch (error) {
      console.error('导出失败', error);
      // 错误已在console.error中记录
    }
  }, [currentAlbum]);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToHome}
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
                {currentPage.name} • {currentAlbum?.canvasSizeId || '默认尺寸'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 操作按钮 */}
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            导出PDF
          </button>
        </div>
      </div>

      {/* 主要工作区域 - 三栏布局 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧：项目管理面板 */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
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
        <div className="flex-1 bg-gray-100 flex flex-col min-w-0">
          <CanvasEditor
            album={currentAlbum}
            page={currentPage}
            editorState={editorState}
            onPageChange={setCurrentPage}
            onStateChange={setEditorState}
          />
        </div>

        {/* 右侧：工具面板 */}
        <div className={`bg-white border-l border-gray-200 transition-all duration-300 flex flex-col ${
          toolPanelState.isCollapsed ? 'w-12' : 'w-80'
        }`}>
          <ToolPanel
            album={currentAlbum}
            page={currentPage}
            panelState={toolPanelState}
            editorState={editorState}
            onPanelStateChange={setToolPanelState}
            onCreatePage={createNewPage}
            onApplyTemplate={applyTemplate}
            onAlbumChange={setCurrentAlbum}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default PhotoBookStudio;
