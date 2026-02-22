import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should display the app tabs', () => {
    const { getByText } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(getByText('Home')).toBeTruthy();
  });
});
