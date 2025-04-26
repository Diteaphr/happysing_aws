import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Reuse the same gradient style
import ChatInput from '../components/ChatInput';
import { LightBulbIcon, ClockIcon } from '@heroicons/react/24/outline';
import { addNodeToMindmap } from './MindmapPage';
import { Timeline } from '../components/Timeline';

const CoolerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [timelineNodes, setTimelineNodes] = useState<any[]>([]);
  
  // Load any pending prompts from localStorage for debugging
  useEffect(() => {
    const stored = localStorage.getItem('mindmap-pending-nodes');
    if (stored) {
      try {
        const pending = JSON.parse(stored);
        const promptTexts = pending.map((node: { prompt: string }) => node.prompt);
        setSavedPrompts(promptTexts);
        setTimelineNodes(pending.map((node: any, index: number) => ({
          id: `node-${index}`,
          data: {
            prompt: node.prompt,
            timestamp: node.timestamp || Date.now(),
            tags: ['散熱器'],
            imageUrl: node.imageUrl || null
          }
        })));
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
        prompt: promptText,
        baseImage: baseImage ? URL.createObjectURL(baseImage) : null,
        referenceImage: referenceImage ? URL.createObjectURL(referenceImage) : null
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

  const handleTryLuck = () => {
    const luckyPrompts = [
      "設計一款RGB燈效華麗的240mm一體式水冷散熱器，帶有ARGB風扇",
      "打造一款超薄型低噪音CPU散熱器，適合小型機箱",
      "創造一款黑色極簡風格的塔式風冷散熱器，強調性能與靜音",
      "設計一款具有未來感的360mm水冷散熱器，帶有LCD顯示屏"
    ];
    const randomPrompt = luckyPrompts[Math.floor(Math.random() * luckyPrompts.length)];
    setCurrentPrompt(randomPrompt);
    handlePromptSubmit(randomPrompt);
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

        <h1 className="text-3xl font-bold text-center mb-4 text-black">散熱器設計</h1>
        
        {/* Banner button for "Try Your Luck" */}
        <div className="w-full flex justify-center mb-8">
          <button
            onClick={handleTryLuck}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            試手氣
          </button>
        </div>
        
        {/* New Chat Input */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-extrabold mb-3 text-black font-inter">New chat in this project</h2>
          <ChatInput 
            onSubmit={handlePromptSubmit} 
            placeholder="描述您理想中的散熱器設計..." 
            loading={loading}
            onTextChange={setCurrentPrompt}
          />
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
        
        {/* Timeline Section */}
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-white">Chats in this project</h2>
          {timelineNodes.length > 0 ? (
            <div className="space-y-2">
              {timelineNodes.map((node, index) => (
                <div key={node.id || index} className="p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
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
                        <p className="text-sm text-white truncate">{node.data.prompt}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.data.tags && node.data.tags.map((tag: string, tagIdx: number) => (
                            <span
                              key={tagIdx}
                              className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(node.data.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePromptSubmit(node.data.prompt)}
                      className="ml-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      重新使用
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
          ) : (
            <p className="text-gray-400">No history found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoolerPage; 