import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.tsx';

describe('App', () => {
  it('renderiza o título da aplicação', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Academia Whitelabel' })).toBeInTheDocument();
  });
});
