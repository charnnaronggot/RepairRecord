import { useRef, useState, useCallback } from "react";

interface CameraProps {
  onCapture: (imageData: string) => void;
  currentPhoto: string;
}

const MAX_DIMENSION = 1280;
const TARGET_BYTES = 450 * 1024; // target ~450KB (safe for Firestore doc when combined with other fields)
const INITIAL_QUALITY = 0.82;
const MIN_QUALITY = 0.45;

function getDataUrlSizeBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding = (base64.match(/=+$/)?.[0].length ?? 0);
  return Math.floor((base64.length * 3) / 4 - padding);
}

function fitSize(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const ratio = width / height;
  if (ratio >= 1) {
    return { width: maxDimension, height: Math.round(maxDimension / ratio) };
  }
  return { width: Math.round(maxDimension * ratio), height: maxDimension };
}

export default function Camera({ onCapture, currentPhoto }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);

  const compressCanvasToDataUrl = useCallback((sourceCanvas: HTMLCanvasElement): string => {
    const tempCanvas = document.createElement("canvas");
    const original = fitSize(sourceCanvas.width, sourceCanvas.height, MAX_DIMENSION);

    let scale = 1;
    let quality = INITIAL_QUALITY;
    let best = "";

    for (let i = 0; i < 10; i += 1) {
      const w = Math.max(1, Math.round(original.width * scale));
      const h = Math.max(1, Math.round(original.height * scale));

      tempCanvas.width = w;
      tempCanvas.height = h;

      const ctx = tempCanvas.getContext("2d");
      if (!ctx) break;

      ctx.drawImage(sourceCanvas, 0, 0, w, h);

      const dataUrl = tempCanvas.toDataURL("image/jpeg", quality);
      best = dataUrl;

      if (getDataUrlSizeBytes(dataUrl) <= TARGET_BYTES) {
        return dataUrl;
      }

      if (quality > MIN_QUALITY) {
        quality = Math.max(MIN_QUALITY, quality - 0.1);
      } else {
        scale *= 0.85;
        quality = INITIAL_QUALITY;
      }
    }

    return best;
  }, []);

  const compressFileToDataUrl = useCallback(
    async (file: File): Promise<string> => {
      const imageUrl = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("ไม่สามารถอ่านรูปได้"));
          el.src = imageUrl;
        });

        const canvas = document.createElement("canvas");
        const fitted = fitSize(img.naturalWidth, img.naturalHeight, MAX_DIMENSION);
        canvas.width = fitted.width;
        canvas.height = fitted.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("ไม่สามารถประมวลผลรูปภาพได้");

        ctx.drawImage(img, 0, 0, fitted.width, fitted.height);
        return compressCanvasToDataUrl(canvas);
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    },
    [compressCanvasToDataUrl]
  );

  // const startCamera = useCallback(async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: "environment", width: 1280, height: 720 },
  //     });
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       setStreaming(true);
  //     }
  //   } catch (err) {
  //     console.error("Camera access denied:", err);
  //     alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง");
  //   }
  // }, []);

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
    const compressed = compressCanvasToDataUrl(canvas);
    onCapture(compressed);
    stopCamera();
  }, [compressCanvasToDataUrl, onCapture, stopCamera]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const compressed = await compressFileToDataUrl(file);
        onCapture(compressed);
      } catch (err) {
        console.error("Image compression failed:", err);
        alert("ไม่สามารถประมวลผลรูปภาพได้");
      } finally {
        // reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้
        e.target.value = "";
      }
    },
    [compressFileToDataUrl, onCapture]
  );

  return (
    <div className="camera-section">
      <label className="form-label">📷 รูปภาพ</label>

      <div className="camera-controls">
        {!streaming ? (
          <>
            {/* <button type="button" className="btn btn-camera" onClick={startCamera}>
              เปิดกล้อง
            </button> */}
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

      {streaming && <video ref={videoRef} autoPlay playsInline className="camera-preview" />}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {currentPhoto && !streaming && (
        <div className="photo-preview">
          <img src={currentPhoto} alt="captured" />
          <button type="button" className="btn btn-remove" onClick={() => onCapture("")}>
            ลบรูป
          </button>
        </div>
      )}
    </div>
  );
}