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
    window.scrollTo({ top: 0, behavior: 'auto' });
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