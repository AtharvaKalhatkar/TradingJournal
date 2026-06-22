import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home';
import { Journal } from './pages/Journal';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
