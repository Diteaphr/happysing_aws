import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <div className="cm-header">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="mr-8">
            <img src="/cm-logo.png" alt="Cooler Master" className="h-8" />
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <div className="relative group">
              <button className="px-2 py-1 text-white hover:text-purple-300 focus:outline-none">
                產品 <span className="ml-1">▼</span>
              </button>
            </div>
            
            <div className="relative group">
              <button className="px-2 py-1 text-white hover:text-purple-300 focus:outline-none">
                Builder's Zone <span className="ml-1">▼</span>
              </button>
            </div>
            
            <div className="relative group">
              <button className="px-2 py-1 text-white hover:text-purple-300 focus:outline-none">
                軟體 <span className="ml-1">▼</span>
              </button>
            </div>
            
            <div className="relative group">
              <button className="px-2 py-1 text-white hover:text-purple-300 focus:outline-none">
                支援 <span className="ml-1">▼</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="p-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 