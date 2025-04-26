import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ImageData {
  url: string;
  description: string;
}

const SelectImagePage: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/images')  // 確保網址正確
      .then(res => res.json())
      .then(data => {
        setImages(data);  // 👈 不篩選，直接全部放進來
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6 text-black">選擇 Base Image</h1>

      <div className="w-full overflow-x-auto">
        <div className="flex gap-4 px-4">
          {images.map((img, idx) => (
            <div key={idx} className="flex flex-col items-center bg-purple-50 border border-purple-200 rounded-lg p-2 shadow hover:shadow-lg transition min-w-[140px]">
              <img src={img.url} alt={img.description} className="w-28 h-20 object-cover rounded mb-2" />
              <span className="text-xs text-gray-700 text-center">{img.description}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-8 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        返回
      </button>
    </div>
  );
};

export default SelectImagePage;
