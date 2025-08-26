import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, setNavigateFunction } from './context/AuthContext';
import { useEffect } from 'react';
import HomePage from './components/HomePage';
import PhotoBookStudio from './components/PhotoBookStudio';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    // 设置导航函数供triggerLogout使用
    setNavigateFunction(navigate);
  }, [navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/studio" 
          element={
            <ProtectedRoute>
              <PhotoBookStudio />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
