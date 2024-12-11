import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Failed to find root element');
}

const rootReactElement = ReactDOM.createRoot(root);

if (rootReactElement) {
  rootReactElement.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find root element');
}