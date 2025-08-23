// 中间画布编辑区

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Album, AlbumPage, EditorState, PageElement, PhotoElement, TextElement, ShapeElement } from '../../types';

interface CanvasEditorProps {
  album: Album | null;
  page: AlbumPage | null;
  editorState: EditorState;
  onPageChange: (page: AlbumPage) => void;
  onStateChange: (state: EditorState) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  album,
  page,
  editorState,
  onPageChange,
  onStateChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  
  // 拖拽和调整大小状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<PageElement | null>(null);
  
  // 快捷键状态
  const [keyPressed, setKeyPressed] = useState<Set<string>>(new Set());

  // 计算画布缩放比例以适应容器
  useEffect(() => {
    if (!album || !canvasRef.current) return;

    const updateScale = () => {
      const container = canvasRef.current!;
      const containerRect = container.getBoundingClientRect();
      
      // 留出一些边距
      const padding = 80;
      const maxWidth = containerRect.width - padding;
      const maxHeight = containerRect.height - padding;
      
      const scaleX = maxWidth / album.canvasSize.width;
      const scaleY = maxHeight / album.canvasSize.height;
      
      // 将默认的100%设置为原来200%的大小
      // 这样A4页面在编辑区域中会显示得更大，更适合编辑
      const baseScale = Math.min(scaleX, scaleY) * 2;
      const scale = Math.min(baseScale, 2.5); // 最大不超过2.5倍
      setCanvasScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [album]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeyPressed(prev => new Set([...prev, e.key]));
      
      // 删除选中元素
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteElements();
      }
      
      // 复制粘贴
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault();
          handleCopyElements();
        } else if (e.key === 'v') {
          e.preventDefault();
          handlePasteElements();
        } else if (e.key === 'a') {
          e.preventDefault();
          handleSelectAll();
        } else if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
      }
      
