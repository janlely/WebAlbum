// 右侧工具面板

import React, { useRef } from 'react';
import type { Album, AlbumPage, ToolPanelState, PageElement, PhotoElement, TextElement, ShapeElement } from '../../types';
import { defaultCanvasSizes, defaultThemes, defaultPageTemplates } from '../../types';
import AlignmentTools from './AlignmentTools';

interface ToolPanelProps {
  album: Album | null;
  page: AlbumPage | null;
  panelState: ToolPanelState;
  editorState: { selectedElementIds: string[] };
  onPanelStateChange: (state: ToolPanelState) => void;
  onCreatePage: (templateId?: string) => void;
  onAlbumChange: (album: Album) => void;
  onPageChange: (page: AlbumPage) => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  album,
  page,
  panelState,
  editorState,
  onPanelStateChange,
  onCreatePage,
  onAlbumChange,
  onPageChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 添加照片元素
  const handleAddPhoto = (file?: File) => {
    if (!page) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoElement: PhotoElement = {
          id: `photo_${Date.now()}`,
          type: 'photo',
          x: 0.1,
          y: 0.1,
          width: 0.3,
          height: 0.3,
          zIndex: page.elements.length + 1,
          url: e.target?.result as string,
          originalName: file.name
        };

        const updatedPage = {
          ...page,
          elements: [...page.elements, photoElement],
          updateTime: Date.now()
        };

        onPageChange(updatedPage);
      };
      reader.readAsDataURL(file);
    } else {
      // 打开文件选择器
      fileInputRef.current?.click();
    }
  };

  // 添加文本元素
  const handleAddText = (type: 'title' | 'body' = 'body') => {
    if (!page) return;

    const textElement: TextElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: 0.1,
      y: 0.1,
      width: type === 'title' ? 0.6 : 0.4,
      height: type === 'title' ? 0.1 : 0.08,
      zIndex: page.elements.length + 1,
      content: type === 'title' ? '标题文本' : '正文内容',
      fontSize: type === 'title' ? 24 : 16,
      fontWeight: type === 'title' ? 'bold' : 'normal',
      color: '#000000',
      textAlign: 'left'
    };

    const updatedPage = {
      ...page,
      elements: [...page.elements, textElement],
      updateTime: Date.now()
    };

    onPageChange(updatedPage);
  };

  // 添加形状元素
  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle') => {
    if (!page) return;

    const shapeElement: ShapeElement = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      x: 0.1,
      y: 0.1,
      width: 0.2,
      height: 0.2,
      zIndex: page.elements.length + 1,
      shapeType,
      fillColor: '#e5e7eb',
      strokeColor: '#9ca3af',
      strokeWidth: 2,
      borderRadius: shapeType === 'circle' ? 50 : 0
    };

    const updatedPage = {
      ...page,
      elements: [...page.elements, shapeElement],
      updateTime: Date.now()
    };

    onPageChange(updatedPage);
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleAddPhoto(file);
    }
    e.target.value = ''; // 重置input
  };

  // 更新元素属性
  const updateElementProperty = (elementId: string, property: string, value: any) => {
    if (!page) return;

    const updatedPage = {
      ...page,
      elements: page.elements.map(element => 
        element.id === elementId ? { ...element, [property]: value } : element
      ),
      updateTime: Date.now()
    };

    onPageChange(updatedPage);
  };

  // 获取选中的元素
  const getSelectedElements = (): PageElement[] => {
    if (!page) return [];
    return page.elements.filter(element => 
      editorState.selectedElementIds.includes(element.id)
    );
  };

  // 获取第一个选中的元素（用于属性编辑）
  const getFirstSelectedElement = (): PageElement | null => {
    const selectedElements = getSelectedElements();
    return selectedElements.length > 0 ? selectedElements[0] : null;
  };

  // 批量更新选中元素的属性
  const updateSelectedElementsProperty = (property: string, value: any) => {
    if (!page || editorState.selectedElementIds.length === 0) return;

    const updatedPage = {
      ...page,
      elements: page.elements.map(element => 
        editorState.selectedElementIds.includes(element.id) 
          ? { ...element, [property]: value } 
          : element
      ),
      updateTime: Date.now()
    };

    onPageChange(updatedPage);
  };

  // 删除选中元素
  const deleteSelectedElements = () => {
    if (!page || editorState.selectedElementIds.length === 0) return;

    const updatedPage = {
      ...page,
      elements: page.elements.filter(element => 
        !editorState.selectedElementIds.includes(element.id)
      ),
      updateTime: Date.now()
    };

    onPageChange(updatedPage);
  };

  // 复制选中元素
  const duplicateSelectedElements = () => {
    if (!page || editorState.selectedElementIds.length === 0) return;

    const selectedElements = getSelectedElements();
    const newElements = selectedElements.map(element => ({
      ...element,
      id: `element_${Date.now()}_${Math.random()}`,
      x: Math.min(element.x + 0.05, 0.9),
      y: Math.min(element.y + 0.05, 0.9),
      zIndex: page.elements.length + 1
    }));

    const updatedPage = {
      ...page,
      elements: [...page.elements, ...newElements],
      updateTime: Date.now()
    };

    onPageChange(updatedPage);
  };

  // 调整元素层级
  const adjustElementLayer = (direction: 'front' | 'back' | 'forward' | 'backward') => {
    if (!page || editorState.selectedElementIds.length === 0) return;

    const maxZ = Math.max(...page.elements.map(e => e.zIndex || 0));
    const minZ = Math.min(...page.elements.map(e => e.zIndex || 0));

    const updatedPage = {
      ...page,
      elements: page.elements.map(element => {
        if (editorState.selectedElementIds.includes(element.id)) {
          let newZIndex = element.zIndex || 0;
          switch (direction) {
            case 'front':
              newZIndex = maxZ + 1;
              break;
            case 'back':
              newZIndex = minZ - 1;
              break;
            case 'forward':
              newZIndex = Math.min(maxZ, newZIndex + 1);
              break;
            case 'backward':
              newZIndex = Math.max(minZ, newZIndex - 1);
              break;
          }
          return { ...element, zIndex: newZIndex };
        }
        return element;
      }),
      updateTime: Date.now()
    };

    onPageChange(updatedPage);
  };
  if (panelState.isCollapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4">
        <button
          onClick={() => onPanelStateChange({ ...panelState, isCollapsed: false })}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          title="展开工具面板"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'canvas', label: '画布', icon: '📐' },
    { id: 'templates', label: '模板', icon: '📋' },
    { id: 'elements', label: '元素', icon: '🔧' },
    { id: 'properties', label: '属性', icon: '⚙️' }
  ] as const;

  const renderCanvasTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">画布尺寸</h3>
        {album && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium">{album.canvasSize.name}</div>
            <div className="text-xs text-gray-500">
              {album.canvasSize.width} × {album.canvasSize.height} • {album.canvasSize.aspectRatio}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {album.canvasSize.description}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">设计主题</h3>
        {album && (
          <div className="space-y-2">
            {defaultThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onAlbumChange({ ...album, theme })}
                className={`w-full p-3 border rounded-lg text-left transition-all ${
                  album.theme.id === theme.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={theme.preview}
                    alt={theme.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{theme.name}</div>
                    <div className="text-xs text-gray-500 truncate">{theme.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">页面模板</h3>
        <p className="text-xs text-gray-500 mb-4">选择模板创建新页面</p>
      </div>

      <div className="space-y-3">
        {defaultPageTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onCreatePage(template.id)}
            className="w-full p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all text-left group"
          >
            <div className="flex items-start space-x-3">
              <img
                src={template.preview}
                alt={template.name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium group-hover:text-blue-600">
                  {template.name}
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {template.description}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderElementsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">添加元素</h3>
        {!page && (
          <p className="text-xs text-gray-500 mb-4">请先选择一个页面</p>
        )}
      </div>

      <div className="space-y-4">
        {/* 照片元素 */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">照片</h4>
          <button 
            onClick={() => handleAddPhoto()}
            disabled={!page}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-sm text-gray-600">上传图片</div>
          </button>
          
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 文字元素 */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">文字</h4>
          <div className="space-y-2">
            <button 
              onClick={() => handleAddText('title')}
              disabled={!page}
              className="w-full p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm font-medium">标题文本</div>
              <div className="text-xs text-gray-500">大号标题样式</div>
            </button>
            <button 
              onClick={() => handleAddText('body')}
              disabled={!page}
              className="w-full p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm">正文文本</div>
              <div className="text-xs text-gray-500">普通文本样式</div>
            </button>
          </div>
        </div>

        {/* 形状元素 */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">形状</h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => handleAddShape('rectangle')}
              disabled={!page}
              className="aspect-square flex items-center justify-center border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="矩形"
            >
              <div className="w-6 h-6 bg-gray-300 rounded-sm"></div>
            </button>
            <button 
              onClick={() => handleAddShape('circle')}
              disabled={!page}
              className="aspect-square flex items-center justify-center border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="圆形"
            >
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            </button>
            <button 
              onClick={() => handleAddShape('triangle')}
              disabled={!page}
              className="aspect-square flex items-center justify-center border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="三角形"
            >
              <div className="w-0 h-0 border-l-3 border-r-3 border-b-6 border-l-transparent border-r-transparent border-b-gray-300"></div>
            </button>
          </div>
        </div>

        {/* 快速操作 */}
        {page && page.elements.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">快速操作</h4>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                当前页面有 {page.elements.length} 个元素
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPropertiesTab = () => {
    const selectedElements = getSelectedElements();
    const firstSelected = getFirstSelectedElement();

    if (!page) {
      return (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">请先选择一个页面</p>
        </div>
      );
    }

    if (selectedElements.length === 0) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">元素属性</h3>
            <p className="text-xs text-gray-500 mb-4">请选择元素来编辑属性</p>
          </div>

          {/* 页面信息 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">页面信息</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>元素数量: {page.elements.length}</div>
              <div>页面名称: {page.name}</div>
              <div>最后更新: {new Date(page.updateTime).toLocaleString()}</div>
            </div>
          </div>

          {/* 页面级操作 */}
          {page.elements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">页面操作</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    // 全选所有元素
                    // 这里需要通过回调通知父组件更新选择状态
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  全选元素
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">元素属性</h3>
          <p className="text-xs text-gray-500">
            已选中 {selectedElements.length} 个元素
            {selectedElements.length > 1 && ' (批量编辑)'}
          </p>
        </div>

        {/* 通用属性 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">位置与大小</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">X位置</label>
              <input
                type="number"
                value={Math.round((firstSelected?.x || 0) * 100)}
                onChange={(e) => updateSelectedElementsProperty('x', parseFloat(e.target.value) / 100)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Y位置</label>
              <input
                type="number"
                value={Math.round((firstSelected?.y || 0) * 100)}
                onChange={(e) => updateSelectedElementsProperty('y', parseFloat(e.target.value) / 100)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">宽度</label>
              <input
                type="number"
                value={Math.round((firstSelected?.width || 0) * 100)}
                onChange={(e) => updateSelectedElementsProperty('width', parseFloat(e.target.value) / 100)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="100"
                step="1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">高度</label>
              <input
                type="number"
                value={Math.round((firstSelected?.height || 0) * 100)}
                onChange={(e) => updateSelectedElementsProperty('height', parseFloat(e.target.value) / 100)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="100"
                step="1"
              />
            </div>
          </div>

          {/* 层级控制 */}
          <div>
            <label className="text-xs text-gray-600 mb-2 block">图层</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => adjustElementLayer('front')}
                className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                置顶
              </button>
              <button
                onClick={() => adjustElementLayer('back')}
                className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                置底
              </button>
              <button
                onClick={() => adjustElementLayer('forward')}
                className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                上移
              </button>
              <button
                onClick={() => adjustElementLayer('backward')}
                className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                下移
              </button>
            </div>
          </div>

          {/* 透明度 */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              透明度: {Math.round((firstSelected?.opacity || 1) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={(firstSelected?.opacity || 1) * 100}
              onChange={(e) => updateSelectedElementsProperty('opacity', parseFloat(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        </div>

        {/* 文本元素特有属性 */}
        {firstSelected?.type === 'text' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">文本属性</h4>
            
            <div>
              <label className="text-xs text-gray-600 mb-1 block">内容</label>
              <textarea
                value={(firstSelected as TextElement).content || ''}
                onChange={(e) => updateSelectedElementsProperty('content', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">字体大小</label>
                <input
                  type="number"
                  value={(firstSelected as TextElement).fontSize || 16}
                  onChange={(e) => updateSelectedElementsProperty('fontSize', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">颜色</label>
                <input
                  type="color"
                  value={(firstSelected as TextElement).color || '#000000'}
                  onChange={(e) => updateSelectedElementsProperty('color', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">字重</label>
                <select
                  value={(firstSelected as TextElement).fontWeight || 'normal'}
                  onChange={(e) => updateSelectedElementsProperty('fontWeight', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">正常</option>
                  <option value="medium">中等</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">对齐</label>
                <select
                  value={(firstSelected as TextElement).textAlign || 'left'}
                  onChange={(e) => updateSelectedElementsProperty('textAlign', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 照片元素特有属性 */}
        {firstSelected?.type === 'photo' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">照片属性</h4>
            
            <div>
              <label className="text-xs text-gray-600 mb-1 block">滤镜</label>
              <select
                value={(firstSelected as PhotoElement).filter || 'none'}
                onChange={(e) => updateSelectedElementsProperty('filter', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">无滤镜</option>
                <option value="grayscale">黑白</option>
                <option value="sepia">复古</option>
                <option value="blur">模糊</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  亮度: {Math.round(((firstSelected as PhotoElement).brightness || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={((firstSelected as PhotoElement).brightness || 1) * 100}
                  onChange={(e) => updateSelectedElementsProperty('brightness', parseFloat(e.target.value) / 100)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  对比度: {Math.round(((firstSelected as PhotoElement).contrast || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={((firstSelected as PhotoElement).contrast || 1) * 100}
                  onChange={(e) => updateSelectedElementsProperty('contrast', parseFloat(e.target.value) / 100)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                圆角: {(firstSelected as PhotoElement).borderRadius || 0}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={(firstSelected as PhotoElement).borderRadius || 0}
                onChange={(e) => updateSelectedElementsProperty('borderRadius', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* 形状元素特有属性 */}
        {firstSelected?.type === 'shape' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">形状属性</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">填充色</label>
                <input
                  type="color"
                  value={(firstSelected as ShapeElement).fillColor || '#e5e7eb'}
                  onChange={(e) => updateSelectedElementsProperty('fillColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">边框色</label>
                <input
                  type="color"
                  value={(firstSelected as ShapeElement).strokeColor || '#9ca3af'}
                  onChange={(e) => updateSelectedElementsProperty('strokeColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">边框宽度</label>
                <input
                  type="number"
                  value={(firstSelected as ShapeElement).strokeWidth || 2}
                  onChange={(e) => updateSelectedElementsProperty('strokeWidth', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">圆角</label>
                <input
                  type="number"
                  value={(firstSelected as ShapeElement).borderRadius || 0}
                  onChange={(e) => updateSelectedElementsProperty('borderRadius', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>
        )}

        {/* 对齐工具 */}
        {selectedElements.length >= 2 && (
          <div className="pt-4 border-t border-gray-200">
            <AlignmentTools
              page={page}
              selectedElementIds={editorState.selectedElementIds}
              onPageChange={onPageChange}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={duplicateSelectedElements}
              className="px-3 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              复制
            </button>
            <button
              onClick={deleteSelectedElements}
              className="px-3 py-2 text-xs text-red-600 bg-white border border-red-300 rounded hover:bg-red-50"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 面板头部 */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-gray-900">工具面板</h2>
          <button
            onClick={() => onPanelStateChange({ ...panelState, isCollapsed: true })}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="折叠面板"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 标签栏 */}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onPanelStateChange({ ...panelState, activeTab: tab.id })}
              className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                panelState.activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="block">{tab.icon}</span>
              <span className="block mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {panelState.activeTab === 'canvas' && renderCanvasTab()}
        {panelState.activeTab === 'templates' && renderTemplatesTab()}
        {panelState.activeTab === 'elements' && renderElementsTab()}
        {panelState.activeTab === 'properties' && renderPropertiesTab()}
      </div>
    </div>
  );
};

export default ToolPanel;
