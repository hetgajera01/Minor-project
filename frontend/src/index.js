import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';

// NOTE: Do NOT set axios.defaults.baseURL here.
// In development, the React proxy (package.json "proxy") forwards /api/* to localhost:5000.
// In production, each component uses the full URL via REACT_APP_API_URL.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 