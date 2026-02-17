import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import MarketScreen from './screens/MarketScreen';
import ChatScreen from './screens/ChatScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import FloatingChatbot from './components/FloatingChatbot';
import './App.css';

function AppContent() {
    const location = useLocation();
    
    // Hide floating chatbot on scan screen and chat screen
    const hideChatbot = location.pathname === '/scan' || location.pathname === '/chat';

    return (
        <>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/scan" element={<ScanScreen />} />
                    <Route path="/analysis/:id" element={<AnalysisScreen />} />
                    <Route path="/market" element={<MarketScreen />} />
                    <Route path="/chat" element={<ChatScreen />} />
                    <Route path="/analytics" element={<AnalyticsScreen />} />
                </Routes>
            </div>
            
            {/* Floating Chatbot - Shows on all screens except scan and chat */}
            {!hideChatbot && <FloatingChatbot />}
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;