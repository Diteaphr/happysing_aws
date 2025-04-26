import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css';

interface LocationState {
  productType: string;
  prompt: string;
  boostedPrompt?: string;
  baseImage?: string | null;
  referenceImage?: string | null;
}

const CaseGeneratedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  
  // 示例圖片 - 在實際應用中，這些可能來自 API 響應
  const generatedImages = [
    '/assets/design1.jpg',
    '/assets/design1.jpg',
    '/assets/design1.jpg',
    '/assets/design1.jpg',
    '/assets/design1.jpg'
  ];
  
  // 如果沒有有效的狀態，返回到主頁
  useEffect(() => {
    if (!state?.prompt) {
      navigate('/');
    }
  }, [state, navigate]);
  
  const handleBackToGenerator = () => {
    navigate(-1);
  };
  
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  const handleSave = () => {
    alert('設計已保存！');
    // 這裡可以添加保存邏輯
  };
  
  const handleDownload = () => {
    // 創建一個下載鏈接
    const link = document.createElement('a');
    link.href = generatedImages[selectedImageIndex];
    link.download = `case-design-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!state?.prompt) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 頂部導航欄已移除 */}
      
      {/* 圖片橫向列表 */}
      <div className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <div className="flex space-x-4">
            {generatedImages.map((image, index) => (
              <div 
                key={index} 
                className={`flex-shrink-0 cursor-pointer border-2 ${selectedImageIndex === index ? 'border-yellow-400' : 'border-transparent'}`}
                onClick={() => handleSelectImage(index)}
              >
                <img 
                  src={image} 
                  alt={`設計 ${index + 1}`} 
                  className="h-24 w-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 主要內容 */}
      <div className="flex flex-grow">
        {/* 左側：提示詞和設置 */}
        <div className="w-1/3 bg-white p-6 overflow-y-auto border-r">
          {/* 返回按鈕 - 替代導航欄 */}
          <div className="mb-6">
            <button 
              onClick={handleBackToGenerator}
              className="flex items-center text-black hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              返回生成頁面
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-6">主機外殼設計結果</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">原始提示詞</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{state.prompt}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">AI 優化後提示詞</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{state.boostedPrompt || state.prompt}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">參考資訊</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">散熱效能</h3>
                <p className="text-sm text-gray-600">優秀的風道設計，可提供高效散熱性能，適合高性能配置。</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">材質</h3>
                <p className="text-sm text-gray-600">鋁合金+鋼化玻璃，兼具耐用性與美觀。</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">兼容性</h3>
                <p className="text-sm text-gray-600">支援 ATX, M-ATX, ITX 主板，最長顯卡 360mm，CPU散熱器高度 170mm。</p>
              </div>
            </div>
          </div>
          
          {/* 添加操作按鈕 - 替代原頂部導航欄按鈕 */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              保存設計
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              下載圖片
            </button>
          </div>
        </div>
        
        {/* 右側：選中的圖片大圖 */}
        <div className="w-2/3 bg-gray-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-3xl">
            <img 
              src={generatedImages[selectedImageIndex]} 
              alt="選中的設計" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseGeneratedPage;