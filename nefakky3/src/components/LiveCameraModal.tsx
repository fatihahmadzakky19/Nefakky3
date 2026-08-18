'use client';

/**
 * ============================================================================
 * KOMPONEN: LiveCameraModal.tsx (Modal Akses Kamera Langsung / WebRTC)
 * DESKRIPSI: Mengakses hardware kamera browser untuk mengambil foto bukti penerimaan
 *            pesanan secara realtime dan jernih (FHD 1080p).
 * FITUR UTAMA:
 * 1. Switch Kamera Depan / Belakang (Environment / User)
 * 2. Kontrol Lampu Flash / Torch Senter (jika didukung perangkat)
 * 3. Grid Garis Bantu Komposisi 3x3 (Rule of Thirds)
 * 4. Efek Suara Shutter Web Audio API & Visual Flash Jepretan
 * 5. Mirroring otomatis pada kamera depan untuk kenyamanan orientasi
 * 6. Fallback cerdas ke input file galeri jika izin kamera ditolak
 * ============================================================================
 */

// Mengimpor React dan hooks
import React, { useState, useEffect, useRef } from 'react';
// Mengimpor ikon-ikon modern dari Lucide React
import { 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  AlertCircle, 
  Image as ImageIcon,
  Zap,
  ZapOff,
  Grid,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  RotateCcw
} from 'lucide-react';

/** Interface Properti Modal Kamera Live */
interface LiveCameraModalProps {
  isOpen: boolean; // Status tampil modal kamera
  onClose: () => void; // Callback saat modal ditutup
  onCapture: (base64Image: string) => void; // Callback saat foto berhasil diambil (format base64)
  onFallbackToFile: () => void; // Callback fallback membuka input galeri jika kamera error
}

