import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Import CSS file for the styling

const Home: React.FC = () => {
  const navigate = useNavigate();

  const productTypes = [
    { 
      id: 'case', 
      name: 'PC CASES', 
      description: 'Innovation? Case solved.', 
      image: '/assets/pc-case.svg'
    },
    { 
      id: 'cooler', 
      name: 'COOLING', 
      description: 'Cool design with Cooling', 
      image: '/assets/cooler.svg'
    }
  ];

  const handleProductSelect = (productId: string) => {
    navigate(`/${productId}`, { state: { selectedProduct: productId } });
  };

  return (
    <div className="home-container">
      <div className="content-container">
        <div className="logo-container">
          <img src="/assets/logo.svg" alt="Logo" className="logo" />
        </div>
        
        <div className="tagline-container">
          <h1 className="tagline-main">
            <span className="tagline-black">CREATE </span>
            <span className="tagline-purple">UNORDINARY</span>
          </h1>
          <p className="tagline-subtitle">what do you want to create today?</p>
        </div>

        <div className="product-grid">
          {productTypes.map((product) => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductSelect(product.id)}
            >
              <h2 className="product-title">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <img 
                src={product.image} 
                alt={product.name} 
                className="product-image" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 