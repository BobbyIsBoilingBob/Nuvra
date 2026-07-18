import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

requestAnimationFrame(() => {
  const boot = document.getElementById('boot');
  if (boot) {
    boot.classList.add('hidden');
    setTimeout(() => boot.remove(), 300);
  }
});
