import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './app';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should display the app tabs', () => {
    const { getByText } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    expect(getByText('Tasks')).toBeTruthy();
  });
});
