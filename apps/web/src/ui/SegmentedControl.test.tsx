import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl.tsx';

const OPTIONS = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
] as const;

describe('SegmentedControl', () => {
  it('marca a opção ativa e reporta a escolha ao clicar em outra', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl options={OPTIONS} value="week" onChange={onChange} aria-label="Período" />,
    );

    expect(screen.getByRole('radio', { name: 'Semana' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Mês' })).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(screen.getByRole('radio', { name: 'Mês' }));
    expect(onChange).toHaveBeenCalledWith('month');
  });
});
