import type { Gym } from '@gym/core';
import { createId } from '@gym/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '../auth/use-session';
import { gymRepository, userRepository } from '../../storage';
import { BrandScreen } from './BrandScreen';

beforeEach(() => {
  localStorage.clear();
  useSessionStore.setState({ session: null });
});

function buildGym(overrides: Partial<Gym> = {}): Gym {
  return {
    id: createId(),
    name: 'Academia Teste',
    slug: 'academia-teste',
    initials: 'AT',
    logo: null,
    theme: { brand: '#E4022E', brandFg: '#FFFFFF', mode: 'dark' },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

async function renderAsTrainerOf(gym: Gym) {
  const user = {
    id: createId(),
    gymId: gym.id,
    role: 'trainer' as const,
    name: 'Professor',
    email: 'prof@x.com',
    password: 'demo1234',
    active: true,
    createdAt: new Date().toISOString(),
  };
  await userRepository.save(user);
  useSessionStore.setState({
    session: { userId: user.id, gymId: gym.id, role: 'trainer', startedAt: new Date().toISOString() },
  });

  render(
    <MemoryRouter initialEntries={['/gym/marca']}>
      <Routes>
        <Route path="/gym/marca" element={<BrandScreen />} />
        <Route path="/gym" element={<p>Home da academia</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BrandScreen', () => {
  it('carrega o nome e a cor atuais da academia', async () => {
    const gym = buildGym({ name: 'Gaviões Fitness' });
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);

    expect(await screen.findByLabelText('Nome da academia')).toHaveValue('Gaviões Fitness');
    expect(document.documentElement.style.getPropertyValue('--brand')).toBe('#E4022E');
  });

  it('escolher um preset repinta o app com a cor e o contraste do preset', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);
    await screen.findByLabelText('Nome da academia');

    fireEvent.click(screen.getByRole('button', { name: 'Azul' }));

    expect(document.documentElement.style.getPropertyValue('--brand')).toBe('#2E7BFF');
    expect(document.documentElement.style.getPropertyValue('--brand-fg')).toBe('#FFFFFF');
  });

  it('avisa quando o par de cores escolhido fica abaixo do contraste mínimo, sem bloquear', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);
    await screen.findByLabelText('Nome da academia');

    // Azul da Bluefit com branco é o caso documentado de contraste ruim (3,89:1 < 4,5:1).
    fireEvent.click(screen.getByRole('button', { name: 'Azul' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Branco' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('abaixo do mínimo recomendado');
  });

  it('salvar persiste nome e tema, e volta para o painel', async () => {
    const gym = buildGym();
    await gymRepository.save(gym);

    await renderAsTrainerOf(gym);
    const nameField = await screen.findByLabelText('Nome da academia');

    fireEvent.change(nameField, { target: { value: 'Nova Academia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verde' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar identidade visual' }));

    expect(await screen.findByText('Home da academia')).toBeInTheDocument();
    const saved = await gymRepository.findById(gym.id);
    expect(saved?.name).toBe('Nova Academia');
    expect(saved?.theme.brand).toBe('#1E9E5A');
  });
});
