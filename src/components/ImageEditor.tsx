import React, { useState, useCallback } from 'react';
import { ImageUtils } from '../utils/imageUtils';

interface ImageEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  isOpen,
  onClose,
  onSave
}) => {
  const [editedImageUrl, setEditedImageUrl] = useState(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const handleRotate = useCallback(async (degrees: number) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const rotatedUrl = await ImageUtils.rotateImage(editedImageUrl, degrees);
      setEditedImageUrl(rotatedUrl);
    } catch (error) {
      console.error('旋转失败:', error);
      alert('图片旋转失败');
    } finally {
      setIsProcessing(false);
    }
  }, [editedImageUrl, isProcessing]);

  const handleBrightnessChange = useCallback(async (value: number) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setBrightness(value);
      const adjustedUrl = await ImageUtils.adjustBrightness(imageUrl, value);
      setEditedImageUrl(adjustedUrl);
    } catch (error) {
      console.error('亮度调整失败:', error);
      alert('亮度调整失败');
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, isProcessing]);

  const handleContrastChange = useCallback(async (value: number) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setContrast(value);
      const adjustedUrl = await ImageUtils.adjustContrast(editedImageUrl, value);
      setEditedImageUrl(adjustedUrl);
    } catch (error) {
      console.error('对比度调整失败:', error);
      alert('对比度调整失败');
    } finally {
      setIsProcessing(false);
    }
  }, [editedImageUrl, isProcessing]);

  const handleApplyFilter = useCallback(async (filterType: 'grayscale' | 'sepia') => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      let filteredUrl;
      
      switch (filterType) {
        case 'grayscale':
          filteredUrl = await ImageUtils.applyGrayscale(editedImageUrl);
          break;
        case 'sepia':
          filteredUrl = await ImageUtils.applySepia(editedImageUrl);
          break;
        default:
          return;
      }
      
      setEditedImageUrl(filteredUrl);
    } catch (error) {
      console.error('滤镜应用失败:', error);
      alert('滤镜应用失败');
    } finally {
      setIsProcessing(false);
    }
  }, [editedImageUrl, isProcessing]);

  const handleReset = useCallback(() => {
    setEditedImageUrl(imageUrl);
    setBrightness(0);
    setContrast(0);
  }, [imageUrl]);

  const handleSave = useCallback(() => {
    onSave(editedImageUrl);
    onClose();
  }, [editedImageUrl, onSave, onClose]);

  const handleCancel = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">图片编辑</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 图片预览 */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={editedImageUrl}
                  alt="编辑预览"
                  className="max-w-full max-h-96 object-contain border rounded"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                    <div className="text-white">处理中...</div>
                  </div>
                )}
              </div>
            </div>

            {/* 编辑工具 */}
            <div className="space-y-6">
              {/* 旋转工具 */}
              <div>
                <h3 className="text-lg font-medium mb-3">旋转</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRotate(-90)}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    ↺ 逆时针90°
                  </button>
                  <button
                    onClick={() => handleRotate(90)}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    ↻ 顺时针90°
                  </button>
                </div>
              </div>

              {/* 亮度调整 */}
              <div>
                <h3 className="text-lg font-medium mb-3">亮度</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm">暗</span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <span className="text-sm">亮</span>
                  <span className="text-sm w-8">{brightness}</span>
                </div>
              </div>

              {/* 对比度调整 */}
              <div>
                <h3 className="text-lg font-medium mb-3">对比度</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm">低</span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => handleContrastChange(Number(e.target.value))}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <span className="text-sm">高</span>
                  <span className="text-sm w-8">{contrast}</span>
                </div>
              </div>

              {/* 滤镜 */}
              <div>
                <h3 className="text-lg font-medium mb-3">滤镜</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApplyFilter('grayscale')}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    黑白
                  </button>
                  <button
                    onClick={() => handleApplyFilter('sepia')}
                    disabled={isProcessing}
                    className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    复古
                  </button>
                </div>
              </div>

              {/* 重置按钮 */}
              <div>
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 p-4 border-t">
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
