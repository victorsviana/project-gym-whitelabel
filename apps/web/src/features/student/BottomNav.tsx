import { Link, useLocation } from 'react-router-dom';

interface NavTab {
  label: string;
  to: string;
  disabledReason?: string;
}

const TABS: NavTab[] = [
  { label: 'Início', to: '/aluno' },
  { label: 'Treino', to: '/aluno/treino' },
  { label: 'Dieta', to: '/aluno/dieta' },
  { label: 'Perfil', to: '/aluno', disabledReason: 'Perfil chega no F1-E12' },
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
          const active = !tab.disabledReason && location.pathname === tab.to;
          if (tab.disabledReason) {
            return (
              <span
                key={tab.label}
                aria-disabled="true"
                title={tab.disabledReason}
                className="text-faint flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-semibold uppercase opacity-50"
              >
                {tab.label}
              </span>
            );
          }
          return (
            <Link
              key={tab.label}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              className={[
                'focus-visible:ring-brand/50 flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-semibold uppercase focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none',
                active ? 'text-brand' : 'text-subtle',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
