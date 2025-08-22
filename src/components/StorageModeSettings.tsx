// 存储模式设置组件

import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';

interface StorageModeSettingsProps {
  onModeChange?: (mode: 'api' | 'local') => void;
}

const StorageModeSettings: React.FC<StorageModeSettingsProps> = ({ onModeChange }) => {
  const [currentMode, setCurrentMode] = useState<'api' | 'local'>('local');
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<'api' | 'local'>('local');

  useEffect(() => {
    setCurrentMode(StorageService.getStorageMode());
  }, []);

  const handleModeChange = (newMode: 'api' | 'local') => {
    if (newMode === currentMode) return;
    
    setPendingMode(newMode);
    setShowConfirm(true);
  };

  const confirmModeChange = async () => {
    setIsChanging(true);
    try {
      StorageService.setApiMode(pendingMode === 'api');
      setCurrentMode(pendingMode);
      setShowConfirm(false);
      
      if (onModeChange) {
        onModeChange(pendingMode);
      }

      // 显示成功消息
      console.log(`存储模式已切换为: ${pendingMode === 'api' ? 'API模式' : '本地存储模式'}`);
    } catch (error) {
      console.error('切换存储模式失败:', error);
      alert('切换存储模式失败，请重试');
    } finally {
      setIsChanging(false);
    }
  };

  const cancelModeChange = () => {
    setShowConfirm(false);
    setPendingMode(currentMode);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">存储模式设置</h3>
      
      <div className="space-y-4">
        {/* 当前模式显示 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">当前模式:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentMode === 'api' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {currentMode === 'api' ? 'API模式' : '本地存储模式'}
          </span>
        </div>

        {/* 模式选择 */}
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="storage-mode"
              value="local"
              checked={currentMode === 'local'}
              onChange={() => handleModeChange('local')}
              className="mr-3"
              disabled={isChanging}
            />
            <div>
              <div className="font-medium text-gray-900">本地存储模式</div>
              <div className="text-sm text-gray-600">数据存储在浏览器本地，不需要后端服务器</div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="storage-mode"
              value="api"
              checked={currentMode === 'api'}
              onChange={() => handleModeChange('api')}
              className="mr-3"
              disabled={isChanging}
            />
            <div>
              <div className="font-medium text-gray-900">API模式</div>
              <div className="text-sm text-gray-600">数据存储在后端服务器，支持云同步和高级功能</div>
            </div>
          </label>
        </div>

        {/* 功能对比 */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">功能对比</h4>
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-900">功能</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-900">本地存储</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-900">API模式</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">基础编辑</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">图片上传</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">PDF导出</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">云同步</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">✅</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">离线使用</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 确认对话框 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">确认切换存储模式</h4>
            <p className="text-gray-600 mb-4">
              您确定要切换到{pendingMode === 'api' ? 'API模式' : '本地存储模式'}吗？
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {pendingMode === 'api' 
                ? '切换到API模式后，需要确保后端服务器正常运行。'
                : '切换到本地存储模式后，将无法使用图片上传和PDF导出等高级功能。'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelModeChange}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isChanging}
              >
                取消
              </button>
              <button
                onClick={confirmModeChange}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={isChanging}
              >
                {isChanging ? '切换中...' : '确认切换'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageModeSettings;
