import type { Role } from '@gym/core';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { homePathForRole } from '../features/auth/audiences';
import { useSessionStore } from '../features/auth/use-session';

interface RequireRoleProps {
  role: Role;
  children: ReactNode;
}

/**
 * Guard de rota por papel (MULTI-TENANCY.md): sem sessão volta ao seletor de perfil; sessão com o
 * papel errado (aluno em `/gym`, professor em `/aluno`) é redirecionada para a própria home, nunca
 * vê uma tela vazia.
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const session = useSessionStore((state) => state.session);

  if (!session) return <Navigate to="/" replace />;
  if (session.role !== role) return <Navigate to={homePathForRole(session.role)} replace />;

  return <>{children}</>;
}
