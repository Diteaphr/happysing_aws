import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductCard {
  id: string;
  name: string;
  description: string;
  color: string;
}

const ProductSelection: React.FC = () => {
  const navigate = useNavigate();

  const productCards: ProductCard[] = [
    {
      id: 'case',
      name: '主機外殼',
      description: '設計創新的電腦主機外殼',
      color: 'from-amber-500 to-amber-700',
    },
    {
      id: 'cooler',
      name: '散熱器',
      description: '打造高效能與美觀的散熱解決方案',
      color: 'from-sky-400 to-blue-600',
    },
    {
      id: 'psu',
      name: '電源供應器',
      description: '設計可靠與高效的電源模組',
      color: 'from-indigo-500 to-purple-700',
    },
    {
      id: 'furniture',
      name: '遊戲家具',
      description: '創造舒適與人體工學的遊戲空間',
      color: 'from-rose-400 to-rose-600',
    },
  ];

  const handleSelectProduct = (productId: string) => {
    navigate('/home', { state: { selectedProduct: productId } });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <div className="text-xl font-bold flex items-center">
            <span className="text-purple-500 mr-1">CM</span>
            <span>Design AI</span>
          </div>
          <div>
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md">
              登入
            </button>
          </div>
        </div>

        <div className="mb-16 text-center">
          <h2 className="text-gray-400 text-xl mb-2">不要只接受平凡的設計。</h2>
          <div className="flex flex-col md:flex-row items-center justify-center">
            <h1 className="text-5xl md:text-6xl font-bold mr-2">創造</h1>
            <h1 className="text-5xl md:text-6xl font-serif italic">非凡。</h1>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productCards.map((product) => (
            <div 
              key={product.id} 
              className={`bg-gradient-to-br ${product.color} rounded-lg p-8 flex flex-col justify-between min-h-[320px] transform transition-transform hover:scale-105 cursor-pointer`}
              onClick={() => handleSelectProduct(product.id)}
            >
              <div>
                <h2 className="text-4xl font-bold mb-4">{product.name}</h2>
                <p className="text-lg">{product.description}</p>
              </div>
              <button className="mt-8 bg-black/20 hover:bg-black/40 py-2 px-6 rounded-full w-fit text-white font-bold flex items-center">
                開始設計
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16 text-gray-400">
          <p>由 Cooler Master AI 設計平台支援 © 2023</p>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection; 