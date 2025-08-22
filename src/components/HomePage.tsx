import React, { useRef } from 'react';
import type { Template } from '../types/template';
import Header from './Header';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import TemplateGallery from './TemplateGallery';
import Footer from './Footer';

interface HomePageProps {
  onTemplateSelect: (template: Template) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onTemplateSelect }) => {
  const templatesRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    templatesRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 头部导航 */}
      <Header />
      
      {/* 英雄区域 */}
      <HeroSection onGetStarted={handleGetStarted} />
      
      {/* 使用步骤 */}
      <HowItWorks />
      
      {/* 模板库 */}
      <div ref={templatesRef}>
        <TemplateGallery onTemplateSelect={onTemplateSelect} />
      </div>
      
      {/* 页脚 */}
      <Footer />
    </div>
  );
};

export default HomePage;
