import type { WorkoutPlan } from '@gym/core';
import { createId } from '@gym/core';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { workoutRepository } from '../../../storage';
import { Button, Card, EmptyState, TextField, Toggle } from '../../../ui/index.ts';
import { useSessionAccount } from '../../auth/use-session-account';
import { AssignStudentsSheet } from './AssignStudentsSheet';
import { ExerciseEditor } from './ExerciseEditor';

function blankPlan(gymId: string, createdBy: string): WorkoutPlan {
  const now = new Date().toISOString();
  return {
    id: createId(),
    gymId,
    letter: '',
    name: '',
    focus: '',
    weekday: '',
    duration: '',
    exercises: [],
    published: false,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
}

export function PlanEditorScreen() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { gym, user, loading: loadingAccount } = useSessionAccount();
  const isNew = planId === 'novo';

  const [draft, setDraft] = useState<WorkoutPlan | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedCount, setAssignedCount] = useState<number | null>(null);
  const [assignedReload, setAssignedReload] = useState(0);

  const key = gym && planId ? `${gym.id}:${planId}` : null;

  if (gym && user && planId && isNew && key !== loadedKey) {
    setDraft(blankPlan(gym.id, user.id));
    setLoadedKey(key);
    setNotFound(false);
  }

  useEffect(() => {
    if (!gym || !planId || isNew) return;
    if (key === loadedKey) return;
    let cancelled = false;
    workoutRepository.findPlanById(gym.id, planId).then((plan) => {
      if (cancelled) return;
      if (plan) {
        setDraft(plan);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setLoadedKey(key);
    });
    return () => {
      cancelled = true;
    };
  }, [gym, planId, key, loadedKey, isNew]);

  useEffect(() => {
    if (!gym || !planId || isNew) return;
    let cancelled = false;
    workoutRepository.listAssignmentsForPlan(gym.id, planId).then((assignments) => {
      if (!cancelled) setAssignedCount(assignments.filter((assignment) => assignment.active).length);
    });
    return () => {
      cancelled = true;
    };
  }, [gym, planId, isNew, assignedReload]);

  if (!planId) return <Navigate to="/gym/treinos" replace />;
  if (loadingAccount || !gym || !user) return null;

  if (notFound) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-10">
        <EmptyState
          title="Plano não encontrado"
          description="Ele pode ter sido removido."
          action={
            <Button size="sm" onClick={() => navigate('/gym/treinos')}>
              Voltar para treinos
            </Button>
          }
        />
      </div>
    );
  }

  if (!draft) return null;

  const persist = async (plan: WorkoutPlan) => {
    await workoutRepository.savePlan(plan);
    setDraft(plan);
    return plan;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.letter.trim() || !draft.name.trim()) {
      setFormError('Informe letra e nome do plano.');
      return;
    }
    setFormError(undefined);
    setSaving(true);
    try {
      const saved = await persist({ ...draft, updatedAt: new Date().toISOString() });
      if (isNew) navigate(`/gym/treinos/${saved.id}`, { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = (next: boolean) => {
    if (next) {
      setConfirmingPublish(true);
      return;
    }
    void persistPublished(false);
  };

  const persistPublished = async (published: boolean) => {
    setPublishing(true);
    try {
      await persist({ ...draft, published, updatedAt: new Date().toISOString() });
      setConfirmingPublish(false);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-10">
      <header>
        <button
          type="button"
          onClick={() => navigate('/gym/treinos')}
          className="text-subtle text-sm font-semibold"
        >
          ← Voltar
        </button>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-wide uppercase">
          {isNew ? 'Criar plano' : `${draft.letter} · ${draft.name || 'Plano'}`}
        </h1>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-3">
          <TextField
            label="Letra"
            value={draft.letter}
            onChange={(event) => setDraft({ ...draft, letter: event.target.value })}
          />
          <div className="col-span-2">
            <TextField
              label="Nome"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </div>
        </div>

        <TextField
          label="Foco"
          placeholder="Empurrar, Inferiores…"
          value={draft.focus}
          onChange={(event) => setDraft({ ...draft, focus: event.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Dia"
            placeholder="Segunda"
            value={draft.weekday}
            onChange={(event) => setDraft({ ...draft, weekday: event.target.value })}
          />
          <TextField
            label="Duração"
            placeholder="55 min"
            value={draft.duration}
            onChange={(event) => setDraft({ ...draft, duration: event.target.value })}
          />
        </div>

        {formError ? (
          <p role="alert" className="text-protein text-sm font-semibold">
            {formError}
          </p>
        ) : null}

        <ExerciseEditor
          exercises={draft.exercises}
          onChange={(exercises) => setDraft({ ...draft, exercises })}
        />

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Salvando…' : isNew ? 'Criar plano' : 'Salvar alterações'}
        </Button>
      </form>

      {isNew ? (
        <p className="text-subtle text-sm">
          Atribuição de alunos e publicação ficam disponíveis depois de criar o plano.
        </p>
      ) : (
        <>
          <Card elevated className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-bold uppercase">Publicação</p>
              <p className="text-subtle mt-1 text-sm">
                {draft.published
                  ? 'Visível para os alunos atribuídos.'
                  : 'Rascunho — só você vê este plano.'}
              </p>
            </div>
            <Toggle
              checked={draft.published}
              onChange={handleTogglePublish}
              disabled={publishing}
              label="Publicar treino"
            />
          </Card>

          {confirmingPublish ? (
            <Card className="border-brand/25 flex flex-col gap-3">
              <p className="text-sm">
                Publicar agora deixa o treino visível para os alunos atribuídos na hora. Confirmar?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setConfirmingPublish(false)}
                  disabled={publishing}
                >
                  Cancelar
                </Button>
                <Button fullWidth disabled={publishing} onClick={() => void persistPublished(true)}>
                  {publishing ? 'Publicando…' : 'Confirmar publicação'}
                </Button>
              </div>
            </Card>
          ) : null}

          <Card elevated className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-bold uppercase">Alunos</p>
              <p className="text-subtle mt-1 text-sm">
                {assignedCount === null
                  ? 'Carregando…'
                  : `${assignedCount} aluno${assignedCount === 1 ? '' : 's'} atribuído${assignedCount === 1 ? '' : 's'}.`}
              </p>
            </div>
            <Button size="sm" onClick={() => setAssignOpen(true)}>
              Atribuir
            </Button>
          </Card>

          <AssignStudentsSheet
            open={assignOpen}
            gymId={gym.id}
            planId={draft.id}
            assignedBy={user.id}
            onClose={() => setAssignOpen(false)}
            onSaved={() => setAssignedReload((token) => token + 1)}
          />
        </>
      )}
    </div>
  );
}
