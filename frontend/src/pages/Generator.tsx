import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  productType: string;
  prompt: string;
}

const Generator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [refinedPrompt, setRefinedPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Mock images for demonstration
  const mockImages = [
    '/mock-images/design1.jpg',
    '/mock-images/design2.jpg',
    '/mock-images/design3.jpg'
  ];

  useEffect(() => {
    if (!state?.prompt) {
      navigate('/home');
      return;
    }

    const simulatePromptRefinement = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock refined prompt
      setRefinedPrompt(`${state.prompt} - 現代風格 - 鋁合金材質 - RGB燈效`);
      setLoading(false);
    };

    simulatePromptRefinement();
  }, [state, navigate]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleSaveToKnowledgeBase = () => {
    // Mock saving to knowledge base
    alert('設計已加入知識庫！');
  };

  const handleBackToPrompt = () => {
    navigate('/home');
  };

  if (!state?.prompt) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBackToPrompt}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          返回提示詞編輯
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">原始提示詞</h2>
        <p className="text-gray-600 mb-6">{state.prompt}</p>
        
        <h2 className="text-xl font-semibold mb-4">AI 優化後的提示詞</h2>
        <p className="text-gray-800">{refinedPrompt || '正在優化中...'}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在生成設計...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {mockImages.map((imageUrl, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden ${
                  selectedImage === imageUrl ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => handleImageSelect(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`設計方案 ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  設計方案 {index + 1}
                </div>
              </div>
            ))}
          </div>

          {selectedImage && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">設計評分</h2>
              <div className="flex space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                    onClick={() => console.log(`Rated: ${rating}`)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSaveToKnowledgeBase}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                加入知識庫
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Generator; 