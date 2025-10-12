import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Enhanced loading transition
setTimeout(() => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Add fade out animation
    rootElement.style.transition = 'opacity 0.5s ease-out';
    rootElement.style.opacity = '0';
    
    // Remove loading class and restore opacity after fade
    setTimeout(() => {
      rootElement.classList.remove('loading');
      rootElement.style.opacity = '1';
      rootElement.style.transition = 'none';
    }, 500);
  }
}, 800); // Increased delay for better UX
