import React from 'react';
import ReactDOM from 'react-dom/client';
// @ts-ignore - CSS import typing (handled via declaration files)
import './index.css';

import App from './App.tsx';

import reportWebVitals from './reportWebVitals.ts';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// The call remains the same
reportWebVitals();