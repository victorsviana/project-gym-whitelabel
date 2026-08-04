import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { dismissInstallPrompt, isInstallPromptDismissed } from './install-dismissed';
import type { BeforeInstallPromptEvent } from './platform';
import { isIosSafari, isRunningStandalone } from './platform';

type PromptKind = 'android' | 'ios' | null;

/**
 * Convite de instalação (F1-E16, item 3): Android/desktop escuta `beforeinstallprompt` e aciona o
 * prompt nativo; iOS não dispara esse evento, então mostra instrução manual (Compartilhar → Adicionar
 * à Tela de Início). Não aparece se o app já roda em modo standalone (já instalado) ou se foi dispensado.
 */
export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(isInstallPromptDismissed);
  const [kind, setKind] = useState<PromptKind>(() => (!isRunningStandalone() && isIosSafari() ? 'ios' : null));

  useEffect(() => {
    if (isRunningStandalone()) return;

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
      setKind('android');
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  if (dismissed || !kind) return null;

  function handleDismiss() {
    dismissInstallPrompt();
    setDismissed(true);
  }

  async function handleInstall() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const choice = await deferredEvent.userChoice;
    setDeferredEvent(null);
    if (choice.outcome === 'accepted') handleDismiss();
  }

  return (
    <Card
      elevated
      role="complementary"
      aria-label="Instalar o app"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 shadow-lg sm:inset-x-auto sm:right-4 sm:left-auto"
    >
      <div className="flex-1">
        <p className="font-display text-sm font-bold tracking-wide uppercase">Instalar o app</p>
        <p className="text-subtle text-sm">
          {kind === 'ios'
            ? 'Toque em Compartilhar e depois em "Adicionar à Tela de Início".'
            : 'Acesso direto pela tela inicial, sem precisar abrir o navegador.'}
        </p>
      </div>
      {kind === 'android' ? (
        <Button size="sm" onClick={handleInstall}>
          Instalar
        </Button>
      ) : null}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dispensar"
        className="text-subtle shrink-0 cursor-pointer p-1 text-xl leading-none"
      >
        ×
      </button>
    </Card>
  );
}
