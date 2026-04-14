import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AppRefactored from './AppRefactored.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRefactored />
  </StrictMode>,
);
