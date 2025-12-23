import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { initWebVitals } from './src/services/web-vitals';
import './index.css';

// Initialize Web Vitals tracking for performance monitoring
initWebVitals();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);