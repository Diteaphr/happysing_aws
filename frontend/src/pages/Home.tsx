import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css'; // Import CSS file for the gradient styling

interface LocationState {
  selectedProduct?: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [selectedProduct, setSelectedProduct] = useState<string>(state?.selectedProduct || '');
  const [prompt, setPrompt] = useState<string>('');

  const productTypes = [
    { id: 'case', name: '主機外殼' },
    { id: 'cooler', name: '散熱器' },
    { id: 'psu', name: '電源供應器' },
    { id: 'furniture', name: '遊戲家具' },
  ];

  useEffect(() => {
    if (state?.selectedProduct) {
      setSelectedProduct(state.selectedProduct);
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && prompt) {
      navigate('/generator', { state: { productType: selectedProduct, prompt } });
    }
  };

  const handleBackToSelection = () => {
    navigate('/');
  };

  return (
    <div className="home-container">
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

        <h1 className="text-3xl font-bold text-center mb-8 text-white">AI 輔助設計平台</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="productType" className="block text-sm font-medium text-white mb-2">
              產品類型
            </label>
            <select
              id="productType"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white"
              required
            >
              <option value="">請選擇產品類型</option>
              {productTypes.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2">
              設計描述
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white"
              rows={4}
              placeholder="請描述您想要的設計風格、特點..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            開始生成設計
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home; 