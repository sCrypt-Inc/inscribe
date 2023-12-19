import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {BSV20Mint} from './contracts/bsv20Mint';
import bsv20MintArtifact from '../public/bsv20Mint_release_desc.json';

BSV20Mint.loadArtifact(bsv20MintArtifact);

declare global {
  interface Window {
    gtag
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
