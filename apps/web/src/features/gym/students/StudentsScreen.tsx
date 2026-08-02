import type { StudentStatus } from '@gym/core';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, EmptyState, SegmentedControl, TextField } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { AddStudentSheet } from './AddStudentSheet';
import { GOAL_LABELS, STUDENT_STATUS_LABELS } from './labels';
import { loadStudentRows } from './load-students';
import type { StudentRow } from './load-students';
import { StudentDetailSheet } from './StudentDetailSheet';

type StatusFilter = 'all' | StudentStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: STUDENT_STATUS_LABELS.active },
  { value: 'no_plan', label: STUDENT_STATUS_LABELS.no_plan },
  { value: 'needs_review', label: STUDENT_STATUS_LABELS.needs_review },
];

const STATUS_DOT_CLASSES: Record<StudentStatus, string> = {
  active: 'bg-success',
  no_plan: 'bg-faint',
  needs_review: 'bg-carbs',
};

function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function StudentsScreen() {
  const { gym, user, loading: loadingAccount } = useSessionAccount();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [appliedStudentParam, setAppliedStudentParam] = useState<string | null>(null);

  useEffect(() => {
    if (!gym) return;
    let cancelled = false;
    loadStudentRows(gym.id)
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

  // Atalho de "Avisos" (F1-E15): /gym/alunos?student=<id> abre a ficha direto.
  const studentParam = searchParams.get('student');
  if (studentParam && studentParam !== appliedStudentParam) {
    setSelectedStudentId(studentParam);
    setAppliedStudentParam(studentParam);
  }

  const reload = () => setReloadToken((token) => token + 1);

  const closeDetail = () => {
    setSelectedStudentId(null);
    if (searchParams.has('student')) {
      searchParams.delete('student');
      setSearchParams(searchParams, { replace: true });
    }
  };

  if (loadingAccount || !gym || !user) return null;

  const filtered = (rows ?? []).filter((row) => {
    const matchesSearch = row.user.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedRow = rows?.find((row) => row.user.id === selectedStudentId) ?? null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-10">
      <header className="flex items-start justify-between">
        <div>
          <Link to="/gym" className="text-subtle text-sm font-semibold">
            ← Voltar
          </Link>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
            Alunos
          </h1>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          Cadastrar aluno
        </Button>
      </header>

      <TextField
        label="Buscar por nome"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Digite o nome do aluno"
      />

      <SegmentedControl
        aria-label="Filtrar por situação"
        options={STATUS_FILTER_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      {error ? (
        <EmptyState
          title="Não deu para carregar os alunos"
          description="Tente novamente em alguns instantes."
          action={
            <Button size="sm" onClick={reload}>
              Tentar de novo
            </Button>
          }
        />
      ) : rows === null ? (
        <div className="flex flex-col gap-3" aria-label="Carregando alunos">
          {[0, 1, 2].map((key) => (
            <div key={key} className="bg-surface-2 h-20 animate-pulse rounded-card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhum aluno cadastrado"
          description="Cadastre o primeiro aluno da academia para começar."
          action={<Button onClick={() => setAddOpen(true)}>Cadastrar aluno</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum aluno encontrado"
          description="Ajuste a busca ou o filtro de situação."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((row) => (
            <li key={row.user.id}>
              <button
                type="button"
                onClick={() => setSelectedStudentId(row.user.id)}
                className="w-full text-left"
              >
                <Card
                  elevated
                  className="focus-visible:ring-brand/50 flex cursor-pointer items-center gap-4 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div className="bg-brand text-brand-fg flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold">
                    {initialsFrom(row.user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{row.user.name}</p>
                    <p className="text-subtle truncate text-sm">
                      {row.profile
                        ? `${GOAL_LABELS[row.profile.goal]} · ${row.profile.daysPerWeek}x por semana`
                        : 'Avaliação pendente'}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                    <span className={`size-2 rounded-full ${STATUS_DOT_CLASSES[row.status]}`} />
                    {STUDENT_STATUS_LABELS[row.status]}
                  </span>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddStudentSheet
        open={addOpen}
        gymId={gym.id}
        onClose={() => setAddOpen(false)}
        onCreated={reload}
      />

      <StudentDetailSheet
        open={selectedStudentId !== null}
        student={selectedRow}
        gymId={gym.id}
        trainerId={user.id}
        onClose={closeDetail}
        onAssessmentSaved={reload}
        onAssignmentSaved={reload}
      />
    </div>
  );
}
