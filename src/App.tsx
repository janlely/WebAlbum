import React, { useState } from 'react';
import TemplateGallery from './components/TemplateGallery';
import PhotoBookEditor from './components/PhotoBookEditor';
import type { Template } from './types/template';

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleBackToGallery = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedTemplate ? (
        <PhotoBookEditor 
          template={selectedTemplate} 
          onBackToGallery={handleBackToGallery} 
        />
      ) : (
        <TemplateGallery onTemplateSelect={handleTemplateSelect} />
      )}
    </div>
  );
}

export default App;
