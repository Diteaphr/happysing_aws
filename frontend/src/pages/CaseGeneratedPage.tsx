import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import './Home.css';

interface LocationState {
  productType: string;
  prompt: string;
  boostedPrompt?: string;
  baseImage?: string | null;
  referenceImage?: string | null;
  generatedImages: string[];
}

async function callPromptBooster(promptText: string): Promise<string> {
  try {
    const instruction = "\n\n(Please refine the prompt based only on the above description. Do not include trend analysis.)";
    const modifiedPromptText = promptText + instruction;

    const response = await fetch('https://409etc6v1f.execute-api.us-west-2.amazonaws.com/promptbooster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_prompt: modifiedPromptText,
        inspiration_image_ids: [],
        use_trends: false
      })
    });

    const data = await response.json();
    console.log('[DEBUG] API Response:', data);  // 便於調試 API 響應
    
    const boostedPrompt = data.boosted_prompt;   // 直接獲取 boosted_prompt，不需要 JSON.parse(data.body)
    
    return boostedPrompt;
  } catch (error) {
    console.log('Prompt booster API failed, using fallback enhancement:', error);
    
    // 失敗時的備用方案
    const enhancedPrompt = `${promptText}\n\n額外考慮要點：
- 散熱效能最佳化
- 材質選擇與工藝品質
- 噪音控制
- 安裝便利性
- 美觀設計
- 兼容性與未來擴充`;

    return enhancedPrompt;
  }
}

const CaseGeneratedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoriteMessage, setShowFavoriteMessage] = useState<number | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [showOriginalPrompt, setShowOriginalPrompt] = useState(true);
  const [showBoostedPrompt, setShowBoostedPrompt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refinedPromptLoading, setRefinedPromptLoading] = useState(false);
  
  // 示例圖片 - 在實際應用中，這些可能來自 API 響應
  const generatedImages = state?.generatedImages || [];
  console.log('[DEBUG] CaseGeneratedPage received images:', generatedImages);
  
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
  
  const handleRefineClick = (index: number) => {
    // Toggle selection
    setSelectedImageIndex(index === selectedImageIndex ? -1 : index);
  };

  const handleHeartClick = (index: number) => {
    // Add to favorites
    if (!favorites.includes(index)) {
      setFavorites([...favorites, index]);
      setShowFavoriteMessage(index);
      setTimeout(() => {
        setShowFavoriteMessage(null);
      }, 2000);
    } else {
      setFavorites(favorites.filter(i => i !== index));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setReferenceImage(file);
  };
  
  const handlePromptSubmit = async (promptText: string, original: string) => {
    setLoading(true);
    try {
      console.log("Submitting prompt:", promptText);
  
      // Step 1: Boost the prompt
      const boostedPrompt = await callPromptBooster(promptText);
  
      // Step 2: Get selected base image
      let baseImageUrl = null;
      if (selectedImageIndex >= 0 && generatedImages[selectedImageIndex]) {
        baseImageUrl = generatedImages[selectedImageIndex];
      }
  
      // Step 3: 🚀 NAVIGATE to /generator page with info
      navigate('/generator', {
        state: {
          productType: 'case',                      // or whatever product type
          prompt: promptText,                        // original user input
          boostedPrompt: boostedPrompt,              // boosted version
          baseImage: baseImageUrl,                   // selected base image
          referenceImage: referenceImage ? URL.createObjectURL(referenceImage) : null
        }
      });
  
    } catch (error) {
      console.error('Error boosting prompt:', error);
    } finally {
      setLoading(false);
    }
  };
  

  if (!state?.prompt) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Image gallery at the top */}
      <div className="p-8 bg-purple-100 flex justify-center">
        <div className="grid grid-cols-3 gap-8 max-w-4xl">
          {generatedImages.slice(0, 3).map((image, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <img 
                  src={image} 
                  alt={`設計 ${index + 1}`} 
                  className="w-full h-48 object-cover rounded"
                />
                <div className="flex justify-between mt-2">
                  <button 
                    onClick={() => handleRefineClick(index)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${selectedImageIndex === index ? 'bg-purple-600' : 'bg-gray-300'}`}
                  >
                    {selectedImageIndex === index ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </button>
                  <button 
                    onClick={() => handleHeartClick(index)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${favorites.includes(index) ? 'text-red-500' : 'text-black'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {showFavoriteMessage === index && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
                    已加入圖庫！
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col p-8 max-w-4xl mx-auto w-full">
        {/* 返回按鈕 */}
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
        
        {/* 可折疊的提示詞區域 */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md">
            <button 
              className="w-full text-left px-6 py-3 text-lg font-semibold text-black flex justify-between items-center border border-gray-200 rounded-lg"
              onClick={() => setShowOriginalPrompt(!showOriginalPrompt)}
            >
              <span>原始提示詞</span>
              <svg 
                className={`fill-current h-4 w-4 transition-transform ${showOriginalPrompt ? '' : '-rotate-90'}`}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </button>
            <div 
              className={`transition-all duration-300 overflow-hidden ${showOriginalPrompt ? 'max-h-96 p-6' : 'max-h-0 opacity-0'}`}
            >
              <p className="text-gray-700">{state.prompt}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md">
            <button 
              className="w-full text-left px-6 py-3 text-lg font-semibold text-black flex justify-between items-center border border-gray-200 rounded-lg"
              onClick={() => setShowBoostedPrompt(!showBoostedPrompt)}
            >
              <span>AI 優化後提示詞</span>
              <svg 
                className={`fill-current h-4 w-4 transition-transform ${showBoostedPrompt ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </button>
            <div 
              className={`transition-all duration-300 overflow-hidden ${showBoostedPrompt ? 'max-h-96 p-6' : 'max-h-0 opacity-0'}`}
            >
              {refinedPromptLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700"></div>
                  <p className="text-gray-700">正在優化中...</p>
                </div>
              ) : (
                <p className="text-gray-700">
                  {state.boostedPrompt || state.prompt}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* 輸入 Prompt */}
        <div className="bg-purple-600 border border-purple-700 rounded-xl p-4 mb-6 flex items-end space-x-2 shadow-lg">
          <textarea
            value={currentPrompt}
            onChange={e => {
              setCurrentPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={async e => {
              if (e.key === 'Enter' && !e.shiftKey && currentPrompt.trim()) {
                e.preventDefault();
                // You can implement the call to promptBooster here if needed
                handlePromptSubmit(currentPrompt.trim(), currentPrompt.trim());
              }
            }}
            placeholder="描述您想要的設計優化..."
            rows={1}
            className="flex-1 resize-none overflow-hidden bg-purple-600 text-white placeholder-purple-200 focus:outline-none"
            disabled={loading}
          />
          <button 
            onClick={() => currentPrompt.trim() && handlePromptSubmit(currentPrompt.trim(), currentPrompt.trim())} 
            disabled={loading || !currentPrompt.trim()} 
            className="p-2 rounded-md bg-white hover:bg-gray-100 text-purple-600"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Upload Reference Image */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">Upload Reference Image</h2>
          <div className="flex flex-col items-center">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">No file chosen</p>
            </div>
          </div>
        </div>
        
        {/* Trending design features section from second image */}
        {selectedImageIndex >= 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold mb-4 text-black ">Trending design features to consider:</h2>
            <p className="text-gray-700">
              Here is a summary of the common design trends and features across the PC case images:
              - Materials and Colors: - Black is the dominant exterior color - Metal (steel/aluminum) is the most common exterior material 
              - Glass side panels are very common - Some cases have mesh panel accents
              - Small number of cases use plastic - Shapes: - Rectangular cuboid is the most prevalent overall shape
              - Angular and aggressive styling features are common - Front panel styling varies (flat, protruding, mesh)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseGeneratedPage;