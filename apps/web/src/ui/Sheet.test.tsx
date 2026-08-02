import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sheet } from './Sheet.tsx';

describe('Sheet', () => {
  it('não renderiza quando fechado', () => {
    render(
      <Sheet open={false} onClose={vi.fn()} title="Registrar carga">
        conteúdo
      </Sheet>,
    );
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument();
  });

  it('fecha ao clicar no scrim, no botão de fechar e ao pressionar Escape', () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="Registrar carga">
        conteúdo
      </Sheet>,
    );

    expect(screen.getByText('conteúdo')).toBeInTheDocument();

    const [scrim] = screen.getAllByRole('button', { name: 'Fechar' });
    fireEvent.click(scrim);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
