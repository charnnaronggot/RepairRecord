import { useRef, useState, useCallback } from "react";

interface CameraProps {
  onCapture: (imageData: string) => void;
  currentPhoto: string;
}

export default function Camera({ onCapture, currentPhoto }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    onCapture(dataUrl);
    stopCamera();
  }, [onCapture, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="camera-section">
      <label className="form-label">📷 รูปภาพ</label>

      <div className="camera-controls">
        {!streaming ? (
          <>
            <button type="button" className="btn btn-camera" onClick={startCamera}>
              เปิดกล้อง
            </button>
            <label className="btn btn-upload">
              อัปโหลดรูป
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-capture" onClick={capturePhoto}>
              ถ่ายรูป
            </button>
            <button type="button" className="btn btn-cancel" onClick={stopCamera}>
              ปิดกล้อง
            </button>
          </>
        )}
      </div>

      {streaming && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-preview"
        />
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {currentPhoto && !streaming && (
        <div className="photo-preview">
          <img src={currentPhoto} alt="captured" />
          <button
            type="button"
            className="btn btn-remove"
            onClick={() => onCapture("")}
          >
            ลบรูป
          </button>
        </div>
      )}
    </div>
  );
}
