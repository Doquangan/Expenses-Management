import React, { useState, useRef, useCallback } from 'react';
import { CameraIcon, CloseIcon, ScanIcon } from './Icons';
import './ImageEditor.css';

const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.7;

function ImageEditor({ image, onImageChange, onScanOCR, isScanning }) {
  const [textOverlay, setTextOverlay] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Compress and convert image to base64
  const compressImage = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          resolve(base64);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressImage(file);
    onImageChange(base64);
    setTextOverlay('');
    setShowTextInput(false);
  };

  const applyTextOverlay = () => {
    if (!image || !textOverlay.trim()) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Semi-transparent background strip
      const fontSize = Math.max(16, img.width * 0.05);
      ctx.font = `bold ${fontSize}px Arial`;
      const textWidth = ctx.measureText(textOverlay).width;
      const padding = 16;
      const bgHeight = fontSize + padding * 2;
      const bgY = img.height - bgHeight - 20;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.roundRect(
        (img.width - textWidth) / 2 - padding,
        bgY,
        textWidth + padding * 2,
        bgHeight,
        8
      );
      ctx.fill();

      // White text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textOverlay, img.width / 2, bgY + bgHeight / 2);

      const result = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      onImageChange(result);
      setShowTextInput(false);
      setTextOverlay('');
    };
    img.src = image;
  };

  const removeImage = () => {
    onImageChange(null);
    setTextOverlay('');
    setShowTextInput(false);
  };

  return (
    <div className="image-editor">
      {!image ? (
        <div className="image-upload-area">
          <div className="upload-buttons">
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon size={18} />
              <span>Upload Image</span>
            </button>
            <button
              type="button"
              className="upload-btn camera-btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              <CameraIcon size={18} />
              <span>Take Photo</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="image-preview-area">
          <div className="image-preview-wrapper">
            <img src={image} alt="Preview" className="image-preview" />
            <button type="button" className="image-remove-btn" onClick={removeImage}>
              <CloseIcon size={14} />
            </button>
          </div>

          <div className="image-actions">
            {!showTextInput ? (
              <button
                type="button"
                className="img-action-btn"
                onClick={() => setShowTextInput(true)}
              >
                Aa Add Text
              </button>
            ) : (
              <div className="text-overlay-input">
                <input
                  type="text"
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="Type text on image... (e.g. -20k)"
                  onKeyDown={(e) => e.key === 'Enter' && applyTextOverlay()}
                  autoFocus
                />
                <button type="button" className="img-action-btn apply" onClick={applyTextOverlay}>
                  Apply
                </button>
                <button
                  type="button"
                  className="img-action-btn cancel"
                  onClick={() => { setShowTextInput(false); setTextOverlay(''); }}
                >
                  Cancel
                </button>
              </div>
            )}

            {onScanOCR && (
              <button
                type="button"
                className="img-action-btn scan-btn"
                onClick={onScanOCR}
                disabled={isScanning}
              >
                <ScanIcon size={15} />
                {isScanning ? 'Scanning...' : 'AI Scan'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageEditor;
