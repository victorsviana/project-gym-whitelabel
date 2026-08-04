const STORAGE_KEY = 'gymapp:pwa-install-dismissed';

/**
 * Preferência de dispositivo, não dado de negócio — chave própria fora do envelope `gymapp:v1`
 * (mesmo raciocínio de `session-store.ts`: coisas com ciclo de vida diferente ficam em chaves separadas).
 */
export function isInstallPromptDismissed(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function dismissInstallPrompt(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}
