import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import PhotoBookEditor from './components/PhotoBookEditor';
import type { Template } from './types/template';

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // 选择模板后滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGallery = () => {
    setSelectedTemplate(null);
    // 返回模板库时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 当组件状态改变时确保滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [selectedTemplate]);

  return (
    <>
      {selectedTemplate ? (
        <PhotoBookEditor 
          template={selectedTemplate} 
          onBackToGallery={handleBackToGallery} 
        />
      ) : (
        <HomePage onTemplateSelect={handleTemplateSelect} />
      )}
    </>
  );
}

export default App;
