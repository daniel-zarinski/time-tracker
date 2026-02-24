import './styles.css';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, Toaster, TooltipProvider } from '@time-tracker/ui';

import App from './app/app';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ThemeProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
);
