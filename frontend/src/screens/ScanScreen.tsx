import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const ScanScreen = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      console.log('🎥 Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment'
        }
      });
      
      console.log('✅ Camera access granted');
      console.log('📹 Stream:', mediaStream);
      console.log('🎬 Tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setCameraActive(true);
      
      // Wait for next render cycle
      setTimeout(() => {
        const video = videoRef.current;
        if (!video) {
          console.error('❌ Video element not found');
          return;
        }
        
        console.log('📺 Setting stream to video element');
        video.srcObject = mediaStream;
        video.muted = true;
        video.playsInline = true;
        
        console.log('▶️ Attempting to play video');
        video.play()
          .then(() => console.log('✅ Video is playing!'))
          .catch(err => console.error('❌ Play error:', err));
          
      }, 100);
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      alert('Camera access denied. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    console.log('📸 Capturing image, video dimensions:', video.videoWidth, 'x', video.videoHeight);
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Video not ready. Please wait a moment and try again.');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    stopCamera();
    analyzeImage();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
      analyzeImage();
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = () => {
    setAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            alert('Analysis complete! In a full app, this would navigate to results.');
            resetScan();
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setAnalyzing(false);
    setProgress(0);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      {/* Main Content - Responsive Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: window.innerWidth > 768 ? '40px' : '20px',
        gap: window.innerWidth > 768 ? '60px' : '20px',
        maxWidth: window.innerWidth > 768 ? '1400px' : '100%',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Camera/Preview Area */}
        <div style={{
          position: 'relative',
          width: window.innerWidth > 768 ? '500px' : '100%',
          height: window.innerWidth > 768 ? '600px' : 'auto',
          aspectRatio: window.innerWidth <= 768 ? '9/16' : 'unset',
          background: '#000',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(45, 80, 22, 0.2)',
          flexShrink: 0
        }}>
          {/* Camera Frame Overlay */}
          {(cameraActive || capturedImage) && (
            <div style={{
              position: 'absolute',
              inset: '40px',
              border: '3px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              {/* Corner decorations */}
              <div style={{ position: 'absolute', top: -3, left: -3, width: '40px', height: '40px', borderTop: '6px solid white', borderLeft: '6px solid white', borderRadius: '20px 0 0 0' }}></div>
              <div style={{ position: 'absolute', top: -3, right: -3, width: '40px', height: '40px', borderTop: '6px solid white', borderRight: '6px solid white', borderRadius: '0 20px 0 0' }}></div>
              <div style={{ position: 'absolute', bottom: -3, left: -3, width: '40px', height: '40px', borderBottom: '6px solid white', borderLeft: '6px solid white', borderRadius: '0 0 0 20px' }}></div>
              <div style={{ position: 'absolute', bottom: -3, right: -3, width: '40px', height: '40px', borderBottom: '6px solid white', borderRight: '6px solid white', borderRadius: '0 0 20px 0' }}></div>
            </div>
          )}

          {/* Video Preview - ALWAYS VISIBLE WHEN CAMERA ACTIVE */}
          {cameraActive && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000'
              }}
            />
          )}

          {/* Captured Image */}
          {capturedImage && !cameraActive && (
            <img
              src={capturedImage}
              alt="Captured plant"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}

          {/* Placeholder when no camera/image */}
          {!cameraActive && !capturedImage && (
            <div style={{
              textAlign: 'center',
              color: '#5a6c62',
              padding: '40px',
              zIndex: 5
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '16px',
                opacity: 0.5
              }}>
                🌿
              </div>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '8px'
              }}>
                {window.innerWidth > 768 ? 'Camera Preview' : 'Ready to Scan'}
              </p>
              <p style={{
                fontSize: '14px',
                opacity: 0.8,
                color: '#ccc'
              }}>
                {window.innerWidth > 768 ? 'Click "Start Camera" to begin' : 'Start camera or upload an image'}
              </p>
            </div>
          )}

          {/* Analysis Progress */}
          {analyzing && (
            <div style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '12px 24px',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              zIndex: 20
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid #2d5016',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d5016'
              }}>
                {progress}% Analyzing
              </span>
            </div>
          )}

          {/* Reset button when image captured */}
          {capturedImage && !analyzing && (
            <button
              onClick={resetScan}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20
              }}
            >
              <X size={24} color="white" />
            </button>
          )}
        </div>

        {/* Right Side Content - Instructions & Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          flex: window.innerWidth > 768 ? 1 : 'unset',
          maxWidth: window.innerWidth > 768 ? '500px' : '100%',
          width: '100%'
        }}>
          {/* Title & Description */}
          <div style={{
            display: window.innerWidth > 768 ? 'block' : 'none'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#0f2419',
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              Scan Your Malunggay Plant
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#5a6c62',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              Position your Malunggay plant within the camera frame for accurate disease detection. 
              Our AI will analyze the leaves and provide instant results.
            </p>
            <div style={{
              background: 'rgba(45, 80, 22, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              borderLeft: '4px solid #2d5016'
            }}>
             
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
          }}>
          {cameraActive ? (
            <button
              onClick={captureImage}
              disabled={analyzing}
              style={{
                background: analyzing ? '#9e9e9e' : 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: window.innerWidth > 768 ? '16px' : '50%',
                width: window.innerWidth > 768 ? '100%' : '72px',
                height: window.innerWidth > 768 ? 'auto' : '72px',
                padding: window.innerWidth > 768 ? '18px 32px' : '0',
                fontSize: window.innerWidth > 768 ? '18px' : '32px',
                fontWeight: '600',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(45, 80, 22, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                margin: window.innerWidth > 768 ? '0' : '0 auto'
              }}
            >
              {window.innerWidth > 768 && <Camera size={24} />}
              {window.innerWidth > 768 ? 'Capture Photo' : '📸'}
            </button>
          ) : (
            <>
              <button
                onClick={startCamera}
                disabled={analyzing}
                style={{
                  background: analyzing ? '#9e9e9e' : 'linear-gradient(135deg, #2d5016 0%, #1a5f3a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '18px 32px',
                  fontSize: window.innerWidth > 768 ? '18px' : '16px',
                  fontWeight: '600',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(45, 80, 22, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%'
                }}
              >
                <Camera size={window.innerWidth > 768 ? 24 : 20} />
                Start Camera
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                style={{
                  background: analyzing ? '#9e9e9e' : 'white',
                  color: '#2d5016',
                  border: '2px solid #2d5016',
                  borderRadius: '16px',
                  padding: '18px 32px',
                  fontSize: window.innerWidth > 768 ? '18px' : '16px',
                  fontWeight: '600',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%'
                }}
              >
                <Upload size={window.innerWidth > 768 ? 24 : 20} />
                Upload Image
              </button>
            </>
          )}
          </div>

          {/* Mobile Instructions */}
          {!cameraActive && !capturedImage && window.innerWidth <= 768 && (
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#5a6c62',
              margin: 0
            }}>
              Position the plant within the frame for best results. Ensure good lighting and focus on leaves for disease detection.
            </p>
          )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    </div>
  );
  
};

export default ScanScreen;