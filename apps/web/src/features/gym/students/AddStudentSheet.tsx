import type { User } from '@gym/core';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { userRepository } from '../../../storage';
import { Button, Sheet, TextField } from '../../../ui/index.ts';
import { registerStudent } from '../../auth/actions';
import { isValidEmail, isValidPassword } from '../../auth/validators';

interface AddStudentSheetProps {
  open: boolean;
  gymId: string;
  onClose: () => void;
  onCreated: (user: User) => void;
}

export function AddStudentSheet({ open, gymId, onClose, onCreated }: AddStudentSheetProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Informe o nome do aluno.';
    if (!isValidEmail(email)) nextErrors.email = 'E-mail inválido.';
    if (!isValidPassword(password)) nextErrors.password = 'A senha precisa de ao menos 8 caracteres.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await registerStudent({ name, email, password, gymId });
      if (result.status === 'email_taken') {
        setErrors({ email: 'Esse e-mail já está cadastrado nessa academia.' });
        return;
      }
      const user = await userRepository.findById(gymId, result.session.userId);
      if (user) onCreated(user);
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={handleClose} title="Cadastrar aluno">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Nome"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Senha inicial"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <p className="text-subtle text-sm">
          A avaliação (peso, objetivo, lesões…) e as metas ficam pendentes até você preenchê-las na
          ficha do aluno.
        </p>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Cadastrando…' : 'Cadastrar aluno'}
        </Button>
      </form>
    </Sheet>
  );
}
