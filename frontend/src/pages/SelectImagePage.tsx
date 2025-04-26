import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ImageData {
  url: string;
  description: string;
}

const SelectImagePage: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/images')
      .then(res => res.json())
      .then(data => {
        setImages(data);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }, []);

  const handleImageClick = (url: string) => {
    setSelectedUrl(url);
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      localStorage.setItem('selectedBaseImageUrl', selectedUrl); // ✅ 儲存圖片 URL
      navigate('/case'); // ✅ 按確認後跳回 CasePage
    } else {
      alert('請先選一張圖片喔！');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6 text-black">選擇 Base Image</h1>

      <div className="w-full overflow-x-auto">
        <div className="flex gap-4 px-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center border rounded-lg p-2 shadow min-w-[140px] cursor-pointer
                ${selectedUrl === img.url ? 'border-blue-500' : 'bg-purple-50 border-purple-200'}`}
              onClick={() => handleImageClick(img.url)}
            >
              <img src={img.url} alt={img.description} className="w-28 h-20 object-cover rounded mb-2" />
              <span className="text-xs text-gray-700 text-center">{img.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 確認選擇 */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          確認
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          返回
        </button>
      </div>
    </div>
  );
};

export default SelectImagePage;
