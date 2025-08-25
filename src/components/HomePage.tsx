import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import Footer from './Footer';

interface HomePageProps {
  onStartCreating: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartCreating }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* 头部导航 */}
      <Header />
      
      {/* 英雄区域 */}
      <HeroSection onGetStarted={onStartCreating} />
      
      {/* 使用步骤 */}
      <HowItWorks />
      
      {/* 存储模式设置区域 */}

      
      {/* 页脚 */}
      <Footer />
    </div>
  );
};

export default HomePage;
