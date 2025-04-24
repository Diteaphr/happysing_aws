import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css'; // Import gradient styles
import { LightBulbIcon } from '@heroicons/react/24/outline';

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
  const [showMindmapButton, setShowMindmapButton] = useState<boolean>(false);

  // Mock images for demonstration
  const mockImages = [
    '/mock-images/design1.jpg',
    '/mock-images/design2.jpg',
    '/mock-images/design3.jpg'
  ];

  useEffect(() => {
    // Try to restore from localStorage if state is missing
    if (!state?.prompt) {
      const storedState = localStorage.getItem('generator-last-state');
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          if (parsedState && parsedState.prompt) {
            console.log('Restored state from localStorage:', parsedState);
            // Use the location.state setter provided by react-router
            const loc = {
              ...location,
              state: parsedState
            };
            navigate(location.pathname, { 
              state: parsedState,
              replace: true 
            });
            return;
          }
        } catch (error) {
          console.error('Error restoring state from localStorage:', error);
        }
      }
      
      // If no valid state was found in localStorage, redirect to home
      console.log('No valid state found, redirecting to home');
      navigate('/');
      return;
    }

    // Save current state to localStorage for recovery
    try {
      localStorage.setItem('generator-last-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }

    const simulatePromptRefinement = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock refined prompt
      setRefinedPrompt(`${state.prompt} - 現代風格 - 鋁合金材質 - RGB燈效`);
      setLoading(false);
      
      // Show mindmap button after content is loaded
      setShowMindmapButton(true);
    };

    simulatePromptRefinement();
  }, [state, navigate, location.pathname]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleSaveToKnowledgeBase = () => {
    // Mock saving to knowledge base
    alert('設計已加入知識庫！');
  };

  const handleBackToPrompt = () => {
    // Navigate back to the appropriate product page based on the product type
    if (state?.productType) {
      navigate(`/${state.productType}`);
    } else {
      navigate('/');
    }
  };

  const handleViewMindmap = () => {
    navigate('/mindmap', { 
      state: { 
        productType: state?.productType || 'cooler',
        initialPrompt: state?.prompt
      }
    });
  };

  if (!state?.prompt) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBackToPrompt}
            className="flex items-center text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回提示詞編輯
          </button>
          
          {showMindmapButton && (
            <button
              onClick={handleViewMindmap}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <LightBulbIcon className="w-5 h-5 mr-2" />
              查看心智圖
            </button>
          )}
        </div>

        <div className="cm-card mb-6">
          <h2 className="text-xl font-bold mb-4 text-white">原始提示詞</h2>
          <p className="text-gray-300 mb-6">{state.prompt}</p>
          
          <h2 className="text-xl font-bold mb-4 text-white">AI 優化後的提示詞</h2>
          <p className="text-white">{refinedPrompt || '正在優化中...'}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">正在生成設計...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {mockImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden ${
                    selectedImage === imageUrl ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleImageSelect(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`設計方案 ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                    設計方案 {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {selectedImage && (
              <div className="cm-card">
                <h2 className="text-xl font-bold mb-4 text-white">設計評分</h2>
                <div className="flex space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 text-white"
                      onClick={() => console.log(`Rated: ${rating}`)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveToKnowledgeBase}
                  className="cm-btn-primary w-full"
                >
                  加入知識庫
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Generator; 