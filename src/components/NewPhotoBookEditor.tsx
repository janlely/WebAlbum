import React, { useState, useEffect } from 'react';
import type { PhotoBookProject, CanvasSize, Theme, PageTemplate, PageInstance } from '../types';
import { defaultCanvasSizes, defaultThemes, defaultPageTemplates } from '../types';

interface NewPhotoBookEditorProps {
  project: PhotoBookProject | null; // null表示新建项目
  onBackToHome: () => void;
}

const NewPhotoBookEditor: React.FC<NewPhotoBookEditorProps> = ({ 
  project, 
  onBackToHome 
}) => {
  // 项目设置状态
  const [currentProject, setCurrentProject] = useState<PhotoBookProject | null>(project);
  const [isProjectSetup, setIsProjectSetup] = useState(!!project);
  
  // 项目配置状态（新建项目时使用）
  const [projectName, setProjectName] = useState('我的照片书');
  const [selectedCanvasSize, setSelectedCanvasSize] = useState<CanvasSize>(defaultCanvasSizes[0]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultThemes[0]);
  
  // 编辑器状态
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<'canvas' | 'theme' | 'pages' | 'layouts'>('canvas');

  // 创建新项目
  const handleCreateProject = () => {
    const newProject: PhotoBookProject = {
      id: `project-${Date.now()}`,
      name: projectName,
      canvasSize: selectedCanvasSize,
      theme: selectedTheme,
      pages: [],
      settings: {
        showGrid: true,
        snapToGrid: true,
        gridSize: 10
      },
      createTime: Date.now(),
      updateTime: Date.now(),
      lastEditTime: Date.now(),
      version: '1.0.0'
    };
    
    setCurrentProject(newProject);
    setIsProjectSetup(true);
  };

  // 添加页面
  const handleAddPage = (template: PageTemplate) => {
    if (!currentProject) return;
    
    const newPage: PageInstance = {
      id: `page-${Date.now()}`,
      name: `页面 ${currentProject.pages.length + 1}`,
      templateId: template.id,
      order: currentProject.pages.length,
      photos: [],
      texts: [],
      createTime: Date.now(),
      updateTime: Date.now()
    };
    
    const updatedProject = {
      ...currentProject,
      pages: [...currentProject.pages, newPage],
      updateTime: Date.now()
    };
    
    setCurrentProject(updatedProject);
    setCurrentPageIndex(updatedProject.pages.length - 1);
  };

  // 如果是新项目且还没有设置，显示项目设置界面
  if (!isProjectSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* 头部 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">创建新的照片书</h1>
              <p className="text-gray-600">选择画布尺寸和设计风格开始你的创作</p>
            </div>

            {/* 项目名称 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目名称
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="为你的照片书起个名字"
              />
            </div>

            {/* 画布尺寸选择 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                选择画布尺寸
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultCanvasSizes.filter(size => size.isPopular).map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedCanvasSize(size)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedCanvasSize.id === size.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{size.name}</div>
                    <div className="text-sm text-gray-600">{size.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {size.width} × {size.height} • {size.aspectRatio}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 风格主题选择 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                选择设计风格
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {defaultThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      selectedTheme.id === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={theme.preview}
                      alt={theme.name}
                      className="w-full h-16 object-cover rounded mb-2"
                    />
                    <div className="font-medium text-gray-900">{theme.name}</div>
                    <div className="text-xs text-gray-600">{theme.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between">
              <button
                onClick={onBackToHome}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={handleCreateProject}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                开始创作
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 主编辑器界面
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToHome}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 返回首页
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentProject?.name || '未命名项目'}
              </h1>
              <p className="text-sm text-gray-500">
                {currentProject?.canvasSize.name} • {currentProject?.theme.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              保存
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              导出PDF
            </button>
          </div>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="flex-1 flex">
        {/* 左侧：画布区域 */}
        <div className="flex-1 p-6">
          <div className="h-full flex items-center justify-center">
            {currentProject && currentProject.pages.length > 0 ? (
              <div 
                className="bg-white shadow-lg rounded-lg overflow-hidden"
                style={{
                  width: Math.min(600, window.innerWidth * 0.6),
                  height: Math.min(600, window.innerWidth * 0.6) * (currentProject.canvasSize.height / currentProject.canvasSize.width),
                  background: currentProject.theme.backgroundGradient || currentProject.theme.backgroundColor
                }}
              >
                <div className="p-8 h-full flex items-center justify-center text-gray-500">
                  页面编辑器将在这里显示
                  <br />
                  当前页面: {currentPageIndex + 1} / {currentProject.pages.length}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-xl mb-4">还没有页面</p>
                <p>在右侧面板中选择一个页面布局开始创作</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：工具面板 */}
        <div className="w-80 bg-white border-l border-gray-200">
          {/* 面板标签 */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'canvas', label: '画布', icon: '📐' },
                { id: 'theme', label: '主题', icon: '🎨' },
                { id: 'pages', label: '页面', icon: '📄' },
                { id: 'layouts', label: '布局', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightPanelTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    rightPanelTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 面板内容 */}
          <div className="p-4 h-full overflow-y-auto">
            {rightPanelTab === 'canvas' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">画布设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      当前尺寸
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{currentProject?.canvasSize.name}</div>
                      <div className="text-sm text-gray-600">
                        {currentProject?.canvasSize.width} × {currentProject?.canvasSize.height}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rightPanelTab === 'theme' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">设计主题</h3>
                <div className="space-y-3">
                  {defaultThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setCurrentProject(prev => prev ? { ...prev, theme } : null)}
                      className={`w-full p-3 border rounded-lg text-left transition-all ${
                        currentProject?.theme.id === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={theme.preview}
                        alt={theme.name}
                        className="w-full h-12 object-cover rounded mb-2"
                      />
                      <div className="font-medium text-sm">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rightPanelTab === 'pages' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">页面管理</h3>
                <div className="space-y-3">
                  {currentProject?.pages.map((page, index) => (
                    <div
                      key={page.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        currentPageIndex === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentPageIndex(index)}
                    >
                      <div className="font-medium text-sm">页面 {index + 1}</div>
                      <div className="text-xs text-gray-600">{page.name}</div>
                    </div>
                  ))}
                  
                  {(!currentProject?.pages || currentProject.pages.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      <p>还没有页面</p>
                      <p className="text-sm">在"布局"标签中选择模板创建页面</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {rightPanelTab === 'layouts' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">页面布局</h3>
                <div className="space-y-4">
                  {defaultPageTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleAddPage(template)}
                      className="w-full p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all text-left"
                    >
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-600">{template.description}</div>
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPhotoBookEditor;
