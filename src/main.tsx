import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const boot = document.getElementById('boot');
if (boot) { boot.style.transition = 'opacity 0.3s'; boot.style.opacity = '0'; setTimeout(() => boot.remove(), 300); }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
