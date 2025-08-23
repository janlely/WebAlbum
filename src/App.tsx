import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import PhotoBookStudio from './components/PhotoBookStudio';

function App() {
  const [isEditing, setIsEditing] = useState(false);

  const handleStartCreating = () => {
    setIsEditing(true);
  };

  const handleBackToHome = () => {
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // 切换编辑模式时的处理
    const htmlElement = document.documentElement;
    
    if (isEditing) {
      // 进入编辑模式：禁用页面滚动
      htmlElement.classList.add('editing-mode');
    } else {
      // 退出编辑模式：恢复页面滚动
      htmlElement.classList.remove('editing-mode');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    
    // 清理函数
    return () => {
      htmlElement.classList.remove('editing-mode');
    };
  }, [isEditing]);

  return (
    <>
      {isEditing ? (
        <PhotoBookStudio onBackToHome={handleBackToHome} />
      ) : (
        <HomePage onStartCreating={handleStartCreating} />
      )}
    </>
  );
}

export default App;