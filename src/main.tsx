import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker safely for Android app compatibility
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.self === window.top) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('/service-worker.js')
          .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
          .catch((err) => console.warn('Service Worker registration failed:', err));
      } catch (innerErr) {
        console.warn('Service Worker registration prevented inside iframe:', innerErr);
      }
    });
  }
} catch (outerErr) {
  console.warn('Service Worker access prevented:', outerErr);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
