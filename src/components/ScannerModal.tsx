import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles, VideoOff } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureImage: (dataUrl: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onCaptureImage,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported in this browser environment.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCaptureImage(capturedPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#DFD5C2] shadow-2xl space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-[#E7DECD] pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#D92B8A]" />
            <h3 className="text-lg font-bold text-[#161616]">
              Textbook & Note Scanner
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#9E9584] hover:text-[#161616]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#6F685B]">
          Hold your textbook, lecture notebook, or exam paper in front of the lens.
        </p>

        {/* Viewfinder or Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border-2 border-[#DFD5C2]">
          {cameraError ? (
            <div className="p-6 text-center text-rose-300 space-y-2">
              <VideoOff className="w-8 h-8 mx-auto" />
              <p className="text-xs font-semibold">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-2 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30"
              >
                Retry Camera
              </button>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured note page"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target guidelines */}
              <div className="absolute inset-8 border-2 border-dashed border-[#D92B8A]/80 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] bg-black/60 text-white px-2 py-0.5 rounded font-mono-code">
                  Center study notes here
                </span>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {capturedPhoto ? (
            <>
              <button
                onClick={startCamera}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DFD5C2] text-xs font-bold text-[#5C5546] hover:bg-[#FAF7F0]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white text-xs font-bold shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze Notes with Gemini</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              className="w-full py-3.5 rounded-2xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Snapshot</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
