import type { StudentStatus } from '@gym/core';
import { useEffect, useState } from 'react';
import { Button, Card, Sheet } from '../../../ui/index.ts';
import { AssessmentForm } from './AssessmentForm';
import { formatShortDate } from './format-date';
import {
  BODY_REGION_LABELS,
  GOAL_LABELS,
  LEVEL_LABELS,
  RESTRICTION_LABELS,
  STUDENT_STATUS_LABELS,
} from './labels';
import { loadLastActivityDate } from './load-last-activity';
import type { StudentRow } from './load-students';
import type { AssessmentInput } from './save-assessment';
import { saveStudentAssessment } from './save-assessment';

const STATUS_CLASSES: Record<StudentStatus, string> = {
  active: 'border-success/30 bg-success/10 text-success',
  no_plan: 'border-border bg-surface-2 text-subtle',
  needs_review: 'border-carbs/30 bg-carbs/10 text-carbs',
};

interface StudentDetailSheetProps {
  open: boolean;
  student: StudentRow | null;
  gymId: string;
  onClose: () => void;
  onAssessmentSaved: () => void;
}

export function StudentDetailSheet({
  open,
  student,
  gymId,
  onClose,
  onAssessmentSaved,
}: StudentDetailSheetProps) {
  const [viewedId, setViewedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [submitting, setSubmitting] = useState(false);
  const [lastActivity, setLastActivity] = useState<string | null>(null);

  const studentId = student?.user.id ?? null;
  if (studentId && studentId !== viewedId) {
    setViewedId(studentId);
    setMode('view');
    setLastActivity(null);
  }

  useEffect(() => {
    if (!open || !studentId) return;
    let cancelled = false;
    loadLastActivityDate(gymId, studentId).then((date) => {
      if (!cancelled) setLastActivity(date);
    });
    return () => {
      cancelled = true;
    };
  }, [open, studentId, gymId]);

  if (!open || !student) return null;

  const { user, profile, status, planNames } = student;

  const handleAssessmentSubmit = async (input: AssessmentInput) => {
    setSubmitting(true);
    try {
      await saveStudentAssessment(gymId, user.id, input);
      setMode('view');
      onAssessmentSaved();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={mode === 'edit' ? 'Editar avaliação' : user.name}>
      {mode === 'edit' ? (
        <AssessmentForm
          profile={profile}
          submitting={submitting}
          onCancel={() => setMode('view')}
          onSubmit={handleAssessmentSubmit}
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-subtle text-sm">{user.email}</p>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
            >
              {STUDENT_STATUS_LABELS[status]}
            </span>
          </div>

          {profile ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="text-subtle">Sexo:</span>{' '}
                  {profile.sex === 'male' ? 'Masculino' : 'Feminino'}
                </p>
                <p>
                  <span className="text-subtle">Idade:</span> {profile.age} anos
                </p>
                <p>
                  <span className="text-subtle">Peso:</span> {profile.weight} kg
                </p>
                <p>
                  <span className="text-subtle">Altura:</span> {profile.height} cm
                </p>
                <p>
                  <span className="text-subtle">Objetivo:</span> {GOAL_LABELS[profile.goal]}
                </p>
                <p>
                  <span className="text-subtle">Nível:</span> {LEVEL_LABELS[profile.level]}
                </p>
                <p className="col-span-2">
                  <span className="text-subtle">Frequência:</span> {profile.daysPerWeek}x por semana
                </p>
              </div>

              {profile.injuries.length > 0 ? (
                <Card className="border-carbs/30 bg-carbs/10">
                  <p className="text-carbs text-xs font-semibold tracking-widest uppercase">
                    Alerta de lesão
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.injuries.map((region) => (
                      <span
                        key={region}
                        className="border-carbs/40 bg-carbs/16 text-carbs rounded-full border px-3 py-1 text-sm font-semibold"
                      >
                        {BODY_REGION_LABELS[region]}
                      </span>
                    ))}
                  </div>
                </Card>
              ) : null}

              {profile.restrictions.length > 0 ? (
                <div>
                  <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
                    Restrições alimentares
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.restrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="border-border bg-surface-2 text-fg rounded-full border px-3 py-1 text-sm font-semibold"
                      >
                        {RESTRICTION_LABELS[restriction]}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button variant="secondary" onClick={() => setMode('edit')}>
                Editar avaliação
              </Button>
            </>
          ) : (
            <Card className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="font-display text-lg font-bold uppercase">Avaliação pendente</p>
              <p className="text-subtle text-sm">
                Preencha sexo, peso, objetivo e frequência para calcular as metas do aluno.
              </p>
              <Button onClick={() => setMode('edit')}>Preencher avaliação</Button>
            </Card>
          )}

          <div>
            <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
              Planos atribuídos
            </p>
            {planNames.length > 0 ? (
              <ul className="flex flex-col gap-1 text-sm">
                {planNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-subtle text-sm">
                Nenhum plano atribuído ainda — a atribuição de treino chega no F1-E14.
              </p>
            )}
          </div>

          <div>
            <p className="text-subtle mb-2 text-xs font-semibold tracking-widest uppercase">
              Última atividade
            </p>
            <p className="text-sm">
              {lastActivity ? formatShortDate(lastActivity) : 'Nenhuma atividade registrada'}
            </p>
          </div>
        </div>
      )}
    </Sheet>
  );
}
