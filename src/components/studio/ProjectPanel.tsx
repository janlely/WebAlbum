// 左侧项目管理面板

import React, { useState, useEffect } from 'react';
import type { Album, AlbumPage, ProjectPanelState, CanvasSize, Theme } from '../../types';
import { defaultCanvasSizes, defaultThemes } from '../../types';
import { StorageService } from '../../services/storageService';

interface ProjectPanelProps {
  albums: Album[];
  currentAlbum: Album | null;
  albumPages: AlbumPage[];
  currentPage: AlbumPage | null;
  panelState: ProjectPanelState;
  onPanelStateChange: (state: ProjectPanelState) => void;
  onSelectAlbum: (albumId: string) => void;
  onSelectPage: (pageId: string) => void;
  onCreateAlbum: (albumData: Partial<Album>) => void;
  onCreatePage: (templateId?: string) => void;
  onDeleteAlbum: (albumId: string) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicateAlbum: (albumId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onRenameAlbum: (albumId: string, newName: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onReorderPages: (albumId: string, pageIds: string[]) => void;
  onRefreshAlbums: () => void;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({
  albums,
  currentAlbum,
  albumPages,
  currentPage,
  panelState,
  onPanelStateChange,
  onSelectAlbum,
  onSelectPage,
  onCreateAlbum,
  onCreatePage,
  onDeleteAlbum,
  onDeletePage,
  onDuplicateAlbum,
  onDuplicatePage,
  onRenameAlbum,
  onRenamePage,
  onReorderPages,
  onRefreshAlbums
}) => {
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    type: 'album' | 'page';
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [dragOverPageId, setDragOverPageId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: 'album' | 'page';
    id: string;
    name: string;
  } | null>(null);
  
  const [newAlbumData, setNewAlbumData] = useState({
    name: '',
    description: '',
    canvasSize: defaultCanvasSizes[0],
    theme: defaultThemes[0]
  });

  // 切换相册展开状态
  const toggleAlbumExpanded = (albumId: string) => {
    const newExpanded = new Set(panelState.expandedAlbums);
    if (newExpanded.has(albumId)) {
      newExpanded.delete(albumId);
    } else {
      newExpanded.add(albumId);
    }
    onPanelStateChange({ ...panelState, expandedAlbums: newExpanded });
  };

  // 创建新相册
  const handleCreateAlbum = () => {
    if (!newAlbumData.name.trim()) return;
    
    onCreateAlbum(newAlbumData);
    setNewAlbumData({
      name: '',
      description: '',
      canvasSize: defaultCanvasSizes[0],
      theme: defaultThemes[0]
    });
    setShowNewAlbumForm(false);
  };

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, type: 'album' | 'page', id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      type,
      id,
      x: e.clientX,
      y: e.clientY
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // 开始重命名
  const startRename = (type: 'album' | 'page', id: string, currentName: string) => {
    if (type === 'album') {
      setEditingAlbumId(id);
    } else {
      setEditingPageId(id);
    }
    setEditingName(currentName);
    closeContextMenu();
  };

  // 完成重命名
  const finishRename = () => {
    if (!editingName.trim()) return;
    
    if (editingAlbumId) {
      onRenameAlbum(editingAlbumId, editingName);
      setEditingAlbumId(null);
    } else if (editingPageId) {
      onRenamePage(editingPageId, editingName);
      setEditingPageId(null);
    }
    setEditingName('');
  };

  // 取消重命名
  const cancelRename = () => {
    setEditingAlbumId(null);
    setEditingPageId(null);
    setEditingName('');
  };

  // 删除确认
  const confirmDelete = (type: 'album' | 'page', id: string, name: string) => {
    setShowDeleteConfirm({ type, id, name });
    closeContextMenu();
  };

  // 执行删除
  const executeDelete = () => {
    if (!showDeleteConfirm) return;
    
    if (showDeleteConfirm.type === 'album') {
      onDeleteAlbum(showDeleteConfirm.id);
    } else {
      onDeletePage(showDeleteConfirm.id);
    }
    setShowDeleteConfirm(null);
  };

  // 复制相册/页面
  const handleDuplicate = (type: 'album' | 'page', id: string) => {
    if (type === 'album') {
      onDuplicateAlbum(id);
    } else {
      onDuplicatePage(id);
    }
    closeContextMenu();
  };

  // 页面拖拽开始
  const handlePageDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPageId(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 页面拖拽悬停
  const handlePageDragOver = (e: React.DragEvent, pageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPageId(pageId);
  };

  // 页面拖拽离开
  const handlePageDragLeave = () => {
    setDragOverPageId(null);
  };

  // 页面拖拽放下
  const handlePageDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    
    if (!draggedPageId || !currentAlbum || draggedPageId === targetPageId) return;
    
    const draggedIndex = albumPages.findIndex(p => p.id === draggedPageId);
    const targetIndex = albumPages.findIndex(p => p.id === targetPageId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // 重新排序
    const newPages = [...albumPages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, draggedPage);
    
    const newPageIds = newPages.map(p => p.id);
    onReorderPages(currentAlbum.id, newPageIds);
    
    setDraggedPageId(null);
    setDragOverPageId(null);
  };

  // 全局点击事件监听，用于关闭右键菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu) {
        closeContextMenu();
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // 过滤和排序相册
  const filteredAndSortedAlbums = albums
    .filter(album => 
      album.name.toLowerCase().includes(panelState.searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const field = panelState.sortBy;
      const order = panelState.sortOrder === 'asc' ? 1 : -1;
      
      switch (field) {
        case 'name':
          return a.name.localeCompare(b.name) * order;
        case 'createTime':
          return (a.createTime - b.createTime) * order;
        case 'lastEdit':
        default:
          return (a.lastEditTime - b.lastEditTime) * order;
      }
    });

  if (panelState.isCollapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4">
        <button
          onClick={() => onPanelStateChange({ ...panelState, isCollapsed: false })}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          title="展开项目面板"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 面板头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">项目管理</h2>
          <button
            onClick={() => onPanelStateChange({ ...panelState, isCollapsed: true })}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="折叠面板"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索相册..."
            value={panelState.searchQuery}
            onChange={(e) => onPanelStateChange({ ...panelState, searchQuery: e.target.value })}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg 
            className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 新建相册按钮 */}
        <button
          onClick={() => setShowNewAlbumForm(true)}
          className="w-full mt-3 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          + 新建相册
        </button>
      </div>

      {/* 相册列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredAndSortedAlbums.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">还没有相册</p>
              <p className="text-xs text-gray-400 mt-1">点击上方按钮创建第一个相册</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAndSortedAlbums.map((album) => (
                <div key={album.id} className="rounded-lg overflow-hidden">
                  {/* 相册项 */}
                  <div
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                      currentAlbum?.id === album.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectAlbum(album.id)}
                    onContextMenu={(e) => handleContextMenu(e, 'album', album.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAlbumExpanded(album.id);
                      }}
                      className="mr-2 p-1 hover:bg-gray-200 rounded"
                    >
                      <svg 
                        className={`w-3 h-3 transition-transform ${
                          panelState.expandedAlbums.has(album.id) ? 'rotate-90' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        {editingAlbumId === album.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={finishRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') finishRename();
                              if (e.key === 'Escape') cancelRename();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-medium bg-white border border-blue-500 rounded px-2 py-1 w-full"
                            autoFocus
                          />
                        ) : (
                          <>
                            <h3 className="text-sm font-medium truncate">{album.name}</h3>
                            <span className="text-xs text-gray-500 ml-2">{album.pageCount}</span>
                          </>
                        )}
                      </div>
                      {editingAlbumId !== album.id && (
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(album.lastEditTime).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 页面列表 */}
                  {panelState.expandedAlbums.has(album.id) && currentAlbum?.id === album.id && (
                    <div className="ml-6 mt-1 space-y-1">
                      {albumPages.map((page) => (
                        <div
                          key={page.id}
                          draggable
                          onDragStart={(e) => handlePageDragStart(e, page.id)}
                          onDragOver={(e) => handlePageDragOver(e, page.id)}
                          onDragLeave={handlePageDragLeave}
                          onDrop={(e) => handlePageDrop(e, page.id)}
                          className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                            currentPage?.id === page.id
                              ? 'bg-blue-100 text-blue-800'
                              : 'hover:bg-gray-100'
                          } ${
                            dragOverPageId === page.id && draggedPageId !== page.id
                              ? 'border-t-2 border-blue-500'
                              : ''
                          } ${
                            draggedPageId === page.id ? 'opacity-50' : ''
                          }`}
                          onClick={() => onSelectPage(page.id)}
                          onContextMenu={(e) => handleContextMenu(e, 'page', page.id)}
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            {editingPageId === page.id ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={finishRename}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') finishRename();
                                  if (e.key === 'Escape') cancelRename();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium bg-white border border-blue-500 rounded px-2 py-1 w-full"
                                autoFocus
                              />
                            ) : (
                              <>
                                <p className="text-sm font-medium truncate">{page.name}</p>
                                <p className="text-xs text-gray-500">
                                  {page.elements.length} 个元素
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* 添加页面按钮 */}
                      <button
                        onClick={() => onCreatePage()}
                        className="w-full flex items-center p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        添加页面
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 新建相册弹窗 */}
      {showNewAlbumForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80 mx-4">
            <h3 className="text-lg font-semibold mb-4">创建新相册</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  相册名称
                </label>
                <input
                  type="text"
                  value={newAlbumData.name}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入相册名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  画布尺寸
                </label>
                <select
                  value={newAlbumData.canvasSize.id}
                  onChange={(e) => {
                    const size = defaultCanvasSizes.find(s => s.id === e.target.value);
                    if (size) setNewAlbumData({ ...newAlbumData, canvasSize: size });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {defaultCanvasSizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name} ({size.aspectRatio})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  设计风格
                </label>
                <select
                  value={newAlbumData.theme.id}
                  onChange={(e) => {
                    const theme = defaultThemes.find(t => t.id === e.target.value);
                    if (theme) setNewAlbumData({ ...newAlbumData, theme });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {defaultThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewAlbumForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateAlbum}
                disabled={!newAlbumData.name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeContextMenu}
          />
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-36"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={() => startRename(
                contextMenu.type, 
                contextMenu.id, 
                contextMenu.type === 'album' 
                  ? albums.find(a => a.id === contextMenu.id)?.name || ''
                  : albumPages.find(p => p.id === contextMenu.id)?.name || ''
              )}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              重命名
            </button>
            
            <button
              onClick={() => handleDuplicate(contextMenu.type, contextMenu.id)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              复制
            </button>
            
            <div className="border-t border-gray-100 my-1" />
            
            <button
              onClick={() => confirmDelete(
                contextMenu.type,
                contextMenu.id,
                contextMenu.type === 'album'
                  ? albums.find(a => a.id === contextMenu.id)?.name || ''
                  : albumPages.find(p => p.id === contextMenu.id)?.name || ''
              )}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              删除
            </button>
          </div>
        </>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80 mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5C2.314 18.333 3.276 20 4.816 20z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                确认删除
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              确定要删除{showDeleteConfirm.type === 'album' ? '相册' : '页面'} "
              <span className="font-medium">{showDeleteConfirm.name}</span>" 吗？
              {showDeleteConfirm.type === 'album' && (
                <span className="block text-sm text-red-500 mt-1">
                  删除相册将同时删除其中的所有页面，此操作不可撤销。
                </span>
              )}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPanel;
