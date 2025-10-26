import React, { useRef, useState, useCallback } from 'react';

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedImageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, selectedImageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        if (event.dataTransfer.files[0].type.startsWith('image/')) {
            onImageSelect(event.dataTransfer.files[0]);
        }
    }
  }, [onImageSelect]);
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold leading-6 text-gray-100 mb-1">
        1. Upload Product
      </h3>
      <p className="text-sm text-gray-400 mb-4">Upload or drag and drop your product image.</p>
      
      <div 
        className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-gray-700/50' : 'border-gray-600 hover:border-blue-500'}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-1 text-center w-full">
          {selectedImageUrl ? (
            <img src={selectedImageUrl} alt="Product preview" className="mx-auto h-48 w-auto rounded-md object-contain" />
          ) : (
            <>
              <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
              <div className="flex text-sm text-gray-400">
                <p className="pl-1">Click to upload, or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUploader;