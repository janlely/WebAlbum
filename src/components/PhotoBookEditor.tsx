import React, { useState } from 'react';
import type { Template, PhotoData, TextData } from '../types/template';
import PageEditor from './PageEditor';
import Toolbar from './Toolbar';
import { PDFGenerator } from '../utils/pdfGenerator';

interface PhotoBookEditorProps {
  template: Template;
  onBackToGallery: () => void;
}

const PhotoBookEditor: React.FC<PhotoBookEditorProps> = ({ template, onBackToGallery }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [texts, setTexts] = useState<TextData[]>([]);

  const currentPage = template.pages[currentPageIndex];

  const handleAddPhoto = (frameId: string, photoUrl: string) => {
    const newPhoto: PhotoData = {
      id: `photo-${Date.now()}`,
      url: photoUrl,
      frameId,
      pageId: currentPage.id
    };

    setPhotos(prev => {
      // 移除同一框架中的旧照片
      const filtered = prev.filter(photo => photo.frameId !== frameId || photo.pageId !== currentPage.id);
      return [...filtered, newPhoto];
    });
  };

  const handleUpdateText = (frameId: string, content: string) => {
    const newText: TextData = {
      id: `text-${Date.now()}`,
      content,
      frameId,
      pageId: currentPage.id
    };

    setTexts(prev => {
      // 移除同一框架中的旧文本
      const filtered = prev.filter(text => text.frameId !== frameId || text.pageId !== currentPage.id);
      return [...filtered, newText];
    });
  };

  const handleExportPDF = async () => {
    try {
      // 导出当前页面
      const pageId = `page-editor-${currentPage.id}`;
      await PDFGenerator.exportToPDF(pageId, `${template.name}-第${currentPageIndex + 1}页.pdf`);
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请检查页面内容');
    }
  };

  const handleExportAllPages = async () => {
    try {
      // 导出所有页面到一个PDF文件
      const pageIds = template.pages.map(page => `page-editor-${page.id}`);
      await PDFGenerator.exportMultiPageToPDF(pageIds, `${template.name}-完整版.pdf`);
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请检查页面内容');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Toolbar 
        templateName={template.name}
        currentPage={currentPageIndex + 1}
        totalPages={template.pages.length}
        onBack={onBackToGallery}
        onExport={handleExportPDF}
        onExportAll={handleExportAllPages}
        onPageChange={setCurrentPageIndex}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <PageEditor
          page={currentPage}
          photos={photos.filter(photo => photo.pageId === currentPage.id)}
          texts={texts.filter(text => text.pageId === currentPage.id)}
          onAddPhoto={handleAddPhoto}
          onUpdateText={handleUpdateText}
          pageId={`page-editor-${currentPage.id}`}
        />
      </div>
    </div>
  );
};

export default PhotoBookEditor;
