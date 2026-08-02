import type { WorkoutPlan } from '@gym/core';
import { useEffect, useState } from 'react';
import { workoutRepository } from '../../../storage';
import { Button, LetterBadge, Sheet, Toggle } from '../../../ui/index.ts';
import { syncStudentAssignments } from './save-assignment';

interface AssignPlansSheetProps {
  open: boolean;
  gymId: string;
  studentId: string;
  assignedBy: string;
  onClose: () => void;
  onSaved: () => void;
}

/** Mesmo fluxo de AssignStudentsSheet, mas partindo da ficha do aluno em vez do editor do plano. */
export function AssignPlansSheet({
  open,
  gymId,
  studentId,
  assignedBy,
  onClose,
  onSaved,
}: AssignPlansSheetProps) {
  const [plans, setPlans] = useState<WorkoutPlan[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all([
      workoutRepository.listPlans(gymId),
      workoutRepository.listAssignmentsForStudent(gymId, studentId),
    ]).then(([allPlans, assignments]) => {
      if (cancelled) return;
      setPlans(allPlans);
      setSelected(new Set(assignments.filter((assignment) => assignment.active).map((a) => a.planId)));
    });
    return () => {
      cancelled = true;
    };
  }, [open, gymId, studentId]);

  const togglePlan = (planId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(planId)) next.delete(planId);
      else next.add(planId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await syncStudentAssignments(gymId, studentId, Array.from(selected), assignedBy);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Atribuir treino">
      {plans === null ? (
        <p className="text-subtle text-sm">Carregando…</p>
      ) : plans.length === 0 ? (
        <p className="text-subtle text-sm">Nenhum treino criado nesta academia ainda.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto">
            {plans.map((plan) => (
              <li key={plan.id} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <LetterBadge letter={plan.letter} size="sm" />
                  <span className="truncate text-sm font-semibold">
                    {plan.name}
                    {!plan.published ? <span className="text-subtle"> (rascunho)</span> : null}
                  </span>
                </span>
                <Toggle
                  checked={selected.has(plan.id)}
                  onChange={() => togglePlan(plan.id)}
                  label={`Atribuir ${plan.name}`}
                />
              </li>
            ))}
          </ul>
          <Button fullWidth disabled={saving} onClick={handleSave}>
            {saving ? 'Salvando…' : 'Salvar atribuição'}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
