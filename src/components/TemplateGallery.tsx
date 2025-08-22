import React, { useState, useEffect } from 'react';
import type { Template } from '../types/template';
import { templateService } from '../services/templateService';

interface TemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getTemplates();
        setTemplates(data);
      } catch (err) {
        setError('加载模板失败');
        console.error('加载模板失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">加载模板中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">错误: {error}</div>
      </div>
    );
  }

  return (
    <section id="templates" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            精选模板库
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            专业设计师精心制作的模板，涵盖各种场景和风格，满足不同需求
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              onClick={() => onTemplateSelect(template)}
            >
              {/* 缩略图区域 */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {template.thumbnail ? (
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* 悬浮预览按钮 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      选择模板
                    </button>
                  </div>
                </div>

                {/* 页数标签 */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                  {template.pages.length} 页
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                  <div className="flex items-center text-yellow-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="ml-1 text-sm text-gray-600">推荐</span>
                  </div>
                </div>

                {/* 特色标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getTemplateFeatures(template.id).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* 使用按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateSelect(template);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  立即使用
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">找不到合适的模板？</p>
          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
            提交自定义需求
          </button>
        </div>
      </div>
    </section>
  );

  // 获取模板特色标签
  function getTemplateFeatures(templateId: string): string[] {
    const featureMap: Record<string, string[]> = {
      'template-1': ['经典布局', '双页设计', '适合回忆'],
      'template-2': ['现代简约', '大图展示', '商务风格'],
      'template-3': ['旅行专用', '多图布局', '故事记录'],
      'template-4': ['家庭相册', '温馨风格', '多人照片'],
      'template-5': ['浪漫婚礼', '双页设计', '纪念珍藏']
    };
    return featureMap[templateId] || ['精美设计'];
  }
};

export default TemplateGallery;
