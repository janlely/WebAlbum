// 元素对齐工具

import React from 'react';
import type { PageElement, AlbumPage } from '../../types';

interface AlignmentToolsProps {
  page: AlbumPage | null;
  selectedElementIds: string[];
  onPageChange: (page: AlbumPage) => void;
}

const AlignmentTools: React.FC<AlignmentToolsProps> = ({
  page,
  selectedElementIds,
  onPageChange
}) => {
  if (!page || selectedElementIds.length < 2) {
    return null;
  }

  const selectedElements = page.elements.filter(element => 
    selectedElementIds.includes(element.id)
  );

  // 对齐函数
  const alignElements = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length < 2) return;

    let referenceValue: number;
    
    switch (direction) {
      case 'left':
        referenceValue = Math.min(...selectedElements.map(e => e.x));
        break;
      case 'center':
        const centerX = selectedElements.reduce((sum, e) => sum + e.x + e.width / 2, 0) / selectedElements.length;
        referenceValue = centerX;
        break;
      case 'right':
        referenceValue = Math.max(...selectedElements.map(e => e.x + e.width));
        break;
      case 'top':
        referenceValue = Math.min(...selectedElements.map(e => e.y));
        break;
      case 'middle':
        const centerY = selectedElements.reduce((sum, e) => sum + e.y + e.height / 2, 0) / selectedElements.length;
        referenceValue = centerY;
        break;
      case 'bottom':
        referenceValue = Math.max(...selectedElements.map(e => e.y + e.height));
        break;
    }

    const updatedElements = page.elements.map(element => {
      if (selectedElementIds.includes(element.id)) {
        let newX = element.x;
        let newY = element.y;

        switch (direction) {
          case 'left':
            newX = referenceValue;
            break;
          case 'center':
            newX = referenceValue - element.width / 2;
            break;
          case 'right':
            newX = referenceValue - element.width;
            break;
          case 'top':
            newY = referenceValue;
            break;
          case 'middle':
            newY = referenceValue - element.height / 2;
            break;
          case 'bottom':
            newY = referenceValue - element.height;
            break;
        }

        return { ...element, x: newX, y: newY };
      }
      return element;
    });

    onPageChange({
      ...page,
      elements: updatedElements,
      updateTime: Date.now()
    });
  };

  // 分布函数
  const distributeElements = (direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 3) return;

    const sorted = [...selectedElements].sort((a, b) => {
      return direction === 'horizontal' ? a.x - b.x : a.y - b.y;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpace = direction === 'horizontal' 
      ? (last.x + last.width) - first.x
      : (last.y + last.height) - first.y;
    
    const totalElementSize = sorted.reduce((sum, el) => 
      sum + (direction === 'horizontal' ? el.width : el.height), 0
    );
    
    const spacing = (totalSpace - totalElementSize) / (sorted.length - 1);

    let currentPos = direction === 'horizontal' ? first.x : first.y;

    const updatedElements = page.elements.map(element => {
      const sortedIndex = sorted.findIndex(s => s.id === element.id);
      if (sortedIndex > 0) {
        const prevElement = sorted[sortedIndex - 1];
        currentPos += (direction === 'horizontal' ? prevElement.width : prevElement.height) + spacing;
        
        return {
          ...element,
          x: direction === 'horizontal' ? currentPos : element.x,
          y: direction === 'vertical' ? currentPos : element.y
        };
      }
      return element;
    });

    onPageChange({
      ...page,
      elements: updatedElements,
      updateTime: Date.now()
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">对齐工具</h4>
        <p className="text-xs text-gray-500 mb-3">已选中 {selectedElements.length} 个元素</p>
        
        {/* 水平对齐 */}
        <div className="mb-3">
          <label className="text-xs text-gray-600 mb-1 block">水平对齐</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => alignElements('left')}
              className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="左对齐"
            >
              ⟨|
            </button>
            <button
              onClick={() => alignElements('center')}
              className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="水平居中"
            >
              ⟨|⟩
            </button>
            <button
              onClick={() => alignElements('right')}
              className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="右对齐"
            >
              |⟩
            </button>
          </div>
        </div>

        {/* 垂直对齐 */}
        <div className="mb-3">
          <label className="text-xs text-gray-600 mb-1 block">垂直对齐</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => alignElements('top')}
              className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="顶部对齐"
            >
              ⏠
            </button>
            <button
              onClick={() => alignElements('middle')}
              className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="垂直居中"
            >
              ⧗
            </button>
            <button
              onClick={() => alignElements('bottom')}
              className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="底部对齐"
            >
              ⏡
            </button>
          </div>
        </div>

        {/* 分布 */}
        {selectedElements.length >= 3 && (
          <div>
            <label className="text-xs text-gray-600 mb-1 block">均匀分布</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => distributeElements('horizontal')}
                className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                title="水平分布"
              >
                ⟨ ⟩ ⟨ ⟩
              </button>
              <button
                onClick={() => distributeElements('vertical')}
                className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                title="垂直分布"
              >
                ⏠⏡⏠⏡
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlignmentTools;
