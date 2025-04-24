import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Reuse the same gradient style
import ChatInput from '../components/ChatInput';
import { LightBulbIcon, ClockIcon } from '@heroicons/react/24/outline';

const CoolerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handlePromptSubmit = (promptText: string) => {
    setLoading(true);

    // First save the prompt to mindmap
    const saveToMindmap = async () => {
      try {
        console.log('Fetching existing nodes...');
        // Fetch existing nodes to get the root node
        const response = await fetch('http://localhost:3001/api/nodes');
        if (!response.ok) {
          throw new Error(`Failed to fetch nodes: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched nodes:', data);
        const nodes = data.nodes || [];
        
        // Create new node data
        const newNode = {
          id: Math.random().toString(),
          type: 'custom',
          position: { 
            x: nodes.length > 0 ? nodes[0].position.x : 0,
            y: nodes.length > 0 ? nodes[0].position.y + 100 : 100
          },
          data: {
            prompt: promptText,
            tags: ['input'],
            imageUrl: '',
            source: 'user',
            timestamp: Date.now(),
          },
        };

        // If we have a root node, create an edge
        const newEdge = nodes.length > 0 ? {
          id: `e${nodes[0].id}-${newNode.id}`,
          source: nodes[0].id,
          target: newNode.id,
        } : null;

        const payload = {
          node: newNode,
          edge: newEdge,
        };
        console.log('Saving new node and edge:', payload);

        // Save the new node and edge
        const saveResponse = await fetch('http://localhost:3001/api/nodes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!saveResponse.ok) {
          throw new Error(`Failed to save node: ${saveResponse.status} ${saveResponse.statusText}`);
        }

        const savedData = await saveResponse.json();
        console.log('Successfully saved:', savedData);
      } catch (error) {
        console.error('Error in saveToMindmap:', error);
        // Continue with navigation even if saving fails
      }
    };

    // Execute the save operation and then navigate
    saveToMindmap()
      .then(() => {
        console.log('Save operation completed, navigating...');
      })
      .catch((error) => {
        console.error('Final error in save operation:', error);
      })
      .finally(() => {
        navigate('/generator', { 
          state: { 
            productType: 'cooler', 
            prompt: promptText 
          } 
        });
        setLoading(false);
      });
  };

  const handleBackToSelection = () => {
    navigate('/');
  };

  const handleOpenMindmap = () => {
    navigate('/mindmap', { state: { productType: 'cooler' } });
  };

  const handleOpenTimeline = () => {
    navigate('/timeline', { state: { productType: 'cooler' } });
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
      </div>
      
      <ChatInput 
        onSubmit={handlePromptSubmit} 
        placeholder="描述您理想中的散熱器設計..." 
        loading={loading}
      />
    </div>
  );
};

export default CoolerPage; 