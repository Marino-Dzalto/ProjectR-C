// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Ovdje možete definirati globalne stilove
import { BrowserRouter } from 'react-router-dom'; // Importiraj BrowserRouter
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Obuhvati cijelu aplikaciju sa BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Ako želiš mjeriti performanse u aplikaciji, možeš proslijediti funkciju
// za logiranje rezultata (npr. reportWebVitals(console.log))
reportWebVitals();
