import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔍', label: 'Scan', path: '/scan' },
    { icon: '🛒', label: 'Market', path: '/market' },
    { icon: '💬', label: 'Chat', path: '/chat' },
    { icon: '👤', label: 'Profile', path: '/analytics' },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;