import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const ScanScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/analysis/demo');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-title">Plant Recognition</div>
        <div style={{ width: '52px' }}></div>
      </div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '48px 64px 80px' 
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '42px',
            fontWeight: '700',
            color: '#0f2419',
            marginBottom: '16px',
            letterSpacing: '-0.5px'
          }}>
            Scan Your Malunggay Plant
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#5a6c62',
            fontWeight: '500'
          }}>
            Capture or upload an image to identify plant parts and detect diseases
          </p>
        </div>

        <div className="recognition-area">
          <div style={{
            textAlign: 'center',
            color: '#5a6c62'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '24px',
              opacity: 0.6
            }}>
              📸
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#0f2419',
              marginBottom: '12px'
            }}>
              {analyzing ? 'Analyzing Plant...' : 'Ready to Scan'}
            </h3>
            <p style={{
              fontSize: '16px',
              fontWeight: '500'
            }}>
              {analyzing ? 'Please wait while we process your image' : 'Click the button below to capture or upload an image'}
            </p>
          </div>

          {analyzing && (
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: '16px 32px',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 24px rgba(45, 80, 22, 0.2)'
            }}>
              <div className="spinner"></div>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#1a5f3a'
              }}>
                {progress}% Analyzing
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button 
          className="capture-btn" 
          onClick={handleCapture}
          disabled={analyzing}
          style={{
            opacity: analyzing ? 0.6 : 1,
            cursor: analyzing ? 'not-allowed' : 'pointer'
          }}
        >
          📸 {analyzing ? 'Processing...' : 'Capture or Upload Image'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ScanScreen;