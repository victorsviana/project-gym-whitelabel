import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App.tsx';

beforeEach(() => {
  localStorage.clear();
});

describe('App', () => {
  it('semeia os dados de demonstração e abre no seletor de perfil', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Quem é você?', level: 1 }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('gymapp:v1')).not.toBeNull();
  });
});
