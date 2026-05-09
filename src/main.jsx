import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './components/ToastSystem'
import PermissionsGate from './components/PermissionsGate'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <PermissionsGate>
        <App />
      </PermissionsGate>
    </ToastProvider>
  </React.StrictMode>,
)
