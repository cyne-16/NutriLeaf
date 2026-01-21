import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const AnalyticsScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="screen">
            <div className="header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <div className="header-title">Analytics & Insights</div>
                <div style={{ width: '52px' }}></div>
            </div>

            <div style={{ 
                maxWidth: '1400px', 
                margin: '0 auto', 
                padding: '80px 64px',
                minHeight: 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: '600px'
                }}>
                    <div style={{
                        fontSize: '120px',
                        marginBottom: '32px',
                        opacity: 0.6
                    }}>
                        📊
                    </div>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '48px',
                        fontWeight: '700',
                        color: '#0f2419',
                        marginBottom: '20px',
                        letterSpacing: '-0.5px'
                    }}>
                        Analytics & Insights
                    </h2>
                    <p style={{
                        fontSize: '20px',
                        color: '#5a6c62',
                        fontWeight: '500',
                        lineHeight: '1.6'
                    }}>
                        Track your plant growth, monitor market trends, and get data-driven insights for better cultivation. Coming soon!
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '40px',
                            background: 'linear-gradient(135deg, #1a5f3a 0%, #2d7a50 50%, #3a8f60 100%)',
                            color: 'white',
                            padding: '16px 40px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(26, 95, 58, 0.25)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(26, 95, 58, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(26, 95, 58, 0.25)';
                        }}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default AnalyticsScreen;