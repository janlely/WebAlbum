import React from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* 主标题 */}
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 max-w-3xl mx-auto">
            创建属于你的
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              专属照片书
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            选择精美模板，轻松添加照片和文字，一键导出高质量PDF。让珍贵回忆永远保存，让美好时光触手可及。
          </p>

          {/* 特色标签 */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              📱 简单易用
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              🎨 专业模板
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              ⚡ 快速导出
            </span>
            <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              💯 高质量PDF
            </span>
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-0"
              style={{
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                color: '#ffffff',
                backgroundImage: 'linear-gradient(to right, #3b82f6, #9333ea)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #2563eb, #7c3aed)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #3b82f6, #9333ea)';
              }}
            >
              立即开始制作 →
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
              查看示例作品
            </button>
          </div>

          {/* 统计数字 */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">5+</div>
              <div className="text-gray-600 mt-1">精美模板</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10+</div>
              <div className="text-gray-600 mt-1">编辑工具</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-gray-600 mt-1">免费使用</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">∞</div>
              <div className="text-gray-600 mt-1">无限创作</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
