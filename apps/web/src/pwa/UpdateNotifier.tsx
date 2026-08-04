import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';

/**
 * Registra o Service Worker (deixa pronto pro F1-E17 reaproveitar, ARCHITECTURE.md#pwa) e avisa quando
 * o app shell terminou de cachear (offline pronto) ou quando há uma versão nova esperando pra assumir.
 */
export function UpdateNotifier() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (needRefresh) {
    return (
      <div
        role="status"
        className="rounded-field bg-sheet border-border fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border px-5 py-3 text-sm font-semibold shadow-lg"
      >
        <span>Nova versão disponível.</span>
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          Atualizar
        </Button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dispensar"
          className="text-subtle cursor-pointer text-lg leading-none"
        >
          ×
        </button>
      </div>
    );
  }

  if (offlineReady) {
    return <Toast message="Pronto para uso offline." variant="success" onDismiss={() => setOfflineReady(false)} />;
  }

  return null;
}
