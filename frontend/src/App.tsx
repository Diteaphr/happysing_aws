import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// 或者如果您想繼續使用 BrowserRouter，請使用：
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductSelection from './pages/ProductSelection';
import CasePage from './pages/CasePage';
import CoolerPage from './pages/CoolerPage';
import PsuPage from './pages/PsuPage';
import FurniturePage from './pages/FurniturePage';
import Generator from './pages/Generator';
import MindmapPage from './pages/MindmapPage';
import TimelinePage from './pages/TimelinePage';
import CaseGeneratedPage from './pages/CaseGeneratedPage';
import Home from './pages/Home';
import SelectImagePage from './pages/SelectImagePage';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product-selection" element={<ProductSelection />} />
          <Route path="/case" element={<CasePage />} />
          <Route path="/cooler" element={<CoolerPage />} />
          <Route path="/psu" element={<PsuPage />} />
          <Route path="/furniture" element={<FurniturePage />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/mindmap" element={<MindmapPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/case-generated" element={<CaseGeneratedPage />} />
          <Route path="/select-image" element={<SelectImagePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;