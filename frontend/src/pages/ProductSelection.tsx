import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Add gradient background

interface ProductCard {
  id: string;
  name: string;
  description: string;
  color: string;
  path: string;
}

const ProductSelection: React.FC = () => {
  const navigate = useNavigate();

  const productCards: ProductCard[] = [
    {
      id: 'case',
      name: '主機外殼',
      description: '設計創新的電腦主機外殼',
      color: 'bg-white border-[1px] border-amber-600/30',
      path: '/case'
    },
    {
      id: 'cooler',
      name: '散熱器',
      description: '打造高效能與美觀的散熱解決方案',
      color: 'bg-white border-[1px] border-blue-600/30',
      path: '/cooler'
    },
    {
      id: 'psu',
      name: '電源供應器',
      description: '設計可靠與高效的電源模組',
      color: 'bg-white border-[1px] border-purple-600/30',
      path: '/psu'
    },
    {
      id: 'furniture',
      name: '遊戲家具',
      description: '創造舒適與人體工學的遊戲空間',
      color: 'bg-white border-[1px] border-rose-600/30',
      path: '/furniture'
    },
  ];

  const handleSelectProduct = (path: string) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <div className="text-xl font-bold flex items-center">
            <img src="/cm-logo.png" alt="Cooler Master" className="h-8 mr-2" />
            <span className="cm-purple mr-1">Design</span>
            <span className="text-black">AI</span>
          </div>
        </div>

        <div className="mb-16 text-left">
          <h2 className="text-black text-xl mb-2">不要只接受平凡的設計。</h2>
          <div className="flex flex-col md:flex-row items-start">
            <h1 className="text-5xl md:text-6xl font-bold mr-2 text-black">創造</h1>
            <h1 className="text-5xl md:text-6xl font-serif italic text-black">非凡。</h1>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productCards.map((product) => (
            <div 
              key={product.id} 
              className={`${product.color} rounded-lg p-8 flex flex-col justify-between min-h-[320px] transform transition-transform hover:scale-105 cursor-pointer shadow-lg`}
              onClick={() => handleSelectProduct(product.path)}
            >
              <div>
                <h2 className="text-4xl font-bold mb-4 text-black">{product.name}</h2>
                <p className="text-lg text-black">{product.description}</p>
              </div>
              <button className="mt-8 bg-purple-600 text-white py-2 px-4 rounded-md flex items-center justify-center">
                開始設計
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16 text-black">
          <p>由 Cooler Master AI 設計平台支援 © 2023</p>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection; 