// Komponen Utama Live Camera Modal
export default function LiveCameraModal({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFile
}: LiveCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null); // Ref elemen video HTML5 untuk stream kamera
  const canvasRef = useRef<HTMLCanvasElement>(null); // Ref elemen canvas untuk rendering frame resolusi penuh
  
  const [stream, setStream] = useState<MediaStream | null>(null); // State objek MediaStream aktif
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment'); // Orientasi kamera belakang / depan
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]); // Daftar perangkat kamera yang terdeteksi
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(''); // Device ID kamera yang dipilih
  const [cameraError, setCameraError] = useState<string | null>(null); // Pesan kesalahan akses kamera
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null); // Pratinjau foto hasil jepretan
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // Indikator inisialisasi lensa kamera

  // Kontrol Pengaturan Kamera Lanjutan
  const [showGrid, setShowGrid] = useState<boolean>(true); // Tampilkan garis bantu 3x3
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true); // Aktifkan suara shutter jepretan
  const [isTorchSupported, setIsTorchSupported] = useState<boolean>(false); // Dukungan lampu senter hardware
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false); // Status hidup/mati lampu senter
  const [isFlashing, setIsFlashing] = useState<boolean>(false); // Efek animasi flash putih saat jepret
  const [resolutionInfo, setResolutionInfo] = useState<string>('FHD 1080p'); // Label resolusi aktif

  // Enumerate video devices on mount/open
  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
          setDevices(videoInputs);
        }
      } catch (err) {
        console.warn('Could not enumerate camera devices:', err);
      }
    };

    getDevices();
  }, [isOpen]);

  // Start or restart camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setCapturedPreview(null);
      setCameraError(null);
      setIsTorchOn(false);
      return;
    }

    startCameraStream(facingMode, selectedDeviceId);

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode, selectedDeviceId]);

  const startCameraStream = async (mode: 'environment' | 'user', deviceId?: string) => {
    stopCameraStream();
    setCameraError(null);
    setIsInitializing(true);

    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser ini tidak mendukung akses kamera langsung. Silakan gunakan opsi upload foto.');
      }

      // Build video constraints for high clarity (1080p/4K ideal)
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        aspectRatio: { ideal: 16 / 9 },
        frameRate: { ideal: 30 }
      };

      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        videoConstraints.facingMode = { ideal: mode };
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check capabilities (Torch/Flashlight & Resolution)
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
        setIsTorchSupported(!!capabilities.torch);

        const settings = videoTrack.getSettings();
        if (settings.width && settings.height) {
          const resLabel = settings.height >= 1080 ? 'Full HD 1080p' : `${settings.height}p HD`;
          setResolutionInfo(resLabel);
        }

        // Try applying continuous autofocus if supported by hardware
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ focusMode: 'continuous' } as any]
            });
          } catch (e) {
            // Ignore if constraint application fails
          }
        }
      }

      setIsInitializing(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsInitializing(false);
      let errorMsg = 'Gagal mengakses kamera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Izin kamera ditolak. Silakan berikan izin kamera di browser Anda atau gunakan opsi upload dari galeri.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'Kamera tidak ditemukan pada perangkat ini.';
      } else if (err.name === 'OverconstrainedError') {
        // Retry with default low constraint fallback
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) videoRef.current.srcObject = fallbackStream;
          return;
        } catch (fallbackErr) {
          errorMsg = 'Kamera tidak dapat merespons konfigurasi resolusi ini.';
        }
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
    setSelectedDeviceId(''); // Clear explicit device selection on mode toggle
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleToggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as any]
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn('Torch toggle error:', err);
      }
    }
  };

  const playShutterSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch (e) {
      // Ignore audio synthesis errors
    }
  };

  const handleTakePicture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger visual shutter flash & sound
    setIsFlashing(true);
    playShutterSound();
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to full native video feed resolution for sharpest detail
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    // Mirror image on canvas if front camera to match preview orientation
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    // Draw frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // High quality JPEG output (0.92 compression quality)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#140b06]/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#21130a] text-white rounded-3xl overflow-hidden shadow-2xl border border-amber-900/40 flex flex-col relative">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-amber-900/30 bg-[#170c06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#934B19] to-[#6d340e] rounded-2xl text-amber-200 shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-amber-100">Kamera Live Realtime</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {resolutionInfo}
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80">Ambil foto bukti penerimaan pesanan jernih & presisi</p>
            </div>
          </div>

          <button
            onClick={() => { stopCameraStream(); onClose(); }}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Tutup Kamera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HIDDEN CANVAS FOR FULL-RES CAPTURE */}
        <canvas ref={canvasRef} className="hidden" />

        {/* MAIN VIEWPORT CONTAINER */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-black flex items-center justify-center overflow-hidden">
          
          {/* VISUAL SHUTTER FLASH OVERLAY */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-pulse pointer-events-none" />
          )}

          {/* INITIALIZING SPINNER */}
          {isInitializing && !cameraError && (
            <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-amber-200">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs font-semibold">Mengaktifkan Lensa Kamera...</span>
            </div>
          )}

          {/* CAMERA ERROR STATE */}
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertCircle className="w-7 h-7" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-medium">{cameraError}</p>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  onClose();
                  onFallbackToFile();
                }}
                className="px-5 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow-lg inline-flex items-center gap-2 transition-all active:scale-95"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload Foto dari Galeri</span>
              </button>
            </div>
          ) : capturedPreview ? (
            /* PREVIEW CAPTURED PHOTO */
            <div className="relative w-full h-full bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedPreview} alt="Hasil Foto Bukti" className="w-full h-full object-contain" />
              
              <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-400/30 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Foto Berhasil Ditangkap!</span>
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
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* VIEWPORT OVERLAY CONTROLS BAR (TOP INSIDE VIEWPORT) */}
              <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10">
                  {/* GRID TOGGLE */}
                  <button
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-1.5 rounded-lg transition-all ${
                      showGrid ? 'text-amber-400 bg-amber-500/20' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Garis Bantu Presisi Grid 3x3"
                  >
                    <Grid className="w-4 h-4" />
                  </button>

                  {/* SHUTTER SOUND TOGGLE */}
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1.5 rounded-lg transition-all ${
                      soundEnabled ? 'text-amber-400 bg-amber-500/20' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Suara Jepretan Kamera"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* TORCH / FLASHLIGHT TOGGLE (IF HARDWARE SUPPORTED) */}
                  {isTorchSupported && (
                    <button
                      type="button"
                      onClick={handleToggleTorch}
                      className={`p-1.5 rounded-lg transition-all ${
                        isTorchOn ? 'text-amber-300 bg-amber-500/30' : 'text-stone-400 hover:text-white'
                      }`}
                      title="Lampu Kilat / Senter"
                    >
                      {isTorchOn ? <Zap className="w-4 h-4 fill-amber-300" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* DEVICE SELECTOR IF MULTIPLE CAMERAS DETECTED */}
                {devices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="bg-black/60 backdrop-blur-md text-amber-200 text-[11px] font-medium border border-amber-500/30 rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Otomatis ({facingMode === 'environment' ? 'Belakang' : 'Depan'})</option>
                    {devices.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Kamera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* RULE OF THIRDS GRID OVERLAY */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-white/15" />
                  <div className="border-r border-white/15" />
                  <div className="" />
                </div>
              )}

              {/* CAMERA FOCUS SCANNER RETICLE OVERLAY */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none z-10 flex items-center justify-center">
                {/* CORNER BRACKETS */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-xl shadow-sm" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-xl shadow-sm" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-xl shadow-sm" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-xl shadow-sm" />

                {/* CENTER TARGET BADGE */}
                <div className="text-[11px] font-semibold text-amber-100 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/30 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Posisikan makanan / bukti penerimaan di area ini</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* MODAL FOOTER CONTROLS */}
        <div className="p-4 sm:p-5 bg-[#170c06] border-t border-amber-900/30 flex items-center justify-between gap-3">
          {capturedPreview ? (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetakePhoto}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmCapturedPhoto}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 border border-emerald-400/30"
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
                disabled={!!cameraError || isInitializing}
                className="p-3.5 bg-stone-800/90 hover:bg-stone-700 text-amber-200 rounded-2xl transition-all disabled:opacity-40 border border-amber-900/30 active:scale-95"
                title={`Ganti ke Kamera ${facingMode === 'environment' ? 'Depan' : 'Belakang'}`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* MAIN SHUTTER BUTTON */}
              <button
                type="button"
                onClick={handleTakePicture}
                disabled={!!cameraError || isInitializing}
                className="px-6 py-3 bg-gradient-to-r from-[#a3531c] via-[#934B19] to-[#783603] hover:from-[#b85e20] hover:to-[#8a3e05] disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 active:scale-95 border border-amber-400/40"
              >
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-white rounded-full animate-pulse" />
                </div>
                <span className="tracking-wide">AMBIL FOTO SEKARANG</span>
              </button>

              {/* FALLBACK FILE UPLOAD BUTTON */}
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  onClose();
                  onFallbackToFile();
                }}
                className="p-3.5 bg-stone-800/90 hover:bg-stone-700 text-amber-200 rounded-2xl transition-all border border-amber-900/30 active:scale-95"
                title="Upload dari Galeri File"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
