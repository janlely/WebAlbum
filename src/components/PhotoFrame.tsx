import React, { useState, useRef } from 'react';
import type { PhotoFrame } from '../types/template';
import { ImageUtils } from '../utils/imageUtils';
import ImageEditor from './ImageEditor';

interface PhotoFrameProps {
  frame: PhotoFrame;
  photoUrl?: string;
  onAddPhoto: (url: string) => void;
}

const PhotoFrame: React.FC<PhotoFrameProps> = ({ frame, photoUrl, onAddPhoto }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      // 验证文件
      const validation = ImageUtils.validateImageFile(file);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }

      // 压缩图片
      const compressedBlob = await ImageUtils.compressImage(file);
      
      // 转换为DataURL
      const reader = new FileReader();
      reader.onload = (e) => {
        onAddPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(compressedBlob);
    } catch (error) {
      console.error('处理图片失败:', error);
      alert('图片处理失败');
    }
  };

  const handleClick = () => {
    if (photoUrl) {
      // 如果已有照片，打开编辑器
      setIsEditorOpen(true);
    } else {
      // 如果没有照片，打开文件选择
      fileInputRef.current?.click();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoUrl) {
      setIsEditorOpen(true);
    }
  };

  const handleSaveEdit = (editedImageUrl: string) => {
    onAddPhoto(editedImageUrl);
    setIsEditorOpen(false);
  };

  return (
    <>
      <div
        className={`absolute border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        style={{
          left: `${frame.x}px`,
          top: `${frame.y}px`,
          width: `${frame.width}px`,
          height: `${frame.height}px`
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={photoUrl ? '单击或双击编辑图片' : '点击或拖拽添加照片'}
      >
        {photoUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={photoUrl} 
              alt="照片" 
              className="w-full h-full object-cover rounded"
            />
            {/* 编辑按钮悬浮显示 */}
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditorOpen(true);
                }}
                className="bg-black bg-opacity-50 text-white p-1 rounded text-xs hover:bg-opacity-70"
                title="编辑图片"
              >
                ✏️
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-2">
            <div className="text-gray-500 text-sm">{frame.placeholder || '点击或拖拽添加照片'}</div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
        />
      </div>

      {/* 图片编辑器 */}
      {photoUrl && (
        <ImageEditor
          imageUrl={photoUrl}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default PhotoFrame;
