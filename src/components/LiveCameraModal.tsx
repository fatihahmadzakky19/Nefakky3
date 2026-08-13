'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  onFallbackToFile: () => void;
}

export default function LiveCameraModal({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFile
}: LiveCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Initialize live camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setCapturedPreview(null);
      setCameraError(null);
      return;
    }

    startCameraStream(facingMode);

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode]);

  const startCameraStream = async (mode: 'environment' | 'user') => {
    stopCameraStream();
    setCameraError(null);

    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser ini tidak mendukung akses kamera langsung. Silakan gunakan opsi upload foto.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMsg = 'Gagal mengakses kamera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Izin kamera ditolak. Silakan berikan izin kamera di browser Anda atau gunakan opsi upload dari galeri.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'Kamera tidak ditemukan pada perangkat ini.';
      }
      setCameraError(errorMsg);
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleTakePicture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to Base64 JPEG format
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPreview(dataUrl);
  };

  const handleConfirmCapturedPhoto = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160E]/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#25160E] text-white rounded-3xl overflow-hidden shadow-2xl border border-amber-900/40 space-y-0 relative flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-amber-900/30 bg-[#1e110a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#934B19] rounded-xl text-amber-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-amber-100">Kamera Live Realtime</h3>
              <p className="text-[11px] text-amber-300/80">Ambil foto bukti penerimaan pesanan langsung</p>
            </div>
          </div>

          <button
            onClick={() => { stopCameraStream(); onClose(); }}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HIDDEN CANVAS FOR CAPTURING FRAME */}
        <canvas ref={canvasRef} className="hidden" />

        {/* VIEWPORT AREA (VIDEO OR PREVIEW) */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  onClose();
                  onFallbackToFile();
                }}
                className="px-4 py-2 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Gunakan Upload Foto dari Galeri</span>
              </button>
            </div>
          ) : capturedPreview ? (
            /* PREVIEW CAPTURED PHOTO */
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedPreview} alt="Hasil Foto Bukti" className="w-full h-full object-contain" />
              <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Foto Terambil!</span>
              </div>
            </div>
          ) : (
            /* LIVE VIDEO STREAM VIEWPORT */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* VIEWFINDER FRAME OVERLAY */}
              <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="text-[10px] font-bold text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  Posisikan makanan / bukti penerimaan di dalam area ini
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER & ACTION CONTROLS */}
        <div className="p-4 sm:p-5 bg-[#1e110a] border-t border-amber-900/30 flex items-center justify-between gap-3">
          {capturedPreview ? (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetakePhoto}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmCapturedPhoto}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              {/* SWITCH CAMERA BUTTON */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                disabled={!!cameraError}
                className="p-3 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-2xl transition-all disabled:opacity-40"
                title="Ganti Kamera Depan / Belakang"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* SHUTTER BUTTON */}
              <button
                type="button"
                onClick={handleTakePicture}
                disabled={!!cameraError}
                className="px-6 py-3 bg-[#934B19] hover:bg-[#783603] disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-95 border border-amber-500/30"
              >
                <div className="w-4 h-4 rounded-full border-2 border-white bg-white/30 animate-pulse" />
                <span>AMBIL FOTO SEKARANG</span>
              </button>

              {/* FALLBACK FILE PICKER BUTTON */}
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  onClose();
                  onFallbackToFile();
                }}
                className="p-3 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-2xl transition-all"
                title="Upload dari Galeri File"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
