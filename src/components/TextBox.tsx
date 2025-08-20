import React, { useState, useRef, useEffect } from 'react';
import type { TextFrame } from '../types/template';

interface TextBoxProps {
  frame: TextFrame;
  content: string;
  onUpdate: (content: string) => void;
}

const TextBox: React.FC<TextBoxProps> = ({ frame, content, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editContent !== content) {
      onUpdate(editContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditContent(content);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  };

  return (
    <div
      className="absolute border border-transparent rounded hover:border-gray-300 cursor-text"
      style={{
        left: `${frame.x}px`,
        top: `${frame.y}px`,
        width: `${frame.width}px`,
        height: `${frame.height}px`
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textAreaRef}
          className="w-full h-full p-2 border-none outline-none resize-none"
          value={editContent}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={frame.placeholder || '输入文本'}
        />
      ) : (
        <div className="w-full h-full p-2 flex items-center">
          {content || (
            <span className="text-gray-400 text-sm">
              {frame.placeholder || '双击编辑文本'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TextBox;
