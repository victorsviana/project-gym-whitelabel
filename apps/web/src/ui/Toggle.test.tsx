import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle.tsx';

describe('Toggle', () => {
  it('reporta o estado invertido ao ser clicado e expõe aria-checked', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Notificações" />);

    const toggle = screen.getByRole('switch', { name: 'Notificações' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('não chama onChange quando desabilitado', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled label="Notificações" />);

    fireEvent.click(screen.getByRole('switch', { name: 'Notificações' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
