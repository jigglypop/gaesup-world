import React from 'react';

import ReactDOM from 'react-dom/client';

import { configureReinforcementAdapter } from '../src/core/npc';
import App from './App';
import './style.css';

configureReinforcementAdapter({
  endpoint: import.meta.env.VITE_RL_POLICY_ENDPOINT ?? 'http://localhost:8095/policy/step',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
