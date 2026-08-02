import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/react'

// Set default API base URL for deployment
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_API_URL || '';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
