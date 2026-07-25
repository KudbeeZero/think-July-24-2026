import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { KiloProvider } from './context/KiloContext.tsx';
import { WorkspaceRecoveryBoundary } from './components/WorkspaceRecoveryBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkspaceRecoveryBoundary>
      <KiloProvider>
        <App />
      </KiloProvider>
    </WorkspaceRecoveryBoundary>
  </StrictMode>,
);
