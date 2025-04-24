import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  Handle,
  Position,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PlusIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { NodeEditor } from './NodeEditor';
import { Timeline } from './Timeline';

// 定義節點類型
export interface MindmapNode extends Node {
  data: {
    prompt: string;
    tags: string[];
    imageUrl: string;
    source: 'user' | 'ai';
    timestamp: number;
  };
}

// 自定義節點組件
const CustomNode = ({ id, data }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.prompt);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(data.prompt);
  }, [data.prompt]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== data.prompt) {
      data.onChange({ id, prompt: text });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200"
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} />
      {isEditing ? (
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-black focus:outline-none"
          autoFocus
        />
      ) : (
        <div className="text-black">{text}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// 定義節點類型
const nodeTypes = {
  custom: CustomNode,
};

// 定義 API 響應類型
interface ApiResponse {
  nodes: MindmapNode[];
  edges: Edge[];
}

// 初始節點
const initialNodes: MindmapNode[] = [
  {
    id: 'root',
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      prompt: '雙擊編輯文字',
      tags: ['root'],
      imageUrl: '',
      source: 'user',
      timestamp: Date.now(),
    },
  },
];

interface MindmapProps {
  initialPrompt?: string;
  onReady?: (api: MindmapApi) => void;
}

// Define the API interface
export interface MindmapApi {
  addExternalNode: (prompt: string) => void;
}

export const Mindmap: React.FC<MindmapProps> = ({ initialPrompt, onReady }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const initialPromptAddedRef = useRef(false);

  // Load nodes from localStorage with error recovery
  useEffect(() => {
    try {
      const savedNodes = localStorage.getItem('mindmap-nodes');
      const savedEdges = localStorage.getItem('mindmap-edges');
      
      if (savedNodes && savedEdges) {
        try {
          const parsedNodes = JSON.parse(savedNodes);
          const parsedEdges = JSON.parse(savedEdges);
          
          // Validate that we have valid arrays
          if (Array.isArray(parsedNodes) && Array.isArray(parsedEdges) && parsedNodes.length > 0) {
            console.log('Loading nodes and edges from localStorage:', parsedNodes.length, parsedEdges.length);
            setNodes(parsedNodes);
            setEdges(parsedEdges);
          } else {
            throw new Error('Invalid data structure');
          }
        } catch (error) {
          console.error('Error parsing data from localStorage:', error);
          console.log('Falling back to initial node');
          setNodes([initialNodes[0]]);
        }
      } else {
        console.log('No saved data found, using initial node');
        setNodes([initialNodes[0]]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setNodes([initialNodes[0]]);
    }
  }, [setNodes, setEdges]);

  // Save nodes to localStorage with error handling
  useEffect(() => {
    if (nodes.length > 0) {
      try {
        localStorage.setItem('mindmap-nodes', JSON.stringify(nodes));
        localStorage.setItem('mindmap-edges', JSON.stringify(edges));
        console.log('Saved nodes and edges to localStorage:', nodes.length, edges.length);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [nodes, edges]);

  // Create API object with enhanced error handling
  const addExternalNode = useCallback((prompt: string) => {
    try {
      console.log('Adding external node:', prompt);
      
      // Check if a node with this prompt already exists to prevent duplicates
      const existingNode = nodes.find(node => node.data.prompt === prompt);
      if (existingNode) {
        console.log('Node with this prompt already exists, not creating duplicate:', prompt);
        return;
      }
      
      // Find the root node or use the first node as root
      const rootNode = nodes.find(node => node.id === 'root') || nodes[0];
      if (!rootNode) {
        console.error('No root node found, creating one');
        const newRoot = initialNodes[0];
        setNodes([newRoot]);
        
        // Create the new node relative to the new root
        const newNode: MindmapNode = {
          id: Date.now().toString(), // Use timestamp for more unique IDs
          type: 'custom',
          position: { 
            x: newRoot.position.x + 200, // Offset to the right
            y: newRoot.position.y
          },
          data: {
            prompt,
            tags: ['external'],
            imageUrl: '',
            source: 'user',
            timestamp: Date.now(),
          },
        };
        
        const newEdge: Edge = {
          id: `e${newRoot.id}-${newNode.id}`,
          source: newRoot.id,
          target: newNode.id,
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
        
        // Save immediately to localStorage
        try {
          localStorage.setItem('mindmap-nodes', JSON.stringify([newRoot, newNode]));
          localStorage.setItem('mindmap-edges', JSON.stringify([newEdge]));
        } catch (saveError) {
          console.error('Error saving to localStorage:', saveError);
        }
        return;
      }

      // Find the last child node of the root to position the new node
      const lastChild = nodes
        .filter(node => edges.some(edge => edge.source === rootNode.id && edge.target === node.id))
        .sort((a, b) => a.position.y - b.position.y)
        .pop();

      const newNode: MindmapNode = {
        id: Date.now().toString(), // Use timestamp for more unique IDs
        type: 'custom',
        position: { 
          x: rootNode.position.x + 200, // Offset to the right
          y: lastChild ? lastChild.position.y + 100 : rootNode.position.y // Position below last child or at root level
        },
        data: {
          prompt,
          tags: ['external'],
          imageUrl: '',
          source: 'user',
          timestamp: Date.now(),
        },
      };
      
      const newEdge: Edge = {
        id: `e${rootNode.id}-${newNode.id}`,
        source: rootNode.id,
        target: newNode.id,
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);

      // Save immediately to localStorage
      try {
        const updatedNodes = [...nodes, newNode];
        const updatedEdges = [...edges, newEdge];
        localStorage.setItem('mindmap-nodes', JSON.stringify(updatedNodes));
        localStorage.setItem('mindmap-edges', JSON.stringify(updatedEdges));
      } catch (saveError) {
        console.error('Error saving to localStorage:', saveError);
      }
      
      console.log('Node added successfully:', newNode); // Debug log
    } catch (error) {
      console.error('Error adding external node:', error);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Expose API through onReady callback
  useEffect(() => {
    if (onReady) {
      onReady({
        addExternalNode,
      });
    }
  }, [onReady, addExternalNode]);

  // 從後端獲取節點數據
  const fetchNodes = useCallback(async () => {
    try {
      const response = await fetch('/api/nodes');
      const data: ApiResponse = await response.json();
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (error) {
      console.error('Error fetching nodes:', error);
      // If API fails, at least add a root node
      setNodes([initialNodes[0]]);
    }
  }, [setNodes, setEdges]);

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && !initialPromptAddedRef.current && nodes.length > 0) {
      const newNode: MindmapNode = {
        id: Math.random().toString(),
        type: 'custom',
        position: { 
          x: nodes[0].position.x,
          y: nodes[0].position.y + 100
        },
        data: {
          prompt: initialPrompt,
          tags: ['input'],
          imageUrl: '',
          source: 'user',
          timestamp: Date.now(),
        },
      };
      
      const newEdge: Edge = {
        id: `e${nodes[0].id}-${newNode.id}`,
        source: nodes[0].id,
        target: newNode.id,
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);
      initialPromptAddedRef.current = true;
    }
  }, [initialPrompt, nodes, setNodes, setEdges]);

  // 新增節點
  const addNode = useCallback((nodeData: Omit<MindmapNode['data'], 'timestamp'>) => {
    const newNode: MindmapNode = {
      id: Math.random().toString(),
      type: 'custom',
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 500 
      },
      data: {
        ...nodeData,
        timestamp: Date.now(),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // 自動延伸心智圖
  const autoExtendMindmap = useCallback(async () => {
    try {
      const response = await fetch('/api/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: nodes.map(node => ({
            id: node.id,
            data: node.data,
          })),
        }),
      });
      const newNodes: MindmapNode[] = await response.json();
      setNodes((nds) => [...nds, ...newNodes]);
    } catch (error) {
      console.error('Error extending mindmap:', error);
    }
  }, [nodes, setNodes]);

  // 處理節點點擊
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  // 處理邊的連接
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // 定時自動延伸
  useEffect(() => {
    const interval = setInterval(() => {
      autoExtendMindmap();
    }, 24 * 60 * 60 * 1000); // 每24小時執行一次

    return () => clearInterval(interval);
  }, [autoExtendMindmap]);

  // 初始載入數據
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // 更新節點
  const handleNodeUpdate = (updatedNode: MindmapNode) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
    setSelectedNode(null);
  };

  useEffect(() => {
    // Suppress ResizeObserver errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
        // Ignore ResizeObserver errors
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{ height: 'calc(100vh - 8rem)' }}
        className="bg-gray-900"
      >
        <Background color="#6b7280" gap={16} size={1} />
        <Controls className="bg-gray-800 border-gray-700" />
        <MiniMap 
          style={{ 
            backgroundColor: '#1f2937'
          }} 
          className="!bottom-24 !right-2"
        />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={() => addNode({
              prompt: '雙擊編輯文字',
              tags: [],
              imageUrl: '',
              source: 'user',
            })}
            className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`p-2 rounded-lg transition-colors ${
              showTimeline ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <ClockIcon className="w-5 h-5 text-white" />
          </button>
        </Panel>

        {showTimeline && (
          <Panel position="bottom-center" className="w-full max-w-4xl">
            <div className="bg-gray-800 rounded-lg shadow-lg">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Timeline</h3>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="h-64 overflow-y-auto p-4">
                <Timeline
                  nodes={nodes}
                  onSelectNode={(node: MindmapNode) => {
                    setSelectedNode(node);
                    setShowTimeline(false);
                  }}
                />
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* 節點編輯面板 */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-11/12 animate-fade-in">
            <NodeEditor
              node={selectedNode}
              onUpdate={handleNodeUpdate}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 