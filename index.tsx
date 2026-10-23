
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameApp } from './games/alphabet/components/GameApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GameApp />
  </React.StrictMode>
);
