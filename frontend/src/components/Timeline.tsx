import React from 'react';
import { MindmapNode } from './Mindmap';

interface TimelineProps {
  nodes: MindmapNode[];
  onSelectNode: (node: MindmapNode) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ nodes, onSelectNode }) => {
  // 按創建時間排序節點
  const sortedNodes = [...nodes].sort((a, b) => {
    return b.data.timestamp - a.data.timestamp;
  });

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-white">Timeline</h3>
      {sortedNodes.map((node) => (
        <div
          key={node.id}
          onClick={() => onSelectNode(node)}
          className="p-3 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-start space-x-3">
            {node.data.imageUrl && (
              <img
                src={node.data.imageUrl}
                alt={node.data.prompt}
                className="w-12 h-12 object-cover rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{node.data.prompt}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {node.data.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(node.data.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 