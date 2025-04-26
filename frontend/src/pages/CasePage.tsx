import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Reuse the same gradient style
import ChatInput from '../components/ChatInput';
import { LightBulbIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Timeline } from '../components/Timeline';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';


const CasePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [timelineNodes, setTimelineNodes] = useState<any[]>([]);
  
  // Load any existing nodes from localStorage
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
  
  async function callPromptBooster(promptText: string): Promise<string> {
    const response = await fetch('https://409etc6v1f.execute-api.us-west-2.amazonaws.com/promptbooster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_prompt: promptText,
        inspiration_image_ids: [],
        use_trends: true
      })
    });
  
    const data = await response.json();
    console.log('[DEBUG] API Response:', data);  // <-- add this to see what API really returns
    
    const boostedPrompt = data.boosted_prompt;   // <-- NO MORE JSON.parse(data.body)
  
    return boostedPrompt;
  }
  
  
  const handlePromptSubmit = async (promptText: string, original: string) => {
    setLoading(true);
  
    try {
      const boostedPrompt = await callPromptBooster(promptText);
  
      const newHistoryItem = {
        prompt: promptText,   // 👈 still user prompt
        timestamp: Date.now()
      };
  
      const stored = localStorage.getItem('case-history');
      const history = stored ? JSON.parse(stored) : [];
      history.push(newHistoryItem);
      localStorage.setItem('case-history', JSON.stringify(history));
  
      setTimelineNodes(prevNodes => [
        ...prevNodes,
        {
          id: `node-${prevNodes.length}`,
          data: {
            prompt: promptText,
            timestamp: newHistoryItem.timestamp,
            tags: ['主機外殼'],
            imageUrl: null
          }
        }
      ]);
  
      // ⬇️ navigate with both
      navigate('/generator', { 
        state: { 
          productType: 'case', 
          prompt: original,         // user input
          boostedPrompt: boostedPrompt, // AI boosted
          baseImage: baseImage ? URL.createObjectURL(baseImage) : null,
          referenceImage: referenceImage ? URL.createObjectURL(referenceImage) : null
        } 
      });
    } catch (error) {
      console.error('Error boosting prompt:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleBackToSelection = () => {
    navigate('/');
  };

  const handleOpenMindmap = () => {
    navigate('/mindmap', { state: { productType: 'case' } });
  };
  
  const handleOpenTimeline = () => {
    navigate('/timeline', { state: { productType: 'case' } });
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'base' | 'reference') => {
    const file = event.target.files?.[0] || null;
    if (type === 'base') {
      setBaseImage(file);
    } else {
      setReferenceImage(file);
    }
  };

  const handleNodeSelect = (node: any) => {
    setCurrentPrompt(node.data.prompt);
    // Optionally, you could auto-submit this prompt
    // handlePromptSubmit(node.data.prompt);
  };

  return (
    <div className="home-container pb-24">
      <div className="content-container max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBackToSelection}
            className="flex items-center text-black hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回選擇
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleOpenTimeline}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ClockIcon className="w-5 h-5 mr-2" />
              歷史記錄
            </button>
            <button
              onClick={handleOpenMindmap}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <LightBulbIcon className="w-5 h-5 mr-2" />
              心智圖
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4 text-black">主機外殼設計</h1>
        
        {/* Banner button for "Try Your Luck" */}
        <div className="w-full flex justify-center mb-8">
          <button
            onClick={handleTryLuck}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            試手氣
          </button>
        </div>
{/* ——— New ChatGPT-style Input ——— */}
<div className="bg-white border border-purple-200 rounded-xl p-4 mb-6 flex items-end space-x-2 shadow-lg">
  <textarea
    value={currentPrompt}
    onChange={e => {
      setCurrentPrompt(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }}
    onKeyDown={async (e) => {
      if (e.key === 'Enter' && !e.shiftKey && currentPrompt.trim()) {
        //e.preventDefault();
        //handlePromptSubmit(currentPrompt.trim());
        e.preventDefault();
        const boostedPrompt = await callPromptBooster(currentPrompt.trim());
        handlePromptSubmit(boostedPrompt, currentPrompt.trim()); // <-- now pass boosted prompt here!
      }
    }}
    placeholder="描述您理想中的散熱器設計..."
    rows={1}
    className="
      flex-1 resize-none overflow-hidden 
      bg-white text-gray-800 placeholder-purple-400 
      focus:outline-none
    "
    disabled={loading}
  />

  <button
    onClick={() => currentPrompt.trim() && handlePromptSubmit(currentPrompt.trim(), currentPrompt.trim())}
    disabled={loading || !currentPrompt.trim()}
    className={`
      p-2 rounded-md transition
      ${currentPrompt.trim()
        ? 'bg-purple-600 hover:bg-purple-700 text-white'
        : 'bg-purple-100 text-purple-300 cursor-not-allowed'}
    `}
  >
    <PaperAirplaneIcon className="w-5 h-5" />
  </button>
</div>

        
        {/* Upload Image Sections */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-md font-extrabold mb-3 text-black font-inter">Upload Base Image</h3>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'base')}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
            {baseImage && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Selected: {baseImage.name}</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-md font-extrabold mb-3 text-black font-inter">Upload Reference Image</h3>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'reference')}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
            {referenceImage && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Selected: {referenceImage.name}</p>
              </div>
            )}
          </div>
        </div>
        
{/* ——— Timeline Section ——— */}
<div className="bg-white rounded-lg shadow-lg p-4">
  <h2 className="text-lg font-semibold mb-4 text-gray-900">Chats in this project</h2>
  {timelineNodes.length > 0 ? (
    <div className="space-y-2">
      {timelineNodes.map((node, index) => (
        <div
          key={node.id || index}
          className="p-3 bg-white rounded-md hover:bg-purple-50 transition-colors shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div
              onClick={() => handleNodeSelect(node)}
              className="flex items-start space-x-3 cursor-pointer flex-1"
            >
              {node.data.imageUrl && (
                <img
                  src={node.data.imageUrl}
                  alt={node.data.prompt}
                  className="w-12 h-12 object-cover rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{node.data.prompt}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {node.data.tags?.map((tag: string, tagIdx: number) => (
                    <span
                      key={tagIdx}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(node.data.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePromptSubmit(node.data.prompt, node.data.prompt)}
              className="ml-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
            >
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