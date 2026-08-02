import type { User } from '@gym/core';
import { useEffect, useState } from 'react';
import { userRepository, workoutRepository } from '../../../storage';
import { Button, Sheet, Toggle } from '../../../ui/index.ts';
import { syncPlanAssignments } from './save-assignment';

interface AssignStudentsSheetProps {
  open: boolean;
  gymId: string;
  planId: string;
  assignedBy: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AssignStudentsSheet({
  open,
  gymId,
  planId,
  assignedBy,
  onClose,
  onSaved,
}: AssignStudentsSheetProps) {
  const [students, setStudents] = useState<User[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all([
      userRepository.listByGym(gymId, 'student'),
      workoutRepository.listAssignmentsForPlan(gymId, planId),
    ]).then(([users, assignments]) => {
      if (cancelled) return;
      setStudents(users);
      setSelected(new Set(assignments.filter((assignment) => assignment.active).map((a) => a.studentId)));
    });
    return () => {
      cancelled = true;
    };
  }, [open, gymId, planId]);

  const toggleStudent = (studentId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await syncPlanAssignments(gymId, planId, Array.from(selected), assignedBy);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Atribuir alunos">
      {students === null ? (
        <p className="text-subtle text-sm">Carregando…</p>
      ) : students.length === 0 ? (
        <p className="text-subtle text-sm">Nenhum aluno cadastrado nesta academia ainda.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto">
            {students.map((student) => (
              <li key={student.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-semibold">{student.name}</span>
                <Toggle
                  checked={selected.has(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  label={`Atribuir a ${student.name}`}
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
