import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RotateCw, RefreshCw } from 'lucide-react';

const PHASE = {
  CAMERA: 'CAMERA',
  REVIEW: 'REVIEW',
  CROP: 'CROP',
};

export default function TakePhoto({ isOpen, onClose, onUpload }) {
  const [currentPhase, setCurrentPhase] = useState(PHASE.CAMERA);
  const [stream, setStream] = useState(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');

  // Dragging states for positioning the image behind the crop circle
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPhase(PHASE.CAMERA);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setCapturedImg(null);
      setError('');
      const timer = setTimeout(() => startCamera(), 50);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    setError('');
    try {
      stopCamera(); 
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access your camera. Please check application permissions.");
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    const isUserFacing = stream?.getVideoTracks()[0]?.getSettings()?.facingMode === 'user';
    if (isUserFacing) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImg(dataUrl);
    stopCamera(); 
    setCurrentPhase(PHASE.REVIEW);
  };

  // --- Drag Mechanics (Mouse & Touch Hooks) ---
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // --- Precision Math Canvas Cropping ---
  const handleDoneCrop = () => {
    const img = new Image();
    img.src = capturedImg;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const cropSize = 500; // Final Output resolution size
      canvas.width = cropSize;
      canvas.height = cropSize;

      ctx.clearRect(0, 0, cropSize, cropSize);
      ctx.save();

      // Create a perfectly round clipping mask path on the canvas
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Find viewport scale differences to map display dragging accurately onto image pixels
      const viewWindow = containerRef.current.getBoundingClientRect();
      const circleDisplaySize = window.innerWidth < 768 ? 288 : 320; // Matches w-72 (288px) and md:w-80 (320px)

      // Establish base scaling factor based on covering the crop viewport container
      const scaleX = viewWindow.width / img.width;
      const scaleY = viewWindow.height / img.height;
      const baseScale = Math.max(scaleX, scaleY);

      const displayedWidth = img.width * baseScale;
      const displayedHeight = img.height * baseScale;

      // Translate canvas center to position calculations relatively
      ctx.translate(cropSize / 2, cropSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Convert UI drag offsets into exact source image pixels
      const finalScale = cropSize / circleDisplaySize;
      const renderX = (offset.x * finalScale) - (cropSize / 2);
      const renderY = (offset.y * finalScale) - (cropSize / 2);

      const drawWidth = displayedWidth * finalScale;
      const drawHeight = displayedHeight * finalScale;

      // Draw the image shifted by the user's drag positions
      ctx.drawImage(
        img, 
        renderX - (drawWidth - cropSize) / 2, 
        renderY - (drawHeight - cropSize) / 2, 
        drawWidth, 
        drawHeight
      );

      ctx.restore();

      const finalBase64 = canvas.toDataURL('image/jpeg', 0.95);
      
      if (typeof onUpload === 'function') {
        onUpload(finalBase64);
      }
      onClose();
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4">
      <div className="relative w-full h-full md:h-[85vh] md:max-w-125 bg-neutral-950 md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col justify-between border border-neutral-900">
        
        {/* Absolute Header Area */}
        <div className="absolute top-0 inset-x-0 h-16 bg-linear-to-b from-black/80 to-transparent flex items-center justify-between px-5 z-30 pointer-events-none">
          <span className="text-neutral-200 font-semibold text-sm tracking-wider uppercase pointer-events-auto">
            {currentPhase === PHASE.CAMERA && "Camera"}
            {currentPhase === PHASE.REVIEW && "Preview Frame"}
            {currentPhase === PHASE.CROP && "Drag to Center"}
          </span>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full cursor-pointer bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800 transition-colors pointer-events-auto"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Viewport Panel Wrapper */}
        <div 
          ref={containerRef}
          className="flex-1 w-full relative flex items-center justify-center bg-neutral-950 overflow-hidden select-none touch-none"
          onMouseDown={currentPhase === PHASE.CROP ? handlePointerDown : undefined}
          onMouseMove={currentPhase === PHASE.CROP ? handlePointerMove : undefined}
          onMouseUp={currentPhase === PHASE.CROP ? handlePointerUp : undefined}
          onMouseLeave={currentPhase === PHASE.CROP ? handlePointerUp : undefined}
          onTouchStart={currentPhase === PHASE.CROP ? handlePointerDown : undefined}
          onTouchMove={currentPhase === PHASE.CROP ? handlePointerMove : undefined}
          onTouchEnd={currentPhase === PHASE.CROP ? handlePointerUp : undefined}
        >
          {error && (
            <div className="text-center px-8 z-20 max-w-sm">
              <p className="text-red-400 text-sm font-medium mb-5">{error}</p>
              <button 
                onClick={startCamera} 
                className="px-5 py-2.5 bg-neutral-900 cursor-pointer hover:bg-neutral-800 border border-neutral-800 text-white font-medium rounded-xl flex items-center gap-2 mx-auto shadow-xl transition-all"
              >
                <RefreshCw size={16} /> Re-initialize
              </button>
            </div>
          )}

          {/* PHASE 1: Live Capture Feed */}
          {currentPhase === PHASE.CAMERA && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]" 
            />
          )}

          {/* PHASE 2: Static Frame Review */}
          {currentPhase === PHASE.REVIEW && capturedImg && (
            <img
              src={capturedImg}
              alt="Captured view"
              className="w-full h-full object-cover"
            />
          )}

          {/* PHASE 3: Interactive Draggable Crop Overlay */}
          {currentPhase === PHASE.CROP && capturedImg && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              {/* Draggable Image Layer */}
              <div 
                className="w-full h-full bg-cover bg-center will-change-transform cursor-move"
                style={{ 
                  backgroundImage: `url(${capturedImg})`,
                  transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              />
              
              {/* Locked Dark Crop Stencil Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(10,10,10,0.75)] relative">
                  <div className="absolute -top-10 inset-x-0 text-center">
                    <span className="text-xs font-medium text-neutral-300 bg-neutral-900/90 px-2.5 py-1 rounded-md border border-neutral-800 tracking-wide">
                      Only inside circle will save
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel Actions Strip */}
        <div className="bg-neutral-950 border-t border-neutral-900 px-6 py-5 flex items-center justify-center min-h-26.25 z-20">
          
          {/* Controls for Phase 1: Capture */}
          {currentPhase === PHASE.CAMERA && (
            <button
              type="button"
              onClick={captureSnapshot}
              disabled={!!error || !stream}
              className="w-16 h-16 cursor-pointer rounded-full border-4 border-neutral-700 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all disabled:opacity-30"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-neutral-900">
                <Camera size={22} className="stroke-[2.5]" />
              </div>
            </button>
          )}

          {/* Controls for Phase 2: Accept/Reject */}
          {currentPhase === PHASE.REVIEW && (
            <div className="flex items-center gap-14">
              <button
                onClick={() => { setCurrentPhase(PHASE.CAMERA); startCamera(); }}
                className="w-14 h-14 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-red-400 flex items-center justify-center shadow-lg active:scale-90 transition-all"
              >
                <X size={24} />
              </button>
              <button
                onClick={() => setCurrentPhase(PHASE.CROP)}
                className="w-14 h-14 rounded-full bg-emerald-400 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-neutral-200"
              >
                <Check size={24} className="stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Controls for Phase 3: Fine-tune Crop & Spin */}
          {currentPhase === PHASE.CROP && (
            <div className="flex items-center justify-between w-full max-w-sm">
              <button
                onClick={() => { setCurrentPhase(PHASE.REVIEW); setOffset({x:0, y:0}); }}
                className="px-4 cursor-pointer  py-2 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-3 cursor-pointer  bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-xl transition-all active:scale-90 flex items-center gap-2 text-sm font-medium"
              >
                <RotateCw size={18} />
                <span>Rotate</span>
              </button>
              
              <button
                onClick={handleDoneCrop}
                className="px-6  cursor-pointer py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}