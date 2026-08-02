import type { ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DietIcon, HomeIcon, ProfileIcon, WorkoutIcon } from './nav-icons';

interface NavTab {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

const TABS: NavTab[] = [
  { label: 'Início', to: '/aluno', icon: HomeIcon },
  { label: 'Treino', to: '/aluno/treino', icon: WorkoutIcon },
  { label: 'Dieta', to: '/aluno/dieta', icon: DietIcon },
  { label: 'Perfil', to: '/aluno/perfil', icon: ProfileIcon },
];

/** Barra inferior fixa das quatro abas do app do aluno (UI-SPEC.md#navegação). */
export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Navegação principal"
      className="bg-sheet border-border fixed inset-x-0 bottom-0 z-40 border-t"
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active = location.pathname === tab.to;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              className={[
                'focus-visible:ring-brand/50 flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold uppercase focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none',
                active ? 'text-brand' : 'text-subtle',
              ].join(' ')}
            >
              <Icon />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
