import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LightBulbIcon, ClockIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import './Home.css';
import { Timeline } from '../components/Timeline';
import ChatInput from '../components/ChatInput';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CasePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [timelineNodes, setTimelineNodes] = useState<any[]>([]);
  const [availableImages, setAvailableImages] = useState<{ 
    id: number;
    url: string; 
    description: string;
    created_at: string;
    updated_at: string;
  }[]>([]);
  const [showImages, setShowImages] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('case-history');
    if (stored) {
      try {
        const history = JSON.parse(stored);
        setTimelineNodes(history.map((item: any, index: number) => ({
          id: `node-${index}`,
          data: {
            prompt: item.prompt,
            timestamp: item.timestamp || Date.now(),
            tags: ['主機外殼'],
            imageUrl: item.imageUrl || null
          }
        })));
      } catch (error) {
        console.error('Error parsing case history:', error);
      }
    }
  }, []);

  async function callPromptBooster(promptText: string, referenceImage?: File | null): Promise<string> {
    let referenceImageBase64: string | null = null;
  
    if (referenceImage) {
      referenceImageBase64 = await fileToBase64(referenceImage);
    }
  
    const body: any = {
      user_prompt: promptText,
      inspiration_image_ids: [],
      use_trends: true,
    };
  
    if (referenceImageBase64) {
      body.inspiration_images_base64 = [referenceImageBase64];
    }
  
    console.log('[DEBUG] Sending to API:', body); // 💬 Debugging log
  
    const response = await fetch('https://409etc6v1f.execute-api.us-west-2.amazonaws.com/promptbooster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  
    const data = await response.json();
    console.log('[DEBUG] API Response:', data); // 💬 Debugging log
    return data.boosted_prompt;
  }
  

  const handlePromptSubmit = async (promptText: string, original: string) => {
    setLoading(true);
    try {
      // Send both the prompt and the reference image (if available) to the API
      const boostedPrompt = await callPromptBooster(promptText, referenceImage);
  
      const newHistoryItem = {
        prompt: promptText,
        timestamp: Date.now(),
      };
  
      const stored = localStorage.getItem('case-history');
      const history = stored ? JSON.parse(stored) : [];
      history.push(newHistoryItem);
      localStorage.setItem('case-history', JSON.stringify(history));
  
      setTimelineNodes((prevNodes) => [
        ...prevNodes,
        {
          id: `node-${prevNodes.length}`,
          data: {
            prompt: promptText,
            timestamp: newHistoryItem.timestamp,
            tags: ['主機外殼'],
            imageUrl: null,
          },
        },
      ]);
  
      // Now pass reference image along with the boosted prompt
      navigate('/generator', {
        state: {
          productType: 'case',
          prompt: original,
          boostedPrompt: boostedPrompt,
          baseImage: baseImage ? URL.createObjectURL(baseImage) : null,
          referenceImage: referenceImage ? URL.createObjectURL(referenceImage) : null, // Send the reference image to generator
        },
      });
    } catch (error) {
      console.error('Error boosting prompt:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const openImageSelector = () => {
    navigate('/select-image');
  };

  const handleSelectImage = async (img: { 
    id: number;
    url: string; 
    description: string;
    created_at: string;
    updated_at: string;
  }) => {
    try {
      const response = await fetch(img.url);
      if (!response.ok) throw new Error('圖片載入失敗');
      const blob = await response.blob();
      const file = new File([blob], img.description + '.jpg', { type: blob.type });
      setBaseImage(file);
      setShowImages(false);
    } catch (error) {
      console.error('選擇圖片失敗', error);
      setImageError('選擇圖片失敗，請稍後再試');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'base' | 'reference') => {
    const file = event.target.files?.[0] || null;
    if (type === 'reference') {
      setReferenceImage(file);
    }
  };

  const handleTryLuck = () => {
    const luckyPrompts = [
      "設計一款簡約風格的中塔式機箱，前面板採用鋁合金材質，側板為強化玻璃",
      "打造一款RGB燈效豐富的遊戲機箱，支援360mm水冷",
      "創造一款極簡風格的ITX小型機箱，優化空間利用率與散熱",
      "設計一款未來科技感的開放式機箱，突顯內部組件"
    ];
    const randomPrompt = luckyPrompts[Math.floor(Math.random() * luckyPrompts.length)];
    setCurrentPrompt(randomPrompt);
    handlePromptSubmit(randomPrompt, randomPrompt);
  };

  return (
    <div className="home-container pb-24">
      <div className="content-container max-w-2xl mx-auto p-6">
        
        {/* 功能列 */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center text-black hover:text-gray-700">
            返回選擇
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate('/timeline', { state: { productType: 'case' } })} className="bg-purple-600 text-white px-4 py-2 rounded-lg">歷史記錄</button>
            <button onClick={() => navigate('/mindmap', { state: { productType: 'case' } })} className="bg-purple-600 text-white px-4 py-2 rounded-lg">心智圖</button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4 text-black">主機外殼設計</h1>

        {/* 試手氣按鈕 */}
        <div className="w-full flex justify-center mb-8">
          <button onClick={handleTryLuck} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-700 shadow-lg">
            試手氣
          </button>
        </div>

        {/* 輸入 Prompt */}
        <div className="bg-white border border-purple-200 rounded-xl p-4 mb-6 flex items-end space-x-2 shadow-lg">
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
                const boostedPrompt = await callPromptBooster(currentPrompt.trim());
                handlePromptSubmit(boostedPrompt, currentPrompt.trim());
              }
            }}
            placeholder="描述您理想中的主機外殼設計..."
            rows={1}
            className="flex-1 resize-none overflow-hidden bg-white text-gray-800 placeholder-purple-400 focus:outline-none"
            disabled={loading}
          />
          <button onClick={() => currentPrompt.trim() && handlePromptSubmit(currentPrompt.trim(), currentPrompt.trim())} disabled={loading || !currentPrompt.trim()} className="p-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 上傳圖片區塊 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          {/* Base Image 改成從資料庫選 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-md font-extrabold mb-3 text-black font-inter">選擇 Base Image</h3>

            <div className="flex items-center gap-2">
              <button
                onClick={openImageSelector}
                disabled={loadingImages}
                className="file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:bg-purple-50 file:text-purple-700
                          hover:file:bg-purple-100 text-sm py-2 px-4 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingImages ? '載入中...' : '從資料庫載入圖片'}
              </button>
              <div className="flex flex-col items-center gap-2">
              {baseImage ? (
                <span className="text-sm text-gray-500">{baseImage.name}</span>
              ) : (
                (() => {
                  const selectedImageUrl = localStorage.getItem('selectedBaseImageUrl');
                  if (selectedImageUrl) {
                    return (
                      <img 
                        src={selectedImageUrl} 
                        alt="選擇的 Base Image" 
                        className="w-32 h-32 object-contain rounded-lg"
                      />
                    );
                  } else {
                    return (
                      <span className="text-sm text-gray-500">未選擇任何圖片</span>
                    );
                  }
                })()
              )}
            </div>

            </div>

            {imageError && (
              <div className="mt-2 text-red-500 text-sm">{imageError}</div>
            )}

            {/* 只有在 showImages 時才展開圖片列表 */}
            {showImages && availableImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4 max-h-64 overflow-y-auto">
                {availableImages.map((img) => (
                  <div
                    key={img.id}
                    className="border rounded p-2 cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSelectImage(img)}
                  >
                    <img 
                      src={img.url} 
                      alt={img.description} 
                      className="w-full h-24 object-cover rounded"
                      onError={() => setImageError('圖片載入失敗')}
                    />
                    <div className="mt-2">
                      <p className="text-xs text-center truncate">{img.description}</p>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {new Date(img.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Reference Image 仍保留上傳 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-md font-extrabold mb-3 text-black font-inter">Upload Reference Image</h3>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'reference')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
          </div>

        </div>

        {/* Timeline 區 */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Chats in this project</h2>
          {timelineNodes.length > 0 ? (
            <div className="space-y-2">
              {timelineNodes.map((node, index) => (
                <div key={node.id || index} className="p-3 bg-white rounded-md hover:bg-purple-50 transition-colors shadow-lg">
                  <div className="flex items-start justify-between">
                    <div onClick={() => setCurrentPrompt(node.data.prompt)} className="flex items-start space-x-3 cursor-pointer flex-1">
                      {node.data.imageUrl && <img src={node.data.imageUrl} alt={node.data.prompt} className="w-12 h-12 object-cover rounded-md" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{node.data.prompt}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.data.tags?.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">{tag}</span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{new Date(node.data.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handlePromptSubmit(node.data.prompt, node.data.prompt)} className="ml-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors">
                      重新使用
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No history found yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CasePage;
