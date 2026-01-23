import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '🌿', title: 'Plant Monitor', desc: 'Track growth stages & health', path: '/scan' },
    { icon: '🔬', title: 'Disease Detect', desc: 'Early warning system', path: '/scan' },
    { icon: '🥗', title: 'Nutrition Info', desc: 'Complete nutrient data', path: '/market' },
    { icon: '📊', title: 'Market Trends', desc: 'Price & demand insights', path: '/analytics' },
    { icon: '📸', title: 'Scan Now', desc: 'Identify plant parts instantly', path: '/scan' },
    { icon: '💬', title: 'Ask AI', desc: 'Get expert advice anytime', path: '/chat' },
  ];

  return (
    <div className="screen">
      <div className="hero-section">
        {/* Video Background */}
        <div className="hero-video-wrapper">
          <video 
            className="hero-video"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/videos/malunggay-plant.mp4" type="video/mp4" />
            <source src="/videos/malunggay-plant.webm" type="video/webm" />
          </video>
        </div>

        <div className="hero-content">
          <div className="welcome-text">Welcome back,</div>
          <h1 className="hero-title">
            Grow <span className="highlight">Smarter</span><br />
            with NutriLeaf
          </h1>
          <p className="hero-subtitle">
            Your AI-powered companion for smart malunggay cultivation
          </p>
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Search products..." />
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="feature-card"
              onClick={() => navigate(feature.path)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-title">{feature.title}</div>
              <div className="feature-desc">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;