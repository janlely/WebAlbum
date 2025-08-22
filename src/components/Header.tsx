import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo 和品牌 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WebAlbum</h1>
              <p className="text-sm text-gray-500">专业照片书制作工具</p>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">功能特色</a>
            <a href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors">模板库</a>
            <a href="#help" className="text-gray-600 hover:text-gray-900 transition-colors">使用帮助</a>
          </nav>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-3">
            <button className="hidden sm:inline-flex px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              登录
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              免费试用
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
