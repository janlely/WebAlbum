// 中间画布编辑区

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Album, AlbumPage, EditorState, PageElement } from '../../types';
import { getPhotoShapeStyle } from '../../utils/photoShapes';
import { apiService } from '../../services/apiService';
import { generateUUID } from '../../utils/uuid';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [currentUploadElementId, setCurrentUploadElementId] = useState<string | null>(null);
  const [uploadingElements, setUploadingElements] = useState<Set<string>>(new Set());
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const [theme, setTheme] = useState<{ backgroundColor: string; backgroundGradient: string } | null>(null);
  
  // 拖拽和调整大小状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<PageElement | null>(null);
  
  // 像素级拖拽状态
  const [isDragModePixel, setIsDragModePixel] = useState(false);
  const [pixelStartPos, setPixelStartPos] = useState({ x: 0, y: 0 });
  const [hasActuallyDragged, setHasActuallyDragged] = useState(false);
  const dragElementRef = useRef<HTMLDivElement | null>(null);
  
  // 快捷键状态
  const [keyPressed, setKeyPressed] = useState<Set<string>>(new Set());
  
  // 缩放输入状态
  const [scaleInput, setScaleInput] = useState('100');

  // 初始化默认缩放比例
  useEffect(() => {
    const fetchCanvasSize = async () => {
      if (!album?.canvasSizeId) return;
      
      try {
        const sizes = await apiService.getCanvasSizes();
        const size = sizes.find(s => s.id === album.canvasSizeId);
        if (size) {
          setCanvasSize({ width: size.width, height: size.height });
        } else {
          setCanvasSize({ width: 800, height: 600 });
        }
      } catch (error) {
        console.error('获取画布尺寸失败:', error);
        setCanvasSize({ width: 800, height: 600 });
      }
    };

    const fetchTheme = async () => {
      if (!album?.themeId) return;
      
      try {
        const themes = await apiService.getThemes();
        const themeData = themes.find(t => t.id === album.themeId);
        if (themeData) {
          setTheme({
            backgroundColor: themeData.backgroundColor,
            backgroundGradient: themeData.backgroundGradient
          });
        } else {
          setTheme({
            backgroundColor: '#ffffff',
            backgroundGradient: ''
          });
        }
      } catch (error) {
        console.error('获取主题失败:', error);
        setTheme({
          backgroundColor: '#ffffff',
          backgroundGradient: ''
        });
      }
    };

    if (album) {
      fetchCanvasSize();
      fetchTheme();
      
      // 默认缩放比例设为100%
      setCanvasScale(1.0);
      setScaleInput('100');
    } else {
      setCanvasSize(null);
      setTheme(null);
    }
  }, [album]);

  // 处理缩放输入
  const handleScaleInputChange = (value: string) => {
    setScaleInput(value);
    
    // 实时更新缩放（如果输入有效）
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 500) {
      setCanvasScale(numValue / 100);
    }
  };

  // 处理缩放输入回车
  const handleScaleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const numValue = parseFloat(scaleInput);
      if (!isNaN(numValue) && numValue > 0) {
        const clampedValue = Math.max(10, Math.min(500, numValue)); // 限制10%-500%
        setCanvasScale(clampedValue / 100);
        setScaleInput(clampedValue.toString());
      } else {
        // 无效输入时重置为当前缩放
        setScaleInput(Math.round(canvasScale * 100).toString());
      }
    }
  };

  // 更新缩放时同步输入框
  useEffect(() => {
    setScaleInput(Math.round(canvasScale * 100).toString());
  }, [canvasScale]);

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
  const updatePageElement = useCallback((elementId: string, updates: any) => {
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

  // 处理图片上传
  const handlePhotoUpload = useCallback((elementId: string) => {
    setCurrentUploadElementId(elementId);
    fileInputRef.current?.click();
  }, []);

  // 处理文件选择和上传
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || !currentUploadElementId || !page) return;

    console.log('开始上传文件:', { name: file.name, type: file.type, size: file.size });

    // 标记元素为上传中状态
    setUploadingElements(prev => new Set([...prev, currentUploadElementId]));

    try {
      // 上传到后台服务器
      console.log('上传图片到服务器...');
      const uploadResponse = await apiService.uploadImage(file);
      console.log('图片上传成功:', { url: uploadResponse.url, originalName: uploadResponse.originalName });

      // 更新页面元素
      const updatedPage = {
        ...page,
        elements: page.elements.map(element => 
          element.id === currentUploadElementId && element.type === 'photo'
            ? { 
                ...element, 
                url: uploadResponse.url, 
                originalName: uploadResponse.originalName,
                placeholder: undefined  // 移除占位符
              }
            : element
        ),
        updateTime: Date.now()
      };
      
      onPageChange(updatedPage);
      console.log('页面更新成功');

    } catch (error) {
      console.error('上传失败:', error);
      // TODO: 显示错误提示给用户
    } finally {
      // 清理状态
      setUploadingElements(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentUploadElementId);
        return newSet;
      });
      setCurrentUploadElementId(null);
      e.target.value = ''; // 重置input
    }
  }, [currentUploadElementId, page, onPageChange]);

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
      id: generateUUID(),
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
      // 开始拖拽 - 启用像素模式
      setIsDragging(true);
      setIsDragModePixel(true);
      setHasActuallyDragged(false);  // 重置拖拽状态
      
      // 从DOM元素获取当前真实的像素位置
      const elementDOM = e.currentTarget as HTMLDivElement;
      const rect = elementDOM.getBoundingClientRect();
      const canvasRect = elementDOM.parentElement!.getBoundingClientRect();
      
      const pixelX = rect.left - canvasRect.left;
      const pixelY = rect.top - canvasRect.top;
      setPixelStartPos({ x: pixelX, y: pixelY });
      
      // 设置DOM引用以便直接操作
      dragElementRef.current = elementDOM;
    }
    
    setDraggedElement(element);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastMousePos({ x: e.clientX, y: e.clientY });
    
    // 选中元素
    if (!editorState.selectedElementIds.includes(element.id)) {
      const newSelectedIds = e.ctrlKey || e.metaKey 
        ? [...editorState.selectedElementIds, element.id]
        : [element.id];
      onStateChange({ ...editorState, selectedElementIds: newSelectedIds });
    }
  }, [editorState, onStateChange, album, canvasScale]);

  // 鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!draggedElement || !album) return;
      
      if (isDragging && isDragModePixel && dragElementRef.current) {
        // 标记为实际拖拽
        setHasActuallyDragged(true);
        
        // 像素模式拖拽 - 直接操作DOM位置
        const deltaPixelX = e.clientX - dragStart.x;
        const deltaPixelY = e.clientY - dragStart.y;
        
        const newPixelX = pixelStartPos.x + deltaPixelX;
        const newPixelY = pixelStartPos.y + deltaPixelY;
        
        // 获取画布和元素尺寸
        const canvasRect = dragElementRef.current.parentElement!.getBoundingClientRect();
        const elementRect = dragElementRef.current.getBoundingClientRect();
        
        // 计算边界限制（像素值）
        const margin = 5;
        const maxX = canvasRect.width - elementRect.width - margin;
        const maxY = canvasRect.height - elementRect.height - margin;
        
        const clampedX = Math.max(margin, Math.min(maxX, newPixelX));
        const clampedY = Math.max(margin, Math.min(maxY, newPixelY));
        
        // 直接设置像素位置
        dragElementRef.current.style.left = `${clampedX}px`;
        dragElementRef.current.style.top = `${clampedY}px`;
        
      } else if (isDragging && !isDragModePixel && canvasSize) {
        // 原有的相对坐标模式（作为备用）
        const deltaX = (e.clientX - lastMousePos.x) / (canvasSize.width * 2 * canvasScale);
        const deltaY = (e.clientY - lastMousePos.y) / (canvasSize.height * 2 * canvasScale);
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
        
        const margin = 0.01;
        const maxX = 1 - draggedElement.width - margin;
        const maxY = 1 - draggedElement.height - margin;
        
        const newX = Math.max(margin, Math.min(maxX, draggedElement.x + deltaX));
        const newY = Math.max(margin, Math.min(maxY, draggedElement.y + deltaY));
        
        updatePageElement(draggedElement.id, { x: newX, y: newY });
        setDraggedElement({ ...draggedElement, x: newX, y: newY });
      } else if (isResizing && resizeHandle && canvasSize) {
        // 调整大小 - 使用相对坐标模式
        const deltaX = (e.clientX - lastMousePos.x) / (canvasSize.width * 2 * canvasScale);
        const deltaY = (e.clientY - lastMousePos.y) / (canvasSize.height * 2 * canvasScale);
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
        
        let newWidth = draggedElement.width;
        let newHeight = draggedElement.height;
        let newX = draggedElement.x;
        let newY = draggedElement.y;
        
        // 优化调整大小的边界处理
        const minSize = 0.02; // 最小尺寸
        const margin = 0.01;  // 边距
        
        if (resizeHandle.includes('right')) {
          newWidth = Math.max(minSize, Math.min(1 - draggedElement.x - margin, draggedElement.width + deltaX));
        }
        if (resizeHandle.includes('bottom')) {
          newHeight = Math.max(minSize, Math.min(1 - draggedElement.y - margin, draggedElement.height + deltaY));
        }
        if (resizeHandle.includes('left')) {
          const widthChange = -deltaX;
          newWidth = Math.max(minSize, draggedElement.width + widthChange);
          newX = Math.max(margin, draggedElement.x - widthChange);
        }
        if (resizeHandle.includes('top')) {
          const heightChange = -deltaY;
          newHeight = Math.max(minSize, draggedElement.height + heightChange);
          newY = Math.max(margin, draggedElement.y - heightChange);
        }
        
        // 直接更新调整大小，避免延迟
        updatePageElement(draggedElement.id, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        });
        
        // 更新拖拽元素状态
        setDraggedElement({ 
          ...draggedElement, 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight 
        });
      }
    };

    const handleMouseUp = () => {
      // 像素模式拖拽结束时，转换回相对坐标并保存
      if (isDragging && isDragModePixel && hasActuallyDragged && dragElementRef.current && draggedElement && album) {
        // 获取画布和元素的最终位置
        const canvasRect = dragElementRef.current.parentElement!.getBoundingClientRect();
        const elementRect = dragElementRef.current.getBoundingClientRect();
        
        // 计算相对于画布的像素位置
        const finalPixelX = elementRect.left - canvasRect.left;
        const finalPixelY = elementRect.top - canvasRect.top;
        
        // 转换回相对坐标（基于真实DOM尺寸）
        const finalRelativeX = finalPixelX / canvasRect.width;
        const finalRelativeY = finalPixelY / canvasRect.height;
        
        // 保存到状态
        updatePageElement(draggedElement.id, { 
          x: finalRelativeX, 
          y: finalRelativeY 
        });
        
        // 重置DOM样式，让React重新接管渲染
        dragElementRef.current.style.left = '';
        dragElementRef.current.style.top = '';
      }
      
      // 清理状态
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      setDraggedElement(null);
      setIsDragModePixel(false);
      setHasActuallyDragged(false);
      dragElementRef.current = null;
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isDragModePixel, hasActuallyDragged, dragStart, pixelStartPos, lastMousePos, draggedElement, resizeHandle, album, canvasScale, updatePageElement]);

  // 渲染页面元素
  const renderPageElements = () => {
    if (!page || !album) return null;
    
    // 确保elements是数组
    const elements = Array.isArray(page.elements) ? page.elements : [];
    
    return elements.map((element) => {
      const isSelected = editorState.selectedElementIds.includes(element.id);
      
      // 使用百分比渲染，保持与拖拽坐标转换的一致性
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
            <div 
              className="w-full h-full bg-gray-200 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
              onDoubleClick={(e) => {
                e.stopPropagation();
                handlePhotoUpload(element.id);
              }}
            >
              {uploadingElements.has(element.id) ? (
                // 上传中状态
                <div className="text-blue-500 text-center flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs">上传中...</span>
                </div>
              ) : element.url ? (
                <div 
                  className="relative w-full h-full group overflow-hidden"
                  style={element.shape ? getPhotoShapeStyle(element.shape) : {
                    borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined
                  }}
                >
                  <img
                    src={element.url}
                    alt="Photo"
                    className="w-full h-full object-cover"
                    style={{
                      filter: [
                        element.filter && element.filter !== 'none' ? 
                          element.filter === 'grayscale' ? 'grayscale(100%)' :
                          element.filter === 'sepia' ? 'sepia(100%)' :
                          element.filter === 'blur' ? 'blur(2px)' : ''
                          : '',
                        element.brightness && element.brightness !== 1 ? `brightness(${element.brightness})` : '',
                        element.contrast && element.contrast !== 1 ? `contrast(${element.contrast})` : ''
                      ].filter(f => f).join(' ') || 'none'
                    }}
                    onError={() => {
                      console.error('图片加载失败:', element.url?.substring(0, 100));
                    }}
                    onLoad={() => {
                      console.log('图片加载成功:', element.id);
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      双击更换图片
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">{element.placeholder || '双击添加图片'}</span>
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

          {element.type === 'decoration' && (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                color: element.fill || '#333333'
              }}
            >
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full"
                style={{
                  fill: element.fill || 'currentColor',
                  stroke: element.stroke || 'none',
                  strokeWidth: element.strokeWidth || 0
                }}
                dangerouslySetInnerHTML={{ __html: element.svgPath || '' }}
              />
            </div>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 极 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium mb-2">选择一个相册开始编辑</h3>
          <p className="text-sm">在左侧面板中选择现有相册或创建新相册</p>
        </div>
      </div>
    );
  }

  if (!page || !canvasSize || !theme) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">缩放:</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCanvasScale(prev => Math.max(0.1, prev - 0.1))}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="缩小 (10%)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <div className="flex items-center">
                  <input
                    type="text"
                    value={scaleInput}
                    onChange={(e) => handleScaleInputChange(e.target.value)}
                    onKeyPress={handleScaleInputKeyPress}
                    onBlur={() => {
                      // 失焦时验证并重置
                      const numValue = parseFloat(scaleInput);
                      if (isNaN(numValue) || numValue <= 0) {
                        setScaleInput(Math.round(canvasScale * 100).toString());
                      }
                    }}
                    className="w-12 px-1 py-0.5 text-xs text-center border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    title="输入缩放比例 (10-500)"
                  />
                  <span className="text-xs text-gray-600 ml-0.5">%</span>
                </div>
                
                <button
                  onClick={() => setCanvasScale(prev => Math.min(5, prev + 0.1))}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="放大 (10%)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
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
            width: canvasSize.width * 2 * canvasScale,
            height: canvasSize.height * 2 * canvasScale,
            backgroundColor: theme.backgroundColor,
            backgroundImage: theme.backgroundGradient
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
                backgroundSize: `${10 * canvasScale}px ${10 * canvasScale}px`
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

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default CanvasEditor;
