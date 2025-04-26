import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css'; // Import CSS file for the styling

interface LocationState {
  selectedProduct?: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [selectedProduct, setSelectedProduct] = useState<string>(state?.selectedProduct || '');

  const productTypes = [
    { id: 'case', name: '主機外殼', description: '設計創新的電腦主機外殼' },
    { id: 'cooler', name: '散熱器', description: '打造高效能與美觀的散熱解決方案' },
    { id: 'psu', name: '電源供應器', description: '設計可靠與高效的電源模組' },
    { id: 'furniture', name: '遊戲家具', description: '創造舒適與人體工學的遊戲空間' },
  ];

  useEffect(() => {
    if (state?.selectedProduct) {
      setSelectedProduct(state.selectedProduct);
    }
  }, [state]);

  const handleProductSelect = (productId: string) => {
    navigate(`/${productId}`, { state: { selectedProduct: productId } });
  };

  return (
    <div className="home-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="tagline-container py-14 mb-8">
          <p className="tagline-first">不要只接受平凡的設計。</p>
          <h1 className="tagline-second">創造 <span className="font-normal italic">非凡</span> 。</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {productTypes.map((product) => (
            <div key={product.id} className="product-card">
              <h2 className="product-title">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <button 
                className="action-button"
                onClick={() => handleProductSelect(product.id)}
              >
                開始設計 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 