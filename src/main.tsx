import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
// Development previews must not restore an obsolete HMR document from browser history.
if (import.meta.env.DEV) window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
