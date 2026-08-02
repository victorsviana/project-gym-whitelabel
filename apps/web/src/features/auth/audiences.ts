import type { Role } from '@gym/core';

interface AudienceConfig {
  role: Role;
  label: string;
  homePath: string;
  loginPath: string;
  signupPath: string;
}

export const AUDIENCES = {
  aluno: {
    role: 'student',
    label: 'aluno',
    homePath: '/aluno',
    loginPath: '/entrar/aluno',
    signupPath: '/cadastro/aluno',
  },
  professor: {
    role: 'trainer',
    label: 'academia/professor',
    homePath: '/gym',
    loginPath: '/entrar/professor',
    signupPath: '/cadastro/professor',
  },
} as const satisfies Record<string, AudienceConfig>;

export type Audience = keyof typeof AUDIENCES;

export function homePathForRole(role: Role): string {
  return role === 'student' ? AUDIENCES.aluno.homePath : AUDIENCES.professor.homePath;
}
