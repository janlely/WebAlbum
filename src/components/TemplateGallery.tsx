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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">选择照片书模板</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => onTemplateSelect(template)}
          >
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {template.thumbnail ? (
                <img 
                  src={template.thumbnail} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500">模板预览图</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-center">{template.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;
