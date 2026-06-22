import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home';
import { Journal } from './pages/Journal';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/analytics';

  return (
    <div className="app-container">
      <main className="main-content" style={{ paddingBottom: '5.5rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
