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
  boostedPrompt?: string;
  baseImage?: string | null;
  referenceImage?: string | null;
}

async function callPromptBooster(promptText: string): Promise<string> {
  try {
    const response = await fetch('https://409etc6v1f.execute-api.us-west-2.amazonaws.com/promptbooster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_prompt: promptText,
        inspiration_image_ids: [],
        use_trends: true
      })
    });

    const data = await response.json();
    console.log('[DEBUG] API Response:', data);  // 便於調試 API 響應
    
    const boostedPrompt = data.boosted_prompt;   // 直接獲取 boosted_prompt，不需要 JSON.parse(data.body)
    
    return boostedPrompt;
  } catch (error) {
    console.log('Prompt booster API failed, using fallback enhancement:', error);
    
    // 失敗時的備用方案
    const enhancedPrompt = `${promptText}\n\n額外考慮要點：
- 散熱效能最佳化
- 材質選擇與工藝品質
- 噪音控制
- 安裝便利性
- 美觀設計
- 兼容性與未來擴充`;

    return enhancedPrompt;
  }
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

  // 獲取用戶上傳的圖片
  const baseImage = state?.baseImage || null;
  const referenceImage = state?.referenceImage || null;

  // Mock images for demonstration
  const mockImages = [
    '/assets/design1.jpg',
    '/assets/design1.jpg',
    '/assets/design1.jpg'
  ];

  useEffect(() => {
    if (!state?.prompt) {
      const storedState = localStorage.getItem('generator-last-state');
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          if (parsedState && parsedState.prompt) {
            console.log('Restored state from localStorage:', parsedState);
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
      console.log('No valid state found, redirecting to home');
      navigate('/');
      return;
    }
  
    try {
      localStorage.setItem('generator-last-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  
    // 設置原始提示詞
    if (state.boostedPrompt) {
      setRefinedPrompt(state.boostedPrompt);
    } else {
      // 如果沒有已經優化的提示詞，則使用原始提示詞
      setRefinedPrompt(state.prompt);
    }
    
    setLoading(false);
    setShowMindmapButton(true);
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

  // 處理繼續按鈕點擊
  const handleContinue = () => {
    alert('繼續處理設計...');
    // 這裡可以加入繼續後的邏輯，比如導航到下一步或提交設計
  };

  // 在 AI 優化後提示詞部分之後添加手動重新優化的功能
  const handleReoptimizePrompt = async () => {
    setLoading(true);
    try {
      const boostedPrompt = await callPromptBooster(state.prompt);
      setRefinedPrompt(boostedPrompt);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      setRefinedPrompt(state.prompt); // 失敗時使用原始提示詞
    } finally {
      setLoading(false);
    }
  };

  if (!state?.prompt) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          onClick={handleBackToPrompt}
          className="flex items-center text-black hover:text-gray-700"
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

      <div className="flex flex-grow">
        {/* 左側部分 - 提示詞 */}
        <div className="w-1/2 bg-purple-600 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">Prompt Preview</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">原始提示詞</h2>
            <p className="text-white mb-6 p-4 bg-purple-700 bg-opacity-50 rounded-lg">{state.prompt}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">AI 優化後 提示詞</h2>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <p className="text-white">正在優化中...</p>
              </div>
            ) : (
              <p className="text-white p-4 bg-purple-700 bg-opacity-50 rounded-lg">{refinedPrompt}</p>
            )}
          </div>
          
          {/* 手動重新優化提示詞按鈕 */}
          <div className="text-center">
            <button
              onClick={handleReoptimizePrompt}
              disabled={loading}
              className="bg-white hover:bg-gray-100 text-purple-700 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "優化中..." : "重新優化提示詞"}
            </button>
          </div>
        </div>
        
        {/* 右側部分 - 圖片 */}
        <div className="w-1/2 bg-white p-8 overflow-y-auto">
          {/* Base Image 部分 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Base Image</h2>
            <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center">
              {baseImage ? (
                <img src={baseImage} alt="基礎圖片" className="max-h-64 max-w-full" />
              ) : (
                <div className="bg-gray-100 h-64 w-full flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">無基礎圖片</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Reference Image 部分 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Reference Image</h2>
            <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center">
              {referenceImage ? (
                <img src={referenceImage} alt="參考圖片" className="max-h-64 max-w-full" />
              ) : (
                <div className="bg-gray-100 h-32 w-full flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">無參考圖片</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Files from Coolermaster's Database */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">Files from Coolermaster's Database</h2>
            <ul className="list-disc pl-5">
              <li>Files from Coolermaster's Database</li>
            </ul>
          </div>
          
          {/* 模擬圖片展示區
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              {mockImages.map((img, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img src={img} alt={`設計 ${index + 1}`} className="w-full h-32 object-cover" />
                </div>
              ))}
            </div>
          </div> */}
          
          {/* 繼續按鈕 */}
          <div className="text-center">
            <button 
              onClick={handleContinue}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-lg text-xl transition-colors"
            >
              繼續
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;