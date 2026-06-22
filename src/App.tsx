import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { TradeLog } from './pages/TradeLog';
import { Analytics } from './pages/Analytics';
import { Psychology } from './pages/Psychology';
import { CalendarView } from './pages/CalendarView';
import { Playbooks } from './pages/Playbooks';
import { BottomNav } from './components/layout/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<TradeLog />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/playbooks" element={<Playbooks />} />
              <Route path="/psychology" element={<Psychology />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
