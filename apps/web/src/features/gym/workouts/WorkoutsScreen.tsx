import { createId } from '@gym/core';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workoutRepository } from '../../../storage';
import { Button, Card, EmptyState, LetterBadge } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { buildDuplicatePlan } from './exercise-utils';
import { loadPlanRows } from './load-workouts';
import type { PlanRow } from './load-workouts';

export function WorkoutsScreen() {
  const { gym, loading: loadingAccount } = useSessionAccount();
  const navigate = useNavigate();

  const [rows, setRows] = useState<PlanRow[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!gym) return;
    let cancelled = false;
    loadPlanRows(gym.id)
      .then((data) => {
        if (cancelled) return;
        setError(false);
        setRows(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [gym, reloadToken]);

  const reload = () => setReloadToken((token) => token + 1);

  if (loadingAccount || !gym) return null;

  const handleDuplicate = async (row: PlanRow) => {
    setDuplicatingId(row.plan.id);
    try {
      await workoutRepository.savePlan(buildDuplicatePlan(row.plan, createId));
      reload();
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <Link to="/gym" className="text-subtle text-sm font-semibold">
            ← Voltar
          </Link>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
            Treinos
          </h1>
        </div>
        <Button size="sm" onClick={() => navigate('/gym/treinos/novo')}>
          Criar plano
        </Button>
      </header>

      {error ? (
        <EmptyState
          title="Não deu para carregar os treinos"
          description="Tente novamente em alguns instantes."
          action={
            <Button size="sm" onClick={reload}>
              Tentar de novo
            </Button>
          }
        />
      ) : rows === null ? (
        <div className="flex flex-col gap-3" aria-label="Carregando treinos">
          {[0, 1, 2].map((key) => (
            <div key={key} className="bg-surface-2 h-24 animate-pulse rounded-card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhum treino criado"
          description="Crie o primeiro plano da academia para começar."
          action={<Button onClick={() => navigate('/gym/treinos/novo')}>Criar plano</Button>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.plan.id}>
              <Card elevated className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/gym/treinos/${row.plan.id}`)}
                  className="focus-visible:ring-brand/50 text-left focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <LetterBadge letter={row.plan.letter} />
                    <div>
                      <p className="font-display text-lg font-bold uppercase">{row.plan.name}</p>
                      <p className="text-subtle text-sm">
                        {row.plan.focus} · {row.plan.weekday} · {row.plan.duration}
                      </p>
                      <p className="text-subtle mt-1 text-xs">
                        {row.plan.exercises.length} exercício{row.plan.exercises.length === 1 ? '' : 's'} ·{' '}
                        {row.assignedCount} aluno{row.assignedCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </button>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.plan.published ? 'bg-success/10 text-success' : 'bg-surface-2 text-subtle'
                    }`}
                  >
                    {row.plan.published ? 'Publicado' : 'Rascunho'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={duplicatingId === row.plan.id}
                    onClick={() => handleDuplicate(row)}
                  >
                    {duplicatingId === row.plan.id ? 'Duplicando…' : 'Duplicar'}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
