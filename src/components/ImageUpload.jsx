import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { uploadAPI, plantAPI, handleAPIError } from '../utils/api';
import { useChat } from '../contexts/ChatContext';

const ImageUpload = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { currentChatId, addMessage, createChat } = useChat();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Upload the file
      const uploadResult = await uploadAPI.uploadFile(file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Ensure we have a chat to add messages to
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await createChat('Plant Identification');
        chatId = newChat.id;
      }

      // Add user message with image
      await addMessage(chatId, {
        sender: 'user',
        type: 'image',
        content: uploadResult.file_url
      });

      setUploading(false);
      setIdentifying(true);

      // Get user's location for better identification (optional)
      let latitude = null;
      let longitude = null;
      
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch (geoError) {
        console.log('Geolocation not available or denied');
      }

      // Identify the plant
      const plantResult = await plantAPI.identifyPlant(uploadResult.file_url, latitude, longitude);

      // Add assistant response with plant identification
      await addMessage(chatId, {
        sender: 'assistant',
        type: 'plant_result',
        content: plantResult
      });

      setIdentifying(false);
      onClose();

    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      setUploading(false);
      setIdentifying(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleCameraCapture = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={uploading || identifying}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Upload Plant Image
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {(uploading || identifying) && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-blue-600 dark:text-blue-400">
              {uploading ? 'Uploading image...' : 'Identifying plant...'}
            </p>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600'
          } ${uploading || identifying ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag and drop your plant image here
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or choose from the options below
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || identifying}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload size={20} />
            Upload File
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading || identifying}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Camera size={20} />
            Take Photo
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Supported formats: JPEG, PNG, GIF, WebP (max 16MB)
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;

