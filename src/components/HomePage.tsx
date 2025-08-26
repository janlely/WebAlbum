import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import Footer from './Footer';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartCreating = () => {
    console.log('开始创建照片书');
    navigate('/studio');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 头部导航 */}
      <Header />
      
      {/* 英雄区域 */}
      <HeroSection onGetStarted={handleStartCreating} />
      
      {/* 使用步骤 */}
      <HowItWorks />
      
      {/* 存储模式设置区域 */}

      
      {/* 页脚 */}
      <Footer />
    </div>
  );
};

export default HomePage;
