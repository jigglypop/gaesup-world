import ReactDOM from 'react-dom/client';

import { configureReinforcementAdapter } from 'gaesup-world';

import App from './App';
import './style.css';

configureReinforcementAdapter({
  endpoint: import.meta.env.VITE_RL_POLICY_ENDPOINT ?? 'http://localhost:8091/policy/step',
});

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
