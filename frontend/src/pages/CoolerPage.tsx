import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Reuse the same gradient style
import ChatInput from '../components/ChatInput';
import { LightBulbIcon, ClockIcon } from '@heroicons/react/24/outline';
import { addNodeToMindmap } from './MindmapPage';

const CoolerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  
  // Load any pending prompts from localStorage for debugging
  useEffect(() => {
    const stored = localStorage.getItem('mindmap-pending-nodes');
    if (stored) {
      try {
        const pending = JSON.parse(stored);
        const promptTexts = pending.map((node: { prompt: string }) => node.prompt);
        setSavedPrompts(promptTexts);
        console.log('Pending nodes found:', pending);
      } catch (error) {
        console.error('Error parsing pending nodes:', error);
      }
    }
  }, []);
  
  // Add a function to navigate to generator with mindmap data
  const navigateToGenerator = (promptText: string) => {
    // Simply navigate to the generator page
    // The mindmap button will be displayed after loading is complete
    navigate('/generator', { 
      state: { 
        productType: 'cooler', 
        prompt: promptText 
      } 
    });
  };

  // Modify handlePromptSubmit to use the new navigation function
  const handlePromptSubmit = async (promptText: string) => {
    setCurrentPrompt(promptText);
    setLoading(true);
    
    try {
      console.log('Submitting prompt:', promptText);
      
      // Always add to local savedPrompts list for user feedback
      setSavedPrompts(prev => [...prev, promptText]);
      
      // Try to add the node to mindmap and store the result
      const nodeAdded = addNodeToMindmap(promptText);
      console.log('Node added result:', nodeAdded);
      
      // Double-check localStorage to ensure it was saved
      const stored = localStorage.getItem('mindmap-pending-nodes');
      const pendingNodes = stored ? JSON.parse(stored) : [];
      
      // Add the node to pending if it wasn't added directly and isn't already there
      if (!nodeAdded && !pendingNodes.some((node: any) => node.prompt === promptText)) {
        console.log("Node wasn't added directly, ensuring it's in localStorage");
        pendingNodes.push({
          prompt: promptText,
          timestamp: Date.now()
        });
        localStorage.setItem('mindmap-pending-nodes', JSON.stringify(pendingNodes));
      }
      
      // Show feedback to user
      if (nodeAdded) {
        // If the node was added directly to the mindmap, show a notification
        const userWantsToSeeMap = window.confirm('已添加到心智圖！您要查看心智圖嗎？');
        if (userWantsToSeeMap) {
          navigate('/mindmap', { 
            state: { 
              productType: 'cooler',
              initialPrompt: promptText
            }
          });
          return; // Don't continue to generator
        }
      } else {
        // If the node was stored for later, also show a notification
        alert('您的輸入已保存，將在心智圖頁面中顯示。');
      }
      
      // Continue with normal navigation to generator
      navigateToGenerator(promptText);
    } catch (error) {
      console.error('Error adding node to mindmap:', error);
      
      // Even if there's an error, try to save to localStorage as a fallback
      try {
        const stored = localStorage.getItem('mindmap-pending-nodes');
        const pendingNodes = stored ? JSON.parse(stored) : [];
        pendingNodes.push({
          prompt: promptText,
          timestamp: Date.now()
        });
        localStorage.setItem('mindmap-pending-nodes', JSON.stringify(pendingNodes));
        console.log('Saved to localStorage as fallback');
      } catch (storageError) {
        console.error('Failed to save to localStorage:', storageError);
      }
      
      // Still proceed with navigation even if there's an error
      navigateToGenerator(promptText);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    navigate('/');
  };

  const handleOpenMindmap = () => {
    // Pass the current prompt when opening mindmap, if available
    navigate('/mindmap', { 
      state: { 
        productType: 'cooler',
        initialPrompt: currentPrompt || undefined
      } 
    });
  };

  const handleOpenTimeline = () => {
    navigate('/timeline', { state: { productType: 'cooler' } });
  };

  // Add a function to directly add the current input to mindmap without navigating
  const handleAddToMindmap = () => {
    if (!currentPrompt) return;
    
    const nodeAdded = addNodeToMindmap(currentPrompt);
    console.log('Added to mindmap directly:', nodeAdded);
    
    // Show feedback to user
    alert('已添加到心智圖！');
  };

  return (
    <div className="home-container pb-24">
      <div className="content-container max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBackToSelection}
            className="flex items-center text-white hover:text-gray-200"
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

        <h1 className="text-3xl font-bold text-center mb-8 text-white">散熱器設計</h1>
        
        <div className="mb-12">
          <p className="text-gray-300 mb-4">
            歡迎使用 Cooler Master AI 設計助手。請描述您理想中的散熱器設計，越詳細越好。您可以包含以下細節：
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>散熱器類型 (風冷、水冷等)</li>
            <li>風扇類型和大小 (120mm、140mm等)</li>
            <li>散熱效能偏好</li>
            <li>噪音控制要求</li>
            <li>RGB 燈效偏好</li>
            <li>尺寸要求和安裝限制</li>
          </ul>
        </div>
        
        {/* Debug information - hidden in production */}
        {savedPrompts.length > 0 && (
          <div className="mb-4 p-4 bg-gray-800 rounded">
            <h3 className="text-white font-semibold mb-2">待處理的心智圖節點：</h3>
            <ul className="list-disc pl-6 text-gray-300">
              {savedPrompts.map((prompt, index) => (
                <li key={index}>{prompt}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Add button to directly add to mindmap */}
        {currentPrompt && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={handleAddToMindmap}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              添加當前輸入到心智圖
            </button>
          </div>
        )}
      </div>
      
      <ChatInput 
        onSubmit={handlePromptSubmit} 
        placeholder="描述您理想中的散熱器設計..." 
        loading={loading}
        onTextChange={setCurrentPrompt}
      />
    </div>
  );
};

export default CoolerPage; 