import React from 'react';

interface ToolbarProps {
  templateName: string;
  currentPage: number;
  totalPages: number;
  onBack: () => void;
  onExport: () => void;
  onExportAll?: () => void;
  onPageChange: (pageIndex: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  templateName,
  currentPage,
  totalPages,
  onBack,
  onExport,
  onExportAll,
  onPageChange
}) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 2); // pageIndex is 0-based
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage); // pageIndex is 0-based
    }
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          返回模板选择
        </button>
        <h1 className="text-xl font-semibold">{templateName}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            上一页
          </button>
          <span className="text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            下一页
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            导出当前页
          </button>
          {onExportAll && totalPages > 1 && (
            <button
              onClick={onExportAll}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              导出全部
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
