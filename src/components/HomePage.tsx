import React, { useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import Footer from './Footer';
import StorageModeSettings from './StorageModeSettings';

interface HomePageProps {
  onStartCreating: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartCreating }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* 头部导航 */}
      <Header />
      
      {/* 英雄区域 */}
      <HeroSection onGetStarted={onStartCreating} />
      
      {/* 使用步骤 */}
      <HowItWorks />
      
      {/* 存储模式设置区域 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">设置和配置</h2>
            <p className="text-lg text-gray-600">
              选择适合您的存储模式，获得最佳的使用体验
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showSettings ? '隐藏设置' : '显示存储设置'}
            </button>
          </div>
          
          {showSettings && (
            <div className="max-w-2xl mx-auto">
              <StorageModeSettings onModeChange={(mode) => {
                console.log('存储模式已切换为:', mode);
              }} />
            </div>
          )}
        </div>
      </section>
      
      {/* 页脚 */}
      <Footer />
    </div>
  );
};

export default HomePage;
