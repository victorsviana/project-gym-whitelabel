import { todayIsoDate } from '@gym/core';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { formatElapsed } from './format-elapsed';
import { NOTICE_KIND_LABELS, NOTICE_SHORTCUT_LABELS } from './labels';
import { loadOpenNotices, resolvePlanChangeRequest } from './load-notices';
import type { NoticeRow } from './load-notices';

export function NoticesScreen() {
  const { gym, loading: loadingAccount } = useSessionAccount();
  const navigate = useNavigate();

  const [rows, setRows] = useState<NoticeRow[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    if (!gym) return;
    let cancelled = false;
    loadOpenNotices(gym.id)
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

  const handleResolve = async (row: NoticeRow) => {
    setResolvingId(row.id);
    try {
      await resolvePlanChangeRequest(gym.id, row.id);
      reload();
    } finally {
      setResolvingId(null);
    }
  };

  const today = todayIsoDate();

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-10">
      <header>
        <Link to="/gym" className="text-subtle text-sm font-semibold">
          ← Voltar
        </Link>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
          Avisos
        </h1>
      </header>

      {error ? (
        <EmptyState
          title="Não deu para carregar os avisos"
          description="Tente novamente em alguns instantes."
          action={
            <Button size="sm" onClick={reload}>
              Tentar de novo
            </Button>
          }
        />
      ) : rows === null ? (
        <div className="flex flex-col gap-3" aria-label="Carregando avisos">
          {[0, 1, 2].map((key) => (
            <div key={key} className="bg-surface-2 h-24 animate-pulse rounded-card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhuma pendência aberta"
          description="Quando um aluno precisar de atenção — sem treino, avaliação vencida ou pedido de troca — aparece aqui."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.id}>
              <Card elevated className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="bg-surface-2 text-subtle rounded-full px-3 py-1 text-xs font-semibold">
                      {NOTICE_KIND_LABELS[row.kind]}
                    </span>
                    <p className="mt-2 font-semibold">{row.studentName}</p>
                    <p className="text-subtle text-sm">{row.text}</p>
                  </div>
                  <span className="text-subtle shrink-0 text-xs">{formatElapsed(row.since, today)}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {row.auto ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={resolvingId === row.id}
                      onClick={() => handleResolve(row)}
                    >
                      {resolvingId === row.id ? 'Resolvendo…' : 'Resolver'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => navigate(`/gym/alunos?student=${row.studentId}`)}
                  >
                    {NOTICE_SHORTCUT_LABELS[row.kind]}
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
