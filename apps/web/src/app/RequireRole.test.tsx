import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '../features/auth/use-session';
import { RequireRole } from './RequireRole';

beforeEach(() => {
  localStorage.clear();
  useSessionStore.setState({ session: null });
});

function renderGuarded(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<p>Seletor de perfil</p>} />
        <Route path="/aluno" element={<p>Home do aluno</p>} />
        <Route path="/gym" element={<p>Home da academia</p>} />
        <Route
          path="/protegido-aluno"
          element={
            <RequireRole role="student">
              <p>Conteúdo do aluno</p>
            </RequireRole>
          }
        />
        <Route
          path="/protegido-professor"
          element={
            <RequireRole role="trainer">
              <p>Conteúdo do professor</p>
            </RequireRole>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  it('sem sessão, redireciona ao seletor de perfil', () => {
    renderGuarded('/protegido-aluno');

    expect(screen.getByText('Seletor de perfil')).toBeInTheDocument();
  });

  it('aluno tentando abrir rota do painel é redirecionado para a home do aluno', () => {
    useSessionStore.setState({
      session: { userId: 'u1', gymId: 'g1', role: 'student', startedAt: new Date().toISOString() },
    });

    renderGuarded('/protegido-professor');

    expect(screen.getByText('Home do aluno')).toBeInTheDocument();
  });

  it('professor tentando abrir tela de aluno é redirecionado para o painel', () => {
    useSessionStore.setState({
      session: { userId: 'u2', gymId: 'g1', role: 'trainer', startedAt: new Date().toISOString() },
    });

    renderGuarded('/protegido-aluno');

    expect(screen.getByText('Home da academia')).toBeInTheDocument();
  });

  it('com o papel certo, renderiza o conteúdo protegido', () => {
    useSessionStore.setState({
      session: { userId: 'u3', gymId: 'g1', role: 'trainer', startedAt: new Date().toISOString() },
    });

    renderGuarded('/protegido-professor');

    expect(screen.getByText('Conteúdo do professor')).toBeInTheDocument();
  });
});
