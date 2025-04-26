import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Generator from './pages/Generator';
import ProductSelection from './pages/ProductSelection';
import CasePage from './pages/CasePage';
import CoolerPage from './pages/CoolerPage';
import PsuPage from './pages/PsuPage';
import FurniturePage from './pages/FurniturePage';
import MindmapPage from './pages/MindmapPage';
import TimelinePage from './pages/TimelinePage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#121212]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/case" element={<CasePage />} />
          <Route path="/cooler" element={<CoolerPage />} />
          <Route path="/psu" element={<PsuPage />} />
          <Route path="/furniture" element={<FurniturePage />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/mindmap" element={<MindmapPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 