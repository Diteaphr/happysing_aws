import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Timeline } from '../components/Timeline';
import { MindmapNode } from '../components/Mindmap';
import './Home.css';

interface LocationState {
  productType: string;
}

const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [nodes, setNodes] = useState<MindmapNode[]>([]);

  useEffect(() => {
    // TODO: 從後端獲取節點數據
    // 這裡先用模擬數據
    const mockNodes: MindmapNode[] = [
      {
        id: '1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          prompt: '水冷散熱器設計',
          tags: ['水冷', '240mm', 'RGB'],
          imageUrl: '/mock-images/cooler1.jpg',
          source: 'user',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
        }
      },
      {
        id: '2',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
          prompt: '靜音風冷散熱器',
          tags: ['風冷', '140mm', '靜音'],
          imageUrl: '/mock-images/cooler2.jpg',
          source: 'ai',
          timestamp: Date.now()
        }
      }
    ];
    setNodes(mockNodes);
  }, []);

  const handleBackToProduct = () => {
    if (state?.productType) {
      navigate(`/${state.productType}`);
    } else {
      navigate('/');
    }
  };

  const handleNodeSelect = (node: MindmapNode) => {
    // TODO: 實現節點選擇邏輯
    console.log('Selected node:', node);
  };

  return (
    <div className="home-container min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBackToProduct}
            className="flex items-center text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回產品頁面
          </button>
          <h1 className="text-2xl font-bold text-white">設計歷史記錄</h1>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <Timeline 
            nodes={nodes}
            onSelectNode={handleNodeSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default TimelinePage; 