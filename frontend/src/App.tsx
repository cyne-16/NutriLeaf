import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import MarketScreen from './screens/MarketScreen';
import ChatScreen from './screens/ChatScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import './App.css';

function App() {
    return (
        <Router>
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
        </Router>
    );
}

export default App;