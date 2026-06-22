import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TradeProvider } from './context/TradeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TradeProvider>
    <App />
  </TradeProvider>,
)
