
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon'; // New Icon
import { Spinner } from './Spinner';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onError: (error: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false); // Used for both camera snap and file upload processing

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCapturing(false); // Reset capturing state
    if (stream) stopStream(); // Stop existing stream before starting new one

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: {ideal: 720} },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = "Could not access the camera. Please ensure permissions are granted and no other app is using it.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          message = "Camera permission denied. Please enable it in your browser settings.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "No camera matching the requirements (e.g., rear-facing) was found. Please ensure a suitable camera is connected and enabled, or try a different camera if available.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            message = "Camera is already in use, could not be started, or timed out. This may manifest as a 'Timeout starting video source' error. Try closing other applications using the camera, check camera drivers, or refresh the page.";
        } else if (err.name === "OverconstrainedError") {
            message = "The requested camera settings (e.g., resolution, facing mode 'environment') are not supported by your device's camera(s). Try a different camera or check device capabilities.";
        } else {
            message = `Error accessing camera: ${err.message}. Please check permissions, ensure the camera isn't in use by another app, and that drivers are up to date.`;
        }
      }
      setCameraError(message);
      onError(message);
    }
  }, [onError, stopStream, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally run once on mount to initialize


  const handleCameraSnap = () => {
    if (videoRef.current && canvasRef.current && stream && !isCapturing) {
      setIsCapturing(true);
      setCameraError(null);
      
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      
      const aspectRatio = video.videoWidth / video.videoHeight;
      const targetCanvasWidth = 600; 
      canvas.width = targetCanvasWidth;
      canvas.height = targetCanvasWidth / aspectRatio;

      const context = canvas.getContext('2d');
      if (context) {
         context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); 
        const base64Data = dataUrl.split(',')[1];
        if (base64Data) {
            onCapture(base64Data);
            stopStream(); // Stop stream after successful capture
        } else {
            const err = "Failed to convert image to Base64. The captured image might be empty.";
            onError(err);
            setCameraError(err);
            setIsCapturing(false); 
        }
      } else {
         const err = "Failed to get canvas context for image capture.";
         onError(err);
         setCameraError(err);
         setIsCapturing(false);
      }
      // Parent (App.tsx) handles further loading state (isScanLoading) and subsequent UI changes.
      // isCapturing here is reset by startCamera if user scans again, or parent unmounts this.
    } else if (!stream) {
        const errorMsg = "Camera stream is not active. Please try restarting the camera or ensure permissions are granted.";
        setCameraError(errorMsg);
        onError(errorMsg);
    } else if (isCapturing){
        console.warn("Capture already in progress.");
    } else {
        const errorMsg = "Camera or canvas not ready for capture.";
        setCameraError(errorMsg);
        onError(errorMsg);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        const err = "Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP, etc.).";
        onError(err);
        setCameraError(err);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      setIsCapturing(true);
      setCameraError(null);
      stopStream(); // Stop camera stream if a file is being uploaded

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64Data = dataUrl.split(',')[1];
        if (base64Data) {
          onCapture(base64Data);
        } else {
          const err = "Failed to read or convert uploaded image to Base64.";
          onError(err);
          setCameraError(err);
          setIsCapturing(false);
        }
      };
      reader.onerror = () => {
        const err = "Error reading the uploaded file.";
        onError(err);
        setCameraError(err);
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input so same file can be re-uploaded
  };

  if (isCapturing) { // Unified loading state for both capture methods
    return (
      <div className="flex flex-col items-center justify-center my-10 p-6 bg-slate-50 rounded-lg shadow-inner min-h-[300px]">
        <Spinner />
        <p className="mt-4 text-lg text-slate-700 font-medium">Processing image...</p>
      </div>
    );
  }

  if (cameraError && !stream) { // Show camera error prominently if stream failed to start
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 shadow-md">
        <h3 className="text-lg font-semibold text-red-700 mb-2">Operation Error</h3>
        <p className="text-red-600 mb-4">{cameraError}</p>
        <button
          onClick={startCamera}
          aria-label="Retry camera initialization"
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out shadow hover:shadow-md mr-2"
        >
          Retry Camera
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload an image instead"
          className="mt-2 bg-slate-500 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out shadow hover:shadow-md"
        >
          Upload Image Instead
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    );
  }
  
  if (!stream && !cameraError && !isCapturing) { // Initializing camera state (stream not yet available)
    return (
      <div className="text-center p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Spinner/>
        <p className="text-slate-600 mt-4 text-lg">Initializing camera...</p>
         <p className="text-slate-500 mt-2 text-sm">Or, if camera is unavailable:</p>
        <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-lg shadow-md hover:shadow-lg transition-colors duration-150 flex items-center justify-center space-x-2"
            aria-label="Upload an image"
        >
            <UploadIcon className="w-5 h-5" />
            <span>Upload Image</span>
        </button>
         <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center space-y-5">
      {cameraError && ( // Display non-critical camera errors (e.g. file upload error while camera is fine)
           <div className="w-full max-w-md bg-red-100 border border-red-300 text-red-700 p-3 mb-3 rounded-md text-sm">
             {cameraError}
           </div>
         )}
      {stream && (
        <div className="relative w-full max-w-md aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shadow-xl border-4 border-slate-700">
          <video
            ref={videoRef}
            autoPlay
            playsInline 
            muted 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
      
      <div className="w-full max-w-md space-y-3">
        {stream && (
          <button
            onClick={handleCameraSnap}
            disabled={!stream || isCapturing}
            aria-label={'Capture Food Image with Camera'}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center space-x-3 focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-opacity-75 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:shadow-md disabled:hover:-translate-y-0"
          >
            <CameraIcon className="w-7 h-7" />
            <span className="text-lg">Snap & Analyze</span>
          </button>
        )}

        <div className="relative flex items-center w-full max-w-md">
            {!stream && <div className="flex-grow border-t border-slate-300"></div>}
            {stream && (
                <>
                    <div className="flex-grow border-t border-slate-300"></div>
                    <span className="px-3 text-slate-500 bg-white">OR</span>
                    <div className="flex-grow border-t border-slate-300"></div>
                </>
            )}
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isCapturing}
          aria-label={'Upload an image file'}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center space-x-3 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-75 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:shadow-md disabled:hover:-translate-y-0"
        >
          <UploadIcon className="w-7 h-7" />
          <span className="text-lg">Upload Image</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*" // Accepts common image types
          onChange={handleFileUpload}
          className="hidden" // Visually hide the default input
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
