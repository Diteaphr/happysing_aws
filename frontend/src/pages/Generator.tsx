import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css'; // Import gradient styles
import { LightBulbIcon } from '@heroicons/react/24/outline';

// 定义选择工具类型
enum SelectionTool {
  RECTANGLE = 'rectangle',
  LASSO = 'lasso',
  NONE = 'none'
}

// 定义选择区域的接口
interface SelectionArea {
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: {x: number, y: number}[];
  type: SelectionTool;
}

interface LocationState {
  productType: string;
  prompt: string;
}

const Generator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [refinedPrompt, setRefinedPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showMindmapButton, setShowMindmapButton] = useState<boolean>(false);
  
  // Canvas相关状态
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<SelectionTool>(SelectionTool.NONE);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [lassoPoints, setLassoPoints] = useState<{x: number, y: number}[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Mock images for demonstration
  const mockImages = [
    '/assets/design1.jpg',
    '/assets/design1.jpg',
    '/assets/design1.jpg'
  ];

  useEffect(() => {
    // Try to restore from localStorage if state is missing
    if (!state?.prompt) {
      const storedState = localStorage.getItem('generator-last-state');
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          if (parsedState && parsedState.prompt) {
            console.log('Restored state from localStorage:', parsedState);
            // Use the location.state setter provided by react-router
            const loc = {
              ...location,
              state: parsedState
            };
            navigate(location.pathname, { 
              state: parsedState,
              replace: true 
            });
            return;
          }
        } catch (error) {
          console.error('Error restoring state from localStorage:', error);
        }
      }
      
      // If no valid state was found in localStorage, redirect to home
      console.log('No valid state found, redirecting to home');
      navigate('/');
      return;
    }

    // Save current state to localStorage for recovery
    try {
      localStorage.setItem('generator-last-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }

    const simulatePromptRefinement = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock refined prompt
      setRefinedPrompt(`${state.prompt} - 現代風格 - 鋁合金材質 - RGB燈效`);
      setLoading(false);
      
      // Show mindmap button after content is loaded
      setShowMindmapButton(true);
    };

    simulatePromptRefinement();
  }, [state, navigate, location.pathname]);

  // 选择图片后加载到Canvas
  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      loadImageToCanvas(selectedImage);
    }
  }, [selectedImage]);

  // 加载图片到Canvas
  const loadImageToCanvas = (src: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 设置Canvas尺寸与图片一致
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 清除Canvas并绘制图片
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // 保存图片引用
      imageRef.current = img;
    };
    img.src = src;
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    // 重置选区
    setSelectionArea(null);
    setActiveTool(SelectionTool.NONE);
  };

  const handleBackToPrompt = () => {
    // Navigate back to the appropriate product page based on the product type
    if (state?.productType) {
      navigate(`/${state.productType}`);
    } else {
      navigate('/');
    }
  };

  const handleViewMindmap = () => {
    navigate('/mindmap', { 
      state: { 
        productType: state?.productType || 'cooler',
        initialPrompt: state?.prompt
      }
    });
  };

  // Canvas 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === SelectionTool.NONE || !canvasRef.current) return;
    
    setIsSelecting(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    
    if (activeTool === SelectionTool.LASSO) {
      setLassoPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !canvasRef.current || !startPoint) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === SelectionTool.RECTANGLE) {
      drawSelectionPreview({
        x: startPoint.x,
        y: startPoint.y,
        width: x - startPoint.x,
        height: y - startPoint.y,
        type: SelectionTool.RECTANGLE
      });
    } else if (activeTool === SelectionTool.LASSO) {
      const newPoints = [...lassoPoints, { x, y }];
      setLassoPoints(newPoints);
      drawLassoPreview(newPoints);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !canvasRef.current || !startPoint) return;
    
    setIsSelecting(false);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === SelectionTool.RECTANGLE) {
      setSelectionArea({
        x: startPoint.x,
        y: startPoint.y,
        width: x - startPoint.x,
        height: y - startPoint.y,
        type: SelectionTool.RECTANGLE
      });
    } else if (activeTool === SelectionTool.LASSO && lassoPoints.length > 2) {
      // 闭合套索
      const closedPoints = [...lassoPoints, lassoPoints[0]];
      setLassoPoints(closedPoints);
      setSelectionArea({
        x: Math.min(...closedPoints.map(p => p.x)),
        y: Math.min(...closedPoints.map(p => p.y)),
        points: closedPoints,
        type: SelectionTool.LASSO
      });
    }
    
    redrawCanvas();
  };

  // 绘制矩形选择预览
  const drawSelectionPreview = (selection: SelectionArea) => {
    const canvas = canvasRef.current;
    if (!canvas || !selection.width || !selection.height) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 重绘原图
    redrawCanvas();
    
    // 绘制选择矩形
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    
    // 创建半透明遮罩
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
  };

  // 绘制套索选择预览
  const drawLassoPreview = (points: {x: number, y: number}[]) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 重绘原图
    redrawCanvas();
    
    // 绘制套索路径
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    
    // 如果点足够多，填充半透明遮罩
    if (points.length > 2) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fill();
    }
  };

  // 重绘Canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // 绘制当前选区
    if (selectionArea) {
      if (selectionArea.type === SelectionTool.RECTANGLE && selectionArea.width && selectionArea.height) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(selectionArea.x, selectionArea.y, selectionArea.width, selectionArea.height);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(selectionArea.x, selectionArea.y, selectionArea.width, selectionArea.height);
      } else if (selectionArea.type === SelectionTool.LASSO && selectionArea.points && selectionArea.points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(selectionArea.points[0].x, selectionArea.points[0].y);
        
        for (let i = 1; i < selectionArea.points.length; i++) {
          ctx.lineTo(selectionArea.points[i].x, selectionArea.points[i].y);
        }
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fill();
      }
    }
  };

  // 取消选择
  const cancelSelection = () => {
    setSelectionArea(null);
    setActiveTool(SelectionTool.NONE);
    redrawCanvas();
  };

  // 获取选区图像数据
  const getSelectionImageData = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectionArea) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    if (selectionArea.type === SelectionTool.RECTANGLE && selectionArea.width && selectionArea.height) {
      // 获取矩形区域的图像数据
      return ctx.getImageData(
        selectionArea.x, 
        selectionArea.y, 
        selectionArea.width, 
        selectionArea.height
      );
    } else if (selectionArea.type === SelectionTool.LASSO && selectionArea.points && selectionArea.points.length > 2) {
      // 对于套索，我们需要创建一个临时画布
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;
      
      // 计算包围盒
      const minX = Math.min(...selectionArea.points.map(p => p.x));
      const minY = Math.min(...selectionArea.points.map(p => p.y));
      const maxX = Math.max(...selectionArea.points.map(p => p.x));
      const maxY = Math.max(...selectionArea.points.map(p => p.y));
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      // 创建套索形状
      tempCtx.beginPath();
      tempCtx.moveTo(selectionArea.points[0].x - minX, selectionArea.points[0].y - minY);
      
      for (let i = 1; i < selectionArea.points.length; i++) {
        tempCtx.lineTo(selectionArea.points[i].x - minX, selectionArea.points[i].y - minY);
      }
      
      // 裁剪
      tempCtx.closePath();
      tempCtx.clip();
      
      // 绘制原图的选区部分
      tempCtx.drawImage(canvas, 
        minX, minY, width, height,  // 源矩形
        0, 0, width, height         // 目标矩形
      );
      
      // 获取图像数据
      return tempCtx.getImageData(0, 0, width, height);
    }
    
    return null;
  };

  // 处理编辑操作
  const handleEdit = async () => {
    if (!selectionArea || !editingPrompt.trim()) return;
    
    setIsProcessing(true);
    
    // 获取选区图像数据
    const imageData = getSelectionImageData();
    if (!imageData) {
      setIsProcessing(false);
      return;
    }
    
    // 将图像数据转为 Base64
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      setIsProcessing(false);
      return;
    }
    
    tempCtx.putImageData(imageData, 0, 0);
    const base64Image = tempCanvas.toDataURL('image/png');
    
    try {
      // 模拟AI处理
      console.log(`处理图像编辑，提示词："${editingPrompt}"`);
      console.log('选区信息:', selectionArea);
      console.log('图像数据宽度:', imageData.width, '高度:', imageData.height);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 在实际应用中，这里会向后端API发送请求
      // const response = await fetch('/api/edit-image', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     image: base64Image,
      //     prompt: editingPrompt,
      //     selectionType: selectionArea.type
      //   })
      // });
      // const result = await response.json();
      // const editedImageBase64 = result.editedImage;
      
      // 假设这是处理后的图像结果(模拟)
      // 为了演示，我们在这里简单修改原图像数据（增加亮度）
      const editedImageData = simpleImageEdit(imageData);
      
      // 应用编辑后的图像
      applyEditedImage(editedImageData);
      
      // 清除选区
      setSelectionArea(null);
      setEditingPrompt('');
      
      alert('图像编辑完成！');
    } catch (error) {
      console.error('图像编辑失败:', error);
      alert('图像编辑失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 简单的图像编辑模拟（增加亮度）
  const simpleImageEdit = (imageData: ImageData) => {
    const data = imageData.data.slice();
    
    // 增加亮度（简单处理）
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + 50);       // R
      data[i + 1] = Math.min(255, data[i + 1] + 50); // G
      data[i + 2] = Math.min(255, data[i + 2] + 50); // B
    }
    
    const newImageData = new ImageData(
      new Uint8ClampedArray(data), 
      imageData.width, 
      imageData.height
    );
    
    return newImageData;
  };

  // 将编辑后的图像应用到原画布
  const applyEditedImage = (editedImageData: ImageData) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectionArea) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (selectionArea.type === SelectionTool.RECTANGLE && selectionArea.width && selectionArea.height) {
      // 直接将编辑后的图像数据放回原位置
      ctx.putImageData(
        editedImageData, 
        selectionArea.x, 
        selectionArea.y
      );
    } else if (selectionArea.type === SelectionTool.LASSO && selectionArea.points && selectionArea.points.length > 2) {
      // 对于套索，需要使用临时画布
      const minX = Math.min(...selectionArea.points.map(p => p.x));
      const minY = Math.min(...selectionArea.points.map(p => p.y));
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = editedImageData.width;
      tempCanvas.height = editedImageData.height;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      // 放置编辑后的图像数据
      tempCtx.putImageData(editedImageData, 0, 0);
      
      // 保存当前画布状态
      ctx.save();
      
      // 创建剪切路径
      ctx.beginPath();
      ctx.moveTo(selectionArea.points[0].x, selectionArea.points[0].y);
      
      for (let i = 1; i < selectionArea.points.length; i++) {
        ctx.lineTo(selectionArea.points[i].x, selectionArea.points[i].y);
      }
      
      ctx.closePath();
      ctx.clip();
      
      // 绘制编辑后的图像
      ctx.drawImage(
        tempCanvas, 
        0, 0, tempCanvas.width, tempCanvas.height,
        minX, minY, tempCanvas.width, tempCanvas.height
      );
      
      // 恢复画布状态
      ctx.restore();
    }
    
    // 更新当前图像
    updateCurrentImage();
  };

  // 更新当前图像引用
  const updateCurrentImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    img.onload = () => {
      imageRef.current = img;
    };
  };

  if (!state?.prompt) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBackToPrompt}
            className="flex items-center text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回提示詞編輯
          </button>
          
          {showMindmapButton && (
            <button
              onClick={handleViewMindmap}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <LightBulbIcon className="w-5 h-5 mr-2" />
              查看心智圖
            </button>
          )}
        </div>

        <div className="product-card mb-6">
          <h2 className="text-xl font-bold mb-4 text-white">原始提示詞</h2>
          <p className="text-gray-300 mb-6">{state.prompt}</p>
          
          <h2 className="text-xl font-bold mb-4 text-white">AI 優化後的提示詞</h2>
          <p className="text-white">{refinedPrompt || '正在優化中...'}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">正在生成設計...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {mockImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden ${
                    selectedImage === imageUrl ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleImageSelect(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`設計方案 ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                    設計方案 {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {selectedImage && (
              <div className="product-card">
                <h2 className="text-xl font-bold mb-4 text-white">圖片編輯</h2>
                
                {/* 选择工具 */}
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-white">選取工具：</span>
                  <button
                    className={`px-4 py-2 rounded-md ${activeTool === SelectionTool.RECTANGLE ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setActiveTool(SelectionTool.RECTANGLE)}
                  >
                    矩形選取
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${activeTool === SelectionTool.LASSO ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    onClick={() => setActiveTool(SelectionTool.LASSO)}
                  >
                    套索選取
                  </button>
                  {selectionArea && (
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                      onClick={cancelSelection}
                    >
                      取消選取
                    </button>
                  )}
                </div>
                
                {/* Canvas 绘图区域 */}
                <div className="flex justify-center mb-4 overflow-auto">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-600 max-w-full max-h-[500px]"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ cursor: activeTool !== SelectionTool.NONE ? 'crosshair' : 'default' }}
                  />
                </div>
                
                {/* 编辑控制区域 */}
                {selectionArea && (
                  <div className="mb-4">
                    <div className="mb-3">
                      <label className="block text-white mb-2">編輯提示詞：</label>
                      <input
                        type="text"
                        value={editingPrompt}
                        onChange={(e) => setEditingPrompt(e.target.value)}
                        placeholder="描述您想要的修改效果"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                        disabled={isProcessing}
                      />
                    </div>
                    <button
                      onClick={handleEdit}
                      disabled={!editingPrompt.trim() || isProcessing}
                      className={`action-button w-full ${
                        !editingPrompt.trim() || isProcessing
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isProcessing ? '處理中...' : '編輯圖片'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Generator; 