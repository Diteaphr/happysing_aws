import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Reuse the same gradient style
import ChatInput from '../components/ChatInput';

const PsuPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handlePromptSubmit = (promptText: string) => {
    setLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      navigate('/generator', { state: { productType: 'psu', prompt: promptText } });
      setLoading(false);
    }, 500);
  };

  const handleBackToSelection = () => {
    navigate('/');
  };

  return (
    <div className="home-container pb-24">
      <div className="content-container max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBackToSelection}
            className="flex items-center text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回選擇
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-white">電源供應器設計</h1>
        
        <div className="mb-12">
          <p className="text-gray-300 mb-4">
            歡迎使用 Cooler Master AI 設計助手。請描述您理想中的電源供應器設計，越詳細越好。您可以包含以下細節：
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>瓦數需求 (550W、650W、750W等)</li>
            <li>模組化程度 (全模組、半模組或非模組)</li>
            <li>效能認證 (80+ 白牌、銅牌、金牌等)</li>
            <li>線材管理偏好</li>
            <li>噪音級別</li>
            <li>外觀設計偏好</li>
          </ul>
        </div>
      </div>
      
      <ChatInput 
        onSubmit={handlePromptSubmit} 
        placeholder="描述您理想中的電源供應器設計..." 
        loading={loading}
      />
    </div>
  );
};

export default PsuPage; 