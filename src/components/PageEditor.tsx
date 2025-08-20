import React from 'react';
import type { Page, PhotoData, TextData } from '../types/template';
import PhotoFrame from './PhotoFrame';
import TextBox from './TextBox';

interface PageEditorProps {
  page: Page;
  photos: PhotoData[];
  texts: TextData[];
  onAddPhoto: (frameId: string, photoUrl: string) => void;
  onUpdateText: (frameId: string, content: string) => void;
  pageId?: string;
}

const PageEditor: React.FC<PageEditorProps> = ({
  page,
  photos,
  texts,
  onAddPhoto,
  onUpdateText,
  pageId
}) => {
  return (
    <div 
      id={pageId}
      className="relative bg-white shadow-lg mx-auto"
      style={{ 
        width: `${page.width}px`, 
        height: `${page.height}px`,
        maxWidth: '100%',
        maxHeight: '80vh'
      }}
    >
      {/* 渲染照片框 */}
      {page.photoFrames.map(frame => {
        const photo = photos.find(p => p.frameId === frame.id);
        return (
          <PhotoFrame
            key={frame.id}
            frame={frame}
            photoUrl={photo?.url}
            onAddPhoto={(url) => onAddPhoto(frame.id, url)}
          />
        );
      })}

      {/* 渲染文本框 */}
      {page.textFrames.map(frame => {
        const text = texts.find(t => t.frameId === frame.id);
        return (
          <TextBox
            key={frame.id}
            frame={frame}
            content={text?.content || ''}
            onUpdate={(content) => onUpdateText(frame.id, content)}
          />
        );
      })}
    </div>
  );
};

export default PageEditor;