      // 方向键移动
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleArrowKeyMove(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeyPressed(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [page, editorState]);

  // 更新页面元素
  const updatePageElement = useCallback((elementId: string, updates: Partial<PageElement>) => {
    if (!page) return;
    
    const updatedPage = {
      ...page,
      elements: page.elements.map(element => 
        element.id === elementId ? { ...element, ...updates } : element
      ),
      updateTime: Date.now()
    };
    
    onPageChange(updatedPage);
  }, [page, onPageChange]);

  // 删除选中元素
  const handleDeleteElements = useCallback(() => {
    if (!page || editorState.selectedElementIds.length === 0) return;
    
    const updatedPage = {
      ...page,
      elements: page.elements.filter(element => 
        !editorState.selectedElementIds.includes(element.id)
      ),
      updateTime: Date.now()
    };
    
    onPageChange(updatedPage);
    onStateChange({ ...editorState, selectedElementIds: [] });
  }, [page, editorState, onPageChange, onStateChange]);

  // 复制选中元素
  const handleCopyElements = useCallback(() => {
    if (!page || editorState.selectedElementIds.length === 0) return;
    
    const selectedElements = page.elements.filter(element => 
      editorState.selectedElementIds.includes(element.id)
    );
    
    onStateChange({ ...editorState, clipboard: selectedElements });
  }, [page, editorState, onStateChange]);

  // 粘贴元素
  const handlePasteElements = useCallback(() => {
    if (!page || editorState.clipboard.length === 0) return;
    
    const newElements = editorState.clipboard.map(element => ({
      ...element,
      id: `element_${Date.now()}_${Math.random()}`,
      x: Math.min(element.x + 0.05, 0.9), // 稍微偏移位置
      y: Math.min(element.y + 0.05, 0.9)
    }));
    
    const updatedPage = {
      ...page,
      elements: [...page.elements, ...newElements],
      updateTime: Date.now()
    };
    
    const newElementIds = newElements.map(e => e.id);
    
    onPageChange(updatedPage);
    onStateChange({ ...editorState, selectedElementIds: newElementIds });
  }, [page, editorState, onPageChange, onStateChange]);

  // 全选
  const handleSelectAll = useCallback(() => {
    if (!page) return;
    
    const allElementIds = page.elements.map(e => e.id);
    onStateChange({ ...editorState, selectedElementIds: allElementIds });
  }, [page, editorState, onStateChange]);

  // 撤销/重做 (简化实现)
  const handleUndo = useCallback(() => {
    // TODO: 实现撤销功能
    console.log('撤销功能开发中...');
  }, []);

  const handleRedo = useCallback(() => {
    // TODO: 实现重做功能
    console.log('重做功能开发中...');
  }, []);

  // 方向键移动
  const handleArrowKeyMove = useCallback((key: string) => {
    if (!page || editorState.selectedElementIds.length === 0) return;
    
    const moveStep = keyPressed.has('Shift') ? 0.01 : 0.005; // Shift + 方向键移动更大距离
    let deltaX = 0, deltaY = 0;
    
    switch (key) {
      case 'ArrowLeft': deltaX = -moveStep; break;
      case 'ArrowRight': deltaX = moveStep; break;
      case 'ArrowUp': deltaY = -moveStep; break;
      case 'ArrowDown': deltaY = moveStep; break;
    }
    
    const updatedPage = {
      ...page,
      elements: page.elements.map(element => {
        if (editorState.selectedElementIds.includes(element.id)) {
          return {
            ...element,
            x: Math.max(0, Math.min(1 - element.width, element.x + deltaX)),
            y: Math.max(0, Math.min(1 - element.height, element.y + deltaY))
          };
        }
        return element;
      }),
      updateTime: Date.now()
    };
    
    onPageChange(updatedPage);
  }, [page, editorState, keyPressed, onPageChange]);

  // 鼠标拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent, element: PageElement, handle?: string) => {
    e.stopPropagation();
    
    if (handle) {
      // 开始调整大小
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      // 开始拖拽
      setIsDragging(true);
    }
    
    setDraggedElement(element);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // 选中元素
    if (!editorState.selectedElementIds.includes(element.id)) {
      const newSelectedIds = e.ctrlKey || e.metaKey 
        ? [...editorState.selectedElementIds, element.id]
        : [element.id];
      onStateChange({ ...editorState, selectedElementIds: newSelectedIds });
    }
  }, [editorState, onStateChange]);

  // 鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!draggedElement || !album) return;
      
      const deltaX = (e.clientX - dragStart.x) / (album.canvasSize.width * canvasScale);
      const deltaY = (e.clientY - dragStart.y) / (album.canvasSize.height * canvasScale);
      
      if (isDragging) {
        // 拖拽移动
        const newX = Math.max(0, Math.min(1 - draggedElement.width, draggedElement.x + deltaX));
        const newY = Math.max(0, Math.min(1 - draggedElement.height, draggedElement.y + deltaY));
        
        updatePageElement(draggedElement.id, { x: newX, y: newY });
      } else if (isResizing && resizeHandle) {
        // 调整大小
        let newWidth = draggedElement.width;
        let newHeight = draggedElement.height;
        let newX = draggedElement.x;
        let newY = draggedElement.y;
        
        if (resizeHandle.includes('right')) {
          newWidth = Math.max(0.05, Math.min(1 - draggedElement.x, draggedElement.width + deltaX));
        }
        if (resizeHandle.includes('bottom')) {
          newHeight = Math.max(0.05, Math.min(1 - draggedElement.y, draggedElement.height + deltaY));
        }
        if (resizeHandle.includes('left')) {
          const widthChange = -deltaX;
          newWidth = Math.max(0.05, draggedElement.width + widthChange);
          newX = Math.max(0, draggedElement.x - widthChange);
        }
        if (resizeHandle.includes('top')) {
          const heightChange = -deltaY;
          newHeight = Math.max(0.05, draggedElement.height + heightChange);
          newY = Math.max(0, draggedElement.y - heightChange);
        }
        
        updatePageElement(draggedElement.id, { 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight 
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      setDraggedElement(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, draggedElement, resizeHandle, album, canvasScale, updatePageElement]);

  // 渲染页面元素
  const renderPageElements = () => {
    if (!page) return null;

    return page.elements.map((element) => {
      const isSelected = editorState.selectedElementIds.includes(element.id);
      
      const elementStyle = {
        position: 'absolute' as const,
        left: `${element.x * 100}%`,
        top: `${element.y * 100}%`,
        width: `${element.width * 100}%`,
        height: `${element.height * 100}%`,
        zIndex: element.zIndex,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        opacity: element.opacity || 1
      };

      const handleElementClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelectedIds = e.metaKey || e.ctrlKey 
          ? editorState.selectedElementIds.includes(element.id)
            ? editorState.selectedElementIds.filter(id => id !== element.id)
            : [...editorState.selectedElementIds, element.id]
          : [element.id];
        
        onStateChange({
          ...editorState,
          selectedElementIds: newSelectedIds
        });
      };

      // 渲染调整大小手柄
      const renderResizeHandles = () => {
        if (!isSelected) return null;
        
        const handles = [
          'top-left', 'top-right', 'bottom-left', 'bottom-right',
          'top', 'bottom', 'left', 'right'
        ];
        
        return handles.map(handle => {
          let className = 'absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-pointer hover:bg-blue-600';
          let style: React.CSSProperties = {};
          
          switch (handle) {
            case 'top-left':
              className += ' cursor-nw-resize';
              style = { top: -4, left: -4 };
              break;
            case 'top-right':
              className += ' cursor-ne-resize';
              style = { top: -4, right: -4 };
              break;
            case 'bottom-left':
              className += ' cursor-sw-resize';
              style = { bottom: -4, left: -4 };
              break;
            case 'bottom-right':
              className += ' cursor-se-resize';
              style = { bottom: -4, right: -4 };
              break;
            case 'top':
              className += ' cursor-n-resize';
              style = { top: -4, left: '50%', transform: 'translateX(-50%)' };
              break;
            case 'bottom':
              className += ' cursor-s-resize';
              style = { bottom: -4, left: '50%', transform: 'translateX(-50%)' };
              break;
            case 'left':
              className += ' cursor-w-resize';
              style = { left: -4, top: '50%', transform: 'translateY(-50%)' };
              break;
            case 'right':
              className += ' cursor-e-resize';
              style = { right: -4, top: '50%', transform: 'translateY(-50%)' };
              break;
          }
          
          return (
            <div
              key={handle}
              className={className}
              style={style}
              onMouseDown={(e) => handleMouseDown(e, element, handle)}
            />
          );
        });
      };

      return (
        <div
          key={element.id}
          style={elementStyle}
          className={`cursor-pointer transition-all relative ${
            isSelected ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
          } ${isDragging && draggedElement?.id === element.id ? 'cursor-grabbing' : 'cursor-grab'}`}
          onClick={handleElementClick}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          {element.type === 'photo' && (
            <div className="w-full h-full bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
              {element.url ? (
                <img
                  src={element.url}
                  alt="Photo"
                  className="w-full h-full object-cover rounded"
                  style={{
                    filter: [
                      element.filter && element.filter !== 'none' ? 
                        element.filter === 'grayscale' ? 'grayscale(100%)' :
                        element.filter === 'sepia' ? 'sepia(100%)' :
                        element.filter === 'blur' ? 'blur(2px)' : ''
                        : '',
                      element.brightness && element.brightness !== 1 ? `brightness(${element.brightness})` : '',
                      element.contrast && element.contrast !== 1 ? `contrast(${element.contrast})` : ''
                    ].filter(f => f).join(' ') || 'none',
                    borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined
                  }}
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">点击添加图片</span>
                </div>
              )}
            </div>
          )}

          {element.type === 'text' && (
            <div 
              className="w-full h-full flex items-center justify-center p-2 border border-gray-300 border-dashed rounded"
              style={{
                backgroundColor: element.backgroundColor || 'transparent',
                color: element.color || '#000000',
                fontSize: element.fontSize ? `${element.fontSize}px` : '16px',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textAlign: element.textAlign || 'left',
                fontFamily: element.fontFamily || 'system-ui'
              }}
            >
              {element.content || (
                <span className="text-gray-400 text-sm">双击编辑文本</span>
              )}
            </div>
          )}

          {element.type === 'shape' && (
            <div 
              className="w-full h-full border border-gray-300"
              style={{
                backgroundColor: element.fillColor || 'transparent',
                borderColor: element.strokeColor || '#cccccc',
                borderWidth: element.strokeWidth || 1,
                borderRadius: element.borderRadius || 0
              }}
            />
          )}

          {/* 调整大小手柄 */}
          {renderResizeHandles()}
        </div>
      );
    });
  };

  // 清除选择
  const handleCanvasClick = () => {
    onStateChange({
      ...editorState,
      selectedElementIds: []
    });
  };

  if (!album) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium mb-2">选择一个相册开始编辑</h3>
          <p className="text-sm">在左侧面板中选择现有相册或创建新相册</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">这个相册还没有页面</h3>
          <p className="text-sm">在右侧面板中选择页面模板来创建第一页</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 画布工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              缩放: {Math.round(canvasScale * 100)}%
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCanvasScale(prev => Math.max(0.1, prev - 0.1))}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="缩小"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <button
                onClick={() => setCanvasScale(1)}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="适合窗口"
              >
                1:1
              </button>
              
              <button
                onClick={() => setCanvasScale(prev => Math.min(3, prev + 0.1))}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="放大"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* 选中元素信息 */}
            {page && editorState.selectedElementIds.length > 0 && (
              <div className="text-sm text-gray-600 border-l border-gray-300 pl-4">
                已选中 {editorState.selectedElementIds.length} 个元素
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* 操作按钮 */}
            {page && editorState.selectedElementIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyElements}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                  title="复制 (Ctrl+C)"
                >
                  复制
                </button>
                <button
                  onClick={handleDeleteElements}
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="删除 (Delete)"
                >
                  删除
                </button>
              </div>
            )}

            {/* 粘贴按钮 */}
            {page && editorState.clipboard.length > 0 && (
              <button
                onClick={handlePasteElements}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="粘贴 (Ctrl+V)"
              >
                粘贴 ({editorState.clipboard.length})
              </button>
            )}

            <div className="h-4 w-px bg-gray-300" />

            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span>显示网格</span>
            </label>

            {/* 快捷键提示 */}
            <div className="text-xs text-gray-500 hidden lg:block">
              <div>快捷键: Delete删除 • Ctrl+C复制 • Ctrl+V粘贴 • 方向键移动</div>
            </div>
          </div>
        </div>
      </div>

      {/* 画布区域 */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-8"
        onClick={handleCanvasClick}
      >
        <div
          className="relative bg-white shadow-lg"
          style={{
            width: album.canvasSize.width * canvasScale,
            height: album.canvasSize.height * canvasScale,
            backgroundColor: album.theme.backgroundColor,
            backgroundImage: album.theme.backgroundGradient
          }}
        >
          {/* 网格背景 */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #000 1px, transparent 1px),
                  linear-gradient(to bottom, #000 1px, transparent 1px)
                `,
                backgroundSize: `${20 * canvasScale}px ${20 * canvasScale}px`
              }}
            />
          )}

          {/* 页面内容 */}
          <div className="relative w-full h-full">
            {renderPageElements()}
          </div>

          {/* 画布边框 */}
          <div className="absolute inset-0 border border-gray-300 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
