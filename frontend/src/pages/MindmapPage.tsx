import React, { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mindmap, MindmapApi } from '../components/Mindmap';
import './Home.css';

// Extend Window interface to include our global API reference
declare global {
  interface Window {
    mindmapApiGlobal: MindmapApi | null;
  }
}

interface LocationState {
  productType: string;
  initialPrompt?: string;
}

// Ensure global API is not lost on hot reload in development
if (typeof window !== 'undefined') {
  if (!window.mindmapApiGlobal) {
    window.mindmapApiGlobal = null;
  }
}

// Create a global variable to store the API
let mindmapApi: MindmapApi | null = typeof window !== 'undefined' ? window.mindmapApiGlobal : null;

// Backup function to restore API if main reference is lost
const restoreApi = () => {
  if (typeof window !== 'undefined' && window.mindmapApiGlobal) {
    mindmapApi = window.mindmapApiGlobal;
    console.log('Restored mindmapApi from global reference');
    return true;
  }
  return false;
};

// Export a function to add nodes from anywhere
export const addNodeToMindmap = (prompt: string) => {
  console.log('addNodeToMindmap called with:', prompt);
  
  if (!mindmapApi && !restoreApi()) {
    console.log('mindmapApi is not available, storing in localStorage');
    // If mindmap is not ready, store the node in localStorage
    const stored = localStorage.getItem('mindmap-pending-nodes');
    const pending = stored ? JSON.parse(stored) : [];
    pending.push({
      prompt,
      timestamp: Date.now()
    });
    localStorage.setItem('mindmap-pending-nodes', JSON.stringify(pending));
    console.log('Updated pending nodes in localStorage:', pending);
    return false;
  }
  
  console.log('mindmapApi is available, adding node directly');
  try {
    mindmapApi?.addExternalNode(prompt);
    return true;
  } catch (error) {
    console.error('Error adding node directly:', error);
    // Fallback to localStorage if direct addition fails
    const stored = localStorage.getItem('mindmap-pending-nodes');
    const pending = stored ? JSON.parse(stored) : [];
    pending.push({
      prompt,
      timestamp: Date.now()
    });
    localStorage.setItem('mindmap-pending-nodes', JSON.stringify(pending));
    console.log('Fallback: Updated pending nodes in localStorage:', pending);
    return false;
  }
};

const MindmapPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Check for pending nodes at component mount
  useEffect(() => {
    const stored = localStorage.getItem('mindmap-pending-nodes');
    if (stored) {
      console.log('Found pending nodes on MindmapPage mount:', stored);
    }
  }, []);

  const handleBackToProduct = () => {
    if (state?.productType) {
      navigate(`/${state.productType}`);
    } else {
      navigate('/');
    }
  };

  const handleMindmapReady = useCallback((api: MindmapApi) => {
    console.log('Mindmap is ready, storing API reference');
    mindmapApi = api;
    
    // Also store in window for persistence across hot reloads
    if (typeof window !== 'undefined') {
      window.mindmapApiGlobal = api;
    }
    
    // Track which prompts we've processed to avoid duplicates
    const processedPrompts = new Set<string>();
    
    // Process initialPrompt from state if available
    if (state?.initialPrompt) {
      console.log('Processing initialPrompt from state:', state.initialPrompt);
      api.addExternalNode(state.initialPrompt);
      processedPrompts.add(state.initialPrompt);
    }
    
    // Process any pending nodes
    const stored = localStorage.getItem('mindmap-pending-nodes');
    if (stored) {
      try {
        const pending = JSON.parse(stored);
        console.log('Processing pending nodes:', pending);
        pending.forEach((node: { prompt: string; timestamp: number }) => {
          // Skip if we've already processed this prompt (including from initialPrompt)
          if (processedPrompts.has(node.prompt)) {
            console.log('Skipping duplicate pending node:', node.prompt);
            return;
          }
          
          console.log('Adding pending node:', node.prompt);
          api.addExternalNode(node.prompt);
          processedPrompts.add(node.prompt);
        });
        // Clear pending nodes
        localStorage.removeItem('mindmap-pending-nodes');
        console.log('Cleared pending nodes from localStorage');
      } catch (error) {
        console.error('Error processing pending nodes:', error);
      }
    }
  }, [state]);

  return (
    <div className="home-container">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBackToProduct}
            className="flex items-center text-black hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回產品頁面
          </button>
        </div>

        <div className="h-[calc(100vh-8rem)]">
          <Mindmap initialPrompt={state?.initialPrompt} onReady={handleMindmapReady} />
        </div>
      </div>
    </div>
  );
};

export default MindmapPage; 