import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MindmapNode } from './Mindmap';

interface NodeEditorProps {
  node: MindmapNode;
  onUpdate: (node: MindmapNode) => void;
  onClose: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onUpdate, onClose }) => {
  const [prompt, setPrompt] = useState(node.data.prompt);
  const [tags, setTags] = useState(node.data.tags.join(', '));
  const [imageUrl, setImageUrl] = useState(node.data.imageUrl);

  // 當節點改變時更新表單
  useEffect(() => {
    setPrompt(node.data.prompt);
    setTags(node.data.tags.join(', '));
    setImageUrl(node.data.imageUrl);
  }, [node]);

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedNode: MindmapNode = {
      ...node,
      data: {
        ...node.data,
        prompt: prompt.trim(),
        tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        imageUrl: imageUrl.trim(),
      },
    };
    onUpdate(updatedNode);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Edit Node</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prompt
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Image URL
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}; 