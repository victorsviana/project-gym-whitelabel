import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.tsx';

describe('App', () => {
  it('renderiza a página de showcase do design system', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Componentes base', level: 1 })).toBeInTheDocument();
  });
});
