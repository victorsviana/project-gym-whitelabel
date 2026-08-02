import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Stepper } from './Stepper.tsx';

describe('Stepper', () => {
  it('chama onChange com o valor incrementado e decrementado pelo passo', () => {
    const onChange = vi.fn();
    render(<Stepper value={70} step={2.5} onChange={onChange} unit="kg" />);

    fireEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(72.5);

    fireEvent.click(screen.getByLabelText('Diminuir'));
    expect(onChange).toHaveBeenCalledWith(67.5);
  });

  it('não ultrapassa os limites mínimo e máximo', () => {
    const onChange = vi.fn();
    render(<Stepper value={0} step={1} min={0} max={1} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Diminuir'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Diminuir')).toBeDisabled();
  });
});
